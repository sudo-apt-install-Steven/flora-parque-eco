'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Sparkles,
  ExternalLink,
  Share2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Leaf
} from 'lucide-react';
import { Tree } from '@/lib/tree-schema';
import { TreeGallery } from '@/components/tree/TreeGallery';
import { PARK_CONFIG } from '@/lib/park-config';
import { cn } from '@/lib/utils';

interface TreeDetailProps {
  tree: Tree;
  onClose?: () => void;
}

const CONFIDENCE_STYLES: Record<string, { label: string; dot: string; badge: string }> = {
  alta: {
    label: 'Confiança Alta',
    dot: 'bg-[#4d6556]',
    badge: 'bg-[#edf1e7] text-[#24352e] dark:bg-[#102a26] dark:text-[#cfe0d6] border-[#4d6556]/25 dark:border-white/10'
  },
  media: {
    label: 'Confiança Média',
    dot: 'bg-[#c4a06a]',
    badge: 'bg-[#f3efe4] text-[#5c4a2e] dark:bg-[#1b2c26] dark:text-[#d8b57d] border-[#c4a06a]/35 dark:border-white/10'
  },
  baixa: {
    label: 'Confiança Baixa',
    dot: 'bg-[#8a5a4a]',
    badge: 'bg-[#f3e8e4] text-[#5c3a32] dark:bg-[#2a1c1a] dark:text-[#e0c4bc] border-[#8a5a4a]/30 dark:border-white/10'
  },
  indeterminada: {
    label: 'Indeterminada',
    dot: 'bg-stone-400',
    badge: 'bg-[#ece6d6] text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-300/80 dark:border-stone-700'
  }
};

