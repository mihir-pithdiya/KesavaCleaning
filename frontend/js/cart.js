/**
 * Kesava Cleaning - Shopping Cart & Zero-Waste Checkout System
 * Handles persistent cart items, shipping goal meter, promo codes, and backend order processing.
 */

const cart = {
  items: [],
  discountCode: "",
  discountPercent: 0,

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.render();
  },

  loadFromStorage() {
    const raw = localStorage.getItem("kesava_cart_items");
    if (raw) {
      try {
        this.items = JSON.parse(raw);
      } catch (e) {
        this.items = [];
      }
    }

    if (this.items.length === 0) {
      // Default initial bundle
      this.items = [
        {
          id: "bundle-default",
          name: "Kesava Starter Bundle",
          scent: "Eucalyptus & Mint",
          format: "Amber Bottle + 4 Pouches",
          price: 34.00,
          qty: 1
        }
      ];
    }
  },

  saveToStorage() {
    localStorage.setItem("kesava_cart_items", JSON.stringify(this.items));
  },

  bindEvents() {
    // Open/Close Drawer
    const openBtn = document.getElementById("openCartBtn");
    const closeBtn = document.getElementById("closeCartBtn");
    const backdrop = document.getElementById("cartBackdrop");

    if (openBtn) openBtn.addEventListener("click", () => this.openDrawer());
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeDrawer());
    if (backdrop) backdrop.addEventListener("click", () => this.closeDrawer());

    // Promo Code Apply
    const promoBtn = document.getElementById("applyPromoBtn");
    const promoInput = document.getElementById("promoCodeInput");
    if (promoBtn && promoInput) {
      promoBtn.addEventListener("click", () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === "CLEAN15" || code === "KESAVA15" || code === "EARTH") {
          this.discountCode = code;
          this.discountPercent = 0.15;
          document.getElementById("promoSuccessMsg").classList.remove("hidden");
          document.getElementById("promoErrorMsg").classList.add("hidden");
          this.render();
        } else {
          document.getElementById("promoErrorMsg").classList.remove("hidden");
          document.getElementById("promoSuccessMsg").classList.add("hidden");
        }
      });
    }

    // Checkout Button
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => this.handleCheckout());
    }
  },

  openDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const panel = document.getElementById("cartPanel");
    if (!drawer || !panel) return;

    drawer.classList.remove("pointer-events-none", "opacity-0");
    panel.classList.remove("translate-x-full");
    this.render();
  },

  closeDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const panel = document.getElementById("cartPanel");
    if (!drawer || !panel) return;

    drawer.classList.add("opacity-0", "pointer-events-none");
    panel.classList.add("translate-x-full");
  },

  addItem(item) {
    const existing = this.items.find(i => i.name === item.name && i.scent === item.scent);
    if (existing) {
      existing.qty += item.qty;
    } else {
      this.items.push({
        id: Date.now().toString(),
        name: item.name,
        scent: item.scent || "Eucalyptus & Mint",
        format: item.format || "Refill System",
        price: Number(item.price),
        qty: item.qty || 1
      });
    }
    this.saveToStorage();
    this.render();
    if (window.showToast) {
      window.showToast(`Added ${item.qty}x ${item.name} to cart`);
    }
    this.openDrawer();
  },

  changeQty(index, delta) {
    if (this.items[index]) {
      this.items[index].qty += delta;
      if (this.items[index].qty <= 0) {
        this.items.splice(index, 1);
      }
      this.saveToStorage();
      this.render();
    }
  },

  removeItem(index) {
    if (this.items[index]) {
      this.items.splice(index, 1);
      this.saveToStorage();
      this.render();
    }
  },

  calculateTotals() {
    let subtotal = 0;
    let totalQty = 0;

    this.items.forEach(item => {
      subtotal += item.price * item.qty;
      totalQty += item.qty;
    });

    const shipping = subtotal >= 30.0 || subtotal === 0 ? 0.0 : 4.95;
    const discount = subtotal * this.discountPercent;
    const total = Math.max(0, subtotal - discount + shipping);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalQty,
      shipping,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  },

  render() {
    const totals = this.calculateTotals();
    const itemList = document.getElementById("cartItemList");
    const subtotalEl = document.getElementById("cartSubtotal");
    const totalEl = document.getElementById("cartTotal");
    const shippingEl = document.getElementById("cartShippingCost");
    const discountRow = document.getElementById("cartDiscountRow");
    const discountVal = document.getElementById("cartDiscountVal");
    const badge = document.getElementById("cartCountBadge");
    const headerCount = document.getElementById("cartTotalItemsCount");

    // Badges
    if (badge) badge.textContent = totals.totalQty;
    if (headerCount) headerCount.textContent = totals.totalQty;

    // Shipping Progress Meter
    const progressBar = document.getElementById("shippingProgressBar");
    const meterText = document.getElementById("shippingMeterText");
    const meterPct = document.getElementById("shippingMeterPct");
    const threshold = 30.0;

    if (progressBar && meterText && meterPct) {
      if (totals.subtotal >= threshold) {
        progressBar.style.width = "100%";
        meterPct.textContent = "100%";
        meterText.textContent = "🎉 You unlocked Free Carbon-Neutral Shipping!";
        if (shippingEl) shippingEl.textContent = "FREE";
      } else {
        const remaining = (threshold - totals.subtotal).toFixed(2);
        const pct = Math.min(Math.round((totals.subtotal / threshold) * 100), 100);
        progressBar.style.width = `${pct}%`;
        meterPct.textContent = `${pct}%`;
        meterText.textContent = `You're $${remaining} away from Free Shipping!`;
        if (shippingEl) shippingEl.textContent = "$4.95";
      }
    }

    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${totals.total.toFixed(2)}`;

    if (discountRow && discountVal) {
      if (totals.discount > 0) {
        discountRow.classList.remove("hidden");
        discountVal.textContent = `-$${totals.discount.toFixed(2)}`;
      } else {
        discountRow.classList.add("hidden");
      }
    }

    // Render items list
    if (!itemList) return;

    if (this.items.length === 0) {
      itemList.innerHTML = `
        <div class="py-16 text-center">
          <i data-lucide="package-open" class="w-12 h-12 text-earth-stone mx-auto mb-3"></i>
          <p class="font-bold text-earth-dark text-base">Your cart is empty</p>
          <p class="text-xs text-earth-stone mt-1">Start living plastic-free with our botanical starter kit.</p>
          <button onclick="cart.closeDrawer(); location.hash='#products';" class="mt-4 bg-brand-500 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow">
            Explore Eco-Refills
          </button>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    itemList.innerHTML = this.items.map((item, idx) => `
      <div class="flex items-center justify-between p-3.5 bg-earth-sand/50 rounded-2xl border border-earth-clay">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs shrink-0">
            <i data-lucide="sparkles" class="w-5 h-5 text-brand-600"></i>
          </div>
          <div>
            <h4 class="font-bold text-xs text-earth-dark leading-snug">${item.name}</h4>
            <p class="text-[11px] text-brand-600 font-semibold">${item.scent}</p>
            <p class="text-[10px] text-earth-stone">${item.format}</p>
            <div class="flex items-center gap-2 mt-2">
              <div class="inline-flex items-center border border-earth-clay rounded-full bg-white px-2 py-0.5">
                <button onclick="cart.changeQty(${idx}, -1)" class="px-1 text-xs font-bold text-earth-dark hover:text-brand-600">-</button>
                <span class="text-xs font-bold px-2">${item.qty}</span>
                <button onclick="cart.changeQty(${idx}, 1)" class="px-1 text-xs font-bold text-earth-dark hover:text-brand-600">+</button>
              </div>
              <span class="text-xs font-bold text-earth-dark">$${(item.price * item.qty).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <button onclick="cart.removeItem(${idx})" class="text-earth-stone hover:text-red-500 p-1">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `).join("");

    lucide.createIcons();
  },

  async handleCheckout() {
    if (this.items.length === 0) {
      if (window.showToast) window.showToast("Your cart is empty!");
      return;
    }

    const checkoutBtn = document.getElementById("checkoutBtn");
    const origText = checkoutBtn.innerHTML;
    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Processing Eco-Order...`;
    lucide.createIcons();

    try {
      const user = api.getUser();
      const payload = {
        items: this.items,
        discount_code: this.discountCode,
        shipping_address: user ? (user.address || "Customer Address On File") : "742 Evergreen Terrace, Austin TX",
        customer_name: user ? user.name : "Conscious Customer",
        customer_email: user ? user.email : "customer@kesavacleaning.com"
      };

      const res = await api.createOrder(payload);
      this.items = [];
      this.saveToStorage();
      this.render();
      this.closeDrawer();

      if (window.showToast) {
        window.showToast(`🎉 Order ${res.order.order_number} confirmed! Carbon-neutral shipping underway.`);
      }

      if (user) {
        auth.loadUserOrders();
      }
    } catch (e) {
      alert("Order error: " + e.message);
    } finally {
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = origText;
      lucide.createIcons();
    }
  }
};
