'use client';

import React from 'react';
import {
  Leaf,
  Map as MapIcon,
  Trees,
  SlidersHorizontal,
  Compass,
  Search,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { PARK_CONFIG } from '@/lib/park-config';
import { cn } from '@/lib/utils';

export type NavSection = 'mapa' | 'especies' | 'dados' | 'projeto';

interface AppHeaderProps {
  activeNav: NavSection;
  onNavChange: (nav: NavSection) => void;
  onOpenSearch: () => void;
  onOpenLegend: () => void;
  onOpenStats: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeNav,
  onNavChange,
  onOpenSearch,
  onOpenLegend,
  onOpenStats
}) => {
  return (
    <header
      role="banner"
      className="relative z-30 flex items-center justify-between h-16 md:h-20 px-4 md:px-8 bg-[#0b211d] text-[#f4f1e8] shadow-xl border-b border-emerald-950/40 select-none"
    >
      {/* 1. Brand Lockup */}
      <div
        onClick={() => onNavChange('mapa')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#c4a06a] text-[#0b211d] flex items-center justify-center shadow-[0_8px_16px_rgba(6,21,17,0.28)] transform group-hover:scale-105 transition-transform duration-200">
          <Leaf className="w-5 h-5 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#d6a35b] leading-tight">
            Inventário Arbóreo Digital
          </span>
          <span className="text-xs md:text-sm font-serif font-bold tracking-[0.12em] text-[#f8f6ef] leading-tight mt-0.5">
            PARQUE ECOLÓGICO
          </span>
          <span className="hidden sm:inline-block text-[10px] text-[#9bb0a6] leading-tight mt-0.5">
            Marechal Cândido Rondon · {PARK_CONFIG.municipality} / {PARK_CONFIG.institution}
          </span>
        </div>
      </div>

      {/* 2. Desktop Navigation Pills */}
      <nav
        aria-label="Navegação Principal do Inventário"
        className="hidden md:flex items-center gap-1.5 p-1 bg-white/[0.07] border border-white/[0.14] rounded-full backdrop-blur-xl shadow-inner"
      >
        <button
          onClick={() => onNavChange('mapa')}
          className={cn(
            'flex items-center gap-2 h-9 px-4 rounded-full text-xs font-medium transition-all duration-200',
            activeNav === 'mapa'
              ? 'bg-[#c4a06a] text-[#0b211d] font-bold shadow-md'
              : 'text-[#a9bbb0] hover:text-[#f8f6ef] hover:bg-white/[0.08]'
          )}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Mapa</span>
        </button>

        <button
          onClick={() => onNavChange('especies')}
          className={cn(
            'flex items-center gap-2 h-9 px-4 rounded-full text-xs font-medium transition-all duration-200',
            activeNav === 'especies'
              ? 'bg-[#c4a06a] text-[#0b211d] font-bold shadow-md'
              : 'text-[#a9bbb0] hover:text-[#f8f6ef] hover:bg-white/[0.08]'
          )}
        >
          <Trees className="w-3.5 h-3.5" />
          <span>Espécies</span>
        </button>

        <button
          onClick={() => onNavChange('dados')}
          className={cn(
            'flex items-center gap-2 h-9 px-4 rounded-full text-xs font-medium transition-all duration-200',
            activeNav === 'dados'
              ? 'bg-[#c4a06a] text-[#0b211d] font-bold shadow-md'
              : 'text-[#a9bbb0] hover:text-[#f8f6ef] hover:bg-white/[0.08]'
          )}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Métricas</span>
        </button>

        <button
          onClick={() => onNavChange('projeto')}
          className={cn(
            'flex items-center gap-2 h-9 px-4 rounded-full text-xs font-medium transition-all duration-200',
            activeNav === 'projeto'
              ? 'bg-[#c4a06a] text-[#0b211d] font-bold shadow-md'
              : 'text-[#a9bbb0] hover:text-[#f8f6ef] hover:bg-white/[0.08]'
          )}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Projeto</span>
        </button>
      </nav>

      {/* 3. Action Triggers */}
      <div className="flex items-center gap-2">
        {/* Search Trigger Button with ⌘ K */}
        <button
          onClick={onOpenSearch}
          aria-label="Abrir busca de espécies (Atalho: Command + K)"
          className="flex items-center gap-2.5 h-9 md:h-10 px-3 md:px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.18] hover:border-[#d6a35b]/70 text-[#e6ece1] transition-all duration-200 shadow-sm"
        >
          <Search className="w-4 h-4 text-[#d6a35b]" />
          <span className="hidden sm:inline text-xs font-medium text-[#d8e1d7]">
            Buscar árvore...
          </span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-medium rounded border border-white/20 text-[#a9b9ae] bg-black/20">
            ⌘ K
          </kbd>
        </button>

        {/* Legend / Methodology Modal Trigger */}
        <button
          onClick={onOpenLegend}
          title="Legenda e Metodologia"
          aria-label="Abrir legenda e informações do projeto"
          className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.18] hover:border-[#d6a35b]/70 text-[#e6ece1] transition-all duration-200"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
