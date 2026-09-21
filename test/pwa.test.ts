import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('FASE 5: PWA & ESTRATÉGIA OFFLINE', () => {
  it('o arquivo public/sw.js deve existir e conter as estratégias de cache requeridas', () => {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf-8');
    // Estratégia 1: Cache-First para arquivos vitais da UI e SVGs cartográficos
    expect(swContent).toContain('isVitalUiOrSvg');
    expect(swContent).toContain('caches.match(request)');
    expect(swContent).toContain('STATIC_CACHE');
    expect(swContent).toContain('GEO_CACHE');

    // Estratégia 2: Stale-While-Revalidate para o catálogo botânico JSON/CSV
    expect(swContent).toContain('isBotanicalCatalogData');
    expect(swContent).toContain('DATA_CACHE');
    expect(swContent).toContain('fetchPromise');

    // Estratégia 3: App shell e pre-cache
    expect(swContent).toContain('/geo/park-boundary.geojson');
    expect(swContent).toContain('/geo/park-planta.geojson');
    expect(swContent).toContain('/manifest.json');
  });

  it('o arquivo public/manifest.json deve conter os metadados do PWA para Vilhena', () => {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifestContent.name).toContain('Parque Ecológico');
    expect(manifestContent.display).toBe('standalone');
    expect(manifestContent.theme_color).toBe('#10b981');
    expect(manifestContent.background_color).toBe('#0b211d');
    expect(manifestContent.start_url).toBe('/');
  });

  it('o módulo lib/pwa/use-offline-status deve exportar o hook e tipagens estritas', async () => {
    const pwaModule = await import('@/lib/pwa/use-offline-status');
    expect(pwaModule.useOfflineStatus).toBeDefined();
    expect(typeof pwaModule.useOfflineStatus).toBe('function');
  });

  it('o layout principal app/layout.tsx deve vincular o manifest.json do PWA', () => {
    const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).toContain("manifest: '/manifest.json'");
  });

  it('o service worker deve fornecer fallback seguro de GeoJSON e todos os ícones devem existir', () => {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    // Deve retornar FeatureCollection para /geo/ e não SVG
    expect(swContent).toContain("url.pathname.startsWith('/geo/')");
    expect(swContent).toContain('FeatureCollection');

    // Verifica que os ícones do manifest existem em public/
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
    const iconDarkPath = path.join(process.cwd(), 'public', 'icon-dark-32x32.png');
    const iconSvgPath = path.join(process.cwd(), 'public', 'icon.svg');
    expect(fs.existsSync(faviconPath)).toBe(true);
    expect(fs.existsSync(iconDarkPath)).toBe(true);
    expect(fs.existsSync(iconSvgPath)).toBe(true);
  });
});
