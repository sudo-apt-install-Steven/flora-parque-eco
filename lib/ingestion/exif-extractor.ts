import { ExifGpsRawData } from '@/lib/tree-schema';

/**
 * Representação de coordenada em Graus, Minutos e Segundos (DMS)
 */
export type DmsCoordinate = [degrees: number, minutes: number, seconds: number];

/**
 * Converte Graus, Minutos e Segundos (DMS) com referência cardinal para Graus Decimais (DD)
 * Ex: [12, 42, 15.8], 'S' -> -12.704388...
 */
export function dmsToDecimal(
  dms: DmsCoordinate | number[],
  ref?: 'N' | 'S' | 'E' | 'W'
): number | null {
  if (!Array.isArray(dms) || dms.length < 3) {
    return null;
  }

  const [degrees, minutes, seconds] = dms;
  if (
    typeof degrees !== 'number' ||
    typeof minutes !== 'number' ||
    typeof seconds !== 'number' ||
    Number.isNaN(degrees) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds)
  ) {
    return null;
  }

  let decimal = Math.abs(degrees) + minutes / 60 + seconds / 3600;

  if (ref === 'S' || ref === 'W') {
    decimal = -Math.abs(decimal);
  } else if (ref === 'N' || ref === 'E') {
    decimal = Math.abs(decimal);
  }

  // Validação de intervalo geográfico
  if (decimal < -180 || decimal > 180) {
    return null;
  }

  return Number(decimal.toFixed(6));
}

/**
 * Normaliza e extrai dados GPS a partir de metadados brutos de fotografia EXIF
 */
export function extractExifGpsData(rawExif: Record<string, unknown>): {
  success: boolean;
  data: ExifGpsRawData | null;
  errors: string[];
} {
  const errors: string[] = [];

  if (!rawExif || typeof rawExif !== 'object') {
    return { success: false, data: null, errors: ['Metadados EXIF nulos ou malformados'] };
  }

  try {
    let lat: number | null = null;
    let lng: number | null = null;

    // 1. Extrai Latitude
    const rawLat = rawExif.GPSLatitude ?? rawExif.latitude ?? rawExif.lat;
    const latRef = (rawExif.GPSLatitudeRef ?? rawExif.latitudeRef ?? 'S') as 'N' | 'S';

    if (typeof rawLat === 'number') {
      lat = latRef === 'S' ? -Math.abs(rawLat) : Math.abs(rawLat);
    } else if (Array.isArray(rawLat)) {
      lat = dmsToDecimal(rawLat as number[], latRef);
    }

    // 2. Extrai Longitude
    const rawLng = rawExif.GPSLongitude ?? rawExif.longitude ?? rawExif.lng;
    const lngRef = (rawExif.GPSLongitudeRef ?? rawExif.longitudeRef ?? 'W') as 'E' | 'W';

    if (typeof rawLng === 'number') {
      lng = lngRef === 'W' ? -Math.abs(rawLng) : Math.abs(rawLng);
    } else if (Array.isArray(rawLng)) {
      lng = dmsToDecimal(rawLng as number[], lngRef);
    }

    if (lat === null || lng === null) {
      errors.push('Não foi possível calcular latitude e longitude válidas a partir do EXIF');
      return { success: false, data: null, errors };
    }

    // 3. Extrai Altitude e Precisão
    const rawAlt = rawExif.GPSAltitude ?? rawExif.altitude;
    const altitude = typeof rawAlt === 'number' && !Number.isNaN(rawAlt) ? rawAlt : undefined;

    const rawAccuracy = rawExif.GPSHPositioningError ?? rawExif.accuracy;
    const accuracy =
      typeof rawAccuracy === 'number' && !Number.isNaN(rawAccuracy) ? rawAccuracy : undefined;

    // 4. Data/Hora de Captura
    const rawDate =
      rawExif.DateTimeOriginal ??
      rawExif.DateTime ??
      rawExif.GPSDateStamp ??
      rawExif.capturedAt;
    let dateTimeOriginal: string | undefined;

    if (typeof rawDate === 'string' && rawDate.trim().length > 0) {
      // Converte formato padrão EXIF "YYYY:MM:DD HH:MM:SS" para ISO
      const match = rawDate.match(/^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
      if (match) {
        const [, y, m, d, hh, mm, ss] = match;
        dateTimeOriginal = new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`).toISOString();
      } else {
        const parsedDate = new Date(rawDate);
        if (!Number.isNaN(parsedDate.getTime())) {
          dateTimeOriginal = parsedDate.toISOString();
        }
      }
    }

    const cameraMake = typeof rawExif.Make === 'string' ? rawExif.Make.trim() : undefined;
    const cameraModel = typeof rawExif.Model === 'string' ? rawExif.Model.trim() : undefined;

    return {
      success: true,
      data: {
        latitude: lat,
        longitude: lng,
        latitudeRef: latRef,
        longitudeRef: lngRef,
        altitude,
        accuracy,
        dateTimeOriginal,
        cameraMake,
        cameraModel
      },
      errors
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Erro fatal ao interpretar tags EXIF: ${msg}`);
    return { success: false, data: null, errors };
  }
}
