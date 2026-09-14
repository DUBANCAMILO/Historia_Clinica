'use client';
import React, { useEffect, useState } from 'react';

export default function LoginSplash({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');

  useEffect(() => {
    const steps = [
      { target: 30, delay: 300 },
      { target: 60, delay: 700 },
      { target: 85, delay: 1200 },
      { target: 100, delay: 1800 },
    ];
    steps.forEach(({ target, delay }) => {
      setTimeout(() => setProgress(target), delay);
    });
    setTimeout(() => {
      setPhase('done');
      setTimeout(onDone, 400);
    }, 2400);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 bg-primary z-50 flex flex-col items-center justify-center transition-opacity duration-400 ${
        phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <img
        src="/assets/images/WhatsApp_Image_2026-09-04_at_10.38.24-1788743376541.jpeg"
        alt="NefroHC logo"
        className="w-24 h-24 rounded-2xl object-cover bg-white p-2 shadow-elevated animate-pulse-soft mb-6"
      />
      <h1 className="text-white text-3xl font-bold mb-2">NefroHC</h1>
      <p className="text-blue-200 text-sm mb-10">Cargando sistema clínico...</p>
      <div className="w-64 bg-white/20 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-blue-300 text-xs mt-3 font-tabular">{progress}%</p>
    </div>
  );
}