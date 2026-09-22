'use client';

import React from 'react';
import {
  ChevronLeft,
  GraduationCap,
  Sparkles,
  Trees,
  Compass,
  FileCheck2,
  Cpu,
  Layers,
  Info,
  MapPin,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { PARK_CONFIG } from '@/lib/park-config';

interface ProjectAboutViewProps {
  onBackToMap: () => void;
}

export const ProjectAboutView: React.FC<ProjectAboutViewProps> = ({ onBackToMap }) => {
  return (
    <div className="p-4 sm:p-8 md:p-12 lg:px-24 bg-[#f8f6ef] dark:bg-[#081714] text-[#102a26] dark:text-[#f8f6ef]">
      {/* Botão Superior: Voltar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-stone-200 dark:border-white/10">
        <button
          onClick={onBackToMap}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-stone-300 dark:border-white/10 text-stone-700 dark:text-stone-200 transition-all shadow-sm active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar ao mapa
        </button>

        <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
          Documentação Metodológica · IFRO / Vilhena-RO
        </div>
      </div>

      {/* Artigo Científico — Header & Metadata */}
      <article className="max-w-4xl mx-auto my-8 space-y-10">
        {/* Cabeçalho do Paper */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d6a35b]">
            <BookOpen className="w-4 h-4" />
            <span>Relatório Técnico & Metodologia Científica</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0b211d] dark:text-[#f8f6ef] leading-[1.12]">
            Plataforma Cartográfica Digital e Inventário Arbóreo do Parque Ecológico Municipal Marechal Cândido Rondon
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-stone-600 dark:text-[#9bb0a6] leading-relaxed">
            Metodologia dendrológica, validação assistida por redes neurais (PlantNet) e infraestrutura geoespacial acelerada por WebGL.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-white/10">
            <div><strong>Autoria Institucional:</strong> IFRO Campus Vilhena & Secretaria de Meio Ambiente</div>
            <div><strong>Território:</strong> Vilhena, Rondônia, Brasil (12°42′ S · 60°07′ O)</div>
            <div><strong>Ano de Referência:</strong> 2026</div>
          </div>
        </header>

        {/* Resumo / Abstract */}
        <section className="p-6 rounded-2xl bg-white/70 dark:bg-white/[0.03] border-l-4 border-[#d6a35b] border border-stone-200 dark:border-white/10 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0b211d] dark:text-[#d6a35b]">
            Resumo (Abstract)
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            Este projeto documenta o inventário dendrológico contínuo do Parque Ecológico Municipal de Vilhena (RO),
            integrando ensino profissionalizante do Instituto Federal de Rondônia (IFRO) com conservação ambiental urbana.
            A metodologia divide o território em três setores amostrais, combina receptores GPS de alta sensibilidade,
            registro fotográfico fenológico padronizado, triagem preliminar assistida por inteligência artificial e
            disponibilização cartográfica pública e interativa em Progressive Web App (PWA).
          </p>
        </section>

        {/* Seção 1: Divisão Territorial dos Três Grupos de Campo */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#d6a35b]">01.</span>
            <h2 className="font-serif text-2xl font-bold text-[#0b211d] dark:text-[#f8f6ef]">
              Divisão Territorial e Grupos de Levantamento
            </h2>
          </div>

          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            O parque foi estratificado em três zonas operacionais para evitar sobreposição amostral e otimizar
            a cobertura dos diferentes microambientes (mata ciliar, terra firme e áreas de convívio social):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#52775e]" />
                <h3 className="font-bold text-sm text-[#0b211d] dark:text-[#f8f6ef]">Grupo A</h3>
              </div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Margem Esquerda Norte
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Cobertura da porção setentrional da bacia do lago, focando em espécies higrófilas, palmeiras e recomposição ciliar.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#4a6f91]" />
                <h3 className="font-bold text-sm text-[#0b211d] dark:text-[#f8f6ef]">Grupo B</h3>
              </div>
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                Margem Esquerda Sul
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Trilha de transição e bosque secundário denso, caracterizado por árvores nativas de maior porte e sub-bosque sombreado.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#b07a32]" />
                <h3 className="font-bold text-sm text-[#0b211d] dark:text-[#f8f6ef]">Grupo C</h3>
              </div>
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Margem Direita (Trilha Principal)
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Área de circulação intensiva, parquinho infantil, ponte e acesso comunitário. Espécimes emblemáticos e de educação ambiental.
              </p>
            </div>
          </div>
        </section>

        {/* Seção 2: Protocolo de IA PlantNet e Limitações Metodológicas */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#d6a35b]">02.</span>
            <h2 className="font-serif text-2xl font-bold text-[#0b211d] dark:text-[#f8f6ef]">
              Triagem por Inteligência Artificial (PlantNet) & Limitações
            </h2>
          </div>

          <div className="space-y-3 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <p>
              A identificação primária das amostras fotográficas é assistida pela API do PlantNet v2, que emprega
              redes neurais convolucionais profundas treinadas em milhões de registros taxonômicos globais.
            </p>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Protocolo de Confiança e Restrições Científicas:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-stone-700 dark:text-stone-300 pl-1">
                <li>
                  <strong>Score &ge; 0.85 (Confiança Alta):</strong> Hipótese taxonômica robusta para espécies com características diagnósticas evidentes em folhas e flores.
                </li>
                <li>
                  <strong>Score 0.40 a 0.84 (Confiança Média):</strong> Exige vistoria dendrológica e verificação de literatura regional amazônica.
                </li>
                <li>
                  <strong>Limitação Fenológica:</strong> No bioma de transição amazônico em Vilhena, a estiagem reduz floradas e frutificações, limitando a acurácia de modelos puramente baseados em casca ou filotaxia estéril.
                </li>
                <li>
                  <strong>Status Oficial:</strong> Nenhuma árvore recebe plaqueta física definitiva sem chancela de botânico e confronto com herbários de referência (POWO / GBIF / Flora e Funga do Brasil).
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Seção 3: Arquitetura Tecnológica e GIS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#d6a35b]">03.</span>
            <h2 className="font-serif text-2xl font-bold text-[#0b211d] dark:text-[#f8f6ef]">
              Infraestrutura Digital & Engenharia Cartográfica
            </h2>
          </div>

          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            A aplicação foi arquitetada para responder a dois desafios simultâneos: máxima interatividade visual
            (60 FPS) e resiliência total a ausência de sinal de internet nas trilhas fechadas do parque:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-[#0b211d] dark:text-[#f8f6ef]">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Motor WebGL MapLibre GL
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Renderização vetorial acelerada por GPU direta na placa gráfica, permitindo alternância entre Satélite, Planta Técnica e Exploração com zero lag.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-[#0b211d] dark:text-[#f8f6ef]">
                <Layers className="w-4 h-4 text-[#d6a35b]" />
                Supercluster Espacial O(N)
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Agrupamento dinâmico em grade espacial Mercator, condensando pontos vizinhos em medalhões numéricos ao afastar o zoom.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-[#0b211d] dark:text-[#f8f6ef]">
                <Compass className="w-4 h-4 text-blue-600" />
                PWA Offline-First
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Service Worker com estratégias Cache-First para os assets da interface e Stale-While-Revalidate para o catálogo de dados.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-[#0b211d] dark:text-[#f8f6ef]">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                Validação Contínua Zod
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Contratos de dados estritos (0% any), correção de eixos lat/lng e fallbacks integrados eliminam quebras de renderização.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Editorial: Citação & Ação */}
        <footer className="pt-8 border-t border-stone-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Como citar:</span> IFRO Campus Vilhena; SEMMA Vilhena.
            (2026). <em>Inventário Arbóreo Digital do Parque Ecológico Municipal Marechal Cândido Rondon</em>. Plataforma FloraParqueEco v1.0.
          </div>

          <button
            onClick={onBackToMap}
            className="px-5 py-2.5 rounded-xl bg-[#0b211d] hover:bg-[#183d35] text-[#f8f6ef] font-bold text-xs transition-colors flex-shrink-0 shadow-md"
          >
            Retornar ao Mapa Interativo
          </button>
        </footer>
      </article>
    </div>
  );
};
