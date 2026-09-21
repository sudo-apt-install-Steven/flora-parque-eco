'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DynamicMap } from '@/components/map/DynamicMap';
import { AppHeader } from '@/components/ui/AppHeader';
import { MobileNav } from '@/components/ui/MobileNav';
import { LayerSwitcher } from '@/components/ui/LayerSwitcher';
import { MapFieldOverlay } from '@/components/ui/MapFieldOverlay';
import { SearchPopover } from '@/components/ui/SearchPopover';
import { TreePanel } from '@/components/tree/TreePanel';
import { LegendModal } from '@/components/ui/LegendModal';
import { StatisticsModal } from '@/components/ui/StatisticsModal';
import { SpeciesCatalogView } from '@/components/views/SpeciesCatalogView';
import { ProjectAboutView } from '@/components/views/ProjectAboutView';
import {
  useTreeStore,
  useActiveTree,
  useFilteredCatalog,
  NavSection
} from '@/lib/store/tree-store';

export interface ParkInventoryAppProps {
  initialTreeId?: string;
}

export function ParkInventoryApp({ initialTreeId }: ParkInventoryAppProps) {
  const searchParams = useSearchParams();

  // Estado global do catálogo e filtros reativos
  const { allTrees, filteredTrees } = useFilteredCatalog();
  const { selectedTree, selectTree, selectTreeAndFocus } = useActiveTree();

  // Estados de navegação e camadas do MapLibre
  const activeNav = useTreeStore((s) => s.activeNav);
  const setActiveNav = useTreeStore((s) => s.setActiveNav);
  const currentMode = useTreeStore((s) => s.layerMode);
  const setCurrentMode = useTreeStore((s) => s.setLayerMode);

  // Filtros ativos
  const selectedGroup = useTreeStore((s) => s.filters.group ?? 'all');
  const setSelectedGroup = useTreeStore((s) => s.setGroupFilter);
  const focusKey = useTreeStore((s) => s.focusKey);

  // Modais e Popovers
  const isSearchOpen = useTreeStore((s) => s.isSearchOpen);
  const setIsSearchOpen = useTreeStore((s) => s.setSearchOpen);
  const isLegendOpen = useTreeStore((s) => s.isLegendOpen);
  const setIsLegendOpen = useTreeStore((s) => s.setLegendOpen);
  const isStatsOpen = useTreeStore((s) => s.isStatsOpen);
  const setIsStatsOpen = useTreeStore((s) => s.setStatsOpen);

  // QR Code Deep Linking: prioriza initialTreeId da rota /tree/[id] ou parâmetros de busca
  useEffect(() => {
    const targetId = initialTreeId || searchParams.get('tree') || searchParams.get('id');
    if (targetId) {
      setActiveNav('mapa');
      selectTreeAndFocus(targetId);
    }
  }, [initialTreeId, searchParams, selectTreeAndFocus, setActiveNav]);

  // Sincronização dinâmica da barra de endereços (?tree=slug) sem recarregar a página quando em /
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/tree/')) return;

    const url = new URL(window.location.href);
    if (selectedTree) {
      if (url.searchParams.get('tree') !== selectedTree.id) {
        url.searchParams.set('tree', selectedTree.id);
        url.searchParams.delete('id');
        window.history.replaceState(null, '', url.toString());
      }
    } else {
      if (url.searchParams.has('tree') || url.searchParams.has('id')) {
        url.searchParams.delete('tree');
        url.searchParams.delete('id');
        window.history.replaceState(null, '', url.toString());
      }
    }
  }, [selectedTree]);

  // Manipulador de troca de navegação no topo ou barra móvel
  const handleNavChange = (nav: NavSection) => {
    if (nav === 'dados') {
      setIsStatsOpen(true);
    } else {
      setActiveNav(nav);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#0b211d] font-sans select-none">
      {/* 1. TOPO / CABEÇALHO COM IDENTIDADE DO PARQUE & NAVEGAÇÃO */}
      <AppHeader
        activeNav={activeNav}
        onNavChange={handleNavChange}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLegend={() => setIsLegendOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      {/* 2. ÁREA PRINCIPAL DE CONTEÚDO */}
      <main className="relative flex-1 w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden">
        {/* A. MAPA EM TELA CHEIA (Protagonista Absoluto) */}
        <div
          className={`absolute inset-0 z-0 transition-opacity duration-300 ${
            activeNav === 'mapa' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <DynamicMap
            currentMode={currentMode}
            trees={filteredTrees}
            selectedTree={selectedTree}
            onSelectTree={selectTree}
            focusKey={focusKey}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
          />

          {/* Selo Cartográfico, Filtros Rápidos de Grupo e Legenda do Mapa */}
          <MapFieldOverlay
            selectedGroup={selectedGroup}
            onGroupChange={setSelectedGroup}
            resultCount={filteredTrees.length}
            totalCount={allTrees.length}
            onOpenLegend={() => setIsLegendOpen(true)}
          />

          {/* Seletor de Camadas Cartográficas (Satélite, Planta, Exploração) */}
          <LayerSwitcher
            currentMode={currentMode}
            onModeChange={setCurrentMode}
          />

          {/* Painel do Espécime / Inventário da Região (Sidebar no Desktop / Bottom Sheet no Mobile) */}
          <TreePanel
            selectedTree={selectedTree}
            onClose={() => selectTree(null)}
            filteredTrees={filteredTrees}
            onSelectTree={selectTreeAndFocus}
            onCenterOnMap={selectTreeAndFocus}
            selectedGroup={selectedGroup}
            onCloseGroup={() => setSelectedGroup('all')}
          />
        </div>

        {/* B. VISTA DO CATÁLOGO DE ESPÉCIES */}
        {activeNav === 'especies' && (
          <div className="relative z-10 w-full h-full">
            <SpeciesCatalogView
              trees={allTrees}
              onBackToMap={() => setActiveNav('mapa')}
              onSelectTree={selectTreeAndFocus}
            />
          </div>
        )}

        {/* C. VISTA SOBRE O PROJETO & METODOLOGIA */}
        {activeNav === 'projeto' && (
          <div className="relative z-10 w-full h-full">
            <ProjectAboutView
              onBackToMap={() => setActiveNav('mapa')}
            />
          </div>
        )}
      </main>

      {/* 3. BARRA DE NAVEGAÇÃO FLUTUANTE MOBILE */}
      <MobileNav
        activeNav={activeNav}
        onNavChange={handleNavChange}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 4. POPOVER FLUTUANTE DE BUSCA COM TECLADO */}
      <SearchPopover
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTree={selectTreeAndFocus}
        trees={allTrees}
      />

      {/* 5. MODAL DE LEGENDA & METODOLOGIA */}
      <LegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />

      {/* 6. MODAL DE MÉTRICAS & ESTATÍSTICAS COM FILTRO REVERSO */}
      <StatisticsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        trees={allTrees}
      />
    </div>
  );
}
