# UDM — CHANGELOG

## [1.6.0] — 2026-09-22 [COPILOT — GALERIA DE ESPÉCIMES, PIPELINE DE FOTOS E MOBILE]

### Corrigido
- Corrigida a causa raiz das thumbnails brancas em `lib/ingestion/pipeline.ts`: fotos locais e galerias não eram preservadas durante a ingestão inicial.
- `PhotoItemSchema` agora valida as fotos preservadas do JSON antes de compor o catálogo em Zustand.
- Atualizadas expectativas obsoletas dos testes que ainda esperavam os 13 mocks da fase anterior; a base atual possui 33 espécimes reais.

### Adicionado
### Adicionado
- Clique em espécime na tela “Espécies” abre galeria/ficha contextual sem navegar para o mapa.
- Galeria com foto principal, thumbnails exclusivas da árvore, navegação anterior/próxima, setas, ESC, swipe, loading e fallback.
- “Centralizar este espécime no mapa” mantido como ação explícita dentro da ficha.
- Modal mobile com rolagem própria, foco visível, áreas de toque e ocultação temporária da navegação inferior para evitar sobreposição.
- `prefers-reduced-motion` aplicado aos estados animados.

### Validação
- 154 caminhos de fotos auditados contra `public/trees/`: 0 ausentes.
- TypeScript: ✅ 0 erros.
- Vitest: ✅ 85/85 testes em 12 suítes.
- Build Next.js: ✅ 37 páginas estáticas.
- Inspeção visual em produção desktop/mobile: fotos reais, galeria, ESC, teclado, ação de mapa e console sem erros da aplicação.

## [1.7.0] — 2026-09-22 [COPILOT — CORREÇÃO DE POSICIONAMENTO MOBILE DO MAPA]

- Corrigida a terceira camada inacessível: seletor elevado acima da navegação inferior (`z-40`, `bottom-24` mobile).
- Corrigida sobreposição entre chips de grupos e o gatilho “Áreas do levantamento”.
- Corrigida estabilidade do painel de setores em telas pequenas com `88dvh`, `min-h-0`, rolagem e touch targets.
- Validação visual em 375x812: Exploração ativa, Grupo B selecionável e lista do setor visível.

## [1.5.0] — 2026-09-22 [KIRO — CATÁLOGO REAL, FOTOS LOCAIS, POLÍGONOS FINALIZADOS]

### Reconstruído
- **`data/mock-trees.json` — 32 Espécimes Reais:**
  - Substituídos os 13 espécimes de calibração pelos 32 espécimes reais coletados em campo.
  - **Grupo A (5):** `tree-a-02-jacaranda` (*Jacaranda mimosifolia*), `tree-a-03-hibiscus` (*Hibiscus rosa-sinensis*), `tree-a-04-spathodea` (*Spathodea campanulata*), `tree-a-05-ipomoea` (*Ipomoea carnea*), `tree-a-06-mangifera` (*Mangifera indica*).
  - **Grupo B (14):** `tree-b-01-eucalyptus` (*Eucalyptus urophylla*), `tree-b-07-mangifera-1`, `tree-b-08-wodyetia` (*Wodyetia bifurcata*), `tree-b-09-psidium` (*Psidium guajava*), `tree-b-10-jacaranda`, `tree-b-11-pachira` (*Pachira aquatica*), `tree-b-12-cascabela` (*Cascabela thevetia*), `tree-b-13-inga-laurina` (*Inga laurina*), `tree-b-14-mangifera-2`, `tree-b-15-syzygium` (*Syzygium malaccense*), `tree-b-16-jacaranda-cusp` (*Jacaranda cuspidifolia*), `tree-b-17-trema` (*Trema micrantha*), `tree-b-18-ipomoea`, `tree-b-19-bismarckia` (*Bismarckia nobilis*), `tree-b-20-jacaranda-2`.
  - **Grupo C (13):** `tree-c-01-jacaranda` a `tree-c-13-vochysia-2` — incluindo *Cojoba arborea*, *Tapirira guianensis*, *Eucalyptus regnans*, *Ceiba pentandra*, *Acacia mangium*, *Tabebuia rosea* (×3), *Vochysia haenkeana* (×2).
  - Todos com `displayNumber: null`, `isMock: false`, fotos reais de `/public/trees/grupo-[a|b|c]/`.

