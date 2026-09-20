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
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="stats-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Estatísticas do Inventário
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Métricas e Consolidação Acadêmica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela de estatísticas"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all focus:outline-none"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
