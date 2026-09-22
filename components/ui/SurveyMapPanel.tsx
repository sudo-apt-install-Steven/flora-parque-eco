'use client';

import React, { useState, useCallback } from 'react';
import { X, ChevronRight, Trees, MapPin, Layers, RotateCcw } from 'lucide-react';
import { FieldGroup, Tree } from '@/lib/tree-schema';
import { PARK_CONFIG } from '@/lib/park-config';
import { cn, safeImgSrc } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SurveyMapPanelProps {
  isOpen: boolean;
  onClose: () => void;
  trees: Tree[];
  selectedGroup: FieldGroup | 'all';
  onSelectGroup: (group: FieldGroup | 'all') => void;
  onSelectTree: (tree: Tree) => void;
}

// ---------------------------------------------------------------------------
// Group config (colours must match reference image: A=yellow, B=cyan, C=red)
// ---------------------------------------------------------------------------

const GROUP_CONFIG: Record<FieldGroup, {
  label: string;
  sublabel: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  // SVG clipPath coords as % of the reference image (rough outlines)
  // These define clickable SVG regions overlaid on the reference image
  svgPoints: string;
}> = {
  groupA: {
    label: 'Grupo A',
    sublabel: 'Gramado Noroeste',
    color: '#eab308',
    colorBg: 'bg-yellow-500/20',
    colorBorder: 'border-yellow-400/50',
    colorText: 'text-yellow-600 dark:text-yellow-300',
    // Polygon roughly matching the yellow (green) area in reference image (left half of grass)
    svgPoints: '0,10 46,10 46,14 50,18 50,52 0,52',
  },
  groupB: {
    label: 'Grupo B',
    sublabel: 'Gramado Nordeste & Parquinho',
    color: '#06b6d4',
    colorBg: 'bg-cyan-500/20',
    colorBorder: 'border-cyan-400/50',
    colorText: 'text-cyan-600 dark:text-cyan-300',
    // Right half of grass + playground area
    svgPoints: '46,10 100,10 100,52 70,60 60,58 50,52 50,18 46,14',
  },
  groupC: {
    label: 'Grupo C',
    sublabel: 'Margem Sul do Lago',
    color: '#ef4444',
    colorBg: 'bg-red-500/20',
    colorBorder: 'border-red-400/50',
    colorText: 'text-red-600 dark:text-red-300',
    // Curved strip along the southern/southeastern lake shore
    svgPoints: '0,52 50,52 60,58 70,60 100,52 100,80 70,90 40,92 10,85 0,72',
  },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const SurveyMapPanel: React.FC<SurveyMapPanelProps> = ({
  isOpen,
  onClose,
  trees,
  selectedGroup,
  onSelectGroup,
  onSelectTree,
}) => {
  const [hoveredGroup, setHoveredGroup] = useState<FieldGroup | null>(null);

  const groupTrees = useCallback(
    (group: FieldGroup) => trees.filter((t) => t.group === group),
    [trees]
  );

  const handleRegionClick = (group: FieldGroup) => {
    if (selectedGroup === group) {
      onSelectGroup('all');
    } else {
      onSelectGroup(group);
    }
  };

  const handleClear = () => {
    onSelectGroup('all');
  };

  if (!isOpen) return null;

  const activeGroup = selectedGroup !== 'all' ? selectedGroup : null;
  const activeGroupTrees = activeGroup ? groupTrees(activeGroup) : [];
  const activeConfig = activeGroup ? GROUP_CONFIG[activeGroup] : null;

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* DESKTOP: Painel lateral esquerdo                                    */}
      {/* ------------------------------------------------------------------ */}
      <aside
        aria-label="Mapa de Levantamento por Setores"
        className="hidden md:flex flex-col fixed top-24 bottom-8 left-8 w-[440px] bg-[#f8f6ef] dark:bg-[#0f2621] rounded-3xl shadow-[0_18px_48px_rgba(16,42,38,0.28)] border border-[#102a26]/12 dark:border-white/10 z-30 overflow-hidden animate-panel-in-left"
      >
        <PanelContent
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          activeGroup={activeGroup}
          activeConfig={activeConfig}
          activeGroupTrees={activeGroupTrees}
          handleRegionClick={handleRegionClick}
          handleClear={handleClear}
          onClose={onClose}
          onSelectTree={onSelectTree}
          groupTrees={groupTrees}
        />
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE: Backdrop + Bottom Sheet                                     */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="md:hidden fixed inset-0 bg-[#102a26]/45 z-40 animate-fadeIn backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mapa de Levantamento por Setores"
        className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-[#f8f6ef] dark:bg-[#0f2621] rounded-t-3xl shadow-[0_-12px_40px_rgba(16,42,38,0.28)] border-t border-[#102a26]/12 dark:border-white/10 flex flex-col max-h-[88vh] animate-sheet-in"
      >
        <div className="w-full py-3 flex items-center justify-center">
          <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
        </div>
        <PanelContent
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          activeGroup={activeGroup}
          activeConfig={activeConfig}
          activeGroupTrees={activeGroupTrees}
          handleRegionClick={handleRegionClick}
          handleClear={handleClear}
          onClose={onClose}
          onSelectTree={onSelectTree}
          groupTrees={groupTrees}
        />
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// Inner panel content (shared between desktop sidebar and mobile sheet)
// ---------------------------------------------------------------------------

interface PanelContentProps {
  hoveredGroup: FieldGroup | null;
  setHoveredGroup: (g: FieldGroup | null) => void;
  activeGroup: FieldGroup | null;
  activeConfig: typeof GROUP_CONFIG[FieldGroup] | null;
  activeGroupTrees: Tree[];
  handleRegionClick: (g: FieldGroup) => void;
  handleClear: () => void;
  onClose: () => void;
  onSelectTree: (t: Tree) => void;
  groupTrees: (g: FieldGroup) => Tree[];
}

const PanelContent: React.FC<PanelContentProps> = ({
  hoveredGroup,
  setHoveredGroup,
  activeGroup,
  activeConfig,
  activeGroupTrees,
  handleRegionClick,
  handleClear,
  onClose,
  onSelectTree,
  groupTrees,
}) => (
  <div className="flex flex-col h-full overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 dark:border-stone-800 bg-[#f3efe4] dark:bg-black/15 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-[#0b211d] text-[#c4a06a] flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d6a35b]">
            Levantamento de Campo
          </p>
          <h2 className="text-sm font-serif font-bold text-[#0b211d] dark:text-[#f8f6ef] leading-tight">
            Áreas do Levantamento
          </h2>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Fechar mapa de levantamento"
        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>

    {/* Scrollable body */}
    <div className="flex-1 overflow-y-auto smooth-touch-scroll px-5 py-4 space-y-5">

      {/* ---- Reference map with SVG overlay ---- */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Imagem de Referência dos Setores
        </p>

        <div className="relative w-full rounded-2xl overflow-hidden border border-[#102a26]/10 dark:border-white/10 shadow-md bg-stone-900">
          {/* Reference satellite photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/referencia/mapa-referencia-setores.jpg"
            alt="Mapa de referência com setores A, B e C do levantamento"
            className="w-full h-auto block select-none"
            draggable={false}
          />

          {/* SVG overlay — clickable coloured regions */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'all' }}
            aria-hidden="true"
          >
            {(Object.entries(GROUP_CONFIG) as [FieldGroup, typeof GROUP_CONFIG[FieldGroup]][]).map(
              ([gKey, gCfg]) => {
                const isActive = activeGroup === gKey;
                const isHovered = hoveredGroup === gKey;
                const fillOpacity = isActive ? 0.42 : isHovered ? 0.32 : 0.18;
                const strokeWidth = isActive ? 0.8 : isHovered ? 0.6 : 0.4;
                const strokeOpacity = isActive ? 1 : isHovered ? 0.85 : 0.6;
                return (
                  <polygon
                    key={gKey}
                    points={gCfg.svgPoints}
                    fill={gCfg.color}
                    fillOpacity={fillOpacity}
                    stroke={gCfg.color}
                    strokeWidth={strokeWidth}
                    strokeOpacity={strokeOpacity}
                    style={{ cursor: 'pointer', transition: 'fill-opacity 200ms, stroke-width 200ms' }}
                    onClick={() => handleRegionClick(gKey)}
                    onMouseEnter={() => setHoveredGroup(gKey)}
                    onMouseLeave={() => setHoveredGroup(null)}
                  />
                );
              }
            )}
          </svg>

          {/* Floating labels on the image */}
          <div className="absolute inset-0 pointer-events-none select-none">
            {/* Group A label — upper left */}
            <div
              className={cn(
                'absolute top-[18%] left-[12%] transition-all duration-200',
                activeGroup === 'groupA' || hoveredGroup === 'groupA' ? 'scale-110' : 'scale-100'
              )}
            >
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0b211d]/80 text-yellow-300 border border-yellow-400/40 backdrop-blur-sm shadow-md">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                A
              </span>
            </div>
            {/* Group B label — upper right */}
            <div
              className={cn(
                'absolute top-[18%] right-[12%] transition-all duration-200',
                activeGroup === 'groupB' || hoveredGroup === 'groupB' ? 'scale-110' : 'scale-100'
              )}
            >
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0b211d]/80 text-cyan-300 border border-cyan-400/40 backdrop-blur-sm shadow-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                B
              </span>
            </div>
            {/* Group C label — bottom center */}
            <div
              className={cn(
                'absolute bottom-[8%] left-[42%] transition-all duration-200',
                activeGroup === 'groupC' || hoveredGroup === 'groupC' ? 'scale-110' : 'scale-100'
              )}
            >
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0b211d]/80 text-red-300 border border-red-400/40 backdrop-blur-sm shadow-md">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                C
              </span>
            </div>
          </div>

          {/* Bottom caption bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0b211d]/80 to-transparent px-3 py-2 pointer-events-none">
            <p className="text-[9px] text-stone-300 font-medium">
              Toque em uma área para selecionar o setor
            </p>
          </div>
        </div>
      </div>

      {/* ---- Legend + Group selector pills ---- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Setores de Coleta
          </p>
          {activeGroup && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-800 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar filtro
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(GROUP_CONFIG) as [FieldGroup, typeof GROUP_CONFIG[FieldGroup]][]).map(
            ([gKey, gCfg]) => {
              const count = groupTrees(gKey).length;
              const isActive = activeGroup === gKey;
              return (
                <button
                  key={gKey}
                  onClick={() => handleRegionClick(gKey)}
                  onMouseEnter={() => setHoveredGroup(gKey)}
                  onMouseLeave={() => setHoveredGroup(null)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                    isActive
                      ? 'border-2 shadow-md scale-[1.03]'
                      : 'border hover:scale-[1.01] bg-white/60 dark:bg-white/5 border-stone-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                  )}
                  style={isActive ? {
                    borderColor: gCfg.color,
                    backgroundColor: `${gCfg.color}18`,
                    boxShadow: `0 4px 16px ${gCfg.color}30`
                  } : {}}
                  aria-pressed={isActive}
                  aria-label={`Selecionar ${gCfg.label}`}
                >
                  <span
                    className="w-5 h-5 rounded-full ring-2 ring-offset-1"
                    style={{
                      backgroundColor: gCfg.color,
                      boxShadow: isActive ? `0 0 0 3px ${gCfg.color}35` : 'none'
                    }}
                  />
                  <span className="text-[11px] font-bold text-[#0b211d] dark:text-[#f8f6ef]">
                    {gCfg.label}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                    {count} árv.
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ---- Active group tree list ---- */}
      {activeGroup && activeConfig && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: activeConfig.color }}
            >
              {activeConfig.label} — {activeConfig.sublabel}
            </p>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${activeConfig.color}18`,
                color: activeConfig.color,
                border: `1px solid ${activeConfig.color}40`
              }}
            >
              {activeGroupTrees.length} espécimes
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {activeGroupTrees.map((tree) => {
              const photoSrc = tree.primaryPhoto?.url
                ? safeImgSrc(tree.primaryPhoto.url)
                : null;

              return (
                <button
                  key={tree.id}
                  onClick={() => onSelectTree(tree)}
                  className="group w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/10 border border-stone-200/80 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 transition-all duration-150 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                  style={{ '--focus-ring-color': activeConfig.color } as React.CSSProperties}
                  aria-label={`Ver ficha de ${tree.popularName}`}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border"
                    style={{ borderColor: `${activeConfig.color}30` }}
                  >
                    {photoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoSrc}
                        alt={tree.popularName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          const t = e.currentTarget;
                          if (!t.dataset.fb) {
                            t.dataset.fb = '1';
                            t.style.opacity = '0.3';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center">
                        <Trees className="w-5 h-5 text-stone-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0b211d] dark:text-[#f8f6ef] truncate">
                      {tree.popularName}
                    </p>
                    <p className="text-[10px] font-serif italic text-stone-500 dark:text-stone-400 truncate mt-0.5">
                      {tree.scientificNameSuggested}
                    </p>
                    <p className="text-[9px] font-mono text-stone-400 mt-0.5">{tree.family}</p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 flex-shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Idle state — no group selected */}
      {!activeGroup && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MapPin className="w-8 h-8 text-stone-300 dark:text-stone-600" />
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-[240px]">
            Selecione um setor no mapa acima ou nas pílulas abaixo para visualizar as árvores catalogadas.
          </p>
        </div>
      )}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Floating trigger button (rendered in ParkInventoryApp over the map)
// ---------------------------------------------------------------------------

interface SurveyMapTriggerProps {
  onClick: () => void;
  isActive: boolean;
  activeGroup: FieldGroup | 'all';
}

export const SurveyMapTrigger: React.FC<SurveyMapTriggerProps> = ({
  onClick,
  isActive,
  activeGroup,
}) => {
  const cfg = activeGroup !== 'all' ? GROUP_CONFIG[activeGroup] : null;

  return (
    <button
      onClick={onClick}
      aria-label="Abrir mapa de levantamento por setores"
      aria-pressed={isActive}
      className={cn(
        'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-lg border select-none',
        isActive
          ? 'bg-[#0b211d] border-[#c4a06a]/60 text-[#f4f1e8] shadow-[0_6px_20px_rgba(11,33,29,0.35)]'
          : 'bg-[#0b211d]/90 border-white/15 text-[#f4f1e8] hover:bg-[#183d35] hover:border-[#c4a06a]/40 backdrop-blur-md'
      )}
    >
      <Layers className="w-3.5 h-3.5 text-[#d6a35b]" />
      <span>Áreas do levantamento</span>
      {cfg && (
        <span
          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/30"
          style={{ backgroundColor: cfg.color }}
        />
      )}
    </button>
  );
};
