'use client';

import React from 'react';
import { ChevronLeft, Compass, Trees, Sparkles, MapPin, ShieldCheck, GraduationCap } from 'lucide-react';
import { PARK_CONFIG } from '@/lib/park-config';

interface ProjectAboutViewProps {
  onBackToMap: () => void;
}

export const ProjectAboutView: React.FC<ProjectAboutViewProps> = ({ onBackToMap }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] p-4 sm:p-8 md:p-12 lg:px-24 bg-[#f4f1e8] dark:bg-[#091a17] text-[#102a26] dark:text-[#f8f6ef] overflow-y-auto smooth-touch-scroll">
      {/* Botão Voltar */}
      <button
        onClick={onBackToMap}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-stone-300 dark:border-white/10 text-stone-700 dark:text-stone-200 transition-all shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar ao mapa
      </button>

      {/* Hero Section */}
      <div className="max-w-3xl my-8 md:my-14">
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d6a35b]">
          Sobre o Inventário Arbóreo
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0b211d] dark:text-[#f8f6ef] leading-[1.05] mt-2">
          Ciência que cria vínculo com o território.
        </h1>
        <p className="font-serif text-base sm:text-xl text-stone-600 dark:text-[#9bb0a6] leading-relaxed mt-6">
          O Parque Ecológico Municipal Marechal Cândido Rondon é um laboratório vivo integrado
          à comunidade de Vilhena e ao IFRO Campus Vilhena. Esta plataforma digital registra cada espécime
          arbóreo, suas evidências fotográficas e história, transformando uma simples caminhada em descoberta científica.
        </p>
      </div>

      {/* Grid de Pilares Metodológicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-stone-300 dark:border-white/10 mb-12">
        <article className="p-6 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-3">
          <span className="font-serif text-2xl font-bold text-[#d6a35b]">01</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h2 className="font-serif text-lg font-bold text-[#0b211d] dark:text-[#f8f6ef]">
            Levantamento em Campo
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Estudantes e professores realizam a geolocalização com receptores de precisão,
            fotografando casca, folhas, flores e frutos de cada árvore catalogada nos setores do parque.
          </p>
        </article>

        <article className="p-6 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-3">
          <span className="font-serif text-2xl font-bold text-[#d6a35b]">02</span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-serif text-lg font-bold text-[#0b211d] dark:text-[#f8f6ef]">
            Identificação Assistida
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Algoritmos do PlantNet analisam os registros visuais e sugerem taxa botânicos com cálculo de confiança,
            que passam por revisão por pares antes de receber plaqueta definitiva.
          </p>
        </article>

        <article className="p-6 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 space-y-3">
          <span className="font-serif text-2xl font-bold text-[#d6a35b]">03</span>
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
            <Trees className="w-4 h-4" />
          </div>
          <h2 className="font-serif text-lg font-bold text-[#0b211d] dark:text-[#f8f6ef]">
            Conhecimento Aberto
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Cartografia digital pública e acessível que permite a visitantes e escolas locais ler QR Codes nas árvores,
            compreender a importância da flora amazônica e defender a conservação urbana.
          </p>
        </article>
      </div>

      {/* Institucional & Metadados */}
      <div className="p-6 rounded-2xl bg-[#0b211d] text-[#f4f1e8] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#f8f6ef]">
            {PARK_CONFIG.name}
          </h3>
          <p className="text-xs text-[#9bb0a6] mt-1">
            Vilhena, Rondônia, Brasil · Parceria Acadêmica e Tecnológica com o {PARK_CONFIG.institution}
          </p>
        </div>
        <button
          onClick={onBackToMap}
          className="px-5 py-2.5 rounded-xl bg-[#d6a35b] hover:bg-[#f0c77b] text-[#0b211d] font-bold text-xs transition-colors flex-shrink-0"
        >
          Explorar o Mapa Agora
        </button>
      </div>
    </div>
  );
};
