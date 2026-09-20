# UDM — AGENT HANDOFF: PARQUE ECOLÓGICO VILHENA (DATA ARCHITECTURE & QA HANDOFF)

> **Aviso ao Próximo Agente (Claude / Codex / Antigravity):** Este documento é a memória de transição oficial do projeto após a conclusão das fases de UI Integration e Data Engineering / State Architecture. Você NÃO precisa pedir ao usuário para reexplicar o histórico. Leia este documento com atenção antes de realizar qualquer alteração.

---

## 1. Estado Geral do Projeto
- **Framework:** Next.js 15.5.25 (App Router), React 19, TypeScript estrito (0% `any`).
- **Cartografia:** MapLibre GL JS (WebGL acelerado por GPU).
- **Estilização:** Tailwind CSS v4, Glassmorphism orgânico e paleta botânica editorial.
- **Gerenciamento de Estado:** Zustand 5 (`lib/store/tree-store.ts`).
- **Validação & Parsing:** Zod (`lib/tree-schema.ts`), CSV RFC 4180 puro, EXIF DMS Converter, PlantNet v2 Mapper.
- **Blindagem de Dados:** `lib/fallbacks.ts` (100% de proteção contra dados parciais ou nulos).
- **QA & Testes:** 47/47 testes aprovados no Vitest (`npm test`). Compilação TypeScript com 0 erros (`npx tsc --noEmit`). Build Next.js 100% PASS.

---

## 2. Como Consumir o Estado Global (`useTreeStore`)

A aplicação utiliza seletores atômicos memoizados em `lib/store/tree-store.ts` para evitar re-renderizações desnecessárias:

```tsx
import { 
  useActiveTree, 
  useFilteredCatalog, 
  useFilterCriteria, 
  useFilterActions, 
  useFacetedStats,
  useTreeStore 
} from "@/lib/store/tree-store";

// Para ler a árvore ativa (já blindada com getSafeTree()):
const activeTree = useActiveTree();

// Para obter a lista de árvores filtradas:
const filteredTrees = useFilteredCatalog();

// Para acessar as estatísticas calculadas em tempo real:
const stats = useFacetedStats(); // { totalCount, uniqueFamiliesCount, plantnetConfirmedCount, etc. }

// Para manipular seleção e filtros:
const { 
  selectTree,      // (treeOrId: Tree | string | null) => void
  setSearchQuery,  // (query: string) => void
  setSelectedGroup,// (group: string | null) => void
  setSelectedFamily,// (family: string | null) => void
  setSelectedConfidence, // (confidence: TreeConfidence | null) => void
  resetFilters,    // () => void
  triggerFocusKey  // () => void (força recentralização do mapa)
} = useFilterActions();
```

---

## 3. Pipeline de Ingestão de Dados de Campo (`lib/ingestion/`)

O projeto está pronto para processar planilhas reais e metadados de fotos coletadas pelos Grupos A, B e C:

### 3.1. Ingestão de CSV (`lib/ingestion/csv-parser.ts`)
- Suporta delimitadores `,` e `;`.
- Trata campos com aspas e quebras de linha (RFC 4180).
- Dicionário de cabeçalhos bilíngue: mapeia colunas como `nome_comum`, `lat`, `long`, `coleta_grupo` automaticamente.

### 3.2. Metadados de GPS EXIF (`lib/ingestion/exif-extractor.ts`)
- Converte DMS (`[deg, min, sec]`) para graus decimais levando em conta as referências cardeais `N`, `S`, `E`, `W`.
- Suporta parsing de timestamps em formato EXIF (`YYYY:MM:DD HH:MM:SS`) para ISO 8601.

### 3.3. API PlantNet v2 (`lib/ingestion/plantnet-mapper.ts`)
- Normaliza respostas da API do PlantNet v2.
- Clampa scores entre 0.0 e 1.0 e classifica em `high` (>= 0.70), `medium` (>= 0.40) ou `low`.
- Constrói links diretos para Powo (Kew Royal Botanic Gardens) e GBIF.

### 3.4. Pipeline Mestre de Validação & Geocorreção (`lib/ingestion/pipeline.ts`)
- Função: `ingestTreeRecords(records, options)`.
- **Bounding Box do Parque:** Valida se as coordenadas estão dentro de Vilhena/RO (`[[-60.1350, -12.7180], [-60.1030, -12.6900]]`).
- **Autocorreção de Coordenadas Invertidas:**
  - Se a latitude vier positiva (ex: `12.7044`), converte automaticamente para Sul (`-12.7044`).
  - Se a latitude e longitude vierem invertidas (ex: Lat ~ -60.1, Lng ~ -12.7), detecta o erro e inverte os eixos para manter a árvore no parque em Vilhena.
- Retorna um `IngestionResult` detalhado com `validTrees`, `invalidRecords` e `warnings`.

---

## 4. Blindagem de Dados e Fallbacks (`lib/fallbacks.ts`)

Regras rígidas para nunca quebrar a interface em produção:
1. **Fotos:** Se a árvore não tiver foto ou a foto vier com URL corrompida, `getSafeTree()` atribui `DEFAULT_FALLBACK_PHOTO` (SVG botânico em vetor data-uri embutido com gradiente Deep Forest — sem requests HTTP externos).
2. **displayNumber:** Permanece **estritamente `null`** por padrão. A formatação de exibição via `formatDisplayNumber()` retorna `"—"` quando for `null`. Não inventar números ou placas físicas até que sejam instaladas no parque pelo IFRO.
3. **PlantNet:** Se os dados do PlantNet forem omitidos, é atribuído `DEFAULT_FALLBACK_PLANTNET` com score `0` e status `unverified`.

---

## 5. Próximos Passos Recomendados
1. **Importação do Lote Real de Campo:**
   - Quando as turmas dos Grupos A, B e C finalizarem a coleta de campo, alimentar o pipeline via `ingestTreeRecords()` e atualizar `data/mock-trees.json` para os dados oficiais.
2. **Camada Raster do Voo de Drone:**
   - Inserir ortomosaico recente em `public/geo/` e ativar `customRasterOverlay` no `lib/park-config.ts`.
3. **Placas Físicas Definitivas:**
   - Preencher `displayNumber` somente quando as placas físicas numeradas forem pregadas em campo.
