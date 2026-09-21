import { z } from 'zod';
import type { Map as MapLibreMap, ImageSource } from 'maplibre-gl';
import { Tree, TreeCatalogItem } from '@/lib/tree-schema';
import { getSafeTree } from '@/lib/fallbacks';
import {
  GisLayerMode,
  RasterOverlayConfig,
  PlantaFeatureProperties,
  PlantaCategory
} from './types';

export const PlantaCategorySchema = z.enum([
  'agua',
  'caminho',
  'pista',
  'estrutura',
  'ponte',
  'trilha',
  'estrutura_nova',
  'playground',
  'instituicao',
  'vegetacao_setor'
]);

export const PlantaFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.enum(['Point', 'LineString', 'Polygon', 'MultiPolygon']),
    coordinates: z.unknown()
  }),
  properties: z.object({
    name: z.string().default(''),
    category: PlantaCategorySchema,
    description: z.string().optional(),
    color: z.string().optional(),
    strokeColor: z.string().optional()
  }).passthrough()
});

export const GeoJsonFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(z.unknown())
});

export interface IngestedPlantaData {
  raw: GeoJSON.FeatureCollection;
  lakeFeatures: GeoJSON.Feature[];
  trackFeatures: GeoJSON.Feature[];
  bridgeFeatures: GeoJSON.Feature[];
  trailFeatures: GeoJSON.Feature[];
  playgroundFeatures: GeoJSON.Feature[];
  institutionFeatures: GeoJSON.Feature[];
  errors: string[];
}

/**
 * Ingestão e segregação vetorial da Planta Técnica
 * Valida Lago, Pistas, Ponte, Trilhas e Parquinho
 */
export function ingestPlantaGeoJSON(input: unknown): IngestedPlantaData {
  const errors: string[] = [];

  const parsedCollection = GeoJsonFeatureCollectionSchema.safeParse(input);
  if (!parsedCollection.success) {
    return {
      raw: { type: 'FeatureCollection', features: [] },
      lakeFeatures: [],
      trackFeatures: [],
      bridgeFeatures: [],
      trailFeatures: [],
      playgroundFeatures: [],
      institutionFeatures: [],
      errors: ['Arquivo GeoJSON da Planta Técnica inválido ou corrompido']
    };
  }

  const rawCollection = input as GeoJSON.FeatureCollection;
  const lakeFeatures: GeoJSON.Feature[] = [];
  const trackFeatures: GeoJSON.Feature[] = [];
  const bridgeFeatures: GeoJSON.Feature[] = [];
  const trailFeatures: GeoJSON.Feature[] = [];
  const playgroundFeatures: GeoJSON.Feature[] = [];
  const institutionFeatures: GeoJSON.Feature[] = [];

  for (let i = 0; i < rawCollection.features.length; i++) {
    const feat = rawCollection.features[i];
    const validation = PlantaFeatureSchema.safeParse(feat);

    if (!validation.success) {
      errors.push(`Feature na posição ${i} possui propriedades fora do schema da Planta`);
      continue;
    }

    const cat = feat.properties?.category as PlantaCategory;

    switch (cat) {
      case 'agua':
        lakeFeatures.push(feat);
        break;
      case 'pista':
      case 'caminho':
        trackFeatures.push(feat);
        break;
      case 'ponte':
      case 'estrutura':
        bridgeFeatures.push(feat);
        break;
      case 'trilha':
        trailFeatures.push(feat);
        break;
      case 'playground':
      case 'estrutura_nova':
        playgroundFeatures.push(feat);
        break;
      case 'instituicao':
        institutionFeatures.push(feat);
        break;
      default:
        break;
    }
  }

  return {
    raw: rawCollection,
    lakeFeatures,
    trackFeatures,
    bridgeFeatures,
    trailFeatures,
    playgroundFeatures,
    institutionFeatures,
    errors
  };
}

/**
 * Validação do polígono perimetral do Parque
 */
export function ingestParkBoundaryGeoJSON(input: unknown): {
  success: boolean;
  data: GeoJSON.FeatureCollection | null;
  error?: string;
} {
  const parsed = GeoJsonFeatureCollectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, data: null, error: 'GeoJSON do perímetro do parque inválido' };
  }
  return { success: true, data: input as GeoJSON.FeatureCollection };
}

/**
 * Validação da camada de exploração (curvas de nível e relevo)
 */
export function ingestExplorationGeoJSON(input: unknown): {
  success: boolean;
  data: GeoJSON.FeatureCollection | null;
  error?: string;
} {
  const parsed = GeoJsonFeatureCollectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, data: null, error: 'GeoJSON de exploração topográfica inválido' };
  }
  return { success: true, data: input as GeoJSON.FeatureCollection };
}

