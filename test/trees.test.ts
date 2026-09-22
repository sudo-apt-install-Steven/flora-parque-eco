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
    expect(rawTrees.length).toBe(33);
    rawTrees.forEach((tree) => {
      const parsed = TreeSchema.safeParse(tree);
      expect(parsed.success).toBe(true);
    });
  });

  it('REGRA ABSOLUTA: displayNumber deve inicialmente ser null em todas as árvores', () => {
    const trees = getValidatedTrees();
    expect(trees.length).toBe(33);
    trees.forEach((tree) => {
      expect(tree.displayNumber).toBeNull();
    });
  });

  it('cada árvore deve possuir um ID estável e identificação explícita de catálogo real', () => {
    const trees = getValidatedTrees();
    const ids = trees.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);

    trees.forEach((tree) => {
      expect(tree.isMock).toBe(false);
      expect(tree.popularName).toBeTruthy();
    });
  });

  it('deve suportar os três grupos de campo acadêmicos (groupA, groupB, groupC)', () => {
    const groupA = getTreesByGroup('groupA');
    const groupB = getTreesByGroup('groupB');
    const groupC = getTreesByGroup('groupC');

    expect(groupA.length).toBe(5);
    expect(groupB.length).toBe(15);
    expect(groupC.length).toBe(13);
    expect(groupA.length + groupB.length + groupC.length).toBe(33);
  });

  it('a busca deve filtrar corretamente por nome popular, científico, família e grupo', () => {
    const byPopular = searchTrees('Jacarandá');
    expect(byPopular.length).toBe(5);
    expect(byPopular[0].id).toBe('tree-a-02-jacaranda');

    const byFamily = searchTrees('Fabaceae');
    expect(byFamily.length).toBe(3); // Guapuruvu, Árvore Quiosque, Árvore Fim Trilha, etc.

    const byGroupA = searchTrees('', 'groupA');
    expect(byGroupA.length).toBe(5);

    const byGroupB = searchTrees('', 'groupB');
    expect(byGroupB.length).toBe(15);
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
