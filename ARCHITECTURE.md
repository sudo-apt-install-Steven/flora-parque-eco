# Arquitetura do Sistema — Inventário Arbóreo Digital

## 1. Visão Arquitetural

A arquitetura do projeto foi estruturada em torno do princípio de **desacoplamento estrito entre quatro camadas independentes**:

```
┌─────────────────────────────────────────────────────────────┐
│                           UI                                │
│   (Design System, Bottom Sheet, Sidebar, Modais, Badges)    │
│            *Pronta para receber o design do v0*             │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                          LOGIC                              │
│ (Filtros de Grupo A/B/C, Busca, Seleção, Deep Link QR Code) │
└─────────────┬───────────────────────────────┬───────────────┘
              │                               │
┌─────────────▼───────────────┐ ┌─────────────▼───────────────┐
│             MAP             │ │            DATA             │
│   (MapLibre GL, WebGL 60fps,│ │  (Zod Schemas, mock-trees, │
│  Clustering, Satélite,      │ │ GeoJSONs validados,         │
│  Planta e Exploração)       │ │  Versionamento em Git)      │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. As Quatro Camadas do Sistema

### 2.1. Camada de Dados (DATA) — `/data`, `/geo`, `/lib/tree-schema.ts`
- **Imutabilidade e Versionamento:** Os dados residem em arquivos estáticos controlados pelo Git.
- **Validação com Zod:** O schema `TreeSchema` garante em tempo de compilação e execução que nenhum espécime malformado seja renderizado.
- **Formato Otimizado:** Conversão sob demanda para GeoJSON Point Features com propriedades achatadas para consumo de alta velocidade pela GPU.

### 2.2. Camada do Mapa (MAP) — `/components/map/`, `/lib/map-styles.ts`, `/lib/park-config.ts`
- **Motor WebGL:** MapLibre GL JS instanciado com lazy loading via `next/dynamic` (`ssr: false`).
- **Clustering Dinâmico:** Agrupamento nativo por proximidade espacial, permitindo navegar centenas ou milhares de árvores com impacto zero de CPU/DOM.
- **Mapeamento de Camadas:** Três estilos declarativos chaveados pelo `LayerSwitcher` sem destruir a instância do mapa:
  - *Satélite* (Raster tiles mundiais + overlay raster para imagens de drone);
  - *Planta* (Geometria vetorial do lago, pontes, caminhos e playground);
  - *Exploração* (Cartografia com curvas de nível altimétricas e zonas de mata ciliar).

### 2.3. Camada Lógica (LOGIC) — `/lib/trees.ts`, `/app/page.tsx`
- **Gestão de Estado:** Estado de seleção de árvore, modo de camada, busca e filtros por grupo de campo acadêmico (`groupA`, `groupB`, `groupC`).
- **Deep-linking QR Code:** Leitura automática de parâmetros de URL (`?tree=mock-tree-001` ou `?id=...`) para abrir a árvore selecionada diretamente a partir do escaneamento de placas físicas.

### 2.4. Camada de Interface (UI) — `/components/ui/`, `/components/tree/`
- **Mobile-First Responsivo:**
  - Em telas pequenas (`< 768px`): O mapa ocupa 100% do viewport e os detalhes do espécime emergem através de um *Bottom Sheet* deslizante.
  - Em telas grandes (`>= 768px`): A ficha é apresentada em uma *Sidebar Lateral* flutuante à direita.
- **Acessibilidade:** Compatível com leitores de tela (`aria-modal`, `role="region"`, `role="radiogroup"`), navegação completa por teclado (tecla Esc para fechar, tabulação em botões de ação) e contraste visual conforme WCAG.

---

## 3. Diretrizes de Integração com o Design do v0

O design visual definitivo está sendo elaborado no **v0**. Quando os componentes do v0 forem exportados, a equipe deve seguir estas regras:

1. **NÃO reconstruir a aplicação:** Não delete a estrutura de pastas, o motor MapLibre nem a validação Zod.
2. **Substituir componentes de UI:** Os componentes em `components/ui/` e `components/tree/` foram propositalmente isolados com assinaturas de props limpas (`Tree`, `PhotoItem`). Basta aplicar o layout do v0 preservando as props de entrada.
3. **Compatibilidade Shadcn/Tailwind:** O projeto já inclui `clsx`, `tailwind-merge` e `class-variance-authority`, garantindo que classes copiadas do v0 funcionem sem atrito.

---

## 4. Postura de Segurança e Desempenho

- **Zero Secrets no Client:** Nenhuma credencial ou token privado no código cliente.
- **Headers HTTP Rígidos:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Prevenção XSS:** Dados são sanitizados e renderizados estritamente como texto/atributos seguros do React, sem uso de `dangerouslySetInnerHTML`.
- **Otimização de Imagens:** Utilização do `next/image` com remote patterns para domínios autorizados (PlantNet e CDN de fotos).
