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
  
  // Coordenadas centrais focadas exatamente no Lago e Trilhas do Parque Ecológico
  center: [-60.1212, -12.7073] as [number, number], // [lng, lat]
  
  // Níveis de zoom
  defaultZoom: 17.8,
  minZoom: 15.0,
  maxZoom: 22, // Permite super zoom em satélite e planta para inspeção de árvores individuais

  // Limites geográficos (bounding box) para manter o visitante focado estritamente no Parque Ecológico
  // [minLng, minLat, maxLng, maxLat]
  maxBounds: [
    [-60.1290, -12.7140],
    [-60.1130, -12.7010]
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
    ] as [[number, number], [number, number], [number, number], [number, number]],
    opacity: 0.85
  },

  // Definição dos grupos de campo acadêmicos e suas regiões
  fieldGroups: {
    groupA: {
      name: 'Grupo A',
      locationDescription: 'Gramado Noroeste (em frente ao Lago)',
      color: '#eab308' // amarelo
    },
    groupB: {
      name: 'Grupo B',
      locationDescription: 'Gramado Nordeste & Parquinho Infantil',
      color: '#06b6d4' // ciano (conforme imagem de referência)
    },
    groupC: {
      name: 'Grupo C',
      locationDescription: 'Faixa da Margem Sul do Lago',
      color: '#ef4444' // vermelho
    }
  }
};
