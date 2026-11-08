import React, { useState, useMemo } from 'react';
import { ChevronRight, Filter, SlidersHorizontal, AlertCircle, X } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/product/ProductCard';

export default function ShopPage({ products, navigateTo, addToCart, searchQuery, setSearchQuery, storeWideDiscount }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVolume, setSelectedVolume] = useState("All");
  const [maxPrice, setMaxPrice] = useState(1500);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const volumes = ["500ml", "750ml", "1 Liter", "5 Liter Canister"];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = searchQuery === "" || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.scent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchesVol = selectedVolume === "All" || p.volume === selectedVolume;
      const matchesPrice = p.offerPrice <= maxPrice;
      const matchesStock = !onlyInStock || p.stock > 0;

      return matchesSearch && matchesCat && matchesVol && matchesPrice && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, selectedVolume, maxPrice, onlyInStock]);

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedVolume("All");
    setMaxPrice(1500);
    setOnlyInStock(false);
    setSearchQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <button onClick={() => navigateTo('/')} className="hover:text-neutral-700">Home</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-neutral-700 font-bold">Cleaning Liquids Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
            All Bottled Formulations ({filteredProducts.length})
          </h1>
        </div>

        {/* Mobile Filter Button */}
        <button 
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden min-h-[44px] flex items-center justify-center gap-2 bg-neutral-900 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow"
        >
          <Filter className="w-4 h-4" />
          <span>Filters & Volume Sizes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* DESKTOP STICKY SIDEBAR FILTERS (Left 3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm sticky top-28 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="font-extrabold text-sm text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Refine Catalog</span>
            </h3>
            <button 
              onClick={clearFilters}
              className="text-xs text-emerald-600 hover:underline font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold uppercase text-neutral-700 block mb-2">Category</label>
            <div className="space-y-1.5">
              <button 
                onClick={() => setSelectedCategory("All")}
                className={`w-full text-left text-xs px-3 py-2 rounded-xl transition ${selectedCategory === "All" ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'}`}
              >
                All Cleaning Categories
              </button>
              {CATEGORIES.map((c, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedCategory(c)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl transition leading-snug ${selectedCategory === c ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Filter */}
          <div>
            <label className="text-xs font-bold uppercase text-neutral-700 block mb-2">Bottle Volume</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setSelectedVolume("All")}
                className={`text-xs py-2 px-2.5 rounded-xl border text-center transition ${selectedVolume === "All" ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'}`}
              >
                All Volumes
              </button>
              {volumes.map((vol, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedVolume(vol)}
                  className={`text-xs py-2 px-2.5 rounded-xl border text-center transition ${selectedVolume === vol ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'}`}
                >
                  {vol}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-neutral-700 mb-2">
              <span>Max Price</span>
              <span className="text-emerald-700 font-black">₹{maxPrice}</span>
            </div>
            <input 
              type="range" 
              min="150" 
              max="1500" 
              step="50" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>₹150</span>
              <span>₹1,500</span>
            </div>
          </div>

          {/* In-Stock Toggle */}
          <div className="pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
              <input 
                type="checkbox" 
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>In-Stock Liquids Only</span>
            </label>
          </div>

        </aside>

        {/* MOBILE FILTER MODAL DRAWER */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)}></div>
            <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 z-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <h3 className="font-extrabold text-base text-neutral-900">Filter Liquids</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-2 text-neutral-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6 mt-4">
                  {/* Category */}
                  <div>
                    <label className="text-xs font-bold uppercase text-neutral-700 block mb-2">Category</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2.5 bg-neutral-100 rounded-xl text-xs border border-neutral-200"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Volume */}
                  <div>
                    <label className="text-xs font-bold uppercase text-neutral-700 block mb-2">Bottle Volume</label>
                    <select 
                      value={selectedVolume} 
                      onChange={(e) => setSelectedVolume(e.target.value)}
                      className="w-full p-2.5 bg-neutral-100 rounded-xl text-xs border border-neutral-200"
                    >
                      <option value="All">All Bottle Sizes</option>
                      {volumes.map((v, i) => (
                        <option key={i} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  {/* Max Price */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>Max Price:</span>
                      <span className="text-emerald-700">₹{maxPrice}</span>
                    </div>
                    <input 
                      type="range" 
                      min="150" 
                      max="1500" 
                      step="50" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-neutral-200">
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                >
                  Apply Filters
                </button>
                <button 
                  onClick={() => { clearFilters(); setMobileFilterOpen(false); }}
                  className="w-full py-2.5 text-neutral-600 font-semibold rounded-xl text-xs hover:bg-neutral-100"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT GRID (Right 9 cols) */}
        <div className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
              <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-neutral-800">No Cleaning Liquids Match Your Criteria</h3>
              <p className="text-xs text-neutral-500 mt-1 mb-4">Try clearing your filters or search keywords.</p>
              <button 
                onClick={clearFilters}
                className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-full"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  navigateTo={navigateTo} 
                  addToCart={addToCart} 
                  storeWideDiscount={storeWideDiscount}
                />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
