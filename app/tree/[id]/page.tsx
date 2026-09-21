import React, { Suspense } from 'react';
import { ParkInventoryApp } from '@/components/ParkInventoryApp';
import { getAllTrees } from '@/lib/trees';

export function generateStaticParams() {
  const trees = getAllTrees();
  return trees.map((tree) => ({ id: tree.id }));
}

interface TreePageProps {
  params: Promise<{ id: string }>;
}

export default async function TreePage({ params }: TreePageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#0b211d] flex items-center justify-center text-[#d6a35b]">Localizando espécime #{id}...</div>}>
      <ParkInventoryApp initialTreeId={id} />
    </Suspense>
  );
}
