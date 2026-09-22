# UDM — CURRENT STATE

- **Data:** 2026-09-21
- **Versão:** `v1.4.0` (Calibração Geométrica Fina dos Polígonos de Campo e Resolução de Hidratação WebGL)
- **Status do Projeto:** Polígonos dos Grupos A, B e C calibrados pixel a pixel sobre a imagem de satélite real em estrita conformidade com a foto de referência desenhada pelo usuário (`media_1789998447091.jpg`):
  1. **Grupo A (Amarelo `#eab308`):** Cobre exatamente a metade oeste do gramado norte em frente ao lago, desde a pista reta de acesso a oeste até a linha divisória vertical que bissecta o círculo do parquinho a leste, contornando a margem norte da água sem adentrar o lago.
  2. **Grupo B (Ciano `#06b6d4`):** Cobre a metade leste do gramado norte e a metade leste do parquinho infantil circular, estendendo-se até a orla da mata norte e leste e limitando-se ao sul pela curva leste da margem do lago.
  3. **Grupo C (Vermelho `#ef4444`):** Faixa contínua curva rente à pista de caminhada sul do lago (~12-15m de espessura) contornando toda a margem d'água sul, do oeste ao sudeste.
  - As 13 árvores catalogadas foram reposicionadas e validadas 100% geometricamente dentro de seus respectivos polígonos via algoritmo ray-casting.
  - Corrigido o empacotamento do `DynamicMap.tsx` com renderização client-side estável, eliminando travamento de carregamento e erros do Webpack do Next.js 15.
  - 85/85 testes Vitest PASS, `npm run build` SSG (17 páginas) gerado com sucesso.
- **Agente Responsável:** Antigravity 2.0 (Lead Cartographer & Release Manager)
- **Branch Git:** `main`
- **Repositório Remoto:** `origin` -> `https://github.com/sudo-apt-install-Steven/parque-ecologico-inventario.git`
- **Ambiente:** Node.js v22.23.2, npm 10.9.8, Windows 11 IoT Enterprise LTSC, C:\Users\Steven\Documents\FloraParqueEco
- **HD UDM Root:** D:\Universal-Agent-Memory\projects\flora-parque-eco
- **Banco de Dados UDM:** D:\Universal-Agent-Memory\data\udm_v3.db

---

## 1. Topologia de Rotas e Roteamento Físico (QR Code Deep Linking):
1. **Rota Raiz (`/`):**
   - Renderização sob `Suspense` do orquestrador desacoplado `<ParkInventoryApp />`.
   - Camada inicial padronizada: **Satélite** (`layerMode: 'satellite'`) com zoom livre até nível 22 (Google Satellite + suporte a sobreposição raster).
   - Sincronização dinâmica de URL sem reload de página via `window.history.replaceState` para parâmetros contextuais (`?tree=slug`).
2. **Rota Dinâmica SSG (`/tree/[id]`):**
   - Implementada em `app/tree/[id]/page.tsx` com `generateStaticParams()` pré-renderizando estaticamente todos os 13 espécimes catalogados em tempo de compilação.
   - Leitura de QR Code em campo: ao escanear a placa física, o visitante é direcionado diretamente para `/tree/[id]`, disparando animação suave `flyTo` do MapLibre até as coordenadas exatas e abertura imediata da ficha botânica sem cliques extras.
3. **Página 404 Resiliente (`/not-found`):**
   - Criado `app/not-found.tsx` temático com identidade visual botânica Deep Forest (`#0b211d`) e botão de retorno imediato ao mapa principal, assegurando integridade na geração estática do Next.js.

---

## 2. Motor GIS e Cartografia WebGL (`components/map/MapContainer.tsx` e `lib/map-styles.ts`):
1. **Renderização Acelerada por GPU:**
   - Implementado sobre MapLibre GL JS (`maplibre-gl` v5.20.1) renderizando WebGL a 60 FPS contínuos.
   - Encapsulamento estrito com `React.memo(MapContainerComponent)` para impedir re-renderizações desnecessárias do canvas WebGL quando o usuário interage com menus, buscas ou modais.