const VERIFICATION_BADGES: Record<string, { label: string; icon: React.ReactNode }> = {
  verificado: { label: 'Verificado em Campo', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
  em_analise: { label: 'Em Análise Botânica', icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> },
  identificacao_preliminar: { label: 'Identificação Preliminar', icon: <Sparkles className="w-3.5 h-3.5 text-blue-500" /> },
  pendente: { label: 'Pendente de Validação', icon: <AlertCircle className="w-3.5 h-3.5 text-stone-400" /> },
  rejeitado: { label: 'Rejeitado / Recoletar', icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> }
};

export const TreeDetail: React.FC<TreeDetailProps> = ({
  tree,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const groupInfo = PARK_CONFIG.fieldGroups[tree.group];
  const conf = CONFIDENCE_STYLES[tree.confidence] || CONFIDENCE_STYLES.indeterminada;
  const verif = VERIFICATION_BADGES[tree.verificationStatus] || VERIFICATION_BADGES.pendente;

  // Cálculo da porcentagem de confiança do PlantNet
  const plantnetScore = tree.plantnet?.score ?? (tree.confidence === 'alta' ? 0.92 : tree.confidence === 'media' ? 0.68 : 0.35);
  const scorePercent = Math.round(Math.min(Math.max(plantnetScore, 0), 1) * 100);

  const handleShare = () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/tree/${encodeURIComponent(tree.id)}`
      : '';

    if (navigator.share) {
      navigator.share({
        title: `${tree.popularName} — Inventário Arbóreo`,
        text: `Espécime ${tree.scientificNameSuggested} no Parque Ecológico de Vilhena (IFRO).`,
        url: url
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-5 text-[#102a26] dark:text-[#f8f6ef]">
      {/* 1. HIERARQUIA 1: Foto Principal Dominante */}
      <TreeGallery
        primaryPhoto={tree.primaryPhoto}
        gallery={tree.gallery}
        treeName={tree.popularName}
      />

      {/* 2. HIERARQUIA 2: Cabeçalho Editorial — Nome Científico e Popular */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d6a35b]">
              Ficha de Campo
            </span>
            <span className="text-[10px] text-stone-400">·</span>
            <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400">
              {tree.displayNumber !== null ? `#${tree.displayNumber}` : '#—'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {copied && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                Link copiado!
              </span>
            )}
            <button
              onClick={handleShare}
              aria-label="Compartilhar espécime com link direto"
              title="Compartilhar link deste espécime"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nome Popular */}
        <h1 className="font-serif text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0b211d] dark:text-[#f8f6ef] mt-1 leading-tight">
          {tree.popularName}
        </h1>

        {/* Nome Científico em Destaque Itálico */}
        <p className="font-serif italic text-base sm:text-lg text-stone-600 dark:text-[#9bb0a6] mt-0.5">
          {tree.scientificNameSuggested}
        </p>

        {/* Badges de Confiança e Verificação */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className={cn('field-badge', conf.badge)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', conf.dot)} />
            {conf.label}
          </span>

          <span className="field-badge bg-[#ece6d6] dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            {verif.icon}
            {verif.label}
          </span>

          <span className="field-badge bg-[#f3efe4] dark:bg-[#1b2c26] text-[#5c4a2e] dark:text-[#d8b57d]">
            {tree.family}
          </span>

          <span className="field-badge bg-[#edf1e7] dark:bg-[#102a26] text-[#24352e] dark:text-[#cfe0d6]">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: groupInfo?.color || '#4d6556' }}
            />
            {groupInfo?.name || tree.group}
          </span>
        </div>
      </div>

      {/* 3. HIERARQUIA 3: Barra Visual Indicando a Confiança (Score) do PlantNet */}
      <div className="p-4 rounded-2xl bg-[#edf1e7] dark:bg-[#102a26]/80 border border-[#102a26]/10 dark:border-white/10 shadow-[0_8px_18px_rgba(16,42,38,0.06)] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-2 text-[#0b211d] dark:text-[#f8f6ef]">
            <div className="w-5 h-5 rounded-full bg-[#4d6556] text-[#f8f6ef] flex items-center justify-center">
              <Leaf className="w-3 h-3" />
            </div>
            Confiança Botânica (PlantNet)
          </span>
          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-[#c4a06a]/20 text-[#0b211d] dark:text-[#d8b57d]">
            {scorePercent}% de confiança
          </span>
        </div>

        <div className="plantnet-track w-full h-2 rounded-full bg-[#d9d4c8] dark:bg-stone-800">
          <div
            className="plantnet-fill h-full rounded-full bg-[#4d6556]"
            style={{ width: `${Math.max(scorePercent, 5)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400 pt-0.5">
          <span>
            Taxon: <em className="font-serif italic text-[#0b211d] dark:text-[#f8f6ef] font-medium">{tree.plantnet?.taxon || tree.scientificNameSuggested}</em>
          </span>
          {tree.plantnet?.url && (
            <a
              href={tree.plantnet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#a07232] dark:text-[#d6a35b] hover:underline"
            >
              PlantNet <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* 4. HIERARQUIA 4: Galeria Fotográfica em Carrossel Deslizante (next/image) */}
      {/* 5. Grade de Fatos Botânicos & Localização */}
      <dl className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#eef0e5] dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10 text-xs">
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Família Botânica
          </dt>
          <dd className="font-bold text-[#0b211d] dark:text-[#f8f6ef] mt-0.5">
            {tree.family}
          </dd>
        </div>

        <div>
          <dt className="text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Equipe de Coleta
          </dt>
          <dd className="font-bold text-[#0b211d] dark:text-[#f8f6ef] mt-0.5 flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: groupInfo?.color || '#10b981' }}
            />
            {groupInfo?.name || tree.group}
          </dd>
        </div>

        <div className="col-span-2 pt-2 border-t border-stone-200 dark:border-white/10 flex items-center justify-between">
          <div>
            <dt className="text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Coordenadas de Campo
            </dt>
            <dd className="font-mono text-[11px] text-stone-700 dark:text-stone-300 mt-0.5">
              {tree.latitude !== null && tree.longitude !== null
                ? `${tree.latitude.toFixed(5)}, ${tree.longitude.toFixed(5)}`
                : 'Aguardando georreferenciamento'}
            </dd>
          </div>
          {tree.locationAccuracy && (
            <span className="text-[10px] text-stone-500">
              Precisão: ±{tree.locationAccuracy}m
            </span>
          )}
        </div>
      </dl>

      {/* 6. Anotações de Campo */}
      {tree.notes && (
        <div className="p-3.5 rounded-2xl bg-[#eef0e5] dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Anotações de Campo
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            {tree.notes}
          </p>
        </div>
      )}

      {/* Tag de Mock Acadêmico */}
      {tree.isMock && (
        <div className="text-[10px] text-center text-stone-400 dark:text-stone-500 italic pt-1">
          * Espécime de calibração para homologação da infraestrutura técnica digital.
        </div>
      )}

    </div>
  );
};
