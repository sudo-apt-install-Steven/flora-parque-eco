'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Camera } from 'lucide-react';
import { PhotoItem } from '@/lib/tree-schema';
import { DEFAULT_FALLBACK_PHOTO } from '@/lib/fallbacks';
import { cn, safeImgSrc } from '@/lib/utils';

interface TreeGalleryProps {
  primaryPhoto: PhotoItem | null;
  gallery: PhotoItem[];
  treeName: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  arvore_inteira: 'Árvore Inteira',
  folha: 'Folha',
  flor: 'Flor',
  fruto: 'Fruto',
  casca: 'Casca',
  outro: 'Tronco/Detalhe'
};

/**
 * Foto Principal Dominante do Espécime
 */
export const TreeHeroPhoto: React.FC<{
  photo: PhotoItem | null;
  treeName: string;
  onZoom?: (photo: PhotoItem) => void;
}> = ({ photo, treeName, onZoom }) => {
  const [loaded, setLoaded] = useState(false);

  if (!photo) {
    return (
      <div className="w-full h-48 sm:h-56 rounded-2xl bg-[#ece6d6] dark:bg-stone-800/60 border border-dashed border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center text-stone-400 text-xs p-4 text-center">
        <Camera className="w-8 h-8 mb-2 opacity-50 text-stone-400" />
        <span className="font-medium">Nenhum registro fotográfico primário</span>
        <span className="text-[10px] text-stone-500 mt-0.5">Fotos em alta resolução serão capturadas em campo</span>
      </div>
    );
  }

  const src = safeImgSrc(photo.url);

  return (
    <div
      onClick={() => onZoom?.(photo)}
      className="group relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden cursor-pointer bg-[#ece6d6] dark:bg-stone-800 shadow-[0_8px_18px_rgba(16,42,38,0.08)] border border-[#102a26]/10 dark:border-white/10"
    >
      {!loaded && <div className="absolute inset-0 ui-skeleton" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={photo.caption || `Fotografia principal de ${treeName}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          const target = e.currentTarget;
          setLoaded(true);
          if (!target.dataset.fallback) {
            target.dataset.fallback = '1';
            target.src = DEFAULT_FALLBACK_PHOTO.url;
          }
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#102a26]/70 via-[#102a26]/15 to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#102a26]/78 text-[#f8f6ef] text-[10px] font-bold tracking-wider uppercase border border-white/10 pointer-events-none">
        {CATEGORY_LABELS[photo.category] || photo.category}
      </div>

      <div className="absolute top-3 right-3 p-1.5 rounded-md bg-[#102a26]/55 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <ZoomIn className="w-4 h-4" />
      </div>

      {(photo.caption || photo.credit) && (
        <div className="absolute bottom-3 left-3 right-3 text-white text-xs pointer-events-none">
          {photo.caption && <div className="font-semibold truncate">{photo.caption}</div>}
          {photo.credit && <div className="text-[10px] text-stone-300 truncate">Foto: {photo.credit}</div>}
        </div>
      )}
    </div>
  );
};

/**
 * Carrossel Deslizante de Fotografias Botânicas
 */
export const TreePhotoCarousel: React.FC<{
  photos: PhotoItem[];
  treeName: string;
  onZoom?: (photo: PhotoItem) => void;
  activePhotoId?: string | null;
}> = ({ photos, treeName, onZoom, activePhotoId }) => {
  if (photos.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
        <span>Galeria Fotográfica ({photos.length})</span>
        <span className="text-[10px] text-stone-400 font-normal">Deslize para ver</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1.5 snap-x snap-mandatory scrollbar-none smooth-touch-scroll">
        {photos.map((photo, idx) => {
          const isActive = activePhotoId ? activePhotoId === photo.id : idx === 0;
          const src = safeImgSrc(photo.thumbUrl || photo.url);
          return (
            <button
              type="button"
              key={photo.id || idx}
              onClick={() => onZoom?.(photo)}
              className={cn(
                'group relative flex-shrink-0 w-28 sm:w-32 h-24 rounded-xl overflow-hidden cursor-pointer bg-[#ece6d6] dark:bg-stone-800 snap-start focus:outline-none focus:ring-2 focus:ring-[#c4a06a] border transition-all duration-200',
                isActive
                  ? 'border-[#c4a06a] shadow-[0_0_0_2px_rgba(196,160,106,0.35)]'
                  : 'border-[#102a26]/10 dark:border-white/10 hover:border-[#c4a06a]/50'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={photo.caption || `Detalhe fotográfico de ${treeName}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const t = e.currentTarget;
                  if (!t.dataset.fallback) {
                    t.dataset.fallback = '1';
                    t.style.opacity = '0.4';
                  }
                }}
              />
              <div className="absolute inset-0 bg-[#102a26]/20 group-hover:bg-transparent transition-colors pointer-events-none" />
              <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-[#102a26]/80 text-[9px] text-white font-medium truncate text-center pointer-events-none">
                {CATEGORY_LABELS[photo.category] || photo.category}
              </div>
              <span
                className={cn(
                  'absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full border border-white/70',
                  isActive ? 'bg-[#c4a06a]' : 'bg-white/40'
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Componente unificado com modal de zoom
 */
export const TreeGallery: React.FC<TreeGalleryProps> = ({ primaryPhoto, gallery, treeName }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const allPhotos: PhotoItem[] = [];
  if (primaryPhoto) {
    allPhotos.push(primaryPhoto);
  }
  gallery.forEach((photo) => {
    if (!primaryPhoto || photo.id !== primaryPhoto.id) {
      allPhotos.push(photo);
    }
  });

  const hero = allPhotos[0] || null;
  const remaining = allPhotos.slice(1);
  const selectedPhoto = selectedPhotoIndex === null ? null : allPhotos[selectedPhotoIndex] || null;

  const showPrevious = () => {
    setSelectedPhotoIndex((current) => {
      if (current === null || allPhotos.length < 2) return current;
      return (current - 1 + allPhotos.length) % allPhotos.length;
    });
  };

  const showNext = () => {
    setSelectedPhotoIndex((current) => {
      if (current === null || allPhotos.length < 2) return current;
      return (current + 1) % allPhotos.length;
    });
  };

  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPhotoIndex(null);
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, allPhotos.length]);

  return (
    <div className="space-y-4">
      <TreeHeroPhoto
        photo={hero}
        treeName={treeName}
        onZoom={() => setSelectedPhotoIndex(0)}
      />

      {remaining.length > 0 && (
        <TreePhotoCarousel
          photos={remaining}
          treeName={treeName}
          onZoom={(photo) => setSelectedPhotoIndex(allPhotos.findIndex((item) => item.id === photo.id))}
          activePhotoId={selectedPhoto?.id ?? remaining[0]?.id}
        />
      )}

      {/* Modal Ampliado de Fotografia */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#0b211d] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              aria-label="Fechar fotografia ampliada"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className="relative flex h-[55vh] max-h-[560px] w-full items-center justify-center bg-black touch-pan-y"
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(event) => {
                if (touchStartX.current === null) return;
                const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
                if (Math.abs(deltaX) > 48) {
                  if (deltaX > 0) showPrevious();
                  else showNext();
                }
                touchStartX.current = null;
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={safeImgSrc(selectedPhoto.url)}
                alt={selectedPhoto.caption || treeName}
                className="max-w-full max-h-[500px] object-contain"
                onError={(event) => {
                  const target = event.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = DEFAULT_FALLBACK_PHOTO.url;
                  }
                }}
              />
              {allPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    aria-label="Fotografia anterior"
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-[#d6a35b]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Próxima fotografia"
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-[#d6a35b]"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-4 bg-[#0b211d]/95 text-white text-xs border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#d6a35b] mr-2">
                  [{CATEGORY_LABELS[selectedPhoto.category] || selectedPhoto.category}]
                </span>
                <span className="text-[#f8f6ef]">{selectedPhoto.caption || treeName}</span>
                {selectedPhoto.credit && (
                  <div className="text-[10px] text-stone-400 mt-0.5">Crédito: {selectedPhoto.credit}</div>
                )}
              </div>
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium transition-colors"
              >
                Fechar ({(selectedPhotoIndex ?? 0) + 1}/{allPhotos.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
