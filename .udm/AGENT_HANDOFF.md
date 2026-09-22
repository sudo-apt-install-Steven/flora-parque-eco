# UDM — AGENT HANDOFF: PARQUE ECOLÓGICO VILHENA
## GUIA DE INTEGRAÇÃO FRONTEND, DADOS & MOTOR GIS

> **Aviso ao Agente de Frontend e Sucessores:** Este documento é o guia definitivo de consumo da fundação de dados, motor cartográfico e estado global do projeto. É **estritamente proibido** alterar a lógica de dados, schemas Zod ou o pipeline cartográfico sem sincronização prévia no UDM. A interface gráfica deve apenas consumir os hooks e tipos descritos abaixo.

---

## 1. Stack & Arquitetura Atual
- **Framework:** Next.js 15.5.25 (App Router), React 19, TypeScript estrito (0% `any`).
- **Rotas:** `/` (Catálogo Cartográfico principal) e `/tree/[id]` (QR Code Deep Linking com SSG estático pré-renderizado).
- **Motor Cartográfico:** MapLibre GL JS acelerado por GPU (WebGL a 60 FPS) encapsulado com `React.memo`.
- **Gerenciamento de Estado:** Zustand 5 (`lib/store/tree-store.ts`) com validação Zod e seletores atômicos/derivados.
- **Agrupamento Espacial:** Supercluster hierárquico nativo WebGL e TypeScript puro (`lib/gis/clustering.ts`) com Spatial Hash Grid $O(N)$.
- **Offline / PWA:** Service Worker com `Cache-First` (UI/SVGs/GeoJSON) e `Stale-While-Revalidate` (catálogo botânico JSON/CSV), mais manifesto standalone (`public/manifest.json`).
- **QA & Resiliência:** 85/85 testes Vitest aprovados (`cmd /c "npm test"`), 0 erros de compilação TypeScript (`cmd /c "npx tsc --noEmit"`), build de produção Next.js 100% estático (SSG) e funcional.

---

## 2. Hooks Oficiais para o Agente de Frontend

O agente de interface **NUNCA** deve acessar propriedades brutas ou dados sem fallbacks. Utilize os seguintes hooks memoizados:

### 2.1. Ler o Catálogo de Árvores e Estatísticas
```tsx
import { useFilteredCatalog } from '@/lib/store/tree-store';

function SpeciesList() {
  // allTrees: catálogo completo validado
  // filteredTrees: catálogo pós-aplicação de busca e filtros facetados
  // stats: métricas em tempo real (total, contagem por grupo, famílias, média PlantNet)
  // families: lista ordenada de famílias taxonômicas presentes
  const { allTrees, filteredTrees, stats, families } = useFilteredCatalog();

  return (
    <div>
      <span>Exibindo {filteredTrees.length} de {allTrees.length} espécimes</span>
      {filteredTrees.map((tree) => (
        <div key={tree.id}>{tree.popularName} — {tree.scientificNameSuggested}</div>
      ))}
    </div>
  );
}

// Seletores Atômicos Derivados de Alta Performance:
import { useTotalTrees, useUniqueSpecies, useFamilyCounts } from '@/lib/store/tree-store';

function MetricBadges() {
  const totalTrees = useTotalTrees();       // number
  const uniqueSpecies = useUniqueSpecies(); // number
  const familyCounts = useFamilyCounts();   // Record<string, number>

  return <div>{totalTrees} árvores | {uniqueSpecies} espécies</div>;
}
```

### 2.2. Ler e Selecionar a Árvore Ativa no Mapa
```tsx
import { useActiveTree } from '@/lib/store/tree-store';

function TreeCard() {
  // safeSelectedTree: versão blindada (getSafeTree) com 0 riscos de null/undefined
  // selectedTreeId: ID slug da árvore ativa ou null
  // selectTree: seleciona sem mover câmera
  // selectTreeAndFocus: seleciona, muda navegação para mapa e aciona easing da câmera
  // triggerFocus: recentraliza a câmera no espécime atual
  const { selectedTree, safeSelectedTree, selectTreeAndFocus, triggerFocus } = useActiveTree();

  if (!safeSelectedTree) return <div>Nenhuma árvore selecionada</div>;

  return (
    <div>
      <h2>{safeSelectedTree.popularName}</h2>
      <p><em>{safeSelectedTree.scientificNameSuggested}</em></p>
      <span>{safeSelectedTree.coordinatesFormatted}</span>
      <span>{safeSelectedTree.displayNumberFormatted}</span>
      <button onClick={() => triggerFocus()}>Centralizar no Mapa</button>
    </div>
  );
}
```

