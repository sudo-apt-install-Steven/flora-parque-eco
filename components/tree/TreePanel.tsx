'use client';

import React from 'react';
import { X, ChevronDown, Trees, MapPin } from 'lucide-react';
import { Tree, FieldGroup } from '@/lib/tree-schema';
import { TreeDetail } from '@/components/tree/TreeDetail';
import { RegionTreeList } from '@/components/tree/RegionTreeList';
import { PARK_CONFIG } from '@/lib/park-config';

interface TreePanelProps {
  selectedTree: Tree | null;
  onClose: () => void;
  filteredTrees?: Tree[];
  onSelectTree?: (tree: Tree) => void;
  onCenterOnMap?: (tree: Tree) => void;
  selectedGroup?: FieldGroup | 'all';
  onCloseGroup?: () => void;
}

export const TreePanel: React.FC<TreePanelProps> = ({
  selectedTree,
  onClose,
  filteredTrees = [],
  onSelectTree,
  onCenterOnMap,
  selectedGroup = 'all',
  onCloseGroup
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
      if (selectedTree) {
        onClose();
      } else if (onCloseGroup) {
        onCloseGroup();
      }
    }
    touchStartY.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  // Se não há árvore selecionada nem grupo filtrado, oculta o painel
  const isRegionMode = !selectedTree && selectedGroup !== 'all';
  if (!selectedTree && !isRegionMode) {
    return null;
  }

  const handleClosePanel = () => {
    if (selectedTree) {
      onClose();
    } else if (onCloseGroup) {
      onCloseGroup();
    }
  };

  const currentGroupConfig = selectedGroup !== 'all' ? PARK_CONFIG.fieldGroups[selectedGroup] : null;

  return (
    <>
      {/* PAINEL LATERAL DESKTOP (FLUTUANTE À DIREITA) */}
      <aside
        role="complementary"
        aria-label={selectedTree ? 'Ficha Botânica do Espécime' : 'Inventário do Setor'}
        className="hidden md:flex flex-col fixed top-24 bottom-8 right-8 w-96 lg:w-[420px] bg-[#f8f6ef] dark:bg-[#0f2621] rounded-3xl shadow-[0_18px_40px_rgba(16,42,38,0.22)] border border-[#102a26]/12 dark:border-white/10 z-30 overflow-hidden animate-panel-in"
      >
        {/* Cabeçalho do Painel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 dark:border-stone-800 bg-[#f3efe4] dark:bg-black/15">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
              style={{
                backgroundColor: currentGroupConfig?.color || '#0b211d'
              }}
            >
              {isRegionMode ? <MapPin className="w-3.5 h-3.5" /> : <Trees className="w-3.5 h-3.5 text-[#c4a06a]" />}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              {isRegionMode ? `Catálogo ${currentGroupConfig?.name || ''}` : 'Ficha do Espécime'}
            </span>
          </div>

          <button
            onClick={handleClosePanel}
            aria-label="Fechar painel"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Scroll Suave */}
        <div className="flex-1 overflow-y-auto px-6 py-5 smooth-touch-scroll">
          {selectedTree ? (
            <TreeDetail
              tree={selectedTree}
              onClose={onClose}
              onCenterOnMap={onCenterOnMap}
            />
          ) : isRegionMode ? (
            <RegionTreeList
              group={selectedGroup}
              trees={filteredTrees}
              onSelectTree={(tree) => onSelectTree && onSelectTree(tree)}
              onClose={handleClosePanel}
            />
          ) : null}
        </div>
      </aside>

      {/* BACKDROP MOBILE */}
      <div
        className="md:hidden fixed inset-0 bg-[#102a26]/40 z-40 animate-fadeIn backdrop-blur-xs"
        onClick={handleClosePanel}
        aria-hidden="true"
      />

      {/* BOTTOM SHEET MOBILE */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={selectedTree ? 'Ficha Botânica do Espécime' : 'Inventário do Setor'}
        className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-[#f8f6ef] dark:bg-[#0f2621] rounded-t-3xl shadow-[0_-12px_40px_rgba(16,42,38,0.22)] border-t border-[#102a26]/12 dark:border-white/10 flex flex-col max-h-[82vh] animate-sheet-in"
        style={{
          transform: dragOffset ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Barra de Arraste Tátil */}
        <div
          className="w-full py-3 flex items-center justify-center cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
        </div>

        {/* Topo do Bottom Sheet Mobile */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-stone-200 dark:border-stone-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentGroupConfig?.color || '#c4a06a' }}
            />
            {isRegionMode ? `Catálogo ${currentGroupConfig?.name || ''}` : 'Ficha do Espécime'}
          </span>
          <button
            onClick={handleClosePanel}
            aria-label="Fechar painel"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Rolável Mobile */}
        <div className="flex-1 overflow-y-auto px-5 py-4 smooth-touch-scroll">
          {selectedTree ? (
            <TreeDetail
              tree={selectedTree}
              onClose={onClose}
              onCenterOnMap={onCenterOnMap}
            />
          ) : isRegionMode ? (
            <RegionTreeList
              group={selectedGroup}
              trees={filteredTrees}
              onSelectTree={(tree) => onSelectTree && onSelectTree(tree)}
              onClose={handleClosePanel}
            />
          ) : null}
        </div>
      </div>
    </>
  );
};
