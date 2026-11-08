import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Droplet, 
  Tag, 
  RotateCcw, 
  Lock, 
  ShieldCheck, 
  Truck, 
  X, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CartHubPage({ 
  cart, 
  updateCartQty, 
  removeFromCart, 
  orders, 
  setOrders, 
  coupons, 
  appliedCoupon, 
  setAppliedCoupon, 
  navigateTo, 
  addToCart,
  showToast,
  setCart,
  openAuthModal,
  products
}) {
  const { currentUser, isAuthenticated } = useAuth();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Checkout inputs (Auto-populated with logged in user if present)
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setBuyerName(currentUser.name);
      if (currentUser.phone) setBuyerPhone(currentUser.phone);
      if (currentUser.address && currentUser.address !== "Address not provided") {
        setBuyerAddress(currentUser.address);
      }
    }
  }, [currentUser]);

  // Subtotal Calculation
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.offerPrice * item.cartQty), 0);
  }, [cart]);

  // Delivery Calculation: Free above ₹499 or via FREESHIP coupon
  const isFreeDelivery = subtotal >= 499 || (appliedCoupon && appliedCoupon.code === "FREESHIP");
  const shippingCharge = subtotal === 0 ? 0 : (isFreeDelivery ? 0 : 49);

  // Discount Calculation
  const discountAmount = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return 0;
    if (subtotal < appliedCoupon.minOrder) return 0;

    if (appliedCoupon.discountType === 'percentage') {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    }
    if (appliedCoupon.discountType === 'flat') {
      return Math.min(appliedCoupon.value, subtotal);
    }
    if (appliedCoupon.discountType === 'shipping') {
      return 49;
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCharge);

  // Handle Coupon Apply
  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    const matched = coupons.find(c => c.code === code);

    if (!matched) {
      setCouponFeedback({ success: false, msg: "Invalid coupon code." });
      return;
    }

    if (subtotal < matched.minOrder) {
      setCouponFeedback({ 
        success: false, 
        msg: `Minimum order value for ${code} is ₹${matched.minOrder}. Add items worth ₹${matched.minOrder - subtotal} more.` 
      });
      return;
    }

    setAppliedCoupon(matched);
    setCouponFeedback({ success: true, msg: `Coupon ${code} applied successfully!` });
    if (showToast) showToast(`Coupon ${code} Applied!`);
  };

  const removeAppliedCoupon = () => {
    setAppliedCoupon(null);
    setCouponFeedback(null);
  };

  // Handle Proceed to Checkout (Strict Login Check)
  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    if (!isAuthenticated) {
      if (showToast) showToast("Please sign in or create an account to place an order.");
      openAuthModal('login');
      return;
    }
    setCheckoutModalOpen(true);
  };

  // Simulate Order Placement
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("You must be signed in to complete your order.");
      openAuthModal('login');
      setCheckoutModalOpen(false);
      return;
    }
    if (!buyerName || !buyerPhone || !buyerAddress) {
      alert("Please fill in all shipping details.");
      return;
    }

    const now = new Date();
    const newOrder = {
      orderId: `KC-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: now.toISOString(),
      date: now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      customerName: buyerName,
      customerEmail: currentUser?.email || "Customer Order",
      phone: buyerPhone,
      address: buyerAddress,
      items: cart.map(i => ({ 
        id: i.id, 
        name: i.name, 
        volume: i.volume, 
        category: i.category || "Cleaning Formulations",
        qty: i.cartQty, 
        price: i.offerPrice 
      })),
      total: finalTotal,
      paymentMethod: paymentMode === 'UPI' ? 'UPI (Google Pay / PhonePe)' : (paymentMode === 'CARD' ? 'Credit/Debit Card' : 'Cash on Delivery'),
      status: "Pending"
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setAppliedCoupon(null);
    setCheckoutModalOpen(false);
    if (showToast) showToast(`Order ${newOrder.orderId} Placed Successfully!`);
  };

  // Recent order (First item from order history)
  const lastOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
          Cart, Offers & Recent Orders Hub
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Review your KesavaCleaning bottles, redeem verified discount coupons, and track past dispatches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE CART & OFFERS (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Active Cart Section */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h2 className="font-black text-base text-neutral-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>Selected Cleaning Liquids ({cart.length})</span>
              </h2>
              {cart.length > 0 && (
                <button 
                  onClick={() => setCart([])} 
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Droplet className="w-12 h-12 text-neutral-300 mx-auto" />
                <p className="font-bold text-neutral-700 text-sm">Your cart currently has no cleaning liquids.</p>
                <button 
                  onClick={() => navigateTo('/shop')}
                  className="bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-full cursor-pointer hover:bg-emerald-700 transition"
                >
                  Browse Liquid Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-neutral-100">
                {cart.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-2xl object-cover bg-neutral-100 border border-neutral-200 shrink-0" 
                      />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-1">{item.name}</h4>
                        <span className="text-[11px] font-semibold text-emerald-600 block">{item.volume}</span>
                        <span className="text-xs font-bold text-neutral-800">₹{item.offerPrice} each</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Modifier */}
                      <div className="inline-flex items-center border border-neutral-300 rounded-xl bg-neutral-50 px-2 py-1">
                        <button 
                          onClick={() => updateCartQty(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-neutral-700 hover:text-emerald-700"
                        >
                          -
                        </button>
                        <span className="text-xs font-black px-2">{item.cartQty}</span>
                        <button 
                          onClick={() => updateCartQty(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-neutral-700 hover:text-emerald-700"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="text-xs sm:text-sm font-black text-neutral-900 min-w-[60px] text-right">
                        ₹{item.offerPrice * item.cartQty}
                      </span>

                      {/* Trash */}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 transition"
                        aria-label="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Special Offers & Tap-to-Apply Coupons */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-5">
            <h2 className="font-black text-base text-neutral-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              <span>Available KesavaCleaning Coupons</span>
            </h2>

            {/* Input field */}
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter coupon (e.g. KESAVA10)" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button 
                onClick={() => handleApplyCoupon()}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer"
              >
                Apply
              </button>
            </div>

            {/* Feedback message */}
            {couponFeedback && (
              <p className={`text-xs font-bold ${couponFeedback.success ? 'text-emerald-700' : 'text-red-600'}`}>
                {couponFeedback.msg}
              </p>
            )}

            {/* Tap-to-Apply Badge Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {coupons.map((c) => (
                <div 
                  key={c.code}
                  onClick={() => handleApplyCoupon(c.code)}
                  className={`p-3 rounded-2xl border-2 border-dashed transition cursor-pointer flex flex-col justify-between ${
                    appliedCoupon?.code === c.code 
                      ? 'border-emerald-600 bg-emerald-50' 
                      : 'border-neutral-200 hover:border-emerald-400 bg-neutral-50/50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-xs text-neutral-900">{c.code}</span>
                      {appliedCoupon?.code === c.code && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">Active</span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500">{c.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 mt-2 block">
                    {appliedCoupon?.code === c.code ? 'Applied' : 'Tap to Apply &rarr;'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ORDER SUMMARY / 1-TAP REORDER */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="font-black text-base text-neutral-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                <span>Last Buying Entry / Recent Order</span>
              </h2>
              <span className="text-[11px] font-bold text-neutral-400">Order History Hub</span>
            </div>

            {lastOrder ? (
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-neutral-900">Order #{lastOrder.orderId}</span>
                    <span className="text-[11px] text-neutral-400 block">{lastOrder.date}</span>
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${
                    lastOrder.status === 'Delivered' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : (lastOrder.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')
                  }`}>
                    {lastOrder.status}
                  </span>
                </div>

                <div className="text-xs text-neutral-600 space-y-1 pt-2 border-t border-neutral-200/60">
                  <p><strong className="text-neutral-800">Customer:</strong> {lastOrder.customerName} ({lastOrder.phone})</p>
                  <p className="truncate"><strong className="text-neutral-800">Delivered to:</strong> {lastOrder.address}</p>
                  <p><strong className="text-neutral-800">Liquids:</strong> {lastOrder.items.map(i => `${i.qty}x ${i.name} (${i.volume})`).join(', ')}</p>
                  <p><strong className="text-neutral-800">Total Paid:</strong> <span className="font-black text-emerald-800">₹{lastOrder.total}</span> via {lastOrder.paymentMethod}</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => {
                      lastOrder.items.forEach(itm => {
                        const original = products.find(p => p.id === itm.id) || products[0];
                        if (original) addToCart(original, itm.qty);
                      });
                      if (showToast) showToast("Previous order items re-added to cart!");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>1-Tap Reorder These Liquids</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 py-3">No past orders found in local storage. Complete your first checkout above!</p>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: STICKY ORDER SUMMARY & CHECKOUT (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm sticky top-28 space-y-6">
          <h3 className="text-lg font-black text-neutral-900 pb-3 border-b border-neutral-100">
            Order Bill Summary
          </h3>

          {/* User Status in Checkout */}
          <div className={`p-3.5 rounded-2xl border text-xs ${isAuthenticated ? 'bg-neutral-50 border-neutral-200' : 'bg-amber-50 border-amber-200'}`}>
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Logged in as <strong>{currentUser.name}</strong></span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">{currentUser.role}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-900 font-bold">Sign-in required to place order</span>
                </div>
                <button 
                  onClick={() => openAuthModal('login')}
                  className="text-emerald-700 font-black hover:underline cursor-pointer"
                >
                  Sign In / Register &rarr;
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Item Subtotal ({cart.reduce((s, c) => s + c.cartQty, 0)} bottles)</span>
              <span className="font-bold text-neutral-800">₹{subtotal}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-700 font-bold items-center">
                <span className="flex items-center gap-1">
                  Coupon Discount ({appliedCoupon.code})
                  <button onClick={removeAppliedCoupon} className="text-red-500 text-[10px] underline ml-1">Remove</button>
                </span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600 items-center">
              <span>Shipping & Delivery Fee</span>
              {shippingCharge === 0 ? (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">FREE</span>
              ) : (
                <span className="font-bold text-neutral-800">₹49</span>
              )}
            </div>

            {subtotal > 0 && subtotal < 499 && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                💡 Add cleaning liquids worth ₹{499 - subtotal} more for <strong>FREE Delivery</strong>!
              </p>
            )}

            <div className="pt-3 border-t border-neutral-200 flex justify-between text-base sm:text-lg font-black text-neutral-900">
              <span>Total Payable Amount</span>
              <span className="text-emerald-800">₹{finalTotal}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={handleProceedToCheckout}
            className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isAuthenticated ? `Proceed to Checkout \u2022 \u20B9${finalTotal}` : `Sign In / Register to Buy \u2022 \u20B9${finalTotal}`}
            </span>
          </button>

          <div className="space-y-2 pt-2 text-center">
            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-neutral-500">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Genuine Liquids</span>
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-emerald-600" /> Fast Express Shipping</span>
            </div>
            <p className="text-[11px] text-neutral-400">GST Invoice automatically emailed upon order dispatch.</p>
          </div>
        </div>

      </div>

      {/* CHECKOUT MODAL POPUP */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Complete Liquid Order</h3>
                <span className="text-xs text-neutral-500">Amount Due: <strong className="text-emerald-700">₹{finalTotal}</strong></span>
              </div>
              <button onClick={() => setCheckoutModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">Full Buyer Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Ramesh Iyer" 
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full p-3 bg-neutral-100 rounded-xl text-xs sm:text-sm border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">WhatsApp / Contact Number</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="e.g. +91 98765 43210" 
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full p-3 bg-neutral-100 rounded-xl text-xs sm:text-sm border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">Complete Delivery Address with Pincode</label>
                <textarea 
                  required 
                  rows="3" 
                  placeholder="House/Flat No, Apartment, Street, City, State - PIN" 
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full p-3 bg-neutral-100 rounded-xl text-xs sm:text-sm border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-2">Payment Gateway Mode</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <label className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition ${paymentMode === 'UPI' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-neutral-200'}`}>
                    <input type="radio" name="payment" value="UPI" checked={paymentMode === 'UPI'} onChange={() => setPaymentMode('UPI')} className="hidden" />
                    <span>UPI (GPay/PhonePe)</span>
                  </label>
                  <label className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition ${paymentMode === 'CARD' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-neutral-200'}`}>
                    <input type="radio" name="payment" value="CARD" checked={paymentMode === 'CARD'} onChange={() => setPaymentMode('CARD')} className="hidden" />
                    <span>Card / NetBanking</span>
                  </label>
                  <label className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition ${paymentMode === 'COD' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-neutral-200'}`}>
                    <input type="radio" name="payment" value="COD" checked={paymentMode === 'COD'} onChange={() => setPaymentMode('COD')} className="hidden" />
                    <span>Cash On Delivery</span>
                  </label>
                </div>
              </div>

              <div className="pt-3">
                <button 
                  type="submit"
                  className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl shadow-lg transition"
                >
                  Confirm & Pay ₹{finalTotal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
