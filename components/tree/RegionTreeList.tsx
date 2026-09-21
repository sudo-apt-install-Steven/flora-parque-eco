'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Trees, ChevronRight, Eye, Sparkles, MapPin } from 'lucide-react';
import { Tree, FieldGroup } from '@/lib/tree-schema';
import { PARK_CONFIG } from '@/lib/park-config';
import { cn } from '@/lib/utils';

interface RegionTreeListProps {
  group: FieldGroup;
  trees: Tree[];
  onSelectTree: (tree: Tree) => void;
  onClose: () => void;
}

export const RegionTreeList: React.FC<RegionTreeListProps> = ({
  group,
  trees,
  onSelectTree,
  onClose
}) => {
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  const groupConfig = PARK_CONFIG.fieldGroups[group] || {
    name: group,
    locationDescription: 'Setor de Campo',
    color: '#eab308'
  };

  const groupTrees = trees.filter((t) => t.group === group);

  // Link canônico ou de busca no PlantNet
  const getPlantNetUrl = (tree: Tree): string => {
    if (tree.plantnet?.url) return tree.plantnet.url;
    if (tree.plantnet?.taxon) {
      return `https://identify.plantnet.org/the-plant-list/species/${encodeURIComponent(tree.plantnet.taxon)}`;
    }
    return `https://identify.plantnet.org/search?q=${encodeURIComponent(tree.scientificNameSuggested)}`;
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Cabeçalho do Setor */}
      <div
        className="p-4 rounded-2xl border transition-all"
        style={{
          backgroundColor: `${groupConfig.color}15`,
          borderColor: `${groupConfig.color}40`
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full ring-2 shadow-sm"
              style={{
                backgroundColor: groupConfig.color,
                boxShadow: `0 0 12px ${groupConfig.color}`
              }}
            />
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-[#f8f6ef]">
              {groupConfig.name}
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/80 dark:bg-black/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/10">
            {groupTrees.length} espécimes
          </span>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-300/80 mt-1.5 leading-relaxed">
          {groupConfig.locationDescription}
        </p>
      </div>

      {/* Lista das Árvores do Setor */}
      <div className="flex flex-col gap-3">
        {groupTrees.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-500 text-xs">
            Nenhuma árvore catalogada neste setor até o momento.
          </div>
        ) : (
          groupTrees.map((tree, idx) => {
            const plantnetUrl = getPlantNetUrl(tree);
            const mainPhoto = tree.primaryPhoto?.url || '/images/tree-fallback.svg';

            return (
              <div
                key={tree.id}
                className="group relative flex flex-col p-3.5 rounded-2xl bg-white dark:bg-[#132c25] border border-stone-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-[#f8f6ef] truncate">
                        {tree.popularName}
                      </h4>
                    </div>
                    <p className="font-serif italic text-xs text-[#b8860b] dark:text-[#d6a35b] truncate mt-0.5">
                      {tree.scientificNameSuggested}
                    </p>
                    <span className="inline-block text-[10px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
                      Família: {tree.family}
                    </span>
                  </div>

                  {/* Botão de Link Direto do PlantNet */}
                  <a
                    href={plantnetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Verificar espécie no PlantNet / POWO Kew"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#102a26] text-[#f0c77b] hover:bg-[#183d37] hover:scale-105 active:scale-95 transition-all shadow-sm border border-[#c4a06a]/30 flex-shrink-0"
                  >
                    <span>PlantNet</span>
                    <ExternalLink className="w-3 h-3 text-[#d6a35b]" />
                  </a>
                </div>

                {/* Galeria Completa das Fotos da Árvore */}
                <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {/* Foto Principal */}
                  <div
                    onClick={() => setSelectedPhotoModal(mainPhoto)}
                    className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-black/30 border border-stone-200 dark:border-white/10 flex-shrink-0 cursor-pointer group/photo"
                    title="Clique para ampliar"
                  >
                    <img
                      src={mainPhoto}
                      alt={tree.popularName}
                      className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  </div>

                  {/* Fotos adicionais da galeria */}
                  {tree.gallery?.map((photo, pIdx) => (
                    <div
                      key={photo.id || pIdx}
                      onClick={() => setSelectedPhotoModal(photo.url)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-black/30 border border-stone-200 dark:border-white/10 flex-shrink-0 cursor-pointer group/photo"
                      title={photo.caption || `Foto ${pIdx + 2}`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || tree.popularName}
                        className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-300"
                      />
                      <span className="absolute bottom-0.5 inset-x-0.5 text-center text-[8px] font-bold bg-black/60 text-white rounded uppercase px-0.5 truncate">
                        {photo.category || 'Foto'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Barra de Ações: Ver Ficha Detalhada */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">
                    {tree.notes ? tree.notes.substring(0, 48) + '...' : 'Coletado em campo'}
                  </span>

                  <button
                    onClick={() => onSelectTree(tree)}
                    className="flex items-center gap-1 text-xs font-bold text-[#b8860b] dark:text-[#d6a35b] hover:underline"
                  >
                    <span>Ficha Completa</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Zoom de Imagem */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <img
              src={selectedPhotoModal}
              alt="Ampliação botânica"
              className="w-full h-full object-contain max-h-[80vh]"
            />
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-bold hover:bg-black transition-colors"
            >
              Fechar ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
