import { create } from 'zustand';
import {
  Tree,
  FieldGroup,
  VerificationStatus,
  TreeConfidence,
  TreeFilterCriteria,
  TreeFacetedStats,
  SafeTree,
  IngestionOptions,
  IngestionResult,
  TreeCatalogItem,
  catalogItemToTree,
  CollectionGroup,
  TreeCatalogItemSchema,
  TreeSchema
} from '@/lib/tree-schema';
import { filterTrees, calculateFacetedStats, getUniqueFamilies } from '@/lib/filters';
import { getSafeTree } from '@/lib/fallbacks';
import { ingestTreeRecords } from '@/lib/ingestion/pipeline';
import rawInitialTrees from '@/data/mock-trees.json';

export type NavSection = 'mapa' | 'especies' | 'dados' | 'projeto';
export type LayerMode = 'satellite' | 'planta' | 'exploration';

/**
 * Estado completo do catálogo de árvores e da experiência cartográfica
 */
export interface TreeState {
  // Catálogo completo
  trees: Tree[];

  // Estados de Carregamento e Ingestão
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;

  // Seleção e Navegação Cartográfica
  selectedTreeId: string | null;
  focusKey: number;

  // Visualização e Camadas
  activeNav: NavSection;
  layerMode: LayerMode;

  // Filtros Avançados
  filters: TreeFilterCriteria;

  // Modais e Popovers
  isSearchOpen: boolean;
  isLegendOpen: boolean;
  isStatsOpen: boolean;

  // Ações Estritas da Fase 1 e 4
  initializeTrees: (data?: (Tree | TreeCatalogItem)[]) => void;
  initializeCatalog: (data: (Tree | TreeCatalogItem)[]) => void;
  setLayerMode: (mode: LayerMode) => void;
  focusTree: (id: string | null) => void;
  filterByFamily: (family: string | 'all') => void;
  filterByGroup: (group: FieldGroup | CollectionGroup | 'all') => void;

  // Controle de Carregamento / Erro
  setIsLoading: (isLoading: boolean) => void;
  setHasError: (hasError: boolean, errorMessage?: string | null) => void;

  // Ações de Modificação
  setTrees: (trees: Tree[]) => void;
  selectTree: (treeOrId: Tree | string | null) => void;
  selectTreeAndFocus: (treeOrId: Tree | string | null) => void;
  triggerFocus: (treeId?: string) => void;

  // Ações de Filtragem
  setSearchQuery: (query: string) => void;
  setGroupFilter: (group: FieldGroup | 'all') => void;
  setFamilyFilter: (family: string | 'all') => void;
  setConfidenceFilter: (confidence: TreeConfidence | 'all') => void;
  setMinPlantnetScore: (minScore: number) => void;
  setVerificationStatusFilter: (status: VerificationStatus | 'all') => void;
  setFilters: (filters: Partial<TreeFilterCriteria>) => void;
  resetFilters: () => void;

  // Ações de Navegação e Modais
  setActiveNav: (nav: NavSection) => void;
  setSearchOpen: (open: boolean) => void;
  setLegendOpen: (open: boolean) => void;
  setStatsOpen: (open: boolean) => void;

  // Ingestão Dinâmica
  importData: (rawInput: unknown, options?: IngestionOptions) => IngestionResult;
}

/**
 * Filtros padrão iniciais
 */
const DEFAULT_FILTERS: TreeFilterCriteria = {
  searchQuery: '',
  group: 'all',
  family: 'all',
  confidence: 'all',
  minPlantnetScore: 0,
  verificationStatus: 'all',
  hasCoordinatesOnly: false,
  hasPhotosOnly: false
};

/**
 * Carregamento seguro dos dados iniciais validados
 */
function getInitialValidatedTrees(): Tree[] {
  try {
    const res = ingestTreeRecords(rawInitialTrees, { allowMockData: true });
    return res.data;
  } catch {
    return [];
  }
}

