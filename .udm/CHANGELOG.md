# UDM — CHANGELOG

## [0.4.1] — 2026-09-20 [ANTIGRAVITY: CORE/DATA]

### Corrigido & Aprimorado
- **Preservação de Fotos Primárias (`lib/tree-schema.ts`):**
  - `treeToCatalogItem`: Garantida inclusão da foto principal (`primaryPhoto`) na galeria `gallery` (`MediaGallery`) mesmo quando `tree.gallery` for vazia, eliminando perda de imagens na conversão bidirecional.
  - `CollectionDataSchema`: Suporte unificado tanto para `collectedAt` quanto para `collectionDate` na modelagem acadêmica.
  - `PhotoCategory`: Mapeamento aprimorado de fotos botânicas florais ('flor') para 'FRUTO' em vez de 'TRONCO'.
- **Blindagem e Validação no Zustand Store (`lib/store/tree-store.ts`):**
  - `initializeCatalog`: Implementada validação estrita em tempo de execução via `TreeCatalogItemSchema.safeParse` e `TreeSchema.safeParse`, prevenindo injeção de dados corrompidos e eliminando crashes em cascata no motor de busca (`filterTrees`).
  - Reset inteligente de `selectedTreeId` quando o espécime previamente selecionado não constar no catálogo recém-inicializado.
- **Filtro Acadêmico e Territorial Abrangente (`lib/filters.ts` & `lib/store/tree-store.ts`):**
  - `filterByGroup('ESQUERDA_LAGO')`: Agora agrega e filtra simultaneamente os espécimes do Setor Norte (`groupA`) e do Setor Sul (`groupB`), corrigindo omissão de espécimes da margem esquerda do lago.
  - `filterByGroup('DIREITA_LAGO')`: Mapeia estritamente para `groupC` (Trilha Principal).
  - Preservação de compatibilidade total com os componentes de UI (`FieldGroup | 'all'`).
- **Compatibilidade MapLibre GL no Conversor GeoJSON (`lib/gis/layers.ts`):**
  - `catalogToGeoJSON`: Mapeamento automático de `collectionGroup` acadêmico para o `group` cartográfico (`groupA`, `groupB`, `groupC`), garantindo que os medalhões WebGL recebam suas cores corretas (Esmeralda, Azul, Âmbar).
  - `applyRasterOverlay`: Inserção controlada antes das camadas de árvores (`clusters-halo`, `clusters`, `unclustered-point`), garantindo que ortomosaicos de drone nunca obstruam os marcadores ou hitboxes de toque.
- **Otimização de Escala do Supercluster (`lib/gis/clustering.ts`):**
  - Implementado Grid Espacial (Spatial Hash Grid) no `clusterAtZoom`, reduzindo a complexidade de agrupamento de O(N^2) para O(N) e permitindo processar milhares de pontos em milissegundos.
  - Normalização automática de coordenadas em `getClusters` para suportar bounding boxes invertidos.
- **Resiliência e Fallbacks Offline no PWA (`public/sw.js` & `lib/pwa/`):**
  - Precaching resiliente via `Promise.allSettled` no Service Worker, eliminando falhas catastróficas de cache em caso de assets faltantes.
  - Fallback offline exclusivo para requisições `/geo/*` retornando GeoJSON válido (`FeatureCollection` vazia) em vez de SVG, prevenindo exceções de `JSON.parse`.
  - Cópia física de ícones e assets (`icon.svg`, `icon-dark-32x32.png`, `apple-icon.png`, `favicon.ico`) para `public/`.
  - `useOfflineStatus()` enriquecido para reconhecer o controlador do Service Worker ativo imediatamente.
- **Suíte de Testes Expandida:**
  - 78/78 testes aprovados no Vitest (10/10 suítes, 100% PASS).
  - Build estático Next.js 15.5 gerado com 100% de sucesso e 0 erros de compilação TypeScript.

## [0.4.0] — 2026-09-20 [ANTIGRAVITY: CORE/DATA]

### Adicionado
- **Modelagem Rigorosa de Dados (`lib/tree-schema.ts`):**
  - Definição estrita das tipagens `TreeCatalogItem`, `PlantNetData`, `CollectionData` e `MediaGallery` com 0% `any`.
  - Enums de verificação botânica: `PlantNetStatus` ('SUGESTÃO', 'EM_REVISÃO', 'CONFIRMADO'), `CollectionGroup` ('ESQUERDA_LAGO', 'DIREITA_LAGO', 'OUTROS') e `MediaPhotoType` ('ARVORE_INTEIRA', 'FOLHA', 'FRUTO', 'CASCA', 'TRONCO').
  - Conversores bidirecionais entre a entidade interna `Tree` e o modelo acadêmico `TreeCatalogItem` (`treeToCatalogItem`, `catalogItemToTree`).
