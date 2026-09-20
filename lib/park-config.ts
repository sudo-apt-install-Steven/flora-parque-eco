/**
 * Configuração cartográfica e geográfica do Parque Ecológico Marechal Cândido Rondon
 * Vilhena - Rondônia - Brasil / IFRO Campus Vilhena
 */

export interface MapLayerMode {
  id: 'satellite' | 'planta' | 'exploration';
  name: string;
  description: string;
  badge: string;
}

export const PARK_CONFIG = {
  name: 'Parque Ecológico Municipal Marechal Cândido Rondon',
  institution: 'IFRO Campus Vilhena',
  municipality: 'Vilhena — RO',
  
  // Coordenadas centrais focadas na área do Parque e IFRO
  center: [-60.1189, -12.7044] as [number, number], // [lng, lat]
  
  // Níveis de zoom
  defaultZoom: 16.5,
  minZoom: 14.5,
  maxZoom: 20,

  // Limites geográficos (bounding box) para manter o visitante focado no parque
  // [minLng, minLat, maxLng, maxLat]
  maxBounds: [
    [-60.1350, -12.7180],
    [-60.1030, -12.6900]
  ] as [[number, number], [number, number]],

  // Modos de mapa suportados
  modes: [
    {
      id: 'satellite',
      name: 'Satélite',
      description: 'Imagem aérea com suporte a satélite ao vivo e ortomosaico próprio.',
      badge: 'Aéreo'
    },
    {
      id: 'planta',
      name: 'Planta',
      description: 'Camada vetorial estilizada do parque: lago, pontes, trilhas e playground.',
      badge: 'Vetorial'
    },
    {
      id: 'exploration',
      name: 'Exploração',
      description: 'Estilo temático de expedição botânica: relevo suave, caminhos e setores.',
      badge: 'Expedição'
    }
  ] as const,

  // Slot para imagem raster aérea própria (drone/ortomosaico georreferenciado futuro)
  customRasterOverlay: {
    enabled: false, // Ativar quando a imagem recente de drone estiver disponível
    url: '/geo/aerial-orthomosaic-placeholder.png',
    coordinates: [
      [-60.1250, -12.6980], // top-left
      [-60.1120, -12.6980], // top-right
      [-60.1120, -12.7100], // bottom-right
      [-60.1250, -12.7100]  // bottom-left
    ]
  },

  // Definição dos grupos de campo acadêmicos
  fieldGroups: {
    groupA: {
      name: 'Grupo A',
      locationDescription: 'Margem esquerda do lago (Setor Norte)',
      color: '#10b981' // emerald
    },
    groupB: {
      name: 'Grupo B',
      locationDescription: 'Margem esquerda do lago (Setor Sul)',
      color: '#3b82f6' // blue
    },
    groupC: {
      name: 'Grupo C',
      locationDescription: 'Margem direita do lago (Trilha Principal)',
      color: '#f59e0b' // amber
    }
  }
};
