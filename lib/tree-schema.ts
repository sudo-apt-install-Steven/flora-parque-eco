import { z } from 'zod';

/**
 * Categorias de fotos do espécime botânico
 */
export const PhotoCategorySchema = z.enum([
  'arvore_inteira',
  'folha',
  'flor',
  'fruto',
  'casca',
  'outro'
]);
export type PhotoCategory = z.infer<typeof PhotoCategorySchema>;

/**
 * Registro de foto individual
 */
export const PhotoItemSchema = z.object({
  id: z.string().min(1, 'ID da foto é obrigatório'),
  url: z.string().min(1, 'URL ou caminho da foto é obrigatório'),
  thumbUrl: z.string().min(1).optional(),
  category: PhotoCategorySchema,
  caption: z.string().optional(),
  credit: z.string().optional(),
  capturedAt: z.string().optional(),
  isFallback: z.boolean().optional()
});
export type PhotoItem = z.infer<typeof PhotoItemSchema>;

/**
 * Status de verificação assistida pelo PlantNet
 */
export const PlantNetStatusSchema = z.enum(['SUGESTÃO', 'EM_REVISÃO', 'CONFIRMADO']);
export type PlantNetStatus = z.infer<typeof PlantNetStatusSchema>;

/**
 * Informações de identificação assistida pelo PlantNet
 * Atende estritamente à modelagem acadêmica com score, plantnetUrl e status
 */
export const PlantNetDataSchema = z.object({
  score: z.number().min(0).max(1).optional(),
  plantnetUrl: z.string().nullable().optional(),
  status: PlantNetStatusSchema.optional(),
  taxon: z.string().optional(),
  url: z.string().optional(),
  familySuggested: z.string().optional(),
  genusSuggested: z.string().optional(),
  scientificNameWithoutAuthor: z.string().optional(),
  gbifId: z.string().optional(),
  powoId: z.string().optional()
});
export type PlantNetData = z.infer<typeof PlantNetDataSchema>;

/**
 * Grupos de levantamento em campo para o catálogo acadêmico
 */
export const CollectionGroupSchema = z.enum(['ESQUERDA_LAGO', 'DIREITA_LAGO', 'OUTROS']);
export type CollectionGroup = z.infer<typeof CollectionGroupSchema>;

/**
 * Sub-objeto contendo o grupo e a data da coleta de campo
 */
export const CollectionDataSchema = z.object({
  collectionGroup: CollectionGroupSchema,
  collectedAt: z.string().optional(),
  collectionDate: z.string().optional(),
  collectorName: z.string().optional(),
  notes: z.string().optional()
}).refine(
  (data) => Boolean(data.collectedAt || data.collectionDate),
  { message: 'Data da coleta é obrigatória (collectedAt ou collectionDate)' }
);
export type CollectionData = {
  collectionGroup: CollectionGroup;
  collectedAt?: string;
  collectionDate?: string;
  collectorName?: string;
  notes?: string;
};

/**
 * Tipos de foto para galeria de mídia acadêmica
 */
export const MediaPhotoTypeSchema = z.enum([
  'ARVORE_INTEIRA',
  'FOLHA',
  'FRUTO',
  'CASCA',
  'TRONCO'
]);
export type MediaPhotoType = z.infer<typeof MediaPhotoTypeSchema>;

/**
 * Item individual da galeria de mídia do espécime
 */
export const MediaPhotoItemSchema = z.object({
  id: z.string().min(1, 'ID da foto é obrigatório'),
  url: z.string().min(1, 'URL da foto é obrigatória'),
  type: MediaPhotoTypeSchema,
  caption: z.string().optional(),
  credit: z.string().optional(),
  capturedAt: z.string().optional()
});
export type MediaPhotoItem = z.infer<typeof MediaPhotoItemSchema>;

/**
 * Array de objetos definindo as fotos da árvore
 */
export const MediaGallerySchema = z.array(MediaPhotoItemSchema);
export type MediaGallery = z.infer<typeof MediaGallerySchema>;

