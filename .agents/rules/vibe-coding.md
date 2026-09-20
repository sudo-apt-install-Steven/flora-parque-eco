# Vibe Coding & Design Rules (FloraParqueEco)

- **Identidade Visual:**
  - Fundo principal: Papel quente `#f4f1e8` / Deep Forest `#0b211d`.
  - Acentos: Dourado cartográfico `#d6a35b`, Esmeralda `#10b981`, Azul água `#25778b`.
  - Títulos principais: Fonte serifada (`font-serif`, Georgia), elegante e editorial.
  - Dados técnicos: Sans-serif nítida e monoespaçada para coordenadas e códigos.
- **Responsividade:**
  - Mobile: Bottom sheet com `animate-sheet-in`, alça de arraste táctil e alvos de toque >= 44px.
  - Desktop: Sidebar flutuante com `animate-panel-in` e cantos arredondados (`rounded-3xl`).
- **Performance:**
  - Animações CSS aceleradas por GPU.
  - Testes Vitest e build de produção Next.js devem rodar com 100% PASS.
