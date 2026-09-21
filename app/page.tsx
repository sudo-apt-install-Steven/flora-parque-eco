import React, { Suspense } from 'react';
import { ParkInventoryApp } from '@/components/ParkInventoryApp';

export default function Home() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#0b211d] flex items-center justify-center text-[#d6a35b]">Carregando Parque Ecológico...</div>}>
      <ParkInventoryApp />
    </Suspense>
  );
}
