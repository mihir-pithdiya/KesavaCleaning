import React from 'react';
import { 
  Leaf, 
  ShieldCheck, 
  Truck, 
  Droplet, 
  ShoppingBag, 
  Tag, 
  ChevronRight, 
  Sparkles,
  ShoppingBag as ShopIcon,
  Flame
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/product/ProductCard';

export default function HomePage({ products, navigateTo, addToCart, storeWideDiscount }) {
  const featuredProducts = products.filter(p => p.featured);
  const isSaleActive = storeWideDiscount && storeWideDiscount.active;

  return (
    <div className="space-y-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-neutral-50 pt-8 pb-16 lg:py-20 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kesava Bio-Formulas &bull; Non-Toxic Chemistry</span>
              </div>

              {isSaleActive && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider border border-red-200">
                  <Flame className="w-3.5 h-3.5 fill-red-600 text-red-600 animate-bounce" />
                  <span>Limited Time: Extra {storeWideDiscount.percentage}% Store-Wide Discount Active!</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.15]">
                Heavy on Dirt. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">
                  Gentle on Your Family.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Discover high-efficiency bottled cleaning liquids by <strong>KesavaCleaning</strong>. From burnt kitchen grease to sparkling marble floors, experience spotless purity with organic citric acid, neem, and mountain pine.
              </p>

              {/* Dual Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button 
                  onClick={() => navigateTo('/shop')}
                  className="w-full sm:w-auto min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3.5 rounded-full shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <ShopIcon className="w-4 h-4" />
                  <span>Shop All Liquids (Starting ₹189)</span>
                </button>

                <button 
                  onClick={() => navigateTo('/cart')}
                  className="w-full sm:w-auto min-h-[48px] bg-white hover:bg-neutral-100 text-neutral-800 font-bold px-7 py-3.5 rounded-full border border-neutral-300 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Active Offers & Coupons</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-neutral-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-800 leading-tight">100% Plant Bio-Enzymes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-800 leading-tight">Pet & Baby Safe Formula</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-800 leading-tight">Free Shipping Above ₹499</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-800 leading-tight">Streak-Free Guaranteed</span>
                </div>
              </div>

            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-2xl overflow-hidden">
                <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                  Signature Trio
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1000&q=85" 
                  alt="KesavaCleaning bottles showcase" 
                  className="w-full h-64 sm:h-72 object-cover rounded-2xl mb-4"
                />
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 uppercase">Featured Liquid Pack</span>
                      <h3 className="font-extrabold text-neutral-900 text-lg">Citrus & Neem Triple Bottle Pack</h3>
                    </div>
                    <span className="text-xl font-black text-emerald-700">₹749</span>
                  </div>
                  <p className="text-xs text-neutral-500">Includes 500ml Degreaser, 1L Floor Wash, and 500ml Mirror Spray.</p>
                  <button 
                    onClick={() => {
                      if (products[0]) addToCart(products[0], 1);
                      if (products[1]) addToCart(products[1], 1);
                    }}
                    className="w-full mt-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Quick Add Combo to Cart</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Specialized Formulations</span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-1">
            Shop Liquids by Surface Need
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Targeted solutions engineered for kitchen grease, limescale, window haze, and hard-floor sanitization.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => navigateTo('/shop')}
              className="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-emerald-500 hover:shadow-md transition text-left group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-neutral-800 group-hover:text-emerald-700 transition leading-snug">
                  {cat}
                </h3>
                <span className="text-[10px] text-neutral-400 mt-1 block">Explore Liquids &rarr;</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Customer Favorites</span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-1">
              Popular Cleaning Liquids
            </h2>
          </div>
          <button 
            onClick={() => navigateTo('/shop')}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({products.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((p) => (
            <ProductCard 
              key={p.id} 
              product={p} 
              navigateTo={navigateTo} 
              addToCart={addToCart} 
              storeWideDiscount={storeWideDiscount}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
