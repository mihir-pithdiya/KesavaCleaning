import React from 'react';
import { ChevronRight, Flame } from 'lucide-react';

export default function PromoBanner({ navigateTo, storeWideDiscount }) {
  const isSaleActive = storeWideDiscount && storeWideDiscount.active;

  return (
    <aside aria-label="Offers banner" className={`${isSaleActive ? 'bg-gradient-to-r from-red-900 via-emerald-950 to-neutral-900' : 'bg-emerald-900'} text-emerald-100 text-xs sm:text-sm py-2 px-4 font-medium tracking-wide flex items-center justify-between overflow-x-auto whitespace-nowrap transition-colors`}>
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isSaleActive ? (
            <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
              <Flame className="w-3 h-3 fill-white" />
              <span>{storeWideDiscount.percentage}% STORE-WIDE SALE</span>
            </span>
          ) : (
            <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
              OFFICIAL KESAVACLEANING
            </span>
          )}
          <span>
            {isSaleActive 
              ? storeWideDiscount.bannerText 
              : <span>Use code <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded">KESAVA10</strong> for 10% OFF &bull; Free Shipping on orders over ₹499!</span>}
          </span>
        </div>
        <button 
          onClick={() => navigateTo('/cart')} 
          className="hidden sm:inline-flex items-center gap-1 text-emerald-200 hover:text-white underline underline-offset-4 text-xs font-semibold cursor-pointer shrink-0"
        >
          <span>View Store Coupons</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
