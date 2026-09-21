import { describe, it, expect, beforeEach } from 'vitest';
import {
  TreeCatalogItemSchema,
  TreeCatalogItem,
  treeToCatalogItem,
  catalogItemToTree
} from '@/lib/tree-schema';
import {
  useTreeStore,
  selectTotalTrees,
  selectUniqueSpecies,
  selectFamilyCounts
} from '@/lib/store/tree-store';

describe('FASE 1: INFRAESTRUTURA DE DADOS E ESTADO (O CÉREBRO)', () => {
  beforeEach(() => {
    useTreeStore.getState().initializeTrees();
  });

  it('TreeCatalogItemSchema deve validar modelo estrito com collectionGroup, verificationStatus e plantNetData', () => {
    const item: TreeCatalogItem = {
      id: 'tree-brain-01',
      coordinates: { lat: -12.7044, lng: -60.1189 },
      popularName: 'Castanheira-do-Brasil',
      scientificName: 'Bertholletia excelsa',
      family: 'Lecythidaceae',
      collectionGroup: 'ESQUERDA_LAGO',
      verificationStatus: 'verificado',
      plantNetData: {
        score: 0.96,
        plantnetUrl: 'https://identify.plantnet.org/species/bertholletia-excelsa',
        status: 'CONFIRMADO'
      },
      gallery: [
        {
          id: 'photo-1',
          url: 'https://images.unsplash.com/castanheira-inteira',
          type: 'ARVORE_INTEIRA'
        },
        {
          id: 'photo-2',
          url: 'https://images.unsplash.com/castanheira-folha',
          type: 'FOLHA'
        },
        {
          id: 'photo-3',
          url: 'https://images.unsplash.com/castanheira-casca',
          type: 'CASCA'
        },
        {
          id: 'photo-4',
          url: 'https://images.unsplash.com/castanheira-fruto',
          type: 'FRUTO'
        }
      ]
    };

    const parsed = TreeCatalogItemSchema.safeParse(item);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.collectionGroup).toBe('ESQUERDA_LAGO');
      expect(parsed.data.verificationStatus).toBe('verificado');
      expect(parsed.data.plantNetData?.score).toBe(0.96);
      expect(parsed.data.gallery.length).toBe(4);
    }
  });

  it('treeToCatalogItem e catalogItemToTree devem mapear bidirecionalmente mantendo atributos de Phase 1', () => {
    const state = useTreeStore.getState();
    const tree = state.trees[0];
    const catalogItem = treeToCatalogItem(tree);

    expect(catalogItem.id).toBe(tree.id);
    expect(catalogItem.popularName).toBe(tree.popularName);
    expect(catalogItem.collectionGroup).toBeDefined();
    expect(catalogItem.verificationStatus).toBe(tree.verificationStatus);

    const convertedBack = catalogItemToTree(catalogItem);
    expect(convertedBack.id).toBe(tree.id);
    expect(convertedBack.popularName).toBe(tree.popularName);
  });

  it('initializeTrees() deve inicializar ou redefinir o catálogo na store', () => {
    const store = useTreeStore.getState();
    expect(store.trees.length).toBeGreaterThan(0);

    const customItems: TreeCatalogItem[] = [
      {
        id: 'custom-tree-01',
        coordinates: { lat: -12.705, lng: -60.119 },
        popularName: 'Jatobá da Amazônia',
        scientificName: 'Hymenaea courbaril',
        family: 'Fabaceae',
        collectionGroup: 'DIREITA_LAGO',
        verificationStatus: 'verificado',
        gallery: []
      }
    ];

    useTreeStore.getState().initializeTrees(customItems);
    const updatedState = useTreeStore.getState();
    expect(updatedState.trees.length).toBe(1);
    expect(updatedState.trees[0].id).toBe('custom-tree-01');
    expect(updatedState.trees[0].group).toBe('groupC');

    // Reset sem argumentos
    useTreeStore.getState().initializeTrees();
    expect(useTreeStore.getState().trees.length).toBeGreaterThanOrEqual(5);
  });

  it('selectTotalTrees, selectUniqueSpecies e selectFamilyCounts devem calcular métricas em tempo real', () => {
    const state = useTreeStore.getState();
    const total = selectTotalTrees(state);
    const uniqueSpecies = selectUniqueSpecies(state);
    const familyCounts = selectFamilyCounts(state);

    expect(total).toBe(state.trees.length);
    expect(uniqueSpecies).toBeGreaterThan(0);
    expect(typeof familyCounts).toBe('object');

    const totalFromFamilies = Object.values(familyCounts).reduce((acc, c) => acc + c, 0);
    expect(totalFromFamilies).toBe(total);
  });
});
