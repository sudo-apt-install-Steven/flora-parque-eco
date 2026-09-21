import { StyleSpecification } from 'maplibre-gl';
import { PARK_REGIONS_GEOJSON } from '@/geo/park-regions';

/**
 * Estilo do Modo SATÉLITE
 * Utiliza tiles raster de satélite mundial com suporte a overlay raster próprio
 */
export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
      ],
      tileSize: 256,
      maxzoom: 21,
      attribution: '&copy; Google Satellite Imagery / Maxar Technologies'
    },
    'park-regions': {
      type: 'geojson',
      data: PARK_REGIONS_GEOJSON as any,
      promoteId: 'id'
    }
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite-tiles',
      minzoom: 0,
      maxzoom: 22,
      paint: {
        'raster-saturation': 0.05,
        'raster-contrast': 0.05,
        'raster-brightness-min': 0.0,
        'raster-brightness-max': 1.0
      }
    },
    // Regiões poligonais dos Grupos A, B e C (Amarelo, Azul, Vermelho)
    {
      id: 'satellite-regions-fill',
      type: 'fill',
      source: 'park-regions',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.52,
          ['boolean', ['feature-state', 'hover'], false],
          0.42,
          0.24
        ]
      }
    },
    {
      id: 'satellite-regions-stroke',
      type: 'line',
      source: 'park-regions',
      paint: {
        'line-color': ['get', 'strokeColor'],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          3.8,
          ['boolean', ['feature-state', 'hover'], false],
          3.2,
          2.0
        ],
        'line-opacity': 0.95
      }
    }
  ]
};

/**
 * Estilo do Modo PLANTA (Vetorial)
 * Foco na geometria vetorial exclusiva do Parque Ecológico: lago, passarela, caminhos, trilhas e playground
 */
