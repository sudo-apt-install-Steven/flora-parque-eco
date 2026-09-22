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

## ADR-007: QR Code Deep Linking e Roteamento SSG (`/tree/[id]`) com FlyTo Imediato
- **Data:** 2026-09-20
- **Status:** ACEITO
- **Decisão:**
  1. Implementar a rota dinâmica `app/tree/[id]/page.tsx` com `generateStaticParams()` em Next.js 15 App Router para pré-renderização estática total (SSG) de cada ficha de espécime.
  2. Desacoplar o orquestrador de UI em `components/ParkInventoryApp.tsx`, aceitando `initialTreeId?: string`.
  3. Ao acessar a rota `/tree/[id]`, o sistema inicializa o mapa, executa a animação de câmera suave `flyTo` até as coordenadas exatas do espécime e abre automaticamente a ficha botânica completa sem exigir cliques extras do visitante do parque.
  4. Manter sincronização na rota `/` via `window.history.replaceState` (`?tree=slug`) para links compartilháveis sem recarregamento.
- **Justificativa:** As árvores do parque receberão placas físicas com QR Codes. A leitura de campo precisa abrir a página instantaneamente, mesmo em conectividade móvel limitada, posicionando o usuário geograficamente e exibindo as características botânicas sem fricção de navegação.

## ADR-008: Hierarquia Visual Editorial e Desacoplamento da Galeria Anatômica
- **Data:** 2026-09-20
- **Status:** ACEITO
- **Decisão:**
  1. Estruturar a ficha do espécime (`TreeDetail.tsx`) segundo hierarquia visual estrita:
     - 1. Foto principal dominante (`TreeHeroPhoto`) com proporção áurea e trigger de zoom.
     - 2. Identificação com tipografia editorial clássica (Georgia serif itálico para nome científico e semiserif para popular) com badges de status de verificação botânica.
     - 3. Barra visual estilizada com progresso PlantNet Score (%) e gradiente dinâmico de confiança.
     - 4. Carrossel deslizante anatômico (`TreePhotoCarousel`) com categorização fotográfica (`Árvore Inteira`, `Folha`, `Fruto/Flor`, `Casca`, `Tronco`) e modal de alta resolução.
     - 5. Fatos de campo e georreferenciamento (DMS e Graus Decimais).
     - 6. Ação cartográfica destacada "Centralizar no Mapa".
- **Justificativa:** A catalogação botânica acadêmica requer clareza na distinção morfológica das partes da árvore e confiabilidade científica das determinações feitas via IA, apresentadas de forma elegante e intuitiva para o público geral e pesquisadores.

## ADR-009: Calibração Cartográfica (Google Satellite Super Zoom 22) e Desacoplamento Territorial Parque Ecológico vs. IFRO
- **Data:** 2026-09-21
- **Status:** ACEITO
- **Decisão:**
  1. Adotar **Google Satellite** (`https://mt{0-3}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}`) como provedor raster oficial em `lib/map-styles.ts`, com `maxzoom: 21` e overzoom de alta precisão até nível **22** no MapLibre GL JS, substituindo o Esri World Imagery (que limitava a zoom 18 em Vilhena/RO).
  2. Desacoplar territorialmente o Parque Ecológico Municipal Marechal Cândido Rondon do campus do IFRO Vilhena (localizado na BR-174). Todas as 3 camadas (Satélite, Planta Técnica e Exploração) foram limpas de quaisquer camadas, polígonos ou rótulos de instituição do IFRO (`planta-ifro-*`), restringindo-se estritamente ao perímetro do parque e seu lago (`geo/park-boundary.geojson`, `geo/park-planta.geojson`, `geo/park-exploration.geojson`).
  3. Reconstruir a geometria do lago com base no traçado vetorial real do OpenStreetMap (`way 1309514171`), incluindo a passarela diagonal de madeira que cruza o lago e as trilhas da mata.
  4. Cadastrar no `data/mock-trees.json` os 13 espécimes reais georreferenciados identificados no catálogo florístico de campo ("Trilha Leste / Lago"), com conformidade 100% ao `TreeSchema` do Zod, galeria com `PhotoItemSchema` e obediência absoluta à Regra de Ouro nº 2 (`displayNumber: null`).
