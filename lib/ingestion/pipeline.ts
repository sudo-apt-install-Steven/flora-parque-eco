import {
  Tree,
  TreeSchema,
  FieldGroup,
  VerificationStatus,
  TreeConfidence,
  IngestionOptions,
  IngestionResult,
  IngestionError,
  IngestionWarning,
  PhotoItem
} from '@/lib/tree-schema';
import { parseCsvString } from '@/lib/ingestion/csv-parser';
import { PARK_CONFIG } from '@/lib/park-config';

/**
 * Normaliza um identificador estável único
 */
export function generateTreeSlug(name: string, index: number): string {
  const clean = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `tree-${clean || 'specimen'}-${String(index + 1).padStart(3, '0')}`;
}

/**
 * Normaliza strings com fallback
 */
function cleanString(val: unknown, fallback: string): string {
  if (typeof val === 'string' && val.trim().length > 0) {
    return val.trim();
  }
  return fallback;
}

/**
 * Coerção segura de números
 */
function parseNumberOrNull(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return Number.isNaN(val) ? null : val;
  const parsed = parseFloat(String(val).replace(',', '.').trim());
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Normaliza grupo de campo acadêmico
 */
function normalizeFieldGroup(val: unknown, fallback: FieldGroup = 'groupA'): FieldGroup {
  if (typeof val === 'string') {
    const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes('a') || clean === 'groupa' || clean === 'grupoa') return 'groupA';
    if (clean.includes('b') || clean === 'groupb' || clean === 'grupob') return 'groupB';
    if (clean.includes('c') || clean === 'groupc' || clean === 'grupoc') return 'groupC';
  }
  return fallback;
}

/**
 * Normaliza nível de confiança
 */
function normalizeConfidence(val: unknown): TreeConfidence {
  if (typeof val === 'string') {
    const clean = val.toLowerCase().trim();
    if (clean === 'alta' || clean === 'high') return 'alta';
    if (clean === 'media' || clean === 'média' || clean === 'medium') return 'media';
    if (clean === 'baixa' || clean === 'low') return 'baixa';
  }
  return 'indeterminada';
}

/**
 * Normaliza status de verificação
 */
function normalizeVerificationStatus(val: unknown, fallback: VerificationStatus = 'pendente'): VerificationStatus {
  if (typeof val === 'string') {
    const clean = val.toLowerCase().trim();
    if (clean === 'verificado' || clean === 'verified') return 'verificado';
    if (clean === 'em_analise' || clean === 'analise' || clean === 'análise') return 'em_analise';
    if (clean === 'identificacao_preliminar' || clean === 'preliminar') return 'identificacao_preliminar';
    if (clean === 'rejeitado' || clean === 'rejected') return 'rejeitado';
    if (clean === 'pendente' || clean === 'pending') return 'pendente';
  }
  return fallback;
}

/**
 * Pipeline mestre de ingestão e estruturação de dados arbóreos
 * Processa arrays JSON, strings CSV ou objetos avulsos com auditoria rigorosa
 */
