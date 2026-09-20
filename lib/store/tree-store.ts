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
  IngestionResult
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
  setLayerMode: (mode: LayerMode) => void;
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
  selectedTreeId: null,
  focusKey: 0,
  activeNav: 'mapa',
  layerMode: 'planta',
  filters: DEFAULT_FILTERS,
  isSearchOpen: false,
  isLegendOpen: false,
  isStatsOpen: false,

  setTrees: (trees) => set({ trees }),

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
    const result = ingestTreeRecords(rawInput, options);
    if (result.success && result.data.length > 0) {
      set((state) => ({
        trees: [...state.trees, ...result.data]
      }));
    }
    return result;
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
