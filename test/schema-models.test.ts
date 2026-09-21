import { describe, it, expect } from 'vitest';
import {
  TreeCatalogItemSchema,
  PlantNetDataSchema,
  CollectionDataSchema,
  MediaGallerySchema,
  treeToCatalogItem,
  catalogItemToTree,
  Tree,
  TreeCatalogItem
} from '@/lib/tree-schema';

describe('FASE 2: MODELAGEM RIGOROSA DE DADOS (TYPESCRIPT & ZOD)', () => {
  it('deve validar com sucesso um TreeCatalogItem completo e estrito', () => {
    const validItem: TreeCatalogItem = {
      id: 'tree-item-vilhena-001',
      coordinates: {
        lat: -12.7044,
        lng: -60.1189
      },
      scientificName: 'Handroanthus serratifolius',
      popularName: 'Ipê Amarelo',
      family: 'Bignoniaceae',
      plantnet: {
        score: 0.942,
        plantnetUrl: 'https://identify.plantnet.org/species/12345',
        status: 'CONFIRMADO'
      },
      collection: {
        collectionGroup: 'ESQUERDA_LAGO',
        collectedAt: '2026-09-20T10:30:00.000Z',
        collectorName: 'Equipe de Campo IFRO'
      },
      gallery: [
        {
          id: 'photo-01',
          url: 'https://images.unsplash.com/photo-ipe-arvore',
          type: 'ARVORE_INTEIRA',
          caption: 'Vista frontal'
        },
        {
          id: 'photo-02',
          url: 'https://images.unsplash.com/photo-ipe-folha',
          type: 'FOLHA',
          caption: 'Folhas compostas digitadas'
        },
        {
          id: 'photo-03',
          url: 'https://images.unsplash.com/photo-ipe-fruto',
          type: 'FRUTO'
        },
        {
          id: 'photo-04',
          url: 'https://images.unsplash.com/photo-ipe-casca',
          type: 'CASCA'
        },
        {
          id: 'photo-05',
          url: 'https://images.unsplash.com/photo-ipe-tronco',
          type: 'TRONCO'
        }
      ]
    };

    const parsed = TreeCatalogItemSchema.parse(validItem);
    expect(parsed.id).toBe('tree-item-vilhena-001');
    expect(parsed.coordinates.lat).toBe(-12.7044);
    expect(parsed.coordinates.lng).toBe(-60.1189);
    expect(parsed.scientificName).toBe('Handroanthus serratifolius');
    expect(parsed.popularName).toBe('Ipê Amarelo');
    expect(parsed.family).toBe('Bignoniaceae');
    expect(parsed.plantnet?.status).toBe('CONFIRMADO');
    expect(parsed.plantnet?.score).toBe(0.942);
    expect(parsed.collection?.collectionGroup).toBe('ESQUERDA_LAGO');
    expect(parsed.gallery.length).toBe(5);
  });

  it('deve aceitar scientificName e family nulos conforme especificação', () => {
    const itemWithNulls: TreeCatalogItem = {
      id: 'tree-unknown-002',
      coordinates: {
        lat: -12.705,
        lng: -60.119
      },
      scientificName: null,
      popularName: 'Árvore não identificada',
      family: null,
      plantnet: null,
      gallery: []
    };

    const parsed = TreeCatalogItemSchema.parse(itemWithNulls);
    expect(parsed.scientificName).toBeNull();
    expect(parsed.family).toBeNull();
    expect(parsed.plantnet).toBeNull();
  });

  it('deve rejeitar coordenadas inválidas fora dos limites WGS84', () => {
    const invalidCoords = {
      id: 'bad-coords',
      coordinates: {
        lat: 95.0, // Inválido (> 90)
        lng: -60.0
      },
      scientificName: null,
      popularName: 'Teste',
      family: null,
      gallery: []
    };

    expect(() => TreeCatalogItemSchema.parse(invalidCoords)).toThrow();

    const invalidLng = {
      id: 'bad-lng',
      coordinates: {
        lat: -12.0,
        lng: 200.0 // Inválido (> 180)
      },
      scientificName: null,
      popularName: 'Teste',
      family: null,
      gallery: []
    };

    expect(() => TreeCatalogItemSchema.parse(invalidLng)).toThrow();
  });

  it('PlantNetData deve rejeitar status não pertencente ao ENUM estrito', () => {
    const invalidStatus = {
      score: 0.8,
      status: 'STATUS_INVENTADO'
    };

    expect(() => PlantNetDataSchema.parse(invalidStatus)).toThrow();
  });

  it('CollectionData deve validar estritamente o ENUM de grupos de campo', () => {
    expect(() =>
      CollectionDataSchema.parse({
        collectionGroup: 'ESQUERDA_LAGO',
        collectedAt: '2026-09-20'
      })
    ).not.toThrow();

    expect(() =>
      CollectionDataSchema.parse({
        collectionGroup: 'DIREITA_LAGO',
        collectedAt: '2026-09-20'
      })
    ).not.toThrow();

    expect(() =>
      CollectionDataSchema.parse({
        collectionGroup: 'OUTROS',
        collectedAt: '2026-09-20'
      })
    ).not.toThrow();

    expect(() =>
      CollectionDataSchema.parse({
        collectionGroup: 'GRUPO_INEXISTENTE',
        collectedAt: '2026-09-20'
      })
    ).toThrow();
  });

  it('MediaGallery deve validar os 5 tipos canônicos de foto botânica', () => {
    const gallery = [
      { id: '1', url: '/p1.jpg', type: 'ARVORE_INTEIRA' },
      { id: '2', url: '/p2.jpg', type: 'FOLHA' },
      { id: '3', url: '/p3.jpg', type: 'FRUTO' },
      { id: '4', url: '/p4.jpg', type: 'CASCA' },
      { id: '5', url: '/p5.jpg', type: 'TRONCO' }
    ];

    expect(() => MediaGallerySchema.parse(gallery)).not.toThrow();

    const invalidTypeGallery = [
      { id: '6', url: '/p6.jpg', type: 'FOTO_ARBITRARIA' }
    ];

    expect(() => MediaGallerySchema.parse(invalidTypeGallery)).toThrow();
  });

  it('conversores bidirecionais treeToCatalogItem e catalogItemToTree devem manter a integridade dos dados', () => {
    const baseTree: Tree = {
      id: 'tree-roundtrip-01',
      displayNumber: null,
      popularName: 'Copaíba',
      scientificNameSuggested: 'Copaifera langsdorffii',
      family: 'Fabaceae',
      confidence: 'alta',
      latitude: -12.7048,
      longitude: -60.1192,
      locationAccuracy: 2.5,
      primaryPhoto: {
        id: 'p1',
        url: 'https://images.unsplash.com/copaiba',
        category: 'arvore_inteira'
      },
      gallery: [
        {
          id: 'p2',
          url: 'https://images.unsplash.com/copaiba-folha',
          category: 'folha'
        }
      ],
      plantnet: {
        score: 0.91,
        url: 'https://identify.plantnet.org/species/copaiba',
        status: 'CONFIRMADO'
      },
      group: 'groupC',
      collectedAt: '2026-09-20T12:00:00Z',
      verificationStatus: 'verificado',
      isMock: false
    };

    // Tree -> TreeCatalogItem
    const catalogItem = treeToCatalogItem(baseTree);
    expect(catalogItem.id).toBe(baseTree.id);
    expect(catalogItem.coordinates.lat).toBe(-12.7048);
    expect(catalogItem.coordinates.lng).toBe(-60.1192);
    expect(catalogItem.collection?.collectionGroup).toBe('DIREITA_LAGO');
    // Deve conter a primaryPhoto (p1) e a galeria (p2)
    expect(catalogItem.gallery.length).toBe(2);
    expect(catalogItem.gallery[0].type).toBe('ARVORE_INTEIRA');
    expect(catalogItem.gallery[1].type).toBe('FOLHA');
    expect(catalogItem.plantnet?.status).toBe('CONFIRMADO');

    // TreeCatalogItem -> Tree
    const backToTree = catalogItemToTree(catalogItem);
    expect(backToTree.id).toBe(baseTree.id);
    expect(backToTree.latitude).toBe(baseTree.latitude);
    expect(backToTree.longitude).toBe(baseTree.longitude);
    expect(backToTree.popularName).toBe(baseTree.popularName);
    expect(backToTree.group).toBe('groupC');
    expect(backToTree.confidence).toBe('alta');
    expect(backToTree.displayNumber).toBeNull();
    expect(backToTree.primaryPhoto?.id).toBe('p1');
  });

  it('treeToCatalogItem deve preservar primaryPhoto mesmo quando a galeria for vazia', () => {
    const treeWithOnlyPrimary: Tree = {
      id: 'tree-only-primary',
      displayNumber: null,
      popularName: 'Angico',
      scientificNameSuggested: 'Anadenanthera colubrina',
      family: 'Fabaceae',
      confidence: 'alta',
      latitude: -12.704,
      longitude: -60.119,
      locationAccuracy: null,
      primaryPhoto: {
        id: 'angico-capa',
        url: 'https://images.unsplash.com/angico',
        category: 'arvore_inteira'
      },
      gallery: [],
      plantnet: null,
      group: 'groupA',
      collectedAt: '2026-09-20',
      verificationStatus: 'verificado',
      isMock: false
    };

    const item = treeToCatalogItem(treeWithOnlyPrimary);
    expect(item.gallery.length).toBe(1);
    expect(item.gallery[0].id).toBe('angico-capa');
    expect(item.gallery[0].type).toBe('ARVORE_INTEIRA');

    const back = catalogItemToTree(item);
    expect(back.primaryPhoto).toBeDefined();
    expect(back.primaryPhoto?.id).toBe('angico-capa');
  });

  it('CollectionDataSchema deve aceitar tanto collectedAt quanto collectionDate', () => {
    const withDate = CollectionDataSchema.parse({
      collectionGroup: 'ESQUERDA_LAGO',
      collectionDate: '2026-09-20'
    });
    expect(withDate.collectionGroup).toBe('ESQUERDA_LAGO');
    expect(withDate.collectionDate).toBe('2026-09-20');

    const withAt = CollectionDataSchema.parse({
      collectionGroup: 'OUTROS',
      collectedAt: '2026-09-20T10:00:00Z'
    });
    expect(withAt.collectionGroup).toBe('OUTROS');
    expect(withAt.collectedAt).toBe('2026-09-20T10:00:00Z');
  });
});
