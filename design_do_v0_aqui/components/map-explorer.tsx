'use client'

import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  Filter,
  Layers3,
  Leaf,
  LocateFixed,
  Map as MapIcon,
  Menu,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trees,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Layer = 'exploração' | 'planta' | 'satélite'
type Tree = { id: number; common: string; scientific: string; family: string; confidence: string; x: number; y: number; tone: string; image: string }

const trees: Tree[] = [
  { id: 1, common: 'Ipê-amarelo', scientific: 'Handroanthus albus', family: 'Bignoniaceae', confidence: '87%', x: 28, y: 33, tone: 'amber', image: 'https://images.unsplash.com/photo-1531168556467-80aace0d0144?auto=format&fit=crop&w=900&q=85' },
  { id: 2, common: 'Samaúma', scientific: 'Ceiba pentandra', family: 'Malvaceae', confidence: '92%', x: 57, y: 25, tone: 'green', image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=900&q=85' },
  { id: 3, common: 'Jatobá', scientific: 'Hymenaea courbaril', family: 'Fabaceae', confidence: '78%', x: 71, y: 51, tone: 'rose', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=85' },
  { id: 4, common: 'Copaíba', scientific: 'Copaifera langsdorffii', family: 'Fabaceae', confidence: '84%', x: 39, y: 65, tone: 'green', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85' },
  { id: 5, common: 'Açaí', scientific: 'Euterpe oleracea', family: 'Arecaceae', confidence: '91%', x: 77, y: 76, tone: 'amber', image: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=900&q=85' },
  { id: 6, common: 'Paineira', scientific: 'Ceiba speciosa', family: 'Malvaceae', confidence: '81%', x: 18, y: 72, tone: 'green', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85' },
]

function TreeMarker({ tree, active, onClick }: { tree: Tree; active: boolean; onClick: () => void }) {
  return <button aria-label={`Abrir ficha de ${tree.common}`} onClick={onClick} className={cn('tree-marker', active && 'is-active')} style={{ left: `${tree.x}%`, top: `${tree.y}%` }}><span className={cn('marker-core', `marker-${tree.tone}`)}><Leaf /></span><span className="marker-pulse" /></button>
}

function Brand() { return <div className="brand-lockup"><div className="brand-mark"><Leaf /></div><div><p className="brand-kicker">Inventário arbóreo</p><p className="brand-name">PARQUE ECOLÓGICO</p><p className="brand-place">Marechal Cândido Rondon · Vilhena, RO</p></div></div> }

export default function MapExplorer() {
  const [layer, setLayer] = useState<Layer>('exploração')
  const [selected, setSelected] = useState<Tree | null>(trees[1])
  const [nav, setNav] = useState('mapa')
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(false)
  const result = useMemo(() => query ? trees.filter((tree) => `${tree.common} ${tree.scientific} ${tree.family}`.toLowerCase().includes(query.toLowerCase())) : trees, [query])

  return <main className="explorer-shell">
    <header className="topbar"><Brand /><nav className="desktop-nav" aria-label="Navegação principal">{[['mapa', 'Mapa', MapIcon], ['espécies', 'Espécies', Trees], ['dados', 'Dados', SlidersHorizontal], ['projeto', 'Projeto', Compass]].map(([id, label, Icon]) => <button key={id as string} className={cn('nav-link', nav === id && 'is-current')} onClick={() => setNav(id as string)}><Icon />{label as string}</button>)}</nav><div className="top-actions"><button className="icon-button mobile-only" aria-label="Abrir menu"><Menu /></button><button className={cn('search-trigger', searchOpen && 'open')} onClick={() => setSearchOpen(!searchOpen)}><Search /><span>Buscar árvore</span><kbd>⌘ K</kbd></button><button className="icon-button" aria-label="Ajuda"><CircleHelp /></button></div></header>

    {searchOpen && <div className="search-popover"><div className="search-input-wrap"><Search /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome popular, científico ou família" /><button onClick={() => { setQuery(''); setSearchOpen(false) }} aria-label="Fechar busca"><X /></button></div><div className="search-results">{query && result.length === 0 && <p className="empty-search">Nenhuma espécie encontrada.</p>}{result.slice(0, 4).map((tree) => <button key={tree.id} onClick={() => { setSelected(tree); setSearchOpen(false); setQuery('') }}><span className="result-dot" /><span><strong>{tree.common}</strong><small>{tree.scientific}</small></span><ArrowUpRight /></button>)}</div></div>}

    {nav === 'mapa' && <section className="map-stage" aria-label="Mapa interativo do parque"><div className={cn('map-canvas', `layer-${layer}`)}><div className="map-grid" /><div className="topography topo-a" /><div className="topography topo-b" /><div className="topography topo-c" /><div className="lake"><span>Lago das Palmeiras</span></div><div className="trail trail-one" /><div className="trail trail-two" /><div className="map-label label-north">N · 01</div><div className="map-label label-ifro">IFRO <small>Campus Vilhena</small></div><div className="map-label label-play">Área de convivência</div><div className="map-label label-entrance">Entrada principal</div>{trees.map((tree) => <TreeMarker key={tree.id} tree={tree} active={selected?.id === tree.id} onClick={() => setSelected(tree)} />)}<div className="map-stamp"><span>MAPA DE CAMPO</span><strong>PEM–RO</strong><small>12°44′ S · 60°07′ O</small></div></div><aside className="map-toolbar left-toolbar"><button className="toolbar-button active"><Compass /><span>Explorar</span></button><button className="toolbar-button" onClick={() => setFilters(!filters)}><Filter /><span>Filtros</span></button><button className="toolbar-button"><LocateFixed /><span>Minha posição</span></button></aside><div className="layer-switcher"><div className="switcher-heading"><span>Camada do mapa</span><button aria-label="Fechar seletor"><ChevronDown /></button></div><div className="layer-options">{(['exploração', 'planta', 'satélite'] as Layer[]).map((item) => <button key={item} onClick={() => setLayer(item)} className={cn(layer === item && 'selected')}><span className={cn('layer-preview', `preview-${item}`)} />{item}<span className="layer-check">{layer === item ? '●' : '○'}</span></button>)}</div></div><div className="zoom-controls"><button aria-label="Aumentar zoom"><Plus /></button><button aria-label="Diminuir zoom"><Minus /></button></div><div className="map-scale"><span>100 m</span><i /></div><div className="map-legend"><div className="legend-title"><span>Legenda</span><button aria-label="Alternar legenda"><ChevronDown /></button></div><div className="legend-items"><span><b className="legend-tree" />Árvore catalogada</span><span><b className="legend-water" />Água</span><span><b className="legend-trail" />Trilha</span></div></div><div className="map-meta">Dados de demonstração · Levantamento 2024 <span>© Parque Ecológico</span></div>{filters && <div className="filter-popover"><div><strong>Filtros de exploração</strong><button onClick={() => setFilters(false)}><X /></button></div>{['Todas as famílias', 'Todas as regiões', 'Confiança acima de 80%'].map((filter) => <button key={filter}>{filter}<ChevronRight /></button>)}<button className="clear-filter">Limpar filtros</button></div>}</section>}

    {nav !== 'mapa' && <ContentSection nav={nav} onBack={() => setNav('mapa')} />}
    {selected && nav === 'mapa' && <TreePanel tree={selected} onClose={() => setSelected(null)} />}
    <div className="mobile-nav"><button className={nav === 'mapa' ? 'is-current' : ''} onClick={() => setNav('mapa')}><MapIcon /><span>Mapa</span></button><button onClick={() => setSearchOpen(true)}><Search /><span>Buscar</span></button><button onClick={() => setNav('espécies')}><Trees /><span>Espécies</span></button><button onClick={() => setNav('projeto')}><Compass /><span>Projeto</span></button></div>
  </main>
}

function TreePanel({ tree, onClose }: { tree: Tree; onClose: () => void }) { const [photo, setPhoto] = useState(tree.image); return <aside className="tree-panel"><div className="panel-handle" /><button className="panel-close" onClick={onClose} aria-label="Fechar ficha"><X /></button><div className="tree-photo"><img src={photo} alt={`Registro fotográfico de ${tree.common}`} /><span className="photo-badge"><Sparkles /> Identificação assistida</span><button className="gallery-prev" onClick={() => setPhoto(tree.image)} aria-label="Foto anterior"><ChevronLeft /></button><button className="gallery-next" onClick={() => setPhoto(tree.image)} aria-label="Próxima foto"><ChevronRight /></button></div><div className="thumbnail-row"><button className="thumbnail active" onClick={() => setPhoto(tree.image)}><img src={tree.image} alt="Vista geral" /></button><button className="thumbnail"><img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=200&q=80" alt="Detalhe das folhas" /></button><button className="thumbnail"><img src="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=200&q=80" alt="Detalhe do caule" /></button><span>+ 4 fotos</span></div><div className="tree-content"><div className="eyebrow">Ficha de campo <span>·</span> #—</div><h1>{tree.common}</h1><p className="scientific">{tree.scientific}</p><dl className="tree-facts"><div><dt>Família</dt><dd>{tree.family}</dd></div><div><dt>Confiança</dt><dd><span className="confidence-dot" />{tree.confidence}</dd></div><div><dt>Localização</dt><dd>Setor leste · 04</dd></div></dl><div className="identification-note"><div className="note-icon"><Leaf /></div><div><strong>Nome científico sugerido</strong><p>Identificação baseada em registro fotográfico e revisão de campo.</p><a href="#plantnet">Ver identificação no PlantNet <ArrowUpRight /></a></div></div><button className="focus-button" onClick={onClose}><LocateFixed /> Centralizar no mapa</button></div></aside> }

function ContentSection({ nav, onBack }: { nav: string; onBack: () => void }) { if (nav === 'espécies') return <section className="content-section"><button className="back-button" onClick={onBack}><ChevronLeft /> Voltar ao mapa</button><div className="content-heading"><div><p className="eyebrow">Catálogo vivo</p><h1>Espécies registradas</h1><p>Uma visão condensada da diversidade arbórea observada no parque.</p></div><span className="mock-badge">Dados demonstrativos</span></div><div className="stats-strip"><div><strong>127</strong><span>árvores catalogadas</span></div><div><strong>34</strong><span>espécies</span></div><div><strong>19</strong><span>famílias</span></div><div><strong>12</strong><span>em revisão</span></div></div><div className="species-list">{trees.slice(0, 4).map((tree) => <article key={tree.id} className="species-row"><img src={tree.image} alt={tree.common} /><div><h2>{tree.common}</h2><p>{tree.scientific}</p></div><span>{tree.family}</span><b>{tree.confidence}</b><ArrowUpRight /></article>)}</div></section>
return <section className="content-section project-content"><button className="back-button" onClick={onBack}><ChevronLeft /> Voltar ao mapa</button><div className="project-hero"><p className="eyebrow">Sobre o inventário</p><h1>Ciência que cria vínculo com o território.</h1><p>O Parque Ecológico Municipal Marechal Cândido Rondon é um laboratório vivo junto ao IFRO Campus Vilhena. Este mapa registra espécies, histórias e evidências para transformar uma caminhada em descoberta.</p></div><div className="project-grid"><article><span>01</span><h2>Levantamento de campo</h2><p>Registros fotográficos e localização aproximada organizados pelos estudantes.</p></article><article><span>02</span><h2>Identificação assistida</h2><p>O PlantNet apoia a sugestão científica, sempre marcada por nível de confiança e revisão.</p></article><article><span>03</span><h2>Conhecimento aberto</h2><p>Uma cartografia acessível para observar, aprender e cuidar da biodiversidade local.</p></article></div></section> }