2. **Alternância entre as 3 Camadas Cartográficas:**
   - **Satélite (`SATELLITE_STYLE`):** Google Satellite com tiles raster de super zoom (`maxzoom: 21`, overzoom até 22) e camada poligonal dos setores de campo. Transição suave com véu de camada (`map-layer-veil`) durante eventos de `style.load`.
   - **Planta Técnica (`PLANTA_STYLE`):** Base vetorial técnica exibindo o lago pílula real (OSM way 1309514171), passarela suspensa de madeira diagonal, parquinho infantil e trilhas da mata em tons de pergaminho antigo (`#e7e1d0`).
   - **Exploração Botânica (`EXPLORATION_STYLE`):** Estilo cartográfico temático de expedição de campo com curvas de nível de relevo sombreado, setores de vegetação suave e POIs de aventura.
3. **Gerenciamento de Estados dos Marcadores via WebGL `feature-state`:**
   - IDs promovidos nativamente com `promoteId: 'id'`.
   - Estados `NORMAL`, `HOVER` e `SELECTED` manipulados diretamente na GPU via `map.setFeatureState`, eliminando recomputação de estilos ou recriação de GeoJSON em tempo de execução.
   - `selectedMarkerRef`: injeção precisa de marcador HTML animado com respiração dourada (`marker-pulse`) e SVG botânico no espécime ativo.
4. **Agrupamento Espacial Dinâmico (Supercluster):**
   - Clusterização hierárquica nativa WebGL (`clusterMaxZoom: 17`, `clusterRadius: 45`) com medalhões circulares e contagem de espécimes.
   - Clique no cluster aciona expansão suave de zoom via `easeTo` com cálculo automático de raio de dispersão.
5. **Setores Poligonais de Coleta (`park-regions`):**
   - Polígonos dos Grupos A, B e C integrados com preenchimento semitransparente e bordas dinâmicas:
     - **Grupo A (Amarelo `#eab308`):** Setor Noroeste (Gramado Norte).
     - **Grupo B (Azul `#3b82f6`):** Setor Nordeste (Parquinho e gramado leste).
     - **Grupo C (Vermelho `#ef4444`):** Faixa Sul do Lago e Mata Ciliar.
   - Eventos de mouse: realce em hover com cursor pointer, clique na região animando a câmera (`fitBounds`/`flyTo`) e abrindo a gaveta do setor (`RegionTreeList`).

---

## 3. Componentes Visuais e Interatividade de UI:
1. **Orquestrador Central (`ParkInventoryApp.tsx`):**
   - Desacoplamento arquitetural em 4 camadas (`DATA`, `MAP`, `UI`, `LOGIC`).
   - Consumo exclusivo de hooks reativos memoizados do Zustand 5 (`useFilteredCatalog`, `useActiveTree`, `useFilterActions`, `useCatalogStatus`).
2. **Painel do Espécime (`TreePanel.tsx` e `TreeDetail.tsx`):**
   - Layout responsivo dual: sidebar lateral deslizante no desktop (`aside.animate-panel-in`) e bottom sheet tátil no mobile (`div.animate-sheet-in`).
   - Gesto tátil mobile de arrastar para fechar (*drag-to-dismiss*) com rastreamento `onTouchStart`, `onTouchMove` e `onTouchEnd` no puxador da folha (`dragOffset > 72px`).
   - Tipografia editorial com Georgia serifada para nomes científicos em itálico e sans-serif para nomes populares.
   - Barra de progresso PlantNet Score (%) com transição dinâmica de cores baseada em confiança (`alta` verde, `media` âmbar, `baixa` cinza).
   - Carrossel fotográfico anatômico (`TreePhotoCarousel`) com categorização morfológica (`arvore_inteira`, `folha`, `fruto`, `casca`, `tronco`).
   - Botão de compartilhamento direto com feedback visual instantâneo ("Link copiado!") e botão "Centralizar no Mapa" via trigger de foco `focusKey`.
3. **Controle Flutuante de Camadas (`LayerSwitcher.tsx`):**
   - Miniaturas visuais em relevo para Satélite, Planta e Exploração.
   - Acessibilidade total com semântica de teclado e leitores de tela: `role="radiogroup"`, `role="radio"`, `aria-checked`, `aria-label` e anéis de foco visíveis.
4. **Gaveta de Inventário da Região (`RegionTreeList.tsx`):**
   - Exibição categorizada de todos os espécimes de um setor geográfico com badge temático de cor.
   - Link direto e seguro ao PlantNet (`target="_blank" rel="noopener noreferrer"`).
