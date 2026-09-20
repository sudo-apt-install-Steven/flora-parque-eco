'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Tree } from '@/lib/tree-schema';

interface MapContainerProps {
  currentMode: 'satellite' | 'planta' | 'exploration';
  trees: Tree[];
  selectedTree: Tree | null;
  onSelectTree: (tree: Tree | null) => void;
}

export const DynamicMap = dynamic<MapContainerProps>(
  () => import('@/components/map/MapContainer').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
          Carregando Mapa do Parque Ecológico...
        </span>
        <span className="text-[11px] text-slate-400 mt-1">
          IFRO Campus Vilhena — Rondônia
        </span>
      </div>
    )
  }
);
