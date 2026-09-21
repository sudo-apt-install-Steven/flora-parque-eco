import {
  Tree,
  TreeFilterCriteria,
  TreeFacetedStats,
  FieldGroup,
  VerificationStatus,
  TreeConfidence
} from '@/lib/tree-schema';

/**
 * Normaliza strings para busca insensível a acentos, maiúsculas e pontuações
 * Ex: "Ipê-Amarelo" -> "ipe amarelo"
 */
export function normalizeSearchString(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .trim();
}

/**
 * Motor de busca e filtragem multifatorial em memória para o catálogo de árvores
 */
export function filterTrees(trees: Tree[], criteria: TreeFilterCriteria): Tree[] {
  if (!Array.isArray(trees) || trees.length === 0) {
    return [];
  }

  const normalizedQuery = criteria.searchQuery
    ? normalizeSearchString(criteria.searchQuery)
    : '';
  const searchTokens = normalizedQuery ? normalizedQuery.split(/\s+/).filter(Boolean) : [];

  const targetGroup = criteria.group && criteria.group !== 'all' ? criteria.group : null;
  const targetCollectionGroup =
    criteria.collectionGroup && criteria.collectionGroup !== 'all'
      ? criteria.collectionGroup
      : null;
  const targetFamily =
    criteria.family && criteria.family !== 'all'
      ? normalizeSearchString(criteria.family)
      : null;
  const targetConfidence =
    criteria.confidence && criteria.confidence !== 'all' ? criteria.confidence : null;
  const minScore =
    typeof criteria.minPlantnetScore === 'number' && !Number.isNaN(criteria.minPlantnetScore)
      ? Math.max(0, Math.min(1, criteria.minPlantnetScore))
      : null;
  const targetStatus =
    criteria.verificationStatus && criteria.verificationStatus !== 'all'
      ? criteria.verificationStatus
      : null;

  return trees.filter((tree) => {
    // 1. Filtro por Grupo de Campo
    if (targetGroup && tree.group !== targetGroup) {
      return false;
    }

    // 1.1 Filtro por Grupo de Coleta Acadêmica (ESQUERDA_LAGO engloba groupA e groupB)
    if (targetCollectionGroup) {
      if (targetCollectionGroup === 'ESQUERDA_LAGO') {
        if (tree.group !== 'groupA' && tree.group !== 'groupB') {
          return false;
        }
      } else if (targetCollectionGroup === 'DIREITA_LAGO') {
        if (tree.group !== 'groupC') {
          return false;
        }
      } else if (targetCollectionGroup === 'OUTROS') {
        if (tree.group === 'groupA' || tree.group === 'groupB' || tree.group === 'groupC') {
          return false;
        }
      }
    }

    // 2. Filtro por Família Botânica
    if (targetFamily) {
      const treeFamilyNorm = normalizeSearchString(tree.family);
      if (treeFamilyNorm !== targetFamily) {
        return false;
      }
    }

    // 3. Filtro por Nível de Confiança
    if (targetConfidence && tree.confidence !== targetConfidence) {
      return false;
    }

    // 4. Filtro por Pontuação Mínima do PlantNet
    if (minScore !== null) {
      const score = tree.plantnet?.score;
      if (typeof score !== 'number' || score < minScore) {
        return false;
      }
    }

    // 5. Filtro por Status de Verificação Científica
    if (targetStatus && tree.verificationStatus !== targetStatus) {
      return false;
    }

    // 6. Filtro: Apenas com coordenadas válidas
    if (criteria.hasCoordinatesOnly) {
      const hasCoords =
        typeof tree.latitude === 'number' &&
        typeof tree.longitude === 'number' &&
        !Number.isNaN(tree.latitude) &&
        !Number.isNaN(tree.longitude);
      if (!hasCoords) return false;
    }

    // 7. Filtro: Apenas com fotografias cadastradas
    if (criteria.hasPhotosOnly) {
      const hasPrimary = !!tree.primaryPhoto?.url;
      const hasGallery = Array.isArray(tree.gallery) && tree.gallery.length > 0;
      if (!hasPrimary && !hasGallery) return false;
    }

    // 8. Busca textual por múltiplos tokens (Popular, Científico, Família, Taxon PlantNet, Notas)
    if (searchTokens.length > 0) {
      const haystack = normalizeSearchString(
        [
          tree.popularName,
          tree.scientificNameSuggested,
          tree.family,
          tree.plantnet?.taxon || '',
          tree.plantnet?.familySuggested || '',
          tree.notes || '',
          tree.id
        ].join(' ')
      );

      // Todos os tokens digitados devem estar presentes
      const matchesAllTokens = searchTokens.every((token) => haystack.includes(token));
      if (!matchesAllTokens) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calcula estatísticas multifacetadas a partir da base e do conjunto filtrado
 */
export function calculateFacetedStats(
  allTrees: Tree[],
  filteredTrees: Tree[]
): TreeFacetedStats {
  const byGroup: Record<FieldGroup, number> = {
    groupA: 0,
    groupB: 0,
    groupC: 0
  };

  const byStatus: Record<VerificationStatus, number> = {
    pendente: 0,
    em_analise: 0,
    identificacao_preliminar: 0,
    verificado: 0,
    rejeitado: 0
  };

  const byConfidence: Record<TreeConfidence, number> = {
    alta: 0,
    media: 0,
    baixa: 0,
    indeterminada: 0
  };

  const familyMap = new Map<string, number>();
  let totalScoreSum = 0;
  let scoreCount = 0;
  let withCoordinatesCount = 0;
  let withPhotosCount = 0;

  for (const tree of allTrees) {
    if (tree.group in byGroup) {
      byGroup[tree.group]++;
    }
    if (tree.verificationStatus in byStatus) {
      byStatus[tree.verificationStatus]++;
    }
    if (tree.confidence in byConfidence) {
      byConfidence[tree.confidence]++;
    }

    const cleanFamily = tree.family ? tree.family.trim() : 'Indeterminada';
    familyMap.set(cleanFamily, (familyMap.get(cleanFamily) || 0) + 1);

    if (typeof tree.plantnet?.score === 'number' && !Number.isNaN(tree.plantnet.score)) {
      totalScoreSum += tree.plantnet.score;
      scoreCount++;
    }

    if (
      typeof tree.latitude === 'number' &&
      typeof tree.longitude === 'number' &&
      !Number.isNaN(tree.latitude) &&
      !Number.isNaN(tree.longitude)
    ) {
      withCoordinatesCount++;
    }

    if (tree.primaryPhoto?.url || (Array.isArray(tree.gallery) && tree.gallery.length > 0)) {
      withPhotosCount++;
    }
  }

  const families = Array.from(familyMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const averagePlantnetScore = scoreCount > 0 ? totalScoreSum / scoreCount : 0;

  return {
    total: allTrees.length,
    filteredTotal: filteredTrees.length,
    byGroup,
    byStatus,
    byConfidence,
    families,
    averagePlantnetScore,
    withCoordinatesCount,
    withPhotosCount
  };
}

/**
 * Retorna lista de famílias botânicas únicas ordenadas alfabeticamente com suas contagens
 */
export function getUniqueFamilies(trees: Tree[]): Array<{ name: string; count: number }> {
  const map = new Map<string, number>();
  for (const tree of trees) {
    const fam = tree.family?.trim() || 'Indeterminada';
    map.set(fam, (map.get(fam) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Retorna contagem de árvores por grupo de campo
 */
export function getGroupCounts(trees: Tree[]): Record<FieldGroup, number> {
  const counts: Record<FieldGroup, number> = {
    groupA: 0,
    groupB: 0,
    groupC: 0
  };
  for (const tree of trees) {
    if (tree.group in counts) {
      counts[tree.group]++;
    }
  }
  return counts;
}