export const PLANTA_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'osm-base': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    },
    'park-planta': {
      type: 'geojson',
      data: '/geo/park-planta.geojson'
    },
    'park-regions': {
      type: 'geojson',
      data: PARK_REGIONS_GEOJSON as any,
      promoteId: 'id'
    }
  },
  layers: [
    {
      id: 'planta-paper-base',
      type: 'background',
      paint: {
        'background-color': '#e7e1d0'
      }
    },
    {
      id: 'osm-base-layer',
      type: 'raster',
      source: 'osm-base',
      paint: {
        'raster-saturation': -0.96,
        'raster-opacity': 0.16,
        'raster-contrast': -0.08,
        'raster-brightness-min': 0.22,
        'raster-brightness-max': 0.97
      }
    },
    // Setores de Campo (Grupos A, B, C)
    {
      id: 'planta-regions-fill',
      type: 'fill',
      source: 'park-regions',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.45,
          ['boolean', ['feature-state', 'hover'], false],
          0.35,
          0.18
        ]
      }
    },
    {
      id: 'planta-regions-stroke',
      type: 'line',
      source: 'park-regions',
      paint: {
        'line-color': ['get', 'strokeColor'],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          3.2,
          ['boolean', ['feature-state', 'hover'], false],
          2.6,
          1.6
        ],
        'line-opacity': 0.85
      }
    },
    // Lago do Parque Ecológico
    {
      id: 'planta-lago-fill',
      type: 'fill',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['agua']]],
      paint: {
        'fill-color': '#6a8b90',
        'fill-opacity': 0.42
      }
    },
    {
      id: 'planta-lago-inner',
      type: 'fill',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'fill-color': '#547880',
        'fill-opacity': 0.18
      }
    },
    {
      id: 'planta-lago-shoreline',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'line-color': '#f3efe4',
        'line-width': 4.5,
        'line-opacity': 0.55,
        'line-blur': 0.35
      }
    },
    {
      id: 'planta-lago-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'line-color': '#3d5f66',
        'line-width': 1.15,
        'line-opacity': 0.88
      }
    },
    // Playground / estrutura recente
    {
      id: 'planta-playground-fill',
      type: 'fill',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['estrutura_nova', 'playground']]],
      paint: {
        'fill-color': '#c4a06a',
        'fill-opacity': 0.2
      }
    },
    {
      id: 'planta-playground-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['estrutura_nova', 'playground']]],
      paint: {
        'line-color': '#8a6a3a',
        'line-width': 1,
        'line-dasharray': [3, 2]
      }
    },
    // Pistas de acesso
    {
      id: 'planta-pistas-case',
      type: 'line',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['pista', 'acesso']]],
      paint: {
        'line-color': '#f3efe4',
        'line-width': 7,
        'line-opacity': 0.55
      }
    },
    {
      id: 'planta-pistas',
      type: 'line',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['pista', 'acesso']]],
      paint: {
        'line-color': '#6b5a45',
        'line-width': 2.2,
        'line-opacity': 0.9
      }
    },
    // Trilhas e caminhos
    {
      id: 'planta-caminhos-case',
      type: 'line',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['caminho', 'trilha']]],
      paint: {
        'line-color': '#f4f0e4',
        'line-width': 5.5,
        'line-opacity': 0.62
      }
    },
    {
      id: 'planta-caminhos',
      type: 'line',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['caminho', 'trilha']]],
      paint: {
        'line-color': '#4a5c4e',
        'line-width': 1.7,
        'line-opacity': 0.92,
        'line-dasharray': [3.2, 2.4]
      }
    },
    // Ponte suspensa / travessia
    {
      id: 'planta-ponte-case',
      type: 'line',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['estrutura', 'ponte']]],
      paint: {
        'line-color': '#efe8d6',
        'line-width': 7.5,
        'line-opacity': 0.78
      }
    },
    {
      id: 'planta-ponte',
      type: 'line',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['estrutura', 'ponte']]],
      paint: {
        'line-color': '#7a5a32',
        'line-width': 3.2
      }
    },
    {
      id: 'planta-ponte-centerline',
      type: 'line',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['estrutura', 'ponte']]],
      paint: {
        'line-color': '#f3efe4',
        'line-width': 0.7,
        'line-opacity': 0.85,
        'line-dasharray': [1.2, 1.8]
      }
    },
    // Pontos de entrada
    {
      id: 'planta-pontos-halo',
      type: 'circle',
      source: 'park-planta',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 11,
        'circle-color': '#102a26',
        'circle-opacity': 0.12
      }
    },
    {
      id: 'planta-pontos',
      type: 'circle',
      source: 'park-planta',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 5,
        'circle-color': '#102a26',
        'circle-stroke-width': 1.4,
        'circle-stroke-color': '#c4a06a'
      }
    },
    {
      id: 'planta-labels',
      type: 'symbol',
      source: 'park-planta',
      layout: {
        'text-field': [
          'match',
          ['get', 'category'],
          'agua', 'Lago',
          'estrutura_nova', 'Parquinho',
          'playground', 'Parquinho',
          'estrutura', 'Passarela',
          'ponte', 'Passarela',
          'acesso', 'Acesso',
          ['get', 'name']
        ],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-size': 10,
        'text-letter-spacing': 0.06,
        'text-max-width': 8,
        'text-optional': true
      },
      paint: {
        'text-color': '#24352e',
        'text-halo-color': '#f3efe4',
        'text-halo-width': 1.25,
        'text-opacity': 0.82
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
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
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
    },
    'park-regions': {
      type: 'geojson',
      data: PARK_REGIONS_GEOJSON as any,
      promoteId: 'id'
    }
  },
  layers: [
    {
      id: 'exploration-paper-bg',
      type: 'background',
      paint: {
        'background-color': '#cfc3a0'
      }
    },
    {
      id: 'exploration-bg',
      type: 'raster',
      source: 'exploration-base',
      paint: {
        'raster-saturation': -0.98,
        'raster-opacity': 0.18,
        'raster-contrast': 0.08,
        'raster-brightness-min': 0.18,
        'raster-brightness-max': 0.9
      }
    },
    // Setores de Campo (Grupos A, B, C)
    {
      id: 'exp-regions-fill',
      type: 'fill',
      source: 'park-regions',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.45,
          ['boolean', ['feature-state', 'hover'], false],
          0.35,
          0.18
        ]
      }
    },
    {
      id: 'exp-regions-stroke',
      type: 'line',
      source: 'park-regions',
      paint: {
        'line-color': ['get', 'strokeColor'],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          3.2,
          ['boolean', ['feature-state', 'hover'], false],
          2.6,
          1.6
        ],
        'line-opacity': 0.85
      }
    },
    // Zonas de vegetação / relevo suave
    {
      id: 'exp-veg-fill',
      type: 'fill',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'vegetacao_setor'],
      paint: {
        'fill-color': '#5a6d52',
        'fill-opacity': 0.18
      }
    },
    {
      id: 'exp-veg-stroke',
      type: 'line',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'vegetacao_setor'],
      paint: {
        'line-color': '#3d4c3d',
        'line-width': 0.9,
        'line-opacity': 0.55,
        'line-dasharray': [2.4, 1.6]
      }
    },
    // Curvas de nível — sombra de relevo
    {
      id: 'exp-contours-relief',
      type: 'line',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'curva_nivel'],
      paint: {
        'line-color': '#6d5c3c',
        'line-width': 2.4,
        'line-opacity': 0.16,
        'line-offset': 1.15,
        'line-blur': 0.4
      }
    },
    {
      id: 'exp-contours-case',
      type: 'line',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'curva_nivel'],
      paint: {
        'line-color': '#efe4c4',
        'line-width': 2.6,
        'line-opacity': 0.28
      }
    },
    {
      id: 'exp-contours',
      type: 'line',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'curva_nivel'],
      paint: {
        'line-color': '#7a6644',
        'line-width': 0.85,
        'line-opacity': 0.62
      }
    },
    // Lago estilizado em tom de expedição
    {
      id: 'exp-lago-fill',
      type: 'fill',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'fill-color': '#6a8b90',
        'fill-opacity': 0.32
      }
    },
    {
      id: 'exp-lago-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'line-color': '#3d5f66',
        'line-width': 1.1,
        'line-opacity': 0.82
      }
    },
    // Trilhas de expedição
    {
      id: 'exp-trilhas-case',
      type: 'line',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['caminho', 'trilha', 'pista']]],
      paint: {
        'line-color': '#efe4c4',
        'line-width': 4.4,
        'line-opacity': 0.5
      }
    },
    {
      id: 'exp-trilhas',
      type: 'line',
      source: 'park-planta',
      filter: ['in', ['get', 'category'], ['literal', ['caminho', 'trilha', 'pista']]],
      paint: {
        'line-color': '#6f5430',
        'line-width': 1.6,
        'line-dasharray': [4, 2.4]
      }
    },
    // POIs de Exploração
    {
      id: 'exp-pois-halo',
      type: 'circle',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'poi'],
      paint: {
        'circle-radius': 11,
        'circle-color': '#c4a06a',
        'circle-opacity': 0.16
      }
    },
    {
      id: 'exp-pois-circle',
      type: 'circle',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'poi'],
      paint: {
        'circle-radius': 5,
        'circle-color': '#1b2c26',
        'circle-stroke-width': 1.35,
        'circle-stroke-color': '#c4a06a'
      }
    }
  ]
};
