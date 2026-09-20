# Parque Ecológico — Inventário Arbóreo Digital

**Parque Ecológico Municipal Marechal Cândido Rondon**  
Vilhena — Rondônia — Brasil  
Em parceria com o **IFRO Campus Vilhena**  

---

## 🌲 Visão Geral do Projeto

Aplicação web moderna, responsiva (mobile-first) e cartocêntrica voltada para a identificação e preservação do patrimônio arbóreo do Parque Ecológico Marechal Cândido Rondon em Vilhena/RO.

O acesso principal do visitante ocorre no próprio parque via **QR Code** afixado em árvores e placas informativas. Ao abrir a aplicação, a experiência é **100% focada no mapa**, permitindo navegação fluida, identificação taxonômica assistida por IA (PlantNet) e exploração das trilhas e setores do parque.

---

## 🚀 Arquitetura & Stack Tecnológica

| Camada | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) + React 19 | Padrão moderno, SSR/SSG otimizado, imagens automáticas e alta velocidade em celulares. |
| **Linguagem** | TypeScript | Tipagem estrita de espécimes, camadas e geometrias GIS. |
| **Estilização** | Tailwind CSS v4 | Utilitários leves e compatibilidade direta com componentes gerados no v0. |
| **Motor de Mapa** | MapLibre GL JS | 100% open-source, aceleração WebGL a 60 FPS, sem custos de API / billing lock-in e clustering nativo. |
| **Dados** | Git Versioned (JSON / GeoJSON) | Zero-DB runtime ($0 budget), validação rigorosa com Zod e governança acadêmica. |
| **Deploy** | Vercel | Hospedagem estática/edge global com zero custo operacional. |

---

## 🗺️ Os Três Modos de Mapa

1. **Satélite:** Fotografia aérea real com suporte integrado para acoplamento de ortomosaico de alta definição capturado por drone (`customRasterOverlay`).
2. **Planta:** Camada vetorial geométrica de alta precisão contendo o lago, pontes, trilhas, setores institucionais (IFRO) e a infraestrutura recente do **playground infantil**.
3. **Exploração:** Cartografia estilizada de expedição botânica inspirada em mapas de campo (relevo altimétrico, curvas de nível, zonas de vegetação ciliar e waypoints/POIs notáveis).

---

## 📋 Regras Acadêmicas & Integridade Científica

- **`displayNumber` Inicialmente Nulo:** As plaquetas físicas com numeração definitiva estão em processo de implantação. O sistema utiliza identificadores estáveis únicos (`id`).
- **Não Invenção de Dados:** Nenhuma espécie ou coordenada real é inventada. Todos os dados de desenvolvimento e prototipagem estão explicitamente etiquetados como `[MOCK]`.
- **PlantNet Assistido:** Sugestões probabilísticas do algoritmo de visão computacional são exibidas com percentual de confiança, deixando claro ao visitante que a validação definitiva é acadêmica/docente.
- **Grupos de Campo:** Organização do levantamento em três equipes:
  - `Grupo A`: Margem esquerda do lago (Setor Norte)
  - `Grupo B`: Margem esquerda do lago (Setor Sul)
  - `Grupo C`: Margem direita do lago (Trilha Principal)

---

## 💻 Como Executar Localmente

Consulte o arquivo [`DEVELOPMENT.md`](./DEVELOPMENT.md) para o guia detalhado de setup e execução.

```bash
# 1. Instalar dependências
npm install

# 2. Executar suíte de testes
npm test

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
