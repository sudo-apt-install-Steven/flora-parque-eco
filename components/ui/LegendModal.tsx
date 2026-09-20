'use client';

import React, { useEffect } from 'react';
import { X, Trees, MapPin, Info, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { PARK_CONFIG } from '@/lib/park-config';

interface LegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegendModal: React.FC<LegendModalProps> = ({ isOpen, onClose }) => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legend-title"
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
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legend-title" className="font-serif text-lg font-bold text-[#0b211d] dark:text-[#f8f6ef]">
                Legenda & Guia do Inventário
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {PARK_CONFIG.name} — {PARK_CONFIG.institution}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela de legenda"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto space-y-5 text-sm">
          {/* Grupos de Coleta Acadêmica */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-emerald-600" />
              Equipes de Coleta (Grupos de Campo)
            </h3>
            <div className="grid gap-2">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-emerald-900 dark:text-emerald-200">Grupo A</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Margem esquerda do lago — Setor Norte</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <span className="w-3 h-3 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-blue-900 dark:text-blue-200">Grupo B</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Margem esquerda do lago — Setor Sul</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <span className="w-3 h-3 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-amber-900 dark:text-amber-200">Grupo C</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Margem direita do lago — Trilha Principal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Camadas do Mapa */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Camadas Cartográficas
            </h3>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Satélite:</strong> Imagem aérea real. Suporta acoplamento de imagem raster ortomosaico de alta definição capturada por drone.
              </p>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Planta:</strong> Camada vetorial geométrica. Inclui lago, ponte, caminhos e a estrutura atualizada do <span className="text-pink-600 font-semibold">playground infantil</span>.
              </p>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Exploração:</strong> Cartografia estilizada de expedição botânica com curvas de nível, zonas de mata ciliar e pontos de interesse (POIs).
              </p>
            </div>
          </div>

          {/* PlantNet & Metodologia Científica */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Identificação Assistida (PlantNet AI)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              As sugestões taxonômicas fornecidas pelo PlantNet são estimativas probabilísticas computacionais e não constituem classificação definitiva até a conferência presencial por botânicos e pesquisadores do IFRO.
            </p>
          </div>

          {/* Numeração de Placas */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Numeração Física das Árvores
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              O número visível das placas físicas (<code className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">displayNumber</code>) está em processo de fixação em campo e aparecerá no catálogo conforme a colocação das placas. O sistema utiliza identificadores estáveis únicos.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white/40 dark:bg-black/20 border-t border-stone-200/80 dark:border-stone-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0b211d] hover:bg-[#183d35] text-[#f4f1e8] text-xs font-semibold shadow-sm transition-all focus:outline-none"
          >
            Entendido, Voltar ao Mapa
          </button>
        </div>
      </div>
    </div>
  );
};
