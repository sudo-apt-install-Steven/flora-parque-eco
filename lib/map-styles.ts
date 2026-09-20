import { StyleSpecification } from 'maplibre-gl';
import { PARK_CONFIG } from '@/lib/park-config';

/**
 * Estilo do Modo SATÉLITE
 * Utiliza tiles raster de satélite mundial com suporte a overlay raster próprio
 */
export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    },
    'park-boundary': {
      type: 'geojson',
      data: '/geo/park-boundary.geojson'
    }
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite-tiles',
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: 'park-boundary-line',
      type: 'line',
      source: 'park-boundary',
      paint: {
        'line-color': '#10b981',
        'line-width': 2,
        'line-dasharray': [3, 2]
      }
    }
  ]
};

/**
 * Estilo do Modo PLANTA (Vetorial)
 * Foco na geometria vetorial do parque: lago, caminhos, pontes, playground e setores
 */
export const PLANTA_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-base': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors'
    },
    'park-planta': {
      type: 'geojson',
      data: '/geo/park-planta.geojson'
    }
  },
  layers: [
    {
      id: 'osm-base-layer',
      type: 'raster',
      source: 'osm-base',
      paint: {
        'raster-saturation': -0.7,
        'raster-opacity': 0.45
      }
    },
    // Área do Campus IFRO
    {
      id: 'planta-ifro-fill',
      type: 'fill',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'instituicao'],
      paint: {
        'fill-color': '#10b981',
        'fill-opacity': 0.12
      }
    },
    {
      id: 'planta-ifro-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'instituicao'],
      paint: {
        'line-color': '#059669',
        'line-width': 1.5,
        'line-dasharray': [4, 2]
      }
    },
    // Lago
    {
      id: 'planta-lago-fill',
      type: 'fill',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'fill-color': '#38bdf8',
        'fill-opacity': 0.75
      }
    },
    {
      id: 'planta-lago-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'line-color': '#0284c7',
        'line-width': 2.5
      }
    },
    // Playground (Estrutura Recente)
    {
      id: 'planta-playground-fill',
      type: 'fill',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'estrutura_nova'],
      paint: {
        'fill-color': '#ec4899',
        'fill-opacity': 0.4
      }
    },
    {
      id: 'planta-playground-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'estrutura_nova'],
      paint: {
        'line-color': '#db2777',
        'line-width': 2
      }
    },
    // Trilhas e Caminhos
    {
      id: 'planta-caminhos',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'caminho'],
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 3,
        'line-dasharray': [2, 2]
      }
    },
    // Ponte
    {
      id: 'planta-ponte',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'estrutura'],
      paint: {
        'line-color': '#d97706',
        'line-width': 5
      }
    },
    // Pontos de entrada
    {
      id: 'planta-pontos',
      type: 'circle',
      source: 'park-planta',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 7,
        'circle-color': '#6366f1',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    }
  ]
};

/**
 * Estilo do Modo EXPLORATION (Expedição Temática Botânica)
 * Tons terrosos, relevo, curvas de nível, zonas de vegetação e marcadores de aventura
 */
export const EXPLORATION_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'exploration-base': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap | Estilo Cartográfico Botânico'
    },
    'park-planta': {
      type: 'geojson',
      data: '/geo/park-planta.geojson'
    },
    'park-exploration': {
      type: 'geojson',
      data: '/geo/park-exploration.geojson'
    }
  },
  layers: [
    {
      id: 'exploration-bg',
      type: 'raster',
      source: 'exploration-base',
      paint: {
        'raster-saturation': -0.9,
        'raster-opacity': 0.35,
        'raster-contrast': 0.2
      }
    },
    // Zonas de vegetação destacadas
    {
      id: 'exp-veg-fill',
      type: 'fill',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'vegetacao_setor'],
      paint: {
        'fill-color': '#15803d',
        'fill-opacity': 0.2
      }
    },
    {
      id: 'exp-veg-stroke',
      type: 'line',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'vegetacao_setor'],
      paint: {
        'line-color': '#166534',
        'line-width': 1.5,
        'line-dasharray': [2, 1]
      }
    },
    // Curvas de nível
    {
      id: 'exp-contours',
      type: 'line',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'curva_nivel'],
      paint: {
        'line-color': ['get', 'strokeColor'],
        'line-width': 1.5
      }
    },
    // Lago estilizado em tom de expedição
    {
      id: 'exp-lago-fill',
      type: 'fill',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'fill-color': '#0284c7',
        'fill-opacity': 0.4
      }
    },
    {
      id: 'exp-lago-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'line-color': '#0369a1',
        'line-width': 2
      }
    },
    // Trilhas de expedição
    {
      id: 'exp-trilhas',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'caminho'],
      paint: {
        'line-color': '#b45309',
        'line-width': 3,
        'line-dasharray': [3, 2]
      }
    },
    // POIs de Exploração
    {
      id: 'exp-pois-circle',
      type: 'circle',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'poi'],
      paint: {
        'circle-radius': 8,
        'circle-color': '#d97706',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    }
  ]
};
