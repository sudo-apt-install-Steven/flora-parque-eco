# UDM — CURRENT STATE

- **Data:** 2026-09-20
- **Status do Projeto:** Fase de Integração de UI & Refino Cartográfico Concluída (Componentes v0 Migrados + Marcador Ativo + Bottom Sheet com Gesto Swipe + Build & Testes 100% PASS)
- **Agente Responsável:** Antigravity (UI Integration Engineer)
- **Branch Git:** `main`
- **Ambiente:** Node.js v22.23.2, npm 10.9.8, Windows 11 IoT Enterprise LTSC, C:\Users\Steven\Documents\FloraParqueEco
- **HD UDM Root:** D:\Universal-Agent-Memory\projects\flora-parque-eco
- **Banco de Dados UDM:** D:\Universal-Agent-Memory\data\udm_v3.db
- **Componentes de UI Integrados e Refinados:**
  1. `lib/utils.ts`: Helper `cn()` com `clsx` e `tailwind-merge`.
  2. `app/globals.css`: Tokens de design do atlas botânico (paleta Deep Forest `#0b211d`, Paper `#f8f6ef`, Gold `#d6a35b`, animações `panel-in`, `sheet-in`, `breathe`, `.tree-marker`, `.marker-core` e `.marker-pulse`).
  3. `components/map/MapContainer.tsx` & `DynamicMap.tsx`: MapLibre GL com aceleração WebGL, renderização dinâmica do marcador ativo com ícone de folha dourado e aura pulsante, e prop `focusKey` que garante re-centralização imediata ao clicar em "Centralizar no mapa".
  4. `components/ui/AppHeader.tsx`: Cabeçalho com Brand lockup oficial do Parque Ecológico/IFRO, abas de navegação (Mapa, Espécies, Métricas, Projeto) e gatilho de busca com atalho `⌘ K`.
  5. `components/ui/MobileNav.tsx`: Barra de navegação móvel inferior com vidro jateado (frosted glass) e microinterações de toque.
  6. `components/ui/SearchPopover.tsx`: Popover flutuante de busca instantânea com suporte a teclado (`⌘ K`, `ESC`), filtro botânico e centralização automática no mapa.
  7. `components/ui/LayerSwitcher.tsx`: Seletor refinado de camadas cartográficas com mini-amostras visuais (Satélite, Planta e Exploração) e estado colapsável.
  8. `components/ui/MapFieldOverlay.tsx`: Selo cartográfico com coordenadas geográficas de Vilhena (`12°42′ S · 60°07′ O`), chips de filtro de equipes (Grupos A, B, C) e legenda botânica.
  9. `components/tree/TreePanel.tsx`: Container adaptativo com animação `panel-in` (sidebar no desktop) e Bottom Sheet no mobile ancorado em `bottom-0` com backdrop scrim para toque externo e suporte a gesto tátil de arrastar para fechar (swipe down > 50px).
  10. `components/tree/TreeDetail.tsx`: Ficha dendrológica com tipografia serifada (Georgia), fatos botânicos, card PlantNet com score de match, botão de compartilhamento com URL parametrizada (`?tree=id`), feedback de cópia ("Link copiado!") e botão "Centralizar no mapa".
  11. `components/tree/TreeGallery.tsx`: Galeria com foto principal, miniaturas por categoria e modal com zoom.
  12. `components/views/SpeciesCatalogView.tsx`: Catálogo vivo com métricas em tempo real calculadas a partir dos espécimes, busca interna e listagem interativa.
  13. `components/views/ProjectAboutView.tsx`: Visão editorial sobre o projeto, metodologia dos 3 pilares acadêmicos e parceria IFRO Campus Vilhena.
  14. `components/ui/LegendModal.tsx` & `components/ui/StatisticsModal.tsx`: Modais harmonizados com a estética editorial botânica (Warm Paper e Deep Forest).
- **Suíte de Testes:** 12/12 testes aprovados no Vitest (`test/trees.test.ts` e `test/ui.test.ts`).
- **TypeScript:** 0 erros de compilação em `npx tsc --noEmit`.
- **Build de Produção:** Next.js 15.5 gerando 100% de rotas estáticas pré-renderizadas com sucesso.
- **Melhorias Antigravity 2.0:**
  - Plugin `vibe-coder-plugin` com 5 skills instaladas: `vibe-coder`, `design-system-craft`, `full-ai-architecture`, `maplibre-spatial-craft`, `tailwind-v4-motion`.
  - Configuração corrigida do servidor MCP `udm-memory` apontando para o script real Node.js compilado em `D:\Universal-Agent-Memory`.
- **Status do Protótipo v0 (`design_do_v0_aqui/`):** 100% migrado, refatorado e aprimorado.
- **Bloqueios Ativos:** Nenhum.