### 2.3. Aplicar Filtros de Busca e Facetas
```tsx
import { useFilterActions } from '@/lib/store/tree-store';

function SearchAndFilters() {
  const {
    filters,
    setSearchQuery,        // (query: string) => void (insensível a acentos/NFD)
    setGroupFilter,        // (group: FieldGroup | 'all') => void ('groupA' | 'groupB' | 'groupC' | 'all')
    setFamilyFilter,       // (family: string | 'all') => void
    setConfidenceFilter,   // (conf: TreeConfidence | 'all') => void
    setMinPlantnetScore,   // (score: number) => void (0.0 a 1.0)
    setVerificationStatusFilter, // (status: VerificationStatus | 'all') => void
    resetFilters           // () => void
  } = useFilterActions();

  return (
    <input
      value={filters.searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Buscar por nome popular, científico, família..."
    />
  );
}
```

### 2.4. Monitorar Estado de Carregamento e Erros
```tsx
import { useCatalogStatus } from '@/lib/store/tree-store';

function IngestionAlert() {
  const { isLoading, hasError, errorMessage } = useCatalogStatus();

  if (isLoading) return <div>Carregando catálogo botânico...</div>;
  if (hasError) return <div className="text-red-500">Erro: {errorMessage}</div>;
  return null;
}
```

### 2.5. Monitorar Conectividade Offline (PWA)
```tsx
import { useOfflineStatus } from '@/lib/pwa';

function OfflineBanner() {
  const { isOnline, isOffline, wasOffline } = useOfflineStatus();

  if (isOffline) {
    return (
      <div className="bg-amber-800 text-white p-2">
        Modo Offline Ativo: Levantamento de campo operando via cache local do Parque.
      </div>
    );
  }

  if (wasOffline && isOnline) {
    return <div className="bg-emerald-800 text-white p-2">Conexão restabelecida!</div>;
  }

  return null;
}
```

---

## 3. Como Inicializar ou Atualizar o Catálogo

Para carregar novos lotes de árvores ou integrar fontes externas:

```tsx
import { useTreeStore } from '@/lib/store/tree-store';
import { TreeCatalogItem } from '@/lib/tree-schema';

// 1. Ingestão de array com tipagem TreeCatalogItem ou Tree:
useTreeStore.getState().initializeCatalog(items);

// 2. Ingestão dinâmica de texto CSV ou JSON bruto de campo:
const result = useTreeStore.getState().importData(csvString);
if (result.success) {
  console.log(`Importadas ${result.importedCount} árvores com sucesso!`);
}

// 3. Focar programaticamente em uma árvore:
useTreeStore.getState().focusTree('tree-vilhena-001');

// 4. Alternar modo cartográfico:
useTreeStore.getState().setLayerMode('satellite'); // 'satellite' | 'planta' | 'exploration'

// 5. Filtrar por grupo acadêmico:
useTreeStore.getState().filterByGroup('ESQUERDA_LAGO'); // 'ESQUERDA_LAGO' | 'DIREITA_LAGO' | 'OUTROS'
```

---

## 4. Como Renderizar o Mapa e Marcadores (`components/map/DynamicMap.tsx`)

O canvas do MapLibre GL é renderizado pelo componente dinâmico sem SSR (`DynamicMap.tsx`), que consome o `MapContainer.tsx` memoizado com `React.memo`.

### Exemplo de Montagem no Layout:
```tsx
import { DynamicMap } from '@/components/map/DynamicMap';
import { useTreeStore, useActiveTree, useFilteredCatalog } from '@/lib/store/tree-store';

export function MapView() {
  const { filteredTrees } = useFilteredCatalog();
  const { selectedTree, selectTree } = useActiveTree();
  const currentMode = useTreeStore((s) => s.layerMode);
  const focusKey = useTreeStore((s) => s.focusKey);

  return (
    <DynamicMap
      currentMode={currentMode}
      trees={filteredTrees}
      selectedTree={selectedTree}
      onSelectTree={selectTree}
      focusKey={focusKey}
    />
  );
}
```

