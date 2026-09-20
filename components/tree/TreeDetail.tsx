'use client';

import React from 'react';
import {
  MapPin,
  Sparkles,
  ExternalLink,
  Share2,
  CheckCircle2,
  AlertCircle,
  FileText,
  LocateFixed,
  Leaf
} from 'lucide-react';
import { Tree } from '@/lib/tree-schema';
import { TreeGallery } from '@/components/tree/TreeGallery';
import { PARK_CONFIG } from '@/lib/park-config';
import { cn } from '@/lib/utils';

interface TreeDetailProps {
  tree: Tree;
  onClose?: () => void;
  onCenterOnMap?: (tree: Tree) => void;
}

const CONFIDENCE_STYLES: Record<string, { label: string; dot: string; badge: string }> = {
  alta: {
    label: 'Confiança Alta',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  media: {
    label: 'Confiança Média',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
  baixa: {
    label: 'Confiança Baixa',
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  },
  indeterminada: {
    label: 'Indeterminada',
    dot: 'bg-stone-400',
    badge: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700'
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
  onClose,
  onCenterOnMap
}) => {
  const [copied, setCopied] = React.useState(false);
  const groupInfo = PARK_CONFIG.fieldGroups[tree.group];
  const conf = CONFIDENCE_STYLES[tree.confidence] || CONFIDENCE_STYLES.indeterminada;
  const verif = VERIFICATION_BADGES[tree.verificationStatus] || VERIFICATION_BADGES.pendente;

  const handleShare = () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?tree=${encodeURIComponent(tree.id)}`
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
      {/* 1. Galeria de Fotos */}
      <TreeGallery
        primaryPhoto={tree.primaryPhoto}
        gallery={tree.gallery}
        treeName={tree.popularName}
      />

      {/* 2. Cabeçalho Editorial com Eyebrow */}
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

        {/* Nome Popular em Fonte Serifada */}
        <h1 className="font-serif text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0b211d] dark:text-[#f8f6ef] mt-1 leading-tight">
          {tree.popularName}
        </h1>

        {/* Nome Científico em Itálico */}
        <p className="font-serif italic text-base text-stone-600 dark:text-[#9bb0a6] mt-0.5">
          {tree.scientificNameSuggested}
        </p>

        {/* Badges de Confiança e Verificação */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border', conf.badge)}>
            <span className={cn('w-2 h-2 rounded-full', conf.dot)} />
            {conf.label}
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {verif.icon}
            {verif.label}
          </span>
        </div>
      </div>

      {/* 3. Grade de Fatos Botânicos & Localização */}
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

      {/* 4. Card PlantNet — Identificação Assistida */}
      {tree.plantnet && (
        <div className="p-4 rounded-2xl bg-[#edf1e7] dark:bg-[#102a26]/50 border-l-4 border-[#d6a35b] border border-stone-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#52775e] text-[#f0f2dc] flex items-center justify-center flex-shrink-0">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#102a26] dark:text-[#f8f6ef]">
                Identificação Assistida pelo PlantNet
              </span>
            </div>
            {typeof tree.plantnet.score === 'number' && tree.plantnet.score > 0 && (
              <span className="text-xs font-bold text-[#0b211d] bg-[#d6a35b]/30 px-2 py-0.5 rounded-md">
                {(tree.plantnet.score * 100).toFixed(0)}% match
              </span>
            )}
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            <span className="font-semibold text-stone-700 dark:text-stone-200">Taxon sugerido:</span>{' '}
            <em className="font-serif italic">{tree.plantnet.taxon || 'Não informado'}</em>.
            Identificação baseada em registro fotográfico e revisão botânica de campo.
          </p>

          {tree.plantnet.url && (
            <div className="mt-2 text-[11px]">
              <a
                href={tree.plantnet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#a07232] dark:text-[#d6a35b] hover:underline"
              >
                Conferir no PlantNet <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* 5. Notas de Campo */}
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

      {/* 6. Botão de Ação: Centralizar no Mapa */}
      {onCenterOnMap && (
        <button
          onClick={() => onCenterOnMap(tree)}
          className="flex items-center justify-center gap-2 w-full h-11 px-4 rounded-xl bg-[#0b211d] hover:bg-[#183d35] text-[#f4f1e8] font-semibold text-xs transition-all duration-200 shadow-md shadow-emerald-950/20"
        >
          <LocateFixed className="w-4 h-4 text-[#d6a35b]" />
          <span>Centralizar este espécime no mapa</span>
        </button>
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
