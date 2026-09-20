'use client';

import React from 'react';
import { X, ChevronDown, Trees } from 'lucide-react';
import { Tree } from '@/lib/tree-schema';
import { TreeDetail } from '@/components/tree/TreeDetail';
import { cn } from '@/lib/utils';

interface TreePanelProps {
  selectedTree: Tree | null;
  onClose: () => void;
  filteredTrees?: Tree[];
  onSelectTree?: (tree: Tree) => void;
  onCenterOnMap?: (tree: Tree) => void;
}

export const TreePanel: React.FC<TreePanelProps> = ({
  selectedTree,
  onClose,
  onCenterOnMap
}) => {
  const touchStartY = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (deltaY > 50) {
        onClose();
      }
      touchStartY.current = null;
    }
  };

  if (!selectedTree) {
    return null;
  }

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR (>= md)                                        */}
      {/* ------------------------------------------------------------- */}
      <aside
        role="complementary"
        aria-label="Ficha Botânica do Espécime"
        className="hidden md:flex flex-col fixed top-24 bottom-8 right-8 w-96 lg:w-[410px] bg-[#f8f6ef]/98 dark:bg-[#0f2621]/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 z-30 overflow-hidden animate-panel-in"
      >
        {/* Header com Fechar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/70 dark:border-stone-800 bg-white/40 dark:bg-black/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0b211d] text-[#d6a35b] flex items-center justify-center">
              <Trees className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Ficha do Espécime
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar painel da árvore"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Rolagem */}
        <div className="flex-1 overflow-y-auto px-6 py-5 smooth-touch-scroll">
          <TreeDetail
            tree={selectedTree}
            onClose={onClose}
            onCenterOnMap={onCenterOnMap}
          />
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE BOTTOM SHEET (< md)                                    */}
      {/* ------------------------------------------------------------- */}
      {/* Scrim translúcido de fundo para toque externo fechar */}
      <div
        className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ficha Botânica do Espécime"
        className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-[#f8f6ef]/98 dark:bg-[#0f2621]/98 backdrop-blur-2xl rounded-t-3xl shadow-2xl border-t border-white/60 dark:border-white/10 flex flex-col max-h-[82vh] animate-sheet-in"
      >
        {/* Drag Handle & Top Bar com suporte a gesto swipe down */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex flex-col items-center pt-3 pb-2 px-5 border-b border-stone-200/70 dark:border-stone-800 relative cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-10 h-1.5 bg-stone-300 dark:bg-stone-600 rounded-full mb-2" />
          <div className="w-full flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-[#d6a35b]" />
              Espécime Selecionado
            </span>
            <button
              onClick={onClose}
              aria-label="Fechar ficha do espécime"
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-5 py-4 smooth-touch-scroll pb-10">
          <TreeDetail
            tree={selectedTree}
            onClose={onClose}
            onCenterOnMap={onCenterOnMap}
          />
        </div>
      </div>
    </>
  );
};