### Adicionado
- **`lib/utils.ts` — `safeImgSrc()`:** Função de percent-encoding de caminhos locais com espaços e caracteres Unicode (ex: `×` em `Hibiscus × rosa-sinensis`). URLs externas http/https passam sem modificação.
- **Polígonos A/B/C recalibrados (`geo/park-regions.ts` + `public/geo/park-regions.geojson`):** Geometria ampliada e mais fiel à imagem de referência do usuário. Grupo A cobre o gramado noroeste completo; Grupo B engloba o parquinho infantil e a orla leste; Grupo C contorna a margem sul do lago em faixa curva até o sudeste. `treeCount` atualizado: A=5, B=14, C=13.

### Corrigido
- **Cor Grupo B → Ciano `#06b6d4`** (era azul `#3b82f6`, inconsistente com a imagem de referência): corrigido em `park-config.ts`, `MapContainer.tsx`, `MapFieldOverlay.tsx`, `geo/park-regions.ts` e `public/geo/park-regions.geojson`.
- **`next/image` substituído por `<img>` + `safeImgSrc`** em `TreeGallery.tsx`, `TreeDetail.tsx`, `RegionTreeList.tsx` e `SpeciesCatalogView.tsx` — resolve 404s por caminhos com espaços e Unicode não-encoded em build de produção.
- **`RegionTreeList.tsx`** — imports limpos (`Trees`, `Sparkles`, `MapPin` removidos, não utilizados).

### Validação
- **Build SSG Next.js 15.5:** ✅ 37 páginas estáticas geradas (32 rotas `/tree/[id]` + raiz + not-found + outros), 0 erros.
- **TypeScript `tsc --noEmit`:** ✅ 0 erros.



### Corrigido & Calibrado (Polígonos dos Grupos A, B e C, Renderização WebGL e Ingestão)
- **Calibração Fina dos Polígonos de Campo Conforme Foto Aérea de Referência (`media_1789998447091.jpg`):**
  - **Grupo A (Gramado Noroeste - Amarelo `#eab308`):** Delimitado precisamente sobre a metade oeste do gramado norte em frente ao lago, estendendo-se da pista oeste até a linha divisória vertical que bissecta o centro do parquinho circular (`lng = -60.12095`), contornando a margem norte d'água sem adentrar o lago.
  - **Grupo B (Gramado Nordeste & Parquinho - Ciano `#06b6d4`):** Começa na linha divisória do parquinho (encostando no Grupo A), cobre a metade leste do círculo do parquinho e o gramado até a borda da mata norte e leste, limitando-se ao sul pela curva nordeste da margem do lago.
  - **Grupo C (Faixa da Margem Sul - Vermelho `#ef4444`):** Faixa contínua com espessura rente à pista de caminhada sul (~12-15m) colada na margem d'água sul do lago, do oeste ao sudeste.
  - Removido qualquer desvio para rodovias, pátios de caminhões ou floresta profunda.
- **Reposicionamento Validado das 13 Árvores:**
  - Todas as 13 árvores em `data/mock-trees.json` reposicionadas para dentro dos novos perímetros e validadas 100% geometricamente via algoritmo ray-casting (point-in-polygon).
- **Resolução de Renderização do `DynamicMap.tsx`:**
  - Substituição do `dynamic()` por importação direta com montagem client-side pós-hidratação (`mounted`), eliminando o deadlock do suspense do Next.js 15 e erros do Webpack.
