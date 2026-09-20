'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DynamicMap } from '@/components/map/DynamicMap';
import { LayerSwitcher } from '@/components/ui/LayerSwitcher';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { TreePanel } from '@/components/tree/TreePanel';
import { LegendModal } from '@/components/ui/LegendModal';
import { StatisticsModal } from '@/components/ui/StatisticsModal';
import { getValidatedTrees, searchTrees, getTreeById } from '@/lib/trees';
import { Tree, FieldGroup } from '@/lib/tree-schema';

function ParkInventoryApp() {
  const searchParams = useSearchParams();
  const allTrees = useMemo(() => getValidatedTrees(), []);

  // Modos de mapa: 'satellite' | 'planta' | 'exploration'
  const [currentMode, setCurrentMode] = useState<'satellite' | 'planta' | 'exploration'>('planta');

  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<FieldGroup | 'all'>('all');

  // Seleção ativa de espécime arbóreo
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  // Modais de suporte
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Suporte a acesso direto via QR Code (ex: ?tree=mock-tree-001 ou ?id=mock-tree-001)
  useEffect(() => {
    const treeParam = searchParams.get('tree') || searchParams.get('id');
    if (treeParam) {
      const found = getTreeById(treeParam);
      if (found) {
        setSelectedTree(found);
      }
    }
  }, [searchParams]);

  // Lista filtrada de árvores
  const filteredTrees = useMemo(() => {
    return searchTrees(searchQuery, selectedGroup);
  }, [searchQuery, selectedGroup]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. MAPA DOMINANTE EM TELA CHEIA */}
      <div className="absolute inset-0 z-0">
        <DynamicMap
          currentMode={currentMode}
          trees={filteredTrees}
          selectedTree={selectedTree}
          onSelectTree={setSelectedTree}
        />
      </div>

      {/* 2. BARRA DE PESQUISA, FILTROS E AÇÕES (SUPERIOR ESQUERDA) */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        resultCount={filteredTrees.length}
        totalCount={allTrees.length}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenLegend={() => setIsLegendOpen(true)}
      />

      {/* 3. SELETOR DE MODOS DE MAPA (SUPERIOR DIREITA) */}
      <LayerSwitcher
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />

      {/* 4. PAINEL DE ESPÉCIME (BOTTOM SHEET MOBILE & SIDEBAR DESKTOP) */}
      <TreePanel
        selectedTree={selectedTree}
        onClose={() => setSelectedTree(null)}
        filteredTrees={filteredTrees}
        onSelectTree={setSelectedTree}
      />

      {/* 5. MODAL DE LEGENDA & GUIA ACADÊMICO */}
      <LegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />

      {/* 6. MODAL DE ESTATÍSTICAS E MÉTRICAS */}
      <StatisticsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        trees={allTrees}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-slate-950" />}>
      <ParkInventoryApp />
    </Suspense>
  );
}
