import { describe, it, expect, beforeEach } from 'vitest';
import { useTreeStore } from '../lib/store/tree-store';
import { filterTrees } from '../lib/filters';

describe('ZUSTAND GLOBAL STATE STORE AUDIT', () => {
  beforeEach(() => {
    // Reseta estado para garantir isolamento entre testes
    useTreeStore.getState().resetFilters();
    useTreeStore.getState().selectTree(null);
    useTreeStore.getState().setActiveNav('mapa');
    useTreeStore.getState().setLayerMode('planta');
  });

  it('deve inicializar com árvores validadas e estado padrão consistente', () => {
    const state = useTreeStore.getState();
    expect(state.trees.length).toBeGreaterThan(0);
    expect(state.selectedTreeId).toBeNull();
    expect(state.activeNav).toBe('mapa');
    expect(state.layerMode).toBe('planta');
    expect(state.filters.group).toBe('all');
    expect(state.filters.family).toBe('all');
    expect(state.isSearchOpen).toBe(false);
  });

  it('selectTree() e selectTreeAndFocus() devem atualizar a seleção e incrementar focusKey', () => {
    const firstTree = useTreeStore.getState().trees[0];
    expect(firstTree).toBeDefined();

    // Seleciona por ID
    useTreeStore.getState().selectTree(firstTree.id);
    expect(useTreeStore.getState().selectedTreeId).toBe(firstTree.id);

    // Deseleciona
    useTreeStore.getState().selectTree(null);
    expect(useTreeStore.getState().selectedTreeId).toBeNull();

    // Seleciona e foca
    const initialFocusKey = useTreeStore.getState().focusKey;
    useTreeStore.getState().selectTreeAndFocus(firstTree);
    expect(useTreeStore.getState().selectedTreeId).toBe(firstTree.id);
    expect(useTreeStore.getState().focusKey).toBe(initialFocusKey + 1);
    expect(useTreeStore.getState().activeNav).toBe('mapa');
  });

  it('ações de filtro devem atualizar os critérios de busca reativamente', () => {
    useTreeStore.getState().setSearchQuery('ipe');
    expect(useTreeStore.getState().filters.searchQuery).toBe('ipe');

    useTreeStore.getState().setGroupFilter('groupB');
    expect(useTreeStore.getState().filters.group).toBe('groupB');

    useTreeStore.getState().setFamilyFilter('Bignoniaceae');
    expect(useTreeStore.getState().filters.family).toBe('Bignoniaceae');

    useTreeStore.getState().setConfidenceFilter('alta');
    expect(useTreeStore.getState().filters.confidence).toBe('alta');

    useTreeStore.getState().setMinPlantnetScore(0.85);
    expect(useTreeStore.getState().filters.minPlantnetScore).toBe(0.85);

    useTreeStore.getState().setVerificationStatusFilter('verificado');
    expect(useTreeStore.getState().filters.verificationStatus).toBe('verificado');

    // Reset de filtros
    useTreeStore.getState().resetFilters();
    expect(useTreeStore.getState().filters.searchQuery).toBe('');
    expect(useTreeStore.getState().filters.group).toBe('all');
    expect(useTreeStore.getState().filters.family).toBe('all');
  });

  it('controle de modais e navegação deve alternar estados booleanos', () => {
    useTreeStore.getState().setSearchOpen(true);
    expect(useTreeStore.getState().isSearchOpen).toBe(true);
    useTreeStore.getState().setSearchOpen(false);
    expect(useTreeStore.getState().isSearchOpen).toBe(false);

    useTreeStore.getState().setLegendOpen(true);
    expect(useTreeStore.getState().isLegendOpen).toBe(true);

    useTreeStore.getState().setStatsOpen(true);
    expect(useTreeStore.getState().isStatsOpen).toBe(true);

    useTreeStore.getState().setActiveNav('especies');
    expect(useTreeStore.getState().activeNav).toBe('especies');

    useTreeStore.getState().setLayerMode('satellite');
    expect(useTreeStore.getState().layerMode).toBe('satellite');
  });

  it('importData() deve ingerir novos registros diretamente para o estado global', () => {
    const initialCount = useTreeStore.getState().trees.length;

    const newTreeCsv = `id,popularName,scientificNameSuggested,family,group\ntree-store-import-01,Tatajuba,Bagassa guianensis,Moraceae,Grupo A`;
    const res = useTreeStore.getState().importData(newTreeCsv);

    expect(res.success).toBe(true);
    expect(res.importedCount).toBe(1);

    const updatedTrees = useTreeStore.getState().trees;
    expect(updatedTrees.length).toBe(initialCount + 1);
    expect(updatedTrees.some((t) => t.id === 'tree-store-import-01')).toBe(true);
  });
});
