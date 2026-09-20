import { describe, it, expect } from 'vitest';
import {
  normalizeSearchString,
  filterTrees,
  calculateFacetedStats,
  getUniqueFamilies,
  getGroupCounts
} from '../lib/filters';
import { Tree } from '../lib/tree-schema';

const sampleTrees: Tree[] = [
  {
    id: 'tree-01',
    displayNumber: null,
    popularName: 'Ipê-Amarelo do Cerrado',
    scientificNameSuggested: 'Handroanthus chrysotrichus',
    family: 'Bignoniaceae',
    confidence: 'alta',
    latitude: -12.704,
    longitude: -60.119,
    locationAccuracy: 3.0,
    primaryPhoto: { id: 'p1', url: 'https://images.unsplash.com/p1', category: 'arvore_inteira' },
    gallery: [],
    plantnet: { taxon: 'Handroanthus chrysotrichus', score: 0.95 },
    group: 'groupA',
    collectedAt: '2026-09-20T10:00:00Z',
    verificationStatus: 'verificado',
    notes: 'Próximo à trilha norte',
    isMock: true
  },
  {
    id: 'tree-02',
    displayNumber: null,
    popularName: 'Cerejeira-da-Amazônia',
    scientificNameSuggested: 'Amburana acreana',
    family: 'Fabaceae',
    confidence: 'media',
    latitude: -12.705,
    longitude: -60.12,
    locationAccuracy: 4.5,
    primaryPhoto: null,
    gallery: [],
    plantnet: { taxon: 'Amburana acreana', score: 0.72 },
    group: 'groupA',
    collectedAt: '2026-09-20T11:00:00Z',
    verificationStatus: 'em_analise',
    notes: 'Tronco rugoso',
    isMock: true
  },
  {
    id: 'tree-03',
    displayNumber: null,
    popularName: 'Buriti das Veredas',
    scientificNameSuggested: 'Mauritia flexuosa',
    family: 'Arecaceae',
    confidence: 'alta',
    latitude: -12.706,
    longitude: -60.118,
    locationAccuracy: 5.0,
    primaryPhoto: { id: 'p3', url: 'https://images.unsplash.com/p3', category: 'arvore_inteira' },
    gallery: [{ id: 'g3', url: 'https://images.unsplash.com/g3', category: 'fruto' }],
    plantnet: { taxon: 'Mauritia flexuosa', score: 0.98 },
    group: 'groupB',
    collectedAt: '2026-09-20T12:00:00Z',
    verificationStatus: 'verificado',
    notes: 'Margem úmida do lago',
    isMock: true
  },
  {
    id: 'tree-04',
    displayNumber: null,
    popularName: 'Jatobá-da-Mata',
    scientificNameSuggested: 'Hymenaea courbaril',
    family: 'Fabaceae',
    confidence: 'baixa',
    latitude: null,
    longitude: null,
    locationAccuracy: null,
    primaryPhoto: null,
    gallery: [],
    plantnet: null,
    group: 'groupC',
    collectedAt: '2026-09-20T13:00:00Z',
    verificationStatus: 'pendente',
    notes: 'Aguardando coordenadas de GPS',
    isMock: true
  }
];