- **Motor Cartográfico Modular GIS & Camadas (`lib/gis/`):**
  - Módulo `lib/gis/gis-engine.ts` com classe `GisEngine` para gerenciar o ciclo de vida do MapLibre GL e alternar entre os 3 provedores: Satélite, Planta Técnica e Exploração.
  - Suporte completo a sobreposição de raster local georreferenciado (drone/ortomosaico em alta resolução) com controle de opacidade via `applyRasterOverlay` e `removeRasterOverlay` (`lib/gis/layers.ts`).
  - Funções de ingestão e validação GeoJSON para a Planta Técnica (`ingestPlantaGeoJSON`), segregando lago, caminhos, pistas, ponte, trilhas, playground e prédios institucionais do IFRO.
  - Conversor unificado `catalogToGeoJSON` para árvores e itens de catálogo.
- **Agrupamento Espacial Hierárquico Puro (Supercluster):**
  - Módulo `lib/gis/clustering.ts` contendo `SpatialClusterIndex` e `createSupercluster`: projeção Web Mercator, agrupamento ponderado por raio em pixels, expansão dinâmica de zoom (`getClusterExpansionZoom`) e recuperação de folhas (`getClusterLeaves`).
- **Actions Estritas e Tratamento de Erros no Zustand Store (`lib/store/tree-store.ts`):**
  - Novas actions estritas: `initializeCatalog(data)`, `setLayerMode(mode)`, `focusTree(id)`, `filterByFamily(family)`, `filterByGroup(group)`.
  - Tratamento de estados assíncronos e de falhas: `isLoading: boolean`, `hasError: boolean`, `errorMessage: string | null`, `setIsLoading()`, `setHasError()`.
  - Novo hook seletor `useCatalogStatus()`.
- **Progressive Web App & Estratégia Offline:**
  - Manifesto PWA em `public/manifest.json` configurado com tema Deep Forest (`#0b211d`) e modo `standalone`.
  - Service Worker `public/sw.js` com estratégia `Cache-First` para arquivos vitais da UI e SVGs cartográficos/GeoJSONs, e estratégia `Stale-While-Revalidate` para o catálogo botânico JSON/CSV.
  - Hook utilitário `useOfflineStatus()` em `lib/pwa/use-offline-status.ts` com monitoramento de conectividade em tempo real e auto-registro do Service Worker.
- **Auditoria de Performance e Memoização:**
  - Componente cartográfico `MapContainer` envolvido em `React.memo` para evitar re-renderizações espúrias do canvas WebGL.
- **Expansão da Suíte de Testes Automatizados:**
  - `test/schema-models.test.ts`: Validação estrita de schemas Zod e conversores bidirecionais (7 testes).
  - `test/gis-engine.test.ts`: Testes do algoritmo Supercluster, projeção Mercator e ingestão de GeoJSON (9 testes).
  - `test/store-strict.test.ts`: Testes das actions estritas, inicialização e tratamento de erros (7 testes).
  - `test/pwa.test.ts`: Testes de estratégias de Service Worker, manifesto e conectividade (4 testes).
  - Total geral da suíte: 74/74 testes aprovados no Vitest (100% PASS).

## [0.3.0] — 2026-09-20 (Engenharia de Dados, Gerenciamento de Estado Global Zustand & QA de Resiliência)


### Adicionado
- **Tipagem Estrita Zod & Modelos Canônicos (`lib/tree-schema.ts`):**
  - Definição completa de tipos TypeScript estritos (0% `any`): `Tree`, `SafeTree`, `TreeConfidence`, `TreeFilterCriteria`, `TreeFacetedStats`, `IngestionResult`, `ExifGpsRawData`, `PlantNetRawResult`.
  - Enums padronizados para status de identificação botânica (`unverified`, `plantnet_high`, `plantnet_medium`, `botanist_confirmed`).
  - Regra canônica: `displayNumber` é estritamente `null` por padrão (ausência de placas físicas no parque).
- **Módulo de Blindagem de Dados & Fallbacks (`lib/fallbacks.ts`):**
  - Função `getSafeTree()` que sanitiza em tempo de execução qualquer objeto ou registro de espécime com campos nulos ou corrompidos.
  - Constante `DEFAULT_FALLBACK_PHOTO` contendo SVG vetorial em data URI com tema botânico (gradiente Deep Forest), sem qualquer dependência de rede externa.
  - Constante `DEFAULT_FALLBACK_PLANTNET` com score zero e status pendente.
  - Formatadores resilientes de coordenadas geográficas, números de placa e badges de confiança/equipe.
- **Mecanismo de Filtros e Busca Diacrítica (`lib/filters.ts`):**
  - Função `normalizeSearchString()` que remove acentos (NFD) e pontuação para comparações normalizadas.
  - Busca multi-token: todas as palavras da consulta devem casar com o nome científico, comum, família ou ID do espécime.
  - Função `filterTrees()` suportando filtros simultâneos de Família, Confiança, Equipe de Coleta (Grupos A, B, C) e Status.
  - Função `calculateFacetedStats()` para agregação em tempo real de contagens e distribuição.
