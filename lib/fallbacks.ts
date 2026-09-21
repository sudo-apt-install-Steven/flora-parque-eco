import {
  Tree,
  SafeTree,
  PhotoItem,
  PlantNetData,
  TreeConfidence,
  VerificationStatus,
  FieldGroup
} from '@/lib/tree-schema';

/**
 * SVG em Data URI para placeholder botânico neutro e de alta resolução
 * Renderiza uma silhueta de folha/árvore elegante em tons esmeralda sem depender de rede
 */
export const BOTANICAL_PLACEHOLDER_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%230b211d"/><circle cx="300" cy="200" r="100" fill="%2310b981" fill-opacity="0.08"/><path d="M300 90C300 90 230 160 230 230C230 268.66 261.34 300 300 300C338.66 300 370 268.66 370 230C370 160 300 90 300 90Z" fill="%2310b981" fill-opacity="0.25" stroke="%2310b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M300 130V290M300 190L260 220M300 230L340 250M300 160L335 180" stroke="%23d6a35b" stroke-width="2.5" stroke-linecap="round"/><text x="300" y="340" fill="%2394a3b8" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle" letter-spacing="1">CATALOGAÇÃO EM CAMPO</text></svg>';

/**
 * Foto padrão de fallback para árvores que ainda não tiveram foto primária registrada
 */
export const DEFAULT_FALLBACK_PHOTO: PhotoItem = {
  id: 'photo-fallback-default',
  url: BOTANICAL_PLACEHOLDER_SVG,
  thumbUrl: BOTANICAL_PLACEHOLDER_SVG,
  category: 'outro',
  caption: 'Registro fotográfico em fase de coleta de campo',
  credit: 'Inventário Arbóreo Digital (IFRO)',
  isFallback: true
};

/**
 * Identificação PlantNet padrão quando a análise de visão computacional ainda não foi realizada
 */
export const DEFAULT_FALLBACK_PLANTNET: PlantNetData = {
  taxon: 'Identificação preliminar não realizada',
  score: 0,
  plantnetUrl: null,
  status: 'SUGESTÃO',
  url: 'https://identify.plantnet.org/',
  familySuggested: 'Aguardando validação'
};

/**
 * Árvore padrão vazia para situações onde nenhum registro foi selecionado ou encontrado
 */
export const EMPTY_FALLBACK_TREE: Tree = {
  id: 'empty-fallback-tree',
  displayNumber: null,
  popularName: 'Espécime não catalogado',
  scientificNameSuggested: 'Taxonomia indeterminada',
  family: 'Indeterminada',
  confidence: 'indeterminada',
  latitude: null,
  longitude: null,
  locationAccuracy: null,
  primaryPhoto: null,
  gallery: [],
  plantnet: null,
  group: 'groupA',
  collectedAt: new Date().toISOString(),
  verificationStatus: 'pendente',
  notes: 'Registro reservado para novo cadastro de campo.',
  isMock: false
};

/**
 * Converte qualquer objeto Tree (mesmo com propriedades nulas ou parciais)
 * em uma estrutura SafeTree blindada contra runtime errors no frontend.
 */
export function getSafeTree(tree: Tree | null | undefined): SafeTree {
  const base = tree ?? EMPTY_FALLBACK_TREE;

  const hasCoords =
    typeof base.latitude === 'number' &&
    typeof base.longitude === 'number' &&
    !Number.isNaN(base.latitude) &&
    !Number.isNaN(base.longitude);

  const safePhoto = base.primaryPhoto && base.primaryPhoto.url
    ? base.primaryPhoto
    : DEFAULT_FALLBACK_PHOTO;

  const formattedCoordinates = hasCoords
    ? `${base.latitude?.toFixed(5)}°, ${base.longitude?.toFixed(5)}°`
    : 'Coordenadas não mapeadas';

  const formattedDisplayNumber =
    base.displayNumber !== null && base.displayNumber !== undefined
      ? `#${base.displayNumber}`
      : 'Plaqueta em implantação';

  const formattedPlantnetScore =
    base.plantnet?.score !== undefined && base.plantnet.score !== null
      ? `${Math.round(base.plantnet.score * 100)}% de match`
      : 'Sem estimativa de match';

  return {
    ...base,
    safePrimaryPhoto: safePhoto,
    hasCoordinates: hasCoords,
    coordinatesFormatted: formattedCoordinates,
    displayNumberFormatted: formattedDisplayNumber,
    plantnetScoreFormatted: formattedPlantnetScore
  };
}

/**
 * Formata coordenadas e precisão para exibição amigável
 */
export function formatCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined,
  accuracy?: number | null
): string {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return 'Ponto geográfico não fixado';
  }
  const accText = accuracy ? ` (±${accuracy.toFixed(1)}m)` : '';
  return `${lat.toFixed(5)}°, ${lng.toFixed(5)}°${accText}`;
}

/**
 * Formata número de placa física garantindo que `null` seja tratado amigavelmente
 */
export function formatDisplayNumber(displayNumber: number | null | undefined): string {
  if (displayNumber === null || displayNumber === undefined) {
    return 'Plaqueta física em implantação';
  }
  return `Placa #${displayNumber}`;
}

/**
 * Formata score do PlantNet com validação de limites [0, 1]
 */
export function formatPlantNetScore(score?: number | null): string {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return 'Não analisado';
  }
  const clamped = Math.max(0, Math.min(1, score));
  return `${Math.round(clamped * 100)}%`;
}

/**
 * Rótulos descritivos amigáveis para níveis de confiança
 */
export const CONFIDENCE_LABELS: Record<TreeConfidence, string> = {
  alta: 'Confiança Alta',
  media: 'Confiança Média',
  baixa: 'Confiança Baixa',
  indeterminada: 'Indeterminada'
};

/**
 * Rótulos descritivos amigáveis para status de verificação científica
 */
export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  verificado: 'Verificado em Campo',
  em_analise: 'Em Análise Botânica',
  identificacao_preliminar: 'Identificação Preliminar',
  pendente: 'Pendente de Verificação',
  rejeitado: 'Rejeitado / Recoletar'
};

/**
 * Rótulos para os grupos de coleta de campo
 */
export const FIELD_GROUP_LABELS: Record<FieldGroup, { label: string; sector: string }> = {
  groupA: { label: 'Grupo A', sector: 'Margem esquerda (Setor Norte)' },
  groupB: { label: 'Grupo B', sector: 'Margem esquerda (Setor Sul)' },
  groupC: { label: 'Grupo C', sector: 'Margem direita (Trilha Principal)' }
};
