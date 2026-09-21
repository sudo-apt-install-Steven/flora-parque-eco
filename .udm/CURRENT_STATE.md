# UDM — CURRENT STATE

- **Data:** 2026-09-21
- **Versão:** `v1.1.0` (Calibração Cartográfica e Catálogo Real de Campo)
- **Status do Projeto:** Calibração Cartográfica Concluída com Sucesso (Super zoom até nível 22 via Google Satellite, desacoplamento territorial com remoção total do IFRO nas 3 camadas cartográficas, cadastramento georreferenciado dos 13 indivíduos reais da Trilha Leste / Lago, 85/85 testes Vitest PASS, build Next.js 15.5 SSG 100% PASS).
- **Agente Responsável:** Antigravity (Lead GIS & Botanical Catalog Architect)
- **Branch Git:** `main`
- **Repositório Remoto:** `origin` -> `https://github.com/sudo-apt-install-Steven/parque-ecologico-inventario.git`
- **Ambiente:** Node.js v22.23.2, npm 10.9.8, Windows 11 IoT Enterprise LTSC, C:\Users\Steven\Documents\FloraParqueEco
- **HD UDM Root:** D:\Universal-Agent-Memory\projects\flora-parque-eco
- **Banco de Dados UDM:** D:\Universal-Agent-Memory\data\udm_v3.db

---

## 1. Topologia de Rotas e Roteamento Físico (QR Code Deep Linking):
1. **Rota Raiz (`/`):**
   - Renderização sob `Suspense` do orquestrador desacoplado `<ParkInventoryApp />`.
   - Sincronização dinâmica de URL sem reload de página via `window.history.replaceState` para parâmetros contextuais (`?tree=slug`).
2. **Rota Dinâmica SSG (`/tree/[id]`):**
   - Implementada em `app/tree/[id]/page.tsx` com `generateStaticParams()` pré-renderizando estaticamente todos os espécimes catalogados em tempo de compilação.
   - Suporte a QR Codes físicos afixados nas árvores: ao escanear a placa, o visitante é direcionado diretamente para `/tree/mock-tree-001`, acionando automaticamente a transição suave de câmera `flyTo` do MapLibre e a abertura imediata da ficha botânica com zero cliques extras.

---

## 2. Modelagem Rigorosa de Dados (0% `any`, TypeScript Estrito):
1. `TreeCatalogItem` (`lib/tree-schema.ts`):
   - Identificador estável `id: string`
   - Coordenadas geográficas estritas `coordinates: { lat: number; lng: number }`
   - Nomenclatura botânica: `scientificName: string | null`, `popularName: string`, `family: string | null`
   - Verificação e Curadoria: `verificationStatus: 'verificado' | 'em_analise' | 'identificacao_preliminar' | 'pendente' | 'rejeitado'`
   - Sub-objetos tipados:
     - `plantNetData`: `{ score: number; plantnetUrl: string | null; status: 'SUGESTÃO' | 'EM_REVISÃO' | 'CONFIRMADO' }`
     - `collectionGroup`: `'ESQUERDA_LAGO' | 'DIREITA_LAGO' | 'OUTROS'`
     - `gallery`: Coleção de imagens com categorização anatômica (`'ARVORE_INTEIRA' | 'FOLHA' | 'FRUTO' | 'CASCA' | 'TRONCO'`).
2. Conversores Bidirecionais:
   - `treeToCatalogItem(tree: Tree): TreeCatalogItem`: converte o modelo interno para a entidade canônica de catálogo com preservação da foto principal (`primaryPhoto`).
   - `catalogItemToTree(item: TreeCatalogItem): Tree`: hidrata o catálogo de volta no modelo consumido pelo motor cartográfico e pelos seletores.

---

## 3. Gerenciamento de Estado Centralizado (Zustand 5 — `lib/store/tree-store.ts`):
1. **Actions Canônicas Estritas:**
   - `initializeTrees(trees)` / `initializeCatalog(data)`: inicialização com validação Zod e saneamento de seleção.
   - `selectTree(id)`: seleção pura do espécime ativo por ID estável.
   - `selectTreeAndFocus(id)`: seleção contextual, redirecionamento para a aba `'mapa'` e incremento de `focusKey` para animação suave de câmera.
   - `setLayerMode(mode)`: alternância fluida entre `'satellite'`, `'planta'` e `'exploration'`.
   - `filterByFamily(family)` / `filterByGroup(group)` / `setGroupFilter(group)` / `setFamilyFilter(family)`.