- **Pipeline de Ingestão de Dados de Campo (`lib/ingestion/`):**
  - `csv-parser.ts`: Parser RFC 4180 puro sem dependências externas, com autodeteção de delimitador (`,` ou `;`), suporte a campos entre aspas e dicionário inteligente de cabeçalhos pt-BR/en.
  - `exif-extractor.ts`: Conversor geográfico de coordenadas DMS (Graus, Minutos, Segundos) para Graus Decimais com referências cardeais N/S/E/W e precisão de GPS.
  - `plantnet-mapper.ts`: Mapeador de respostas de API PlantNet v2 com clamping de scores, links canônicos para GBIF/POWO e cálculo de recomendação de confiança.
  - `pipeline.ts`: Pipeline mestre de ingestão `ingestTreeRecords()` com sanitização, desduplicação de IDs e algoritmo de correção geográfica para Vilhena/RO (detecção e correção de latitude positiva acidental e inversão de eixos Lat/Lng).
- **Gerenciador de Estado Global Zustand (`lib/store/tree-store.ts`):**
  - Implementação da store reativa `useTreeStore` com Zustand 5.
  - Seletores atômicos memoizados: `useActiveTree()`, `useFilteredCatalog()`, `useFilterCriteria()`, `useFilterActions()`, `useFacetedStats()`.
  - Sincronização automática com histórico e query params da URL (`?tree=slug`).
  - Ações de atualização e importação de novos catálogos de dados (`importData`).
- **Suíte de Testes Automatizados Vitest:**
  - `test/fallbacks.test.ts`: Testes de resiliência e integridade de fallbacks (6 testes).
  - `test/filters.test.ts`: Testes de normalização diacrítica, busca multi-token e facetas (8 testes).
  - `test/ingestion.test.ts`: Testes de parsers CSV, EXIF, PlantNet, bounding box e inversão de coordenadas (15 testes).
  - `test/store.test.ts`: Testes de estado global Zustand, filtros e sincronização (5 testes).
  - Total da suíte: 47/47 testes aprovados.

### Aprimorado
- `app/page.tsx`: Conectado diretamente aos seletores reativos do Zustand store, mantendo 100% dos estilos CSS, Tailwind v4 e renderização WebGL do MapLibre intactos.
- `lib/trees.ts`: Atualizado como fachada canônica compatível com as funções legadas.

---

## [0.2.1] — 2026-09-20 (Refino de UI, Marcador Ativo MapLibre, Gestos e Conectores Antigravity)

### Corrigido & Aprimorado
- **Marcador Ativo do v0 no MapLibre:** Integrado componente `maplibregl.Marker` com ícone SVG de folha e animação de respiração (`breathe` / `.marker-pulse`), renderizado exatamente nas coordenadas do espécime selecionado e removido ao fechar.
- **Bug de Re-centralização ("Centralizar no mapa"):** Implementada prop `focusKey` e incremento de estado para garantir que a câmera do MapLibre volte e foque no espécime mesmo se a árvore já estiver selecionada.
- **Ancoragem e Gestos no Bottom Sheet Mobile:**
  - Corrigida a ancoragem do painel móvel de `bottom-16` para `bottom-0 z-50` com suporte a `pb-safe`, eliminando vão flutuante inferior.
  - Adicionado backdrop scrim (`z-40`) permitindo fechar o painel com toque fora.
  - Implementado listener de gestos táteis (`onTouchStart`/`onTouchEnd`) no puxador (*panel handle*), fechando o painel em caso de swipe down superior a 50px.
- **Sincronização de URL & Compartilhamento:**
  - Sincronização automática da barra de endereços do navegador (`?tree=slug`) via `history.replaceState`.
  - Atualizado botão de compartilhar para gerar URL com query parameter seguro (`?tree=mock-tree-001`).
  - Substituído `alert()` bloqueante por feedback visual não-intrusivo ("Link copiado!").
- **Conectores Antigravity 2.0 & MCP:**
  - Corrigida a rota do servidor MCP `udm-memory` em `~/.gemini/config/mcp_config.json` e `settings.json`, apontando para o binário Node.js real em `D:\Universal-Agent-Memory\repo\universal-development-memory\packages\retrieval-broker\dist\src\index.js`.
  - Expandido o `vibe-coder-plugin` com 3 novos skills de ponta: `full-ai-architecture`, `maplibre-spatial-craft` e `tailwind-v4-motion`.
- **Harmonização Visual dos Modais:**
  - Estilizados `LegendModal` e `StatisticsModal` com a paleta botânica editorial (Warm Paper `#f8f6ef`, Deep Forest `#0b211d` e Warm Gold `#d6a35b`).
- **Testes:**
  - Adicionado teste em `test/ui.test.ts` para validação de URL de compartilhamento (12/12 testes PASS).

---

## [0.2.0] — 2026-09-20 (Integração Cirúrgica do Design v0)
...