export function ingestTreeRecords(
  rawInput: unknown,
  options: IngestionOptions = {}
): IngestionResult {
  const errors: IngestionError[] = [];
  const warnings: IngestionWarning[] = [];
  const validTrees: Tree[] = [];

  const opts: Required<IngestionOptions> = {
    validateBounds: options.validateBounds ?? true,
    allowMockData: options.allowMockData ?? true,
    autoAssignId: options.autoAssignId ?? true,
    defaultGroup: options.defaultGroup ?? 'groupA',
    defaultStatus: options.defaultStatus ?? 'pendente'
  };

  let rawList: Record<string, unknown>[] = [];

  // 1. Decodificação do tipo de entrada (CSV, JSON String, Array)
  try {
    if (typeof rawInput === 'string') {
      const trimmed = rawInput.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsedJson = JSON.parse(trimmed);
        rawList = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
      } else {
        // Trata como CSV
        const csvResult = parseCsvString(trimmed);
        if (csvResult.errors.length > 0) {
          csvResult.errors.forEach((msg, idx) => {
            errors.push({ index: idx, message: msg });
          });
        }
        rawList = csvResult.rows;
      }
    } else if (Array.isArray(rawInput)) {
      rawList = rawInput as Record<string, unknown>[];
    } else if (rawInput && typeof rawInput === 'object') {
      rawList = [rawInput as Record<string, unknown>];
    } else {
      return {
        success: false,
        totalProcessed: 0,
        importedCount: 0,
        failedCount: 0,
        data: [],
        errors: [{ index: 0, message: 'Formato de entrada não suportado para ingestão' }],
        warnings: []
      };
    }
  } catch (parseError) {
    const message = parseError instanceof Error ? parseError.message : String(parseError);
    return {
      success: false,
      totalProcessed: 0,
      importedCount: 0,
      failedCount: 0,
      data: [],
      errors: [{ index: 0, message: `Erro fatal ao decodificar entrada: ${message}` }],
      warnings: []
    };
  }

  const seenIds = new Set<string>();

  // 2. Processamento e Sanitização de cada registro
  for (let i = 0; i < rawList.length; i++) {
    const raw = rawList[i];
    if (!raw || typeof raw !== 'object') {
      errors.push({ index: i, message: 'Linha/objeto nulo ou inválido' });
      continue;
    }

    try {
      const popularName = cleanString(
        raw.popularName ?? raw.popular_name ?? raw.nome_popular,
        `Espécime Coletado #${i + 1}`
      );
      const scientificNameSuggested = cleanString(
        raw.scientificNameSuggested ?? raw.scientific_name ?? raw.nome_cientifico,
        'Taxonomia em determinação'
      );
      const family = cleanString(raw.family ?? raw.familia, 'Indeterminada');

      // ID estável
      let id = typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : '';
      if (!id && opts.autoAssignId) {
        id = generateTreeSlug(popularName, i);
      }

      if (!id) {
        errors.push({ index: i, field: 'id', message: 'Identificador obrigatório ausente' });
        continue;
      }

      if (seenIds.has(id)) {
        warnings.push({ index: i, recordId: id, message: `ID duplicado detectado: ${id}. Gerando sufixo único.` });
        id = `${id}-${i + 1}`;
      }
      seenIds.add(id);

      // REGRA ABSOLUTA: displayNumber é estritamente null inicialmente
      const displayNumber = null;

      // Coordenadas
      let lat = parseNumberOrNull(raw.latitude ?? raw.lat);
      let lng = parseNumberOrNull(raw.longitude ?? raw.lng ?? raw.long);
      const accuracy = parseNumberOrNull(raw.locationAccuracy ?? raw.accuracy ?? raw.precisao);

      // Verificação de Inversão de Latitude/Longitude (Rondônia fica no quadrante Sul / Oeste)
      if (lat !== null && lng !== null) {
        if (lat > 0 && lng < 0) {
          warnings.push({
            index: i,
            recordId: id,
            message: `Latitude positiva (${lat}) detectada em Vilhena/RO. Invertendo sinal para negativo.`
          });
          lat = -Math.abs(lat);
        }
        // Se lat e lng estiverem trocados (ex: lat ~ -60 e lng ~ -12)
        if (lat < -40 && lng > -20 && lng < 0) {
          warnings.push({
            index: i,
            recordId: id,
            message: `Coordenadas possivelmente invertidas detectadas (lat: ${lat}, lng: ${lng}). Ajustando.`
          });
          const temp = lat;
          lat = lng;
          lng = temp;
        }

        // Validação de Bounding Box de Vilhena / Parque
        if (opts.validateBounds) {
          const [[minLng, minLat], [maxLng, maxLat]] = PARK_CONFIG.maxBounds;
          const withinBounds = lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
          if (!withinBounds) {
            warnings.push({
              index: i,
              recordId: id,
              message: `Coordenada (${lat.toFixed(4)}, ${lng.toFixed(4)}) fora do quadrilátero do Parque Ecológico.`
            });
          }
        }
      }

      // Grupo de Campo
      const group = normalizeFieldGroup(raw.group ?? raw.grupo, opts.defaultGroup);

      // Nível de Confiança
      const confidence = normalizeConfidence(raw.confidence ?? raw.confianca);

      // Status de Verificação
      const verificationStatus = normalizeVerificationStatus(
        raw.verificationStatus ?? raw.status,
        opts.defaultStatus
      );

      // Fotos
      let primaryPhoto: PhotoItem | null = null;
      const photoUrl = cleanString(raw.photoUrl ?? raw.primaryPhoto ?? raw.foto_url, '');
      if (photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
        primaryPhoto = {
          id: `photo-${id}-main`,
          url: photoUrl,
          thumbUrl: photoUrl,
          category: 'arvore_inteira',
          caption: `Fotografia primária de ${popularName}`
        };
      }

      // PlantNet
      const plantnetTaxon = cleanString(raw.plantnetTaxon ?? raw.plantnet_taxon, '');
      const plantnetScore = parseNumberOrNull(raw.plantnetScore ?? raw.plantnet_score);
      const plantnetUrl = cleanString(raw.plantnetUrl ?? raw.plantnet_url, '');

      const plantnet =
        plantnetTaxon || plantnetScore !== null
          ? {
              taxon: plantnetTaxon || undefined,
              score: plantnetScore !== null ? Math.max(0, Math.min(1, plantnetScore)) : undefined,
              url: plantnetUrl && plantnetUrl.startsWith('http') ? plantnetUrl : undefined,
              familySuggested: family !== 'Indeterminada' ? family : undefined
            }
          : null;

      // Data de Coleta
      const collectedAtRaw = cleanString(raw.collectedAt ?? raw.data_coleta, '');
      const collectedAtDate = collectedAtRaw ? new Date(collectedAtRaw) : new Date();
      const collectedAt = !Number.isNaN(collectedAtDate.getTime())
        ? collectedAtDate.toISOString()
        : new Date().toISOString();

      const candidateTree: Tree = {
        id,
        displayNumber,
        popularName,
        scientificNameSuggested,
        family,
        confidence,
        latitude: lat,
        longitude: lng,
        locationAccuracy: accuracy,
        primaryPhoto,
        gallery: [],
        plantnet,
        group,
        collectedAt,
        verificationStatus,
        notes: cleanString(raw.notes ?? raw.observacoes, '') || undefined,
        isMock: Boolean(raw.isMock ?? false)
      };

      // 3. Validação final estrita pelo Zod Schema
      const validation = TreeSchema.safeParse(candidateTree);
      if (!validation.success) {
        const issues = validation.error.issues.map((iss) => `${iss.path.join('.')}: ${iss.message}`);
        errors.push({
          index: i,
          recordId: id,
          message: `Falha de validação no schema: ${issues.join('; ')}`
        });
        continue;
      }

      validTrees.push(validation.data);
    } catch (recordError) {
      const msg = recordError instanceof Error ? recordError.message : String(recordError);
      errors.push({
        index: i,
        message: `Exceção ao processar registro #${i + 1}: ${msg}`
      });
    }
  }

  return {
    success: errors.length === 0,
    totalProcessed: rawList.length,
    importedCount: validTrees.length,
    failedCount: errors.length,
    data: validTrees,
    errors,
    warnings
  };
}
