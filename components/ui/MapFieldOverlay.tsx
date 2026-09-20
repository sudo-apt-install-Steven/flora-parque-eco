'use client';

import React from 'react';
import { Compass, Filter, Trees, Info } from 'lucide-react';
import { FieldGroup } from '@/lib/tree-schema';
import { PARK_CONFIG } from '@/lib/park-config';
import { cn } from '@/lib/utils';

interface MapFieldOverlayProps {
  selectedGroup: FieldGroup | 'all';
  onGroupChange: (group: FieldGroup | 'all') => void;
  resultCount: number;
  totalCount: number;
  onOpenLegend: () => void;
}

export const MapFieldOverlay: React.FC<MapFieldOverlayProps> = ({
  selectedGroup,
  onGroupChange,
  resultCount,
  totalCount,
  onOpenLegend
}) => {
  return (
    <>
      {/* 1. Authentic Cartographic Field Stamp (Superior Direita) */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none hidden lg:flex flex-col items-end select-none">
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#0b211d]/85 backdrop-blur-md border border-[#f0c77b]/30 shadow-xl text-right">
          <span className="block text-[8px] font-mono tracking-[0.22em] text-[#d6a35b] uppercase">
            Carta Dendrológica
          </span>
          <strong className="block font-serif text-lg font-bold tracking-wider text-[#f8f6ef] leading-tight mt-0.5">
            PEM–RO
          </strong>
          <span className="block text-[9px] font-mono text-stone-300/80 mt-0.5">
            12°42′16″ S · 60°07′08″ O
          </span>
        </div>
      </div>

      {/* 2. Barra Superior Esquerda: Chips Rápidos de Grupo de Campo */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-[calc(100%-2rem)] md:max-w-md select-none">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#f8f6ef]/90 dark:bg-[#0b211d]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg overflow-x-auto no-scrollbar">
          {/* Badge de Contagem */}
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#102a26] text-[#f0c77b] shadow-sm flex-shrink-0">
            <Trees className="w-3.5 h-3.5 text-[#d6a35b]" />
            {resultCount} / {totalCount}
          </span>

          {/* Filtro: Todos */}
          <button
            onClick={() => onGroupChange('all')}
            className={cn(
              'px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 flex-shrink-0',
              selectedGroup === 'all'
                ? 'bg-[#d6a35b] text-[#0b211d] font-bold shadow-sm'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-white/10'
            )}
          >
            Todos
          </button>

          {/* Filtro: Grupo A */}
          <button
            onClick={() => onGroupChange('groupA')}
            title="Grupo A — Margem Esquerda Norte"
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 flex-shrink-0',
              selectedGroup === 'groupA'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-white/10'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Grupo A
          </button>

          {/* Filtro: Grupo B */}
          <button
            onClick={() => onGroupChange('groupB')}
            title="Grupo B — Margem Esquerda Sul"
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 flex-shrink-0',
              selectedGroup === 'groupB'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-white/10'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Grupo B
          </button>

          {/* Filtro: Grupo C */}
          <button
            onClick={() => onGroupChange('groupC')}
            title="Grupo C — Margem Direita / Trilha Principal"
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 flex-shrink-0',
              selectedGroup === 'groupC'
                ? 'bg-amber-600 text-white font-bold shadow-sm'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-white/10'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Grupo C
          </button>
        </div>
      </div>

      {/* 3. Legenda Cartográfica Flutuante (Inferior Direita - Acima dos controles do MapLibre) */}
      <div className="absolute bottom-20 md:bottom-8 right-4 md:right-16 z-10 hidden sm:flex flex-col gap-1.5 p-3 rounded-2xl bg-[#0b211d]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-[#f4f1e8] text-[10px] select-none">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <span className="font-bold uppercase tracking-wider text-[#d6a35b] text-[9px]">
            Legenda Botânica
          </span>
          <button
            onClick={onOpenLegend}
            aria-label="Abrir guia completo da legenda"
            className="p-0.5 text-stone-400 hover:text-white transition-colors"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 mt-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
            <span className="text-stone-300">Grupo A (Margem Esq. Norte)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
            <span className="text-stone-300">Grupo B (Margem Esq. Sul)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
            <span className="text-stone-300">Grupo C (Margem Direita)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            <span className="w-3.5 h-1.5 rounded-sm bg-[#25778b]" />
            <span className="text-stone-400">Lago & Mata Ciliar</span>
          </div>
        </div>
      </div>
    </>
  );
};
