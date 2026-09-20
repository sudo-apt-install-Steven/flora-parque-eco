'use client';

import React from 'react';
import { Layers, Compass, Image as ImageIcon, Map as MapIcon } from 'lucide-react';
import { PARK_CONFIG } from '@/lib/park-config';

interface LayerSwitcherProps {
  currentMode: 'satellite' | 'planta' | 'exploration';
  onModeChange: (mode: 'satellite' | 'planta' | 'exploration') => void;
}

export const LayerSwitcher: React.FC<LayerSwitcherProps> = ({ currentMode, onModeChange }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'satellite':
        return <ImageIcon className="w-4 h-4" aria-hidden="true" />;
      case 'planta':
        return <MapIcon className="w-4 h-4" aria-hidden="true" />;
      case 'exploration':
        return <Compass className="w-4 h-4" aria-hidden="true" />;
      default:
        return <Layers className="w-4 h-4" aria-hidden="true" />;
    }
  };

  return (
    <div
      role="region"
      aria-label="Controle de Camadas do Mapa"
      className="absolute top-4 right-4 z-20 flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-slate-200/80 dark:border-slate-800"
    >
      <div className="flex gap-1" role="radiogroup" aria-label="Modo de Visualização">
        {PARK_CONFIG.modes.map((mode) => {
          const isSelected = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onModeChange(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 select-none min-h-[38px] ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={mode.description}
            >
              {getIcon(mode.id)}
              <span>{mode.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
