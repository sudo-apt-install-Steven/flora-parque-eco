'use client';

import React from 'react';
import { Map as MapIcon, Search, Trees, BarChart3, Compass } from 'lucide-react';
import { NavSection } from '@/components/ui/AppHeader';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeNav: NavSection;
  onNavChange: (nav: NavSection) => void;
  onOpenSearch: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeNav,
  onNavChange,
  onOpenSearch
}) => {
  return (
    <div className="mobile-nav-shell md:hidden fixed bottom-3 inset-x-3 z-30">
      <nav
        aria-label="Navegação móvel inferior"
        className="flex items-center justify-around h-16 px-2 bg-[#0b211d]/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl text-[#f4f1e8]"
      >
        <button
          onClick={() => onNavChange('mapa')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl text-[10px] font-medium transition-all duration-200',
            activeNav === 'mapa'
              ? 'bg-[#d6a35b] text-[#0b211d] font-bold shadow-md scale-105'
              : 'text-[#9bb0a6] hover:text-[#f8f6ef] hover:-translate-y-0.5'
          )}
        >
          <MapIcon className="w-4 h-4" />
          <span>Mapa</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl text-[10px] font-medium text-[#9bb0a6] hover:text-[#f8f6ef] hover:-translate-y-0.5 transition-all duration-200"
        >
          <Search className="w-4 h-4" />
          <span>Buscar</span>
        </button>

        <button
          onClick={() => onNavChange('especies')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl text-[10px] font-medium transition-all duration-200',
            activeNav === 'especies'
              ? 'bg-[#d6a35b] text-[#0b211d] font-bold shadow-md scale-105'
              : 'text-[#9bb0a6] hover:text-[#f8f6ef] hover:-translate-y-0.5'
          )}
        >
          <Trees className="w-4 h-4" />
          <span>Espécies</span>
        </button>

        <button
          onClick={() => onNavChange('dados')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl text-[10px] font-medium transition-all duration-200',
            activeNav === 'dados'
              ? 'bg-[#d6a35b] text-[#0b211d] font-bold shadow-md scale-105'
              : 'text-[#9bb0a6] hover:text-[#f8f6ef] hover:-translate-y-0.5'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Métricas</span>
        </button>

        <button
          onClick={() => onNavChange('projeto')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl text-[10px] font-medium transition-all duration-200',
            activeNav === 'projeto'
              ? 'bg-[#d6a35b] text-[#0b211d] font-bold shadow-md scale-105'
              : 'text-[#9bb0a6] hover:text-[#f8f6ef] hover:-translate-y-0.5'
          )}
        >
          <Compass className="w-4 h-4" />
          <span>Projeto</span>
        </button>
      </nav>
    </div>
  );
};