/**
 * Converte itens do catálogo (Tree ou TreeCatalogItem) para GeoJSON FeatureCollection
 * Compatível com o motor MapLibre GL com aceleração por hardware
 */
export function catalogToGeoJSON(
  items: (Tree | TreeCatalogItem)[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];

  for (const item of items) {
    // Normaliza se for Tree ou TreeCatalogItem
    let id: string;
    let lat: number | null = null;
    let lng: number | null = null;
    let popularName: string;
    let scientificName: string | null = null;
    let family: string | null = null;
    let group: string = 'groupA';
    let plantnetScore: number | null = null;
    let thumbUrl: string = '';

    if ('coordinates' in item && item.coordinates) {
      // TreeCatalogItem
      id = item.id;
      lat = item.coordinates.lat;
      lng = item.coordinates.lng;
      popularName = item.popularName;
      scientificName = item.scientificName;
      family = item.family;
      const colGroup = item.collection?.collectionGroup ?? 'OUTROS';
      if (colGroup === 'DIREITA_LAGO') {
        group = 'groupC';
      } else if (colGroup === 'ESQUERDA_LAGO') {
        group = 'groupA';
      } else {
        group = 'groupA';
      }
      plantnetScore = item.plantnet?.score ?? null;
      thumbUrl = item.gallery?.[0]?.url ?? '';
    } else {
      // Tree
      const tree = item as Tree;
      const safe = getSafeTree(tree);
      id = safe.id;
      lat = safe.latitude;
      lng = safe.longitude;
      popularName = safe.popularName;
      scientificName = safe.scientificNameSuggested;
      family = safe.family;
      group = safe.group;
      plantnetScore = safe.plantnet?.score ?? null;
      thumbUrl = safe.safePrimaryPhoto.thumbUrl || safe.safePrimaryPhoto.url;
    }

    if (lat === null || lng === null || Number.isNaN(lat) || Number.isNaN(lng)) {
      continue;
    }

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: {
        id,
        popularName,
        scientificName: scientificName ?? '',
        family: family ?? 'Indeterminada',
        group,
        collectionGroup: 'coordinates' in item ? (item.collection?.collectionGroup ?? 'OUTROS') : undefined,
        plantnetScore,
        thumbUrl
      }
    });
  }

  return {
    type: 'FeatureCollection',
    features
  };
}

const RASTER_SOURCE_ID = 'custom-raster-overlay-source';
const RASTER_LAYER_ID = 'custom-raster-overlay-layer';

/**
 * Aplica ou atualiza uma sobreposição raster georreferenciada no MapLibre GL
 * Ex: ortomosaico de drone ou imagem aérea local de alta precisão
 */
export function applyRasterOverlay(map: MapLibreMap, config: RasterOverlayConfig): void {
  if (!map.isStyleLoaded()) return;

  if (!config.enabled) {
    removeRasterOverlay(map);
    return;
  }

  const existingSource = map.getSource(RASTER_SOURCE_ID) as ImageSource | undefined;

  if (existingSource) {
    existingSource.updateImage({
      url: config.url,
      coordinates: config.coordinates
    });

    if (map.getLayer(RASTER_LAYER_ID)) {
      map.setPaintProperty(
        RASTER_LAYER_ID,
        'raster-opacity',
        config.opacity ?? 0.85
      );
    }
  } else {
    map.addSource(RASTER_SOURCE_ID, {
      type: 'image',
      url: config.url,
      coordinates: config.coordinates
    });

    // Insere antes das camadas de árvores/clusters ou antes das bordas para preservar marcadores
    let beforeId: string | undefined = undefined;
    if (map.getLayer('clusters-halo')) {
      beforeId = 'clusters-halo';
    } else if (map.getLayer('clusters')) {
      beforeId = 'clusters';
    } else if (map.getLayer('unclustered-point-shadow')) {
      beforeId = 'unclustered-point-shadow';
    } else if (map.getLayer('unclustered-point')) {
      beforeId = 'unclustered-point';
    } else if (map.getLayer('satellite-boundary-glow')) {
      beforeId = 'satellite-boundary-glow';
    }

    map.addLayer(
      {
        id: RASTER_LAYER_ID,
        type: 'raster',
        source: RASTER_SOURCE_ID,
        paint: {
          'raster-opacity': config.opacity ?? 0.85,
          'raster-fade-duration': 300
        }
      },
      beforeId
    );
  }
}

/**
 * Remove a sobreposição raster aérea do mapa
 */
export function removeRasterOverlay(map: MapLibreMap): void {
  if (map.getLayer(RASTER_LAYER_ID)) {
    map.removeLayer(RASTER_LAYER_ID);
  }
  if (map.getSource(RASTER_SOURCE_ID)) {
    map.removeSource(RASTER_SOURCE_ID);
  }
}
