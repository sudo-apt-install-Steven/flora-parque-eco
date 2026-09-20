import rawTrees from '@/data/mock-trees.json';
import { Tree, TreeSchema, FieldGroup } from '@/lib/tree-schema';
import { filterTrees } from '@/lib/filters';
import { getSafeTree } from '@/lib/fallbacks';

// Re-exporta utilitários canônicos para fácil acesso
export * from '@/lib/tree-schema';
export * from '@/lib/fallbacks';
export * from '@/lib/filters';
export * from '@/lib/ingestion/pipeline';
export * from '@/lib/ingestion/csv-parser';
export * from '@/lib/ingestion/exif-extractor';
export * from '@/lib/ingestion/plantnet-mapper';

/**
 * Validação estrita dos dados em tempo de execução via Zod
 */
export function getValidatedTrees(): Tree[] {
  return rawTrees.map((item) => TreeSchema.parse(item));
}

/**
 * Busca de árvore por ID interno estável
 */
export function getTreeById(id: string): Tree | undefined {
  const trees = getValidatedTrees();
  return trees.find((t) => t.id === id);
}

/**
 * Filtro por grupo acadêmico (groupA, groupB, groupC)
 */
export function getTreesByGroup(group: FieldGroup): Tree[] {
  const trees = getValidatedTrees();
  return trees.filter((t) => t.group === group);
}

/**
 * Filtro de busca por termo de pesquisa (nome popular, científico ou família)
 * Utiliza o motor normalizado e insensível a acentos
 */
export function searchTrees(query: string, groupFilter?: FieldGroup | 'all'): Tree[] {
  const trees = getValidatedTrees();
  return filterTrees(trees, {
    searchQuery: query,
    group: groupFilter
  });
}

/**
 * Converte a lista de árvores para FeatureCollection GeoJSON
 * Otimizado para renderização no MapLibre GL com propriedades achatadas
 * e garantidas contra valores nulos
 */
export function treesToGeoJSON(trees: Tree[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = trees
    .filter((tree): tree is Tree & { latitude: number; longitude: number } => 
      typeof tree.latitude === 'number' && typeof tree.longitude === 'number' &&
      !Number.isNaN(tree.latitude) && !Number.isNaN(tree.longitude)
    )
    .map((tree) => {
      const safe = getSafeTree(tree);
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [safe.longitude as number, safe.latitude as number]
        },
        properties: {
          id: safe.id,
          displayNumber: safe.displayNumber,
          displayNumberFormatted: safe.displayNumberFormatted,
          popularName: safe.popularName,
          scientificNameSuggested: safe.scientificNameSuggested,
          family: safe.family,
          confidence: safe.confidence,
          group: safe.group,
          verificationStatus: safe.verificationStatus,
          hasPrimaryPhoto: !!safe.primaryPhoto?.url,
          thumbUrl: safe.safePrimaryPhoto.thumbUrl || safe.safePrimaryPhoto.url,
          plantnetScore: safe.plantnet?.score ?? null,
          plantnetScoreFormatted: safe.plantnetScoreFormatted,
          coordinatesFormatted: safe.coordinatesFormatted
        }
      };
    });

  return {
    type: 'FeatureCollection',
    features
  };
}
