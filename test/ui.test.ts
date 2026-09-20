import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';
import { PARK_CONFIG } from '../lib/park-config';
import { getValidatedTrees } from '../lib/trees';

describe('UI & Cartografia — Helpers e Configuração de Interface', () => {
  it('cn() deve concatenar classes e resolver conflitos do Tailwind corretamente', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6');
    expect(cn('text-red-500', undefined, null, false && 'bg-blue-500', 'font-bold')).toBe(
      'text-red-500 font-bold'
    );
    expect(cn('w-full', { 'h-full': true, 'opacity-0': false })).toBe('w-full h-full');
  });

  it('PARK_CONFIG deve conter os 3 modos cartográficos exigidos com identificadores únicos', () => {
    expect(PARK_CONFIG.modes.length).toBe(3);
    const modeIds = PARK_CONFIG.modes.map((m) => m.id);
    expect(modeIds).toContain('satellite');
    expect(modeIds).toContain('planta');
    expect(modeIds).toContain('exploration');
  });

  it('PARK_CONFIG deve ter coordenadas válidas de Vilhena/RO', () => {
    const [lng, lat] = PARK_CONFIG.center;
    // Vilhena longitude ~ -60.1 e latitude ~ -12.7
    expect(lng).toBeLessThan(-60.0);
    expect(lng).toBeGreaterThan(-60.3);
    expect(lat).toBeLessThan(-12.5);
    expect(lat).toBeGreaterThan(-12.9);
  });

  it('Todos os grupos de campo devem possuir cores distintas e descrições válidas', () => {
    const groups = Object.values(PARK_CONFIG.fieldGroups);
    expect(groups.length).toBe(3);

    const colors = groups.map((g) => g.color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(3);

    groups.forEach((group) => {
      expect(group.name).toBeTruthy();
      expect(group.locationDescription).toBeTruthy();
      expect(group.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('As árvores devem conter informações completas para exibição nos componentes de UI migrados', () => {
    const trees = getValidatedTrees();
    trees.forEach((tree) => {
      expect(tree.popularName).toBeTruthy();
      expect(tree.scientificNameSuggested).toBeTruthy();
      expect(tree.family).toBeTruthy();
      expect(tree.group).toBeTruthy();
      expect(['alta', 'media', 'baixa', 'indeterminada']).toContain(tree.confidence);
      expect([
        'verificado',
        'em_analise',
        'identificacao_preliminar',
        'pendente',
        'rejeitado'
      ]).toContain(tree.verificationStatus);
    });
  });

  it('O formato de compartilhamento por URL deve compor parâmetros seguros ?tree=id', () => {
    const trees = getValidatedTrees();
    const tree = trees[0];
    const baseUrl = 'https://flora-parque-eco.vercel.app';
    const shareUrl = `${baseUrl}/?tree=${encodeURIComponent(tree.id)}`;
    
    const parsed = new URL(shareUrl);
    expect(parsed.searchParams.get('tree')).toBe(tree.id);
    expect(parsed.searchParams.get('tree')).toBe('mock-tree-001');
  });
});