- **Service Worker e Cache Busting:**
  - Cache version incrementado para `v9` com estratégia Network-First para rotas `/geo/`.
- **Validação Automatizada:**
  - 85/85 testes Vitest PASS.
  - `npm run build` gerando todas as 17 páginas estáticas com 0 erros.

### Adicionado & Auditado (Interatividade Completa GIS WebGL, Auto-Auditoria e Resiliência)
- **Interatividade Completa do Motor GIS WebGL (MapLibre GL JS):**
  - Alternância plenamente funcional entre as 3 camadas cartográficas: Satélite (Google Satellite com super zoom até 22 e suporte a ortofoto), Planta Técnica (lago pílula, passarela de madeira, caminhos e parquinho) e Exploração (expedição com curvas de nível e relevo botânico).
  - Gerenciamento de estados dos marcadores via WebGL `feature-state` nativo na GPU (`NORMAL`, `HOVER`, `SELECTED`), eliminando re-renderizações e reconstrução de GeoJSON em tempo de execução.
  - Sincronização bidirecional entre cliques em marcadores no canvas WebGL e abertura imediata do `TreePanel` (desktop) ou Bottom Sheet (mobile).
  - Injeção dinâmica do marcador HTML ativo (`selectedMarkerRef`) com animação pulsante (`marker-pulse`) e SVG botânico.
  - Expansão dinâmica de clusters com interpolação suave `easeTo` no Supercluster (`clusterMaxZoom: 17`, `clusterRadius: 45`).
  - Interação completa com os polígonos dos setores de coleta (`park-regions` dos Grupos A, B e C): destaque de borda e cursor pointer no hover, clique com voo suave da câmera (`fitBounds`/`flyTo`) e abertura automática da gaveta `RegionTreeList`.
- **Auto-Auditoria de Performance e Memoização Rigorosa:**
  - `MapContainerComponent` blindado com `React.memo` para isolar completamente o canvas WebGL a 60 FPS contra re-renders disparados por digitação em buscas, abertura de modais ou filtros.
  - `useMemo` empregado para converter e estabilizar dados de árvores e coleções GeoJSON.
  - Manipulação de hover via refs mutáveis (`useRef`) e `map.setFeatureState`, sem causar re-render na árvore de componentes React.
  - Seletores atômicos e derivados do Zustand 5 (`useTotalTrees`, `useUniqueSpecies`, `useFamilyCounts`, `useFilteredCatalog`, `useActiveTree`) prevenindo cascatas de re-renderização durante o pan/zoom.
- **Acessibilidade e Conformidade WCAG AA (a11y):**
  - Revisão e adição de atributos semânticos ARIA: `LayerSwitcher` com `role="radiogroup"`, `role="radio"`, `aria-checked` e `aria-label`; painel lateral com `role="region"` / `role="dialog"` e `aria-modal="true"`.
  - Contraste de texto testado e superior a 12:1 no tema Warm Paper (`#f8f6ef`) sobre Deep Forest (`#102a26`), ultrapassando com folga o mínimo de 4.5:1 exigido pela WCAG AA.
  - Estilos explícitos de foco via teclado (`focus-visible:ring-2 focus-visible:ring-emerald-500`) em todos os elementos táteis e botões.
- **Resiliência Visual e Blindagem de Dados Ausentes:**
  - Todos os acessos a dados no `TreeDetail` e `RegionTreeList` mediados por `getSafeTree()` em `lib/fallbacks.ts`.
  - Tratamento elegante para ausência de `scientificNameSuggested`: exibe placeholder estilizado *"Em identificação botânica"* em itálico sem quebrar o grid.
  - Tratamento para fotos ausentes: fallback automático para SVG vetorial em data URI (`DEFAULT_FALLBACK_PHOTO`) sem dependência de rede externa.
  - Tratamento para PlantNet score zerado ou nulo: exibe badge de análise taxonômica pendente em vez de barra vazia.
