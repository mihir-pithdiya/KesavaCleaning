import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_COUPONS, 
  INITIAL_ORDERS,
  INITIAL_STORE_DISCOUNT 
} from './data/mockData';

// Layout Components
import PromoBanner from './components/layout/PromoBanner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileNav from './components/layout/MobileNav';

// Common & Auth Components
import Toast from './components/common/Toast';
import AuthModal from './components/auth/AuthModal';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartHubPage from './pages/CartHubPage';
import AdminPortalPage from './pages/AdminPortalPage';

function KesavaApp() {
  // Navigation State
  const [currentRoute, setCurrentRoute] = useState('/'); // '/', '/shop', '/product/:id', '/cart', '/admin'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState('login');

  // Persistent Domain States (Ensuring high-res images upgrade for defaults)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('kesava_products');
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(p => {
        const initialMatch = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
        if (initialMatch && !p.images[0]?.startsWith('data:image')) {
          return { ...p, images: initialMatch.images };
        }
        return p;
      });
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('kesava_cart');
    return saved ? JSON.parse(saved) : [
      { ...INITIAL_PRODUCTS[0], cartQty: 2 },
      { ...INITIAL_PRODUCTS[1], cartQty: 1 }
    ];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('kesava_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('kesava_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  // Store-Wide Global Discount Engine State
  const [storeWideDiscount, setStoreWideDiscount] = useState(() => {
    const saved = localStorage.getItem('kesava_store_discount');
    return saved ? JSON.parse(saved) : INITIAL_STORE_DISCOUNT;
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('kesava_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kesava_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('kesava_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('kesava_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('kesava_store_discount', JSON.stringify(storeWideDiscount));
  }, [storeWideDiscount]);

  // Toast Dispatcher
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Open Auth Dialog
  const openAuthModal = (mode = 'login') => {
    setAuthModalInitialMode(mode);
    setAuthModalOpen(true);
  };

  // Cart actions
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, cartQty: item.cartQty + qty, offerPrice: product.offerPrice } : item);
      }
      return [...prev, { ...product, cartQty: qty }];
    });
    showToast(`Added ${qty}x ${product.name} to Cart!`);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQty + delta;
        return newQty > 0 ? { ...item, cartQty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast("Item removed from cart");
  };

  const navigateTo = (route, prodId = null) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentRoute(route);
    if (prodId) setSelectedProductId(prodId);
  };

  const cartTotalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.cartQty, 0);
  }, [cart]);

  // Active product for detail page
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-neutral-800 font-sans flex flex-col selection:bg-emerald-200 selection:text-emerald-900 pb-16 md:pb-0">
      
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <PromoBanner navigateTo={navigateTo} storeWideDiscount={storeWideDiscount} />

      {/* 2. STICKY NAVBAR WITH BRAND, SEARCH, AUTH & SECURE ADMIN CHECK */}
      <Navbar 
        currentRoute={currentRoute}
        navigateTo={navigateTo}
        cartTotalCount={cartTotalCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openAuthModal={openAuthModal}
        showToast={showToast}
        storeWideDiscount={storeWideDiscount}
      />

      {/* 3. MAIN DYNAMIC ROUTER VIEW */}
      <main className="flex-1">
        {currentRoute === '/' && (
          <HomePage 
            products={products} 
            navigateTo={navigateTo} 
            addToCart={addToCart} 
            storeWideDiscount={storeWideDiscount}
          />
        )}

        {currentRoute === '/shop' && (
          <ShopPage 
            products={products} 
            navigateTo={navigateTo} 
            addToCart={addToCart} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            storeWideDiscount={storeWideDiscount}
          />
        )}

        {currentRoute === '/product/:id' && (
          <ProductDetailPage 
            product={activeProduct} 
            navigateTo={navigateTo} 
            addToCart={addToCart} 
            storeWideDiscount={storeWideDiscount}
            openAuthModal={openAuthModal}
          />
        )}

        {currentRoute === '/cart' && (
          <CartHubPage 
            cart={cart}
            updateCartQty={updateCartQty}
            removeFromCart={removeFromCart}
            orders={orders}
            setOrders={setOrders}
            coupons={coupons}
            appliedCoupon={appliedCoupon}
            setAppliedCoupon={setAppliedCoupon}
            navigateTo={navigateTo}
            addToCart={addToCart}
            showToast={showToast}
            setCart={setCart}
            openAuthModal={openAuthModal}
            products={products}
          />
        )}

        {currentRoute === '/admin' && (
          <AdminPortalPage 
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            coupons={coupons}
            setCoupons={setCoupons}
            showToast={showToast}
            openAuthModal={openAuthModal}
            storeWideDiscount={storeWideDiscount}
            setStoreWideDiscount={setStoreWideDiscount}
          />
        )}
      </main>

      {/* 4. MOBILE BOTTOM APP BAR */}
      <MobileNav 
        currentRoute={currentRoute}
        navigateTo={navigateTo}
        cartTotalCount={cartTotalCount}
        showToast={showToast}
      />

      {/* 5. FOOTER */}
      <Footer navigateTo={navigateTo} />

      {/* 6. AUTHENTICATION (LOGIN & SIGN UP) MODAL */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalInitialMode}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* 7. TOAST NOTIFICATION POPUP */}
      <Toast message={toastMessage} />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <KesavaApp />
    </AuthProvider>
  );
}
