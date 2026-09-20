'use client';

import React from 'react';
import { Search, X, BarChart3, HelpCircle, Trees } from 'lucide-react';
import { FieldGroup } from '@/lib/tree-schema';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGroup: FieldGroup | 'all';
  onGroupChange: (group: FieldGroup | 'all') => void;
  resultCount: number;
  totalCount: number;
  onOpenStats: () => void;
  onOpenLegend: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  resultCount,
  totalCount,
  onOpenStats,
  onOpenLegend
}) => {
  return (
    <div className="absolute top-4 left-4 z-20 w-[calc(100%-2rem)] max-w-md flex flex-col gap-2">
      {/* Barra de Pesquisa Principal */}
      <div className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome, espécie ou família..."
            aria-label="Buscar espécimes no inventário"
            className="w-full pl-9 pr-8 py-2 text-sm bg-transparent rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Limpar termo de busca"
              className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Botão de Estatísticas */}
        <button
          onClick={onOpenStats}
          title="Ver Estatísticas do Inventário"
          aria-label="Abrir estatísticas do inventário"
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        {/* Botão de Legenda */}
        <button
          onClick={onOpenLegend}
          title="Ver Legenda e Informações"
          aria-label="Abrir legenda e informações do parque"
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Filtros Rápidos por Grupo & Badge de Resultados */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
        <span className="text-[11px] font-semibold text-emerald-950 dark:text-emerald-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800 flex items-center gap-1">
          <Trees className="w-3 h-3 text-emerald-600" />
          {resultCount} / {totalCount}
        </span>

        <button
          onClick={() => onGroupChange('all')}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all backdrop-blur-md border ${
            selectedGroup === 'all'
              ? 'bg-slate-900 text-white dark:bg-emerald-600 border-transparent shadow-sm'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Todos
        </button>

        <button
          onClick={() => onGroupChange('groupA')}
          title="Grupo A — Margem Esquerda Norte"
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all backdrop-blur-md border ${
            selectedGroup === 'groupA'
              ? 'bg-emerald-600 text-white border-transparent shadow-sm'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Grupo A
        </button>

        <button
          onClick={() => onGroupChange('groupB')}
          title="Grupo B — Margem Esquerda Sul"
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all backdrop-blur-md border ${
            selectedGroup === 'groupB'
              ? 'bg-blue-600 text-white border-transparent shadow-sm'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Grupo B
        </button>

        <button
          onClick={() => onGroupChange('groupC')}
          title="Grupo C — Margem Direita"
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all backdrop-blur-md border ${
            selectedGroup === 'groupC'
              ? 'bg-amber-600 text-white border-transparent shadow-sm'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Grupo C
        </button>
      </div>
    </div>
  );
};