/**
 * Store global centralizado com Zustand
 */
export const useTreeStore = create<TreeState>((set, get) => ({
  trees: getInitialValidatedTrees(),
  isLoading: false,
  hasError: false,
  errorMessage: null,
  selectedTreeId: null,
  focusKey: 0,
  activeNav: 'mapa',
  layerMode: 'planta',
  filters: DEFAULT_FILTERS,
  isSearchOpen: false,
  isLegendOpen: false,
  isStatsOpen: false,

  setIsLoading: (isLoading) => set({ isLoading }),

  setHasError: (hasError, errorMessage = null) =>
    set({ hasError, errorMessage: hasError ? errorMessage : null }),

  initializeTrees: (data) => {
    if (data && Array.isArray(data)) {
      get().initializeCatalog(data);
    } else {
      set({
        trees: getInitialValidatedTrees(),
        isLoading: false,
        hasError: false,
        errorMessage: null
      });
    }
  },

  initializeCatalog: (data) => {
    try {
      if (!Array.isArray(data)) {
        set({
          hasError: true,
          errorMessage: 'Catálogo fornecido inválido: esperado um array de árvores',
          isLoading: false
        });
        return;
      }

      const normalized: Tree[] = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (!item || typeof item !== 'object') {
          set({
            hasError: true,
            errorMessage: `Item na posição ${i} é inválido: registro nulo ou não-objeto`,
            isLoading: false
          });
          return;
        }

        if ('coordinates' in item && item.coordinates) {
          const parsedCatalog = TreeCatalogItemSchema.safeParse(item);
          if (!parsedCatalog.success) {
            set({
              hasError: true,
              errorMessage: `Item na posição ${i} (${(item as { id?: string }).id || 'sem id'}) inválido no schema do catálogo: ${parsedCatalog.error.issues[0]?.message || 'dados inválidos'}`,
              isLoading: false
            });
            return;
          }
          normalized.push(catalogItemToTree(parsedCatalog.data));
        } else {
          const parsedTree = TreeSchema.safeParse(item);
          if (!parsedTree.success) {
            set({
              hasError: true,
              errorMessage: `Item na posição ${i} (${(item as { id?: string }).id || 'sem id'}) inválido no schema de árvore: ${parsedTree.error.issues[0]?.message || 'dados inválidos'}`,
              isLoading: false
            });
            return;
          }
          normalized.push(parsedTree.data);
        }
      }

      set((state) => {
        const stillSelected = state.selectedTreeId && normalized.some((t) => t.id === state.selectedTreeId);
        return {
          trees: normalized,
          selectedTreeId: stillSelected ? state.selectedTreeId : null,
          hasError: false,
          errorMessage: null,
          isLoading: false
        };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({
        hasError: true,
        errorMessage: `Falha ao inicializar catálogo: ${msg}`,
        isLoading: false
      });
    }
  },

  focusTree: (id) => {
    if (!id) {
      set({ selectedTreeId: null });
      return;
    }
    set((state) => ({
      selectedTreeId: id,
      activeNav: 'mapa',
      focusKey: state.focusKey + 1
    }));
  },

  filterByFamily: (family) =>
    set((state) => ({
      filters: { ...state.filters, family }
    })),

  filterByGroup: (group) => {
    if (group === 'ESQUERDA_LAGO' || group === 'DIREITA_LAGO' || group === 'OUTROS') {
      set((state) => ({
        filters: { ...state.filters, group: 'all', collectionGroup: group }
      }));
    } else {
      set((state) => ({
        filters: { ...state.filters, group, collectionGroup: 'all' }
      }));
    }
  },

  setTrees: (trees) => set({ trees, hasError: false, errorMessage: null }),

  selectTree: (treeOrId) => {
    if (!treeOrId) {
      set({ selectedTreeId: null });
      return;
    }
    const id = typeof treeOrId === 'string' ? treeOrId : treeOrId.id;
    set({ selectedTreeId: id });
  },

  selectTreeAndFocus: (treeOrId) => {
    if (!treeOrId) {
      set({ selectedTreeId: null });
      return;
    }
    const id = typeof treeOrId === 'string' ? treeOrId : treeOrId.id;
    set((state) => ({
      selectedTreeId: id,
      activeNav: 'mapa',
      focusKey: state.focusKey + 1
    }));
  },

  triggerFocus: (treeId) => {
    set((state) => ({
      selectedTreeId: treeId ?? state.selectedTreeId,
      activeNav: 'mapa',
      focusKey: state.focusKey + 1
    }));
  },

  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query }
    })),

  setGroupFilter: (group) =>
    set((state) => ({
      filters: { ...state.filters, group }
    })),

  setFamilyFilter: (family) =>
    set((state) => ({
      filters: { ...state.filters, family }
    })),

  setConfidenceFilter: (confidence) =>
    set((state) => ({
      filters: { ...state.filters, confidence }
    })),

  setMinPlantnetScore: (minScore) =>
    set((state) => ({
      filters: { ...state.filters, minPlantnetScore: minScore }
    })),

  setVerificationStatusFilter: (status) =>
    set((state) => ({
      filters: { ...state.filters, verificationStatus: status }
    })),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),

  resetFilters: () =>
    set({
      filters: DEFAULT_FILTERS
    }),

  setActiveNav: (nav) => set({ activeNav: nav }),

  setLayerMode: (mode) => set({ layerMode: mode }),

  setSearchOpen: (open) => set({ isSearchOpen: open }),

  setLegendOpen: (open) => set({ isLegendOpen: open }),

  setStatsOpen: (open) => set({ isStatsOpen: open }),

  importData: (rawInput, options) => {
    set({ isLoading: true });
    try {
      const result = ingestTreeRecords(rawInput, options);
      if (result.success && result.data.length > 0) {
        set((state) => ({
          trees: [...state.trees, ...result.data],
          isLoading: false,
          hasError: false,
          errorMessage: null
        }));
      } else if (!result.success || (result.failedCount > 0 && result.importedCount === 0)) {
        const errorMsg = result.errors[0]?.message || 'Erro durante a ingestão do catálogo de árvores';
        set({
          isLoading: false,
          hasError: true,
          errorMessage: errorMsg
        });
      } else {
        set({ isLoading: false });
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({
        isLoading: false,
        hasError: true,
        errorMessage: msg
      });
      return {
        success: false,
        totalProcessed: 0,
        importedCount: 0,
        failedCount: 1,
        data: [],
        errors: [{ index: 0, message: msg }],
        warnings: []
      };
    }
  }
}));

