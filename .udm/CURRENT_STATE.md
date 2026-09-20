# UDM — CURRENT STATE

- **Data:** 2026-09-20
- **Status do Projeto:** Fase de Arquitetura de Dados, Gerenciamento de Estado Global & QA de Resiliência Concluída (Zustand 5 Store + Ingestão CSV/EXIF/PlantNet + Motor de Busca Normalizada + Blindagem de Fallbacks + 47/47 Testes Vitest PASS + Build 100% PASS)
- **Agente Responsável:** Antigravity (Lead Data Engineer, State Architect & QA Manager)
- **Branch Git:** `main`
- **Ambiente:** Node.js v22.23.2, npm 10.9.8, Windows 11 IoT Enterprise LTSC, C:\Users\Steven\Documents\FloraParqueEco
- **HD UDM Root:** D:\Universal-Agent-Memory\projects\flora-parque-eco
- **Banco de Dados UDM:** D:\Universal-Agent-Memory\data\udm_v3.db

## Arquitetura de Dados & Estado Entregue (0% `any`, TypeScript Estrito):
1. `lib/tree-schema.ts`:
   - Esquemas Zod estritos e tipos TypeScript: `Tree`, `SafeTree`, `TreeConfidence`, `TreeFilterCriteria`, `TreeFacetedStats`, `IngestionResult`, `ExifGpsRawData`, `PlantNetRawResult`.
   - Regra de ouro: `displayNumber` é estritamente `null` por padrão (ausência de placas físicas no parque).
2. `lib/fallbacks.ts`:
   - Blindagem total contra `null`, `undefined` e dados truncados de campo.
   - `getSafeTree()`: Sanitização em tempo de execução garantindo objetos com propriedades completas e íntegras.
   - `DEFAULT_FALLBACK_PHOTO`: Data URI em SVG botânico com gradiente Deep Forest embutido, eliminando chamadas HTTP externas e broken images.
   - `DEFAULT_FALLBACK_PLANTNET`: Objeto de identificação padrão com score 0 e status de pendência.
   - Formatadores seguros: `formatCoordinates()`, `formatDisplayNumber()`, `getConfidenceBadgeColor()`, `getGroupLabel()`, `getStatusLabel()`.
3. `lib/filters.ts`:
   - `normalizeSearchString()`: Normalização NFD removendo diacríticos/acentos e convertendo para minúsculas.
   - Busca multi-token: Cada palavra da busca é verificada em nome científico, nome comum, família e ID botânico.
   - `filterTrees()`: Filtragem combinada multidimensional (Família, Confiança, Equipe/Grupo A/B/C, Status Botânico, Query).
   - `calculateFacetedStats()`: Agregação instantânea de totais, famílias únicas, distribuição por confiança e contagem por equipe.
4. `lib/ingestion/`:
   - `csv-parser.ts`: Parser RFC 4180 puro sem dependências externas, autodeteção de delimitadores (`,` e `;`), suporte a aspas escapadas e mapeamento flexível de cabeçalhos (pt-BR e en).
   - `exif-extractor.ts`: Conversor geográfico de coordenadas DMS (Graus, Minutos, Segundos) para Graus Decimais com suporte a quadrantes N/S/E/W, altitude e timestamps ISO.
   - `plantnet-mapper.ts`: Mapeador de respostas de API PlantNet v2 com clamping de scores, links canônicos para GBIF/POWO e cálculo de recomendação de confiança.
   - `pipeline.ts`: Pipeline mestre `ingestTreeRecords()` com sanitização, desduplicação de IDs, validação Zod e algoritmo de correção geográfica para Vilhena/RO (detecção e correção de latitude positiva acidental e inversão de eixos Lat/Lng).
5. `lib/store/tree-store.ts`:
   - Zustand 5 store reativa (`useTreeStore`).
   - Seletores atômicos memoizados: `useActiveTree()`, `useFilteredCatalog()`, `useFilterCriteria()`, `useFilterActions()`, `useFacetedStats()`.
   - Sincronização automática com parâmetros de URL (`?tree=slug`).
   - Métodos reativos de importação de dados (`importData`) com cálculo imediato de facetas.
6. `lib/trees.ts`:
   - Camada de compatibilidade re-exportando utilitários essenciais (`getTreeById`, `getFilteredTrees`, `getAllTrees`, etc.).
7. `app/page.tsx`:
   - Totalmente conectado aos seletores do Zustand store, mantendo 100% da integridade visual (Tailwind v4, CSS glassmorphism) e aceleração WebGL do MapLibre GL.

## Qualidade & Testes (QA):
- **Suíte de Testes:** 47/47 testes aprovados no Vitest (`fallbacks.test.ts`, `filters.test.ts`, `ingestion.test.ts`, `store.test.ts`, `trees.test.ts`, `ui.test.ts`).
- **TypeScript:** 0 erros de compilação em `npx tsc --noEmit`.
- **Build de Produção:** Next.js 15.5 gerando 100% de rotas estáticas pré-renderizadas com sucesso (`npm run build`).
- **Bloqueios Ativos:** Nenhum.
