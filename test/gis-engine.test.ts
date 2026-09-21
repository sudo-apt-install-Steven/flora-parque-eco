import { describe, it, expect } from 'vitest';
import {
  createSupercluster,
  lngLatToMercator,
  mercatorToLngLat,
  SpatialClusterIndex
} from '@/lib/gis/clustering';
import {
  ingestPlantaGeoJSON,
  ingestParkBoundaryGeoJSON,
  ingestExplorationGeoJSON,
  catalogToGeoJSON
} from '@/lib/gis/layers';
import { TreeCatalogItem } from '@/lib/tree-schema';

describe('FASE 3: MOTOR CARTOGRÁFICO, GIS & CLUSTERING (SUPERCLUSTER)', () => {
  const mockTrees: TreeCatalogItem[] = [
    {
      id: 'tree-c1',
      coordinates: { lat: -12.7044, lng: -60.1189 },
      popularName: 'Ipê Rosa',
      scientificName: 'Handroanthus heptaphyllus',
      family: 'Bignoniaceae',
      gallery: []
    },
    {
      id: 'tree-c2',
      coordinates: { lat: -12.7045, lng: -60.1190 }, // Muito próximo a tree-c1
      popularName: 'Ipê Amarelo',
      scientificName: 'Handroanthus serratifolius',
      family: 'Bignoniaceae',
      gallery: []
    },
    {
      id: 'tree-c3',
      coordinates: { lat: -12.7046, lng: -60.1188 }, // Muito próximo
      popularName: 'Ipê Branco',
      scientificName: 'Handroanthus roseoalbus',
      family: 'Bignoniaceae',
      gallery: []
    },
    {
      id: 'tree-far',
      coordinates: { lat: -12.7150, lng: -60.1300 }, // Distante
      popularName: 'Castanheira',
      scientificName: 'Bertholletia excelsa',
      family: 'Lecythidaceae',
      gallery: []
    }
  ];

  it('deve projetar e reverter coordenadas Web Mercator com precisão', () => {
    const lng = -60.1189;
    const lat = -12.7044;

    const [x, y] = lngLatToMercator(lng, lat);
    expect(x).toBeGreaterThan(0);
    expect(x).toBeLessThan(1);
    expect(y).toBeGreaterThan(0);
    expect(y).toBeLessThan(1);

    const [revLng, revLat] = mercatorToLngLat(x, y);
    expect(revLng).toBeCloseTo(lng, 5);
    expect(revLat).toBeCloseTo(lat, 5);
  });

  it('deve condensar árvores próximas em cluster no zoom-out', () => {
    const clusterer = createSupercluster(
      mockTrees,
      (t) => [t.coordinates.lng, t.coordinates.lat],
      { radius: 60, maxZoom: 18 }
    );

    // Zoom baixo (zoom 12: zoom-out)
    const bbox: [number, number, number, number] = [-60.14, -12.72, -60.11, -12.69];
    const clustersLowZoom = clusterer.getClusters(bbox, 12);

    // As árvores c1, c2 e c3 devem se agrupar em um único cluster
    const clusterGroup = clustersLowZoom.find((c) => c.isCluster);
    expect(clusterGroup).toBeDefined();
    expect(clusterGroup?.pointCount).toBeGreaterThanOrEqual(3);

    // tree-far também deve ser visível ou em cluster próprio
    const totalCount = clustersLowZoom.reduce((sum, c) => sum + c.pointCount, 0);
    expect(totalCount).toBe(4);
  });

  it('deve desmembrar clusters em nós individuais em zoom elevado (zoom-in)', () => {
    const clusterer = createSupercluster(
      mockTrees,
      (t) => [t.coordinates.lng, t.coordinates.lat],
      { radius: 45, maxZoom: 18 }
    );

    // Zoom máximo (zoom 18)
    const bbox: [number, number, number, number] = [-60.14, -12.72, -60.11, -12.69];
    const clustersHighZoom = clusterer.getClusters(bbox, 18);

    // Em zoom alto, todos os pontos são individuais (isCluster = false)
    const allIndividual = clustersHighZoom.every((c) => !c.isCluster);
    expect(allIndividual).toBe(true);
    expect(clustersHighZoom.length).toBe(4);
  });

  it('getClusterExpansionZoom e getClusterLeaves devem recuperar dados do cluster', () => {
    const clusterer = createSupercluster(
      mockTrees,
      (t) => [t.coordinates.lng, t.coordinates.lat],
      { radius: 60, maxZoom: 18 }
    );

    const bbox: [number, number, number, number] = [-60.14, -12.72, -60.11, -12.69];
    const clusters = clusterer.getClusters(bbox, 14);
    const clusterNode = clusters.find((c) => c.isCluster);
    expect(clusterNode).toBeDefined();

    if (clusterNode?.clusterId) {
      const expansionZoom = clusterer.getClusterExpansionZoom(clusterNode.clusterId);
      expect(expansionZoom).toBeGreaterThanOrEqual(14);

      const leaves = clusterer.getClusterLeaves(clusterNode.clusterId);
      expect(leaves.length).toBeGreaterThanOrEqual(3);
      expect(leaves.some((l) => l.popularName === 'Ipê Rosa')).toBe(true);
    }
  });

  it('deve tratar bordas extremas e array vazio sem lançar exceção', () => {
    const emptyClusterer = createSupercluster([], () => null);
    const res = emptyClusterer.getClusters([-60, -13, -59, -12], 15);
    expect(res).toEqual([]);

    // Ponto único
    const singleClusterer = createSupercluster(
      [mockTrees[0]],
      (t) => [t.coordinates.lng, t.coordinates.lat]
    );
    const singleRes = singleClusterer.getClusters([-60.14, -12.72, -60.11, -12.69], 15);
    expect(singleRes.length).toBe(1);
    expect(singleRes[0].isCluster).toBe(false);
    expect(singleRes[0].item?.id).toBe('tree-c1');
  });

  it('deve agrupar pontos com coordenadas exatamente idênticas sem loop infinito', () => {
    const identicalPoints: TreeCatalogItem[] = [
      {
        id: 'dup-1',
        coordinates: { lat: -12.7044, lng: -60.1189 },
        popularName: 'A1',
        scientificName: null,
        family: null,
        gallery: []
      },
      {
        id: 'dup-2',
        coordinates: { lat: -12.7044, lng: -60.1189 },
        popularName: 'A2',
        scientificName: null,
        family: null,
        gallery: []
      }
    ];

    const dupClusterer = createSupercluster(
      identicalPoints,
      (t) => [t.coordinates.lng, t.coordinates.lat],
      { maxZoom: 16 }
    );

    const res = dupClusterer.getClusters([-61, -13, -59, -11], 10);
    expect(res.length).toBe(1);
    expect(res[0].isCluster).toBe(true);
    expect(res[0].pointCount).toBe(2);
  });

  it('ingestPlantaGeoJSON deve classificar lago, caminhos, ponte, trilhas e parquinho', () => {
    const sampleGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
          properties: { name: 'Lago Principal', category: 'agua' }
        },
        {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
          properties: { name: 'Pista de Cooper', category: 'pista' }
        },
        {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [[0, 0], [0.5, 0.5]] },
          properties: { name: 'Ponte de Madeira', category: 'ponte' }
        },
        {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [[0, 0], [0.2, 0.2]] },
          properties: { name: 'Trilha Ecológica da Samaúma', category: 'trilha' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [[[0, 0], [0.1, 0], [0.1, 0.1], [0, 0]]] },
          properties: { name: 'Parquinho Infantil', category: 'playground' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [[[0, 0], [0.3, 0], [0.3, 0.3], [0, 0]]] },
          properties: { name: 'Prédios IFRO', category: 'instituicao' }
        }
      ]
    };

    const ingested = ingestPlantaGeoJSON(sampleGeoJSON);
    expect(ingested.errors.length).toBe(0);
    expect(ingested.lakeFeatures.length).toBe(1);
    expect(ingested.trackFeatures.length).toBe(1);
    expect(ingested.bridgeFeatures.length).toBe(1);
    expect(ingested.trailFeatures.length).toBe(1);
    expect(ingested.playgroundFeatures.length).toBe(1);
    expect(ingested.institutionFeatures.length).toBe(1);
  });

  it('ingestPlantaGeoJSON deve rejeitar inputs corrompidos com segurança', () => {
    const invalid = ingestPlantaGeoJSON({ notGeoJSON: true });
    expect(ingestedHasErrors(invalid)).toBe(true);
    expect(invalid.lakeFeatures.length).toBe(0);
  });

  it('catalogToGeoJSON deve gerar FeatureCollection com coordenadas corretas e mapear group para MapLibre', () => {
    const treesWithCollection: TreeCatalogItem[] = [
      {
        ...mockTrees[0],
        collection: {
          collectionGroup: 'DIREITA_LAGO',
          collectedAt: '2026-09-20'
        }
      }
    ];

    const geojson = catalogToGeoJSON(treesWithCollection);
    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.features.length).toBe(1);
    expect(geojson.features[0].geometry.type).toBe('Point');
    expect(geojson.features[0].geometry.coordinates).toEqual([-60.1189, -12.7044]);
    expect(geojson.features[0].properties?.popularName).toBe('Ipê Rosa');
    // DIREITA_LAGO deve mapear para groupC para compatibilidade com o shader MapLibre
    expect(geojson.features[0].properties?.group).toBe('groupC');
    expect(geojson.features[0].properties?.collectionGroup).toBe('DIREITA_LAGO');
  });

  it('SpatialClusterIndex deve suportar bounding boxes invertidos e escalar com 1000 pontos', () => {
    // Bbox com coordenadas invertidas (maxLng antes de minLng, maxLat antes de minLat)
    const clusterer = createSupercluster(
      mockTrees,
      (t) => [t.coordinates.lng, t.coordinates.lat],
      { radius: 60, maxZoom: 18 }
    );
    const reversedBbox: [number, number, number, number] = [-60.11, -12.69, -60.14, -12.72];
    const res = clusterer.getClusters(reversedBbox, 14);
    expect(res.length).toBeGreaterThan(0);

    // Teste de estresse com 1000 pontos sintetizados para validar O(N) com spatial grid
    const thousandTrees: TreeCatalogItem[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `stress-tree-${i}`,
      coordinates: {
        lat: -12.7044 + (Math.random() - 0.5) * 0.02,
        lng: -60.1189 + (Math.random() - 0.5) * 0.02
      },
      popularName: `Árvore Sintética ${i}`,
      scientificName: null,
      family: null,
      gallery: []
    }));

    const startTime = Date.now();
    const stressClusterer = createSupercluster(
      thousandTrees,
      (t) => [t.coordinates.lng, t.coordinates.lat],
      { radius: 45, maxZoom: 17 }
    );
    const clusters = stressClusterer.getClusters([-60.14, -12.72, -60.10, -12.68], 14);
    const duration = Date.now() - startTime;

    expect(clusters.length).toBeGreaterThan(0);
    // Deve indexar e consultar 1000 pontos em menos de 1000ms com o grid espacial
    expect(duration).toBeLessThan(1000);
  });
});

function ingestedHasErrors(data: { errors: string[] }): boolean {
  return data.errors.length > 0;
}
