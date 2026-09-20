'use client';

import React from 'react';
import {
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Share2,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Tree } from '@/lib/tree-schema';
import { TreeGallery } from '@/components/tree/TreeGallery';
import { PARK_CONFIG } from '@/lib/park-config';

interface TreeDetailProps {
  tree: Tree;
  onClose?: () => void;
}

const CONFIDENCE_BADGES: Record<string, { label: string; color: string }> = {
  alta: { label: 'Confiança Alta', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300' },
  media: { label: 'Confiança Média', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300' },
  baixa: { label: 'Confiança Baixa', color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300' },
  indeterminada: { label: 'Indeterminada', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300' }
};

const VERIFICATION_BADGES: Record<string, { label: string; icon: React.ReactNode }> = {
  verificado: { label: 'Verificado em Campo', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
  em_analise: { label: 'Em Análise Botânica', icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> },
  identificacao_preliminar: { label: 'Identificação Preliminar', icon: <Sparkles className="w-3.5 h-3.5 text-blue-500" /> },
  pendente: { label: 'Pendente de Verificação', icon: <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> },
  rejeitado: { label: 'Rejeitado / Recoletar', icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" /> }
};

export const TreeDetail: React.FC<TreeDetailProps> = ({ tree, onClose }) => {
  const groupInfo = PARK_CONFIG.fieldGroups[tree.group];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${tree.popularName} — Inventário Arbóreo`,
        text: `Espécime ${tree.scientificNameSuggested} no Parque Ecológico de Vilhena (IFRO).`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100">
      {/* Galeria de Fotos */}
      <TreeGallery
        primaryPhoto={tree.primaryPhoto}
        gallery={tree.gallery}
        treeName={tree.popularName}
      />

      {/* Identificação Principal */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            {tree.family}
          </span>
          <button
            onClick={handleShare}
            aria-label="Compartilhar espécime"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
          {tree.popularName}
        </h1>

        <div className="text-sm font-semibold italic text-slate-600 dark:text-slate-300 mt-0.5">
          {tree.scientificNameSuggested}
        </div>

        {/* Badges de Status e Confiança */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
              CONFIDENCE_BADGES[tree.confidence]?.color || 'bg-slate-100 text-slate-700'
            }`}
          >
            {CONFIDENCE_BADGES[tree.confidence]?.label || tree.confidence}
          </span>

          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            {VERIFICATION_BADGES[tree.verificationStatus]?.icon}
            {VERIFICATION_BADGES[tree.verificationStatus]?.label}
          </span>
        </div>
      </div>

      {/* Card PlantNet — Identificação Assistida */}
      {tree.plantnet && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-500/5 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Identificação Assistida pelo PlantNet
              </span>
            </div>
            {tree.plantnet.score && (
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                {(tree.plantnet.score * 100).toFixed(0)}% de match
              </span>
            )}
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Taxon sugerido:</span>{' '}
            <em className="font-medium">{tree.plantnet.taxon || 'Não informado'}</em>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Metodologia: análise de imagem botânica</span>
            {tree.plantnet.url && (
              <a
                href={tree.plantnet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold"
              >
                Conferir no PlantNet <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Grupo e Localização */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Grupo de Campo */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Equipe Acadêmica
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
            {groupInfo.name}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {groupInfo.locationDescription}
          </div>
        </div>

        {/* Coordenadas & Precisão */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Geolocalização
          </div>
          {tree.latitude !== null && tree.longitude !== null ? (
            <>
              <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {tree.latitude.toFixed(5)}, {tree.longitude.toFixed(5)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Precisão GPS/EXIF: ±{tree.locationAccuracy ?? '?'}m
              </div>
            </>
          ) : (
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              Aguardando georreferenciamento
            </div>
          )}
        </div>
      </div>

      {/* Placa Física & Código Interno */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Placa Física (QR Code):</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {tree.displayNumber !== null ? `#${tree.displayNumber}` : 'Plaqueta em implantação'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">ID Estável do Registro:</span>
          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{tree.id}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Data da Coleta:</span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400">
            {new Date(tree.collectedAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Notas de Campo */}
      {tree.notes && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Anotações de Campo
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {tree.notes}
          </p>
        </div>
      )}

      {/* Tag de Mock Acadêmico */}
      {tree.isMock && (
        <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 italic">
          * Espécime mock de teste para validação da fundação técnica da aplicação.
        </div>
      )}
    </div>
  );
};