### Comportamento dos Marcadores Cartográficos (WebGL GPU):
1. **Camada Clusters (`clusters` / `cluster-count`):** Nós numéricos esmeralda escuro que condensam árvores próximas durante o zoom-out (Supercluster). O clique no cluster executa um `easeTo` suave com expansão automática.
2. **Marcador Individual (`unclustered-point-outer` / `inner` / `glyph`):** Medalhão cartográfico estilizado por equipe de campo:
   - Grupo A (Esquerda Norte): `#52775e` (Verde Esmeralda)
   - Grupo B (Esquerda Sul): `#4a6f91` (Azul Lago)
   - Grupo C (Direita Trilha): `#b07a32` (Ouro Queimado)
3. **Marcador Ativo do v0 (`selectedMarkerRef`):** Quando um espécime é selecionado, um marcador HTML do MapLibre é injetado com SVG de folha e anel pulsante (`marker-pulse`) dourado.

---

## 5. Modelos de Dados Rígidos (`lib/tree-schema.ts`)

O frontend pode importar diretamente as tipagens:
- `TreeCatalogItem`: id, coordinates (`{ lat, lng }`), scientificName, popularName, family, plantnet, collection, gallery.
- `PlantNetData`: score, plantnetUrl, status ('SUGESTÃO', 'EM_REVISÃO', 'CONFIRMADO').
- `CollectionData`: collectionGroup ('ESQUERDA_LAGO', 'DIREITA_LAGO', 'OUTROS'), collectedAt.
- `MediaGallery`: array de `MediaPhotoItem` com type ('ARVORE_INTEIRA', 'FOLHA', 'FRUTO', 'CASCA', 'TRONCO').
- Conversores disponíveis: `treeToCatalogItem(tree)` e `catalogItemToTree(item)`.

---

## 6. Instruções para Executar o Projeto em Qualquer Máquina

Para qualquer engenheiro ou agente clonar e rodar o projeto do zero:

### 6.1. Clonar o Repositório
```bash
git clone https://github.com/sudo-apt-install-Steven/parque-ecologico-inventario.git
cd parque-ecologico-inventario
```

### 6.2. Instalar Dependências
```bash
npm install
```

### 6.3. Executar o Servidor de Desenvolvimento Local
```bash
npm run dev
```
Acesse `http://localhost:3000` no navegador. O mapa MapLibre GL com aceleração WebGL, os controles táteis, as rotas `/` e `/tree/[id]` e o catálogo botânico estarão plenamente operacionais.

### 6.4. Executar Testes Automatizados (Vitest)
```bash
npm test
```

### 6.5. Gerar Build Estático de Produção (SSG)
```bash
npm run build
```
O build estático gera as páginas pré-renderizadas de todos os espécimes e a rota principal sem dependência de banco de dados em runtime.

---

## 7. Calibração Cartográfica & Catálogo Real (v1.1.0)

### 7.1. Provedor de Satélite de Super Zoom
- A camada de satélite agora utiliza **Google Satellite** com `maxzoom: 21` e overzoom de alta precisão até nível **22** no MapLibre GL JS, permitindo ampliação métrica nítida sobre as copas das árvores na região do Parque Ecológico em Vilhena/RO.

### 7.2. Desacoplamento Territorial Parque vs. IFRO
- As 3 camadas cartográficas (Satélite, Planta Técnica e Exploração) foram limpas de qualquer sobreposição ao campus do IFRO Vilhena.
- O polígono do parque (`geo/park-boundary.geojson`) cobre exclusivamente a área do Parque Ecológico Municipal Marechal Cândido Rondon e seu lago central.
- A planta técnica vetorial (`geo/park-planta.geojson`) inclui o lago real (OSM way 1309514171), a passarela diagonal sobre a água, o parquinho e as trilhas da mata.