- **Página 404 e Integridade de Build Next.js SSG:**
  - Criado `app/not-found.tsx` com identidade visual botânica Deep Forest (`#0b211d`) e botão de retorno ao mapa principal, assegurando geração estática 100% limpa no App Router.
- **Garantia de Qualidade e Conformidade:**
  - 85/85 testes Vitest aprovados em 12 arquivos (100% PASS).
  - 0 erros na checagem estrita de tipos TypeScript (`tsc --noEmit -p tsconfig.json`).
  - Build estático SSG Next.js 15.5 gerando 17 páginas estáticas com 100% de sucesso.


### Adicionado & Aprimorado (Regiões de Coleta, Cartografia Fiel e Satélite Principal)
- **Satélite como Camada Principal e Padrão:**
  - `lib/store/tree-store.ts`: `layerMode` inicial definido permanentemente como `'satellite'`.
  - Zoom livre até nível 22 com Google Satellite + fallback Esri World Imagery.
  - Linha amarela listrada gigante (`satellite-boundary-line`) totalmente removida.
- **Geometria Calibrada do Lago e da Passarela:**
  - **Lago Pílula (Pill-shaped):** Formato arredondado suave (`-60.1220` a `-60.1207`, `-12.7070` a `-12.7077`) sincronizado nas 3 camadas cartográficas (Satélite, Planta e Exploração).
  - **Passarela Transversal de Madeira:** Traçado reto cortando de NW (`[-60.12182, -12.70692]`) para SE (`[-60.12118, -12.70761]`).
  - **Parquinho Infantil:** Círculo no gramado nordeste (`[-60.12080, -12.70682]`).
- **3 Regiões Poligonais Interativas (Grupos de Campo A, B e C):**
  - `geo/park-regions.geojson` e `public/geo/park-regions.geojson`: polígonos representativos das equipes de coleta:
    - **Grupo A (Amarelo `#eab308`):** Setor Noroeste (Gramado Norte e acesso).
    - **Grupo B (Azul `#3b82f6`):** Setor Nordeste (Parquinho e gramado leste).
    - **Grupo C (Vermelho `#ef4444`):** Faixa Sul do Lago e Trilha Ciliar.
  - Interatividade no MapLibre GL: realce dinâmico com borda acentuada ao passar o mouse (`cursor: pointer`), seleção por clique, voo suave da câmera (`fitBounds`/`flyTo`) e abertura automática da gaveta lateral.
- **Gaveta de Inventário da Região (`RegionTreeList.tsx`):**
  - Listagem dos indivíduos catalogados por setor geográfico.
  - Carrossel fotográfico integrado com tags anatômicas.
  - **Link Direto do PlantNet:** Acesso instantâneo à identificação botânica com botão externo seguro (`target="_blank" rel="noopener noreferrer"`).
  - Ação de navegação para a ficha botânica completa (`TreeDetail`).
- **Estruturação de Diretórios para Fotos do Usuário (`public/trees/`):**
  - Pastas `public/trees/grupo-a/`, `public/trees/grupo-b/`, `public/trees/grupo-c/` criadas com `.gitkeep` e `README.md` detalhado.
- **Garantia de Qualidade e Compilação:**
  - 85/85 testes Vitest aprovados (100% PASS).
  - `npx tsc --noEmit` com 0 erros de tipagem.
  - Build estático SSG Next.js 15.5 gerando 17 páginas estáticas com 0 erros.

## [1.1.0] — 2026-09-21 [ANTIGRAVITY: GIS CALIBRATION & BOTANICAL INVENTORY]

### Corrigido & Aprimorado (Calibração Cartográfica e Catálogo Real)
- **Super Zoom de Satélite (Zoom até 22):**
  - Substituída a fonte raster de satélite por Google Satellite (`https://mt{0-3}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}`) com `maxzoom: 21` e overzoom de alta precisão até nível 22 no MapLibre GL.
  - Tiles verificados e testados com resolução métrica nítida para a copa das árvores do Parque Ecológico.
