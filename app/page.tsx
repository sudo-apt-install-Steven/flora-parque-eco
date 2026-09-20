'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DynamicMap } from '@/components/map/DynamicMap';
import { AppHeader, NavSection } from '@/components/ui/AppHeader';
import { MobileNav } from '@/components/ui/MobileNav';
import { LayerSwitcher } from '@/components/ui/LayerSwitcher';
import { MapFieldOverlay } from '@/components/ui/MapFieldOverlay';
import { SearchPopover } from '@/components/ui/SearchPopover';
import { TreePanel } from '@/components/tree/TreePanel';
import { LegendModal } from '@/components/ui/LegendModal';
import { StatisticsModal } from '@/components/ui/StatisticsModal';
import { SpeciesCatalogView } from '@/components/views/SpeciesCatalogView';
import { ProjectAboutView } from '@/components/views/ProjectAboutView';
import { getValidatedTrees, searchTrees, getTreeById } from '@/lib/trees';
import { Tree, FieldGroup } from '@/lib/tree-schema';

function ParkInventoryApp() {
  const searchParams = useSearchParams();
  const allTrees = useMemo(() => getValidatedTrees(), []);

  // Seção de navegação ativa ('mapa' | 'especies' | 'dados' | 'projeto')
  const [activeNav, setActiveNav] = useState<NavSection>('mapa');

  // Modos cartográficos do MapLibre: 'satellite' | 'planta' | 'exploration'
  const [currentMode, setCurrentMode] = useState<'satellite' | 'planta' | 'exploration'>('planta');

  // Filtro rápido por grupo de campo acadêmico (Todos, Grupo A, B ou C)
  const [selectedGroup, setSelectedGroup] = useState<FieldGroup | 'all'>('all');

  // Árvore selecionada para exibição de detalhes
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  // Contador para forçar re-centralização da câmera no mapa (mesmo que a árvore já esteja selecionada)
  const [focusKey, setFocusKey] = useState(0);

  // Estados de modais e busca
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Suporte a acesso direto via QR Code (ex: ?tree=mock-tree-001 ou ?id=mock-tree-001)
  useEffect(() => {
    const treeParam = searchParams.get('tree') || searchParams.get('id');
    if (treeParam) {
      const found = getTreeById(treeParam);
      if (found) {
        setSelectedTree(found);
        setActiveNav('mapa');
        setFocusKey((prev) => prev + 1);
      }
    }
  }, [searchParams]);

  // Sincronização dinâmica da barra de endereços (?tree=slug) sem recarregar a página
  useEffect(() => {
    if (typeof window === 'undefined') return;
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

  // Lista filtrada de árvores de acordo com o grupo ativo
  const filteredTrees = useMemo(() => {
    return searchTrees('', selectedGroup);
  }, [selectedGroup]);

  // Manipulador de troca de navegação no topo ou barra móvel
  const handleNavChange = (nav: NavSection) => {
    if (nav === 'dados') {
      setIsStatsOpen(true);
    } else {
      setActiveNav(nav);
    }
  };

  // Selecionar árvore e focar no mapa com pulo da câmera garantido
  const handleSelectTreeAndFocus = (tree: Tree) => {
    setSelectedTree(tree);
    setActiveNav('mapa');
    setFocusKey((prev) => prev + 1);
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
            onSelectTree={setSelectedTree}
            focusKey={focusKey}
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

          {/* Painel do Espécime (Sidebar no Desktop / Bottom Sheet no Mobile) */}
          <TreePanel
            selectedTree={selectedTree}
            onClose={() => setSelectedTree(null)}
            filteredTrees={filteredTrees}
            onSelectTree={handleSelectTreeAndFocus}
            onCenterOnMap={handleSelectTreeAndFocus}
          />
        </div>

        {/* B. VISTA DO CATÁLOGO DE ESPÉCIES */}
        {activeNav === 'especies' && (
          <div className="relative z-10 w-full h-full">
            <SpeciesCatalogView
              trees={allTrees}
              onBackToMap={() => setActiveNav('mapa')}
              onSelectTree={handleSelectTreeAndFocus}
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
        onSelectTree={handleSelectTreeAndFocus}
        trees={allTrees}
      />

      {/* 5. MODAL DE LEGENDA & METODOLOGIA */}
      <LegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />

      {/* 6. MODAL DE MÉTRICAS & ESTATÍSTICAS */}
      <StatisticsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        trees={allTrees}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#0b211d]" />}>
      <ParkInventoryApp />
    </Suspense>
  );
}
