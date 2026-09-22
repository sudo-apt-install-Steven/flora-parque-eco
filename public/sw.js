// Service Worker do Inventário Arbóreo Digital — Parque Ecológico de Vilhena (IFRO)
// Estratégia de Cache para Coleta de Campo Offline

const CACHE_NAME_PREFIX = 'flora-parque-eco';
const CACHE_VERSION = 'v11';
const STATIC_CACHE = `${CACHE_NAME_PREFIX}-static-${CACHE_VERSION}`;
const DATA_CACHE = `${CACHE_NAME_PREFIX}-data-${CACHE_VERSION}`;
const GEO_CACHE = `${CACHE_NAME_PREFIX}-geo-${CACHE_VERSION}`;

// Arquivos fundamentais do Shell da Aplicação pré-cacheados na instalação
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/geo/park-boundary.geojson',
  '/geo/park-planta.geojson',
  '/geo/park-exploration.geojson'
];

// Instalação do Service Worker com pré-cache resiliente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const geoCache = await caches.open(GEO_CACHE);
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (assetUrl) => {
          try {
            const res = await fetch(assetUrl);
            if (res && res.ok) {
              const targetCache = assetUrl.startsWith('/geo/') ? geoCache : cache;
              await targetCache.put(assetUrl, res);
            }
          } catch (err) {
            console.warn('[SW] Falha ao pré-cachear asset:', assetUrl, err);
          }
        })
      );
      return self.skipWaiting();
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_NAME_PREFIX) && !name.endsWith(CACHE_VERSION))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Verificadores de rota e estratégia
function isGeoJsonData(url) {
  return url.pathname.startsWith('/geo/');
}

function isVitalUiOrSvg(url, request) {
  // SVGs cartográficos
  if (url.pathname.endsWith('.svg')) {
    return true;
  }
  // Scripts e estilos vitais da UI (Next.js static assets)
  if (
    url.pathname.startsWith('/_next/static/') ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    return true;
  }
  return false;
}

function isBotanicalCatalogData(url) {
  // Arquivos JSON e CSV do catálogo botânico
  return (
    url.pathname.includes('/data/') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.csv') ||
    url.pathname.includes('mock-trees')
  );
}

// Interceptação de requisições de rede
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições de outros esquemas ou métodos que não sejam GET
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. ESTRATÉGIA NETWORK-FIRST: Camadas GeoJSON cartográficas (sempre dados frescos)
  if (isGeoJsonData(url)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(GEO_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ type: 'FeatureCollection', features: [] }), {
              headers: { 'Content-Type': 'application/geo+json' }
            });
          });
        })
    );
    return;
  }

  // 2. ESTRATÉGIA CACHE-FIRST: Arquivos vitais da UI e SVGs cartográficos
  if (isVitalUiOrSvg(url, request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheType = url.pathname.startsWith('/geo/') ? GEO_CACHE : STATIC_CACHE;
            const responseClone = networkResponse.clone();
            caches.open(cacheType).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          if (cachedResponse) return cachedResponse;
          // Se for camada GeoJSON, retorna FeatureCollection vazia para não quebrar JSON.parse
          if (url.pathname.startsWith('/geo/')) {
            return new Response(JSON.stringify({ type: 'FeatureCollection', features: [] }), {
              headers: { 'Content-Type': 'application/geo+json' }
            });
          }
          // Se for SVG, retorna placeholder gráfico
          return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"></svg>', {
            headers: { 'Content-Type': 'image/svg+xml' }
          });
        });
      })
    );
    return;
  }

  // 2. ESTRATÉGIA STALE-WHILE-REVALIDATE: Catálogo botânico JSON/CSV
  if (isBotanicalCatalogData(url)) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Em caso de falha de rede, preserva o cache
            return cachedResponse || new Response(JSON.stringify([]), {
              headers: { 'Content-Type': 'application/json' }
            });
          });

        // Retorna imediatamente o cache existente (stale), enquanto a revalidação ocorre em background
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. ESTRATÉGIA NETWORK-FIRST: Navegação HTML com Fallback para o App Shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/').then((cachedShell) => {
          return cachedShell || new Response('Aplicativo offline. Por favor, conecte-se à internet para o primeiro carregamento.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
      })
    );
    return;
  }

  // Fallback padrão: rede direta
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
