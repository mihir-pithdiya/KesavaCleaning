import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  User, 
  LogOut, 
  ChevronDown,
  Lock,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ 
  currentRoute, 
  navigateTo, 
  cartTotalCount, 
  searchQuery, 
  setSearchQuery,
  openAuthModal,
  showToast,
  storeWideDiscount
}) {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isCustomer = isAuthenticated && !isAdmin;

  const handleNav = (route, prodId = null) => {
    if (route === '/admin' && isCustomer) {
      if (showToast) showToast("Access Denied: Signed in as a Customer. Admin panel is restricted.");
      return;
    }
    navigateTo(route, prodId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    if (showToast) showToast("Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo - KesavaCleaning */}
        <button 
          onClick={() => handleNav('/')} 
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 block leading-tight">
                Kesava<span className="text-emerald-600">Cleaning</span>
              </span>
              {storeWideDiscount?.active && (
                <span className="hidden sm:inline-flex items-center gap-0.5 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  <Flame className="w-2.5 h-2.5 fill-white" />
                  <span>{storeWideDiscount.percentage}% SALE</span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block -mt-0.5">
              Pure Liquid Formulations
            </span>
          </div>
        </button>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search kitchen degreaser, neem floor wash, 5L canister..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNav('/shop');
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-xs sm:text-sm rounded-full border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-bold text-neutral-700">
          <button 
            onClick={() => handleNav('/')}
            className={`hover:text-emerald-600 transition cursor-pointer ${currentRoute === '/' ? 'text-emerald-600 font-black' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => handleNav('/shop')}
            className={`hover:text-emerald-600 transition cursor-pointer ${currentRoute === '/shop' ? 'text-emerald-600 font-black' : ''}`}
          >
            Shop Liquids
          </button>
          <button 
            onClick={() => handleNav('/cart')}
            className={`hover:text-emerald-600 transition cursor-pointer ${currentRoute === '/cart' ? 'text-emerald-600 font-black' : ''}`}
          >
            Offers & Cart
          </button>

          {/* ADMIN BUTTON WITH STRICT CUSTOMER RESTRICTION */}
          {isCustomer ? (
            <button 
              disabled
              title="Admin Panel is disabled for Customer accounts"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-400 border border-dashed border-neutral-300 opacity-60 cursor-not-allowed select-none"
            >
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Admin (Locked)</span>
            </button>
          ) : (
            <button 
              onClick={() => handleNav('/admin')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                currentRoute === '/admin' 
                  ? 'bg-neutral-900 text-white shadow-sm' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Admin Panel</span>
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>
          )}
        </nav>

        {/* Header Right Actions: Auth + Cart + Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* User Authentication Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold border border-neutral-200 transition cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white ${isAdmin ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block leading-none truncate max-w-[100px]">{currentUser.name}</span>
                  <span className={`text-[9px] uppercase tracking-wider font-extrabold ${isAdmin ? 'text-purple-700' : 'text-emerald-700'}`}>
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="font-extrabold text-xs text-neutral-900">{currentUser.name}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{currentUser.email}</p>
                    <span className={`inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Role: {currentUser.role}
                    </span>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={() => handleNav('/cart')}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-50 font-semibold text-neutral-700 flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-neutral-400" />
                      <span>My Cart & Orders</span>
                    </button>

                    {isAdmin ? (
                      <button
                        onClick={() => handleNav('/admin')}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 font-semibold text-purple-700 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Admin Console</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2 text-[11px] text-neutral-400 flex items-center gap-1.5 italic">
                        <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>Admin Panel disabled for customers</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 border-t border-neutral-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-2 text-xs font-bold text-neutral-700 hover:text-emerald-700 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="hidden sm:inline-flex px-3.5 py-2 text-xs font-black bg-neutral-900 hover:bg-neutral-800 text-white rounded-full transition shadow-sm cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Cart Icon Button */}
          <button 
            onClick={() => handleNav('/cart')} 
            className="relative p-2.5 rounded-full bg-neutral-100 hover:bg-emerald-50 text-neutral-800 hover:text-emerald-600 transition border border-neutral-200 cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-black rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white animate-pulse">
                {cartTotalCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-700 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Slide-down Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-6 py-5 space-y-4 shadow-xl">
          <div className="relative mb-3">
            <input 
              type="text" 
              placeholder="Search cleaning liquids..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNav('/shop');
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 text-sm rounded-xl border border-neutral-200"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
          </div>

          {/* User status in mobile */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-black ${isAdmin ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                  {currentUser.name[0].toUpperCase()}
                </div>
                <div>
                  <span className="font-extrabold text-xs text-neutral-900 block">{currentUser.name}</span>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase">{currentUser.role} Account</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-neutral-600">Guest User</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                    className="text-xs font-bold bg-neutral-200 px-3 py-1.5 rounded-lg text-neutral-800"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }}
                    className="text-xs font-black bg-emerald-600 text-white px-3 py-1.5 rounded-lg"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className="text-xs text-red-600 font-bold hover:underline"
              >
                Log Out
              </button>
            )}
          </div>
          
          <button 
            onClick={() => handleNav('/')} 
            className="block w-full text-left font-bold text-neutral-800 hover:text-emerald-600 py-2"
          >
            Home
          </button>
          <button 
            onClick={() => handleNav('/shop')} 
            className="block w-full text-left font-bold text-neutral-800 hover:text-emerald-600 py-2"
          >
            Shop All Liquids
          </button>
          <button 
            onClick={() => handleNav('/cart')} 
            className="block w-full text-left font-bold text-neutral-800 hover:text-emerald-600 py-2 flex justify-between items-center"
          >
            <span>Cart & Special Offers</span>
            {cartTotalCount > 0 && (
              <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {cartTotalCount} items
              </span>
            )}
          </button>
          
          {isCustomer ? (
            <div className="py-2 flex items-center justify-between text-neutral-400 text-xs font-bold opacity-60">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-neutral-400" />
                <span>Admin Panel (Disabled for Customer)</span>
              </span>
              <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">Locked</span>
            </div>
          ) : (
            <button 
              onClick={() => handleNav('/admin')} 
              className="block w-full text-left font-bold text-neutral-800 hover:text-emerald-600 py-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Admin Panel (Store Operations)</span>
              </div>
              {isAdmin && <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Admin</span>}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
