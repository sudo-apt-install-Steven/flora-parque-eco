import { PlantNetData, TreeConfidence } from '@/lib/tree-schema';

/**
 * Resposta padrão ou simplificada emitida pela API do PlantNet
 */
export interface RawPlantNetPayload {
  score?: number;
  species?: {
    scientificNameWithoutAuthor?: string;
    scientificNameAuthorship?: string;
    scientificName?: string;
    genus?: {
      scientificNameWithoutAuthor?: string;
    };
    family?: {
      scientificNameWithoutAuthor?: string;
    };
    commonNames?: string[];
  };
  gbif?: {
    id?: string | number;
  };
  powo?: {
    id?: string;
  };
  url?: string;
  bestMatch?: string;
}

/**
 * Mapeia e higieniza payload retornado pela API do PlantNet para a estrutura PlantNetData
 */
export function mapPlantNetApiResponse(raw: RawPlantNetPayload | null | undefined): {
  data: PlantNetData | null;
  recommendedConfidence: TreeConfidence;
  popularNameCandidate?: string;
  errors: string[];
} {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return {
      data: null,
      recommendedConfidence: 'indeterminada',
      errors: ['Payload da API do PlantNet nulo ou inválido']
    };
  }

  try {
    const rawScore = typeof raw.score === 'number' ? raw.score : 0;
    const clampedScore = Math.max(0, Math.min(1, rawScore));

    const species = raw.species || {};
    const taxon =
      species.scientificNameWithoutAuthor ||
      species.scientificName ||
      raw.bestMatch ||
      '';

    const family = species.family?.scientificNameWithoutAuthor || undefined;
    const genus = species.genus?.scientificNameWithoutAuthor || undefined;
    const scientificWithoutAuthor = species.scientificNameWithoutAuthor || taxon;

    const gbifId = raw.gbif?.id !== undefined ? String(raw.gbif.id) : undefined;
    const powoId = raw.powo?.id ? String(raw.powo.id) : undefined;

    const referenceUrl =
      raw.url || (gbifId ? `https://www.gbif.org/species/${gbifId}` : 'https://identify.plantnet.org/');

    // Sugere nome popular se houver nomes comuns listados
    const popularNameCandidate =
      Array.isArray(species.commonNames) && species.commonNames.length > 0
        ? species.commonNames[0]
        : undefined;

    // Calcula recomendação de confiança botânica
    let recommendedConfidence: TreeConfidence = 'indeterminada';
    if (clampedScore >= 0.85) {
      recommendedConfidence = 'alta';
    } else if (clampedScore >= 0.60) {
      recommendedConfidence = 'media';
    } else if (clampedScore > 0) {
      recommendedConfidence = 'baixa';
    }

    let status: 'SUGESTÃO' | 'EM_REVISÃO' | 'CONFIRMADO' = 'SUGESTÃO';
    if (clampedScore >= 0.85) {
      status = 'CONFIRMADO';
    } else if (clampedScore >= 0.5) {
      status = 'EM_REVISÃO';
    }

    const plantnetData: PlantNetData = {
      taxon: taxon || undefined,
      score: Number(clampedScore.toFixed(3)),
      plantnetUrl: referenceUrl,
      status,
      url: referenceUrl,
      familySuggested: family,
      genusSuggested: genus,
      scientificNameWithoutAuthor: scientificWithoutAuthor,
      gbifId,
      powoId
    };

    return {
      data: plantnetData,
      recommendedConfidence,
      popularNameCandidate,
      errors
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Falha ao normalizar resposta do PlantNet: ${msg}`);
    return {
      data: null,
      recommendedConfidence: 'indeterminada',
      errors
    };
  }
}
