export interface RawCsvRecord {
  [key: string]: string;
}

/**
 * Normaliza cabeçalhos do CSV para chaves canônicas conhecidas
 */
const HEADER_ALIAS_MAP: Record<string, string> = {
  // ID e Placa
  id: 'id',
  codigo: 'id',
  código: 'id',
  slug: 'id',
  placa: 'displayNumber',
  numero: 'displayNumber',
  número: 'displayNumber',
  display_number: 'displayNumber',
  displaynumber: 'displayNumber',

  // Nomes
  nome_popular: 'popularName',
  'nome popular': 'popularName',
  popularname: 'popularName',
  popular: 'popularName',
  nome_comum: 'popularName',
  arvore: 'popularName',
  árvore: 'popularName',

  nome_cientifico: 'scientificNameSuggested',
  'nome científico': 'scientificNameSuggested',
  scientificnamesuggested: 'scientificNameSuggested',
  scientific_name: 'scientificNameSuggested',
  especie: 'scientificNameSuggested',
  espécie: 'scientificNameSuggested',
  taxon: 'scientificNameSuggested',

  familia: 'family',
  família: 'family',
  family: 'family',

  // Coordenadas
  latitude: 'latitude',
  lat: 'latitude',
  lat_dd: 'latitude',
  longitude: 'longitude',
  long: 'longitude',
  lng: 'longitude',
  lng_dd: 'longitude',
  precisao: 'locationAccuracy',
  precisão: 'locationAccuracy',
  accuracy: 'locationAccuracy',

  // Grupo de coleta
  grupo: 'group',
  equipe: 'group',
  field_group: 'group',
  group: 'group',

  // Fotos
  foto: 'photoUrl',
  foto_url: 'photoUrl',
  primaryphoto: 'photoUrl',
  photo_url: 'photoUrl',
  imagem: 'photoUrl',

  // PlantNet
  plantnet_taxon: 'plantnetTaxon',
  plantnet_score: 'plantnetScore',
  plantnet_url: 'plantnetUrl',

  // Metadados
  confianca: 'confidence',
  confiança: 'confidence',
  confidence: 'confidence',
  status: 'verificationStatus',
  situacao: 'verificationStatus',
  situação: 'verificationStatus',
  notas: 'notes',
  observacoes: 'notes',
  observações: 'notes',
  notes: 'notes',
  data_coleta: 'collectedAt',
  data: 'collectedAt',
  collectedat: 'collectedAt'
};

/**
 * Normaliza string de cabeçalho para comparação
 */
function cleanHeaderKey(rawHeader: string): string {
  const cleaned = rawHeader.toLowerCase().trim().replace(/['"]/g, '');
  return HEADER_ALIAS_MAP[cleaned] || cleaned;
}

/**
 * Parser de CSV robusto em conformidade com RFC 4180
 * Suporta separadores por vírgula ou ponto-e-vírgula, campos com aspas e quebras de linha
 */
export function parseCsvString(csvText: string): {
  headers: string[];
  rows: RawCsvRecord[];
  errors: string[];
} {
  const errors: string[] = [];
  const rows: RawCsvRecord[] = [];

  if (!csvText || typeof csvText !== 'string' || csvText.trim().length === 0) {
    return { headers: [], rows: [], errors: ['Conteúdo CSV vazio ou inválido'] };
  }

  try {
    // 1. Detecta o delimitador primário (vírgula ou ponto-e-vírgula)
    const firstLine = csvText.split('\n')[0] || '';
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ';' : ',';

    // 2. Tokenização com suporte a aspas duplas
    const tokens: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    const chars = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const nextChar = chars[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Aspa dupla escapada ("") dentro de aspas
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' && !inQuotes) {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          tokens.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }

    // Último campo pendente
    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        tokens.push(currentRow);
      }
    }

    if (tokens.length === 0) {
      return { headers: [], rows: [], errors: ['Nenhuma linha de dados detectada no CSV'] };
    }

    // 3. Mapeamento de cabeçalhos
    const rawHeaders = tokens[0];
    const canonicalHeaders = rawHeaders.map(cleanHeaderKey);

    // 4. Construção das linhas
    for (let rowIndex = 1; rowIndex < tokens.length; rowIndex++) {
      const tokenRow = tokens[rowIndex];
      const record: RawCsvRecord = {};

      for (let colIndex = 0; colIndex < canonicalHeaders.length; colIndex++) {
        const colKey = canonicalHeaders[colIndex];
        const val = tokenRow[colIndex] ?? '';
        record[colKey] = val;
      }

      rows.push(record);
    }

    return {
      headers: canonicalHeaders,
      rows,
      errors
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Falha fatal ao processar CSV: ${message}`);
    return { headers: [], rows: [], errors };
  }
}
