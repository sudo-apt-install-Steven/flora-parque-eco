'use client';

import React from 'react';
import { X, ChevronDown, Trees } from 'lucide-react';
import { Tree } from '@/lib/tree-schema';
import { TreeDetail } from '@/components/tree/TreeDetail';

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
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    setDragOffset(Math.max(0, deltaY));
  };

  const handleTouchEnd = () => {
    if (dragOffset > 72) {
      onClose();
    }
    touchStartY.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  if (!selectedTree) {
    return null;
  }

  return (
    <>
      <aside
        role="complementary"
        aria-label="Ficha Botânica do Espécime"
        className="hidden md:flex flex-col fixed top-24 bottom-8 right-8 w-96 lg:w-[410px] bg-[#f8f6ef] dark:bg-[#0f2621] rounded-3xl shadow-[0_18px_40px_rgba(16,42,38,0.16)] border border-[#102a26]/12 dark:border-white/10 z-30 overflow-hidden animate-panel-in"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 dark:border-stone-800 bg-[#f3efe4] dark:bg-black/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0b211d] text-[#c4a06a] flex items-center justify-center">
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

        <div className="flex-1 overflow-y-auto px-6 py-5 smooth-touch-scroll">
          <TreeDetail
            tree={selectedTree}
            onClose={onClose}
            onCenterOnMap={onCenterOnMap}
          />
        </div>
      </aside>

      <div
        className="md:hidden fixed inset-0 bg-[#102a26]/35 z-40 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ficha Botânica do Espécime"
        className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-[#f8f6ef] dark:bg-[#0f2621] rounded-t-3xl shadow-[0_-12px_40px_rgba(16,42,38,0.18)] border-t border-[#102a26]/12 dark:border-white/10 flex flex-col max-h-[82vh] animate-sheet-in"
        style={{
          transform: dragOffset ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex flex-col items-center pt-3 pb-2 px-5 border-b border-stone-200/80 dark:border-stone-800 relative cursor-grab active:cursor-grabbing select-none"
        >
          <div className="sheet-handle mb-2" />
          <div className="w-full flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-[#c4a06a]" />
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
