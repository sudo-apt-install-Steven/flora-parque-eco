import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PARK_CONFIG } from '@/lib/park-config';
import { SATELLITE_STYLE, PLANTA_STYLE, EXPLORATION_STYLE } from '@/lib/map-styles';
import { Tree } from '@/lib/tree-schema';
import { treesToGeoJSON } from '@/lib/trees';

interface MapContainerProps {
  currentMode: 'satellite' | 'planta' | 'exploration';
  trees: Tree[];
  selectedTree: Tree | null;
  onSelectTree: (tree: Tree | null) => void;
  focusKey?: number;
}

const INTERACTIVE_TREE_LAYER = 'unclustered-point-hitbox';
const TREE_SOURCE_ID = 'trees-source';

type TreeFeatureId = string | number;

export const MapContainer: React.FC<MapContainerProps> = ({
  currentMode,
  trees,
  selectedTree,
  onSelectTree,
  focusKey = 0
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectedMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hoveredTreeIdRef = useRef<TreeFeatureId | null>(null);
  const selectedTreeIdRef = useRef<TreeFeatureId | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
        return PLANTA_STYLE;
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

  // Atualiza ou injeta as camadas de árvores no mapa
  const setupTreeLayers = useCallback(
    (map: maplibregl.Map) => {
      const geojsonData = treesToGeoJSON(trees);

      // Se a fonte já existe, apenas atualiza os dados
      if (map.getSource(TREE_SOURCE_ID)) {
        const source = map.getSource(TREE_SOURCE_ID) as maplibregl.GeoJSONSource;
        source.setData(geojsonData);
        syncSelectedFeatureState(map);
        return;
      }

      // Adiciona a fonte GeoJSON com clustering de alto desempenho e IDs estáveis para hover/selected
      map.addSource(TREE_SOURCE_ID, {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 17,
        clusterRadius: 45,
        promoteId: 'id'
      });

      // Halo externo do cluster — aparência de medalhão cartográfico em vez de bolha genérica
      map.addLayer({
        id: 'clusters-halo',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#d6a35b',
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

      // Camada de círculos para Clusters
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: TREE_SOURCE_ID,
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

      // Contagem numérica do Cluster
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: TREE_SOURCE_ID,
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

      // Sombra suave para árvore individual
      map.addLayer({
        id: 'unclustered-point-shadow',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#061511',
          'circle-radius': 15,
          'circle-blur': 0.45,
          'circle-opacity': 0.22,
          'circle-translate': [0, 2]
        }
      });

      // Halo responsivo para estados NORMAL / HOVER / SELECTED
      map.addLayer({
        id: 'unclustered-point-halo',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#d6a35b',
            ['boolean', ['feature-state', 'hover'], false], '#f8f6ef',
            [
              'match',
              ['get', 'group'],
              'groupA', '#52775e',
              'groupB', '#4a6f91',
              'groupC', '#b07a32',
              '#52775e'
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
            ['boolean', ['feature-state', 'selected'], false], 0.3,
            ['boolean', ['feature-state', 'hover'], false], 0.24,
            0.13
          ],
          'circle-blur': 0.08
        }
      });

      // Medalhão principal por equipe de campo
      map.addLayer({
        id: 'unclustered-point-outer',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'group'],
            'groupA', '#52775e',
            'groupB', '#4a6f91',
            'groupC', '#b07a32',
            '#52775e'
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
            ['boolean', ['feature-state', 'selected'], false], '#d6a35b',
            '#f8f6ef'
          ],
          'circle-opacity': 0.98
        }
      });

      // Núcleo botânico: ponto científico de precisão
      map.addLayer({
        id: 'unclustered-point-inner',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#0b211d',
            '#f8f6ef'
          ],
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 4.2,
            ['boolean', ['feature-state', 'hover'], false], 3.8,
            3.2
          ],
          'circle-opacity': 1
        }
      });

      // Glifo cartográfico sutil para leitura premium sem poluição visual
      map.addLayer({
        id: 'unclustered-point-glyph',
        type: 'symbol',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '◆',
            ['boolean', ['feature-state', 'hover'], false], '●',
            '•'
          ],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 13,
            ['boolean', ['feature-state', 'hover'], false], 12,
            10
          ],
          'text-allow-overlap': true,
          'text-ignore-placement': true
        },
        paint: {
          'text-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#d6a35b',
            '#0b211d'
          ]
        }
      });

      // Hitbox transparente para interação precisa em mobile e desktop
      map.addLayer({
        id: INTERACTIVE_TREE_LAYER,
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 20,
          'circle-color': '#ffffff',
          'circle-opacity': 0.01
        }
      });

      // Evento de clique no cluster para zoom
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

      // Evento de clique na árvore individual
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
              zoom: Math.max(map.getZoom(), 17.5),
              offset: window.innerWidth < 768 ? [0, -120] : [-150, 0],
              duration: 620,
              easing: (t) => 1 - Math.pow(1 - t, 3)
            });
          }
        }
      });

      // Estado visual HOVER usando feature-state do MapLibre
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

      // Cursor pointer ao passar o mouse em clusters
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });

      syncSelectedFeatureState(map);
    },
    [clearTreeFeatureState, onSelectTree, setTreeFeatureState, syncSelectedFeatureState, trees]
  );

  // Inicialização do Mapa
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
    });

    // Clique no mapa vazio fecha a árvore selecionada
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters', INTERACTIVE_TREE_LAYER]
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
  }, []); // apenas na montagem

  // Reação a trocas de estilo/modo (Satélite, Planta, Exploração)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    hoveredTreeIdRef.current = null;
    map.setStyle(getStyleForMode(currentMode));

    const handleStyleLoad = () => {
      setupTreeLayers(map);
      syncSelectedFeatureState(map);
    };

    map.once('style.load', handleStyleLoad);
  }, [currentMode, mapLoaded, setupTreeLayers, syncSelectedFeatureState]);

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

  // Sincroniza visual SELECTED nas camadas WebGL de marcadores
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-[#0b211d]"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>
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

  // Centralização e realce quando uma árvore é selecionada externamente ou botão Centralizar é clicado
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !selectedTree) return;

    if (selectedTree.latitude !== null && selectedTree.longitude !== null) {
      map.easeTo({
        center: [selectedTree.longitude, selectedTree.latitude],
        zoom: Math.max(map.getZoom(), 17.5),
        offset: window.innerWidth < 768 ? [0, -120] : [-150, 0],
        duration: 620,
        easing: (t) => 1 - Math.pow(1 - t, 3)
      });
    }
  }, [selectedTree, focusKey, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        aria-label="Mapa Interativo do Parque Ecológico de Vilhena"
      />
    </div>
  );
};
