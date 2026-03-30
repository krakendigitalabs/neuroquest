'use client';

import Image from 'next/image';

const BRAND_SYMBOL = 'https://res.cloudinary.com/dr50ioh9h/image/upload/v1774648742/simbolo_nq_okc053.png';

export function InteractiveBlobLogo() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.76),rgba(247,249,252,0.48))] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-8 top-4 h-16 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.24),transparent_72%)] blur-2xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(107,215,255,0.42),rgba(31,107,232,0.28)_48%,rgba(16,43,99,0.14)_68%,transparent_74%)] blur-md" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D4AF37]/12" />
      <div className="relative z-10 flex h-[220px] w-full items-center justify-center">
        <div className="animate-breathe relative flex h-[170px] w-[170px] items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,255,255,0.42))] shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(107,215,255,0.34),rgba(31,107,232,0.14)_60%,transparent_76%)] blur-sm" />
          <Image src={BRAND_SYMBOL} alt="NeuroQuest symbol" width={82} height={82} className="relative z-10 h-20 w-20 object-contain" />
        </div>
      </div>
    </div>
  );
}
