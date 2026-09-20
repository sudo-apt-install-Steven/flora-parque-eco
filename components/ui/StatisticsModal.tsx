'use client';

import React, { useEffect } from 'react';
import { X, BarChart3, Trees, Sparkles, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Tree } from '@/lib/tree-schema';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trees: Tree[];
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, onClose, trees }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const total = trees.length;
  const groupA = trees.filter((t) => t.group === 'groupA').length;
  const groupB = trees.filter((t) => t.group === 'groupB').length;
  const groupC = trees.filter((t) => t.group === 'groupC').length;

  const verified = trees.filter((t) => t.verificationStatus === 'verificado').length;
  const inAnalysis = trees.filter((t) => t.verificationStatus === 'em_analise' || t.verificationStatus === 'identificacao_preliminar').length;
  const pending = trees.filter((t) => t.verificationStatus === 'pendente').length;

  const families = Array.from(new Set(trees.map((t) => t.family))).filter(Boolean);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#f8f6ef] dark:bg-[#0f2621] rounded-3xl shadow-2xl border border-stone-300 dark:border-white/10 overflow-hidden max-h-[85vh] flex flex-col animate-panel-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 dark:border-stone-800 bg-white/50 dark:bg-black/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0b211d] text-[#d6a35b]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="stats-title" className="font-serif text-lg font-bold text-[#0b211d] dark:text-[#f8f6ef]">
                Estatísticas do Inventário
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Métricas e Consolidação Acadêmica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela de estatísticas"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-sm">
          {/* Card Principal: Total de Espécimes */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Total de Árvores Registradas
              </div>
              <div className="text-3xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5">
                {total}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {families.length} famílias botânicas mapeadas
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md">
              <Trees className="w-7 h-7" />
            </div>
          </div>

          {/* Distribuição por Grupo de Campo */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Distribuição por Grupo de Levantamento
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{groupA}</div>
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Grupo A</div>
                <div className="text-[10px] text-slate-400">Margem Esq. N</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{groupB}</div>
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Grupo B</div>
                <div className="text-[10px] text-slate-400">Margem Esq. S</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{groupC}</div>
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Grupo C</div>
                <div className="text-[10px] text-slate-400">Margem Dir.</div>
              </div>
            </div>
          </div>

          {/* Status de Validação */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Status de Verificação Científica
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Verificado em Campo</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{verified}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Em Análise / Preliminar</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{inAnalysis}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Pendente de Avaliação</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{pending}</span>
              </div>
            </div>
          </div>

          {/* Aviso Acadêmico de Mock Data */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p>
              Ambiente de validação da fundação técnica com dados mock identificados. As métricas serão atualizadas automaticamente conforme a importação dos dados reais do levantamento de campo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white/40 dark:bg-black/20 border-t border-stone-200/80 dark:border-stone-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0b211d] hover:bg-[#183d35] text-[#f4f1e8] text-xs font-semibold shadow-sm transition-all focus:outline-none"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
