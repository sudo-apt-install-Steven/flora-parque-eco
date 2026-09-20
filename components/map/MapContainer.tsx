'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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

  // Atualiza ou injeta as camadas de árvores no mapa
  const setupTreeLayers = useCallback(
    (map: maplibregl.Map) => {
      const geojsonData = treesToGeoJSON(trees);

      // Se a fonte já existe, apenas atualiza os dados
      if (map.getSource('trees-source')) {
        const source = map.getSource('trees-source') as maplibregl.GeoJSONSource;
        source.setData(geojsonData);
        return;
      }

      // Adiciona a fonte GeoJSON com clustering de alto desempenho
      map.addSource('trees-source', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 17,
        clusterRadius: 45
      });

      // Camada de círculos para Clusters
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'trees-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#10b981', // < 5 árvores: esmeralda
            5,
            '#059669', // 5 - 15 árvores: verde escuro
            15,
            '#047857'  // > 15 árvores
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
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Contagem numérica do Cluster
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'trees-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Círculo externo para Árvore Individual
      map.addLayer({
        id: 'unclustered-point-outer',
        type: 'circle',
        source: 'trees-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'group'],
            'groupA', '#10b981',
            'groupB', '#3b82f6',
            'groupC', '#f59e0b',
            '#10b981'
          ],
          'circle-radius': 9,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95
        }
      });

      // Ponto central de destaque
      map.addLayer({
        id: 'unclustered-point-inner',
        type: 'circle',
        source: 'trees-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#ffffff',
          'circle-radius': 3
        }
      });

      // Evento de clique no cluster para zoom
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId !== undefined) {
          const source = map.getSource('trees-source') as maplibregl.GeoJSONSource;
          source.getClusterExpansionZoom(clusterId).then((zoom) => {
            const coordinates = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
            map.easeTo({
              center: coordinates,
              zoom: zoom + 0.5,
              duration: 500
            });
          });
        }
      });

      // Evento de clique na árvore individual
      map.on('click', 'unclustered-point-outer', (e) => {
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
              duration: 600
            });
          }
        }
      });

      // Cursor pointer ao passar o mouse
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'unclustered-point-outer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-point-outer', () => {
        map.getCanvas().style.cursor = '';
      });
    },
    [trees, onSelectTree]
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
        layers: ['clusters', 'unclustered-point-outer']
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

    map.setStyle(getStyleForMode(currentMode));

    const handleStyleLoad = () => {
      setupTreeLayers(map);
    };

    map.once('style.load', handleStyleLoad);
  }, [currentMode, mapLoaded, setupTreeLayers]);

  // Atualização dos dados de árvores quando a lista de filtros mudar
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource('trees-source') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(treesToGeoJSON(trees));
    }
  }, [trees, mapLoaded]);

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
        duration: 600
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
