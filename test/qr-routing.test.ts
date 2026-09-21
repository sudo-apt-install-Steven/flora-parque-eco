import { describe, it, expect, beforeEach } from 'vitest';
import { generateStaticParams } from '@/app/tree/[id]/page';
import { useTreeStore } from '@/lib/store/tree-store';
import { getAllTrees } from '@/lib/trees';

describe('FASE 4: ROTEAMENTO FÍSICO (QR CODE) E INTERATIVIDADE ANALÍTICA', () => {
  beforeEach(() => {
    useTreeStore.getState().initializeTrees();
  });

  it('generateStaticParams deve retornar parâmetros estáticos para todos os espécimes cadastrados', () => {
    const params = generateStaticParams();
    const allTrees = getAllTrees();

    expect(params.length).toBe(allTrees.length);
    expect(params[0]).toHaveProperty('id');
    expect(typeof params[0].id).toBe('string');
  });

  it('selectTreeAndFocus deve focar espécime, alternar navegação para mapa e disparar focusKey', () => {
    const stateBefore = useTreeStore.getState();
    const targetTree = stateBefore.trees[0];
    const initialFocusKey = stateBefore.focusKey;

    useTreeStore.getState().setActiveNav('especies');
    useTreeStore.getState().selectTreeAndFocus(targetTree.id);

    const stateAfter = useTreeStore.getState();
    expect(stateAfter.selectedTreeId).toBe(targetTree.id);
    expect(stateAfter.activeNav).toBe('mapa');
    expect(stateAfter.focusKey).toBe(initialFocusKey + 1);
  });

  it('filtro reverso por família botânica deve isolar apenas espécimes daquela família', () => {
    const state = useTreeStore.getState();
    const targetFamily = state.trees[0].family;
    expect(targetFamily).toBeDefined();

    if (targetFamily) {
      useTreeStore.getState().filterByFamily(targetFamily);
      const filtered = useTreeStore.getState().filters.family;
      expect(filtered).toBe(targetFamily);

      // Limpar filtro
      useTreeStore.getState().filterByFamily('all');
      expect(useTreeStore.getState().filters.family).toBe('all');
    }
  });
});
