import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import { SATELLITE_STYLE, PLANTA_STYLE, EXPLORATION_STYLE } from '@/lib/map-styles';
import { PARK_CONFIG } from '@/lib/park-config';
import { Tree, TreeCatalogItem } from '@/lib/tree-schema';
import {
  GisLayerMode,
  RasterOverlayConfig
} from './types';
import {
  catalogToGeoJSON,
  applyRasterOverlay,
  removeRasterOverlay
} from './layers';

export const TREE_GEOJSON_SOURCE_ID = 'trees-source';
export const INTERACTIVE_HITBOX_LAYER_ID = 'unclustered-point-hitbox';

export interface GisEngineOptions {
  container: HTMLElement | string;
  initialMode?: GisLayerMode;
  initialCenter?: [number, number];
  initialZoom?: number;
  rasterOverlay?: RasterOverlayConfig;
  onSelectTree?: (treeId: string) => void;
  onClearSelection?: () => void;
}

/**
 * Motor Cartográfico Modular GIS para o Parque Ecológico
 * Gerencia ciclo de vida do MapLibre GL, 3 provedores de camadas,
 * clustering acelerado por WebGL e sobreposições raster de drone.
 */
export class GisEngine {
  private map: MapLibreMap;
  private currentMode: GisLayerMode;
  private rasterConfig: RasterOverlayConfig | null = null;
  private treesGeoJson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: []
  };
  private isDestroyed = false;

  constructor(options: GisEngineOptions) {
    this.currentMode = options.initialMode ?? 'planta';
    this.rasterConfig = options.rasterOverlay ?? null;

    this.map = new maplibregl.Map({
      container: options.container,
      style: this.getStyleSpecification(this.currentMode),
      center: options.initialCenter ?? PARK_CONFIG.center,
      zoom: options.initialZoom ?? PARK_CONFIG.defaultZoom,
      minZoom: PARK_CONFIG.minZoom,
      maxZoom: PARK_CONFIG.maxZoom,
      maxBounds: PARK_CONFIG.maxBounds,
      attributionControl: { compact: true }
    });

    this.setupControls();
    this.setupEventListeners(options.onSelectTree, options.onClearSelection);
  }

  /**
   * Obtém a especificação de estilo base para o modo selecionado
   */
  public getStyleSpecification(mode: GisLayerMode): maplibregl.StyleSpecification {
    switch (mode) {
      case 'satellite':
        return SATELLITE_STYLE;
      case 'planta':
        return PLANTA_STYLE;
      case 'exploration':
        return EXPLORATION_STYLE;
      default:
        return PLANTA_STYLE;
    }
  }

  private setupControls(): void {
    // Zoom e Bússola
    this.map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      }),
      'bottom-right'
    );

    // GPS em tempo real do visitante no parque
    this.map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showAccuracyCircle: true
      }),
      'bottom-right'
    );

    // Escala métrica
    this.map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }),
      'bottom-left'
    );
  }

  private setupEventListeners(
    onSelectTree?: (treeId: string) => void,
    onClearSelection?: () => void
  ): void {
    this.map.on('load', () => {
      if (this.isDestroyed) return;
      this.syncTreeSourceAndLayers();

      // Aplica raster overlay se estiver no modo satélite
      if (this.currentMode === 'satellite' && this.rasterConfig?.enabled) {
        applyRasterOverlay(this.map, this.rasterConfig);
      }
    });

    // Clique em cluster: expansão suave de zoom (Supercluster)
    this.map.on('click', 'clusters', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0]?.properties?.cluster_id;
      if (clusterId !== undefined) {
        const source = this.map.getSource(TREE_GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const coordinates = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
          this.map.easeTo({
            center: coordinates,
            zoom: zoom + 0.5,
            duration: 500,
            easing: (t) => 1 - Math.pow(1 - t, 3)
          });
        });
      }
    });

    // Clique em árvore individual
    this.map.on('click', INTERACTIVE_HITBOX_LAYER_ID, (e) => {
      const feature = e.features?.[0];
      const treeId = feature?.properties?.id;
      if (treeId && onSelectTree) {
        onSelectTree(treeId);
        const coordinates = (feature?.geometry as GeoJSON.Point).coordinates as [number, number];
        this.centerOnCoordinates(coordinates);
      }
    });

    // Clique em área vazia limpa seleção
    this.map.on('click', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: ['clusters', INTERACTIVE_HITBOX_LAYER_ID]
      });
      if (features.length === 0 && onClearSelection) {
        onClearSelection();
      }
    });

    // Efeito cursor pointer
    this.map.on('mouseenter', 'clusters', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'clusters', () => {
      this.map.getCanvas().style.cursor = '';
    });
    this.map.on('mouseenter', INTERACTIVE_HITBOX_LAYER_ID, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', INTERACTIVE_HITBOX_LAYER_ID, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  /**
   * Alterna dinamicamente entre os 3 provedores cartográficos:
   * 1. Satélite (ArcGIS/Esri + Drone Raster Overlay)
   * 2. Planta Técnica (Lago, Pistas, Ponte, Trilhas, Playground)
   * 3. Exploração (Topografia, curvas de nível, expedição botânica)
   */
  public setLayerMode(mode: GisLayerMode): void {
    if (this.currentMode === mode || this.isDestroyed) return;
    this.currentMode = mode;

    this.map.setStyle(this.getStyleSpecification(mode));

    this.map.once('style.load', () => {
      if (this.isDestroyed) return;
      this.syncTreeSourceAndLayers();

      if (mode === 'satellite' && this.rasterConfig?.enabled) {
        applyRasterOverlay(this.map, this.rasterConfig);
      }
    });
  }

  /**
   * Configura ou atualiza a sobreposição raster local (ortomosaico georreferenciado)
   */
  public setRasterOverlay(config: RasterOverlayConfig): void {
    this.rasterConfig = config;
    if (this.currentMode === 'satellite' && this.map.isStyleLoaded()) {
      applyRasterOverlay(this.map, config);
    }
  }

  /**
   * Atualiza o dataset de árvores renderizado no mapa
   */
  public updateCatalog(items: (Tree | TreeCatalogItem)[]): void {
    this.treesGeoJson = catalogToGeoJSON(items);
    if (!this.map.isStyleLoaded()) return;

    const source = this.map.getSource(TREE_GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(this.treesGeoJson);
    } else {
      this.syncTreeSourceAndLayers();
    }
  }

  /**
   * Configura a fonte GeoJSON com Supercluster habilitado por GPU
   */
  private syncTreeSourceAndLayers(): void {
    if (this.map.getSource(TREE_GEOJSON_SOURCE_ID)) {
      const source = this.map.getSource(TREE_GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource;
      source.setData(this.treesGeoJson);
      return;
    }

    // Fonte GeoJSON com agrupamento de alto desempenho (Supercluster integrado)
    this.map.addSource(TREE_GEOJSON_SOURCE_ID, {
      type: 'geojson',
      data: this.treesGeoJson,
      cluster: true,
      clusterMaxZoom: 17,
      clusterRadius: 45,
      promoteId: 'id'
    });

    // Camada de círculos para Clusters
    this.map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: TREE_GEOJSON_SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#52775e',
          5,
          '#355d46',
          15,
          '#183d35'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          18,
          5,
          24,
          15,
          30
        ],
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#f8f6ef',
        'circle-opacity': 0.96
      }
    });

    // Rótulo numérico do cluster
    this.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: TREE_GEOJSON_SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#f8f6ef'
      }
    });

    // Marcador de espécime individual
    this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: TREE_GEOJSON_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#52775e',
        'circle-radius': 9,
        'circle-stroke-width': 2.2,
        'circle-stroke-color': '#f8f6ef'
      }
    });

    // Hitbox transparente para toques ágeis em mobile e desktop
    this.map.addLayer({
      id: INTERACTIVE_HITBOX_LAYER_ID,
      type: 'circle',
      source: TREE_GEOJSON_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 22,
        'circle-color': '#ffffff',
        'circle-opacity': 0.01
      }
    });
  }

  /**
   * Transiciona suavemente o centro da câmera para uma coordenada
   */
  public centerOnCoordinates(coordinates: [number, number], zoom = 17.5): void {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    this.map.easeTo({
      center: coordinates,
      zoom: Math.max(this.map.getZoom(), zoom),
      offset: isMobile ? [0, -120] : [-150, 0],
      duration: 600,
      easing: (t) => 1 - Math.pow(1 - t, 3)
    });
  }

  public getMapInstance(): MapLibreMap {
    return this.map;
  }

  public getCurrentMode(): GisLayerMode {
    return this.currentMode;
  }

  /**
   * Destrói a instância e libera os recursos do WebGL / GPU
   */
  public destroy(): void {
    this.isDestroyed = true;
    removeRasterOverlay(this.map);
    this.map.remove();
  }
}

/**
 * Cria e inicializa o motor cartográfico modular GIS
 */
export function createGisEngine(options: GisEngineOptions): GisEngine {
  return new GisEngine(options);
}
