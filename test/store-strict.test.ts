import { describe, it, expect, beforeEach } from 'vitest';
import { useTreeStore, useCatalogStatus } from '@/lib/store/tree-store';
import { TreeCatalogItem } from '@/lib/tree-schema';

describe('FASE 4: GERENCIAMENTO DE ESTADO GLOBAL (STATE STORE & ACTIONS ESTRITAS)', () => {
  beforeEach(() => {
    useTreeStore.getState().resetFilters();
    useTreeStore.getState().selectTree(null);
    useTreeStore.getState().setActiveNav('mapa');
    useTreeStore.getState().setLayerMode('planta');
    useTreeStore.getState().setIsLoading(false);
    useTreeStore.getState().setHasError(false, null);
  });

  it('initializeCatalog() deve carregar lista de TreeCatalogItem e normalizar para Tree', () => {
    const rawItems: TreeCatalogItem[] = [
      {
        id: 'catalog-item-01',
        coordinates: { lat: -12.7044, lng: -60.1189 },
        popularName: 'Cerejeira',
        scientificName: 'Amburana acreana',
        family: 'Fabaceae',
        collection: {
          collectionGroup: 'DIREITA_LAGO',
          collectedAt: '2026-09-20T14:00:00Z'
        },
        gallery: []
      }
    ];

    useTreeStore.getState().initializeCatalog(rawItems);

    const state = useTreeStore.getState();
    expect(state.trees.length).toBe(1);
    expect(state.trees[0].id).toBe('catalog-item-01');
    expect(state.trees[0].latitude).toBe(-12.7044);
    expect(state.trees[0].longitude).toBe(-60.1189);
    expect(state.trees[0].group).toBe('groupC'); // DIREITA_LAGO mapeado para groupC
    expect(state.hasError).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('initializeCatalog() deve capturar entradas inválidas e setar hasError', () => {
    // Passa algo que não é um array
    // @ts-expect-error teste de entrada malformada
    useTreeStore.getState().initializeCatalog('not-an-array');

    let state = useTreeStore.getState();
    expect(state.hasError).toBe(true);
    expect(state.errorMessage).toContain('esperado um array');

    // Passa array com objeto corrompido sem campos obrigatórios
    // @ts-expect-error teste de objeto inválido
    useTreeStore.getState().initializeCatalog([{ id: 'bad-tree', invalidField: 123 }]);
    state = useTreeStore.getState();
    expect(state.hasError).toBe(true);
    expect(state.errorMessage).toContain('inválido no schema');
  });

  it('setLayerMode() deve alternar estritamente entre satellite, planta e exploration', () => {
    useTreeStore.getState().setLayerMode('satellite');
    expect(useTreeStore.getState().layerMode).toBe('satellite');

    useTreeStore.getState().setLayerMode('exploration');
    expect(useTreeStore.getState().layerMode).toBe('exploration');

    useTreeStore.getState().setLayerMode('planta');
    expect(useTreeStore.getState().layerMode).toBe('planta');
  });

  it('focusTree(id) deve focar o espécime, mudar para navegação mapa e incrementar focusKey', () => {
    const initialKey = useTreeStore.getState().focusKey;

    useTreeStore.getState().setActiveNav('especies');
    useTreeStore.getState().focusTree('mock-tree-001');

    const state = useTreeStore.getState();
    expect(state.selectedTreeId).toBe('mock-tree-001');
    expect(state.activeNav).toBe('mapa');
    expect(state.focusKey).toBe(initialKey + 1);

    // focusTree(null) deseleciona
    useTreeStore.getState().focusTree(null);
    expect(useTreeStore.getState().selectedTreeId).toBeNull();
  });

  it('filterByFamily(family) deve aplicar filtro taxonômico no estado global', () => {
    useTreeStore.getState().filterByFamily('Bignoniaceae');
    expect(useTreeStore.getState().filters.family).toBe('Bignoniaceae');

    useTreeStore.getState().filterByFamily('all');
    expect(useTreeStore.getState().filters.family).toBe('all');
  });

  it('filterByGroup(group) deve suportar tanto ENUMs acadêmicos quanto de campo', () => {
    // Grupo acadêmico ESQUERDA_LAGO (deve abranger tanto groupA quanto groupB)
    useTreeStore.getState().filterByGroup('ESQUERDA_LAGO');
    expect(useTreeStore.getState().filters.collectionGroup).toBe('ESQUERDA_LAGO');

    // Grupo acadêmico DIREITA_LAGO (abrange groupC)
    useTreeStore.getState().filterByGroup('DIREITA_LAGO');
    expect(useTreeStore.getState().filters.collectionGroup).toBe('DIREITA_LAGO');

    // Grupo de campo direto
    useTreeStore.getState().filterByGroup('groupB');
    expect(useTreeStore.getState().filters.group).toBe('groupB');
    expect(useTreeStore.getState().filters.collectionGroup).toBe('all');

    // 'all'
    useTreeStore.getState().filterByGroup('all');
    expect(useTreeStore.getState().filters.group).toBe('all');
    expect(useTreeStore.getState().filters.collectionGroup).toBe('all');
  });

  it('isLoading e hasError devem reagir em falhas de ingestão', () => {
    // Ingestão com payload com erro severo
    useTreeStore.getState().importData('{ invalid json');

    const state = useTreeStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.hasError).toBe(true);
    expect(state.errorMessage).toBeDefined();

    // Reset do erro
    useTreeStore.getState().setHasError(false, null);
    expect(useTreeStore.getState().hasError).toBe(false);
    expect(useTreeStore.getState().errorMessage).toBeNull();
  });
});
