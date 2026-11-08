import React from 'react';
import { Check } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-neutral-700 animate-bounce">
      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
        <Check className="w-4 h-4 stroke-[3]" />
      </div>
      <span className="text-xs sm:text-sm font-bold">{message}</span>
    </div>
  );
}
