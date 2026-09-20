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

## Fase 7: Componentes de UI Modulares (UI & LOGIC) (Concluída)
- [x] Implementar `components/ui/LayerSwitcher.tsx` (Seletor dos 3 modos).
- [x] Implementar `components/ui/SearchFilterBar.tsx` (Filtro por nome, família e grupos A, B e C).
- [x] Implementar `components/tree/TreePanel.tsx` (Mobile Bottom Sheet e Desktop Sidebar).
- [x] Implementar `components/tree/TreeDetail.tsx` (Ficha botânica, galeria e PlantNet score).
- [x] Implementar `components/tree/TreeGallery.tsx` (Miniaturas por categoria e modal de zoom).
- [x] Implementar `components/ui/LegendModal.tsx` e `components/ui/StatisticsModal.tsx`.
- [x] Orquestrar `app/page.tsx` e `app/layout.tsx` com suporte a deep link QR code (`?tree=id`).

## Fase 8: Testes e Validação (Concluída)
- [x] Criar suíte de testes em `test/trees.test.ts`.
- [x] Executar testes com Vitest (6/6 testes PASS).
- [x] Validação de compilação de tipos TypeScript (`npx tsc --noEmit` - 0 erros).
- [x] Build de produção do Next.js concluído com sucesso (`npm run build`).

## Fase 9: Documentação Técnica (Concluída)
- [x] Gerar `README.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `MAP.md`, `DEVELOPMENT.md`.
- [x] Atualizar UDM (`CURRENT_STATE`, `TASKS`, `CHANGELOG`, `AGENT_HANDOFF`).

## Próximos Passos (Para o Próximo Agente)
- [ ] Integrar os componentes de design gerados no v0 quando exportados pelo usuário.
- [ ] Importar o dataset real de árvores levantado pelos Grupos A, B e C.
- [ ] Conectar imagem aérea recente de drone como camada raster overlay no `PARK_CONFIG.customRasterOverlay`.
- [ ] Ajustar geometrias finas do lago e playground após conferência presencial de campo.
