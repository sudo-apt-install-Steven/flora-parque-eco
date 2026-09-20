'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers3 } from 'lucide-react';
import { PARK_CONFIG } from '@/lib/park-config';
import { cn } from '@/lib/utils';

interface LayerSwitcherProps {
  currentMode: 'satellite' | 'planta' | 'exploration';
  onModeChange: (mode: 'satellite' | 'planta' | 'exploration') => void;
}

export const LayerSwitcher: React.FC<LayerSwitcherProps> = ({
  currentMode,
  onModeChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      role="region"
      aria-label="Seletor de Camadas do Mapa"
      className="absolute bottom-20 md:bottom-8 left-4 md:left-8 z-20 w-48 md:w-56 p-3 md:p-4 rounded-2xl bg-[#f8f6ef]/95 dark:bg-[#0b211d]/95 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-2xl transition-all duration-200 select-none"
    >
      {/* Heading com toggle */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#102a26] dark:text-[#f8f6ef]">
          <Layers3 className="w-3.5 h-3.5 text-[#d6a35b]" />
          Camadas do Mapa
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Recolher seletor' : 'Expandir seletor'}
          className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Layer Options */}
      {isExpanded && (
        <div className="flex flex-col gap-2 mt-3" role="radiogroup" aria-label="Modos Cartográficos">
          {PARK_CONFIG.modes.map((mode) => {
            const isSelected = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                role="radio"
                aria-checked={isSelected}
                title={mode.description}
                onClick={() => onModeChange(mode.id)}
                className={cn(
                  'group flex items-center gap-2.5 p-1.5 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d6a35b]/60 active:scale-[0.98]',
                  isSelected
                    ? 'bg-[#102a26] text-[#f8f6ef] shadow-md shadow-emerald-950/20 dark:bg-white/15'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-white/5 hover:translate-x-0.5'
                )}
              >
                {/* Visual Preview Swatch */}
                <span
                  className={cn(
                    'w-7 h-5 rounded-md border flex-shrink-0 shadow-inner',
                    mode.id === 'planta' && 'bg-[#deddd0] border-stone-400/50 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:6px_6px]',
                    mode.id === 'satellite' && 'bg-gradient-to-br from-[#4b6a48] via-[#2f4f34] to-[#607d58] border-stone-500/50',
                    mode.id === 'exploration' && 'bg-gradient-to-br from-[#d4c18f] via-[#7e9b72] to-[#3a6855] border-amber-700/30'
                  )}
                />

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold capitalize leading-tight">
                    {mode.name}
                  </div>
                  <div className={cn(
                    'text-[9px] leading-tight truncate',
                    isSelected ? 'text-amber-300/90' : 'text-stone-500 dark:text-stone-400'
                  )}>
                    {mode.badge}
                  </div>
                </div>

                {/* Radio Indicator */}
                <span className={cn(
                  'text-xs font-bold mr-1',
                  isSelected ? 'text-[#d6a35b]' : 'text-stone-400 opacity-60'
                )}>
                  {isSelected ? '●' : '○'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
