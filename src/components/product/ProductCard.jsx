import React from 'react';
import { Star, ShoppingBag, Flame } from 'lucide-react';

export default function ProductCard({ product, navigateTo, addToCart, storeWideDiscount }) {
  // Individual discount calculation
  const individualDiscountPct = Math.round(((product.regularPrice - product.offerPrice) / product.regularPrice) * 100);

  // Store-wide discount calculation
  const hasStoreWide = storeWideDiscount && storeWideDiscount.active && storeWideDiscount.percentage > 0;
  const effectivePrice = hasStoreWide 
    ? Math.round(product.offerPrice * (1 - storeWideDiscount.percentage / 100))
    : product.offerPrice;

  const totalDiscountPct = Math.round(((product.regularPrice - effectivePrice) / product.regularPrice) * 100);

  const handleAdd = () => {
    // Add product with currently effective promotional price
    addToCart({
      ...product,
      offerPrice: effectivePrice
    }, 1);
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-neutral-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Thumbnail & Badges */}
        <div 
          className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 mb-2.5 sm:mb-4 cursor-pointer" 
          onClick={() => navigateTo('/product/:id', product.id)}
        >
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Volume badge */}
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-sm text-neutral-800 text-[9px] sm:text-[11px] font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
            {product.volume}
          </span>

          {/* Discount badge */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1 items-end">
            {hasStoreWide ? (
              <span className="bg-red-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5 sm:gap-1">
                <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                <span>{totalDiscountPct}% OFF</span>
              </span>
            ) : (
              individualDiscountPct > 0 && (
                <span className="bg-red-500 text-white text-[9px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
                  {individualDiscountPct}% OFF
                </span>
              )
            )}
          </div>

          {/* Low Stock Warning */}
          {product.stock <= 15 && product.stock > 0 && (
            <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-amber-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
              Only {product.stock} left!
            </span>
          )}

          {product.stock === 0 && (
            <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Category & Name */}
        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-600 block truncate">
            {product.category}
          </span>
          <h3 
            onClick={() => navigateTo('/product/:id', product.id)}
            className="font-extrabold text-xs sm:text-base text-neutral-900 group-hover:text-emerald-700 transition cursor-pointer line-clamp-2 min-h-[2rem] sm:min-h-0 leading-snug"
          >
            {product.name}
          </h3>
          <p className="text-[10px] sm:text-xs text-neutral-500 line-clamp-1">{product.scent}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-2">
          <div className="flex text-amber-400">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-neutral-700">{product.rating}</span>
          <span className="text-[9px] sm:text-[11px] text-neutral-400">({product.reviewsCount})</span>
        </div>
      </div>

      {/* Pricing & Add to Cart */}
      <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
            <span className="text-sm sm:text-lg font-black text-emerald-800 leading-none">₹{effectivePrice}</span>
            {hasStoreWide ? (
              <span className="text-[10px] sm:text-xs text-neutral-400 line-through">₹{product.offerPrice}</span>
            ) : (
              <span className="text-[10px] sm:text-xs text-neutral-400 line-through">₹{product.regularPrice}</span>
            )}
          </div>
          <span className="text-[8px] sm:text-[10px] font-bold text-emerald-600 block truncate mt-0.5">Free delivery &gt; ₹499</span>
        </div>

        <button 
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 active:scale-95 text-white transition flex items-center justify-center shadow-md shadow-emerald-600/20 cursor-pointer shrink-0"
          aria-label={`Add ${product.name} to Cart`}
        >
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