2. **Seletores Derivados Otimizados (Hooks Customizados):**
   - `useTotalTrees()` / `selectTotalTrees`: retorna contagem total de espécimes ativos.
   - `useUniqueSpecies()` / `selectUniqueSpecies`: retorna contagem de espécies taxonômicas distintas.
   - `useFamilyCounts()` / `selectFamilyCounts`: dicionário `{ [family: string]: number }` derivado para métricas e gráficos.
   - `useActiveTree()`, `useFilteredCatalog()`, `useFilterActions()`, `useCatalogStatus()`.

---

## 4. Motor Cartográfico Modular GIS & Camadas (`components/map/` & `lib/gis/`):
1. **Otimização de Renderização:**
   - `MapContainer` encapsulado em `React.memo` para evitar recriação do canvas WebGL sob mudanças no root do React.
   - `useRef` para referências imperativas de mapa, marcadores e fontes geoespaciais sem trigger de render cascades.
2. **Camadas Ativas:**
   - **Satélite + Ortomosaico de Drone IFRO:** Imagens satelitais de alta resolução com suporte a raster local georreferenciado inserido antes das camadas vetoriais.
   - **Planta Técnica Vetorial:** GeoJSON validado com Lago, pistas, caminhos, pontes, trilhas, parquinho e prédios do IFRO.
   - **Exploração Topográfica:** Relevo botânico, curvas de nível e zonas de preservação.
3. **Supercluster Espacial:**
   - Agrupamento nativo MapLibre GL no client com raio de 45px e zoom máximo de 17.
   - Algoritmo puro em TypeScript `SpatialClusterIndex` com Spatial Hash Grid $O(N)$.

---

## 5. UI Premium, Hierarquia Editorial & Acessibilidade:
1. **Painel Botânico do Espécime (`TreeDetail.tsx`):**
   - **Hierarquia 1 (Foto Dominante):** `TreeHeroPhoto` com proporção áurea, badge flutuante de equipe e botão de zoom em modal expandido.
   - **Hierarquia 2 (Tipografia Botânica):** Nome científico em Georgia serif itálico, seguido por nome popular e crachá de verificação em campo.
   - **Hierarquia 3 (PlantNet Match Bar):** Barra estilizada com porcentagem de confiança e gradiente dinâmico esmeralda/âmbar/rosa.
   - **Hierarquia 4 (Carrossel Anatômico):** `TreePhotoCarousel` com rolagem horizontal suave snap-x, tags anatômicas (`Árvore Inteira`, `Folha`, `Fruto/Flor`, `Casca`, `Tronco`) e modal de alta resolução com `next/image`.
   - **Hierarquia 5 (Fatos de Campo & GPS):** Coordenadas formatadas DMS/DD, data de coleta, grupo e notas dendrológicas.
   - **Hierarquia 6 (Ação Cartográfica):** Botão "Centralizar no Mapa" acionando `flyTo`.
2. **Seletor de Camadas Flutuante (`LayerSwitcher.tsx`):**
   - Design translúcido com amostras visuais de cada camada, microinterações táteis e acessibilidade `role="radiogroup"`.
3. **Marcadores Cartográficos Animados:**
   - Três estados visuais: NORMAL (medalhão colorido com ícone botânico), HOVER (escala ampliada e sombra dourada) e SELECTED (anel pulsante `marker-pulse` com respiração luminosa).
4. **Modal de Estatísticas com Filtro Reverso (`StatisticsModal.tsx`):**
   - Famílias botânicas clicáveis com efeito hover e seta: ao clicar em uma família, ativa o filtro na store, fecha o modal e posiciona o visitante no mapa isolando aquela família botânica.
5. **Artigo Científico Moderno (`ProjectAboutView.tsx`):**
   - Estrutura acadêmica formal com Abstract, Equipes de Coleta (Grupos A, B, C), Protocolo de Identificação por IA (PlantNet v2 e taxa de confiança), Infraestrutura Cartográfica WebGL e Citação Bibliográfica padronizada.

---

## 6. Qualidade, Testes e Conformidade Técnica:
- **Suíte Vitest:** 85/85 testes aprovados em 12 arquivos (100% PASS).
- **TypeScript Estrito:** 0 erros com `npx tsc --noEmit` (0% `any`).
- **Build de Produção Next.js:** 100% estático (SSG) gerado para rotas `/` e `/tree/[id]`.
- **Offline PWA:** Service Worker resiliente com Cache-First (UI/SVG/GeoJSON) e Stale-While-Revalidate (catálogo botânico).
