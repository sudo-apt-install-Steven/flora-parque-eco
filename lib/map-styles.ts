import { StyleSpecification } from 'maplibre-gl';

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
      maxzoom: 22,
      paint: {
        'raster-saturation': -0.08,
        'raster-contrast': 0.08,
        'raster-brightness-min': 0.04,
        'raster-brightness-max': 0.9
      }
    },
    {
      id: 'satellite-boundary-glow',
      type: 'line',
      source: 'park-boundary',
      paint: {
        'line-color': '#d6a35b',
        'line-width': 7,
        'line-opacity': 0.18,
        'line-blur': 2
      }
    },
    {
      id: 'satellite-boundary-line',
      type: 'line',
      source: 'park-boundary',
      paint: {
        'line-color': '#f0c77b',
        'line-width': 1.6,
        'line-opacity': 0.95,
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
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
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
      id: 'planta-paper-base',
      type: 'background',
      paint: {
        'background-color': '#ece6d6'
      }
    },
    {
      id: 'osm-base-layer',
      type: 'raster',
      source: 'osm-base',
      paint: {
        'raster-saturation': -0.92,
        'raster-opacity': 0.22,
        'raster-contrast': -0.05,
        'raster-brightness-min': 0.18,
        'raster-brightness-max': 0.98
      }
    },
    // Área do Campus IFRO
    {
      id: 'planta-ifro-fill',
      type: 'fill',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'instituicao'],
      paint: {
        'fill-color': '#52775e',
        'fill-opacity': 0.12
      }
    },
    {
      id: 'planta-ifro-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'instituicao'],
      paint: {
        'line-color': '#355d46',
        'line-width': 1.5,
        'line-opacity': 0.85,
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
        'fill-color': '#25778b',
        'fill-opacity': 0.68
      }
    },
    {
      id: 'planta-lago-shoreline',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'line-color': '#f8f6ef',
        'line-width': 5,
        'line-opacity': 0.5,
        'line-blur': 0.2
      }
    },
    {
      id: 'planta-lago-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'line-color': '#155f70',
        'line-width': 1.8,
        'line-opacity': 0.92
      }
    },
    // Playground (Estrutura Recente)
    {
      id: 'planta-playground-fill',
      type: 'fill',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'estrutura_nova'],
      paint: {
        'fill-color': '#d6a35b',
        'fill-opacity': 0.28
      }
    },
    {
      id: 'planta-playground-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'estrutura_nova'],
      paint: {
        'line-color': '#a07232',
        'line-width': 1.6,
        'line-dasharray': [2, 1.5]
      }
    },
    // Trilhas e Caminhos
    {
      id: 'planta-caminhos-case',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'caminho'],
      paint: {
        'line-color': '#f8f6ef',
        'line-width': 6,
        'line-opacity': 0.72
      }
    },
    {
      id: 'planta-caminhos',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'caminho'],
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 2.6,
        'line-opacity': 0.9,
        'line-dasharray': [2, 2]
      }
    },
    // Ponte
    {
      id: 'planta-ponte-case',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'estrutura'],
      paint: {
        'line-color': '#f8f6ef',
        'line-width': 7,
        'line-opacity': 0.8
      }
    },
    {
      id: 'planta-ponte',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'estrutura'],
      paint: {
        'line-color': '#a07232',
        'line-width': 4.2
      }
    },
    // Pontos de entrada
    {
      id: 'planta-pontos-halo',
      type: 'circle',
      source: 'park-planta',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 12,
        'circle-color': '#102a26',
        'circle-opacity': 0.16
      }
    },
    {
      id: 'planta-pontos',
      type: 'circle',
      source: 'park-planta',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 6,
        'circle-color': '#102a26',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#d6a35b'
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
    }
  },
  layers: [
    {
      id: 'exploration-paper-bg',
      type: 'background',
      paint: {
        'background-color': '#d9c99a'
      }
    },
    {
      id: 'exploration-bg',
      type: 'raster',
      source: 'exploration-base',
      paint: {
        'raster-saturation': -0.95,
        'raster-opacity': 0.25,
        'raster-contrast': 0.12,
        'raster-brightness-min': 0.15,
        'raster-brightness-max': 0.95
      }
    },
    // Zonas de vegetação destacadas
    {
      id: 'exp-veg-fill',
      type: 'fill',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'vegetacao_setor'],
      paint: {
        'fill-color': '#355d46',
        'fill-opacity': 0.26
      }
    },
    {
      id: 'exp-veg-stroke',
      type: 'line',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'vegetacao_setor'],
      paint: {
        'line-color': '#183d35',
        'line-width': 1.4,
        'line-opacity': 0.86,
        'line-dasharray': [2, 1]
      }
    },
    // Curvas de nível
    {
      id: 'exp-contours-case',
      type: 'line',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'curva_nivel'],
      paint: {
        'line-color': '#f1e4bd',
        'line-width': 3.4,
        'line-opacity': 0.35
      }
    },
    {
      id: 'exp-contours',
      type: 'line',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'curva_nivel'],
      paint: {
        'line-color': ['get', 'strokeColor'],
        'line-width': 1.25,
        'line-opacity': 0.78
      }
    },
    // Lago estilizado em tom de expedição
    {
      id: 'exp-lago-fill',
      type: 'fill',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'fill-color': '#25778b',
        'fill-opacity': 0.38
      }
    },
    {
      id: 'exp-lago-stroke',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'agua'],
      paint: {
        'line-color': '#155f70',
        'line-width': 1.8,
        'line-opacity': 0.9
      }
    },
    // Trilhas de expedição
    {
      id: 'exp-trilhas-case',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'caminho'],
      paint: {
        'line-color': '#f1e4bd',
        'line-width': 5.2,
        'line-opacity': 0.7
      }
    },
    {
      id: 'exp-trilhas',
      type: 'line',
      source: 'park-planta',
      filter: ['==', ['get', 'category'], 'caminho'],
      paint: {
        'line-color': '#9a6a2f',
        'line-width': 2.6,
        'line-dasharray': [3, 2]
      }
    },
    // POIs de Exploração
    {
      id: 'exp-pois-halo',
      type: 'circle',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'poi'],
      paint: {
        'circle-radius': 13,
        'circle-color': '#d6a35b',
        'circle-opacity': 0.2
      }
    },
    {
      id: 'exp-pois-circle',
      type: 'circle',
      source: 'park-exploration',
      filter: ['==', ['get', 'category'], 'poi'],
      paint: {
        'circle-radius': 6.5,
        'circle-color': '#0b211d',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#d6a35b'
      }
    }
  ]
};
