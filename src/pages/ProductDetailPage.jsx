import React, { useState } from 'react';
import { ArrowLeft, Star, AlertCircle, Tag, ShoppingBag, Flame, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage({ 
  product, 
  navigateTo, 
  addToCart, 
  storeWideDiscount,
  openAuthModal 
}) {
  const { isAuthenticated } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedQty, setSelectedQty] = useState(1);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="font-bold text-neutral-600">Formulation not found.</p>
        <button 
          onClick={() => navigateTo('/shop')}
          className="mt-4 bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-full cursor-pointer"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const hasStoreWide = storeWideDiscount && storeWideDiscount.active && storeWideDiscount.percentage > 0;
  const effectivePrice = hasStoreWide 
    ? Math.round(product.offerPrice * (1 - storeWideDiscount.percentage / 100))
    : product.offerPrice;

  const images = product.images || [product.images[0]];
  const discountPct = Math.round(((product.regularPrice - effectivePrice) / product.regularPrice) * 100);

  const handleAdd = () => {
    addToCart({
      ...product,
      offerPrice: effectivePrice
    }, selectedQty);
  };

  const handleBuyNow = () => {
    addToCart({
      ...product,
      offerPrice: effectivePrice
    }, selectedQty);

    // If not logged in, require login/signup before proceeding
    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal('login');
      return;
    }
    navigateTo('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back button */}
      <button 
        onClick={() => navigateTo('/shop')}
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-emerald-700 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Cleaning Liquids</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-neutral-200 shadow-md">
            <img 
              src={images[activeImageIndex] || images[0]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow">
              {product.volume}
            </span>
            {discountPct > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                {hasStoreWide && <Flame className="w-3.5 h-3.5 fill-white" />}
                <span>Save {discountPct}%</span>
              </span>
            )}
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition cursor-pointer ${activeImageIndex === i ? 'border-emerald-600 shadow-md' : 'border-neutral-200 opacity-70'}`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Liquid Specs & Actions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 block">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 mt-1">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3 mt-3">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span className="text-xs font-bold text-neutral-700">{product.rating} / 5.0</span>
              <span className="text-xs text-neutral-400">&bull; {product.reviewsCount} Verified Customer Reviews</span>
            </div>
          </div>

          {/* Price Bar */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-baseline gap-3">
            <span className="text-3xl font-black text-emerald-800">₹{effectivePrice}</span>
            <span className="text-sm text-neutral-400 line-through">₹{product.regularPrice}</span>
            <span className="text-xs font-extrabold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
              Save ₹{product.regularPrice - effectivePrice}
            </span>
            <span className="ml-auto text-xs font-bold text-neutral-600">Inclusive of all taxes</span>
          </div>

          {hasStoreWide && (
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs flex items-center gap-2 text-red-800 font-bold">
              <Flame className="w-4 h-4 text-red-600 fill-red-600 shrink-0" />
              <span>{storeWideDiscount.bannerText}</span>
            </div>
          )}

          <p className="text-sm text-neutral-600 leading-relaxed">
            {product.description}
          </p>

          {/* Liquid Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-neutral-200">
              <span className="font-bold text-neutral-400 block uppercase text-[10px]">Net Volume</span>
              <span className="font-black text-neutral-800 text-sm">{product.volume}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-neutral-200">
              <span className="font-bold text-neutral-400 block uppercase text-[10px]">Aroma / Fragrance</span>
              <span className="font-bold text-neutral-800">{product.scent}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-neutral-200">
              <span className="font-bold text-neutral-400 block uppercase text-[10px]">Formula pH Balance</span>
              <span className="font-bold text-neutral-800">{product.pH}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-neutral-200">
              <span className="font-bold text-neutral-400 block uppercase text-[10px]">Stock Availability</span>
              <span className="font-bold text-emerald-700">{product.stock > 0 ? `${product.stock} units ready to ship` : 'Out of stock'}</span>
            </div>
          </div>

          {/* Suitable Surfaces */}
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-neutral-700 uppercase tracking-wider block">Recommended Surfaces:</span>
            <p className="text-neutral-600 bg-neutral-100/70 p-3 rounded-xl border border-neutral-200">
              {product.surfaces}
            </p>
          </div>

          {/* Safety instructions */}
          <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Usage & Safety Caution:</span>
              <span>{product.cautions}</span>
            </div>
          </div>

          {/* Coupon stack reminder */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-100/50 to-teal-50 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-900">
                Coupons stack! Apply code <strong>KESAVA10</strong> at checkout for an extra 10% OFF.
              </span>
            </div>
          </div>

          {/* Quantity Counter & CTA Row (Desktop) */}
          <div className="hidden sm:flex items-center gap-4 pt-4 border-t border-neutral-200">
            <div className="inline-flex items-center border border-neutral-300 rounded-2xl bg-neutral-50 px-3 py-1.5">
              <button 
                onClick={() => selectedQty > 1 && setSelectedQty(q => q - 1)}
                className="w-8 h-8 flex items-center justify-center font-bold text-neutral-700 hover:text-emerald-700 text-base cursor-pointer"
              >
                -
              </button>
              <span className="text-sm font-black px-4">{selectedQty}</span>
              <button 
                onClick={() => setSelectedQty(q => q + 1)}
                className="w-8 h-8 flex items-center justify-center font-bold text-neutral-700 hover:text-emerald-700 text-base cursor-pointer"
              >
                +
              </button>
            </div>

            <button 
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="flex-1 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart &bull; ₹{effectivePrice * selectedQty}</span>
            </button>

            <button 
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="min-h-[48px] bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow transition cursor-pointer flex items-center gap-2"
            >
              {!isAuthenticated && <Lock className="w-4 h-4 text-amber-400" />}
              <span>{isAuthenticated ? 'Buy Now' : 'Sign In to Buy'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 bg-white border-t border-neutral-200 p-3 px-4 flex items-center gap-3 shadow-2xl">
        <div className="inline-flex items-center border border-neutral-300 rounded-xl bg-neutral-50 px-2 py-1">
          <button 
            onClick={() => selectedQty > 1 && setSelectedQty(q => q - 1)}
            className="w-7 h-7 flex items-center justify-center font-bold text-neutral-700"
          >
            -
          </button>
          <span className="text-xs font-black px-2">{selectedQty}</span>
          <button 
            onClick={() => setSelectedQty(q => q + 1)}
            className="w-7 h-7 flex items-center justify-center font-bold text-neutral-700"
          >
            +
          </button>
        </div>

        <button 
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="flex-1 min-h-[44px] bg-emerald-600 active:bg-emerald-700 disabled:bg-neutral-300 text-white text-xs font-black py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add &bull; ₹{effectivePrice * selectedQty}</span>
        </button>

        <button 
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="min-h-[44px] bg-neutral-900 active:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5"
        >
          {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-amber-400" />}
          <span>{isAuthenticated ? 'Checkout' : 'Sign In'}</span>
        </button>
      </div>

    </div>
  );
}
