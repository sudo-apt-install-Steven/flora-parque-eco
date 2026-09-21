'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ArrowUpRight, Search, Trees, Sparkles, Filter } from 'lucide-react';
import { Tree } from '@/lib/tree-schema';
import { PARK_CONFIG } from '@/lib/park-config';
import { cn } from '@/lib/utils';

interface SpeciesCatalogViewProps {
  trees: Tree[];
  onBackToMap: () => void;
  onSelectTree: (tree: Tree) => void;
}

export const SpeciesCatalogView: React.FC<SpeciesCatalogViewProps> = ({
  trees,
  onBackToMap,
  onSelectTree
}) => {
  const [query, setQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');

  // Métricas dinâmicas reais
  const stats = useMemo(() => {
    const uniqueSpecies = new Set(trees.map((t) => t.scientificNameSuggested.trim().toLowerCase())).size;
    const uniqueFamilies = new Set(trees.map((t) => t.family.trim().toLowerCase())).size;
    const inReview = trees.filter((t) => t.verificationStatus === 'em_analise' || t.verificationStatus === 'identificacao_preliminar').length;
    return {
      total: trees.length,
      species: uniqueSpecies,
      families: uniqueFamilies,
      inReview
    };
  }, [trees]);

  // Lista de famílias para filtro
  const families = useMemo(() => {
    const set = new Set(trees.map((t) => t.family));
    return Array.from(set).sort();
  }, [trees]);

  // Filtragem da lista
  const filteredTrees = useMemo(() => {
    return trees.filter((tree) => {
      const matchesQuery =
        !query.trim() ||
        tree.popularName.toLowerCase().includes(query.toLowerCase()) ||
        tree.scientificNameSuggested.toLowerCase().includes(query.toLowerCase()) ||
        tree.family.toLowerCase().includes(query.toLowerCase());

      const matchesFamily = selectedFamily === 'all' || tree.family === selectedFamily;

      return matchesQuery && matchesFamily;
    });
  }, [trees, query, selectedFamily]);

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] p-4 sm:p-8 md:p-12 lg:px-24 bg-[#f4f1e8] dark:bg-[#091a17] text-[#102a26] dark:text-[#f8f6ef] overflow-y-auto smooth-touch-scroll">
      {/* Botão Voltar */}
      <button
        onClick={onBackToMap}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-stone-300 dark:border-white/10 text-stone-700 dark:text-stone-200 transition-all shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar ao mapa
      </button>

      {/* Heading Editorial */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6 mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d6a35b]">
            Catálogo Vivo · IFRO Vilhena
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0b211d] dark:text-[#f8f6ef] mt-1">
            Espécies Registradas
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-xl">
            Inventário florístico georreferenciado do Parque Ecológico Marechal Cândido Rondon,
            catalogado com apoio das turmas acadêmicas e identificação assistida por IA.
          </p>
        </div>

        <span className="self-start md:self-auto px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          Base Acadêmica Ativa
        </span>
      </div>

      {/* Faixa de Estatísticas Reais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 shadow-sm mb-8">
        <div className="pr-4 border-r border-stone-200 dark:border-white/10">
          <strong className="font-serif text-2xl sm:text-4xl text-[#0b211d] dark:text-[#f8f6ef] block">
            {stats.total}
          </strong>
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Árvores Catalogadas
          </span>
        </div>

        <div className="pr-4 md:border-r border-stone-200 dark:border-white/10">
          <strong className="font-serif text-2xl sm:text-4xl text-[#0b211d] dark:text-[#f8f6ef] block">
            {stats.species}
          </strong>
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Espécies Únicas
          </span>
        </div>

        <div className="pr-4 border-r border-stone-200 dark:border-white/10">
          <strong className="font-serif text-2xl sm:text-4xl text-[#0b211d] dark:text-[#f8f6ef] block">
            {stats.families}
          </strong>
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Famílias Botânicas
          </span>
        </div>

        <div>
          <strong className="font-serif text-2xl sm:text-4xl text-[#d6a35b] block">
            {stats.inReview}
          </strong>
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Em Validação
          </span>
        </div>
      </div>

      {/* Controles de Busca e Filtro de Família */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar por nome popular ou científico..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white/80 dark:bg-white/[0.06] border border-stone-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#d6a35b]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm rounded-xl bg-white/80 dark:bg-slate-900 border border-stone-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#d6a35b]"
          >
            <option value="all">Todas as Famílias ({families.length})</option>
            {families.map((fam) => (
              <option key={fam} value={fam}>
                {fam}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Espécies */}
      <div className="flex flex-col gap-2">
        {filteredTrees.length === 0 ? (
          <div className="py-16 text-center text-stone-500 dark:text-stone-400">
            <div className="mx-auto mb-4 grid max-w-sm gap-2">
              <div className="h-14 rounded-2xl ui-skeleton" />
              <div className="h-14 rounded-2xl ui-skeleton" />
            </div>
            <Trees className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Nenhuma espécie encontrada para os filtros selecionados.
          </div>
        ) : (
          filteredTrees.map((tree) => {
            const groupConfig = PARK_CONFIG.fieldGroups[tree.group];
            const heroImage = tree.primaryPhoto?.thumbUrl || tree.primaryPhoto?.url || '/placeholder.jpg';

            return (
              <article
                key={tree.id}
                onClick={() => {
                  onSelectTree(tree);
                  onBackToMap();
                }}
                className="group flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.08] border border-stone-200/80 dark:border-white/10 hover:border-[#d6a35b]/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              >
                {/* Imagem */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0">
                  <Image
                    src={heroImage}
                    alt={tree.popularName}
                    fill
                    sizes="64px"
                    className="object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                </div>

                {/* Dados da Árvore */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-sm sm:text-base font-bold text-[#0b211d] dark:text-[#f8f6ef] truncate group-hover:text-[#a07232] dark:group-hover:text-[#f0c77b] transition-colors">
                      {tree.popularName}
                    </h2>
                    {tree.displayNumber !== null && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        #{tree.displayNumber}
                      </span>
                    )}
                  </div>
                  <p className="font-serif italic text-xs text-stone-600 dark:text-stone-400 truncate mt-0.5">
                    {tree.scientificNameSuggested}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="field-badge bg-[#ece6d6] dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {tree.family}
                    </span>
                    <span className="text-[9px] text-stone-400">·</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: groupConfig?.color || '#10b981' }}
                      />
                      {groupConfig?.name || tree.group}
                    </span>
                  </div>
                </div>

                {/* Match & Arrow */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {tree.plantnet?.score && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
                      <Sparkles className="w-3 h-3" />
                      {(tree.plantnet.score * 100).toFixed(0)}%
                    </span>
                  )}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-100 dark:bg-white/10 group-hover:bg-[#d6a35b] group-hover:text-[#0b211d] text-stone-400 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
