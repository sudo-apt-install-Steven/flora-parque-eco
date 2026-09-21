'use client';

import React, { useState, useEffect } from 'react';
import { Tree, FieldGroup } from '@/lib/tree-schema';
import { MapContainer } from '@/components/map/MapContainer';

export interface MapContainerProps {
  currentMode: 'satellite' | 'planta' | 'exploration';
  trees: Tree[];
  selectedTree: Tree | null;
  onSelectTree: (tree: Tree | null) => void;
  focusKey?: number;
  selectedGroup?: FieldGroup | 'all';
  onSelectGroup?: (group: FieldGroup | 'all') => void;
}

export function DynamicMap(props: MapContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#e7e1d0] text-[#102a26]">
        <div className="w-5 h-8 animate-spin rounded-full border-2 border-[#c4a06a]/30 border-t-[#c4a06a] mb-3" />
        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#5c4a2e]">
          Preparando carta do parque
        </span>
        <span className="text-[11px] text-stone-500 mt-1">
          IFRO Campus Vilhena — Rondônia
        </span>
        <div className="mt-6 grid grid-cols-3 gap-2 w-48">
          <div className="h-8 rounded-md ui-skeleton" />
          <div className="h-8 rounded-md ui-skeleton" />
          <div className="h-8 rounded-md ui-skeleton" />
        </div>
      </div>
    );
  }

  return <MapContainer {...props} />;
}
