import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PARK_CONFIG } from '@/lib/park-config';
import { SATELLITE_STYLE, PLANTA_STYLE, EXPLORATION_STYLE } from '@/lib/map-styles';
import { Tree, FieldGroup } from '@/lib/tree-schema';
import { treesToGeoJSON } from '@/lib/trees';
import { applyRasterOverlay, removeRasterOverlay } from '@/lib/gis';

export interface MapContainerProps {
  currentMode: 'satellite' | 'planta' | 'exploration';
  trees: Tree[];
  selectedTree: Tree | null;
  onSelectTree: (tree: Tree | null) => void;
  focusKey?: number;
  selectedGroup?: FieldGroup | 'all';
  onSelectGroup?: (group: FieldGroup | 'all') => void;
}

const INTERACTIVE_TREE_LAYER = 'unclustered-point-hitbox';
const TREE_SOURCE_ID = 'trees-source';
const REGIONS_SOURCE_ID = 'park-regions';
const REGION_FILL_LAYERS = [
  'satellite-regions-fill',
  'planta-regions-fill',
  'exp-regions-fill'
];

type TreeFeatureId = string | number;

const MapContainerComponent: React.FC<MapContainerProps> = ({
  currentMode,
  trees,
  selectedTree,
  onSelectTree,
  focusKey = 0,
  selectedGroup = 'all',
  onSelectGroup
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectedMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hoveredTreeIdRef = useRef<TreeFeatureId | null>(null);
  const selectedTreeIdRef = useRef<TreeFeatureId | null>(null);
  const hoveredRegionIdRef = useRef<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layerVeilVisible, setLayerVeilVisible] = useState(false);

  // Helper para obter a especificação de estilo
  const getStyleForMode = (mode: 'satellite' | 'planta' | 'exploration') => {
    switch (mode) {
      case 'satellite':
        return SATELLITE_STYLE;
      case 'planta':
        return PLANTA_STYLE;
      case 'exploration':
        return EXPLORATION_STYLE;
      default:
        return SATELLITE_STYLE;
    }
  };

  const clearTreeFeatureState = useCallback((map: maplibregl.Map, id: TreeFeatureId | null, state: 'hover' | 'selected') => {
    if (id === null || !map.getSource(TREE_SOURCE_ID)) return;
    map.setFeatureState({ source: TREE_SOURCE_ID, id }, { [state]: false });
  }, []);

  const setTreeFeatureState = useCallback((map: maplibregl.Map, id: TreeFeatureId | null, state: 'hover' | 'selected') => {
    if (id === null || !map.getSource(TREE_SOURCE_ID)) return;
    map.setFeatureState({ source: TREE_SOURCE_ID, id }, { [state]: true });
  }, []);

  const syncSelectedFeatureState = useCallback(
    (map: maplibregl.Map) => {
      clearTreeFeatureState(map, selectedTreeIdRef.current, 'selected');

      if (selectedTree?.id && selectedTree.latitude !== null && selectedTree.longitude !== null) {
        selectedTreeIdRef.current = selectedTree.id;
        setTreeFeatureState(map, selectedTree.id, 'selected');
      } else {
        selectedTreeIdRef.current = null;
      }
    },
    [clearTreeFeatureState, selectedTree, setTreeFeatureState]
  );

  // Sincroniza estado de seleção visual nas regiões poligonais (A, B, C)
  const syncRegionSelectedState = useCallback(
    (map: maplibregl.Map) => {
      if (!map.getSource(REGIONS_SOURCE_ID)) return;

      ['groupA', 'groupB', 'groupC'].forEach((groupId) => {
        const isSelected = selectedGroup === groupId;
        map.setFeatureState(
          { source: REGIONS_SOURCE_ID, id: groupId },
          { selected: isSelected }
        );
      });
    },
    [selectedGroup]
  );

  // Configura os ouvintes interativos de hover e clique nas 3 regiões
  const setupRegionInteractions = useCallback(
    (map: maplibregl.Map) => {
      REGION_FILL_LAYERS.forEach((layerId) => {
        if (!map.getLayer(layerId)) return;

        // Hover na região
        map.on('mousemove', layerId, (e) => {
          const feature = e.features?.[0];
          const regionId = (feature?.id ?? feature?.properties?.id) as string | undefined;

          if (regionId && hoveredRegionIdRef.current !== regionId) {
            if (hoveredRegionIdRef.current && map.getSource(REGIONS_SOURCE_ID)) {
              map.setFeatureState(
                { source: REGIONS_SOURCE_ID, id: hoveredRegionIdRef.current },
                { hover: false }
              );
            }
            hoveredRegionIdRef.current = regionId;
            if (map.getSource(REGIONS_SOURCE_ID)) {
              map.setFeatureState(
                { source: REGIONS_SOURCE_ID, id: regionId },
                { hover: true }
              );
            }
          }
          map.getCanvas().style.cursor = 'pointer';
        });

        // Saída do mouse da região
        map.on('mouseleave', layerId, () => {
          if (hoveredRegionIdRef.current && map.getSource(REGIONS_SOURCE_ID)) {
            map.setFeatureState(
              { source: REGIONS_SOURCE_ID, id: hoveredRegionIdRef.current },
              { hover: false }
            );
          }
          hoveredRegionIdRef.current = null;
          map.getCanvas().style.cursor = '';
        });

        // Clique na região: seleciona o grupo e enquadra o setor
        map.on('click', layerId, (e) => {
          const feature = e.features?.[0];
          const group = feature?.properties?.group as FieldGroup | undefined;
          if (group && onSelectGroup) {
            onSelectGroup(group);

            // Centros geográficos dos 3 setores calibrados
            const centers: Record<FieldGroup, [number, number]> = {
              groupA: [-60.12140, -12.70650], // Gramado Noroeste
              groupB: [-60.12040, -12.70670], // Gramado Nordeste & Parquinho
              groupC: [-60.12090, -12.70770]  // Faixa da Margem Sul do Lago
            };
            const targetCenter = centers[group] || PARK_CONFIG.center;

            map.easeTo({
              center: targetCenter,
              zoom: 18.2,
              duration: 520,
              offset: window.innerWidth < 768 ? [0, -90] : [-120, 0],
              easing: (t) => 1 - Math.pow(1 - t, 3)
            });
          }
        });
      });
    },
    [onSelectGroup]
  );

  // Atualiza ou injeta as camadas de árvores no mapa
  const setupTreeLayers = useCallback(
    (map: maplibregl.Map) => {
      const geojsonData = treesToGeoJSON(trees);

      if (map.getSource(TREE_SOURCE_ID)) {
        const source = map.getSource(TREE_SOURCE_ID) as maplibregl.GeoJSONSource;
        source.setData(geojsonData);
        syncSelectedFeatureState(map);
        return;
      }

      map.addSource(TREE_SOURCE_ID, {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 17,
        clusterRadius: 45,
        promoteId: 'id'
      });

      // Halo externo do cluster
      map.addLayer({
        id: 'clusters-halo',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#c4a06a',
          'circle-opacity': 0.18,
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            24,
            5,
            31,
            15,
            38
          ],
          'circle-blur': 0.18
        }
      });

      // Nó do cluster com medalhão nobre
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#0b211d',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            16,
            5,
            20,
            15,
            25
          ],
          'circle-stroke-width': 2.2,
          'circle-stroke-color': '#d6a35b',
          'circle-opacity': 0.95
        }
      });

      // Rótulo numérico elegante com contagem do cluster
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: TREE_SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 11
        },
        paint: {
          'text-color': '#f8f6ef'
        }
      });

      // Halo sutil ao redor do ponto individual com as cores temáticas oficiais
      map.addLayer({
        id: 'unclustered-point-aura',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#c4a06a',
            ['boolean', ['feature-state', 'hover'], false], '#f8f6ef',
            [
              'match',
              ['get', 'group'],
              'groupA', '#eab308', // amarelo
              'groupB', '#3b82f6', // azul
              'groupC', '#ef4444', // vermelho
              '#eab308'
            ]
          ],
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 23,
            ['boolean', ['feature-state', 'hover'], false], 18,
            14
          ],
          'circle-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 0.35,
            ['boolean', ['feature-state', 'hover'], false], 0.28,
            0.15
          ],
          'circle-blur': 0.08
        }
      });

      // Medalhão principal por equipe de campo (Cores Oficiais: A Amarelo, B Azul, C Vermelho)
      map.addLayer({
        id: 'unclustered-point-outer',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'group'],
            'groupA', '#eab308', // amarelo
            'groupB', '#3b82f6', // azul
            'groupC', '#ef4444', // vermelho
            '#eab308'
          ],
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 12,
            ['boolean', ['feature-state', 'hover'], false], 11,
            9
          ],
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 3.5,
            ['boolean', ['feature-state', 'hover'], false], 3,
            2.25
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#ffffff',
            '#0b211d'
          ],
          'circle-opacity': 0.98
        }
      });

      // Núcleo botânico
      map.addLayer({
        id: 'unclustered-point-inner',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 5.5,
            ['boolean', ['feature-state', 'hover'], false], 4.5,
            3.5
          ],
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#ffffff',
            '#ffffff'
          ],
          'circle-opacity': 0.95
        }
      });

      // Hitbox transparente para interação precisa em mobile e desktop
      map.addLayer({
        id: INTERACTIVE_TREE_LAYER,
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 22,
          'circle-color': '#ffffff',
          'circle-opacity': 0.01
        }
      });

      // Clique no cluster para zoom
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId !== undefined) {
          const source = map.getSource(TREE_SOURCE_ID) as maplibregl.GeoJSONSource;
          source.getClusterExpansionZoom(clusterId).then((zoom) => {
            const coordinates = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
            map.easeTo({
              center: coordinates,
              zoom: zoom + 0.5,
              duration: 520,
              easing: (t) => 1 - Math.pow(1 - t, 3)
            });
          });
        }
      });

      // Clique na árvore individual
      map.on('click', INTERACTIVE_TREE_LAYER, (e) => {
        const feature = e.features?.[0];
        if (feature?.properties?.id) {
          const treeId = feature.properties.id;
          const foundTree = trees.find((t) => t.id === treeId);
          if (foundTree) {
            onSelectTree(foundTree);
            const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
            map.easeTo({
              center: coordinates,
              zoom: Math.max(map.getZoom(), 17.8),
              offset: window.innerWidth < 768 ? [0, -120] : [-150, 0],
              duration: 620,
              easing: (t) => 1 - Math.pow(1 - t, 3)
            });
          }
        }
      });

      // Hover nas árvores
      map.on('mousemove', INTERACTIVE_TREE_LAYER, (e) => {
        const feature = e.features?.[0];
        const featureId = (feature?.id ?? feature?.properties?.id) as TreeFeatureId | undefined;
        if (featureId === undefined) return;

        if (hoveredTreeIdRef.current !== featureId) {
          clearTreeFeatureState(map, hoveredTreeIdRef.current, 'hover');
          hoveredTreeIdRef.current = featureId;
          setTreeFeatureState(map, hoveredTreeIdRef.current, 'hover');
        }
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', INTERACTIVE_TREE_LAYER, () => {
        clearTreeFeatureState(map, hoveredTreeIdRef.current, 'hover');
        hoveredTreeIdRef.current = null;
        map.getCanvas().style.cursor = '';
      });

      syncSelectedFeatureState(map);
    },
    [clearTreeFeatureState, onSelectTree, setTreeFeatureState, syncSelectedFeatureState, trees]
  );

  // Inicialização do MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getStyleForMode(currentMode),
      center: PARK_CONFIG.center,
      zoom: PARK_CONFIG.defaultZoom,
      minZoom: PARK_CONFIG.minZoom,
      maxZoom: PARK_CONFIG.maxZoom,
      maxBounds: PARK_CONFIG.maxBounds,
      attributionControl: {
        compact: true
      }
    });

    // Controles de Navegação (Zoom e Bússola)
    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      }),
      'bottom-right'
    );

    // Controle de Geolocalização do Visitante (GPS em tempo real)
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showAccuracyCircle: true
      }),
      'bottom-right'
    );

    // Barra de Escala Métrica
    map.addControl(
      new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }),
      'bottom-left'
    );

    map.on('load', () => {
      setMapLoaded(true);
      setupTreeLayers(map);
      setupRegionInteractions(map);
      syncRegionSelectedState(map);
    });

    // Clique no mapa vazio: se clicou fora de regiões e árvores, limpa a seleção
    map.on('click', (e) => {
      const activeLayers = ['clusters', INTERACTIVE_TREE_LAYER, ...REGION_FILL_LAYERS].filter((id) =>
        map.getLayer(id)
      );
      const features = map.queryRenderedFeatures(e.point, {
        layers: activeLayers
      });
      if (features.length === 0) {
        onSelectTree(null);
      }
    });

    mapRef.current = map;

    return () => {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove();
        selectedMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Reação a trocas de estilo/modo (Satélite, Planta, Exploração)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    hoveredTreeIdRef.current = null;
    hoveredRegionIdRef.current = null;
    setLayerVeilVisible(true);
    map.setStyle(getStyleForMode(currentMode));

    const handleStyleLoad = () => {
      setupTreeLayers(map);
      setupRegionInteractions(map);
      syncRegionSelectedState(map);
      syncSelectedFeatureState(map);

      if (currentMode === 'satellite' && PARK_CONFIG.customRasterOverlay.enabled) {
        applyRasterOverlay(map, PARK_CONFIG.customRasterOverlay);
      } else {
        removeRasterOverlay(map);
      }

      window.setTimeout(() => setLayerVeilVisible(false), 160);
    };

    map.once('style.load', handleStyleLoad);
  }, [currentMode, mapLoaded, setupTreeLayers, setupRegionInteractions, syncRegionSelectedState, syncSelectedFeatureState]);

  // Atualização dos dados de árvores quando a lista de filtros mudar
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource(TREE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(treesToGeoJSON(trees));
      syncSelectedFeatureState(map);
    }
  }, [trees, mapLoaded, syncSelectedFeatureState]);

  // Sincroniza visual SELECTED nas regiões poligonais
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    syncRegionSelectedState(map);
  }, [selectedGroup, mapLoaded, syncRegionSelectedState]);

  // Sincroniza visual SELECTED nas camadas WebGL de árvores
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    syncSelectedFeatureState(map);
  }, [selectedTree, mapLoaded, syncSelectedFeatureState]);

  // Marcador Botânico Ativo no MapLibre (v0 Botanical Leaf Marker com aura pulsante)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!selectedTree || selectedTree.longitude === null || selectedTree.latitude === null) {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove();
        selectedMarkerRef.current = null;
      }
      return;
    }

    if (!selectedMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'tree-marker is-active pointer-events-none';
      el.innerHTML = `
        <span class="marker-core marker-gold">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="2.2" fill="#0b211d"/>
            <path d="M12 3.5v3.2M12 17.3V20.5M3.5 12h3.2M17.3 12H20.5" stroke="#0b211d" stroke-width="1.4" stroke-linecap="round"/>
            <path d="M14.6 8.2c1.6 1.8 1.8 4.1.2 5.4-1.7 1.4-3.9.4-5.1-1.4 1.4-.2 3.2-1.2 4.9-4" stroke="#0b211d" stroke-width="1.15" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="marker-pulse"></span>
      `;
      selectedMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([selectedTree.longitude, selectedTree.latitude])
        .addTo(map);
    } else {
      selectedMarkerRef.current.setLngLat([selectedTree.longitude, selectedTree.latitude]);
    }
  }, [selectedTree, mapLoaded]);

  // Centralização e realce quando uma árvore é selecionada
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !selectedTree) return;

    if (selectedTree.latitude !== null && selectedTree.longitude !== null) {
      map.easeTo({
        center: [selectedTree.longitude, selectedTree.latitude],
        zoom: Math.max(map.getZoom(), 17.8),
        offset: window.innerWidth < 768 ? [0, -120] : [-150, 0],
        duration: 620,
        easing: (t) => 1 - Math.pow(1 - t, 3)
      });
    }
  }, [selectedTree, focusKey, mapLoaded]);

  return (
    <div className={`relative w-full h-full map-canvas-shell layer-mode-${currentMode}`}>
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        aria-label="Mapa Interativo do Parque Ecológico de Vilhena"
      />
      {currentMode === 'exploration' && (
        <div className="map-topo-veil" aria-hidden="true" />
      )}
      {layerVeilVisible && <div className="map-layer-veil" aria-hidden="true" />}
    </div>
  );
};

export const MapContainer = React.memo(MapContainerComponent);
