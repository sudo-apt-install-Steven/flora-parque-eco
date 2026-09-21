'use client';

import { useState, useEffect } from 'react';

export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  isServiceWorkerReady: boolean;
}

/**
 * Hook utilitário para detectar conectividade offline e registrar o Service Worker
 * Notifica a aplicação quando a rede cair em campo durante o inventário no parque
 */
export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Registro e detecção do Service Worker do PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      if (navigator.serviceWorker.controller) {
        setIsServiceWorkerReady(true);
      }

      navigator.serviceWorker.ready
        .then(() => {
          setIsServiceWorkerReady(true);
        })
        .catch(() => {});

      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (registration.active) {
            setIsServiceWorkerReady(true);
          }
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'activated') {
                  setIsServiceWorkerReady(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          // Registro em ambiente de desenvolvimento local pode falhar silenciosamente sem quebrar a UI
          console.debug('[PWA] Service worker não registrado neste ambiente:', err);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    isServiceWorkerReady
  };
}
