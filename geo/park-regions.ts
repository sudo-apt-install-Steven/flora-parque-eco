/**
 * GeoJSON das 3 Regiões Poligonais Oficiais do Parque Ecológico de Vilhena
 * Calibrado pixel a pixel diretamente sobre a ortofoto aérea/satélite
 */
export const PARK_REGIONS_GEOJSON = {
  "type": "FeatureCollection",
  "name": "park-regions",
  "features": [
    {
      "type": "Feature",
      "id": "groupA",
      "properties": {
        "id": "groupA",
        "group": "groupA",
        "name": "Grupo A — Gramado Noroeste",
        "shortName": "Grupo A",
        "color": "#eab308",
        "fillOpacity": 0.45,
        "strokeColor": "#facc15",
        "strokeWidth": 2.8,
        "description": "Metade oeste do gramado principal em frente ao lago, entre a pista oeste e a metade do parquinho.",
        "treeCount": 4
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -60.122,
              -12.70638
            ],
            [
              -60.12075,
              -12.70638
            ],
            [
              -60.12075,
              -12.70705
            ],
            [
              -60.12135,
              -12.70702
            ],
            [
              -60.12175,
              -12.70698
            ],
            [
              -60.122,
              -12.70708
            ],
            [
              -60.122,
              -12.70638
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "groupB",
      "properties": {
        "id": "groupB",
        "group": "groupB",
        "name": "Grupo B — Gramado Nordeste & Parquinho",
        "shortName": "Grupo B",
        "color": "#06b6d4",
        "fillOpacity": 0.45,
        "strokeColor": "#22d3ee",
        "strokeWidth": 2.8,
        "description": "Metade leste do gramado principal abrangendo o parquinho infantil até a borda da mata leste.",
        "treeCount": 4
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -60.12075,
              -12.70638
            ],
            [
              -60.1199,
              -12.70638
            ],
            [
              -60.1199,
              -12.70695
            ],
            [
              -60.11985,
              -12.7073
            ],
            [
              -60.12035,
              -12.70745
            ],
            [
              -60.12065,
              -12.70725
            ],
            [
              -60.12075,
              -12.70705
            ],
            [
              -60.12075,
              -12.70638
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "groupC",
      "properties": {
        "id": "groupC",
        "group": "groupC",
        "name": "Grupo C — Margem Sul do Lago",
        "shortName": "Grupo C",
        "color": "#ef4444",
        "fillOpacity": 0.45,
        "strokeColor": "#f87171",
        "strokeWidth": 2.8,
        "description": "Faixa contornando toda a margem sul do lago e a pista de caminhada sul.",
        "treeCount": 5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -60.12195,
              -12.70735
            ],
            [
              -60.12155,
              -12.70748
            ],
            [
              -60.12115,
              -12.70762
            ],
            [
              -60.12075,
              -12.7077
            ],
            [
              -60.12035,
              -12.70755
            ],
            [
              -60.11975,
              -12.7073
            ],
            [
              -60.1197,
              -12.70748
            ],
            [
              -60.12035,
              -12.70775
            ],
            [
              -60.12075,
              -12.70792
            ],
            [
              -60.12115,
              -12.70782
            ],
            [
              -60.12155,
              -12.70768
            ],
            [
              -60.12195,
              -12.70755
            ],
            [
              -60.12195,
              -12.70735
            ]
          ]
        ]
      }
    }
  ]
} as const;
