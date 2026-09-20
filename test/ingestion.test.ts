import { describe, it, expect } from 'vitest';
import { parseCsvString } from '../lib/ingestion/csv-parser';
import { dmsToDecimal, extractExifGpsData } from '../lib/ingestion/exif-extractor';
import { mapPlantNetApiResponse } from '../lib/ingestion/plantnet-mapper';
import { ingestTreeRecords, generateTreeSlug } from '../lib/ingestion/pipeline';

describe('DATA INGESTION PIPELINE AUDIT', () => {
  describe('1. CSV Parser', () => {
    it('deve processar CSV com vírgula e cabeçalhos em português', () => {
      const csv = `Nome Popular,Nome Científico,Família,Latitude,Longitude,Grupo\nIpê Amarelo,Handroanthus chrysotrichus,Bignoniaceae,-12.704,-60.119,Grupo A\nBuriti,Mauritia flexuosa,Arecaceae,-12.705,-60.120,Grupo B`;
      const result = parseCsvString(csv);

      expect(result.errors.length).toBe(0);
      expect(result.rows.length).toBe(2);
      expect(result.rows[0].popularName).toBe('Ipê Amarelo');
      expect(result.rows[0].scientificNameSuggested).toBe('Handroanthus chrysotrichus');
      expect(result.rows[0].group).toBe('Grupo A');
      expect(result.rows[1].popularName).toBe('Buriti');
    });

    it('deve detectar automaticamente separador por ponto-e-vírgula e campos com aspas', () => {
      const csv = `popular;scientific_name;family;notes\n"Copaíba, da Mata";Copaifera langsdorffii;Fabaceae;"Árvore alta, copa ampla"\n"Jatobá; Nobre";Hymenaea courbaril;Fabaceae;"Tronco com resina"`;
      const result = parseCsvString(csv);

      expect(result.errors.length).toBe(0);
      expect(result.rows.length).toBe(2);
      expect(result.rows[0].popularName).toBe('Copaíba, da Mata');
      expect(result.rows[0].notes).toBe('Árvore alta, copa ampla');
      expect(result.rows[1].popularName).toBe('Jatobá; Nobre');
    });

    it('deve retornar erro gracioso para arquivos vazios sem estourar exceções', () => {
      const empty = parseCsvString('');
      expect(empty.errors.length).toBeGreaterThan(0);
      expect(empty.rows.length).toBe(0);
    });
  });

  describe('2. EXIF GPS Extractor', () => {
    it('dmsToDecimal() deve converter Graus, Minutos e Segundos com referência Sul e Oeste', () => {
      // 12° 42' 15.8" S -> ~ -12.704388...
      const lat = dmsToDecimal([12, 42, 15.8], 'S');
      expect(lat).not.toBeNull();
      expect(lat!).toBeCloseTo(-12.704389, 4);

      // 60° 07' 08.0" W -> ~ -60.118888...
      const lng = dmsToDecimal([60, 7, 8.0], 'W');
      expect(lng).not.toBeNull();
      expect(lng!).toBeCloseTo(-60.118889, 4);
    });

    it('dmsToDecimal() deve rejeitar valores inválidos retornando null', () => {
      expect(dmsToDecimal([999, 0, 0], 'N')).toBeNull(); // Fora de 180
      expect(dmsToDecimal([12, 42] as any, 'S')).toBeNull(); // Menos de 3 elementos
      expect(dmsToDecimal([NaN, 10, 10], 'S')).toBeNull();
    });

    it('extractExifGpsData() deve interpretar metadados de câmera e timestamp ISO', () => {
      const mockExif = {
        GPSLatitude: [12, 42, 15.8],
        GPSLatitudeRef: 'S',
        GPSLongitude: [60, 7, 8.0],
        GPSLongitudeRef: 'W',
        GPSAltitude: 610.5,
        GPSHPositioningError: 2.8,
        DateTimeOriginal: '2026:09:20 14:35:10',
        Make: 'Sony',
        Model: 'Alpha 7 IV'
      };

      const result = extractExifGpsData(mockExif);
      expect(result.success).toBe(true);
      expect(result.data).not.toBeNull();
      expect(result.data!.latitude).toBeCloseTo(-12.704389, 4);
      expect(result.data!.longitude).toBeCloseTo(-60.118889, 4);
      expect(result.data!.altitude).toBe(610.5);
      expect(result.data!.accuracy).toBe(2.8);
      expect(result.data!.dateTimeOriginal).toBe('2026-09-20T14:35:10.000Z');
      expect(result.data!.cameraMake).toBe('Sony');
      expect(result.data!.cameraModel).toBe('Alpha 7 IV');
    });

    it('extractExifGpsData() deve lidar com payload nulo sem quebrar', () => {
      const result = extractExifGpsData(null as any);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('3. PlantNet API Mapper', () => {
    it('deve mapear resposta completa com score alto e sugerir confiança alta', () => {
      const mockPlantNet = {
        score: 0.942,
        species: {
          scientificNameWithoutAuthor: 'Handroanthus chrysotrichus',
          scientificNameAuthorship: '(Mart. ex DC.) Mattos',
          genus: { scientificNameWithoutAuthor: 'Handroanthus' },
          family: { scientificNameWithoutAuthor: 'Bignoniaceae' },
          commonNames: ['Ipê-amarelo', 'Ipê-cascudo']
        },
        gbif: { id: 3172605 }
      };

      const mapped = mapPlantNetApiResponse(mockPlantNet);
      expect(mapped.data).not.toBeNull();
      expect(mapped.data!.taxon).toBe('Handroanthus chrysotrichus');
      expect(mapped.data!.score).toBe(0.942);
      expect(mapped.data!.familySuggested).toBe('Bignoniaceae');
      expect(mapped.data!.genusSuggested).toBe('Handroanthus');
      expect(mapped.data!.gbifId).toBe('3172605');
      expect(mapped.data!.url).toBe('https://www.gbif.org/species/3172605');
      expect(mapped.recommendedConfidence).toBe('alta');
      expect(mapped.popularNameCandidate).toBe('Ipê-amarelo');
    });

    it('deve atribuir confianças escalonadas (alta >= 0.85, média >= 0.60, baixa < 0.60)', () => {
      const medium = mapPlantNetApiResponse({ score: 0.72, species: { scientificNameWithoutAuthor: 'Amburana sp.' } });
      expect(medium.recommendedConfidence).toBe('media');

      const low = mapPlantNetApiResponse({ score: 0.45, species: { scientificNameWithoutAuthor: 'Indet.' } });
      expect(low.recommendedConfidence).toBe('baixa');

      const zero = mapPlantNetApiResponse({ score: 0 });
      expect(zero.recommendedConfidence).toBe('indeterminada');
    });
  });

  describe('4. Ingestion Pipeline Master', () => {
    it('generateTreeSlug() deve gerar identificadores estáveis e limpos', () => {
      expect(generateTreeSlug('Ipê Amarelo!', 0)).toBe('tree-ipe-amarelo-001');
      expect(generateTreeSlug('Cerejeira / Amazônia', 14)).toBe('tree-cerejeira-amazonia-015');
      expect(generateTreeSlug('', 99)).toBe('tree-specimen-100');
    });

    it('ingestTreeRecords() deve ingerir CSV válido e forçar displayNumber = null', () => {
      const csv = `id,popularName,scientificNameSuggested,family,latitude,longitude,group,status\ntree-custom-01,Cedro-Rosa,Cedrela fissilis,Meliaceae,-12.7044,-60.1189,Grupo C,verificado`;
      const result = ingestTreeRecords(csv);

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1);
      const tree = result.data[0];
      expect(tree.id).toBe('tree-custom-01');
      expect(tree.popularName).toBe('Cedro-Rosa');
      expect(tree.family).toBe('Meliaceae');
      expect(tree.group).toBe('groupC');
      expect(tree.verificationStatus).toBe('verificado');
      // REGRA DE OURO
      expect(tree.displayNumber).toBeNull();
    });

    it('ingestTreeRecords() deve alertar e corrigir coordenadas invertidas ou com sinal errado', () => {
      const rawRecords = [
        {
          id: 'tree-invert-01',
          popularName: 'Angico',
          scientificNameSuggested: 'Anadenanthera colubrina',
          family: 'Fabaceae',
          latitude: 12.7044, // Latitude positiva no hemisfério Sul
          longitude: -60.1189,
          group: 'groupA'
        }
      ];

      const result = ingestTreeRecords(rawRecords);
      expect(result.importedCount).toBe(1);
      expect(result.data[0].latitude).toBe(-12.7044); // Corrigido para negativo
      expect(result.warnings.some((w) => w.message.includes('Latitude positiva'))).toBe(true);
    });

    it('ingestTreeRecords() deve validar bounding box do Parque e emitir aviso se estiver fora', () => {
      const rawOutOfPark = [
        {
          id: 'tree-cuiaba',
          popularName: 'Pau-Brasil Fora',
          scientificNameSuggested: 'Paubrasilia echinata',
          family: 'Fabaceae',
          latitude: -15.601, // Cuiabá/MT
          longitude: -56.097,
          group: 'groupA'
        }
      ];

      const result = ingestTreeRecords(rawOutOfPark, { validateBounds: true });
      expect(result.importedCount).toBe(1);
      expect(result.warnings.some((w) => w.message.includes('fora do quadrilátero do Parque'))).toBe(true);
    });

    it('ingestTreeRecords() deve resolver IDs duplicados com sufixo único', () => {
      const dupes = [
        { id: 'tree-same', popularName: 'Árvore A', scientificNameSuggested: 'Species A', family: 'Fam A', group: 'groupA' },
        { id: 'tree-same', popularName: 'Árvore B', scientificNameSuggested: 'Species B', family: 'Fam B', group: 'groupB' }
      ];

      const result = ingestTreeRecords(dupes);
      expect(result.importedCount).toBe(2);
      expect(result.data[0].id).toBe('tree-same');
      expect(result.data[1].id).toBe('tree-same-2');
      expect(result.warnings.some((w) => w.message.includes('ID duplicado'))).toBe(true);
    });

    it('ingestTreeRecords() deve rejeitar registros inválidos com mensagens explicativas', () => {
      const invalid = [
        { id: '', popularName: '', scientificNameSuggested: '', family: '' }
      ];

      const result = ingestTreeRecords(invalid, { autoAssignId: false });
      expect(result.importedCount).toBe(0);
      expect(result.failedCount).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
