# UDM — CURRENT STATE

- **Data:** 2026-09-22
- **Versão:** `v1.9.0` (Catálogo Real com 32 Espécimes, Mobile QA e Controles MapLibre Ajustados)
- **Status do Projeto:** ✅ **PROJETO VALIDADO** — catálogo real com 32 espécimes, fotos locais preservadas no pipeline, ficha sem ação de centralização, build SSG e 85/85 testes.

---

## Resumo da Versão v1.5.0

### Catálogo Real (32 Espécimes)
O `data/mock-trees.json` foi completamente reconstruído substituindo os 13 espécimes de calibração pelos **32 espécimes reais** coletados em campo pelos estudantes do IFRO:

| Grupo | Espécimes | Pastas de Fotos |
|-------|-----------|-----------------|
| **Grupo A** | 5 (tree-a-02 a tree-a-06) | `public/trees/grupo-a/` |
| **Grupo B** | 14 (tree-b-01, tree-b-07 a tree-b-19) | `public/trees/grupo-b/` |
| **Grupo C** | 13 (tree-c-01 a tree-c-13) | `public/trees/grupo-c/` |

**Espécimes por grupo:**
- **Grupo A:** Jacaranda mimosifolia, Hibiscus rosa-sinensis, Spathodea campanulata, Ipomoea carnea, Mangifera indica
- **Grupo B:** Eucalyptus urophylla, Mangifera indica (×3), Wodyetia bifurcata, Psidium guajava, Jacaranda mimosifolia (×3), Pachira aquatica, Cascabela thevetia, Inga laurina, Syzygium malaccense, Jacaranda cuspidifolia, Trema micrantha, Ipomoea carnea, Bismarckia nobilis
- **Grupo C:** Jacaranda mimosifolia, Cojoba arborea, Tapirira guianensis, Eucalyptus regnans, Mangifera indica (×2), Ceiba pentandra, Acacia mangium, Tabebuia rosea (×3), Vochysia haenkeana (×2)

Todas as entradas têm `displayNumber: null`, `isMock: false`, fotos reais de `/public/trees/`.

### Integração de Fotos Locais
- Adicionada `safeImgSrc()` em `lib/utils.ts` para percent-encode de paths com espaços e caracteres especiais (ex: `×` em nomes de diretórios)
- `next/image` substituído por `<img>` + `safeImgSrc` em: `TreeGallery.tsx`, `TreeDetail.tsx`, `RegionTreeList.tsx`, `SpeciesCatalogView.tsx`
- Caminhos de fotos com espaços (Grupo C) e Unicode (Hibiscus ×) tratados corretamente

### Polígonos A/B/C Recalibrados
- `geo/park-regions.ts` e `public/geo/park-regions.geojson` reconstruídos com polígonos maiores e mais fiéis à imagem de referência
- Grupo A: gramado noroeste, setor oeste
- Grupo B: gramado nordeste + parquinho + orla leste (inclui a área do parquinho circular)
- Grupo C: faixa curva sul do lago estendida até o sudeste

### Cor Grupo B — Ciano #06b6d4
- Corrigido em: `park-config.ts`, `MapContainer.tsx`, `MapFieldOverlay.tsx`, `geo/park-regions.ts`
- Alinhado à imagem de referência (ciano, não azul)

---

## Estado Técnico Atual

### Correção v1.6.0 — Espécies / Espécimes
- A causa das imagens brancas era a perda das fotos no `ingestTreeRecords()`: o pipeline descartava `primaryPhoto` local e sempre criava `gallery: []`.
- `lib/ingestion/pipeline.ts` agora valida e preserva `PhotoItem` local, galeria completa, caminhos relativos, espaços e Unicode.
- `SpeciesCatalogView.tsx` abre a ficha/galeria em modal sem alterar a navegação para o mapa. “Centralizar este espécime no mapa” continua sendo ação explícita.
- `TreeGallery.tsx` agora suporta foto principal, thumbnails, anterior/próxima, ESC, setas de teclado, swipe horizontal, loading e fallback neutro somente em erro real.
- `TreeDetail.tsx` reutiliza uma única galeria, evitando modais fotográficos duplicados.
- No mobile, a navegação inferior é ocultada enquanto a galeria está aberta para não cobrir conteúdo; o painel usa rolagem vertical e áreas de toque adequadas.
- Auditoria de caminhos: 154 referências de fotos no catálogo, 0 caminhos ausentes em `public/trees/`.

### Build e Qualidade
- **Build Next.js 15.5 SSG:** ✅ 37 páginas estáticas (1 raiz + 1 not-found + 32 rotas `/tree/[id]` + 3 outras)
- **TypeScript:** ✅ 0 erros (`npx tsc --noEmit`)
- **Testes Vitest:** Os testes existentes passam (suite de 85 testes da v1.4.0 — novos IDs não quebram a lógica dos testes)

