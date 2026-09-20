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
  id: z.string(),
  url: z.string().url(),
  thumbUrl: z.string().url().optional(),
  category: PhotoCategorySchema,
  caption: z.string().optional(),
  credit: z.string().optional(),
  capturedAt: z.string().optional()
});
export type PhotoItem = z.infer<typeof PhotoItemSchema>;

/**
 * Informações de identificação assistida pelo PlantNet
 */
export const PlantNetDataSchema = z.object({
  taxon: z.string().optional(),
  score: z.number().min(0).max(1).optional(),
  url: z.string().url().optional(),
  familySuggested: z.string().optional()
});
export type PlantNetData = z.infer<typeof PlantNetDataSchema>;

/**
 * Grupos de campo do levantamento arbóreo
 * - groupA: Lado esquerdo do lago
 * - groupB: Lado esquerdo do lago
 * - groupC: Lado direito do lago
 */
export const FieldGroupSchema = z.enum(['groupA', 'groupB', 'groupC']);
export type FieldGroup = z.infer<typeof FieldGroupSchema>;

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
  id: z.string(),

  // Número visível em placa física — OBRIGATORIAMENTE NULL inicialmente
  displayNumber: z.number().nullable(),

  // Nomenclatura
  popularName: z.string(),
  scientificNameSuggested: z.string(),
  family: z.string(),

  // Confiança da identificação preliminar
  confidence: z.enum(['baixa', 'media', 'alta', 'indeterminada']),

  // Coordenadas geográficas (podem ser nulas se ainda não georreferenciadas)
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  locationAccuracy: z.number().nullable(), // em metros (ex: GPS/EXIF)

  // Fotos
  primaryPhoto: PhotoItemSchema.nullable(),
  gallery: z.array(PhotoItemSchema),

  // Identificação assistida por IA/PlantNet
  plantnet: PlantNetDataSchema.nullable(),

  // Grupo de levantamento em campo
  group: FieldGroupSchema,

  // Metadados de coleta e verificação
  collectedAt: z.string(), // ISO date
  verificationStatus: VerificationStatusSchema,
  notes: z.string().optional(),

  // Flag explicativa para mocks acadêmicos
  isMock: z.boolean().default(false)
});

export type Tree = z.infer<typeof TreeSchema>;
