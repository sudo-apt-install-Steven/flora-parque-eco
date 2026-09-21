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


