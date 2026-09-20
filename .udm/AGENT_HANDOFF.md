# UDM — AGENT HANDOFF: PARQUE ECOLÓGICO VILHENA (UI INTEGRATION & REFINEMENT SESSION)

> **Aviso ao Próximo Agente (Claude/Codex/Antigravity):** Este documento é a memória de transição oficial do projeto. Você NÃO precisa pedir ao usuário para reexplicar o histórico. Leia este documento com atenção antes de realizar qualquer alteração.

---

## 1. Estado Atual da Interface e do Projeto
- A migração e o refino de engenharia de UI a partir do protótipo v0 (`design_do_v0_aqui/`) estão **100% concluídos, validados e compilando com zero erros**.
- **O Mapa WebGL (MapLibre GL JS) continua sendo o protagonista absoluto da interface**, com camadas (Satélite, Planta e Exploração), clustering dinâmico e aceleração por GPU.
- **Novos refinamentos críticos de UI entregues nesta sessão:**
  1. **Marcador Ativo do v0 no Mapa:** Quando um espécime é selecionado (via mapa, busca ou catálogo), um marcador HTML exclusivo com o ícone botânico de folha dourada e aura pulsante (`breathe`) é renderizado exatamente nas coordenadas do espécime e removido ao fechar.
  2. **Re-centralização Garantida com `focusKey`:** Clicar em "Centralizar este espécime no mapa" ou selecionar o mesmo espécime na busca/catálogo força o mapa a voar e recentralizar (`map.easeTo`), mesmo que o espécime já estivesse selecionado.
  3. **Bottom Sheet Móvel Ergonômico:** Ancorado perfeitamente na borda inferior (`bottom-0 z-50`), com backdrop scrim (`z-40`) para fechamento ao toque fora, e suporte a gesto tátil de arrasto para baixo (swipe down > 50px) no puxador.
  4. **Sincronização de URL & Compartilhamento:** A URL do navegador agora sincroniza automaticamente com o espécime ativo (`/?tree=slug`) via `history.replaceState`. O botão de compartilhar gera URLs parametrizadas com feedback visual ("Link copiado!").
  5. **Modais Harmonizados:** `LegendModal` e `StatisticsModal` adotaram os tokens da paleta editorial (Warm Paper `#f8f6ef`, Deep Forest `#0b211d` e Warm Gold `#d6a35b`).
  6. **Conectores MCP & Skills Antigravity 2.0:** O caminho do servidor MCP `udm-memory` foi corrigido para usar o script Node.js real em `D:\Universal-Agent-Memory`, e o plugin `vibe-coder-plugin` foi expandido com 5 skills de referência.
- **Testes:** 12/12 testes Vitest PASS (`test/trees.test.ts` e `test/ui.test.ts`).
- **Compilação TypeScript:** 0 erros (`npx tsc --noEmit`).
- **Build de Produção:** Next.js 15.5 100% PASS gerando páginas estáticas otimizadas.

---

## 2. Mapa de Componentes Integrados e Localização

