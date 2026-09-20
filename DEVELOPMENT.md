# Guia de Desenvolvimento — DEVELOPMENT.md

## 1. Pré-requisitos
- **Node.js:** Versão 20.x ou superior (Recomendado: 22.x LTS)
- **Gerenciador de Pacotes:** `npm` (versão 10+)
- **Navegador:** Qualquer navegador moderno com suporte a WebGL 2.0 (Chrome, Firefox, Safari, Edge)

---

## 2. Instalação e Execução Local

```bash
# 1. Clonar ou abrir o diretório do projeto
cd c:/Users/Steven/Documents/FloraParqueEco

# 2. Instalar as dependências do projeto
npm install

# 3. Executar a suíte de testes de validação
npm test

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse a aplicação no navegador em:
**`http://localhost:3000`**

Para simular o acesso direto de um visitante via **QR Code de árvore**:
- `http://localhost:3000/?tree=mock-tree-001`
- `http://localhost:3000/?tree=mock-tree-003`

---

## 3. Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Next.js na porta 3000 |
| `npm run build` | Compila a aplicação para produção otimizada |
| `npm start` | Inicia o servidor de produção local após o build |
| `npm test` | Executa os testes automatizados com Vitest |
| `npx tsc --noEmit` | Executa a verificação estrita de tipos do TypeScript |

---

## 4. Estrutura de Pastas do Projeto

```
FloraParqueEco/
├── .udm/                     # Memória e governança UDM compartilhada entre agentes
│   ├── GLOBAL.md
│   ├── PROJECT.md
│   ├── CURRENT_STATE.md
│   ├── DECISIONS.md
│   ├── TASKS.md
│   ├── AGENT_HANDOFF.md
│   └── CHANGELOG.md
├── app/                      # Next.js App Router
│   ├── globals.css           # Estilos globais e Tailwind v4
│   ├── layout.tsx            # Layout com viewport e metadados PWA
│   └── page.tsx              # Página principal orquestradora
├── components/
│   ├── map/                  # Camada cartográfica (MapLibre GL)
│   │   ├── DynamicMap.tsx    # Carregador com ssr: false
│   │   └── MapContainer.tsx  # Instância WebGL e controles
│   ├── tree/                 # Fichas botânicas e visualização
│   │   ├── TreeDetail.tsx    # Ficha técnica do espécime
│   │   ├── TreeGallery.tsx   # Galeria e modal de zoom
│   │   └── TreePanel.tsx     # Bottom sheet (mobile) e Sidebar (desktop)
│   └── ui/                   # Controles interativos prontos para v0
│       ├── LayerSwitcher.tsx # Alternador dos 3 modos de mapa
│       ├── LegendModal.tsx   # Modal explicativo e acadêmico
│       ├── SearchFilterBar.tsx # Barra de busca e filtros de grupo
│       └── StatisticsModal.tsx # Métricas consolidadas
├── data/
│   └── mock-trees.json       # Dados de teste acadêmicos validados
├── geo/
│   ├── park-boundary.geojson # Limites do parque e IFRO
│   ├── park-planta.geojson   # Camada vetorial (lago, caminhos, playground)
│   └── park-exploration.geojson # Curvas de nível e zonas botânicas
├── lib/
│   ├── map-styles.ts         # Estilos cartográficos (Satélite, Planta, Exploração)
│   ├── park-config.ts        # Coordenadas de Vilhena/IFRO e bounding box
│   ├── tree-schema.ts        # Schemas Zod e tipos TypeScript
│   └── trees.ts              # Utilitários de busca, filtros e GeoJSON
├── test/
│   └── trees.test.ts         # Testes automatizados com Vitest
├── package.json
├── tsconfig.json
├── vercel.json               # Configurações de deploy na Vercel
├── vitest.config.ts
└── next.config.mjs
```

---

## 5. Como Adicionar Novos Espécimes de Árvore

1. Abra o arquivo `data/mock-trees.json` (ou substitua pelo catálogo oficial de campo).
2. Certifique-se de que o objeto atenda ao schema em `lib/tree-schema.ts`:
   - `id`: string única;
   - `displayNumber`: `null` para novas árvores até a instalação de placas;
   - `popularName`: string;
   - `scientificNameSuggested`: string;
   - `family`: string;
   - `confidence`: `'baixa' | 'media' | 'alta' | 'indeterminada'`;
   - `group`: `'groupA' | 'groupB' | 'groupC'`;
   - `latitude` e `longitude`: números válidos ou `null`;
   - `verificationStatus`: `'pendente' | 'em_analise' | 'identificacao_preliminar' | 'verificado' | 'rejeitado'`.
3. Execute `npm test` para validar a conformidade dos dados automaticamente.