- **Justificativa:** O inventário arbóreo pertence ao Parque Ecológico Municipal; sobreposições territoriais com o IFRO distorciam a cartografia e impediam o zoom métrico na copa das árvores catalogadas ao longo da trilha do lago.

## ADR-010: Interatividade GIS via WebGL Feature-State, Isolamento de Renderização com React.memo e Acessibilidade WCAG AA
- **Data:** 2026-09-21
- **Status:** ACEITO
- **Decisão:**
  1. Utilizar manipulação de `feature-state` na GPU (`map.setFeatureState`) no MapLibre GL JS para alternar os estados `NORMAL`, `HOVER` e `SELECTED` nos pontos de árvores e polígonos de regiões de campo (`park-regions`), proibindo re-renderizações ou refações de GeoJSON durante interações de mouse/toque.
  2. Encapsular `MapContainerComponent` em `React.memo` com comparação rasa de props, e utilizar seletores atômicos no Zustand 5 (`useTotalTrees`, `useUniqueSpecies`, `useFamilyCounts`, etc.) para desacoplar totalmente o ciclo de vida do canvas WebGL da árvore de componentes React da UI.
  3. Adotar semântica ARIA estrita (`role="radiogroup"`, `role="radio"`, `role="region"`, `role="dialog"` com `aria-modal="true"`) com garantia de contraste > 12:1 no tema botânico Warm Paper / Deep Forest, atendendo à conformidade WCAG AA.
  4. Manter resiliência universal com `getSafeTree()` para campos nulos e criar `app/not-found.tsx` temático para garantir integridade do build estático Next.js SSG.
- **Justificativa:** O mapa é o elemento mais pesado da interface; desacoplar a renderização WebGL do estado de UI garante 60 FPS estáveis mesmo em smartphones de entrada em campo, ao mesmo tempo em que proporciona acessibilidade e blindagem contra erros de dados em tempo de execução.

## ADR-011: Galeria Contextual de Espécimes e Preservação de Fotos Locais
- **Data:** 2026-09-22
- **Status:** ACEITO
- **Decisão:** A tela de espécies abre uma ficha/galeria contextual no próprio catálogo. A navegação ao mapa só ocorre pela ação explícita “Centralizar este espécime no mapa”. O pipeline de ingestão preserva `primaryPhoto` e `gallery` validados pelo `PhotoItemSchema`, inclusive caminhos locais com espaços e Unicode.
- **Justificativa:** O catálogo é uma experiência de consulta independente do mapa e as fotos de campo são evidência exclusiva de cada espécime. Descartá-las no pipeline produzia thumbnails brancas e eliminava a galeria real.

## ADR-012: Prioridade de Camadas e Setores no Mobile
- **Data:** 2026-09-22
- **Status:** ACEITO
- **Decisão:** O seletor de camadas deve permanecer acima da navegação móvel e o gatilho de setores deve ocupar uma faixa própria abaixo dos chips de grupos; o painel de levantamento usa altura dinâmica baseada em viewport.
- **Justificativa:** A sobreposição de hitboxes impedia selecionar Exploração e confundia os toques em “Áreas do levantamento” e nos grupos A/B/C.

## ADR-013: Motion Design Progressivo e Reduced Motion
- **Data:** 2026-09-22
- **Status:** ACEITO
- **Decisão:** Animações curtas e escalonadas para entradas e feedbacks, com `prefers-reduced-motion` desativando movimento não essencial.
- **Justificativa:** Aumentar clareza e resposta no celular sem sobrecarregar a experiência cartográfica.



