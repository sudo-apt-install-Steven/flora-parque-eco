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

type TreeFeatureId = string | number;

const MapContainerComponent: React.FC<MapContainerProps> = ({
  currentMode,
  trees,
  selectedTree,
  onSelectTree,
  focusKey = 0,
  selectedGroup = 'all',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectedMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hoveredTreeIdRef = useRef<TreeFeatureId | null>(null);
  const selectedTreeIdRef = useRef<TreeFeatureId | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layerVeilVisible, setLayerVeilVisible] = useState(false);

  const getStyleForMode = (mode: 'satellite' | 'planta' | 'exploration') => {
    switch (mode) {
      case 'satellite': return SATELLITE_STYLE;
      case 'planta': return PLANTA_STYLE;
      case 'exploration': return EXPLORATION_STYLE;
      default: return SATELLITE_STYLE;
    }
  };

  // Group colour lookup — used for marker colours
  const groupColor = useCallback((group: string): string => {
    switch (group) {
      case 'groupA': return '#eab308';
      case 'groupB': return '#06b6d4';
      case 'groupC': return '#ef4444';
      default: return '#eab308';
    }
  }, []);

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

  // Applies dim/highlight based on selectedGroup
  const syncGroupFilter = useCallback(
    (map: maplibregl.Map) => {
      if (!map.getLayer('unclustered-point-outer')) return;
      if (selectedGroup === 'all') {
        map.setPaintProperty('unclustered-point-outer', 'circle-opacity', 0.98);
        map.setPaintProperty('unclustered-point-aura', 'circle-opacity', [
          'case',
          ['boolean', ['feature-state', 'selected'], false], 0.35,
          ['boolean', ['feature-state', 'hover'], false], 0.28,
          0.15
        ]);
      } else {
        // Dim non-matching trees, highlight matching ones
        map.setPaintProperty('unclustered-point-outer', 'circle-opacity', [
          'case',
          ['==', ['get', 'group'], selectedGroup], 0.98,
          0.18
        ]);
        map.setPaintProperty('unclustered-point-aura', 'circle-opacity', [
          'case',
          ['==', ['get', 'group'], selectedGroup], 0.28,
          0.04
        ]);
      }
    },
    [selectedGroup]
  );

  const setupTreeLayers = useCallback(
    (map: maplibregl.Map) => {
      const geojsonData = treesToGeoJSON(trees);

      if (map.getSource(TREE_SOURCE_ID)) {
        const source = map.getSource(TREE_SOURCE_ID) as maplibregl.GeoJSONSource;
        source.setData(geojsonData);
        syncSelectedFeatureState(map);
        syncGroupFilter(map);
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

      // Cluster halo
      map.addLayer({
        id: 'clusters-halo',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#c4a06a',
          'circle-opacity': 0.18,
          'circle-radius': ['step', ['get', 'point_count'], 24, 5, 31, 15, 38],
          'circle-blur': 0.18
        }
      });

      // Cluster node
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#0b211d',
          'circle-radius': ['step', ['get', 'point_count'], 16, 5, 20, 15, 25],
          'circle-stroke-width': 2.2,
          'circle-stroke-color': '#d6a35b',
          'circle-opacity': 0.95
        }
      });

      // Cluster count label
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
        paint: { 'text-color': '#f8f6ef' }
      });

      // Individual point aura
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
            ['match', ['get', 'group'],
              'groupA', '#eab308',
              'groupB', '#06b6d4',
              'groupC', '#ef4444',
              '#eab308'
            ]
          ],
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 20,
            ['boolean', ['feature-state', 'hover'], false], 16,
            12
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

      // Main individual marker
      map.addLayer({
        id: 'unclustered-point-outer',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match', ['get', 'group'],
            'groupA', '#eab308',
            'groupB', '#06b6d4',
            'groupC', '#ef4444',
            '#eab308'
          ],
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 10,
            ['boolean', ['feature-state', 'hover'], false], 9,
            7
          ],
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 3,
            ['boolean', ['feature-state', 'hover'], false], 2.5,
            2
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#ffffff',
            '#0b211d'
          ],
          'circle-opacity': 0.98
        }
      });

      // Inner core dot
      map.addLayer({
        id: 'unclustered-point-inner',
        type: 'circle',
        source: TREE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 4,
            ['boolean', ['feature-state', 'hover'], false], 3.5,
            3
          ],
          'circle-color': '#ffffff',
          'circle-opacity': 0.92
        }
      });

      // Invisible hitbox for easy tapping
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

      // Cluster click
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

      // Individual tree click
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

      // Hover
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
      syncGroupFilter(map);
    },
    [clearTreeFeatureState, groupColor, onSelectTree, setTreeFeatureState, syncGroupFilter, syncSelectedFeatureState, trees]
  );

  // Init map
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
      attributionControl: { compact: true }
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }),
      'bottom-right'
    );
    map.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true, showAccuracyCircle: true }),
      'bottom-right'
    );
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }),
      'bottom-left'
    );

    map.on('load', () => {
      setMapLoaded(true);
      setupTreeLayers(map);
    });

    // Empty-space click: deselect
    map.on('click', (e) => {
      const activeLayers = ['clusters', INTERACTIVE_TREE_LAYER].filter((id) => map.getLayer(id));
      const features = map.queryRenderedFeatures(e.point, { layers: activeLayers });
      if (features.length === 0) {
        onSelectTree(null);
      }
    });

    mapRef.current = map;
    if (typeof window !== 'undefined') (window as any)._map = map;

    return () => {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove();
        selectedMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Style mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    hoveredTreeIdRef.current = null;
    setLayerVeilVisible(true);
    map.setStyle(getStyleForMode(currentMode));

    const handleStyleLoad = () => {
      setupTreeLayers(map);
      syncSelectedFeatureState(map);
      if (currentMode === 'satellite' && PARK_CONFIG.customRasterOverlay.enabled) {
        applyRasterOverlay(map, PARK_CONFIG.customRasterOverlay);
      } else {
        removeRasterOverlay(map);
      }
      window.setTimeout(() => setLayerVeilVisible(false), 160);
    };
    map.once('style.load', handleStyleLoad);
  }, [currentMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trees data update
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const source = map.getSource(TREE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(treesToGeoJSON(trees));
      syncSelectedFeatureState(map);
      syncGroupFilter(map);
    }
  }, [trees, mapLoaded, syncSelectedFeatureState, syncGroupFilter]);

  // Group filter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    syncGroupFilter(map);
  }, [selectedGroup, mapLoaded, syncGroupFilter]);

  // Selected tree visual state
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    syncSelectedFeatureState(map);
  }, [selectedTree, mapLoaded, syncSelectedFeatureState]);

  // Active marker HTML injection
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
      selectedMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([selectedTree.longitude, selectedTree.latitude])
        .addTo(map);
    } else {
      selectedMarkerRef.current.setLngLat([selectedTree.longitude, selectedTree.latitude]);
    }
  }, [selectedTree, mapLoaded]);

  // Camera follow when tree selected / focusKey changes
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
export default MapContainer;