### 7.3. Os 13 Espécimes Reais da Trilha Leste / Lago
- Cadastrados em `data/mock-trees.json` (`mock-tree-001` a `mock-tree-013`) com coordenadas geográficas precisas ao longo da margem sul do lago e trilha da mata:
  1. `mock-tree-001`: Jacarandá (*Jacaranda mimosifolia*, Bignoniaceae)
  2. `mock-tree-002`: Guapuruvu / Angico (*Schizolobium parahyba*, Fabaceae)
  3. `mock-tree-003`: Árvore com Oco (*Cavanillesia platanifolia*, Malvaceae)
  4. `mock-tree-004`: Eucalipto (*Eucalyptus grandis*, Myrtaceae)
  5. `mock-tree-005`: Mangueira (*Mangifera indica*, Anacardiaceae)
  6. `mock-tree-006`: Paineira / Sumaúma (*Ceiba speciosa*, Malvaceae)
  7. `mock-tree-007`: Mangueira Fruto (*Mangifera indica*, Anacardiaceae)
  8. `mock-tree-008`: Quaresmeira (*Tibouchina granulosa*, Melastomataceae)
  9. `mock-tree-009`: Ipê Passarela (*Handroanthus impetiginosus*, Bignoniaceae)
  10. `mock-tree-010`: Árvore Cadeado (*Ficus gomelleira*, Moraceae)
  11. `mock-tree-011`: Árvore Bifurcada (*Qualea grandiflora*, Vochysiaceae)
  12. `mock-tree-012`: Árvore Quiosque (*Inga vera*, Fabaceae)
  13. `mock-tree-013`: Árvore Fim Trilha (*Anadenanthera colubrina*, Fabaceae)
- Todos validados no Zod (`TreeSchema`), galeria com objetos `PhotoItem` válidos e `displayNumber: null` rigorosamente preservado.

---

## 8. Setorização por Regiões Poligonais, Fotos de Campo & PlantNet (v1.2.0)

### 8.1. Camada Inicial Padrão (Satélite)
- O mapa agora inicializa diretamente na camada de **Satélite** (`layerMode: 'satellite'`) no `lib/store/tree-store.ts`.
- O contorno amarelo listrado gigante (`satellite-boundary-line`) foi totalmente eliminado.

### 8.2. Geometria Fiel do Lago e da Passarela
- **Lago Pílula (Pill-shaped):** Formato arredondado orientado WNW-ESE (`-60.1220` a `-60.1207`, `-12.7070` a `-12.7077`).
- **Passarela Transversal:** Reta de madeira suspensa de NW (`[-60.12182, -12.70692]`) a SE (`[-60.12118, -12.70761]`).
- **Parquinho Infantil:** Círculo no gramado nordeste (`[-60.12080, -12.70682]`).

### 8.3. Polígonos das 3 Regiões de Campo (`geo/park-regions.geojson`)
- **Grupo A (Amarelo `#eab308`):** Gramado Noroeste em frente ao lago. Delimitado entre a pista reta de acesso a oeste e a linha divisória vertical que bissecta o centro do parquinho infantil (`lng = -60.12095`), contornando a margem norte d'água sem adentrar o lago. Contém 4 espécimes catalogados (`mock-tree-001` a `004`).
- **Grupo B (Ciano `#06b6d4`):** Gramado Nordeste & Parquinho Infantil. Começa na linha divisória que bissecta o parquinho, engloba a metade leste do círculo e o gramado até a borda da mata leste/norte, limitando-se ao sul pela curva d'água leste do lago. Contém 4 espécimes catalogados (`mock-tree-005` a `008`).
- **Grupo C (Vermelho `#ef4444`):** Faixa contínua curva rente à pista de caminhada sul do lago (~12-15m de espessura) contornando toda a margem d'água sul, do oeste ao sudeste. Contém 5 espécimes catalogados (`mock-tree-009` a `013`).
- **Interatividade no MapLibre:** Hover com mudança de cursor para pointer e realce de borda; clique na região que aciona `onSelectGroup()`, animando a câmera até o centro do setor e abrindo a gaveta lateral.

### 8.4. Gaveta de Inventário da Região (`components/tree/RegionTreeList.tsx`)
- Renderizada quando um grupo de campo está selecionado e nenhuma árvore específica está com foco exclusivo.
- Exibe cabeçalho com a cor e descrição do setor, contagem de árvores, carrossel de fotos anatômicas e nome científico em itálico.
- **Link Direto ao PlantNet:** Botão com link seguro (`target="_blank" rel="noopener noreferrer"`) apontando para a página de identificação oficial no PlantNet.
- Botão "Ver Ficha Completa" que transiciona fluidamente para o componente `TreeDetail`.

### 8.5. Estrutura de Diretórios para Fotos do Usuário
- Criadas as pastas dedicadas:
  - `public/trees/grupo-a/`
  - `public/trees/grupo-b/`
  - `public/trees/grupo-c/`
