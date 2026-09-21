# UDM — DECISION RECORDS (ADRs)

## ADR-001: Seleção de Framework Web e Estilização
- **Data:** 2026-09-20
- **Status:** ACEITO
- **Decisão:** Adotar **Next.js 15+ (App Router)** com **React 19**, **TypeScript** e **Tailwind CSS**.
- **Justificativa:**
  - Padrão moderno de excelência e compatibilidade nativa com componentes gerados pelo v0 (shadcn UI / Tailwind).
  - Deploy com zero configuração na Vercel.
  - Carregamento rápido em smartphones via compressão automática de imagens (`next/image`) e code-splitting.

## ADR-002: Motor de Mapas — MapLibre GL JS
- **Data:** 2026-09-20
- **Status:** ACEITO
- **Decisão:** Utilizar **MapLibre GL JS** (`maplibre-gl`) em vez de Mapbox GL JS ou Leaflet puro.
- **Justificativa:**
  - 100% open-source, licença BSD permissiva, sem necessidade de tokens pagos, limites de visualização ou fatura surpresa.
  - Renderização acelerada por GPU (WebGL) fluida a 60 FPS em celulares.
  - Suporte nativo a camadas raster (satélite Esri/OSM e raster overlays locais), bem como camadas GeoJSON vetoriais ricas com clustering dinâmico no client.

## ADR-003: Armazenamento e Governança de Dados (Zero-DB / Git Versioned)
- **Data:** 2026-09-20
- **Status:** ACEITO
- **Decisão:** O catálogo arbóreo inicial residirá em arquivos versionados `JSON` e `GeoJSON` no repositório Git, validados estritamente via **Zod** em tempo de compilação e execução.
- **Justificativa:**
  - Elimina despesas e complexidade operacional de banco de dados e APIs de autenticação para a fase atual do projeto.
  - Permite revisão por pares acadêmicos via Pull Requests Git.
  - Suporta migração futura sem atrito para Supabase PostgreSQL / PostGIS quando houver painel administrativo e autenticação.

## ADR-004: Modelo de Dados Arbóreo e Numeração Inicial
- **Data:** 2026-09-20
- **Status:** ACEITO
- **Decisão:** O campo `displayNumber` deve ser inicializado estritamente como `null`.
- **Justificativa:** As árvores do parque ainda não possuem placas físicas com números definitivos instaladas. O identificador único e estável de cada árvore será `id` (slug ou UUID estável).

## ADR-005: Desacoplamento Arquitetural (DATA, MAP, UI, LOGIC)
- **Data:** 2026-09-20
- **Status:** ACEITO
- **Decisão:** Separar o sistema em quatro camadas estritas:
  1. `DATA`: Schemas Zod, tipos TypeScript, fontes GeoJSON e JSON versionado.
  2. `MAP`: Camada WebGL, renderização MapLibre, estilos e controladores de camadas.
  3. `UI`: Componentes visuais atômicos e compostos (Bottom Sheet, Sidebar, Botões, Badges, Modais) prontos para substituição ou estilização pelo design do v0.
  4. `LOGIC`: Hooks e estado global de navegação, seleção de espécimes e filtros de busca.

## ADR-006: Motor GIS Modular, Agrupamento Espacial (Supercluster) e Offline-First PWA
- **Data:** 2026-09-20
- **Status:** ACEITO
- **Decisão:**
  1. Criar um motor cartográfico desacoplado (`lib/gis/`) suportando 3 modos de dados: Satélite (com imagem pública e slot de ortomosaico de drone georreferenciado), Planta Técnica (ingestão validada de lago, pistas, ponte, trilhas, parquinho e IFRO via GeoJSON) e Exploração (curvas de nível e relevo botânico).
  2. Implementar algoritmo de clustering espacial hierárquico puro em TypeScript (`SpatialClusterIndex` / Supercluster) para Web Mercator, permitindo agregação fluida de nós sem latência no pan/zoom.
  3. Adotar estratégia de Progressive Web App (PWA) nativa com Service Worker (`public/sw.js`):
     - `Cache-First`: para assets estáticos vitais da UI e SVGs cartográficos.
     - `Stale-While-Revalidate`: para catálogo botânico JSON/CSV.
     - `Network-First`: para navegação HTML com fallback para App Shell.
  4. Manter 100% de isolamento entre a infraestrutura de dados/mapas e os componentes visuais de UI, assegurando memoização (`React.memo`) para mitigar re-renders desnecessários no canvas WebGL.
- **Justificativa:** Áreas remotas do Parque Ecológico em Vilhena possuem sinal celular instável; a experiência do visitante e do pesquisador de campo precisa funcionar com latência zero e suporte contínuo offline.

