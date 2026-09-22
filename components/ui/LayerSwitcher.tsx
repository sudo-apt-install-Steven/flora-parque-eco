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
      className="layer-switcher-in absolute bottom-24 md:bottom-8 left-4 md:left-8 z-40 w-48 md:w-56 p-3 md:p-4 rounded-2xl bg-[#f8f6ef] dark:bg-[#0b211d] border border-[#102a26]/14 dark:border-white/12 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(16,42,38,0.22)] select-none"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#102a26] dark:text-[#f8f6ef]">
          <Layers3 className="w-3.5 h-3.5 text-[#c4a06a]" />
          Camadas do Mapa
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Recolher seletor' : 'Expandir seletor'}
          className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
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
                    'group flex items-center gap-2.5 p-1.5 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#c4a06a]/60 active:scale-[0.97]',
                    isSelected
                      ? 'bg-[#102a26] text-[#f8f6ef] shadow-[0_6px_14px_rgba(16,42,38,0.18)] dark:bg-white/12'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-[#ece6d6] dark:hover:bg-white/5'
                  )}
                >
                  <span
                    className={cn(
                      'layer-chip-preview w-7 h-5 rounded-md border flex-shrink-0',
                      mode.id === 'planta' && 'bg-[#ded9c8] border-stone-400/40 bg-[linear-gradient(#9aa394_1px,transparent_1px),linear-gradient(90deg,#9aa394_1px,transparent_1px)] [background-size:6px_6px]',
                      mode.id === 'satellite' && 'bg-[#4a5c48] border-stone-500/40',
                      mode.id === 'exploration' && 'bg-[#cfc3a0] border-amber-800/25 bg-[repeating-radial-gradient(circle_at_30%_40%,transparent_0_4px,rgba(90,74,48,0.28)_4px_5px)]'
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold capitalize leading-tight">
                      {mode.name}
                    </div>
                    <div className={cn(
                      'text-[9px] leading-tight truncate',
                      isSelected ? 'text-[#d8b57d]' : 'text-stone-500 dark:text-stone-400'
                    )}>
                      {mode.badge}
                    </div>
                  </div>

                  <span className={cn(
                    'text-[10px] font-bold mr-1 transition-opacity duration-200',
                    isSelected ? 'text-[#c4a06a] opacity-100' : 'text-stone-400 opacity-50'
                  )}>
                    {isSelected ? '●' : '○'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
