import React from 'react';
import { Sparkles, Phone, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer({ navigateTo }) {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-12 border-t border-neutral-800 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg font-black text-white">KesavaCleaning</span>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed">
            India's premier high-grade liquid formulations store. Engineered with organic citric acids, Ayurvedic neem extracts, and bio-enzymes for pristine hard-surface hygiene.
          </p>
          <p className="text-emerald-400 font-bold text-xs">🇮🇳 Crafted & Bottled in India</p>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Shop Categories</h4>
          <ul className="space-y-2 text-neutral-400">
            <li><button onClick={() => navigateTo('/shop')} className="hover:text-emerald-400 transition">Kitchen Degreasers</button></li>
            <li><button onClick={() => navigateTo('/shop')} className="hover:text-emerald-400 transition">Neem Floor Washes</button></li>
            <li><button onClick={() => navigateTo('/shop')} className="hover:text-emerald-400 transition">Streak-Free Glass Cleaners</button></li>
            <li><button onClick={() => navigateTo('/shop')} className="hover:text-emerald-400 transition">5L Canister Value Packs</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Customer Care</h4>
          <ul className="space-y-2 text-neutral-400">
            <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-400" /> +91 (800) 243-2678</li>
            <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Bengaluru & Hyderabad Hubs</li>
            <li><button onClick={() => navigateTo('/cart')} className="hover:text-emerald-400 transition">Check Past Orders & Cart</button></li>
            <li><span className="text-emerald-300">GST Invoice Provided on All Purchases</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Kesava Store Admin</h4>
          <p className="text-neutral-400 text-xs mb-3">
            Authorized administrators manage real-time inventory, customer orders, and promotional coupons.
          </p>
          <button 
            onClick={() => navigateTo('/admin')} 
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Open Admin Portal</span>
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-neutral-800 text-center text-xs text-neutral-500">
        &copy; 2026 KesavaCleaning Pvt Ltd. All rights reserved. Strictly bottled formulations for hard surfaces.
      </div>
    </footer>
  );
}