- **Desacoplamento Territorial e Remoção do IFRO nas 3 Camadas:**
  - `geo/park-boundary.geojson`: Polígono redesenhado para delimitar exclusivamente o Parque Ecológico Municipal Marechal Cândido Rondon, eliminando qualquer sobreposição ao campus do IFRO na BR-174.
  - `geo/park-planta.geojson`: Planta técnica vetorial reconstruída com a geometria real do lago (OSM way 1309514171), passarela sobre as águas, parquinho infantil e trilhas da mata. Removidas todas as camadas e polígonos de `instituicao` / IFRO.
  - `geo/park-exploration.geojson`: Camada topográfica com curvas de nível e zonas botânicas calibradas estritamente no perímetro do parque.
  - `lib/map-styles.ts`: Removidas as regras de estilo de preenchimento e hachuras do IFRO (`planta-ifro-fill`, `planta-ifro-hatch`, `planta-ifro-stroke` e rótulo `IFRO`).
- **Cadastramento dos 13 Espécimes Reais da Trilha Leste / Lago:**
  - `data/mock-trees.json`: 13 indivíduos reais georreferenciados ao longo da margem sul do lago e trilha da mata (`mock-tree-001` a `mock-tree-013`), identificados pelo levantamento florístico IFRO (Jacarandá, Guapuruvu, Árvore com Oco, Eucalipto, Mangueira, Paineira, Quaresmeira, Ipê Passarela, Árvore Cadeado, Árvore Bifurcada, Árvore Quiosque, Árvore Fim Trilha).
  - Obediência rigorosa à Regra de Ouro nº 2 (`displayNumber: null`) e validação 100% de `PhotoItemSchema`.
- **Garantia de Qualidade e Build:**
  - 85/85 testes no Vitest aprovados (100% PASS).
  - `npx tsc --noEmit` com 0 erros.
  - `npm run build` do Next.js gerando 17 páginas estáticas com sucesso.

## [RELEASE v1.0.0-MVP] — 2026-09-20 [LEAD DEVOPS & RELEASE MANAGER]

### Release & Lançamento de Produção
- **Higienização e Sanity Check:**
  - Configuração rigorosa do `.gitignore` com exclusão de `*.log`, `.env*.local`, caches, temporários, `node_modules/`, `.next/` e `dist/`.
  - Verificação de integridade com TypeScript estrito (`npx tsc --noEmit` — 0 erros) e build de produção estático SSG Next.js 15.5 (`npm run build` — 100% PASS).
  - Suíte de 85/85 testes automatizados aprovada no Vitest em 12 arquivos (100% PASS).
- **Versionamento Git:**
  - Repositório Git estabelecido na branch padrão `main`.
  - Commit atômico de lançamento: `feat: inventario arboreo digital - parque ecologico ifro vilhena (core, gis e camadas)`.
  - Configuração do remote `origin` apontando para `https://github.com/sudo-apt-install-Steven/parque-ecologico-inventario.git`.
- **Consolidação UDM:**
  - Status e documentação consolidados em `CURRENT_STATE.md`, `TASKS.md`, `AGENT_HANDOFF.md` e espelhados em `D:\Universal-Agent-Memory`.

## [0.5.0] — 2026-09-20 [ANTIGRAVITY: MASTER FULL-STACK EXECUTION]