// ----------------------------------------------------------------------
// SELECTORS & CONVENIENCE HOOKS
// ----------------------------------------------------------------------

/**
 * Hook para obter a árvore ativa selecionada e sua versão blindada SafeTree
 */
export function useActiveTree(): {
  selectedTree: Tree | null;
  safeSelectedTree: SafeTree | null;
  selectedTreeId: string | null;
  selectTree: (treeOrId: Tree | string | null) => void;
  selectTreeAndFocus: (treeOrId: Tree | string | null) => void;
  triggerFocus: () => void;
} {
  const trees = useTreeStore((state) => state.trees);
  const selectedTreeId = useTreeStore((state) => state.selectedTreeId);
  const selectTree = useTreeStore((state) => state.selectTree);
  const selectTreeAndFocus = useTreeStore((state) => state.selectTreeAndFocus);
  const triggerFocus = useTreeStore((state) => state.triggerFocus);

  const selectedTree = trees.find((t) => t.id === selectedTreeId) || null;
  const safeSelectedTree = selectedTree ? getSafeTree(selectedTree) : null;

  return {
    selectedTree,
    safeSelectedTree,
    selectedTreeId,
    selectTree,
    selectTreeAndFocus,
    triggerFocus
  };
}

/**
 * Hook para obter o catálogo filtrado e métricas correspondentes
 */