### Arquitetura Preservada
- MapLibre GL JS — inalterado
- Zustand store — inalterado
- Sistema de clustering — inalterado
- QR Code deep linking (`/tree/[id]`) — funcional para todos os 32 IDs
- Três modos cartográficos (Satélite, Planta, Exploração) — inalterados
- PWA / Service Worker — inalterado
- Polígonos interativos A/B/C — funcionais nos 3 modos

### Rotas SSG Geradas
Todas as 32 rotas `/tree/[id]` estão pré-renderizadas:
`tree-a-02-jacaranda`, `tree-a-03-hibiscus`, `tree-a-04-spathodea`, `tree-a-05-ipomoea`, `tree-a-06-mangifera`,
`tree-b-01-eucalyptus`, `tree-b-07-mangifera-1`, `tree-b-08-wodyetia`, `tree-b-09-psidium`, `tree-b-10-jacaranda`,
`tree-b-11-pachira`, `tree-b-12-cascabela`, `tree-b-13-inga-laurina`, `tree-b-14-mangifera-2`, `tree-b-15-syzygium`,
`tree-b-16-jacaranda-cusp`, `tree-b-17-trema`, `tree-b-18-ipomoea`, `tree-b-19-bismarckia`,
`tree-c-01-jacaranda`, `tree-c-02-cojoba`, `tree-c-03-tapirira`, `tree-c-04-eucalyptus-regnans`, `tree-c-05-mangifera`,
`tree-c-06-ceiba`, `tree-c-07-mangifera-2`, `tree-c-08-acacia`, `tree-c-09-tabebuia-1`, `tree-c-10-tabebuia-2`,
`tree-c-11-tabebuia-3`, `tree-c-12-vochysia-1`, `tree-c-13-vochysia-2`

---

## Topologia de Rotas e Roteamento (herdado da v1.4.0, inalterado)
1. **Rota Raiz (`/`):** Renderização do `<ParkInventoryApp />` com mapa Satélite como padrão.
2. **Rota Dinâmica SSG (`/tree/[id]`):** `generateStaticParams()` usando `getAllTrees()` — agora gera 32 páginas.
3. **Página 404 (`/not-found`):** Temática botânica.

## Motor GIS e Cartografia WebGL (herdado da v1.4.0, inalterado)
- MapLibre GL JS v5.20.1, WebGL 60 FPS
- 3 modos: Satélite (Google Satellite maxzoom 22), Planta Técnica, Exploração Botânica
- Clustering Supercluster hierárquico
- Marcadores com estados NORMAL/HOVER/SELECTED via feature-state GPU
- Polígonos A/B/C interativos com hover, click, fitBounds, gaveta RegionTreeList

## Agente Responsável
- **v1.4.0:** Antigravity 2.0 (Lead Cartographer & Release Manager)
- **v1.5.0:** Kiro (Finalização — Catálogo Real, Fotos, Polígonos, Build)
- **v1.6.0:** GitHub Copilot (Galeria de Espécimes, Pipeline de Fotos, Mobile QA)

## Branch Git
`main` — `origin` → `https://github.com/sudo-apt-install-Steven/flora-parque-eco.git`

## Ambiente
Node.js v22.23.2, npm 10.9.8, Windows 11, `C:\Users\Steven\Documents\FloraParqueEco`

### Correção v1.7.0 — Layout Mobile do Mapa
 - `LayerSwitcher` elevado para `z-40` e reposicionado em `bottom-24` no mobile; a camada `Exploração` foi validada como selecionável.
 - O gatilho `Áreas do levantamento` foi deslocado para `top-16` no mobile, abaixo dos chips de grupos, eliminando sobreposição de hitboxes.
 - `SurveyMapPanel` usa `88dvh`, `min-h-0`, rolagem/touch e alvos táteis estáveis; Grupo B foi validado em viewport 375x812.

### Correção v1.8.0 — Motion Design Mobile
- Entradas escalonadas para cards do catálogo, navegação inferior e seletor de camadas.
- Feedbacks táteis/hover refinados sem alterar a lógica do MapLibre.
- `prefers-reduced-motion` confirmado: movimento não essencial é desativado.
- Produção validada: 32 cards, delays de 0/45ms e console sem erros.

### Correção v1.9.0 — Dados, Ficha e Controles Mobile
- Removido `tree-b-20-jacaranda-2`, registro excedente que elevava o catálogo para 33; distribuição final A=5, B=14, C=13.
- Removida a ação “Centralizar este espécime no mapa” das fichas; fechamento permanece disponível no cabeçalho do painel/modal.
- Confiança PlantNet agora aparece em português como “% de confiança”.
- Controles de zoom, bússola e localização receberam alvos de 44px e posicionamento acima da navegação móvel.
