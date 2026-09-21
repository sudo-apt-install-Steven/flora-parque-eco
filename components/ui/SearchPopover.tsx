'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, ArrowUpRight, Leaf, Trees } from 'lucide-react';
import { Tree } from '@/lib/tree-schema';
import { PARK_CONFIG } from '@/lib/park-config';
import { cn } from '@/lib/utils';

interface SearchPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTree: (tree: Tree) => void;
  trees: Tree[];
}

export const SearchPopover: React.FC<SearchPopoverProps> = ({
  isOpen,
  onClose,
  onSelectTree,
  trees
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus automático ao abrir
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Teclado Escape fecha a busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtragem dos dados acadêmicos reais
  const results = useMemo(() => {
    if (!query.trim()) {
      return trees.slice(0, 6);
    }
    const q = query.toLowerCase().trim();
    return trees.filter(
      (t) =>
        t.popularName.toLowerCase().includes(q) ||
        t.scientificNameSuggested.toLowerCase().includes(q) ||
        t.family.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
    );
  }, [query, trees]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar espécimes no inventário"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-[#102a26]/45"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#f8f6ef] dark:bg-[#0f2621] border border-stone-300 dark:border-emerald-950/60 rounded-2xl shadow-2xl overflow-hidden animate-panel-in"
      >
        {/* Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-black/20">
          <Search className="w-5 h-5 text-[#829087] dark:text-[#a9bbb0]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome popular, científico ou família..."
            aria-label="Digitar busca de árvore"
            className="flex-1 bg-transparent text-sm font-medium text-[#102a26] dark:text-[#f8f6ef] placeholder:text-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Limpar texto"
              className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Fechar busca"
            className="px-2 py-1 rounded-lg text-xs font-mono text-stone-500 hover:bg-stone-200/50 dark:hover:bg-stone-800"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 smooth-touch-scroll">
          {results.length === 0 ? (
            <div className="py-10 text-center text-sm text-stone-500 dark:text-stone-400">
              <div className="mx-auto mb-3 h-10 w-24 rounded-lg ui-skeleton" />
              <Trees className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Nenhum espécime encontrado para &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                {query ? `${results.length} resultados encontrados` : 'Espécimes em Destaque'}
              </div>

              {results.map((tree) => {
                const groupConfig = PARK_CONFIG.fieldGroups[tree.group];
                return (
                  <button
                    key={tree.id}
                    onClick={() => {
                      onSelectTree(tree);
                      onClose();
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-left hover:bg-[#eef1e8] dark:hover:bg-white/[0.06] transition-colors group"
                  >
                    {/* Indicador do Grupo */}
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: groupConfig?.color || '#10b981' }}
                      title={`Cadastrado por ${groupConfig?.name || tree.group}`}
                    />

                    {/* Informações Botânicas */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#102a26] dark:text-[#f8f6ef] truncate">
                          {tree.popularName}
                        </span>
                        {tree.displayNumber !== null && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            #{tree.displayNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-serif italic text-stone-600 dark:text-stone-400 truncate mt-0.5">
                        {tree.scientificNameSuggested}
                        <span className="not-italic text-[11px] text-stone-400 dark:text-stone-500 ml-2">
                          ({tree.family})
                        </span>
                      </div>
                    </div>

                    {/* Confidence Score & Arrow */}
                    {tree.plantnet?.score && (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        {(tree.plantnet.score * 100).toFixed(0)}%
                      </span>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#d6a35b] transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
