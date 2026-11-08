/**
 * Kesava Cleaning - Service Booking & Instant Quotation Engine
 * Calculates service pricing and submits appointment bookings to backend API.
 */

const booking = {
  pricing: {
    baseRates: {
      "Residential Deep Clean": 129.0,
      "Kitchen & Appliance Restoration": 99.0,
      "Bathroom Mineral & Scale Sanitization": 89.0,
      "Move-in / Move-out Sanitization": 169.0,
      "Eco Commercial & Office": 199.0
    },
    addonRates: {
      "Inside Oven Degreasing": 35.0,
      "Inside Refrigerator": 30.0,
      "Eco Aromatherapy Room Mist": 15.0,
      "Interior Windows Polish": 25.0,
      "Carpet Deep Bio-Extract": 45.0
    }
  },

  state: {
    serviceType: "Residential Deep Clean",
    rooms: 2,
    bathrooms: 1,
    sqft: 1200,
    frequency: "One-time",
    addons: []
  },

  init() {
    this.bindCalculatorEvents();
    this.bindModalEvents();
    this.updateQuoteUI();
  },

  bindCalculatorEvents() {
    // Service select tabs / buttons
    const serviceButtons = document.querySelectorAll(".service-select-btn");
    serviceButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        serviceButtons.forEach(b => {
          b.classList.remove("border-brand-500", "bg-brand-50", "text-brand-900");
          b.classList.add("border-earth-clay", "bg-white", "text-earth-dark");
        });
        btn.classList.add("border-brand-500", "bg-brand-50", "text-brand-900");
        btn.classList.remove("border-earth-clay", "bg-white", "text-earth-dark");

        this.state.serviceType = btn.dataset.service;
        this.updateQuoteUI();
      });
    });

    // Room controls
    const roomsMinus = document.getElementById("quoteRoomsMinus");
    const roomsPlus = document.getElementById("quoteRoomsPlus");
    if (roomsMinus && roomsPlus) {
      roomsMinus.addEventListener("click", () => {
        if (this.state.rooms > 1) {
          this.state.rooms--;
          this.updateQuoteUI();
        }
      });
      roomsPlus.addEventListener("click", () => {
        if (this.state.rooms < 8) {
          this.state.rooms++;
          this.updateQuoteUI();
        }
      });
    }

    // Bathroom controls
    const bathsMinus = document.getElementById("quoteBathsMinus");
    const bathsPlus = document.getElementById("quoteBathsPlus");
    if (bathsMinus && bathsPlus) {
      bathsMinus.addEventListener("click", () => {
        if (this.state.bathrooms > 1) {
          this.state.bathrooms--;
          this.updateQuoteUI();
        }
      });
      bathsPlus.addEventListener("click", () => {
        if (this.state.bathrooms < 6) {
          this.state.bathrooms++;
          this.updateQuoteUI();
        }
      });
    }

    // Sqft slider
    const sqftSlider = document.getElementById("quoteSqftSlider");
    if (sqftSlider) {
      sqftSlider.addEventListener("input", (e) => {
        this.state.sqft = parseInt(e.target.value, 10);
        this.updateQuoteUI();
      });
    }

    // Frequency radios
    const freqRadios = document.querySelectorAll("input[name='quoteFrequency']");
    freqRadios.forEach(r => {
      r.addEventListener("change", (e) => {
        this.state.frequency = e.target.value;
        this.updateQuoteUI();
      });
    });

    // Addon checkboxes
    const addonChecks = document.querySelectorAll(".quote-addon-check");
    addonChecks.forEach(c => {
      c.addEventListener("change", () => {
        const selected = [];
        addonChecks.forEach(chk => {
          if (chk.checked) selected.push(chk.value);
        });
        this.state.addons = selected;
        this.updateQuoteUI();
      });
    });

    // Transfer Quote to Booking Modal
    const proceedToBookBtn = document.getElementById("proceedToBookBtn");
    if (proceedToBookBtn) {
      proceedToBookBtn.addEventListener("click", () => {
        this.openBookingModal();
      });
    }
  },

  calculateQuote() {
    const base = this.pricing.baseRates[this.state.serviceType] || 129.0;
    const roomCharge = Math.max(0, this.state.rooms - 1) * 20.0;
    const bathCharge = Math.max(0, this.state.bathrooms - 1) * 25.0;

    let sqftCharge = 0.0;
    if (this.state.sqft > 1000) {
      sqftCharge = ((this.state.sqft - 1000) / 500) * 18.0;
    }

    let addonsTotal = 0.0;
    this.state.addons.forEach(a => {
      addonsTotal += this.pricing.addonRates[a] || 0.0;
    });

    const subtotal = base + roomCharge + bathCharge + sqftCharge + addonsTotal;

    let discountPct = 0.0;
    if (this.state.frequency.includes("Bi-Weekly")) {
      discountPct = 0.15;
    } else if (this.state.frequency.includes("Monthly")) {
      discountPct = 0.10;
    }

    const discountAmount = subtotal * discountPct;
    const total = subtotal - discountAmount;

    return {
      subtotal: round(subtotal),
      discountAmount: round(discountAmount),
      total: round(total)
    };

    function round(num) {
      return Math.round(num * 100) / 100;
    }
  },

  updateQuoteUI() {
    const quote = this.calculateQuote();

    const roomsDisplay = document.getElementById("quoteRoomsVal");
    const bathsDisplay = document.getElementById("quoteBathsVal");
    const sqftDisplay = document.getElementById("quoteSqftVal");
    const priceDisplay = document.getElementById("quoteCalculatedPrice");
    const originalPriceDisplay = document.getElementById("quoteOriginalPrice");
    const discountNote = document.getElementById("quoteDiscountNote");

    if (roomsDisplay) roomsDisplay.textContent = this.state.rooms;
    if (bathsDisplay) bathsDisplay.textContent = this.state.bathrooms;
    if (sqftDisplay) sqftDisplay.textContent = `${this.state.sqft.toLocaleString()} sq ft`;
    
    if (priceDisplay) priceDisplay.textContent = `$${quote.total.toFixed(2)}`;

    if (quote.discountAmount > 0) {
      if (originalPriceDisplay) {
        originalPriceDisplay.textContent = `$${quote.subtotal.toFixed(2)}`;
        originalPriceDisplay.classList.remove("hidden");
      }
      if (discountNote) {
        discountNote.textContent = `Includes ${this.state.frequency} savings of -$${quote.discountAmount.toFixed(2)}`;
        discountNote.classList.remove("hidden");
      }
    } else {
      if (originalPriceDisplay) originalPriceDisplay.classList.add("hidden");
      if (discountNote) discountNote.classList.add("hidden");
    }
  },

  bindModalEvents() {
    const modal = document.getElementById("bookingModal");
    const closeBtn = document.getElementById("closeBookingModalBtn");
    const backdrop = document.getElementById("bookingModalBackdrop");
    const form = document.getElementById("bookingForm");

    if (closeBtn) closeBtn.addEventListener("click", () => this.closeBookingModal());
    if (backdrop) backdrop.addEventListener("click", () => this.closeBookingModal());

    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmitBooking(e));
    }

    // Set default date to tomorrow
    const dateInput = document.getElementById("bookServiceDate");
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.min = tomorrow.toISOString().split("T")[0];
      dateInput.value = tomorrow.toISOString().split("T")[0];
    }
  },

  openBookingModal(preselectedService = null) {
    const modal = document.getElementById("bookingModal");
    if (!modal) return;

    if (preselectedService) {
      this.state.serviceType = preselectedService;
    }

    const quote = this.calculateQuote();
    const user = api.getUser();

    // Fill summary fields
    document.getElementById("modalSummaryService").textContent = this.state.serviceType;
    document.getElementById("modalSummaryDetails").textContent = `${this.state.rooms} Bed / ${this.state.bathrooms} Bath • ${this.state.sqft} sq ft • ${this.state.frequency}`;
    document.getElementById("modalSummaryTotal").textContent = `$${quote.total.toFixed(2)}`;

    // Autofill user fields if logged in
    if (user) {
      const nameInput = document.getElementById("bookCustomerName");
      const emailInput = document.getElementById("bookCustomerEmail");
      const phoneInput = document.getElementById("bookCustomerPhone");
      const addressInput = document.getElementById("bookServiceAddress");

      if (nameInput) nameInput.value = user.name || "";
      if (emailInput) emailInput.value = user.email || "";
      if (phoneInput && user.phone) phoneInput.value = user.phone;
      if (addressInput && user.address) addressInput.value = user.address;
    }

    modal.classList.remove("hidden", "opacity-0", "pointer-events-none");
    if (typeof modal.showModal === "function") {
      try { modal.showModal(); } catch (e) {}
    }
  },

  closeBookingModal() {
    const modal = document.getElementById("bookingModal");
    if (!modal) return;
    modal.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => {
      modal.classList.add("hidden");
      if (typeof modal.close === "function") {
        try { modal.close(); } catch (e) {}
      }
    }, 200);
  },

  async handleSubmitBooking(e) {
    e.preventDefault();
    const submitBtn = document.getElementById("bookSubmitBtn");
    const errorBox = document.getElementById("bookErrorMsg");

    if (errorBox) errorBox.classList.add("hidden");

    const serviceDate = document.getElementById("bookServiceDate").value;
    const serviceTime = document.getElementById("bookServiceTime").value;
    const address = document.getElementById("bookServiceAddress").value.trim();
    const customerName = document.getElementById("bookCustomerName").value.trim();
    const customerEmail = document.getElementById("bookCustomerEmail").value.trim();
    const customerPhone = document.getElementById("bookCustomerPhone").value.trim();
    const specialNotes = document.getElementById("bookSpecialNotes").value.trim();

    if (!serviceDate || !address || !customerName || !customerEmail) {
      if (errorBox) {
        errorBox.textContent = "Please fill in all required fields (date, address, name, email).";
        errorBox.classList.remove("hidden");
      }
      return;
    }

    const payload = {
      service_type: this.state.serviceType,
      service_date: serviceDate,
      service_time: serviceTime,
      address,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      rooms: this.state.rooms,
      bathrooms: this.state.bathrooms,
      sqft: this.state.sqft,
      frequency: this.state.frequency,
      addons: this.state.addons,
      special_notes: specialNotes
    };

    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Scheduling Appointment...`;
    lucide.createIcons();

    try {
      const res = await api.createBooking(payload);
      this.closeBookingModal();
      if (window.showToast) {
        window.showToast(`✨ Appointment Confirmed for ${serviceDate}!`);
      }
      // If user is logged in, refresh dashboard
      if (api.getUser()) {
        auth.loadUserBookings();
      }
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || "Failed to schedule appointment.";
        errorBox.classList.remove("hidden");
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
      lucide.createIcons();
    }
  }
};
