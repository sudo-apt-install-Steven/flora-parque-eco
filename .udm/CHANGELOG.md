# UDM — CHANGELOG

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