describe('SEARCH & FILTER ENGINE AUDIT', () => {
  it('normalizeSearchString() deve remover acentos, pontuações e colocar em caixa baixa', () => {
    expect(normalizeSearchString('Ipê-Amarelo')).toBe('ipe amarelo');
    expect(normalizeSearchString('CÂNDIDO RONDON')).toBe('candido rondon');
    expect(normalizeSearchString('   Mauritia flexuosa   ')).toBe('mauritia flexuosa');
    expect(normalizeSearchString('')).toBe('');
  });

  it('filterTrees() deve realizar busca insensível a acentos por múltiplos tokens', () => {
    // Busca sem acento para encontrar "Ipê"
    const res1 = filterTrees(sampleTrees, { searchQuery: 'ipe' });
    expect(res1.length).toBe(1);
    expect(res1[0].id).toBe('tree-01');

    // Busca por gênero científico
    const res2 = filterTrees(sampleTrees, { searchQuery: 'amburana' });
    expect(res2.length).toBe(1);
    expect(res2[0].id).toBe('tree-02');

    // Busca multi-token: "buriti arecaceae"
    const res3 = filterTrees(sampleTrees, { searchQuery: 'buriti arecaceae' });
    expect(res3.length).toBe(1);
    expect(res3[0].id).toBe('tree-03');

    // Busca por texto das anotações
    const res4 = filterTrees(sampleTrees, { searchQuery: 'trilha norte' });
    expect(res4.length).toBe(1);
    expect(res4[0].id).toBe('tree-01');
  });

  it('filterTrees() deve filtrar rigorosamente por família botânica', () => {
    const res = filterTrees(sampleTrees, { family: 'Fabaceae' });
    expect(res.length).toBe(2);
    expect(res.map((t) => t.id)).toEqual(['tree-02', 'tree-04']);

    const all = filterTrees(sampleTrees, { family: 'all' });
    expect(all.length).toBe(4);
  });

  it('filterTrees() deve filtrar por grupo de campo acadêmico', () => {
    const groupA = filterTrees(sampleTrees, { group: 'groupA' });
    expect(groupA.length).toBe(2);

    const groupB = filterTrees(sampleTrees, { group: 'groupB' });
    expect(groupB.length).toBe(1);

    const groupC = filterTrees(sampleTrees, { group: 'groupC' });
    expect(groupC.length).toBe(1);
  });

  it('filterTrees() deve filtrar por score mínimo do PlantNet e nível de confiança', () => {
    // Apenas árvores com score >= 0.90
    const highMatch = filterTrees(sampleTrees, { minPlantnetScore: 0.90 });
    expect(highMatch.length).toBe(2);
    expect(highMatch.map((t) => t.id)).toEqual(['tree-01', 'tree-03']);

    // Apenas confiança "alta"
    const highConf = filterTrees(sampleTrees, { confidence: 'alta' });
    expect(highConf.length).toBe(2);

    // Combinação: Grupo A + Confiança Média
    const combo = filterTrees(sampleTrees, { group: 'groupA', confidence: 'media' });
    expect(combo.length).toBe(1);
    expect(combo[0].id).toBe('tree-02');
  });

  it('filterTrees() deve suportar flags de apenas com fotos e apenas com coordenadas', () => {
    const withCoords = filterTrees(sampleTrees, { hasCoordinatesOnly: true });
    expect(withCoords.length).toBe(3); // tree-04 não possui coordenadas

    const withPhotos = filterTrees(sampleTrees, { hasPhotosOnly: true });
    expect(withPhotos.length).toBe(2); // tree-01 e tree-03 possuem fotos
  });

  it('calculateFacetedStats() deve gerar métricas multifacetadas exatas', () => {
    const stats = calculateFacetedStats(sampleTrees, sampleTrees.slice(0, 2));

    expect(stats.total).toBe(4);
    expect(stats.filteredTotal).toBe(2);
    expect(stats.byGroup.groupA).toBe(2);
    expect(stats.byGroup.groupB).toBe(1);
    expect(stats.byGroup.groupC).toBe(1);

    expect(stats.byStatus.verificado).toBe(2);
    expect(stats.byStatus.em_analise).toBe(1);
    expect(stats.byStatus.pendente).toBe(1);

    expect(stats.withCoordinatesCount).toBe(3);
    expect(stats.withPhotosCount).toBe(2);

    // Média do score: (0.95 + 0.72 + 0.98) / 3 = 0.8833
    expect(stats.averagePlantnetScore).toBeCloseTo(0.883, 2);

    // Família mais abundante deve ser Fabaceae (2 registros)
    expect(stats.families[0].name).toBe('Fabaceae');
    expect(stats.families[0].count).toBe(2);
  });

  it('getUniqueFamilies() e getGroupCounts() devem totalizar corretamente', () => {
    const families = getUniqueFamilies(sampleTrees);
    expect(families.length).toBe(3);
    expect(families.map((f) => f.name)).toEqual(['Arecaceae', 'Bignoniaceae', 'Fabaceae']);

    const groups = getGroupCounts(sampleTrees);
    expect(groups.groupA).toBe(2);
    expect(groups.groupB).toBe(1);
    expect(groups.groupC).toBe(1);
  });
});
