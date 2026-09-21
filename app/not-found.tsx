import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center bg-[#0b211d] text-[#f4f1e8]">
      <div className="max-w-md w-full rounded-2xl border border-emerald-900/60 bg-[#0e2a25]/90 p-8 shadow-2xl backdrop-blur-md">
        <span className="text-4xl mb-4 block" aria-hidden="true">🌿</span>
        <h1 className="text-2xl font-serif font-bold text-amber-300 mb-2">
          Espécime Não Encontrado
        </h1>
        <p className="text-sm text-stone-300 mb-6 leading-relaxed">
          O registro botânico ou a página solicitada não foi localizada no inventário do Parque Ecológico.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          Retornar ao Mapa Principal
        </Link>
      </div>
    </main>
  );
}
