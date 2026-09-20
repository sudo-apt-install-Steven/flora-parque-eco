# UDM — TASKS & MILESTONES

## Fase 1: Inspeção de Ambiente & Memória UDM (Concluída)
- [x] Localizar UDM e banco `udm_v3.db` no HD (`D:\Universal-Agent-Memory`).
- [x] Mapear padrões de projetos anteriores de Steven (Next.js, Vercel, Tailwind, TypeScript).
- [x] Obter coordenadas de referência do Parque Ecológico / IFRO Vilhena.

## Fase 2: Definição de Arquitetura (Concluída)
- [x] Definir stack técnica (Next.js 15.5+, React 19, TypeScript, Tailwind CSS v4, MapLibre GL JS).
- [x] Redigir ADRs 001 a 005.

## Fase 3: Estrutura do Projeto & Governança UDM (Concluída)
- [x] Criar estrutura `.udm/` no repositório.
- [x] Espelhar UDM no HD (`D:\Universal-Agent-Memory\projects\flora-parque-eco`).
- [x] Registrar memórias e swarm handoff no banco central SQLite `udm_v3.db`.

## Fase 4: Inicialização do Next.js e Dependências (Concluída)
- [x] Criar `package.json`, `tsconfig.json`, `next.config.mjs`, `vercel.json`, `postcss.config.mjs`.
- [x] Instalar dependências essenciais (`maplibre-gl`, `lucide-react`, `clsx`, `tailwind-merge`, `zod`, `vitest`).
- [x] Atualizar Next.js para 15.5.25 eliminando avisos de vulnerabilidade.

## Fase 5: Implementação da Fundação de Dados (DATA) (Concluída)
- [x] Implementar `lib/tree-schema.ts` com validação Zod.
- [x] Implementar `lib/park-config.ts` com coordenadas e limites de Vilhena/IFRO.
- [x] Criar `data/mock-trees.json` e utilitários de acesso `lib/trees.ts`.
- [x] Criar GeoJSONs em `geo/`: `park-boundary.geojson`, `park-planta.geojson` e `park-exploration.geojson`.

## Fase 6: Sistema do Mapa (MAP) (Concluída)
- [x] Implementar `components/map/MapContainer.tsx` (MapLibre GL com aceleração WebGL a 60 FPS).
- [x] Implementar `components/map/DynamicMap.tsx` com `next/dynamic` (`ssr: false`).
- [x] Implementar os 3 modos de mapa: Satélite (com slot de ortomosaico), Planta (lago, caminhos, ponte, playground) e Exploração (curvas de nível e zonas botânicas).
- [x] Implementar clustering dinâmico com cores por equipe de campo.

## Fase 7: Migração Cirúrgica do Design do v0 (Concluída)
- [x] Migrar e calibrar tokens visuais do v0 em `app/globals.css` (paleta Deep Forest, Paper, Gold, keyframes).
- [x] Implementar `lib/utils.ts` (`cn` helper com `clsx` e `tailwind-merge`).
- [x] Migrar Brand lockup oficial e cabeçalho desktop/mobile em `components/ui/AppHeader.tsx`.
- [x] Migrar barra de navegação móvel com vidro jateado em `components/ui/MobileNav.tsx`.
- [x] Implementar popover flutuante de busca instantânea com suporte a `⌘ K` e `ESC` em `components/ui/SearchPopover.tsx`.
- [x] Refatorar seletor de camadas cartográficas com mini-amostras visuais em `components/ui/LayerSwitcher.tsx`.
- [x] Implementar selo cartográfico com coordenadas geográficas de Vilhena e filtros em `components/ui/MapFieldOverlay.tsx`.
- [x] Refatorar ficha do espécime com tipografia Georgia serifada, fatos de campo e PlantNet em `components/tree/TreeDetail.tsx`.
- [x] Refatorar painel lateral (desktop) e bottom sheet (mobile) com animações dedicadas em `components/tree/TreePanel.tsx`.
- [x] Implementar tela de catálogo vivo com estatísticas dinâmicas em `components/views/SpeciesCatalogView.tsx`.
- [x] Implementar tela institucional de metodologia e conservação em `components/views/ProjectAboutView.tsx`.
- [x] Orquestrar `app/page.tsx` mantendo o mapa WebGL como protagonista absoluto da interface.

## Fase 8: Testes e Validação Contínua (Concluída)
- [x] Criar suíte de testes de UI em `test/ui.test.ts`.
- [x] Executar testes com Vitest (12/12 testes PASS).
- [x] Validação de compilação de tipos TypeScript (`npx tsc --noEmit` - 0 erros).
- [x] Build de produção do Next.js concluído com sucesso (`npm run build`).

## Fase 9: Melhorias Antigravity 2.0 & Skills (Concluída)
- [x] Criar plugin `vibe-coder-plugin` em `C:\Users\Steven\.gemini\config\plugins\vibe-coder-plugin`.
- [x] Instalar skill `vibe-coder` para desenvolvimento ágil de Full-AI Apps.
- [x] Instalar skill `design-system-craft` para artesanato visual e cartografia digital.
- [x] Configurar MCP servers em `C:\Users\Steven\.gemini\config\mcp_config.json`.
- [x] Criar regras de governança para agentes em `AGENTS.md` e `.agents/rules/vibe-coding.md`.

## Fase 10: Engenharia de Dados, Estado Global & QA de Resiliência (Concluída)
- [x] Criar pipeline de ingestão CSV RFC 4180 puro com autodeteção de delimitadores e headers bilíngues (`lib/ingestion/csv-parser.ts`).
- [x] Criar conversor geográfico de metadados EXIF DMS para Graus Decimais com quadrantes N/S/E/W (`lib/ingestion/exif-extractor.ts`).
- [x] Criar normalizador de respostas da API PlantNet v2 com clamping e links taxonômicos canônicos (`lib/ingestion/plantnet-mapper.ts`).
- [x] Criar pipeline mestre de sanitização geográfica com desduplicação e correção de coordenadas invertidas em Vilhena/RO (`lib/ingestion/pipeline.ts`).
- [x] Implementar Zustand 5 store reativa (`useTreeStore`) com seletores atômicos e sincronização de URL (`lib/store/tree-store.ts`).
- [x] Desenvolver motor de busca insensível a acentos (NFD) e filtros facetados multidimensionais (`lib/filters.ts`).
- [x] Implementar blindagem de fallbacks com SVG vetorial embutido e sanitizador em tempo de execução (`lib/fallbacks.ts`).
- [x] Criar suíte de 35 novos testes automatizados no Vitest cobrindo fallbacks, filtros, pipeline de ingestão e store Zustand.
- [x] Garantir 100% de testes aprovados (47/47 testes PASS) e 0 erros de TypeScript / Build estático Next.js.

## Próximos Passos (Para o Próximo Agente)
- [ ] Importar o dataset de campo real das turmas dos Grupos A, B e C usando o pipeline `ingestTreeRecords()` diretamente na interface ou via CLI.
- [ ] Conectar imagem aérea recente de drone como camada raster overlay no `PARK_CONFIG.customRasterOverlay`.
- [ ] Ajustar geometrias finas do lago e playground após conferência presencial de campo com GPS geodésico.
- [ ] Opcional: Excluir a pasta `design_do_v0_aqui/` (ou `_v0_design_raw/`) pois todo o código e design foram 100% integrados.
