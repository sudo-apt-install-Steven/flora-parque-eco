# UDM — CURRENT STATE

- **Data:** 2026-09-21
- **Versão:** `v1.2.0` (Regiões de Coleta Interativas, Lago Pílula, Passarela Transversal & Satélite Nativo)
- **Status do Projeto:** Calibração Cartográfica e Setorização Georreferenciada Concluídas com Sucesso (Mapa de Satélite inicial e principal, reconstrução fiel do Lago em formato de pílula e Passarela transversal de madeira em todas as 3 camadas, remoção do contorno amarelo gigante, introdução das 3 Regiões Poligonais dos Grupos A/B/C com interação de mouse e abertura de gaveta contendo galeria completa e links diretos ao PlantNet, pastas locais estruturadas em `public/trees/`, 85/85 testes Vitest PASS, compilação TypeScript estrito sem erros e Next.js 15.5 SSG 100% PASS).
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
   - Camada inicial padronizada: **Satélite** (`layerMode: 'satellite'`) com zoom livre até nível 22 e suporte a ortofoto.
   - Sincronização dinâmica de URL sem reload de página via `window.history.replaceState` para parâmetros contextuais (`?tree=slug`).
2. **Rota Dinâmica SSG (`/tree/[id]`):**
   - Implementada em `app/tree/[id]/page.tsx` com `generateStaticParams()` pré-renderizando estaticamente todos os espécimes catalogados em tempo de compilação.
   - Suporte a QR Codes físicos afixados nas árvores: ao escanear a placa, o visitante é direcionado diretamente para `/tree/mock-tree-001`, acionando automaticamente a transição suave de câmera `flyTo` do MapLibre e a abertura imediata da ficha botânica.

---

## 2. Cartografia e Geometria Vetorial (`geo/` e `lib/map-styles.ts`):
1. **Satélite como Protagonista:**
   - Modo padrão de inicialização com tiles satelitais de alta resolução (Google Satellite + fallback Esri World Imagery).
   - Linha amarela listrada gigante (`satellite-boundary-line`) totalmente removida; perímetro delimitado rente ao parque em `park-boundary.geojson`.
2. **Geometria Realística Calibrada:**
   - **Lago Pílula (Pill-shaped):** Polígono suave arredondado orientado WNW-ESE (`-60.1220` a `-60.1207`, `-12.7070` a `-12.7077`), refletido de forma idêntica nas camadas Satélite, Planta e Exploração.
   - **Passarela Transversal:** Reta de madeira suspensa cortando o lago do quadrante NW (`[-60.12182, -12.70692]`) ao quadrante SE (`[-60.12118, -12.70761]`).
   - **Parquinho Infantil:** Círculo no gramado nordeste (`[-60.12080, -12.70682]`).
3. **Regiões de Coleta Setorizadas (`geo/park-regions.geojson`):**
   - **Grupo A (Amarelo `#eab308`):** Setor Noroeste (Gramado Norte e acesso principal).
   - **Grupo B (Azul `#3b82f6`):** Setor Nordeste (Parquinho infantil e gramado leste).
   - **Grupo C (Vermelho `#ef4444`):** Margem Sul do Lago e Orla da Mata Ciliar.
   - Camadas vetoriais `regions-fill` e `regions-stroke` integradas no MapLibre GL com realce dinâmico via `feature-state` (`hover` e `selected`).
   - Interação por mouse: cursor vira pointer no hover; clique na região seleciona o grupo, centraliza a câmera na região e abre a gaveta lateral com o inventário do setor.

---

## 3. Estrutura de Pastas e Galeria de Fotos:
1. **Diretórios Locais de Fotos (`public/trees/`):**
   - `public/trees/grupo-a/`: repositório de imagens do Grupo A.
   - `public/trees/grupo-b/`: repositório de imagens do Grupo B.
   - `public/trees/grupo-c/`: repositório de imagens do Grupo C.
   - `public/trees/README.md`: guia de nomenclatura anatômica padronizada (`mock-tree-001_arvore.jpg`, `mock-tree-001_folha.jpg`, etc.).
2. **Componente `RegionTreeList` (`components/tree/RegionTreeList.tsx`):**
   - Exibe o cabeçalho do grupo com sua cor de destaque (amarelo, azul ou vermelho).
   - Listagem com contagem de espécimes coletados.
   - Para cada árvore: nome popular, nome científico em itálico, carrossel de fotos anatômicas com lazy loading e badge.
   - **Link Direto do PlantNet:** Botão destacado com ícone externo que abre a ficha taxonômica no PlantNet em nova aba (`target="_blank" rel="noopener noreferrer"`).
   - Botão para abrir a ficha completa do espécime (`TreeDetail`).

---

## 4. Modelagem Rigorosa de Dados (0% `any`, TypeScript Estrito):
1. `TreeCatalogItem` (`lib/tree-schema.ts`):
   - Identificador estável `id: string`.
   - `displayNumber: null` rigorosamente preservado (sem placas físicas instaladas no parque).
   - Coordenadas geográficas estritas `coordinates: { lat: number; lng: number }`.
   - `scientificName: string | null`, `popularName: string`, `family: string | null`.
   - Sub-objetos tipados:
     - `plantNetData`: `{ score: number; plantnetUrl: string | null; status: 'SUGESTÃO' | 'EM_REVISÃO' | 'CONFIRMADO' }`.
     - `collectionGroup`: `'groupA' | 'groupB' | 'groupC'`.
     - `gallery`: Coleção de imagens com categorização anatômica (`'ARVORE_INTEIRA' | 'FOLHA' | 'FRUTO' | 'CASCA' | 'TRONCO'`).
2. Conversores Bidirecionais: `treeToCatalogItem` e `catalogItemToTree` 100% tipados.

---

## 5. Qualidade, Testes e Conformidade Técnica:
- **Suíte Vitest:** 85/85 testes aprovados em 12 arquivos (100% PASS).
- **TypeScript Estrito:** 0 erros com `npx tsc --noEmit` (0% `any`).
- **Build de Produção Next.js:** 100% estático (SSG) gerado para rotas `/` e `/tree/[id]`.
- **Offline PWA:** Service Worker resiliente com Cache-First e Stale-While-Revalidate.
