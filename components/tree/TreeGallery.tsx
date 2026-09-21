'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, X, Camera } from 'lucide-react';
import { PhotoItem } from '@/lib/tree-schema';

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
 * 1. Foto Principal Dominante do Espécime
 */
export const TreeHeroPhoto: React.FC<{
  photo: PhotoItem | null;
  treeName: string;
  onZoom?: (photo: PhotoItem) => void;
}> = ({ photo, treeName, onZoom }) => {
  if (!photo) {
    return (
      <div className="w-full h-48 sm:h-56 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-dashed border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center text-stone-400 text-xs p-4 text-center">
        <Camera className="w-8 h-8 mb-2 opacity-50 text-stone-400" />
        <span className="font-medium">Nenhum registro fotográfico primário</span>
        <span className="text-[10px] text-stone-500 mt-0.5">Fotos em alta resolução serão capturadas em campo</span>
      </div>
    );
  }

  return (
    <div
      onClick={() => onZoom?.(photo)}
      className="group relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden cursor-pointer bg-stone-100 dark:bg-stone-800 shadow-sm border border-stone-200/80 dark:border-white/10"
    >
      <Image
        src={photo.url}
        alt={photo.caption || `Fotografia principal de ${treeName}`}
        fill
        sizes="(max-width: 768px) 100vw, 420px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* Badge da Categoria */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/10">
        {CATEGORY_LABELS[photo.category] || photo.category}
      </div>

      {/* Botão Zoom */}
      <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <ZoomIn className="w-4 h-4" />
      </div>

      {/* Legenda / Crédito */}
      {(photo.caption || photo.credit) && (
        <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
          {photo.caption && <div className="font-semibold truncate">{photo.caption}</div>}
          {photo.credit && <div className="text-[10px] text-stone-300 truncate">Foto: {photo.credit}</div>}
        </div>
      )}
    </div>
  );
};

/**
 * 2. Carrossel Deslizante de Fotografias Botânicas (Next/Image)
 */
export const TreePhotoCarousel: React.FC<{
  photos: PhotoItem[];
  treeName: string;
  onZoom?: (photo: PhotoItem) => void;
}> = ({ photos, treeName, onZoom }) => {
  if (photos.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
        <span>Galeria Fotográfica ({photos.length})</span>
        <span className="text-[10px] text-stone-400 font-normal">Deslize para ver</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1.5 snap-x snap-mandatory scrollbar-none smooth-touch-scroll">
        {photos.map((photo, idx) => (
          <div
            key={photo.id || idx}
            onClick={() => onZoom?.(photo)}
            className="group relative flex-shrink-0 w-28 sm:w-32 h-24 rounded-xl overflow-hidden cursor-pointer bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-white/10 snap-start focus:outline-none focus:ring-2 focus:ring-[#d6a35b]"
          >
            <Image
              src={photo.thumbUrl || photo.url}
              alt={photo.caption || `Detalhe fotográfico de ${treeName}`}
              fill
              sizes="130px"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
            <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[9px] text-white font-medium truncate text-center">
              {CATEGORY_LABELS[photo.category] || photo.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Componente unificado com modal de zoom
 */
export const TreeGallery: React.FC<TreeGalleryProps> = ({ primaryPhoto, gallery, treeName }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

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

  return (
    <div className="space-y-4">
      <TreeHeroPhoto photo={hero} treeName={treeName} onZoom={setSelectedPhoto} />

      {remaining.length > 0 && (
        <TreePhotoCarousel photos={remaining} treeName={treeName} onZoom={setSelectedPhoto} />
      )}

      {/* Modal Ampliado de Fotografia */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#0b211d] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Fechar fotografia ampliada"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full h-[60vh] max-h-[500px]">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || treeName}
                fill
                sizes="(max-width: 768px) 100vw, 650px"
                className="object-contain"
              />
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
                onClick={() => setSelectedPhoto(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