### Adicionado & Arquitetado (Conclusão Integral das Fases 1 a 5)
- **Fase 1: Infraestrutura de Dados e Estado Global Centralizado:**
  - `TreeCatalogItem`: modelo de dados estrito (0% `any`) em `lib/tree-schema.ts` com identificadores estáveis, georreferenciamento exato, dados taxonômicos, status de verificação, score PlantNet v2, grupo territorial e galeria categorizada.
  - `lib/store/tree-store.ts`: Zustand 5 store central com actions canônicas `initializeTrees()` e `selectTree(id)`, e novos hooks seletores derivados de alta performance: `useTotalTrees()` (`selectTotalTrees`), `useUniqueSpecies()` (`selectUniqueSpecies`) e `useFamilyCounts()` (`selectFamilyCounts`).
  - Suíte de 4 testes unitários dedicados em `test/phase1-models-store.test.ts` cobrindo modelagem e seletores derivados.
- **Fase 2: Motor Cartográfico Base com Supercluster & Memoização:**
  - `components/map/MapContainer.tsx` memoizado com `React.memo`, blindando o canvas WebGL a 60 FPS contra re-renderizações acidentais acionadas pela UI.
  - Gerenciamento otimizado de estados de feature no MapLibre GL (`setFeatureState`) e renderização em 3 modos: Satélite + Ortomosaico de Drone IFRO, Planta Técnica vetorial (GeoJSON validado) e Exploração botânica topográfica.
  - Agrupamento nativo MapLibre GPU + algoritmo puro em TypeScript `SpatialClusterIndex` com Spatial Hash Grid $O(N)$.
- **Fase 3: UI Premium, Hierarquia Editorial & Design System:**
  - `components/tree/TreeGallery.tsx`: Desacoplamento arquitetural em `TreeHeroPhoto` (proporção áurea dominante com badge de equipe e zoom modal) e `TreePhotoCarousel` (carrossel horizontal suave snap-x com chips de partes botânicas e visualizador em alta resolução com `next/image`).
  - `components/tree/TreeDetail.tsx`: Reestruturação completa segundo a hierarquia visual estrita: Foto Dominante -> Nome Científico e Popular com status de campo -> Barra de progresso PlantNet Score (%) com gradiente dinâmico -> Carrossel anatômico deslizante -> Fatos de campo e geolocalização -> Ação destacada "Centralizar no Mapa".
  - `components/ui/LayerSwitcher.tsx`: Controle flutuante com amostras visuais, feedback tátil e acessibilidade `role="radiogroup"`.
  - Estilização de marcadores cartográficos com microinterações suaves nos três estados: NORMAL, HOVER e SELECTED (`marker-pulse`).
- **Fase 4: Roteamento Físico e Interatividade Analítica:**
  - `components/ParkInventoryApp.tsx`: Extraído e desacoplado para suportar injeção de `initialTreeId`.
  - `app/tree/[id]/page.tsx`: Rota dinâmica com `generateStaticParams()` pré-renderizada via SSG (Next.js 15) para QR Code Deep Linking direto das árvores do parque, disparando transição `flyTo` e abertura imediata da ficha sem cliques extras.
  - Sincronização dinâmica de URL na raiz (`/?tree=slug`) via `window.history.replaceState` sem recarregamento de página.
  - `components/ui/StatisticsModal.tsx`: Lista interativa de famílias botânicas com **filtro reverso no mapa** (ao clicar na família, fecha o modal, posiciona no mapa e isola os espécimes daquela família).
  - `components/views/ProjectAboutView.tsx`: Reformulado no formato de artigo científico moderno com Abstract, Protocolo das Equipes de Campo (Grupos A, B, C), Metodologia da IA PlantNet e Citação Acadêmica padronizada.
  - Suíte de 3 testes em `test/qr-routing.test.ts` cobrindo o roteamento e integração de parâmetros.
- **Fase 5: Auto-auditoria, Estabilização e Governança:**
  - 85/85 testes aprovados no Vitest em 12 arquivos (100% PASS).
  - 0 erros em `npx tsc --noEmit` com tipagem estrita total.
  - Build estático SSG do Next.js 15.5 gerado com 100% de sucesso para todas as rotas (`/` e `/tree/[id]`).
  - Governança UDM atualizada e espelhada no HD com registro SQLite no `udm_v3.db`.

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
