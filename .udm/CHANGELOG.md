# UDM — CHANGELOG

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

## [0.2.0] — 2026-09-20 (Integração Cirúrgica do Design v0)
...
