import { Tree, TreeCatalogItem } from '@/lib/tree-schema';

export type GisLayerMode = 'satellite' | 'planta' | 'exploration';

/**
 * Configuração de sobreposição de imagem aérea georreferenciada (drone / ortomosaico)
 * Coordenadas no formato: [Top-Left, Top-Right, Bottom-Right, Bottom-Left] em [lng, lat]
 */
export interface RasterOverlayConfig {
  enabled: boolean;
  url: string;
  coordinates: [
    [number, number], // Top-Left [lng, lat]
    [number, number], // Top-Right [lng, lat]
    [number, number], // Bottom-Right [lng, lat]
    [number, number]  // Bottom-Left [lng, lat]
  ];
  opacity?: number;
}

/**
 * Categorias dos elementos vetoriais da Planta Técnica
 */
export type PlantaCategory =
  | 'agua'            // Lago e corpos d'água
  | 'caminho'         // Pistas pavimentadas e calçadas
  | 'pista'           // Pista de caminhada / atletismo
  | 'estrutura'       // Ponte e passarelas
  | 'ponte'           // Ponte de madeira sobre o lago
  | 'trilha'          // Trilhas ecológicas na mata
  | 'estrutura_nova'  // Playground infantil e quiosques
  | 'playground'      // Parquinho
  | 'instituicao'     // Campus IFRO
  | 'vegetacao_setor';// Zonas botânicas

/**
 * Propriedades validadas de feição vetorial da Planta
 */
export interface PlantaFeatureProperties {
  id?: string;
  name: string;
  category: PlantaCategory;
  description?: string;
  color?: string;
  strokeColor?: string;
  order?: number;
  [key: string]: unknown;
}

/**
 * Resultado de um nó de cluster espacial (Supercluster)
 */
export interface ClusterResult<T = Tree | TreeCatalogItem> {
  id: string | number;
  isCluster: boolean;
  coordinates: [number, number]; // [lng, lat]
  pointCount: number;
  item?: T;
  clusterId?: number;
}

/**
 * Opções de configuração para o algoritmo de clustering espacial
 */
export interface ClusteringOptions {
  minZoom?: number;
  maxZoom?: number;
  radius?: number; // raio de agrupamento em pixels
  extent?: number; // resolução do grid (padrão: 512)
}