export function useFilteredCatalog(): {
  allTrees: Tree[];
  filteredTrees: Tree[];
  stats: TreeFacetedStats;
  families: Array<{ name: string; count: number }>;
  filters: TreeFilterCriteria;
} {
  const allTrees = useTreeStore((state) => state.trees);
  const filters = useTreeStore((state) => state.filters);

  const filteredTrees = filterTrees(allTrees, filters);
  const stats = calculateFacetedStats(allTrees, filteredTrees);
  const families = getUniqueFamilies(allTrees);

  return {
    allTrees,
    filteredTrees,
    stats,
    families,
    filters
  };
}

/**
 * Hook para ações de filtragem
 */
export function useFilterActions(): {
  filters: TreeFilterCriteria;
  setSearchQuery: (q: string) => void;
  setGroupFilter: (group: FieldGroup | 'all') => void;
  setFamilyFilter: (family: string | 'all') => void;
  setConfidenceFilter: (conf: TreeConfidence | 'all') => void;
  setMinPlantnetScore: (score: number) => void;
  setVerificationStatusFilter: (status: VerificationStatus | 'all') => void;
  resetFilters: () => void;
} {
  const filters = useTreeStore((state) => state.filters);
  const setSearchQuery = useTreeStore((state) => state.setSearchQuery);
  const setGroupFilter = useTreeStore((state) => state.setGroupFilter);
  const setFamilyFilter = useTreeStore((state) => state.setFamilyFilter);
  const setConfidenceFilter = useTreeStore((state) => state.setConfidenceFilter);
  const setMinPlantnetScore = useTreeStore((state) => state.setMinPlantnetScore);
  const setVerificationStatusFilter = useTreeStore((state) => state.setVerificationStatusFilter);
  const resetFilters = useTreeStore((state) => state.resetFilters);

  return {
    filters,
    setSearchQuery,
    setGroupFilter,
    setFamilyFilter,
    setConfidenceFilter,
    setMinPlantnetScore,
    setVerificationStatusFilter,
    resetFilters
  };
}

/**
 * Hook para monitorar estado de carregamento e eventuais falhas de ingestão
 */
export function useCatalogStatus(): {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  setIsLoading: (loading: boolean) => void;
  setHasError: (hasError: boolean, msg?: string | null) => void;
} {
  const isLoading = useTreeStore((s) => s.isLoading);
  const hasError = useTreeStore((s) => s.hasError);
  const errorMessage = useTreeStore((s) => s.errorMessage);
  const setIsLoading = useTreeStore((s) => s.setIsLoading);
  const setHasError = useTreeStore((s) => s.setHasError);

  return {
    isLoading,
    hasError,
    errorMessage,
    setIsLoading,
    setHasError
  };
}

/**
 * Seletor para o total de árvores registradas no catálogo
 */
export const selectTotalTrees = (state: TreeState): number => state.trees.length;
export function useTotalTrees(): number {
  return useTreeStore(selectTotalTrees);
}

/**
 * Seletor para o número de espécies botânicas únicas
 */
export const selectUniqueSpecies = (state: TreeState): number => {
  const species = new Set(
    state.trees
      .map((t) => t.scientificNameSuggested || t.popularName)
      .filter((name): name is string => Boolean(name && name.trim()))
  );
  return species.size;
};
export function useUniqueSpecies(): number {
  return useTreeStore(selectUniqueSpecies);
}

/**
 * Seletor para contagem de espécimes agrupados por família botânica
 */
export const selectFamilyCounts = (state: TreeState): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const tree of state.trees) {
    const family = tree.family?.trim() || 'Indeterminada';
    counts[family] = (counts[family] || 0) + 1;
  }
  return counts;
};
export function useFamilyCounts(): Record<string, number> {
  return useTreeStore(selectFamilyCounts);
}


