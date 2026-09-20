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
  url: z.string().url('URL da foto deve ser válida'),
  thumbUrl: z.string().url('URL da miniatura deve ser válida').optional(),
  category: PhotoCategorySchema,
  caption: z.string().optional(),
  credit: z.string().optional(),
  capturedAt: z.string().optional(),
  isFallback: z.boolean().optional()
});
export type PhotoItem = z.infer<typeof PhotoItemSchema>;

/**
 * Informações de identificação assistida pelo PlantNet
 */
export const PlantNetDataSchema = z.object({
  taxon: z.string().optional(),
  score: z.number().min(0).max(1).optional(),
  url: z.string().url('URL do PlantNet deve ser válida').optional(),
  familySuggested: z.string().optional(),
  genusSuggested: z.string().optional(),
  scientificNameWithoutAuthor: z.string().optional(),
  gbifId: z.string().optional(),
  powoId: z.string().optional()
});
export type PlantNetData = z.infer<typeof PlantNetDataSchema>;

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
