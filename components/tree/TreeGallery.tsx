'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, ZoomIn, X, Camera } from 'lucide-react';
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
  outro: 'Detalhe'
};

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

  if (allPhotos.length === 0) {
    return (
      <div className="w-full h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
        <Camera className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
        <span>Nenhuma fotografia cadastrada no momento</span>
        <span className="text-[10px] text-slate-500 mt-1">Registros fotográficos serão adicionados em campo</span>
      </div>
    );
  }

  const heroPhoto = allPhotos[0];
  const remainingPhotos = allPhotos.slice(1);

  return (
    <div className="space-y-3">
      {/* Imagem Principal em Destaque */}
      <div
        onClick={() => setSelectedPhoto(heroPhoto)}
        className="group relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-800"
      >
        <Image
          src={heroPhoto.url}
          alt={heroPhoto.caption || `Fotografia de ${treeName}`}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Badge da Categoria */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold tracking-wide uppercase">
          {CATEGORY_LABELS[heroPhoto.category] || heroPhoto.category}
        </div>

        {/* Botão Zoom */}
        <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </div>

        {/* Legenda / Crédito */}
        {(heroPhoto.caption || heroPhoto.credit) && (
          <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
            {heroPhoto.caption && <div className="font-medium truncate">{heroPhoto.caption}</div>}
            {heroPhoto.credit && <div className="text-[10px] text-slate-300 truncate">Foto: {heroPhoto.credit}</div>}
          </div>
        )}
      </div>

      {/* Grade de Miniaturas da Galeria */}
      {remainingPhotos.length > 0 && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Galeria de Detalhes ({remainingPhotos.length})
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {remainingPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative h-20 rounded-xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <Image
                  src={photo.thumbUrl || photo.url}
                  alt={photo.caption || `Detalhe de ${treeName}`}
                  fill
                  sizes="120px"
                  className="object-cover transition-transform duration-200 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white font-medium truncate max-w-[90%]">
                  {CATEGORY_LABELS[photo.category] || photo.category}
                </div>
              </div>
            ))}
          </div>
        </div>
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
            className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
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
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain"
              />
            </div>

            <div className="p-4 bg-slate-900/90 text-white text-xs border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-emerald-400 mr-2">
                  [{CATEGORY_LABELS[selectedPhoto.category] || selectedPhoto.category}]
                </span>
                <span>{selectedPhoto.caption || treeName}</span>
                {selectedPhoto.credit && (
                  <div className="text-[10px] text-slate-400 mt-0.5">Crédito: {selectedPhoto.credit}</div>
                )}
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
