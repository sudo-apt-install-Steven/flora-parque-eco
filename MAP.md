# Arquitetura Cartográfica e GIS — MAP.md

## 1. Visão Geral do Sistema Cartográfico

O mapa é a **experiência central e primária** da aplicação. Todo o fluxo do visitante inicia no mapa georreferenciado e centrado no **Parque Ecológico Municipal Marechal Cândido Rondon**, adjacente ao **IFRO Campus Vilhena** (Vilhena/RO).

- **Motor:** [MapLibre GL JS](https://maplibre.org/)
- **Renderização:** WebGL 2.0 acelerado por hardware a 60 FPS
- **Centro Padrão:** `[-60.1189, -12.7044]` (Longitude, Latitude)
- **Zoom Padrão:** `16.5` (Nível de detalhe de trilhas e árvores)
- **Bounding Box Restrito:** O usuário é mantido dentro do quadrilátero do parque (`maxBounds: [[-60.1350, -12.7180], [-60.1030, -12.6900]]`), impedindo perda de navegação em áreas urbanas distantes.

---

## 2. Os Três Modos de Mapa

### 2.1. Modo SATÉLITE
- **Tiles de Satélite:** Imagens orbitais mundiais (Esri World Imagery) para contexto aéreo.
- **Suporte a Imagem Própria / Ortomosaico de Drone (`customRasterOverlay`):**
  - A imagem de satélite padrão disponível publicamente é antiga e não retrata obras recentes.
  - A arquitetura disponibiliza a abstração `PARK_CONFIG.customRasterOverlay` para plugar uma imagem raster de drone de alta resolução (`.png` / `.webp` georreferenciado) com coordenadas de 4 cantos, sem necessidade de reescrever o código.

### 2.2. Modo PLANTA (Camada Vetorial)
- **Fonte:** `geo/park-planta.geojson`
- **Elementos Representados:**
  - **Lago do Parque:** Polígono hídrico (Rio Barão do Melgaço) estilizado em azul translúcido;
  - **Ponte:** Linha de travessia e passarela de pedestres;
  - **Trilhas e Caminhos:** Traçados pontilhados diferenciados para a margem esquerda e margem direita;
  - **Playground Infantil (Estrutura Recente):** Polígono reservado para o parquinho recente, atendendo ao requisito de representar infraestrutura não visível em satélites antigos;
  - **Área Acadêmica do IFRO:** Polígono de demarcação do campus.

### 2.3. Modo EXPLORATION (Expedição Botânica)
- **Inspiração:** Cartografia de exploração naturalista e expedições botânicas clássicas, sem cópia de propriedades intelectuais ou uso de assets proprietários.
- **Características:**
  - **Altimetria e Curvas de Nível:** Linhas de contorno a cada 5 metros (`geo/park-exploration.geojson`);
  - **Zonas de Mata Ciliar:** Polígonos de vegetação densa com preenchimento em verde florestal texturizado;
  - **Pontos Notáveis (POIs):** Marcadores para mirante do lago, nascentes e bosques de alta densidade;
  - **Paleta Terrosa:** Tons de pergaminho, sépia e esmeralda.

---

## 3. Camada de Marcadores e Clustering de Alto Desempenho

Quando o catálogo arbóreo atingir centenas ou milhares de árvores, renderizar marcadores individuais no DOM causaria perda severa de fluidez no mobile.

A arquitetura resolve isso através de **Clustering Nativo no MapLibre GL**:
- **Fonte GeoJSON Única:** `trees-source` com `cluster: true`, `clusterRadius: 45` e `clusterMaxZoom: 17`.
- **Clusters Agrupados:**
  - Círculos dimensionados e coloridos dinamicamente pelo número de espécimes (`< 5`, `5-15`, `> 15`).
  - Clique no cluster executa `getClusterExpansionZoom()` e anima a câmera suavemente para desagrupar.
- **Árvores Individuais (Desagrupadas):**
  - Marcadores circulares com anéis coloridos de acordo com a equipe de campo:
    - `Verde (#10b981)`: Grupo A (Margem esquerda norte)
    - `Azul (#3b82f6)`: Grupo B (Margem esquerda sul)
    - `Âmbar (#f59e0b)`: Grupo C (Margem direita)
  - Clique na árvore dispara o evento `onSelectTree`, centraliza o mapa e abre a ficha detalhada (Bottom Sheet no celular ou Sidebar no desktop).

---

## 4. Controles Integrados

- **Navegação:** Bússola 3D e botões de zoom (`NavigationControl`).
- **GPS do Visitante:** Localização em tempo real (`GeolocateControl`) com círculo de precisão, permitindo que o visitante no parque caminhe e veja sua posição relativa às árvores.
- **Escala Métrica:** Régua de distância métrica em metros (`ScaleControl`).
