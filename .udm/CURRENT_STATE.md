# UDM — CURRENT STATE

- **Data:** 2026-09-20
- **Status do Projeto:** Fase de Motor Cartográfico, Modelagem Estrita de Dados, Zustand State Store & PWA Offline Concluída com Auditoria Crítica e Correções de Robustez (Motor GIS Modular + Supercluster Espacial O(N) com Spatial Hash Grid + Zustand 5 Store com Validação Estrita Zod em Tempo de Execução + Service Worker PWA Resiliente com Cache-First & SWR + 78/78 Testes Vitest PASS + Build Next.js 15.5 100% PASS)
- **Agente Responsável:** Antigravity (Lead Data Engineer, GIS Architect & Infrastructure Manager)
- **Branch Git:** `main`
- **Ambiente:** Node.js v22.23.2, npm 10.9.8, Windows 11 IoT Enterprise LTSC, C:\Users\Steven\Documents\FloraParqueEco
- **HD UDM Root:** D:\Universal-Agent-Memory\projects\flora-parque-eco
- **Banco de Dados UDM:** D:\Universal-Agent-Memory\data\udm_v3.db

## 1. Modelagem Rigorosa de Dados (0% `any`, TypeScript Estrito):
1. `TreeCatalogItem`:
   - Identificador estável `id: string`
   - Coordenadas estritas `coordinates: { lat: number; lng: number }`
   - Nomenclatura botânica: `scientificName: string | null`, `popularName: string`, `family: string | null`
   - Sub-objetos tipados: `plantnet: PlantNetData | null`, `collection: CollectionData`, `gallery: MediaGallery`
2. `PlantNetData`:
   - `score: number` (decimal de confiança 0.0 a 1.0)
   - `plantnetUrl: string | null` (link canônico para taxonomia)
   - `status: 'SUGESTÃO' | 'EM_REVISÃO' | 'CONFIRMADO'` (ENUM estrito)
3. `CollectionData`:
   - `collectionGroup: 'ESQUERDA_LAGO' | 'DIREITA_LAGO' | 'OUTROS'` (ENUM estrito)
   - Suporte unificado a `collectedAt: string` e `collectionDate: string`
4. `MediaGallery`:
   - Coleção de fotos com tipagem ENUM estrita: `'ARVORE_INTEIRA' | 'FOLHA' | 'FRUTO' | 'CASCA' | 'TRONCO'`
5. Conversores Bidirecionais:
   - `treeToCatalogItem(tree: Tree): TreeCatalogItem` (preserva `primaryPhoto` na galeria mesmo sem itens adicionais)
   - `catalogItemToTree(item: TreeCatalogItem): Tree`

## 2. Motor Cartográfico Modular GIS & Camadas (`lib/gis/`):
1. Provedores de Camadas Cartográficas:
   - **Camada 1 (Satélite):** Tiles públicos mundiais (Esri World Imagery) + infraestrutura de suporte a raster overlay georreferenciado local (drone/ortomosaico via `applyRasterOverlay` / `removeRasterOverlay`), ordenado estritamente abaixo dos marcadores vetoriais.
   - **Camada 2 (Planta Técnica):** Ingestão e validação estrita via Zod (`ingestPlantaGeoJSON`) dos elementos vetoriais do parque: lago (`agua`), pistas (`pista`/`caminho`), ponte (`ponte`/`estrutura`), trilhas (`trilha`), playground (`playground`/`estrutura_nova`) e campus IFRO (`instituicao`).
   - **Camada 3 (Exploração):** Base map topográfico botânico com relevo e curvas de nível pronto para aplicação de styling visual.
2. Agrupamento Espacial de Alta Performance (Supercluster):
   - Implementação em TypeScript puro de índice espacial Web Mercator (`SpatialClusterIndex` / `createSupercluster`) otimizado com Grid Espacial (Spatial Hash Grid O(N)), suporte a bounding boxes em qualquer orientação, agregação ponderada, `getClusterExpansionZoom` e `getClusterLeaves`.
   - Configuração MapLibre GL nativa acelerada por GPU (`cluster: true`, `clusterRadius: 45`, `clusterMaxZoom: 17`).
3. Auditoria de Re-renders:
   - `MapContainerComponent` encapsulado com `React.memo` para evitar re-renderizações desnecessárias do canvas WebGL quando o root state sofre alterações.

## 3. Gerenciamento de Estado Global (`lib/store/tree-store.ts`):
1. Store Centralizada (Zustand 5):
   - Actions estritas: `initializeCatalog(data)`, `setLayerMode(mode)`, `focusTree(id)`, `filterByFamily(family)`, `filterByGroup(group)`.
   - Validação estrita via Zod em `initializeCatalog`, rejeitando registros corrompidos e blindando os seletores contra falhas em cascata.
   - Suporte a filtros territoriais abrangentes: `filterByGroup('ESQUERDA_LAGO')` filtra simultaneamente `groupA` e `groupB`.
   - Tratamento de estados assíncronos e de falha: `isLoading: boolean`, `hasError: boolean`, `errorMessage: string | null`, `setIsLoading()`, `setHasError()`.
2. Hooks e Seletores Disponíveis:
   - `useActiveTree()`, `useFilteredCatalog()`, `useFilterActions()`, `useCatalogStatus()`, `useTreeStore()`.

## 4. Progressive Web App & Estratégia Offline (`public/sw.js` & `lib/pwa/`):
1. `public/manifest.json`: Manifesto PWA completo para execução em modo standalone no parque, com ícones reais vinculados (`icon.svg`, `icon-dark-32x32.png`, `apple-icon.png`, `favicon.ico`).
2. Service Worker (`public/sw.js`):
   - **Cache-First:** para assets vitais da UI (CSS, JS, fontes) e SVGs cartográficos/GeoJSONs (`/geo/*`, `.svg`), com fallback seguro de GeoJSON vazio (`FeatureCollection`) prevenindo erros de sintaxe JSON.
   - **Stale-While-Revalidate:** para arquivos de dados do catálogo botânico JSON/CSV (`/data/*`, `mock-trees.json`, `.json`, `.csv`).
   - **Network-First com fallback:** para navegação HTML do app shell.
   - **Instalação Resiliente:** `Promise.allSettled` garantindo que falhas de assets individuais não cancelem o pré-cache.
3. Hook Utilitário:
   - `useOfflineStatus()` em `lib/pwa/use-offline-status.ts` fornecendo `{ isOnline, isOffline, wasOffline, isServiceWorkerReady }` com detecção de controlador ativo.

## 5. Qualidade & Testes (QA):
- **Suíte de Testes:** 78/78 testes aprovados no Vitest em 10 arquivos (`fallbacks.test.ts`, `filters.test.ts`, `gis-engine.test.ts`, `ingestion.test.ts`, `pwa.test.ts`, `schema-models.test.ts`, `store.test.ts`, `store-strict.test.ts`, `trees.test.ts`, `ui.test.ts`).
- **TypeScript:** 0 erros de compilação em `npx tsc --noEmit` em modo estrito.
- **Build de Produção:** Next.js 15.5 gerando 100% de rotas estáticas pré-renderizadas com sucesso (`npm run build`).
- **Integridade Visual:** 0 alterações em layout visual React, classes Tailwind ou paleta de cores.
