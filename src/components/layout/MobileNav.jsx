import React from 'react';
import { Home as HomeIcon, ShoppingBag as ShopIcon, ShoppingBag, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav({ currentRoute, navigateTo, cartTotalCount, showToast }) {
  const { currentUser, isAuthenticated, isAdmin } = useAuth();
  const isCustomer = isAuthenticated && !isAdmin;

  const handleAdminClick = () => {
    if (isCustomer) {
      if (showToast) showToast("Access Denied: Customer accounts cannot access Admin panel.");
      return;
    }
    navigateTo('/admin');
  };

  return (
    <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-2 flex items-center justify-around shadow-lg">
      <button 
        onClick={() => navigateTo('/')} 
        className={`flex flex-col items-center justify-center p-2 min-h-[44px] min-w-[44px] ${currentRoute === '/' ? 'text-emerald-600 font-bold' : 'text-neutral-500'}`}
      >
        <HomeIcon className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      <button 
        onClick={() => navigateTo('/shop')} 
        className={`flex flex-col items-center justify-center p-2 min-h-[44px] min-w-[44px] ${currentRoute === '/shop' ? 'text-emerald-600 font-bold' : 'text-neutral-500'}`}
      >
        <ShopIcon className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Shop</span>
      </button>

      <button 
        onClick={() => navigateTo('/cart')} 
        className={`relative flex flex-col items-center justify-center p-2 min-h-[44px] min-w-[44px] ${currentRoute === '/cart' ? 'text-emerald-600 font-bold' : 'text-neutral-500'}`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Cart</span>
        {cartTotalCount > 0 && (
          <span className="absolute top-1 right-2 bg-emerald-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
            {cartTotalCount}
          </span>
        )}
      </button>

      {/* Admin Button on Mobile */}
      {isCustomer ? (
        <button 
          onClick={handleAdminClick}
          className="flex flex-col items-center justify-center p-2 min-h-[44px] min-w-[44px] text-neutral-300 opacity-60 cursor-not-allowed"
          title="Admin Panel Disabled"
        >
          <Lock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Locked</span>
        </button>
      ) : (
        <button 
          onClick={() => navigateTo('/admin')} 
          className={`relative flex flex-col items-center justify-center p-2 min-h-[44px] min-w-[44px] ${currentRoute === '/admin' ? 'text-emerald-600 font-bold' : 'text-neutral-500'}`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Admin</span>
          {isAdmin && (
            <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
          )}
        </button>
      )}
    </nav>
  );
}