5. **Busca Instantânea (`SearchPopover.tsx`):**
   - Popover flutuante acionável por atalho de teclado `⌘ K` ou `Ctrl + K` e fechamento com `ESC`.
   - Busca multi-token insensível a maiúsculas e diacríticos/acentos (NFD).
6. **Modal Estatístico e Filtro Reverso (`StatisticsModal.tsx`):**
   - Métricas de biodiversidade em tempo real (total de árvores, famílias botânicas e média PlantNet).
   - Filtro reverso interativo: clicar em uma família botânica fecha o modal, move a câmera para a distribuição da família e isola os espécimes no mapa.

---

## 4. Auditoria de Performance e Otimizações de Renderização:
1. **Blindagem do Canvas WebGL contra Cascade Re-renders:**
   - `MapContainer` empacotado em `React.memo` com comparação rasa de props estáveis.
   - O movimento do mapa (pan, pitch, rotação, zoom) não emite eventos que forcem a re-renderização da árvore React pai.
   - Alterações de hover no mapa utilizam exclusivamente referências mutáveis (`useRef`) e `map.setFeatureState`, sem causar re-render na UI.
2. **Seletores Granulares e Memoizados (Zustand 5):**
   - Implementação de seletores atômicos (`useTotalTrees`, `useUniqueSpecies`, `useFamilyCounts`) para que componentes que exibem contadores simples não re-renderizem durante a filtragem de árvores individuais.
3. **Tratamento Eficiente de Assets:**
   - Utilização de `next/image` e lazy loading para as imagens da galeria.
   - GeoJSONs estáticos pré-carregados e servidos diretamente a partir de `public/geo/` para evitar requisições dinâmicas de backend.

---

## 5. Acessibilidade (a11y) e Conformidade WCAG AA:
1. **Semântica ARIA Completa:**
   - `LayerSwitcher`: `role="radiogroup"` com botões em `role="radio"`, `aria-checked`, e `aria-label` descritivo.
   - `TreePanel`: `role="region"` no desktop e `role="dialog"` com `aria-modal="true"` no mobile, contendo `aria-labelledby` apontando para o título do espécime.
   - Modais (`StatisticsModal`, `SearchPopover`): semântica de diálogo acessível com armadilha de foco e fechamento em tecla `Escape`.
2. **Contraste e Legibilidade:**
   - Paleta cromática rigorosamente testada: texto Deep Forest (`#102a26`) sobre Warm Paper (`#f8f6ef`) atinge contraste superior a 12:1 (exigência mínima de 4.5:1 WCAG AA).
   - Textos de badges e rótulos secundários respeitam contraste mínimo com pesos tipográficos semi-bold (`font-semibold`).
3. **Navegação por Teclado:**
   - Controles interativos possuem estilos explícitos de `focus-visible:ring-2 focus-visible:ring-emerald-500`.

---

## 6. Resiliência Visual e Blindagem de Dados:
1. **Tratamento de Dados Incompletos (`lib/fallbacks.ts`):**
   - Todo acesso a propriedades da entidade `Tree` é mediado por `getSafeTree()`.
   - Se `scientificNameSuggested` for nulo ou vazio, a UI exibe o placeholder estilizado *"Em identificação botânica"* com tipografia em itálico suave sem quebrar a grade.
   - Se a galeria ou foto primária estiver ausente, renderiza o SVG vetorial embutido `DEFAULT_FALLBACK_PHOTO` (gradiente Deep Forest independente de rede).
   - Se o score do PlantNet for 0 ou nulo, exibe badge informativo *"Aguardando análise taxonômica"* em vez de barra vazia quebrada.
   - Coordenadas ausentes renderizam *"Coordenadas em calibração de campo"*.

---

## 7. Qualidade, Testes e Conformidade Técnica:
- **Suíte Vitest:** 85/85 testes aprovados em 12 arquivos (100% PASS).
- **TypeScript Estrito:** 0 erros com `tsc --noEmit -p tsconfig.json` (0% `any`).
- **Build de Produção Next.js 15.5:** 100% estático (SSG) gerado com 17 páginas estáticas com 0 erros.
- **Offline PWA:** Service Worker resiliente com Cache-First e Stale-While-Revalidate.
- **Regra de Ouro nº 2:** `displayNumber: null` preservado em 100% dos 13 espécimes cadastrados.
