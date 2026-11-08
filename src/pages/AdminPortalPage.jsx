import React, { useState, useMemo } from 'react';
import { 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Tag, 
  AlertTriangle,
  ArrowRight,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Percent,
  Flame,
  XCircle,
  Eye,
  EyeOff,
  Calendar,
  Download,
  FileSpreadsheet,
  Filter,
  TrendingUp,
  Clock,
  RefreshCw
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function AdminPortalPage({ 
  products, 
  setProducts, 
  orders, 
  setOrders, 
  coupons, 
  setCoupons, 
  showToast,
  openAuthModal,
  storeWideDiscount,
  setStoreWideDiscount
}) {
  const { currentUser, isAuthenticated, isAdmin, login, logout, users } = useAuth();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory', 'storeDiscount', 'orders', 'coupons', 'users'

  // Admin Security Gate Form State
  const [gateEmail, setGateEmail] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [gatePin, setGatePin] = useState("");
  const [gateShowPassword, setGateShowPassword] = useState(false);
  const [gateError, setGateError] = useState("");

  // New Product Form State
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newVolume, setNewVolume] = useState("500ml");
  const [newRegPrice, setNewRegPrice] = useState("399");
  const [newOfferPrice, setNewOfferPrice] = useState("299");
  const [newDiscountPct, setNewDiscountPct] = useState("25");
  const [newStock, setNewStock] = useState("50");
  const [newScent, setNewScent] = useState("");
  const [newSurfaces, setNewSurfaces] = useState("");
  const [newCautions, setNewCautions] = useState("");
  
  // File Upload State (Base64)
  const [uploadedImageBase64, setUploadedImageBase64] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Store-wide discount controller state
  const [globalActive, setGlobalActive] = useState(storeWideDiscount?.active || false);
  const [globalPct, setGlobalPct] = useState(storeWideDiscount?.percentage || 10);
  const [globalTitle, setGlobalTitle] = useState(storeWideDiscount?.bannerText || "Flash Sale: Extra 10% OFF applied across all bottled liquids!");

  // New Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState("percentage");
  const [newCouponVal, setNewCouponVal] = useState("");
  const [newCouponMin, setNewCouponMin] = useState("");
  const [newCouponDesc, setNewCouponDesc] = useState("");

  // Order Date Filtering & Analytics State (Week, Month, Year, Custom Range)
  const [orderPeriodFilter, setOrderPeriodFilter] = useState('all'); // 'all', 'week', 'month', 'year', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Helper to safely parse order date
  const parseOrderDate = (order) => {
    if (order.createdAt) {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    if (order.date) {
      const d = new Date(order.date);
      if (!isNaN(d.getTime())) return d;
      const match = order.date.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
      if (match) {
        const months = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
        const day = parseInt(match[1], 10);
        const m = months[match[2].toLowerCase()];
        const y = parseInt(match[3], 10);
        if (!isNaN(day) && m !== undefined && !isNaN(y)) {
          return new Date(y, m, day);
        }
      }
    }
    return new Date();
  };

  // Comprehensive Order Analytics for Week, Month, Year, and All Time
  const orderAnalytics = useMemo(() => {
    const now = new Date();
    
    // Start of Week: 7 days rolling
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Start of Month: 1st day of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    // Start of Year: Jan 1st of current year
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0);

    let weekOrders = 0, weekRevenue = 0, weekUnits = 0;
    let monthOrders = 0, monthRevenue = 0, monthUnits = 0;
    let yearOrders = 0, yearRevenue = 0, yearUnits = 0;

    orders.forEach(o => {
      const d = parseOrderDate(o);
      const rev = Number(o.total) || 0;
      const units = (o.items || []).reduce((sum, it) => sum + (Number(it.qty) || 1), 0);

      if (d >= sevenDaysAgo) {
        weekOrders++;
        weekRevenue += rev;
        weekUnits += units;
      }
      if (d >= startOfMonth) {
        monthOrders++;
        monthRevenue += rev;
        monthUnits += units;
      }
      if (d >= startOfYear) {
        yearOrders++;
        yearRevenue += rev;
        yearUnits += units;
      }
    });

    return {
      week: { count: weekOrders, revenue: weekRevenue, units: weekUnits },
      month: { count: monthOrders, revenue: monthRevenue, units: monthUnits },
      year: { count: yearOrders, revenue: yearRevenue, units: yearUnits },
      total: {
        count: orders.length,
        revenue: orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
        units: orders.reduce((sum, o) => sum + (o.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0), 0)
      }
    };
  }, [orders]);

  // Filtered Orders according to selected Period or Custom Date Range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    
    if (orderPeriodFilter === 'all') return orders;

    if (orderPeriodFilter === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return orders.filter(o => parseOrderDate(o) >= sevenDaysAgo);
    }

    if (orderPeriodFilter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      return orders.filter(o => parseOrderDate(o) >= startOfMonth);
    }

    if (orderPeriodFilter === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      return orders.filter(o => parseOrderDate(o) >= startOfYear);
    }

    if (orderPeriodFilter === 'custom') {
      return orders.filter(o => {
        const d = parseOrderDate(o);
        if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          if (d < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (d > end) return false;
        }
        return true;
      });
    }

    return orders;
  }, [orders, orderPeriodFilter, customStartDate, customEndDate]);

  // Summary Metrics for the currently filtered view
  const filteredStats = useMemo(() => {
    const count = filteredOrders.length;
    const revenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const units = filteredOrders.reduce((sum, o) => sum + (o.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0), 0);
    const avgOrderValue = count > 0 ? Math.round(revenue / count) : 0;
    return { count, revenue, units, avgOrderValue };
  }, [filteredOrders]);

  // Calculate Overview KPIs
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stock <= 15).length;
  }, [products]);

  // Handle Strict Admin Login
  const handleStrictAdminLogin = (e) => {
    e.preventDefault();
    setGateError("");

    // Step 1: Verify master PIN security check
    if (gatePin.trim() !== "admin123" && gatePin.trim() !== "kesava2026") {
      setGateError("Invalid Admin Master PIN. Verification failed.");
      return;
    }

    // Step 2: Verify Admin Email & Password in AuthContext
    const authResult = login(gateEmail, gatePassword);
    if (!authResult.success) {
      setGateError(authResult.error || "Invalid administrator credentials.");
      return;
    }

    // Step 3: Verify role is truly admin
    if (authResult.user.role !== 'admin') {
      logout();
      setGateError("Access Denied: The account provided does not have Administrator privileges.");
      return;
    }

    if (showToast) showToast("Admin console verified and unlocked!");
  };

  // Image File Upload Handler (Converts to Base64)
  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImageBase64(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = () => {
    setUploadedImageBase64("");
    setUploadedFileName("");
  };

  // Dynamic Discount calculation when MRP changes
  const handleRegPriceChange = (val) => {
    setNewRegPrice(val);
    const reg = Number(val);
    const disc = Number(newDiscountPct);
    if (reg > 0 && disc > 0) {
      setNewOfferPrice(Math.round(reg * (1 - disc / 100)));
    }
  };

  const handleDiscountPctChange = (val) => {
    setNewDiscountPct(val);
    const disc = Number(val);
    const reg = Number(newRegPrice);
    if (reg > 0 && disc >= 0) {
      setNewOfferPrice(Math.round(reg * (1 - disc / 100)));
    }
  };

  const handleOfferPriceChange = (val) => {
    setNewOfferPrice(val);
    const offer = Number(val);
    const reg = Number(newRegPrice);
    if (reg > 0 && offer > 0 && reg > offer) {
      setNewDiscountPct(Math.round(((reg - offer) / reg) * 100));
    }
  };

  // Add Product Handler
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newName || !newOfferPrice) {
      alert("Please provide formulation name and offer price.");
      return;
    }

    if (!uploadedImageBase64) {
      alert("Please upload an image file for this formulation.");
      return;
    }

    const created = {
      id: `kc-${Date.now().toString().slice(-4)}`,
      name: newName,
      category: newCategory,
      volume: newVolume,
      regularPrice: Number(newRegPrice) || Number(newOfferPrice) + 100,
      offerPrice: Number(newOfferPrice),
      rating: 5.0,
      reviewsCount: 1,
      stock: Number(newStock) || 25,
      scent: newScent || "Fresh Herbal",
      pH: "7.0 (Neutral)",
      surfaces: newSurfaces || "All water-safe hard surfaces",
      cautions: newCautions || "Keep out of reach of children.",
      images: [uploadedImageBase64],
      featured: false,
      isBestSeller: false,
      description: `${newName} formulated by KesavaCleaning for rapid residue breakdown.`
    };

    setProducts([created, ...products]);
    if (showToast) showToast(`Published ${created.name} to Catalog!`);

    // Reset Form
    setNewName("");
    setNewRegPrice("399");
    setNewOfferPrice("299");
    setNewDiscountPct("25");
    setNewStock("50");
    setNewScent("");
    setNewSurfaces("");
    setNewCautions("");
    setUploadedImageBase64("");
    setUploadedFileName("");
  };

  // Inline Discount Updater for ANY Product
  const updateProductDiscount = (prodId, discountPercent) => {
    setProducts(products.map(p => {
      if (p.id === prodId) {
        const disc = Number(discountPercent);
        const newOffer = Math.max(1, Math.round(p.regularPrice * (1 - disc / 100)));
        return { ...p, offerPrice: newOffer };
      }
      return p;
    }));
    if (showToast) showToast(`Updated discount to ${discountPercent}%`);
  };

  // Bulk Apply Discount to ALL Products Base Prices
  const handleBulkDiscountAllProducts = (pct) => {
    if (confirm(`Are you sure you want to recalculate and apply a ${pct}% discount across ALL ${products.length} products?`)) {
      setProducts(products.map(p => {
        const newOffer = Math.max(1, Math.round(p.regularPrice * (1 - pct / 100)));
        return { ...p, offerPrice: newOffer };
      }));
      if (showToast) showToast(`Applied ${pct}% discount to all products!`);
    }
  };

  // Save Store-Wide Live Discount Campaign
  const handleSaveGlobalDiscount = (e) => {
    e.preventDefault();
    const updated = {
      active: globalActive,
      percentage: Number(globalPct),
      bannerText: globalTitle
    };
    setStoreWideDiscount(updated);
    if (showToast) showToast(globalActive ? `Store-Wide ${globalPct}% Discount Activated!` : "Store-Wide Discount Deactivated");
  };

  const deleteProduct = (id) => {
    if (confirm("Are you sure you want to delete this liquid listing?")) {
      setProducts(products.filter(p => p.id !== id));
      if (showToast) showToast("Product removed from catalog");
    }
  };

  const updateInlineStock = (id, newCount) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: Math.max(0, Number(newCount)) } : p));
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    if (showToast) showToast(`Order #${orderId} marked as ${newStatus}`);
  };

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponVal) return;

    const createdCoupon = {
      code: newCouponCode.toUpperCase(),
      discountType: newCouponType,
      value: Number(newCouponVal),
      minOrder: Number(newCouponMin) || 0,
      desc: newCouponDesc || `${newCouponCode} promotional discount`
    };

    setCoupons([...coupons, createdCoupon]);
    if (showToast) showToast(`Coupon ${createdCoupon.code} created!`);
    setNewCouponCode("");
    setNewCouponVal("");
    setNewCouponMin("");
    setNewCouponDesc("");
  };

  const deleteCoupon = (code) => {
    setCoupons(coupons.filter(c => c.code !== code));
    if (showToast) showToast(`Coupon ${code} removed`);
  };

  // Export Order Ledger to Excel (CSV with UTF-8 BOM)
  const downloadExcelReport = () => {
    if (filteredOrders.length === 0) {
      if (showToast) showToast("No orders available in the selected date range to export.");
      return;
    }

    // Define CSV Header Columns
    const headers = [
      "Row #",
      "Order ID",
      "Sale Date",
      "Product Name",
      "Category Name",
      "Bottle Volume",
      "Unit Price (INR)",
      "Units Bought (Qty)",
      "Item Subtotal (INR)",
      "Order Grand Total (INR)",
      "Payment Method",
      "Fulfillment Status",
      "Customer Name",
      "Customer Phone",
      "Delivery Address"
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = [];
    let rowIndex = 1;
    let totalUnitsExported = 0;
    let totalRevenueExported = 0;

    // Flatten every order into itemized product rows
    filteredOrders.forEach(order => {
      const saleDateStr = order.createdAt 
        ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) 
        : (order.date || "N/A");

      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const itemQty = Number(item.qty) || 1;
          const itemPrice = Number(item.price) || 0;
          const itemSubtotal = itemQty * itemPrice;
          totalUnitsExported += itemQty;

          rows.push([
            rowIndex++,
            order.orderId || "N/A",
            saleDateStr,
            item.name || "Cleaning Liquid Formulation",
            item.category || "Cleaning Formulations",
            item.volume || "Standard Bottle",
            itemPrice,
            itemQty,
            itemSubtotal,
            order.total || itemSubtotal,
            order.paymentMethod || "Prepaid",
            order.status || "Pending",
            order.customerName || "Customer",
            order.phone || "N/A",
            order.address || "N/A"
          ]);
        });
      } else {
        rows.push([
          rowIndex++,
          order.orderId || "N/A",
          saleDateStr,
          "General Cleaning Package",
          "Cleaning Formulations",
          "1 Liter",
          order.total || 0,
          1,
          order.total || 0,
          order.total || 0,
          order.paymentMethod || "Prepaid",
          order.status || "Pending",
          order.customerName || "Customer",
          order.phone || "N/A",
          order.address || "N/A"
        ]);
        totalUnitsExported += 1;
      }
      totalRevenueExported += Number(order.total) || 0;
    });

    // Add Summary Row at the bottom of the spreadsheet
    rows.push([]);
    rows.push([
      "SUMMARY TOTALS",
      `Total Orders: ${filteredOrders.length}`,
      `Filter Period: ${orderPeriodFilter.toUpperCase()}`,
      "",
      "",
      "",
      "",
      `Total Units Sold: ${totalUnitsExported}`,
      "",
      `Gross Sales: INR ${totalRevenueExported}`,
      "",
      "",
      "",
      "",
      ""
    ]);

    // Construct CSV content with UTF-8 BOM
    const csvContent = "\uFEFF" + [
      headers.map(escapeCsv).join(","),
      ...rows.map(row => row.map(escapeCsv).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `KesavaCleaning_Orders_${orderPeriodFilter}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (showToast) {
      showToast(`Excel file downloaded! (${rows.length - 2} item rows exported)`);
    }
  };

  // --- CASE 1: LOGGED IN AS CUSTOMER (STRICT 403 ACCESS DENIED) ---
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              403 Forbidden &bull; Restricted Area
            </span>
            <h2 className="text-2xl font-black text-neutral-900 mt-3">
              Admin Access Denied
            </h2>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
              You are currently logged in as <strong>{currentUser.name}</strong> ({currentUser.email}) with a <strong>Customer Account</strong>. 
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Customer accounts do not possess administrative privileges. To access the central control room, please log out and sign in with verified Administrator credentials.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                logout();
                if (showToast) showToast("Logged out of Customer account");
              }}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
            >
              Log Out & Switch to Admin Account
            </button>
            <button
              onClick={() => window.history.back()}
              className="text-xs text-neutral-500 hover:text-neutral-800 underline"
            >
              Return to Previous Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CASE 2: NOT AUTHENTICATED AS ADMIN (STRICT MULTI-FACTOR GATE) ---
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              High Security Verification
            </span>
            <h2 className="text-2xl font-black text-neutral-900 mt-2">
              Administrator Terminal
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              Authorized personnel only. Authenticate with your Admin Email, Password, and Master Security PIN.
            </p>
          </div>

          {gateError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold text-left">
              {gateError}
            </div>
          )}

          {/* Strict Admin Login Form */}
          <form onSubmit={handleStrictAdminLogin} className="space-y-3.5 text-left text-xs">
            <div>
              <label className="font-bold text-neutral-700 uppercase block mb-1">Admin Email</label>
              <input 
                type="email"
                required
                placeholder="admin@kesavacleaning.com"
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                className="w-full p-3 bg-neutral-100 rounded-xl border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 uppercase block mb-1">Admin Password</label>
              <div className="relative">
                <input 
                  type={gateShowPassword ? "text" : "password"}
                  required
                  placeholder="Enter administrator password"
                  value={gatePassword}
                  onChange={(e) => setGatePassword(e.target.value)}
                  className="w-full p-3 pr-10 bg-neutral-100 rounded-xl border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setGateShowPassword(!gateShowPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700"
                >
                  {gateShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 uppercase block mb-1">
                Security 2FA PIN (Demo: <code>admin123</code>)
              </label>
              <input 
                type="password"
                required
                placeholder="Enter 2FA Security PIN"
                value={gatePin}
                onChange={(e) => setGatePin(e.target.value)}
                className="w-full p-3 bg-neutral-100 rounded-xl border border-neutral-200 font-mono tracking-widest text-center focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full min-h-[46px] bg-neutral-900 hover:bg-neutral-800 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-md mt-2"
            >
              Verify & Unlock Admin Console
            </button>
          </form>

          <div className="pt-2 text-[11px] text-neutral-400 border-t border-neutral-100">
            <span>Official Admin: <strong>admin@kesavacleaning.com</strong> / <strong>admin123</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // --- CASE 3: FULLY AUTHENTICATED ADMINISTRATOR CONSOLE ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-purple-700">Central Management Console</span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 flex items-center gap-2">
            <span>KesavaCleaning Operations</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Authenticated Administrator: <strong className="text-neutral-800">{currentUser?.name}</strong> ({currentUser?.email})
          </p>
        </div>

        <button 
          onClick={() => { 
            logout(); 
            if (showToast) showToast("Admin session locked"); 
          }}
          className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-700 px-4 py-2 rounded-xl text-xs font-bold transition w-fit cursor-pointer border border-neutral-200"
        >
          <Unlock className="w-4 h-4 text-purple-600" />
          <span>Lock / Log Out Terminal</span>
        </button>
      </div>

      {/* KPI METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-800">₹{totalRevenue}</p>
          <span className="text-[10px] text-neutral-400">All customer orders</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-900">{orders.length}</p>
          <span className="text-[10px] text-neutral-400">Dispatches recorded</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Liquids</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-900">{products.length}</p>
          <span className="text-[10px] text-neutral-400">Bottled SKUs</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock SKUs</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600">{lowStockCount}</p>
          <span className="text-[10px] text-neutral-400">Needs restock</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-neutral-900">{users.length}</p>
          <span className="text-[10px] text-neutral-400">Accounts registered</span>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("inventory")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'inventory' 
              ? 'border-emerald-600 text-emerald-800 font-black' 
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Product Catalog & Stock ({products.length})
        </button>
        <button 
          onClick={() => setActiveTab("storeDiscount")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'storeDiscount' 
              ? 'border-emerald-600 text-emerald-800 font-black' 
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Flame className="w-4 h-4 text-red-500" />
          <span>Store-Wide Discounts</span>
          {storeWideDiscount?.active && (
            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">Active</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab("orders")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'orders' 
              ? 'border-emerald-600 text-emerald-800 font-black' 
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Customer Orders Log ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab("coupons")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'coupons' 
              ? 'border-emerald-600 text-emerald-800 font-black' 
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Coupon & Offers Manager ({coupons.length})
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'users' 
              ? 'border-emerald-600 text-emerald-800 font-black' 
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          User Accounts & Roles ({users.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT & INVENTORY MANAGEMENT (FILE UPLOAD & INDIVIDUAL DISCOUNT) */}
      {activeTab === 'inventory' && (
        <div className="space-y-8">
          
          {/* Add New Product Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <span>List New Bottled Formulation</span>
                </h3>
                <p className="text-xs text-neutral-500">Upload bottle photography from your computer and set tailored individual product discounts.</p>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="lg:col-span-2">
                <label className="font-bold text-neutral-700 block mb-1">Product Formulation Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Lavender Shine Heavy-Duty Floor Liquid" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 focus:bg-white focus:ring-2 focus:ring-emerald-500" 
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Category</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)} 
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 font-bold focus:bg-white"
                >
                  {CATEGORIES.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Bottle Volume</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 Liter or 500ml" 
                  value={newVolume} 
                  onChange={(e) => setNewVolume(e.target.value)} 
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 focus:bg-white" 
                />
              </div>

              {/* INDIVIDUAL PRODUCT PRICING & DISCOUNT CONTROLLER */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Regular MRP Price (₹) *</label>
                <input 
                  type="number" 
                  required
                  placeholder="399" 
                  value={newRegPrice} 
                  onChange={(e) => handleRegPriceChange(e.target.value)} 
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 font-bold focus:bg-white" 
                />
              </div>

              <div>
                <label className="font-bold text-emerald-700 block mb-1">Individual Discount (% OFF)</label>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number" 
                    min="0"
                    max="90"
                    placeholder="25" 
                    value={newDiscountPct} 
                    onChange={(e) => handleDiscountPctChange(e.target.value)} 
                    className="w-full p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 font-black text-emerald-800 text-center focus:bg-white" 
                  />
                  <span className="font-black text-emerald-700">%</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Selling Offer Price (₹) *</label>
                <input 
                  type="number" 
                  required 
                  placeholder="299" 
                  value={newOfferPrice} 
                  onChange={(e) => handleOfferPriceChange(e.target.value)} 
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 font-black text-neutral-900 focus:bg-white" 
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Stock Units Available</label>
                <input 
                  type="number" 
                  placeholder="50" 
                  value={newStock} 
                  onChange={(e) => setNewStock(e.target.value)} 
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 focus:bg-white" 
                />
              </div>

              <div className="lg:col-span-2">
                <label className="font-bold text-neutral-700 block mb-1">Fragrance / Aroma Notes</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cold-Pressed Sweet Orange & Lime" 
                  value={newScent} 
                  onChange={(e) => setNewScent(e.target.value)} 
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200" 
                />
              </div>

              <div className="lg:col-span-2">
                <label className="font-bold text-neutral-700 block mb-1">Recommended Surfaces</label>
                <input 
                  type="text" 
                  placeholder="e.g. Italian marble, granite, ceramic tiles, induction cooktops" 
                  value={newSurfaces} 
                  onChange={(e) => setNewSurfaces(e.target.value)} 
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200" 
                />
              </div>

              {/* PRODUCT IMAGE FILE UPLOAD (NOT PASTE LINK) */}
              <div className="lg:col-span-4 bg-neutral-50 p-4 rounded-2xl border-2 border-dashed border-neutral-300 space-y-3">
                <label className="font-black text-neutral-800 text-xs flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <span>Upload Formulation Image (From Computer - No URL Needed) *</span>
                </label>

                {uploadedImageBase64 ? (
                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-neutral-200">
                    <img 
                      src={uploadedImageBase64} 
                      alt="Uploaded preview" 
                      className="w-20 h-20 rounded-xl object-cover border border-neutral-200 shadow-sm shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-neutral-900 block truncate">{uploadedFileName}</span>
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready to publish (Stored locally as Base64)</span>
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={removeUploadedImage}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ImageIcon className="w-10 h-10 text-neutral-400 mb-2" />
                    <p className="text-xs font-bold text-neutral-700">Choose a product image from your device</p>
                    <p className="text-[11px] text-neutral-400 mb-3">PNG, JPG, or WEBP up to 5MB</p>
                    
                    <label className="cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition">
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span>Browse Files to Upload</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 pt-2 flex justify-end">
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3 rounded-xl transition cursor-pointer shadow-md text-xs"
                >
                  Publish Formulation Listing
                </button>
              </div>
            </form>
          </div>

          {/* Current Inventory Table with Individual Discount Modifiers */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-base text-neutral-900">Current Inventory ({products.length} Products)</h3>
                <p className="text-xs text-neutral-500">Edit stock counts inline or change individual discounts directly on any product.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-600">Quick Bulk Discount:</span>
                <button 
                  onClick={() => handleBulkDiscountAllProducts(10)}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold rounded-lg border border-neutral-300"
                >
                  All 10% OFF
                </button>
                <button 
                  onClick={() => handleBulkDiscountAllProducts(20)}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold rounded-lg border border-neutral-300"
                >
                  All 20% OFF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Liquid Formulation</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Regular MRP</th>
                    <th className="py-3 px-4">Individual Discount</th>
                    <th className="py-3 px-4">Selling Offer Price</th>
                    <th className="py-3 px-4">Stock Units</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map(p => {
                    const currentDisc = Math.round(((p.regularPrice - p.offerPrice) / p.regularPrice) * 100);
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200" />
                          <div>
                            <span className="font-bold text-neutral-900 block">{p.name}</span>
                            <span className="text-[10px] text-neutral-400">SKU: {p.id} &bull; {p.volume}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{p.category}</td>
                        <td className="py-3 px-4 text-neutral-400 line-through">₹{p.regularPrice}</td>
                        
                        {/* Individual Discount Quick Buttons on ANY Product */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[10px]">
                              {currentDisc}% OFF
                            </span>
                            <select 
                              value={currentDisc}
                              onChange={(e) => updateProductDiscount(p.id, e.target.value)}
                              className="text-[10px] p-1 bg-neutral-100 border border-neutral-300 rounded font-bold"
                            >
                              <option value="0">0%</option>
                              <option value="10">10%</option>
                              <option value="15">15%</option>
                              <option value="20">20%</option>
                              <option value="25">25%</option>
                              <option value="30">30%</option>
                              <option value="40">40%</option>
                              <option value="50">50%</option>
                            </select>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-black text-emerald-800 text-sm">₹{p.offerPrice}</td>
                        
                        <td className="py-3 px-4">
                          <input 
                            type="number" 
                            value={p.stock} 
                            onChange={(e) => updateInlineStock(p.id, e.target.value)}
                            className="w-16 p-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-center font-bold"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: STORE-WIDE / ALL-PRODUCTS PROMOTIONAL DISCOUNT ENGINE */}
      {activeTab === 'storeDiscount' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900">Store-Wide Promotional Discount Campaign</h3>
                <p className="text-xs text-neutral-500">
                  Instantly broadcast and apply an extra percentage discount across ALL products simultaneously without touching base prices.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveGlobalDiscount} className="space-y-5 text-xs">
              
              {/* Campaign Toggle */}
              <div className="p-4 rounded-2xl border flex items-center justify-between transition bg-neutral-50 border-neutral-200">
                <div>
                  <span className="font-extrabold text-sm text-neutral-900 block">Campaign Status</span>
                  <span className="text-neutral-500 text-[11px]">Turn store-wide sale ON or OFF across the whole storefront</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={globalActive} 
                    onChange={(e) => setGlobalActive(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Global Extra Discount Percentage (%)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5, 10, 15, 20].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setGlobalPct(val)}
                      className={`py-2 rounded-xl border text-center font-bold text-xs ${
                        Number(globalPct) === val ? 'bg-red-500 text-white border-red-500' : 'bg-neutral-100 border-neutral-200 text-neutral-800'
                      }`}
                    >
                      {val}% OFF
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  min="1" 
                  max="80" 
                  value={globalPct} 
                  onChange={(e) => setGlobalPct(e.target.value)} 
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 font-bold" 
                />
              </div>

              {/* Campaign Banner Headline */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Store Announcement Strip Message</label>
                <input 
                  type="text" 
                  value={globalTitle} 
                  onChange={(e) => setGlobalTitle(e.target.value)} 
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200" 
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl transition cursor-pointer shadow text-xs"
                >
                  Save Store-Wide Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER HISTORY & CUSTOMER LOG WITH DATE ANALYTICS & EXCEL EXPORT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* TOP BAR: TITLE & EXCEL DOWNLOAD CTA */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Sales Ledger & Analytics
                </span>
                <span className="text-xs text-neutral-400 font-bold">&bull; Dynamic Excel Exporter</span>
              </div>
              <h3 className="font-black text-xl text-neutral-900">Customer Orders & Revenue Stream</h3>
              <p className="text-xs text-neutral-500">
                Track order volume across week, month, year, or custom dates with 1-click itemized Excel export.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={downloadExcelReport}
                disabled={filteredOrders.length === 0}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition cursor-pointer shadow-sm ${
                  filteredOrders.length === 0
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                }`}
                title="Download CSV / Excel spreadsheet with Row #, Product Name, Category, Price, Date, Units"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel Report (.csv)</span>
                <span className="bg-emerald-800/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </button>
            </div>
          </div>

          {/* 4 PERIOD KPI ANALYTICS CARDS (WEEK, MONTH, YEAR, SELECTED VIEW) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* 1. WEEK ORDERS */}
            <div 
              onClick={() => setOrderPeriodFilter('week')}
              className={`p-5 rounded-3xl border transition cursor-pointer relative overflow-hidden ${
                orderPeriodFilter === 'week' 
                  ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md' 
                  : 'bg-white border-neutral-200 hover:border-emerald-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">This Week</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-neutral-900">{orderAnalytics.week.count} <span className="text-xs font-bold text-neutral-400">Orders</span></p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 text-[11px]">
                <span className="text-neutral-500 font-semibold">{orderAnalytics.week.units} Units Sold</span>
                <span className="font-black text-emerald-700">₹{orderAnalytics.week.revenue}</span>
              </div>
              <span className="text-[9px] text-neutral-400 block mt-1">Rolling past 7 days</span>
            </div>

            {/* 2. MONTH ORDERS */}
            <div 
              onClick={() => setOrderPeriodFilter('month')}
              className={`p-5 rounded-3xl border transition cursor-pointer relative overflow-hidden ${
                orderPeriodFilter === 'month' 
                  ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md' 
                  : 'bg-white border-neutral-200 hover:border-emerald-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">This Month</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-neutral-900">{orderAnalytics.month.count} <span className="text-xs font-bold text-neutral-400">Orders</span></p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 text-[11px]">
                <span className="text-neutral-500 font-semibold">{orderAnalytics.month.units} Units Sold</span>
                <span className="font-black text-emerald-700">₹{orderAnalytics.month.revenue}</span>
              </div>
              <span className="text-[9px] text-neutral-400 block mt-1">Current calendar month</span>
            </div>

            {/* 3. YEAR ORDERS */}
            <div 
              onClick={() => setOrderPeriodFilter('year')}
              className={`p-5 rounded-3xl border transition cursor-pointer relative overflow-hidden ${
                orderPeriodFilter === 'year' 
                  ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md' 
                  : 'bg-white border-neutral-200 hover:border-emerald-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">This Year (2026)</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-neutral-900">{orderAnalytics.year.count} <span className="text-xs font-bold text-neutral-400">Orders</span></p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 text-[11px]">
                <span className="text-neutral-500 font-semibold">{orderAnalytics.year.units} Units Sold</span>
                <span className="font-black text-emerald-700">₹{orderAnalytics.year.revenue}</span>
              </div>
              <span className="text-[9px] text-neutral-400 block mt-1">Calendar year 2026</span>
            </div>

            {/* 4. CURRENT FILTERED LEDGER OVERVIEW */}
            <div className="p-5 rounded-3xl bg-neutral-900 text-white shadow-md relative overflow-hidden space-y-1">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  {orderPeriodFilter === 'all' && 'All-Time Total'}
                  {orderPeriodFilter === 'week' && 'Filtered: Week'}
                  {orderPeriodFilter === 'month' && 'Filtered: Month'}
                  {orderPeriodFilter === 'year' && 'Filtered: Year'}
                  {orderPeriodFilter === 'custom' && 'Filtered: Custom'}
                </span>
                <Filter className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">{filteredStats.count} <span className="text-xs text-neutral-400 font-normal">Orders</span></p>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-neutral-800 text-neutral-300">
                <span>Revenue: <strong className="text-emerald-400">₹{filteredStats.revenue}</strong></span>
                <span>Avg: <strong>₹{filteredStats.avgOrderValue}</strong></span>
              </div>
              <span className="text-[9px] text-neutral-400 block">{filteredStats.units} liquid units in active filter</span>
            </div>

          </div>

          {/* DYNAMIC DATE FILTER TOOLBAR */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200">
                <button
                  onClick={() => setOrderPeriodFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    orderPeriodFilter === 'all' 
                      ? 'bg-white text-neutral-900 shadow-sm font-black' 
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  All Orders ({orders.length})
                </button>
                <button
                  onClick={() => setOrderPeriodFilter('week')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    orderPeriodFilter === 'week' 
                      ? 'bg-emerald-600 text-white shadow-sm font-black' 
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  This Week ({orderAnalytics.week.count})
                </button>
                <button
                  onClick={() => setOrderPeriodFilter('month')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    orderPeriodFilter === 'month' 
                      ? 'bg-emerald-600 text-white shadow-sm font-black' 
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  This Month ({orderAnalytics.month.count})
                </button>
                <button
                  onClick={() => setOrderPeriodFilter('year')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    orderPeriodFilter === 'year' 
                      ? 'bg-emerald-600 text-white shadow-sm font-black' 
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  This Year ({orderAnalytics.year.count})
                </button>
                <button
                  onClick={() => setOrderPeriodFilter('custom')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    orderPeriodFilter === 'custom' 
                      ? 'bg-neutral-900 text-white shadow-sm font-black' 
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Custom Date Range</span>
                </button>
              </div>

              {/* Reset or Clear Action */}
              <div className="flex items-center gap-2 text-xs">
                {orderPeriodFilter !== 'all' && (
                  <button
                    onClick={() => {
                      setOrderPeriodFilter('all');
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-800 font-bold px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Date Filters</span>
                  </button>
                )}
                <span className="text-neutral-400 font-semibold">
                  Showing <strong className="text-neutral-800">{filteredOrders.length}</strong> of {orders.length} orders
                </span>
              </div>
            </div>

            {/* CUSTOM DATE RANGE PICKER INPUTS (WHEN 'CUSTOM' IS SELECTED) */}
            {orderPeriodFilter === 'custom' && (
              <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 block">From Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full p-2 bg-white rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 focus:outline-emerald-500"
                  />
                </div>
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 block">To Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full p-2 bg-white rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 focus:outline-emerald-500"
                  />
                </div>
                <div className="sm:col-span-4 sm:pt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="px-3 py-2 bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Clear Dates
                  </button>
                  <span className="text-[11px] text-neutral-500 italic">
                    {customStartDate && customEndDate 
                      ? `${customStartDate} → ${customEndDate}` 
                      : "Select dates to filter"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ORDERS TABLE */}
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-black text-sm text-neutral-900">Chronological Customer Orders & Fulfillment</h4>
                <p className="text-[11px] text-neutral-500">Live order fulfillment stream with status updates and itemized line details.</p>
              </div>
              <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
                {filteredOrders.length} Orders displayed
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-14 h-14 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="font-black text-base text-neutral-800">No Orders in Selected Period</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  No customer orders match the current date filter ({orderPeriodFilter}). Try selecting "All Orders" or broadening your custom date range.
                </p>
                <button
                  onClick={() => {
                    setOrderPeriodFilter('all');
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-700 cursor-pointer"
                >
                  Show All Orders
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Ordered Liquids & Categories</th>
                      <th className="py-3 px-4">Units & Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredOrders.map(o => {
                      const totalOrderUnits = (o.items || []).reduce((sum, it) => sum + (Number(it.qty) || 1), 0);
                      return (
                        <tr key={o.orderId} className="hover:bg-neutral-50/50">
                          <td className="py-3 px-4">
                            <span className="font-black text-neutral-900 block font-mono">#{o.orderId}</span>
                            <span className="text-[10px] text-neutral-500 block">{o.date}</span>
                            {o.createdAt && (
                              <span className="text-[9px] text-neutral-400 font-mono block">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-neutral-800 block">{o.customerName}</span>
                            <span className="text-[11px] text-neutral-500 block">{o.phone}</span>
                            <span className="text-[10px] text-neutral-400 block max-w-xs truncate" title={o.address}>
                              {o.address}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <ul className="space-y-1.5">
                              {o.items.map((it, idx) => (
                                <li key={idx} className="text-neutral-700">
                                  <div className="font-medium">
                                    <strong className="text-neutral-900">{it.qty}x</strong> {it.name} <span className="text-[10px] text-neutral-400">({it.volume})</span>
                                  </div>
                                  <span className="inline-block text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-semibold border border-neutral-200">
                                    {it.category || "Cleaning Formulations"} &bull; ₹{it.price}/unit
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-black text-emerald-800 text-sm block">₹{o.total}</span>
                            <span className="text-[10px] text-neutral-500 font-semibold">{totalOrderUnits} units</span>
                          </td>
                          <td className="py-3 px-4 text-neutral-600 font-semibold">
                            {o.paymentMethod}
                          </td>
                          <td className="py-3 px-4">
                            <select 
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.orderId, e.target.value)}
                              className={`text-xs font-bold p-1.5 rounded-lg border ${
                                o.status === 'Delivered' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                  : (o.status === 'Dispatched' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-amber-50 text-amber-800 border-amber-200')
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Packed">Packed</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* SPREADSHEET LEDGER FOOTER BAR */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-neutral-500">
                <span className="font-bold text-neutral-700">Excel Export Includes:</span> Sequential Row #, Order ID, Sale Date, Product Name, Category Name, Bottle Volume, Unit Price, Units of Buy (Qty), Item Subtotal, Order Grand Total, Customer Details & Address.
              </div>
              <button
                onClick={downloadExcelReport}
                disabled={filteredOrders.length === 0}
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-black cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export ({filteredOrders.length} orders) to Excel</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: COUPON & OFFERS MANAGER (PRESERVED IN FULL) */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Create Coupon Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-black text-base text-neutral-900">Create New Coupon Code</h3>
              <p className="text-xs text-neutral-500">Store coupons stack with individual and store-wide sales.</p>
            </div>
            
            <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. KESAVASALE" 
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Discount Type</label>
                <select 
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value)}
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 font-bold"
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="flat">Flat Rupee Discount (₹)</option>
                  <option value="shipping">Free Shipping</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Discount Value (% or ₹)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 15 or 50" 
                  value={newCouponVal}
                  onChange={(e) => setNewCouponVal(e.target.value)}
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Minimum Order Value (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 499" 
                  value={newCouponMin}
                  onChange={(e) => setNewCouponMin(e.target.value)}
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Customer Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. 15% OFF for corporate cleaning" 
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  className="w-full p-2.5 bg-neutral-100 rounded-xl border border-neutral-200"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition mt-2 cursor-pointer shadow-sm"
              >
                Save & Activate Coupon
              </button>
            </form>
          </div>

          {/* Active Coupons List (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h3 className="font-black text-base text-neutral-900">Active Coupons ({coupons.length})</h3>

            <div className="space-y-3">
              {coupons.map(c => (
                <div key={c.code} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-neutral-900 font-mono bg-white px-2.5 py-1 rounded-lg border border-neutral-300">
                        {c.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        {c.discountType === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{c.desc}</p>
                    <span className="text-[10px] text-neutral-400">Min Order: ₹{c.minOrder}</span>
                  </div>

                  <button 
                    onClick={() => deleteCoupon(c.code)}
                    className="p-2 text-neutral-400 hover:text-red-500 rounded-xl hover:bg-white transition cursor-pointer"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: REGISTERED USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="font-black text-base text-neutral-900">Registered Accounts ({users.length})</h3>
            <p className="text-xs text-neutral-500">Directory of registered customers and administrators.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Account Role</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                          u.role === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'
                        }`}>
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 block">{u.name}</span>
                          <span className="text-[10px] text-neutral-400">{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-700 font-medium">{u.email}</td>
                    <td className="py-3 px-4 text-neutral-600">{u.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 max-w-xs truncate">{u.address}</td>
                    <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">{u.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
