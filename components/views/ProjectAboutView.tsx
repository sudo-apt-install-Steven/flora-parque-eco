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
            Diversidade Vegetal e Interações Ecológicas no Parque Ecológico Municipal Marechal Rondon
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-stone-600 dark:text-[#9bb0a6] leading-relaxed">
            Identificação de espécies por imagem (PlantNet), levantamento de 32 espécimes em 3 setores
            e plataforma cartográfica digital com renderização WebGL — Vilhena, RO, 2026.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-white/10">
            <div><strong>Autoria:</strong> Equipe 2 — IFRO Campus Vilhena, Turma 3B Informática</div>
            <div><strong>Orientação:</strong> Prof. Alan Candido da Silva</div>
            <div><strong>Território:</strong> Vilhena, Rondônia, Brasil (12°42′ S · 60°07′ O)</div>
            <div><strong>Data de Campo:</strong> 14/09/2026</div>
          </div>
        </header>

        {/* Resumo / Abstract */}
        <section className="p-6 rounded-2xl bg-white/70 dark:bg-white/[0.03] border-l-4 border-[#d6a35b] border border-stone-200 dark:border-white/10 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0b211d] dark:text-[#d6a35b]">
            Resumo (Abstract)
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            Este projeto documenta o inventário dendrológico do Parque Ecológico Municipal Marechal Rondon (Vilhena–RO),
            conduzido em 14 de setembro de 2026 pela Equipe 2 do Projeto Integrador de Ciências da Natureza do IFRO Campus Vilhena
            (turma 3B Informática), sob orientação do Prof. Alan Candido da Silva. Foram registrados <strong>32 espécimes</strong> distribuídos
            em <strong>21 espécies</strong> e <strong>10 famílias botânicas</strong>, com identificação primária assistida pelo aplicativo PlantNet.
            O território foi dividido em três setores amostrais. A plataforma digital FloraParqueEco disponibiliza
            cartograficamente esses dados em Progressive Web App (PWA) com renderização WebGL acelerada por GPU.
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
            A pesquisa foi realizada no dia <strong>14/09/2026, entre 14h45 e 15h30</strong>. Para viabilizar
            cobertura ampla dos diferentes microambientes, o parque foi dividido em três setores operacionais,
            cada um investigado por uma equipe distinta:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                <h3 className="font-bold text-sm text-[#0b211d] dark:text-[#f8f6ef]">Grupo A — Área Verde</h3>
              </div>
              <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                Gramado Noroeste (Entrada / Estrutura Administrativa)
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Região gramada e arborizada próxima à entrada do parque. Concentra principalmente espécies
                <strong> exóticas ornamentais</strong>: Jacarandá-mimoso, Hibisco, Bisnagueira e Mangueira.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#06b6d4]" />
                <h3 className="font-bold text-sm text-[#0b211d] dark:text-[#f8f6ef]">Grupo B — Área Ciano</h3>
              </div>
              <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                Gramado Nordeste, Trilha & Parquinho Infantil
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Região com trilha mais arborizada à <strong>margem direita do lago</strong>. Apresenta maior diversidade:
                palmeiras ornamentais (Wodyetia, Bismarckia), frutíferas (Goiabeira, Ingá-mirim, Jambo-vermelho)
                e espécies tóxicas (Chapéu-de-napoleão).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <h3 className="font-bold text-sm text-[#0b211d] dark:text-[#f8f6ef]">Grupo C — Área Vermelha</h3>
              </div>
              <div className="text-xs font-semibold text-red-700 dark:text-red-400">
                Faixa de Mata Ciliar — Borda do Lago
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Faixa de mata ciliar ao redor da borda do lago. Concentra a <strong>maior parte das espécies nativas</strong>
                adaptadas a ambientes úmidos: Samaúma, Pau-pombo, Brinco-de-índio, Ipê-rosa e Cambará.
                Ponto de atenção: Bisnagueira e Acácia-australiana com potencial invasor.
              </p>
            </div>
          </div>
        </section>

        {/* Seção 1b: Equipe de Pesquisa */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#d6a35b]" />
            <h2 className="font-serif text-xl font-bold text-[#0b211d] dark:text-[#f8f6ef]">
              Equipe de Pesquisa — Projeto Integrador IFRO
            </h2>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400">
            Turma 3B Informática · Professor: Alan Candido da Silva · Data: 14/09/2026
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { nome: 'Vinícius Silva Martins Costa', funcao: 'Coordenador & Relatório' },
              { nome: 'Steven Tayllon T. J. de Melos', funcao: 'Apoio de Campo & Mapeamento' },
              { nome: 'João Paulo C. Neves', funcao: 'Registro Fotográfico' },
              { nome: 'Guilherme Sperfeld Vorgnes', funcao: 'Foto & Classificação' },
              { nome: 'Luan Carlos S. de Jesus', funcao: 'Registro Fotográfico' },
              { nome: 'Marcilei Alves de Lira', funcao: 'Classificação das Plantas' },
              { nome: 'Arthur S. R. B. Mathias', funcao: 'Apoio de Campo' },
            ].map((m) => (
              <div key={m.nome} className="p-3 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-1">
                <div className="text-xs font-bold text-[#0b211d] dark:text-[#f8f6ef] leading-snug">{m.nome}</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400">{m.funcao}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Seção 2: Resultados Quantitativos */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#d6a35b]">02.</span>
            <h2 className="font-serif text-2xl font-bold text-[#0b211d] dark:text-[#f8f6ef]">
              Resultados do Levantamento de Campo
            </h2>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { valor: '32', label: 'Espécimes registrados', cor: 'text-emerald-700 dark:text-emerald-400' },
              { valor: '21', label: 'Espécies distintas', cor: 'text-cyan-700 dark:text-cyan-400' },
              { valor: '10', label: 'Famílias botânicas', cor: 'text-[#d6a35b]' },
              { valor: '3', label: 'Setores amostrais', cor: 'text-red-600 dark:text-red-400' },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 text-center space-y-1">
                <div className={`font-serif text-3xl font-extrabold ${s.cor}`}>{s.valor}</div>
                <div className="text-xs text-stone-600 dark:text-stone-400 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Nativas vs Exóticas */}
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b211d] dark:text-[#d6a35b]">
              Distribuição: Espécies Nativas × Exóticas
            </h3>
            <div className="flex gap-3 text-xs">
              <div className="flex-1 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <div className="font-bold text-emerald-800 dark:text-emerald-300">🌿 Nativas — 52,4% (11 spp.)</div>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  Algodão-bravo, Goiabeira, Munguba, Ingá-mirim, Jacarandá-de-minas, Trema (Crindiúva),
                  Brinco-de-índio, Pau-pombo, Samaúma, Ipê-rosa, Cambará.
                </p>
                <p className="text-stone-500 dark:text-stone-500 italic">
                  Concentram-se na mata ciliar (Grupo C), responsáveis pela proteção das margens do lago e pela manutenção da fauna.
                </p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-1.5">
                <div className="font-bold text-amber-800 dark:text-amber-300">🌍 Exóticas — 47,6% (10 spp.)</div>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  Eucalipto, Jacarandá-mimoso, Hibisco, Bisnagueira, Mangueira, Palmeira-rabo-de-raposa,
                  Chapéu-de-napoleão, Jambo-vermelho, Palmeira-azul, Acácia-australiana.
                </p>
                <p className="text-stone-500 dark:text-stone-500 italic">
                  Predominam nas áreas recreativas e paisagísticas. Bisnagueira e Acácia-australiana
                  são pontos de atenção para manejo futuro (potencial invasor).
                </p>
              </div>
            </div>
          </div>

          {/* Espécies mais abundantes + ecologia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-2">
              <div className="text-xs font-bold text-[#0b211d] dark:text-[#f8f6ef] flex items-center gap-2">
                <Trees className="w-4 h-4 text-emerald-600" />
                Espécies Mais Abundantes
              </div>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1 list-disc list-inside pl-1">
                <li><strong>Mangueira</strong> (Mangifera indica) — 5 indivíduos</li>
                <li><strong>Ipê-rosa</strong> (Tabebuia rosea) — 3 indivíduos</li>
                <li><strong>Jacarandá-mimoso</strong> (Jacaranda mimosifolia) — 3 indivíduos</li>
              </ul>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-2">
              <div className="text-xs font-bold text-[#0b211d] dark:text-[#f8f6ef] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d6a35b]" />
                Importância Ecológica Especial
              </div>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1 list-disc list-inside pl-1">
                <li><strong>Samaúma</strong> — atrai morcegos polinizadores; produz paina usada por aves em ninhos</li>
                <li><strong>Mangueira, Goiabeira, Jambo-vermelho, Ingá-mirim</strong> — frutíferas que alimentam a fauna local</li>
                <li>Aves observadas sob Ipê-rosa próximo ao lago — uso como abrigo documentado</li>
                <li>Líquens em exemplares de Mangueira indicam boa qualidade do ar</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Seção 3: Protocolo de IA PlantNet e Limitações Metodológicas */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#d6a35b]">03.</span>
            <h2 className="font-serif text-2xl font-bold text-[#0b211d] dark:text-[#f8f6ef]">
              Triagem por Inteligência Artificial (PlantNet) & Limitações
            </h2>
          </div>

          <div className="space-y-3 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <p>
              A identificação primária das amostras fotográficas foi realizada com o aplicativo <strong>PlantNet</strong>,
              que emprega redes neurais convolucionais treinadas em milhões de registros taxonômicos globais.
              Cada equipe fotografou partes distintas das plantas (tronco, folhas, galhos, frutos e flores quando presentes)
              para submissão ao aplicativo em campo, em tempo real.
            </p>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Protocolo de Confiança adotado neste Inventário:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-stone-700 dark:text-stone-300 pl-1">
                <li>
                  <strong>Score ≥ 85% (Confiança Alta):</strong> Hipótese taxonômica robusta — identificação aceita com características diagnósticas evidentes. Ex.: Ingá-mirim (99%), Eucalipto (95%), Algodão-bravo (94–95%).
                </li>
                <li>
                  <strong>Score 70–84% (Confiança Média / Em análise):</strong> Exige vistoria dendrológica complementar e confronto com literatura regional. Ex.: Jacarandá-mimoso (77–83%), Trema (70%), Palmeira-azul (77%).
                </li>
                <li>
                  <strong>Score &lt; 70% (Identificação Preliminar):</strong> Hipótese a ser confirmada em campo com botânico especialista. Ex.: Hibisco (58%), Bisnagueira (54%), Cambará (55–60%), Mangueira C-05 (49%).
                </li>
                <li>
                  <strong>Limitação Fenológica:</strong> A pesquisa ocorreu em 14/09/2026 (período de estiagem em Vilhena–RO). A ausência de flores e frutos em muitos espécimes reduz a acurácia da identificação por imagem, afetando especialmente espécies identificadas apenas por casca e filotaxia estéril.
                </li>
                <li>
                  <strong>Status Oficial:</strong> Nenhuma árvore recebe plaqueta definitiva sem chancela de botânico e confronto com herbários de referência (Flora e Funga do Brasil / GBIF / POWO).
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Seção 4: Arquitetura Tecnológica e GIS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#d6a35b]">04.</span>
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

        {/* Seção 5: Conclusões */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#d6a35b]">05.</span>
            <h2 className="font-serif text-2xl font-bold text-[#0b211d] dark:text-[#f8f6ef]">
              Conclusões & Perspectivas Futuras
            </h2>
          </div>

          <div className="space-y-3 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <p>
              A vegetação do Parque Ecológico Municipal Marechal Rondon desempenha uma <strong>dupla função</strong>:
              paisagística, por meio das espécies exóticas ornamentais predominantes nas áreas de uso recreativo;
              e ecológica, por meio das espécies nativas responsáveis pela proteção das margens do lago e
              pela manutenção da fauna associada.
            </p>
            <p>
              A distribuição não é homogênea: as espécies exóticas concentram-se nas áreas de acesso e gramados
              (Grupos A e B), enquanto as nativas predominam na faixa de mata ciliar ao redor do lago (Grupo C).
              A hipótese inicial da equipe — de predominância de diversidade vegetal com presença de exóticas ornamentais —
              foi corroborada pelos dados coletados (52,4% nativas / 47,6% exóticas).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 space-y-2">
              <div className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Pontos de Atenção para Manejo
              </div>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1 list-disc list-inside pl-1">
                <li>Bisnagueira (<em>Spathodea campanulata</em>) — exótica invasora</li>
                <li>Acácia-australiana (<em>Acacia mangium</em>) — rápido crescimento e potencial invasor</li>
                <li>Monitoramento contínuo de espécies com score PlantNet abaixo de 70%</li>
              </ul>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 space-y-2">
              <div className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Investigações Futuras Sugeridas
              </div>
              <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1 list-disc list-inside pl-1">
                <li>Impacto das exóticas invasoras sobre a vegetação nativa do entorno</li>
                <li>Relação entre floração/frutificação e presença de fauna ao longo do ano</li>
                <li>Confirmação botânica dos espécimes com confiança baixa por especialista</li>
                <li>Ortomosaico de drone georreferenciado para atualização cartográfica</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer Editorial: Citação & Ação */}
        <footer className="pt-8 border-t border-stone-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left space-y-1">
            <div>
              <span className="font-semibold text-stone-700 dark:text-stone-300">Como citar:</span> COSTA, V. S. M. et al.
              (2026). <em>Relatório de Pesquisa — Diversidade Vegetal e Interações Ecológicas no Parque Ecológico Municipal Marechal Rondon</em>.
              Projeto Integrador IFRO Campus Vilhena, Turma 3B Informática.
            </div>
            <div>
              <span className="font-semibold text-stone-700 dark:text-stone-300">Plataforma:</span> FloraParqueEco v1.0 · IFRO Campus Vilhena & SEMMA Vilhena, 2026.
            </div>
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