- O arquivo `public/trees/README.md` documenta a convenção recomendada de nomes de arquivo (`<id-da-arvore>_<orgao>.jpg`, ex: `mock-tree-001_arvore.jpg`, `mock-tree-001_folha.jpg`).

---

## 9. Auto-Auditoria de Performance, Interatividade GIS e Prontidão para Deploy (v1.3.0)

### 9.1. Auditoria de Renderização e Performance WebGL
- **Memoização Estrita do Canvas:** O componente `MapContainer` está encapsulado com `React.memo(MapContainerComponent)`, impedindo que interações de UI (abertura de menus, digitação no campo de busca, alternância de modais) forcem a remontagem ou re-renderização do canvas WebGL.
- **Manipulação de Estados na GPU:** Os estados dos marcadores (`NORMAL`, `HOVER`, `SELECTED`) e das regiões poligonais de campo (`park-regions`) são atualizados via `map.setFeatureState` na GPU utilizando IDs promovidos (`promoteId: 'id'`). Não há recriação nem re-parsing de GeoJSONs durante o uso do mapa.
- **Isolamento de Pan e Zoom:** O ciclo de vida do MapLibre gerencia internamente eventos de câmera (`move`, `zoom`, `pitch`), sem propagar re-renders para os componentes irmãos ou pais.
- **Seletores Granulares do Zustand 5:** O consumo de dados no frontend é mediado por seletores atômicos (`useTotalTrees`, `useUniqueSpecies`, `useFamilyCounts`), garantindo que apenas os nós de UI dependentes sofram re-renderização.

### 9.2. Acessibilidade (a11y) e Conformidade WCAG AA
- **Semântica ARIA:**
  - `LayerSwitcher`: `role="radiogroup"` com botões em `role="radio"`, `aria-checked` refletindo o modo ativo, rótulos textuais descritivos (`aria-label`) e anéis de foco visíveis por teclado (`focus-visible:ring-2`).
  - `TreePanel`: `role="region"` no desktop e `role="dialog"` com `aria-modal="true"` no mobile, com `aria-labelledby` associado ao título botânico.
  - Modais: foco preso (trap focus), fechamento via tecla `Escape` e scrims acessíveis com backdrop blur.
- **Contraste Cromático:** A paleta botânica (Deep Forest `#102a26` sobre Warm Paper `#f8f6ef`) apresenta razão de contraste superior a 12:1, superando a especificação mínima de 4.5:1 da WCAG AA.

### 9.3. Resiliência Visual a Dados Ausentes
- **Blindagem Universal:** Todo objeto de árvore exibido pela UI é sanitizado por `getSafeTree()` (`lib/fallbacks.ts`).
- **Nomes Científicos:** Caso `scientificNameSuggested` seja ausente ou vazio, a interface renderiza *"Em identificação botânica"* em itálico com contraste atenuado, preservando a harmonia da grade.
- **Fotos e Galerias:** Espécimes sem fotos carregam o SVG vetorial em data URI `DEFAULT_FALLBACK_PHOTO` (gradiente Deep Forest), sem chamadas de rede externas e com tempo de resposta zero.
- **PlantNet Score:** Scores zerados ou nulos renderizam um badge neutro *"Aguardando análise taxonômica"*, evitando quebras de layout na barra de progresso.

### 9.4. Certificação de Qualidade e Prontidão de Deploy
- **Testes Automatizados:** 85/85 testes aprovados no Vitest em 12 arquivos (100% PASS).
- **TypeScript Estrito:** 0 erros de compilação com `tsc --noEmit -p tsconfig.json` (0% `any`).
- **Build de Produção SSG:** Build Next.js 15.5 gerando 17 páginas estáticas com 100% de sucesso (rotas `/`, `/_not-found` e `/tree/[id]`).
- **Pronto para Produção:** O projeto encontra-se estabilizado, com motor GIS calibrado, UI responsiva, PWA offline-first configurado e pronto para deploy ou alimentação com dados florísticos adicionais.





---

## 10. Atualização v1.5.0 — Kiro (2026-09-22)

### O que mudou nesta versão:

