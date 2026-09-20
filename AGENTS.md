# AGENTS.md — Diretrizes para Agentes de IA (FloraParqueEco)

Este arquivo é lido automaticamente por agentes de desenvolvimento (Antigravity 2.0, Claude, Codex).

## 1. Missão do Projeto
O **Inventário Arbóreo Digital do Parque Ecológico Municipal Marechal Cândido Rondon** (Vilhena - RO / IFRO)
é uma plataforma cartográfica e dendrológica aberta para catalogação, identificação botânica assistida
e preservação da flora local.

## 2. Stack Tecnológica
- **Framework:** Next.js 15.5+ (App Router) com React 19 e TypeScript estrito.
- **Estilização:** Tailwind CSS v4, Glassmorphism orgânico e tipografia editorial (Georgia serif).
- **Motor Cartográfico:** MapLibre GL JS (WebGL acelerado por GPU, 100% open-source).
- **Validação de Dados:** Zod schemas em tempo de compilação e execução (`lib/tree-schema.ts`).
- **Testes Automatizados:** Vitest (`npm test`).

## 3. Regras de Ouro
1. **O Mapa é o Protagonista:** A tela cheia pertence ao canvas do MapLibre GL. Painéis de dados (sidebar no desktop, bottom sheet no mobile) são sobreposições contextuais.
2. **displayNumber é Estritamente Null:** As árvores do parque ainda não possuem placas físicas definitivas instaladas. O identificador estável de cada árvore é seu `id` (slug).
3. **Proibição de Alucinação Científica:** Jamais invente espécies botânicas, coordenadas fictícias ou nomes falsos ("Lago das Palmeiras"). Utilize sempre dados validados pelo Zod e configurados em `lib/park-config.ts`.
4. **Desacoplamento em 4 Camadas:**
   - `DATA`: Schemas, JSONs, GeoJSONs.
   - `MAP`: MapLibre GL, WebGL canvas, estilos.
   - `UI`: Componentes visuais desacoplados (`components/ui`, `components/tree`, `components/views`).
   - `LOGIC`: Estado, busca, filtros.
5. **Governança UDM:** Toda sessão deve registrar suas alterações no UDM local (`.udm/`) e espelhar para `D:\Universal-Agent-Memory\projects\flora-parque-eco`.
