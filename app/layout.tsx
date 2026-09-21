import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Parque Ecológico — Inventário Arbóreo Digital',
  description:
    'Catálogo interativo da flora arbórea do Parque Ecológico Municipal Marechal Cândido Rondon e IFRO Campus Vilhena, Rondônia.',
  keywords: [
    'Parque Ecológico',
    'Vilhena',
    'Rondônia',
    'IFRO',
    'Inventário Arbóreo',
    'Botânica',
    'PlantNet',
    'Árvores Nativas'
  ],
  authors: [{ name: 'IFRO Campus Vilhena & Antigravity Lead Engineer' }],
  icons: {
    icon: '/favicon.ico'
  },
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#10b981'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full w-full">
      <body className="h-full w-full overflow-hidden bg-[#0b211d] text-[#f4f1e8] antialiased select-none">
        {children}
      </body>
    </html>
  );
}
