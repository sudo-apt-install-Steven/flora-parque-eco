# Modelo de Dados — Inventário Arbóreo Digital

## 1. Visão Geral

Este documento descreve as estruturas de dados, schemas e contratos que regem o catálogo de espécimes arbóreos do **Parque Ecológico Municipal Marechal Cândido Rondon** (Vilhena/RO) e **IFRO Campus Vilhena**.

Todos os dados são validados em tempo de execução e compilação através de schemas **Zod** (`lib/tree-schema.ts`).

---

## 2. O Modelo `Tree` (Espécime Arbóreo)

```typescript
interface Tree {
  // Identificador interno imutável e estável (ex: "mock-tree-001" ou UUID)
  id: string;

  // Número da placa física fixada no tronco — OBRIGATORIAMENTE NULL na fundação
  displayNumber: number | null;

  // Nomenclatura e Taxonomia
  popularName: string;
  scientificNameSuggested: string;
  family: string;

  // Grau de confiança da identificação preliminar
  confidence: 'baixa' | 'media' | 'alta' | 'indeterminada';

  // Geolocalização
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null; // Precisão do sensor em metros (GPS/EXIF)

  // Fotografia
  primaryPhoto: PhotoItem | null;
  gallery: PhotoItem[];

  // Identificação Assistida por Visão Computacional
  plantnet: PlantNetData | null;

  // Setorização de Campo Acadêmico
  group: 'groupA' | 'groupB' | 'groupC';

  // Metadados de Verificação e Auditoria
  collectedAt: string; // ISO 8601 UTC
  verificationStatus: 'pendente' | 'em_analise' | 'identificacao_preliminar' | 'verificado' | 'rejeitado';
  notes?: string;

  // Sinalizador explícito de dados sintéticos
  isMock: boolean;
}
```

---

## 3. Regras Críticas de Negócio

### 3.1. `displayNumber` é Inicialmente `null`
- **Motivo Acadêmico:** As árvores do parque ainda não possuem placas físicas numeradas instaladas.
- **Comportamento:** O campo aceita estritamente `null` até que a comissão de campo do IFRO realize a fixação das plaquetas de identificação.
- O sistema opera indexando as árvores por seu `id` interno estável.

### 3.2. Proibição de Invenção de Dados Científicos
- Nenhuma espécie botânica, família ou coordenada deve ser inventada de forma artificial fingindo ser dado real de campo.
- Dados de protótipo são expressamente assinalados com `isMock: true` e prefixados com `[MOCK]`.

### 3.3. Os Três Grupos de Levantamento de Campo
O levantamento presencial foi distribuído entre três equipes acadêmicas:
- **`groupA` (Grupo A):** Atua na margem esquerda do lago (Setor Norte).
- **`groupB` (Grupo B):** Atua na margem esquerda do lago (Setor Sul).
- **`groupC` (Grupo C):** Atua na margem direita do lago (Trilha Principal).

### 3.4. Identificação Assistida (PlantNet)
A estrutura `PlantNetData` armazena o resultado da inferência da API do PlantNet:
```typescript
interface PlantNetData {
  taxon?: string;          // Nome científico identificado
  score?: number;          // Índice de confiança de 0 a 1 (ex: 0.86 = 86%)
  url?: string;            // Link de referência no PlantNet
  familySuggested?: string;// Família taxonômica sugerida
}
```
*Aviso:* O PlantNet é tratado na interface como uma **ferramenta assistiva** de triagem e não como verdade botânica absoluta.

---

## 4. Estrutura Fotográfica (`PhotoItem`)

Otimizada para carregar rapidamente em celulares sem consumir dados desnecessários:
```typescript
interface PhotoItem {
  id: string;
  url: string;        // Imagem em alta resolução para visualização e zoom
  thumbUrl?: string;  // Miniatura comprimida para listagens e mapa
  category: 'arvore_inteira' | 'folha' | 'flor' | 'fruto' | 'casca' | 'outro';
  caption?: string;
  credit?: string;
  capturedAt?: string;
}
```

---

## 5. Conversão e Georreferenciamento GeoJSON

A função `treesToGeoJSON()` achata os atributos de cada espécime em propriedades compatíveis com os shaders WebGL do MapLibre GL:
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-60.1198, -12.7038]
  },
  "properties": {
    "id": "mock-tree-001",
    "displayNumber": null,
    "popularName": "[MOCK] Espécime Teste Alpha (Ipê Simulado)",
    "scientificNameSuggested": "Handroanthus sp. [MOCK]",
    "family": "Bignoniaceae [MOCK]",
    "confidence": "media",
    "group": "groupA",
    "verificationStatus": "identificacao_preliminar"
  }
}
```
As propriedades são utilizadas nativamente pelo motor cartográfico para coloração por grupo e agrupamento em clusters dinâmicos.