**Catálogo reconstruído com 32 espécimes reais:**
- `data/mock-trees.json` substituído integralmente — os 13 espécimes de calibração foram removidos e substituídos pelos 32 espécimes reais coletados em campo pelos estudantes do IFRO.
- IDs seguem o padrão `tree-[grupo]-[numero]-[nome-simplificado]`.
- Todos com `displayNumber: null` e `isMock: false`.
- Fotos apontam para `/trees/grupo-[a|b|c]/[pasta-especie]/[arquivo].jpeg` — paths locais dentro de `public/`.

**Distribuição dos espécimes:**
- Grupo A (5): tree-a-02-jacaranda, tree-a-03-hibiscus, tree-a-04-spathodea, tree-a-05-ipomoea, tree-a-06-mangifera
- Grupo B (14): tree-b-01-eucalyptus, tree-b-07-mangifera-1, tree-b-08-wodyetia, tree-b-09-psidium, tree-b-10-jacaranda, tree-b-11-pachira, tree-b-12-cascabela, tree-b-13-inga-laurina, tree-b-14-mangifera-2, tree-b-15-syzygium, tree-b-16-jacaranda-cusp, tree-b-17-trema, tree-b-18-ipomoea, tree-b-19-bismarckia, tree-b-20-jacaranda-2
- Grupo C (13): tree-c-01-jacaranda a tree-c-13-vochysia-2

**Fotos locais com caracteres especiais:**
- Criada `safeImgSrc(url)` em `lib/utils.ts` — percent-encoda cada segmento do path local.
- `next/image` substituído por `<img>` nativo em: `TreeGallery.tsx`, `TreeDetail.tsx`, `RegionTreeList.tsx`, `SpeciesCatalogView.tsx`.

**Polígonos A/B/C:**
- Recalibrados em `geo/park-regions.ts` e `public/geo/park-regions.geojson`.
- Cor Grupo B corrigida: `#3b82f6` → `#06b6d4` (ciano) em todos os arquivos.

**Build de produção:**
- `npm run build`: ✅ 37 páginas SSG, 0 erros.
- `npx tsc --noEmit`: ✅ 0 erros.

### Para o próximo agente:
1. Coordenadas GPS dos 32 espécimes são estimativas por região. Atualizar quando EXIF/GPS de campo estiver disponível.
2. `displayNumber: null` em todos — aguarda instalação das placas físicas numeradas.
3. O Grupo B tem numeração não-sequencial (01, 07-20) — reflete a numeração real do levantamento de campo.

## 11. Atualização v1.6.0 — GitHub Copilot (2026-09-22)

### Correção de Espécies / Espécimes
- Causa confirmada das imagens brancas: `ingestTreeRecords()` descartava objetos `primaryPhoto` locais e substituía toda `gallery` por array vazio.
- O pipeline agora preserva fotos locais e metadados após validação por `PhotoItemSchema`; `safeImgSrc()` mantém percent-encoding de espaços e Unicode.
- A tela de espécies abre `TreeDetail` em galeria modal contextual; o mapa só é acionado por “Centralizar este espécime no mapa”.
- `TreeGallery` oferece principal, thumbnails da árvore selecionada, anterior/próxima, teclado, ESC, swipe, loading e fallback real.
- No mobile, o modal usa bottom sheet confortável, rolagem vertical, touch targets e oculta temporariamente a navegação inferior para evitar sobreposição.

### Validação e Handoff
- 33 espécimes, 154 referências de fotos, 0 caminhos ausentes em `public/trees/`.
- `npx tsc --noEmit`: PASS.
- `npm test`: 85/85 PASS.
- `npm run build`: 37 páginas SSG PASS.
- Inspeção visual no servidor de produção em desktop/mobile: PASS; console sem erros da aplicação.
- Remote atual: `https://github.com/sudo-apt-install-Steven/flora-parque-eco.git`.

## Atualização v1.7.0 — Layout Mobile do Mapa
- O `LayerSwitcher` usa `z-40` e `bottom-24` no mobile; a terceira camada foi testada como selecionável.
- O gatilho “Áreas do levantamento” usa `top-16` no mobile, separado dos chips `top-4`.
- `SurveyMapPanel` foi estabilizado com `88dvh`, `min-h-0`, `touch-pan-y`, `touch-manipulation` e botões com altura mínima.
- Teste de produção em 375x812: Grupo B ativo e lista do setor renderizada; sem erros de console da aplicação.
