# UDM — CHANGELOG

## [0.1.0] — 2026-09-20 (Fundação Técnica Concluída)

### Adicionado
- **Governança UDM:** Registrada em `.udm/` e espelhada no HD em `D:\Universal-Agent-Memory\projects\flora-parque-eco`. Memórias persistidas no banco SQLite `udm_v3.db`.
- **Arquitetura Desacoplada (DATA, MAP, UI, LOGIC):**
  - **DATA:** Schema Zod estrito (`lib/tree-schema.ts`), mock data validado (`data/mock-trees.json`), utilitários (`lib/trees.ts`) e 3 fontes GeoJSON (`park-boundary`, `park-planta`, `park-exploration`).
  - **MAP:** Motor MapLibre GL JS com aceleração WebGL a 60 FPS, clustering dinâmico, controles de bússola, zoom, escala e geolocalização por GPS.
  - **UI:** Componentes modulares prontos para o design v0 (`LayerSwitcher`, `SearchFilterBar`, `TreePanel`, `TreeDetail`, `TreeGallery`, `LegendModal`, `StatisticsModal`).
  - **LOGIC:** Filtros por grupo (`groupA`, `groupB`, `groupC`), busca por nome popular/científico/família e suporte a acesso direto por QR Code (`?tree=id`).
- **Suporte aos 3 Modos de Mapa:**
  - *Satélite* (Tiles aéreos reais com slot para ortomosaico de drone);
  - *Planta* (Camadas vetoriais do lago, caminhos, ponte, playground e IFRO);
  - *Exploração* (Curvas de nível altimétricas, zonas botânicas e pontos notáveis).
- **Testes & Qualidade:**
  - Suíte Vitest com 6 testes automatizados validando schemas, integridade de IDs, regras de negócio e GeoJSON.
  - Verificação de tipos TypeScript estrita sem erros (`tsc --noEmit`).
  - Build de produção do Next.js gerado com sucesso.
- **Documentação:** Criados `README.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `MAP.md`, `DEVELOPMENT.md` e artefatos de handoff UDM.
