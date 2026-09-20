import { describe, it, expect } from 'vitest';
import {
  getSafeTree,
  formatCoordinates,
  formatDisplayNumber,
  formatPlantNetScore,
  DEFAULT_FALLBACK_PHOTO,
  DEFAULT_FALLBACK_PLANTNET,
  CONFIDENCE_LABELS,
  VERIFICATION_STATUS_LABELS,
  FIELD_GROUP_LABELS
} from '../lib/fallbacks';
import { Tree } from '../lib/tree-schema';

describe('DATA FALLBACKS & RESILIENCE AUDIT', () => {
  it('getSafeTree() deve blindar objetos nulos ou indefinidos sem lançar exceções', () => {
    const safeNull = getSafeTree(null);
    expect(safeNull).toBeDefined();
    expect(safeNull.id).toBe('empty-fallback-tree');
    expect(safeNull.hasCoordinates).toBe(false);
    expect(safeNull.coordinatesFormatted).toBe('Coordenadas não mapeadas');
    expect(safeNull.displayNumberFormatted).toBe('Plaqueta em implantação');
    expect(safeNull.safePrimaryPhoto).toBeDefined();
    expect(safeNull.safePrimaryPhoto.url).toBe(DEFAULT_FALLBACK_PHOTO.url);

    const safeUndefined = getSafeTree(undefined);
    expect(safeUndefined).toBeDefined();
    expect(safeUndefined.popularName).toBe('Espécime não catalogado');
  });

  it('getSafeTree() deve preservar dados válidos e fornecer formatters enriquecidos', () => {
    const validTree: Tree = {
      id: 'tree-real-test-01',
      displayNumber: null,
      popularName: 'Cumaru-ferro',
      scientificNameSuggested: 'Dipteryx odorata',
      family: 'Fabaceae',
      confidence: 'alta',
      latitude: -12.7044,
      longitude: -60.1189,
      locationAccuracy: 2.5,
      primaryPhoto: {
        id: 'photo-01',
        url: 'https://images.unsplash.com/photo-1542273917363',
        category: 'arvore_inteira'
      },
      gallery: [],
      plantnet: {
        taxon: 'Dipteryx odorata (Aubl.) Willd.',
        score: 0.94,
        url: 'https://identify.plantnet.org/'
      },
      group: 'groupA',
      collectedAt: '2026-09-20T10:00:00Z',
      verificationStatus: 'verificado',
      isMock: false
    };

    const safe = getSafeTree(validTree);
    expect(safe.hasCoordinates).toBe(true);
    expect(safe.coordinatesFormatted).toContain('-12.70440°');
    expect(safe.coordinatesFormatted).toContain('-60.11890°');
    expect(safe.safePrimaryPhoto.id).toBe('photo-01');
    expect(safe.plantnetScoreFormatted).toBe('94% de match');
    expect(safe.displayNumberFormatted).toBe('Plaqueta em implantação');
  });

  it('formatCoordinates() deve formatar lat/lng com precisão ou texto de fallback seguro', () => {
    expect(formatCoordinates(null, null)).toBe('Ponto geográfico não fixado');
    expect(formatCoordinates(undefined, -60.1189)).toBe('Ponto geográfico não fixado');
    expect(formatCoordinates(-12.7044, null)).toBe('Ponto geográfico não fixado');

    const formatted = formatCoordinates(-12.7044, -60.1189, 3.2);
    expect(formatted).toBe('-12.70440°, -60.11890° (±3.2m)');

    const withoutAcc = formatCoordinates(-12.7044, -60.1189);
    expect(withoutAcc).toBe('-12.70440°, -60.11890°');
  });

  it('formatDisplayNumber() deve tratar números e null de forma descritiva', () => {
    expect(formatDisplayNumber(null)).toBe('Plaqueta física em implantação');
    expect(formatDisplayNumber(undefined)).toBe('Plaqueta física em implantação');
    expect(formatDisplayNumber(42)).toBe('Placa #42');
    expect(formatDisplayNumber(0)).toBe('Placa #0');
  });

  it('formatPlantNetScore() deve formatar e limitar valores entre 0% e 100%', () => {
    expect(formatPlantNetScore(null)).toBe('Não analisado');
    expect(formatPlantNetScore(undefined)).toBe('Não analisado');
    expect(formatPlantNetScore(0.856)).toBe('86%');
    expect(formatPlantNetScore(1.5)).toBe('100%');
    expect(formatPlantNetScore(-0.2)).toBe('0%');
  });

  it('labels de confiança, status e grupos devem cobrir todos os enums do schema', () => {
    expect(CONFIDENCE_LABELS.alta).toBeTruthy();
    expect(CONFIDENCE_LABELS.media).toBeTruthy();
    expect(CONFIDENCE_LABELS.baixa).toBeTruthy();
    expect(CONFIDENCE_LABELS.indeterminada).toBeTruthy();

    expect(VERIFICATION_STATUS_LABELS.verificado).toBeTruthy();
    expect(VERIFICATION_STATUS_LABELS.em_analise).toBeTruthy();
    expect(VERIFICATION_STATUS_LABELS.identificacao_preliminar).toBeTruthy();
    expect(VERIFICATION_STATUS_LABELS.pendente).toBeTruthy();
    expect(VERIFICATION_STATUS_LABELS.rejeitado).toBeTruthy();

    expect(FIELD_GROUP_LABELS.groupA.label).toBe('Grupo A');
    expect(FIELD_GROUP_LABELS.groupB.label).toBe('Grupo B');
    expect(FIELD_GROUP_LABELS.groupC.label).toBe('Grupo C');
  });
});
