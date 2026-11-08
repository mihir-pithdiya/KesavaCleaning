/**
 * Kesava Cleaning - Authentication & User Session Controller
 * Manages Sign In, Sign Up, User Profile Modal, and Demo Logins.
 */

const auth = {
  init() {
    this.bindEvents();
    this.refreshAuthUI();
  },

  bindEvents() {
    // Auth Modal open/close
    const openAuthBtns = document.querySelectorAll(".open-auth-modal-btn");
    openAuthBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.authMode || "login";
        this.openAuthModal(mode);
      });
    });

    const closeAuthBtn = document.getElementById("closeAuthModalBtn");
    if (closeAuthBtn) {
      closeAuthBtn.addEventListener("click", () => this.closeAuthModal());
    }

    const authModalBackdrop = document.getElementById("authModalBackdrop");
    if (authModalBackdrop) {
      authModalBackdrop.addEventListener("click", () => this.closeAuthModal());
    }

    // Tab switching inside auth modal
    const tabLogin = document.getElementById("authTabLogin");
    const tabRegister = document.getElementById("authTabRegister");
    if (tabLogin && tabRegister) {
      tabLogin.addEventListener("click", () => this.switchTab("login"));
      tabRegister.addEventListener("click", () => this.switchTab("register"));
    }

    // Forms
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    // Demo Fill Buttons
    const demoCustomerBtn = document.getElementById("demoCustomerBtn");
    if (demoCustomerBtn) {
      demoCustomerBtn.addEventListener("click", () => {
        document.getElementById("loginEmail").value = "demo@kesavacleaning.com";
        document.getElementById("loginPassword").value = "Clean@2026";
        this.clearAuthErrors();
      });
    }

    const demoAdminBtn = document.getElementById("demoAdminBtn");
    if (demoAdminBtn) {
      demoAdminBtn.addEventListener("click", () => {
        document.getElementById("loginEmail").value = "admin@kesavacleaning.com";
        document.getElementById("loginPassword").value = "Kesava@2026";
        this.clearAuthErrors();
      });
    }

    // User Profile Dropdown Toggle
    const userMenuBtn = document.getElementById("userMenuBtn");
    const userDropdown = document.getElementById("userDropdown");
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("hidden");
      });
      document.addEventListener("click", () => {
        userDropdown.classList.add("hidden");
      });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    // Dashboard Modal
    const openDashboardBtn = document.getElementById("openDashboardBtn");
    if (openDashboardBtn) {
      openDashboardBtn.addEventListener("click", () => this.openDashboardModal());
    }

    const closeDashboardBtn = document.getElementById("closeDashboardBtn");
    if (closeDashboardBtn) {
      closeDashboardBtn.addEventListener("click", () => this.closeDashboardModal());
    }

    const dashboardBackdrop = document.getElementById("dashboardBackdrop");
    if (dashboardBackdrop) {
      dashboardBackdrop.addEventListener("click", () => this.closeDashboardModal());
    }

    // Dashboard Tabs
    const dashTabBookings = document.getElementById("dashTabBookings");
    const dashTabOrders = document.getElementById("dashTabOrders");
    const dashTabProfile = document.getElementById("dashTabProfile");

    if (dashTabBookings && dashTabOrders && dashTabProfile) {
      dashTabBookings.addEventListener("click", () => this.switchDashboardTab("bookings"));
      dashTabOrders.addEventListener("click", () => this.switchDashboardTab("orders"));
      dashTabProfile.addEventListener("click", () => this.switchDashboardTab("profile"));
    }
  },

  openAuthModal(mode = "login") {
    const modal = document.getElementById("authModal");
    if (!modal) return;
    this.clearAuthErrors();
    this.switchTab(mode);
    modal.classList.remove("hidden");
    modal.classList.remove("opacity-0", "pointer-events-none");
    if (typeof modal.showModal === "function") {
      try { modal.showModal(); } catch (e) {}
    }
  },

  closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (!modal) return;
    modal.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => {
      modal.classList.add("hidden");
      if (typeof modal.close === "function") {
        try { modal.close(); } catch (e) {}
      }
    }, 200);
  },

  switchTab(tab) {
    const tabLogin = document.getElementById("authTabLogin");
    const tabRegister = document.getElementById("authTabRegister");
    const loginSection = document.getElementById("authLoginSection");
    const registerSection = document.getElementById("authRegisterSection");

    this.clearAuthErrors();

    if (tab === "login") {
      tabLogin.classList.add("border-brand-500", "text-brand-600");
      tabLogin.classList.remove("border-transparent", "text-earth-stone");
      tabRegister.classList.remove("border-brand-500", "text-brand-600");
      tabRegister.classList.add("border-transparent", "text-earth-stone");

      loginSection.classList.remove("hidden");
      registerSection.classList.add("hidden");
    } else {
      tabRegister.classList.add("border-brand-500", "text-brand-600");
      tabRegister.classList.remove("border-transparent", "text-earth-stone");
      tabLogin.classList.remove("border-brand-500", "text-brand-600");
      tabLogin.classList.add("border-transparent", "text-earth-stone");

      registerSection.classList.remove("hidden");
      loginSection.classList.add("hidden");
    }
  },

  clearAuthErrors() {
    const errBox = document.getElementById("authErrorMsg");
    if (errBox) {
      errBox.classList.add("hidden");
      errBox.textContent = "";
    }
  },

  showAuthError(msg) {
    const errBox = document.getElementById("authErrorMsg");
    if (errBox) {
      errBox.textContent = msg;
      errBox.classList.remove("hidden");
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    this.clearAuthErrors();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const submitBtn = document.getElementById("loginSubmitBtn");

    if (!email || !password) {
      this.showAuthError("Please enter your email and password.");
      return;
    }

    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Signing In...`;
    lucide.createIcons();

    try {
      const res = await api.login(email, password);
      this.closeAuthModal();
      this.refreshAuthUI();
      if (window.showToast) {
        window.showToast(`Welcome back, ${res.user.name}!`);
      }
    } catch (err) {
      this.showAuthError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
      lucide.createIcons();
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    this.clearAuthErrors();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;
    const submitBtn = document.getElementById("regSubmitBtn");

    if (password !== confirmPassword) {
      this.showAuthError("Passwords do not match. Please retype them.");
      return;
    }

    if (password.length < 6) {
      this.showAuthError("Password must be at least 6 characters.");
      return;
    }

    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Creating Account...`;
    lucide.createIcons();

    try {
      const res = await api.register(name, email, password, phone);
      this.closeAuthModal();
      this.refreshAuthUI();
      if (window.showToast) {
        window.showToast(`Welcome to Kesava Cleaning, ${res.user.name}!`);
      }
    } catch (err) {
      this.showAuthError(err.message || "Registration failed. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
      lucide.createIcons();
    }
  },

  async handleLogout() {
    await api.logout();
    this.refreshAuthUI();
    if (window.showToast) {
      window.showToast("Signed out successfully.");
    }
  },

  refreshAuthUI() {
    const user = api.getUser();
    const authGuestSection = document.getElementById("authGuestSection");
    const authUserSection = document.getElementById("authUserSection");
    const userAvatarText = document.getElementById("userAvatarText");
    const userNameLabel = document.getElementById("userNameLabel");
    const userEmailLabel = document.getElementById("userEmailLabel");
    const mobileAuthLink = document.getElementById("mobileAuthLink");

    if (user) {
      if (authGuestSection) authGuestSection.classList.add("hidden");
      if (authUserSection) authUserSection.classList.remove("hidden");

      const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "KC";
      if (userAvatarText) userAvatarText.textContent = initials;
      if (userNameLabel) userNameLabel.textContent = user.name;
      if (userEmailLabel) userEmailLabel.textContent = user.email;

      if (mobileAuthLink) {
        mobileAuthLink.innerHTML = `<i data-lucide="user" class="w-4 h-4"></i> My Account (${user.name.split(" ")[0]})`;
        mobileAuthLink.onclick = () => this.openDashboardModal();
      }
    } else {
      if (authGuestSection) authGuestSection.classList.remove("hidden");
      if (authUserSection) authUserSection.classList.add("hidden");

      if (mobileAuthLink) {
        mobileAuthLink.innerHTML = `<i data-lucide="log-in" class="w-4 h-4"></i> Sign In / Register`;
        mobileAuthLink.onclick = () => this.openAuthModal("login");
      }
    }
    lucide.createIcons();
  },

  // User Dashboard
  async openDashboardModal() {
    const modal = document.getElementById("dashboardModal");
    if (!modal) return;
    const user = api.getUser();
    if (!user) {
      this.openAuthModal("login");
      return;
    }

    document.getElementById("dashUserName").textContent = user.name;
    document.getElementById("dashUserEmail").textContent = user.email;
    document.getElementById("dashUserPhone").textContent = user.phone || "Not provided";
    document.getElementById("dashUserRole").textContent = user.role.toUpperCase();

    modal.classList.remove("hidden", "opacity-0", "pointer-events-none");
    this.switchDashboardTab("bookings");
    if (typeof modal.showModal === "function") {
      try { modal.showModal(); } catch (e) {}
    }
  },

  closeDashboardModal() {
    const modal = document.getElementById("dashboardModal");
    if (!modal) return;
    modal.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => {
      modal.classList.add("hidden");
      if (typeof modal.close === "function") {
        try { modal.close(); } catch (e) {}
      }
    }, 200);
  },

  async switchDashboardTab(tab) {
    const bookingsTab = document.getElementById("dashTabBookings");
    const ordersTab = document.getElementById("dashTabOrders");
    const profileTab = document.getElementById("dashTabProfile");

    const bookingsContent = document.getElementById("dashBookingsContent");
    const ordersContent = document.getElementById("dashOrdersContent");
    const profileContent = document.getElementById("dashProfileContent");

    [bookingsTab, ordersTab, profileTab].forEach(b => {
      b.classList.remove("border-brand-500", "text-brand-600");
      b.classList.add("border-transparent", "text-earth-stone");
    });
    [bookingsContent, ordersContent, profileContent].forEach(c => c.classList.add("hidden"));

    if (tab === "bookings") {
      bookingsTab.classList.add("border-brand-500", "text-brand-600");
      bookingsTab.classList.remove("border-transparent", "text-earth-stone");
      bookingsContent.classList.remove("hidden");
      await this.loadUserBookings();
    } else if (tab === "orders") {
      ordersTab.classList.add("border-brand-500", "text-brand-600");
      ordersTab.classList.remove("border-transparent", "text-earth-stone");
      ordersContent.classList.remove("hidden");
      await this.loadUserOrders();
    } else {
      profileTab.classList.add("border-brand-500", "text-brand-600");
      profileTab.classList.remove("border-transparent", "text-earth-stone");
      profileContent.classList.remove("hidden");
    }
  },

  async loadUserBookings() {
    const listEl = document.getElementById("dashBookingsList");
    listEl.innerHTML = `<div class="py-8 text-center text-xs text-earth-stone"><i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600"></i>Loading your appointments...</div>`;
    lucide.createIcons();

    try {
      const res = await api.getBookings();
      const bookings = res.bookings || [];

      if (bookings.length === 0) {
        listEl.innerHTML = `
          <div class="py-12 text-center">
            <i data-lucide="calendar" class="w-10 h-10 text-earth-stone mx-auto mb-2"></i>
            <p class="font-bold text-sm text-earth-dark">No scheduled appointments yet</p>
            <p class="text-xs text-earth-stone mt-1">Ready for a spotless home? Book a certified eco-clean today.</p>
            <button onclick="auth.closeDashboardModal(); booking.openBookingModal();" class="mt-4 bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-full">Book a Clean</button>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      listEl.innerHTML = bookings.map(b => `
        <div class="p-4 bg-earth-sand/40 rounded-2xl border border-earth-clay flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-earth-dark">${b.service_type}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${b.status}</span>
            </div>
            <p class="text-xs text-earth-stone mt-1 flex items-center gap-2">
              <span>📅 ${b.service_date} at ${b.service_time}</span>
              <span>•</span>
              <span>📍 ${b.address}</span>
            </p>
            <p class="text-[11px] text-brand-700 font-semibold mt-1">
              ${b.rooms} Bed / ${b.bathrooms} Bath • ${b.frequency} • Total: $${Number(b.total_price).toFixed(2)}
            </p>
          </div>
          ${b.status !== 'Cancelled' ? `
            <button onclick="auth.cancelBookingAction(${b.id})" class="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline shrink-0">
              Cancel Appointment
            </button>
          ` : '<span class="text-xs text-earth-stone italic">Cancelled</span>'}
        </div>
      `).join("");
      lucide.createIcons();
    } catch (e) {
      listEl.innerHTML = `<p class="text-xs text-red-500 text-center py-4">Failed to load appointments: ${e.message}</p>`;
    }
  },

  async cancelBookingAction(id) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.cancelBooking(id);
      if (window.showToast) window.showToast("Appointment cancelled.");
      this.loadUserBookings();
    } catch (e) {
      alert("Error: " + e.message);
    }
  },

  async loadUserOrders() {
    const listEl = document.getElementById("dashOrdersList");
    listEl.innerHTML = `<div class="py-8 text-center text-xs text-earth-stone"><i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600"></i>Loading past orders...</div>`;
    lucide.createIcons();

    try {
      const res = await api.getOrders();
      const orders = res.orders || [];

      if (orders.length === 0) {
        listEl.innerHTML = `
          <div class="py-12 text-center">
            <i data-lucide="package" class="w-10 h-10 text-earth-stone mx-auto mb-2"></i>
            <p class="font-bold text-sm text-earth-dark">No product orders yet</p>
            <p class="text-xs text-earth-stone mt-1">Start eliminating single-use plastic with our refill kits.</p>
            <button onclick="auth.closeDashboardModal(); location.hash='#products';" class="mt-4 bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-full">Explore Refill Kits</button>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      listEl.innerHTML = orders.map(o => `
        <div class="p-4 bg-earth-sand/40 rounded-2xl border border-earth-clay">
          <div class="flex items-center justify-between pb-2 border-b border-earth-clay/60">
            <div>
              <span class="font-bold text-xs text-earth-dark">${o.order_number}</span>
              <span class="text-[11px] text-earth-stone ml-2">${o.created_at.split(" ")[0]}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800">${o.fulfillment_status}</span>
          </div>
          <div class="py-2 space-y-1">
            ${(o.items || []).map(item => `
              <div class="flex justify-between text-xs text-earth-dark">
                <span>${item.qty}x ${item.name} (${item.scent || 'Standard'})</span>
                <span class="font-semibold">$${(item.price * item.qty).toFixed(2)}</span>
              </div>
            `).join("")}
          </div>
          <div class="pt-2 border-t border-earth-clay/60 flex justify-between items-center text-xs">
            <span class="text-earth-stone">Shipping: Free Carbon-Neutral</span>
            <span class="font-extrabold text-brand-600 text-sm">Total: $${Number(o.total_amount).toFixed(2)}</span>
          </div>
        </div>
      `).join("");
      lucide.createIcons();
    } catch (e) {
      listEl.innerHTML = `<p class="text-xs text-red-500 text-center py-4">Failed to load orders: ${e.message}</p>`;
    }
  }
};
