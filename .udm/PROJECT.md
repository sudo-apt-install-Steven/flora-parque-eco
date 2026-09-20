# UDM — PROJECT SPECIFICATION: PARQUE ECOLÓGICO VILHENA

## Nome do Projeto
**Parque Ecológico — Inventário Arbóreo Digital**
- **Local:** Parque Ecológico Municipal Marechal Cândido Rondon
- **Município:** Vilhena — Rondônia — Brasil
- **Parceria Acadêmica:** IFRO Campus Vilhena (Rodovia BR-174, Km 3, nº 4334)
- **Coordenadas de Referência:** `-12.7044, -60.1189`

## Missão & Visão
Criar a aplicação web pública voltada aos visitantes do parque e pesquisadores, prioritariamente acessada via **QR Code** afixado nas árvores ou placas informativas.

## Princípios de Produto
1. **O Mapa é a Experiência Central:** O aplicativo abre diretamente na visão cartográfica, centrado no Parque e no campus do IFRO, sem telas intermediárias desnecessárias.
2. **Design Modular para Receber v0:** O design de alta fidelidade da interface do usuário está sendo concebido separadamente no v0. Toda a base técnica (componentes, estado, mapa, dados) deve ser desacoplada para adotar a UI do v0 sem refatoração de arquitetura.
3. **Três Modos de Mapa:**
   - **SATÉLITE:** Tiles ao vivo de satélite com suporte para imagem raster aérea própria (ortomosaico/drone).
   - **PLANTA:** Camada vetorial (GeoJSON/SVG) do lago, trilhas, ponte, playground e setores.
   - **EXPLORATION:** Estilo cartográfico temático de expedição botânica (relevo, vegetação, curvas de nível, paleta terrosa de exploração).
4. **Grupos de Campo:** Três equipes de coleta:
   - Grupo A (lado esquerdo do lago)
   - Grupo B (lado esquerdo do lago)
   - Grupo C (lado direito do lago)
5. **Identificação Assistida (PlantNet):** Suporte à ingestão de dados do PlantNet (taxon, score, link), indicando ao visitante que se trata de identificação botânica assistida e não verdade absoluta.