/**
 * Coordenadas geográficas estritas com lat e lng numéricos
 */
export const TreeCoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});
export type TreeCoordinates = z.infer<typeof TreeCoordinatesSchema>;

/**
 * Status de verificação científica do espécime
 */
export const VerificationStatusSchema = z.enum([
  'pendente',
  'em_analise',
  'identificacao_preliminar',
  'verificado',
  'rejeitado'
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

/**
 * Modelagem estrita do item do catálogo acadêmico (TreeCatalogItem)
 */
export const TreeCatalogItemSchema = z.object({
  id: z.string().min(1, 'ID único é obrigatório'),
  coordinates: TreeCoordinatesSchema,
  popularName: z.string().min(1, 'Nome popular é obrigatório'),
  scientificName: z.string().nullable(),
  family: z.string().nullable(),
  collectionGroup: CollectionGroupSchema.optional(),
  verificationStatus: VerificationStatusSchema.optional(),
  plantNetData: PlantNetDataSchema.nullable().optional(),
  plantnet: PlantNetDataSchema.nullable().optional(),
  collection: CollectionDataSchema.optional(),
  gallery: MediaGallerySchema.default([])
});
export type TreeCatalogItem = z.infer<typeof TreeCatalogItemSchema>;

/**
 * Grupos de campo do levantamento arbóreo
 * - groupA: Lado esquerdo do lago (Setor Norte)
 * - groupB: Lado esquerdo do lago (Setor Sul)
 * - groupC: Lado direito do lago (Trilha Principal)
 */
export const FieldGroupSchema = z.enum(['groupA', 'groupB', 'groupC']);
export type FieldGroup = z.infer<typeof FieldGroupSchema>;

/**
 * Nível de confiança taxonômica
 */
export const TreeConfidenceSchema = z.enum(['baixa', 'media', 'alta', 'indeterminada']);
export type TreeConfidence = z.infer<typeof TreeConfidenceSchema>;

/**
 * Schema principal da árvore (Tree)
 */
export const TreeSchema = z.object({
  // Identificador interno estável (UUID ou slug)
  id: z.string().min(1, 'ID do espécime é obrigatório'),

  // Número visível em placa física — OBRIGATORIAMENTE NULL inicialmente
  displayNumber: z.number().nullable(),

  // Nomenclatura
  popularName: z.string().min(1, 'Nome popular é obrigatório'),
  scientificNameSuggested: z.string().min(1, 'Nome científico é obrigatório'),
  family: z.string().min(1, 'Família botânica é obrigatória'),

  // Confiança da identificação preliminar
  confidence: TreeConfidenceSchema,

  // Coordenadas geográficas (podem ser nulas se ainda não georreferenciadas)
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  locationAccuracy: z.number().min(0).nullable(), // em metros (ex: GPS/EXIF)

  // Fotos
  primaryPhoto: PhotoItemSchema.nullable(),
  gallery: z.array(PhotoItemSchema),

  // Identificação assistida por IA/PlantNet
  plantnet: PlantNetDataSchema.nullable(),

  // Grupo de levantamento em campo
  group: FieldGroupSchema,

  // Metadados de coleta e verificação
  collectedAt: z.string(), // ISO date string
  verificationStatus: VerificationStatusSchema,
  notes: z.string().optional(),

  // Flag explicativa para mocks acadêmicos
  isMock: z.boolean().default(false)
});

export type Tree = z.infer<typeof TreeSchema>;

/**
 * Estrutura segura garantida com fallbacks preenchidos
 */
export interface SafeTree extends Tree {
  safePrimaryPhoto: PhotoItem;
  hasCoordinates: boolean;
  coordinatesFormatted: string;
  displayNumberFormatted: string;
  plantnetScoreFormatted: string;
}

/**
 * Dados EXIF brutos para ingestão fotográfica
 */
export interface ExifGpsRawData {
  latitude?: number;
  longitude?: number;
  latitudeRef?: 'N' | 'S';
  longitudeRef?: 'E' | 'W';
  altitude?: number;
  accuracy?: number;
  dateTimeOriginal?: string;
  cameraMake?: string;
  cameraModel?: string;
}

/**
 * Resposta típica da API do PlantNet (v2)
 */
export interface PlantNetRawResult {
  score: number;
  species: {
    scientificNameWithoutAuthor: string;
    scientificNameAuthorship?: string;
    genus: {
      scientificNameWithoutAuthor: string;
    };
    family: {
      scientificNameWithoutAuthor: string;
    };
    commonNames?: string[];
  };
  gbif?: {
    id: string;
  };
  powo?: {
    id: string;
  };
}

/**
 * Registro de erro durante o processo de ingestão de dados
 */
export interface IngestionError {
  index: number;
  recordId?: string;
  field?: string;
  message: string;
  rawValue?: unknown;
}

/**
 * Registro de aviso durante o processo de ingestão de dados
 */
export interface IngestionWarning {
  index: number;
  recordId?: string;
  field?: string;
  message: string;
}

/**
 * Relatório consolidado do pipeline de ingestão
 */
export interface IngestionResult {
  success: boolean;
  totalProcessed: number;
  importedCount: number;
  failedCount: number;
  data: Tree[];
  errors: IngestionError[];
  warnings: IngestionWarning[];
}

/**
 * Opções para o pipeline de ingestão de dados
 */
export interface IngestionOptions {
  validateBounds?: boolean;
  allowMockData?: boolean;
  autoAssignId?: boolean;
  defaultGroup?: FieldGroup;
  defaultStatus?: VerificationStatus;
}

/**
 * Critérios avançados de filtragem e busca no catálogo
 */
export interface TreeFilterCriteria {
  searchQuery?: string;
  group?: FieldGroup | 'all';
  collectionGroup?: CollectionGroup | 'all';
  family?: string | 'all';
  confidence?: TreeConfidence | 'all';
  minPlantnetScore?: number; // 0.0 a 1.0
  verificationStatus?: VerificationStatus | 'all';
  hasCoordinatesOnly?: boolean;
  hasPhotosOnly?: boolean;
}

/**
 * Estatísticas multifacetadas para badges da interface
 */
export interface TreeFacetedStats {
  total: number;
  filteredTotal: number;
  byGroup: Record<FieldGroup, number>;
  byStatus: Record<VerificationStatus, number>;
  byConfidence: Record<TreeConfidence, number>;
  families: Array<{ name: string; count: number }>;
  averagePlantnetScore: number;
  withCoordinatesCount: number;
  withPhotosCount: number;
}

/**
 * Converte a entidade interna Tree para o padrão estrito de catálogo acadêmico TreeCatalogItem
 */
export function treeToCatalogItem(tree: Tree): TreeCatalogItem {
  let collectionGroup: CollectionGroup = 'OUTROS';
  if (tree.group === 'groupA' || tree.group === 'groupB') {
    collectionGroup = 'ESQUERDA_LAGO';
  } else if (tree.group === 'groupC') {
    collectionGroup = 'DIREITA_LAGO';
  }

  // Coleta todas as fotos incluindo primaryPhoto se não estiver duplicada na galeria
  const allPhotos: PhotoItem[] = [];
  if (tree.primaryPhoto) {
    allPhotos.push(tree.primaryPhoto);
  }
  for (const p of tree.gallery || []) {
    if (!allPhotos.some((existing) => existing.id === p.id || existing.url === p.url)) {
      allPhotos.push(p);
    }
  }

  const gallery: MediaGallery = allPhotos.map((p, idx) => {
    let type: MediaPhotoType = 'ARVORE_INTEIRA';
    if (p.category === 'folha') type = 'FOLHA';
    else if (p.category === 'fruto' || p.category === 'flor') type = 'FRUTO';
    else if (p.category === 'casca') type = 'CASCA';
    else if (p.category === 'arvore_inteira') type = 'ARVORE_INTEIRA';
    else type = 'TRONCO';

    return {
      id: p.id || `media-${tree.id}-${idx}`,
      url: p.url,
      type,
      caption: p.caption,
      credit: p.credit,
      capturedAt: p.capturedAt
    };
  });

  const plantnetData: PlantNetData | null = tree.plantnet
    ? {
        score: tree.plantnet.score ?? 0,
        plantnetUrl: tree.plantnet.url || tree.plantnet.plantnetUrl || null,
        status:
          tree.plantnet.status ||
          (tree.confidence === 'alta'
            ? 'CONFIRMADO'
            : tree.confidence === 'media'
              ? 'EM_REVISÃO'
              : 'SUGESTÃO'),
        taxon: tree.plantnet.taxon,
        url: tree.plantnet.url,
        familySuggested: tree.plantnet.familySuggested,
        genusSuggested: tree.plantnet.genusSuggested,
        scientificNameWithoutAuthor: tree.plantnet.scientificNameWithoutAuthor,
        gbifId: tree.plantnet.gbifId,
        powoId: tree.plantnet.powoId
      }
    : null;

  return {
    id: tree.id,
    coordinates: {
      lat: tree.latitude ?? -12.7044,
      lng: tree.longitude ?? -60.1189
    },
    popularName: tree.popularName,
    scientificName: tree.scientificNameSuggested ?? null,
    family: tree.family ?? null,
    collectionGroup,
    verificationStatus: tree.verificationStatus,
    plantNetData: plantnetData,
    plantnet: plantnetData,
    collection: {
      collectionGroup,
      collectedAt: tree.collectedAt,
      collectionDate: tree.collectedAt
    },
    gallery
  };
}

/**
 * Converte TreeCatalogItem de volta para a entidade interna Tree
 */
export function catalogItemToTree(item: TreeCatalogItem): Tree {
  const collGroup = item.collectionGroup || item.collection?.collectionGroup;
  let group: FieldGroup = 'groupA';
  if (collGroup === 'DIREITA_LAGO') {
    group = 'groupC';
  } else if (collGroup === 'ESQUERDA_LAGO') {
    group = 'groupA';
  }

  const pNet = item.plantNetData || item.plantnet;
  let confidence: TreeConfidence = 'indeterminada';
  if (pNet) {
    if (pNet.status === 'CONFIRMADO' || (pNet.score ?? 0) >= 0.85) {
      confidence = 'alta';
    } else if (pNet.status === 'EM_REVISÃO' || (pNet.score ?? 0) >= 0.6) {
      confidence = 'media';
    } else if ((pNet.score ?? 0) > 0) {
      confidence = 'baixa';
    }
  }

  const gallery: PhotoItem[] = item.gallery.map((m) => {
    let category: PhotoCategory = 'arvore_inteira';
    if (m.type === 'FOLHA') category = 'folha';
    else if (m.type === 'FRUTO') category = 'fruto';
    else if (m.type === 'CASCA') category = 'casca';
    else if (m.type === 'TRONCO') category = 'outro';
    return {
      id: m.id,
      url: m.url,
      category,
      caption: m.caption,
      credit: m.credit,
      capturedAt: m.capturedAt
    };
  });

  return {
    id: item.id,
    displayNumber: null,
    popularName: item.popularName,
    scientificNameSuggested: item.scientificName ?? 'Espécie indeterminada',
    family: item.family ?? 'Indeterminada',
    confidence,
    latitude: item.coordinates.lat,
    longitude: item.coordinates.lng,
    locationAccuracy: null,
    primaryPhoto: gallery[0] ?? null,
    gallery,
    plantnet: item.plantnet ?? null,
    group,
    collectedAt: item.collection?.collectedAt || item.collection?.collectionDate || new Date().toISOString(),
    verificationStatus: item.verificationStatus || (item.plantnet?.status === 'CONFIRMADO' ? 'verificado' : 'identificacao_preliminar'),
    isMock: false
  };
}

