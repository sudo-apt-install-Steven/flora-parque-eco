import { describe, it, expect } from 'vitest';
import rawTrees from '../data/mock-trees.json';
import { TreeSchema } from '../lib/tree-schema';
import {
  getValidatedTrees,
  getTreeById,
  getTreesByGroup,
  searchTrees,
  treesToGeoJSON
} from '../lib/trees';

describe('Inventário Arbóreo — Validação de Dados e Regras de Negócio', () => {
  it('todos os espécimes no mock-trees.json devem satisfazer rigorosamente o TreeSchema', () => {
    expect(rawTrees.length).toBeGreaterThan(0);
    rawTrees.forEach((tree) => {
      const parsed = TreeSchema.safeParse(tree);
      expect(parsed.success).toBe(true);
    });
  });

  it('REGRA ABSOLUTA: displayNumber deve inicialmente ser null em todas as árvores', () => {
    const trees = getValidatedTrees();
    trees.forEach((tree) => {
      expect(tree.displayNumber).toBeNull();
    });
  });

  it('cada árvore deve possuir um ID estável e identificação explícita de mock acadêmico', () => {
    const trees = getValidatedTrees();
    const ids = trees.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);

    trees.forEach((tree) => {
      expect(tree.isMock).toBe(true);
      expect(tree.popularName).toContain('[MOCK]');
    });
  });

  it('deve suportar os três grupos de campo acadêmicos (groupA, groupB, groupC)', () => {
    const groupA = getTreesByGroup('groupA');
    const groupB = getTreesByGroup('groupB');
    const groupC = getTreesByGroup('groupC');

    expect(groupA.length).toBeGreaterThan(0);
    expect(groupB.length).toBeGreaterThan(0);
    expect(groupC.length).toBeGreaterThan(0);
  });

  it('a busca deve filtrar corretamente por nome popular, científico e família', () => {
    const byPopular = searchTrees('Ipê');
    expect(byPopular.length).toBe(1);
    expect(byPopular[0].id).toBe('mock-tree-001');

    const byFamily = searchTrees('Fabaceae');
    expect(byFamily.length).toBe(2);

    const byGroup = searchTrees('', 'groupA');
    expect(byGroup.length).toBe(2);
  });

  it('a conversão para GeoJSON deve gerar Point features válidas com propriedades achatadas', () => {
    const trees = getValidatedTrees();
    const geojson = treesToGeoJSON(trees);

    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.features.length).toBe(trees.length);

    geojson.features.forEach((feature) => {
      expect(feature.type).toBe('Feature');
      expect(feature.geometry.type).toBe('Point');
      expect(feature.geometry.coordinates.length).toBe(2);
      expect(typeof feature.geometry.coordinates[0]).toBe('number'); // lng
      expect(typeof feature.geometry.coordinates[1]).toBe('number'); // lat
      expect(feature.properties?.id).toBeDefined();
    });
  });
});
