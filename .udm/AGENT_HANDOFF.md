# UDM — AGENT HANDOFF: PARQUE ECOLÓGICO VILHENA

> **Aviso ao Próximo Agente:** Este documento é a memória de transição oficial do projeto. Você NÃO precisa pedir ao usuário para reexplicar o histórico. Leia este documento com atenção antes de realizar qualquer alteração.

---

## 1. Estado Atual
- A fundação técnica do **Inventário Arbóreo Digital do Parque Ecológico Municipal Marechal Cândido Rondon / IFRO Vilhena** está **concluída, validada e compilando com zero erros**.
- O motor de mapas (MapLibre GL JS) está operacional com os três modos solicitados (Satélite, Planta e Exploração) e suporte a clustering e GPS.
- A camada de dados acadêmicos está estruturada em Zod com dados de teste (`mock-trees.json`) claramente sinalizados.
- A interface é responsiva (mobile-first), funcionando como Bottom Sheet deslizante no celular e Sidebar no desktop.
- A suíte de testes do Vitest e o build de produção do Next.js (`npm run build`) estão com status **100% PASS**.

---

## 2. Arquivos Criados

### Governança e Memória UDM
- `.udm/GLOBAL.md` (Convenções globais e de segurança)
- `.udm/PROJECT.md` (Especificação de produto e parcerias acadêmicas)
- `.udm/CURRENT_STATE.md` (Estado técnico em tempo real)
- `.udm/DECISIONS.md` (ADRs 001 a 005)
- `.udm/TASKS.md` (Status de marcos e tarefas concluídas e pendentes)
- `.udm/CHANGELOG.md` (Histórico de alterações da versão)
- `.udm/AGENT_HANDOFF.md` (Este documento de continuidade multi-agente)
- *Espelho completo no HD:* `D:\Universal-Agent-Memory\projects\flora-parque-eco\`
- *Registros no SQLite central:* `D:\Universal-Agent-Memory\data\udm_v3.db`

### Configuração e Infraestrutura
- `package.json`
- `tsconfig.json`
- `postcss.config.mjs`
- `next.config.mjs`
- `vercel.json`
- `.gitignore`
- `vitest.config.ts`

### Camada de Dados (DATA) & GIS
- `lib/tree-schema.ts` (Schemas Zod de Tree, PhotoItem, PlantNetData, FieldGroup)
- `lib/trees.ts` (Funções de busca, filtros de grupo A/B/C e conversão GeoJSON)
- `lib/park-config.ts` (Coordenadas de Vilhena/IFRO: `-12.7044, -60.1189`, zoom e limites)
- `data/mock-trees.json` (5 espécimes de teste claramente etiquetados com fotos e scores)
- `geo/park-boundary.geojson` (Polígono de delimitação do parque e IFRO)
- `geo/park-planta.geojson` (Camada vetorial: lago, caminhos, ponte, playground atualizado)
- `geo/park-exploration.geojson` (Curvas de nível 600m/605m, mata ciliar e POIs)

### Camada de Mapa (MAP)
- `lib/map-styles.ts` (Estilos declarativos para Satélite, Planta e Exploração)
- `components/map/MapContainer.tsx` (Canvas WebGL, clustering, pins por grupo, GPS e navegação)
- `components/map/DynamicMap.tsx` (Carregador dinâmico client-side com `ssr: false`)

### Camada de Interface (UI)
- `components/ui/LayerSwitcher.tsx` (Alternador flutuante dos 3 modos)
- `components/ui/SearchFilterBar.tsx` (Busca com debounce e chips de grupo A/B/C)
- `components/ui/LegendModal.tsx` (Modal de legenda, metodologia e aviso de placas)
- `components/ui/StatisticsModal.tsx` (Métricas de consolidação do inventário)
- `components/tree/TreePanel.tsx` (Container adaptativo: Bottom Sheet no mobile / Sidebar no desktop)
- `components/tree/TreeDetail.tsx` (Ficha técnica com dados botânicos, PlantNet score e localização)
- `components/tree/TreeGallery.tsx` (Galeria de fotos com filtro por categoria e zoom)

### Aplicação Principal & Estilos
- `app/globals.css` (Tailwind CSS v4, reset de tela cheia para WebGL e animações de pin)
- `app/layout.tsx` (Metadados PWA, viewport móvel e tags OpenGraph)
- `app/page.tsx` (Orquestrador de estado global, mapa e suporte a QR Code via query string)

### Testes & Documentação
- `test/trees.test.ts` (Suíte Vitest cobrindo 6 testes de regras de negócio)
- `README.md`
- `ARCHITECTURE.md`
- `DATA_MODEL.md`
- `MAP.md`
- `DEVELOPMENT.md`

---

## 3. Arquivos Modificados
- O diretório original estava vazio. Todos os arquivos foram criados do zero de forma orquestrada.
- `package.json` foi refinado atualizando `next` para `^15.5.25` para mitigar avisos de vulnerabilidades reportados pelo npm.

---

## 4. Dependências Instaladas e Justificativas

| Dependência | Versão | Justificativa Técnica |
| :--- | :--- | :--- |
| `next` | `^15.5.25` | Framework App Router, otimização de imagem, rotas estáticas na Vercel |
| `react` & `react-dom` | `^19.0.0` | Biblioteca de UI de última geração |
| `maplibre-gl` | `^5.20.1` | Motor cartográfico WebGL 60fps 100% open-source (sem tokens Mapbox) |
| `zod` | `^3.24.2` | Validação estrita de contratos de dados em compilação e execução |
| `lucide-react` | `^1.16.0` | Ícones consistentes e compatíveis com a suíte v0 |
| `clsx` & `tailwind-merge` | `^2.1.1` / `^3.3.1` | Mesclagem segura de classes Tailwind para componentes do v0 |
| `class-variance-authority` | `^0.7.1` | Suporte a variantes em componentes UI (estilo shadcn) |
| `tailwindcss` | `^4.0.9` | Framework de estilização utilitária de alto desempenho |
| `vitest` | `^3.0.7` | Execução rápida de testes automatizados sem overhead |

---

## 5. Arquitetura Escolhida
- **Desacoplamento em Quatro Camadas:** `DATA` ↔ `MAP` ↔ `UI` ↔ `LOGIC`.
- **Zero-DB Runtime ($0 Budget):** A aplicação funciona como um site estático/JAMstack na Vercel consumindo JSON e GeoJSON versionados no repositório.
- **Cartocêntrico:** Ao abrir, o mapa preenche 100% da tela. Painéis de dados são sobrepostos de forma contextual (Bottom Sheet deslizante no celular, Sidebar no desktop).
- **Três Modos de Mapa:**
  1. *Satélite:* Tiles aéreos reais com slot preparado para ortomosaico de drone (`PARK_CONFIG.customRasterOverlay`).
  2. *Planta:* Camada vetorial geométrica (lago, caminhos, ponte, playground).
  3. *Exploração:* Cartografia estilizada com curvas de nível e zonas de mata ciliar.

---

## 6. Decisões Importantes (ADRs)
- **ADR-001:** Next.js 15+ com React 19 e Tailwind CSS v4 para compatibilidade nativa com v0.
- **ADR-002:** MapLibre GL JS selecionado para garantir autonomia de licença e eliminar custos de API.
- **ADR-003:** Armazenamento versionado em Git em vez de banco de dados SQL para a fase 1.
- **ADR-004:** O campo `displayNumber` é obrigatoriamente `null` inicialmente (as árvores ainda não possuem plaquetas físicas fixadas).
- **ADR-005:** Proibição de inventar espécies ou dados científicos (projeto acadêmico).

---

## 7. Problemas Encontrados e Soluções Aplicadas
1. **Execução de scripts no PowerShell (Windows):** O PowerShell bloqueia scripts npm por padrão (`ExecutionPolicy`). Foi contornado executando os comandos via `cmd /c "npm ..."`.
2. **Vulnerabilidade reportada no Next 15.1.7:** O npm audit acusou avisos no Next 15.1.7. Foi atualizado imediatamente para `15.5.25`, resolvendo os apontamentos de segurança.
3. **Resolução de alias `@/` no Vitest:** O Vitest rodando em Node puro não resolvia `@/` automaticamente. Foi criado o arquivo `vitest.config.ts` com mapeamento explícito de alias.

---

## 8. Testes Executados
- **Suíte Vitest (`npm test`):** 6 testes executados e aprovados com 100% de sucesso em `test/trees.test.ts`.
- **Verificação de Tipos TypeScript (`npx tsc --noEmit`):** 0 erros.
- **Build de Produção (`npm run build`):** Compilação estática bem-sucedida gerando rotas otimizadas sem warnings.

---

## 9. O Que Ainda Falta
1. **Design Definitivo do v0:** O usuário/designer está concebendo a interface no v0. Quando os componentes forem exportados, deverão ser acoplados às props existentes.
2. **Catálogo Real de Campo:** Importar as árvores reais coletadas pelos Grupos A, B e C, substituindo o `data/mock-trees.json`.
3. **Fotografia Aérea Recente de Drone:** Adicionar o arquivo raster georreferenciado e ativar o `customRasterOverlay` em `lib/park-config.ts`.
4. **Geometrias Finas do Lago e Trilhas:** Refinar as coordenadas do GeoJSON após conferência por GPS geodésico presencial.

---

## 10. Como o Próximo Agente Deve Continuar
1. **LER O UDM:** Inspecione `.udm/CURRENT_STATE.md`, `.udm/DECISIONS.md` e `lib/tree-schema.ts`.
2. **NÃO CRIAR BANCO DE DADOS NEM LOGIN:** Mantenha a arquitetura estática/versionada a menos que o usuário solicite explicitamente um painel administrativo com autenticação.
3. **INTEGRAR O DESIGN DO V0:** Quando o usuário fornecer o design do v0, siga a Seção 11 deste handoff.
4. **AO FINALIZAR TRABALHO:** Atualize os arquivos em `.udm/` e execute o espelhamento para `D:\Universal-Agent-Memory\projects\flora-parque-eco`.

---

## 11. Como Integrar o Design do v0
1. No v0, utilize os componentes existentes em `components/ui/` e `components/tree/` como especificação de props.
2. Ao receber o código gerado pelo v0:
   - Substitua o visual de `TreeDetail.tsx`, `TreePanel.tsx` ou `SearchFilterBar.tsx`.
   - **Mantenha as mesmas interfaces de Props** (`Tree`, `FieldGroup`, `onSelectTree`, etc.).
   - Não altere a lógica de conversão GeoJSON em `lib/trees.ts` nem o ciclo de vida do mapa em `components/map/MapContainer.tsx`.
3. Teste o layout no celular e no desktop para garantir que a responsividade permaneça intacta.

---

## 12. Quais Partes NÃO Devem Ser Reescritas
- **NÃO reescrever o MapContainer / MapLibre:** A integração WebGL com controle de estilo declarativo e clustering nativo é sensível e está totalmente calibrada.
- **NÃO inventar espécies nem alterar `displayNumber: null`:** O campo só deve receber números quando placas físicas forem cadastradas.
- **NÃO remover a camada Zod:** Qualquer dado novo de árvore DEVE passar por `TreeSchema.parse()`.
- **NÃO recriar outro sistema de documentação ou memória:** O UDM existente no HD e em `.udm/` é a única fonte da verdade compartilhada.