| Componente | Localização | Descrição e Papel na Arquitetura |
| :--- | :--- | :--- |
| `cn` Helper | `lib/utils.ts` | Utilitário de mesclagem condicional de classes Tailwind usando `clsx` e `tailwind-merge`. |
| Design Tokens & Keyframes | `app/globals.css` | Paleta Deep Forest (`#0b211d`), Warm Paper (`#f8f6ef`), Gold (`#d6a35b`), animações `panel-in`, `sheet-in`, `breathe`, `.tree-marker`, `.marker-core` e `.marker-pulse`. |
| `MapContainer` & `DynamicMap` | `components/map/` | MapLibre GL com aceleração GPU, clustering dinâmico, marcador botânico ativo e controle de foco com `focusKey`. |
| `AppHeader` | `components/ui/AppHeader.tsx` | Cabeçalho com Brand lockup oficial do IFRO/Parque, abas de navegação (Mapa, Espécies, Métricas, Projeto) e gatilho de busca. |
| `MobileNav` | `components/ui/MobileNav.tsx` | Barra de navegação móvel inferior em vidro jateado com alvos de toque e estado ativo dourado. |
| `SearchPopover` | `components/ui/SearchPopover.tsx` | Modal/popover flutuante de busca instantânea com suporte a `⌘ K` e `ESC`, filtros rápidos e foco automático no mapa. |
| `LayerSwitcher` | `components/ui/LayerSwitcher.tsx` | Seletor de camadas cartográficas com mini-amostras visuais para Satélite, Planta e Exploração, e estado colapsável. |
| `MapFieldOverlay` | `components/ui/MapFieldOverlay.tsx` | Selo cartográfico com coordenadas de Vilhena (`12°42′ S · 60°07′ O`), chips de filtro de equipes acadêmicas (Grupos A, B, C) e legenda botânica. |
| `TreePanel` | `components/tree/TreePanel.tsx` | Container adaptativo: Sidebar com animação `panel-in` no desktop e Bottom Sheet no mobile ancorado em `bottom-0` com scrim e gesto swipe-down. |
| `TreeDetail` | `components/tree/TreeDetail.tsx` | Ficha dendrológica editorial em Georgia serif, fatos botânicos, card PlantNet, botão de compartilhar com URL direta e botão "Centralizar no mapa". |
| `TreeGallery` | `components/tree/TreeGallery.tsx` | Galeria de fotos com foto de destaque, miniaturas por categoria (casca, folha, flor, fruto) e modal de zoom. |
| `SpeciesCatalogView` | `components/views/SpeciesCatalogView.tsx` | Tela do catálogo vivo com métricas em tempo real calculadas a partir dos espécimes, busca interna e listagem interativa. |
| `ProjectAboutView` | `components/views/ProjectAboutView.tsx` | Tela editorial sobre o projeto, metodologia dos 3 pilares acadêmicos e parceria IFRO Campus Vilhena. |
| `LegendModal` & `StatisticsModal` | `components/ui/` | Modais informativos com visual botânico harmonizado. |
| Orquestrador Principal | `app/page.tsx` | Orquestra estado global, sincronização de URL (`?tree=...`), mapas, modais e sub-views. |

---

## 3. Conectores e Skills Antigravity 2.0 Instalados
1. **Plugin Vibe Coder (`C:\Users\Steven\.gemini\config\plugins\vibe-coder-plugin\`):**
   - `vibe-coder`: Diretrizes de desenvolvimento ágil para apps Full-AI.
   - `design-system-craft`: Artesanato de interfaces botânicas e cartografia editorial.
   - `full-ai-architecture`: Arquitetura para Full-AI Apps, Zod contracts, streaming e resiliência offline.
   - `maplibre-spatial-craft`: Práticas de alto nível para WebGL, clustering, GeoJSON e marcadores de mapa.
   - `tailwind-v4-motion`: Animações aceleradas por hardware, gestos mobile táteis e CSS variables no Tailwind v4.
2. **Servidor MCP `udm-memory`:**
   - Configurado em `C:\Users\Steven\.gemini\config\mcp_config.json` e `C:\Users\Steven\.gemini\antigravity\settings.json` apontando para o script real Node.js compilado em `D:\Universal-Agent-Memory\repo\universal-development-memory\packages\retrieval-broker\dist\src\index.js`.
3. **Regras de Governança:**
   - Registradas em `AGENTS.md` e `.agents/rules/vibe-coding.md`.

---

## 4. Status da Pasta de Design Raw (`design_do_v0_aqui/`)
- A pasta original `design_do_v0_aqui/` (referenciada como `_v0_design_raw/`) foi **100% absorvida e aprimorada**.
- Todos os marcadores, microinterações, estilos, paleta e telas foram migrados com desacoplamento arquitetural e tipagem estrita.
- A pasta pode ser removida com segurança pelo usuário a qualquer momento para limpeza do repositório.

---

## 5. Próximos Passos Recomendados para a Próxima Sessão
1. **Planilhas Reais de Campo:**
   - Inserir os dados reais coletados pelas turmas dos Grupos A, B e C substituindo os 5 espécimes de calibração em `data/mock-trees.json`.
2. **Voo de Drone (Ortomosaico):**
   - Importar o GeoTIFF/PNG georreferenciado para `public/geo/` e ativar `PARK_CONFIG.customRasterOverlay.enabled: true`.
3. **Fixação das Placas Físicas:**
   - Conforme as plaquetas físicas forem pregadas nas árvores pelo IFRO, atribuir os números reais aos campos `displayNumber` (atualmente estritamente `null`).
