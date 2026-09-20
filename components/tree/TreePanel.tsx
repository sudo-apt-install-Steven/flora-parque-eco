'use client';

import React from 'react';
import { X, ChevronDown, Trees, MapPin } from 'lucide-react';
import { Tree } from '@/lib/tree-schema';
import { TreeDetail } from '@/components/tree/TreeDetail';

interface TreePanelProps {
  selectedTree: Tree | null;
  onClose: () => void;
  filteredTrees: Tree[];
  onSelectTree: (tree: Tree) => void;
}

export const TreePanel: React.FC<TreePanelProps> = ({
  selectedTree,
  onClose,
  filteredTrees,
  onSelectTree
}) => {
  if (!selectedTree && filteredTrees.length === 0) {
    return null;
  }

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR (Visualização >= md)                           */}
      {/* ------------------------------------------------------------- */}
      <aside
        role="complementary"
        aria-label="Painel de Informações Botânicas"
        className={`hidden md:flex flex-col fixed top-4 bottom-4 right-4 w-96 lg:w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-30 overflow-hidden transition-all duration-300 ${
          selectedTree ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {selectedTree && (
          <>
            {/* Header com Botão Fechar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-emerald-600" />
                Ficha do Espécime
              </span>
              <button
                onClick={onClose}
                aria-label="Fechar painel do espécime"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corpo Rolável */}
            <div className="flex-1 overflow-y-auto px-6 py-5 smooth-touch-scroll">
              <TreeDetail tree={selectedTree} onClose={onClose} />
            </div>
          </>
        )}
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE BOTTOM SHEET (Visualização < md)                       */}
      {/* ------------------------------------------------------------- */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ficha do Espécime Botânico"
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-out flex flex-col max-h-[82vh] ${
          selectedTree ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
      >
        {selectedTree && (
          <>
            {/* Grab Handle & Barra de Ação Mobile */}
            <div className="flex flex-col items-center pt-3 pb-2 px-6 border-b border-slate-100 dark:border-slate-800 relative">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mb-2" />
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-emerald-600" />
                  Espécime Selecionado
                </span>
                <button
                  onClick={onClose}
                  aria-label="Fechar ficha da árvore"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo com Rolagem no Mobile */}
            <div className="overflow-y-auto px-5 py-4 smooth-touch-scroll pb-10">
              <TreeDetail tree={selectedTree} onClose={onClose} />
            </div>
          </>
        )}
      </div>
    </>
  );
};
