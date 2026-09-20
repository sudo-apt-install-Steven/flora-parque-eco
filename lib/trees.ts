import rawTrees from '@/data/mock-trees.json';
import { Tree, TreeSchema, FieldGroup } from '@/lib/tree-schema';

/**
 * Validação dos dados em tempo de execução
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
 */
export function searchTrees(query: string, groupFilter?: FieldGroup | 'all'): Tree[] {
  const trees = getValidatedTrees();
  const q = query.trim().toLowerCase();

  return trees.filter((tree) => {
    const matchesGroup = !groupFilter || groupFilter === 'all' || tree.group === groupFilter;
    if (!matchesGroup) return false;

    if (!q) return true;

    return (
      tree.popularName.toLowerCase().includes(q) ||
      tree.scientificNameSuggested.toLowerCase().includes(q) ||
      tree.family.toLowerCase().includes(q) ||
      (tree.notes && tree.notes.toLowerCase().includes(q))
    );
  });
}

/**
 * Converte a lista de árvores para FeatureCollection GeoJSON
 * Otimizado para renderização no MapLibre GL com propriedades achatadas
 */
export function treesToGeoJSON(trees: Tree[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = trees
    .filter((tree): tree is Tree & { latitude: number; longitude: number } => 
      typeof tree.latitude === 'number' && typeof tree.longitude === 'number'
    )
    .map((tree) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [tree.longitude, tree.latitude]
      },
      properties: {
        id: tree.id,
        displayNumber: tree.displayNumber,
        popularName: tree.popularName,
        scientificNameSuggested: tree.scientificNameSuggested,
        family: tree.family,
        confidence: tree.confidence,
        group: tree.group,
        verificationStatus: tree.verificationStatus,
        hasPrimaryPhoto: !!tree.primaryPhoto,
        thumbUrl: tree.primaryPhoto?.thumbUrl || tree.primaryPhoto?.url || '',
        plantnetScore: tree.plantnet?.score ?? null
      }
    }));

  return {
    type: 'FeatureCollection',
    features
  };
}
