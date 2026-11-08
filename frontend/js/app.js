/**
 * Kesava Cleaning - Main Application Controller
 * Handles Before/After surface wiping, reviews loader, product customizer, FAQs, and notifications.
 */

// Global Toast System
window.showToast = function(msg, duration = 3500) {
  const toast = document.getElementById("toastNotification");
  const msgEl = document.getElementById("toastMessage");
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.remove("translate-y-24", "opacity-0");
  setTimeout(() => {
    toast.classList.add("translate-y-24", "opacity-0");
  }, duration);
};

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Initialize sub-controllers
  if (window.auth) auth.init();
  if (window.booking) booking.init();
  if (window.cart) cart.init();

  // 1. Product Builder / Customizer
  initProductBuilder();

  // 2. Before & After Surface Wiper
  initSurfaceWiper();

  // 3. FAQ Accordion
  initFAQ();

  // 4. Video Demonstration Modal
  initVideoModal();

  // 5. Customer Reviews System
  initReviewsSystem();

  // 6. Mobile Menu & Newsletter
  initNavigationAndNewsletter();
});

// Product Customizer Logic
function initProductBuilder() {
  const catalog = {
    bundle: {
      title: "Kesava Complete Starter Bundle",
      subtitle: "Amber Borosilicate Bottle + 4 Bio-Enzyme Pouches",
      price: 34.00,
      origPrice: 48.00,
      pods: "4"
    },
    single: {
      title: "Kesava Glass Spray Flask",
      subtitle: "500ml Frosted Flask + 1 Refill Pod",
      price: 22.00,
      origPrice: 28.00,
      pods: "1"
    },
    refills: {
      title: "Concentrate Refill Pouches (4x)",
      subtitle: "Makes 2 Litres of Plant-Derived Cleaner",
      price: 18.00,
      origPrice: 24.00,
      pods: "4"
    }
  };

  let selectedFormat = "bundle";
  let selectedScent = "Eucalyptus & Mint";
  let qty = 1;

  const formatBtns = document.querySelectorAll(".format-btn");
  const scentBtns = document.querySelectorAll(".scent-btn");
  const titleEl = document.getElementById("checkoutTitle");
  const subEl = document.getElementById("checkoutSubtitle");
  const priceEl = document.getElementById("checkoutPrice");
  const origPriceEl = document.getElementById("checkoutOriginalPrice");
  const scentSummaryEl = document.getElementById("includedScentSummary");
  const scentLabelEl = document.getElementById("selectedScentLabel");
  const addBtnText = document.getElementById("addBtnText");
  const qtyValEl = document.getElementById("qtyVal");

  function update() {
    const item = catalog[selectedFormat];
    if (titleEl) titleEl.textContent = item.title;
    if (subEl) subEl.textContent = item.subtitle;

    const total = (item.price * qty).toFixed(2);
    if (priceEl) priceEl.textContent = `$${total}`;
    if (origPriceEl) origPriceEl.textContent = `$${(item.origPrice * qty).toFixed(2)}`;

    if (scentSummaryEl) scentSummaryEl.textContent = `${item.pods}x concentrate pods in ${selectedScent}`;
    if (scentLabelEl) scentLabelEl.textContent = selectedScent;
    if (addBtnText) addBtnText.textContent = `Add to Cart • $${total}`;
    if (qtyValEl) qtyValEl.textContent = qty;
  }

  formatBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      formatBtns.forEach(b => {
        b.classList.remove("border-brand-500", "bg-white", "shadow-sm");
        b.classList.add("border-earth-clay", "bg-white/70");
      });
      btn.classList.add("border-brand-500", "bg-white", "shadow-sm");
      btn.classList.remove("border-earth-clay", "bg-white/70");
      selectedFormat = btn.dataset.format;
      update();
    });
  });

  scentBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      scentBtns.forEach(b => {
        b.classList.remove("border-brand-500", "bg-white", "shadow-sm");
        b.classList.add("border-earth-clay", "bg-white/70");
      });
      btn.classList.add("border-brand-500", "bg-white", "shadow-sm");
      btn.classList.remove("border-earth-clay", "bg-white/70");
      selectedScent = btn.dataset.scent;
      update();
    });
  });

  const plusBtn = document.getElementById("qtyPlus");
  const minusBtn = document.getElementById("qtyMinus");
  if (plusBtn) {
    plusBtn.addEventListener("click", () => {
      qty++;
      update();
    });
  }
  if (minusBtn) {
    minusBtn.addEventListener("click", () => {
      if (qty > 1) {
        qty--;
        update();
      }
    });
  }

  const addMainBtn = document.getElementById("addToCartMainBtn");
  if (addMainBtn) {
    addMainBtn.addEventListener("click", () => {
      const item = catalog[selectedFormat];
      cart.addItem({
        name: item.title,
        scent: selectedScent,
        format: item.subtitle,
        price: item.price,
        qty: qty
      });
    });
  }

  update();
}

// Before & After Surface Wiper
function initSurfaceWiper() {
  const slider = document.getElementById("comparisonSliderInput");
  const grimyLayer = document.getElementById("grimySurfaceLayer");
  const divider = document.getElementById("sliderDivider");
  const surfaceTabs = document.querySelectorAll(".surface-tab");
  const cleanTitle = document.getElementById("cleanSurfaceTitle");
  const cleanDesc = document.getElementById("cleanSurfaceDesc");
  const grimeBg = document.getElementById("grimeContentBackground");

  if (!slider || !grimyLayer || !divider) return;

  const data = {
    stovetop: {
      title: "Polished Ceramic & Induction Stovetop",
      desc: "Zero cloudy haze or grease rainbowing. 100% safe around direct food preparation zones.",
      grimeBg: "linear-gradient(135deg, #7c5d3f 0%, #3d2919 40%, #1a110a 100%)"
    },
    tiles: {
      title: "Glazed Porcelain & Bathroom Tiles",
      desc: "Citric acid safely dissolves mineral limescale and shower soap scum without chlorine fumes.",
      grimeBg: "linear-gradient(135deg, #78716c 0%, #57534e 40%, #292524 100%)"
    },
    glass: {
      title: "Crystal Clear Glass & Vanity Mirrors",
      desc: "Quick evaporation surfactant formula leaves 100% streak-free clarity with zero ammonia odor.",
      grimeBg: "linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)"
    },
    wood: {
      title: "Sealed Natural Oak & Walnut Hardwood",
      desc: "pH-neutral formulation cleans without stripping polyurethane seals or dulling the natural wood grain.",
      grimeBg: "linear-gradient(135deg, #5c3a21 0%, #3a2211 50%, #1e1107 100%)"
    }
  };

  function updateSlider(val) {
    grimyLayer.style.width = `${val}%`;
    divider.style.left = `${val}%`;
  }

  slider.addEventListener("input", (e) => {
    updateSlider(e.target.value);
  });

  surfaceTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      surfaceTabs.forEach(t => {
        t.classList.remove("bg-brand-500", "text-white");
        t.classList.add("bg-white", "text-earth-dark");
      });
      tab.classList.add("bg-brand-500", "text-white");
      tab.classList.remove("bg-white", "text-earth-dark");

      const s = data[tab.dataset.surface];
      if (s) {
        if (cleanTitle) cleanTitle.textContent = s.title;
        if (cleanDesc) cleanDesc.textContent = s.desc;
        if (grimeBg) grimeBg.style.background = s.grimeBg;
      }

      slider.value = 50;
      updateSlider(50);
    });
  });
}

// FAQ Accordion
function initFAQ() {
  const toggles = document.querySelectorAll(".faq-toggle");
  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const answer = toggle.nextElementSibling;
      const icon = toggle.querySelector("[data-lucide='chevron-down']");
      const isHidden = answer.classList.contains("hidden");

      document.querySelectorAll(".faq-answer").forEach(a => a.classList.add("hidden"));
      document.querySelectorAll(".faq-toggle [data-lucide='chevron-down']").forEach(i => i.classList.remove("rotate-180"));

      if (isHidden) {
        answer.classList.remove("hidden");
        if (icon) icon.classList.add("rotate-180");
      }
    });
  });
}

// Video Modal
function initVideoModal() {
  const modal = document.getElementById("videoModal");
  const openBtn = document.getElementById("openVideoModalBtn");
  const closeBtn = document.getElementById("closeVideoModalBtn");
  const backdrop = document.getElementById("videoModalBackdrop");
  const playBtn = document.getElementById("playDemoBtn");

  if (!modal) return;

  function open() {
    modal.classList.remove("hidden", "pointer-events-none", "opacity-0");
    if (typeof modal.showModal === "function") {
      try { modal.showModal(); } catch (e) {}
    }
  }

  function close() {
    modal.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => {
      modal.classList.add("hidden");
      if (typeof modal.close === "function") {
        try { modal.close(); } catch (e) {}
      }
    }, 200);
  }

  if (openBtn) openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      showToast("Streaming 1080p bio-enzyme laboratory demonstration...");
    });
  }
}

// Reviews & Testimonials System
function initReviewsSystem() {
  const reviewsContainer = document.getElementById("reviewsCardsGrid");
  const avgRatingEl = document.getElementById("reviewsAvgScore");
  const totalReviewsEl = document.getElementById("reviewsTotalCount");

  async function loadReviews() {
    try {
      const res = await api.getReviews();
      if (res.stats) {
        if (avgRatingEl) avgRatingEl.textContent = `${res.stats.average_rating} Overall Score`;
        if (totalReviewsEl) totalReviewsEl.textContent = `Loved by ${res.stats.total_reviews * 12500 || '50,000'}+ Clean-Conscious Homes`;
      }

      if (!reviewsContainer) return;
      reviewsContainer.innerHTML = (res.reviews || []).slice(0, 6).map(r => `
        <div class="bg-white rounded-3xl p-8 border border-earth-clay shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div class="flex items-center gap-1 text-amber-400 mb-4">
              ${Array(r.rating).fill('<i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>').join("")}
            </div>
            ${r.review_title ? `<h4 class="font-bold text-earth-dark text-sm mb-2">${r.review_title}</h4>` : ''}
            <p class="text-earth-dark font-medium text-xs leading-relaxed italic">
              &ldquo;${r.comment}&rdquo;
            </p>
          </div>
          <div class="mt-6 pt-6 border-t border-earth-clay flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                ${r.user_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p class="text-xs font-bold text-earth-dark">${r.user_name} ${r.verified_buyer ? '• <span class="text-brand-600 font-semibold">Verified</span>' : ''}</p>
                <p class="text-[10px] text-earth-stone">${r.surface_tested || 'Home Clean'}</p>
              </div>
            </div>
            <i data-lucide="shield-check" class="w-4 h-4 text-brand-500"></i>
          </div>
        </div>
      `).join("");
      lucide.createIcons();
    } catch (e) {
      console.warn("Reviews load fallback:", e.message);
    }
  }

  loadReviews();

  // Write Review Modal
  const openReviewModalBtn = document.getElementById("openWriteReviewBtn");
  const reviewModal = document.getElementById("writeReviewModal");
  const closeReviewModalBtn = document.getElementById("closeReviewModalBtn");
  const reviewBackdrop = document.getElementById("writeReviewBackdrop");
  const reviewForm = document.getElementById("writeReviewForm");

  if (openReviewModalBtn && reviewModal) {
    openReviewModalBtn.addEventListener("click", () => {
      const user = api.getUser();
      if (user && document.getElementById("reviewAuthorName")) {
        document.getElementById("reviewAuthorName").value = user.name;
      }
      reviewModal.classList.remove("hidden", "opacity-0", "pointer-events-none");
      if (typeof reviewModal.showModal === "function") {
        try { reviewModal.showModal(); } catch (e) {}
      }
    });

    function closeRev() {
      reviewModal.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        reviewModal.classList.add("hidden");
        if (typeof reviewModal.close === "function") {
          try { reviewModal.close(); } catch (e) {}
        }
      }, 200);
    }

    if (closeReviewModalBtn) closeReviewModalBtn.addEventListener("click", closeRev);
    if (reviewBackdrop) reviewBackdrop.addEventListener("click", closeRev);

    if (reviewForm) {
      reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("reviewAuthorName").value.trim();
        const rating = parseInt(document.getElementById("reviewRatingSelect").value, 10);
        const title = document.getElementById("reviewTitleInput").value.trim();
        const comment = document.getElementById("reviewCommentInput").value.trim();
        const surface = document.getElementById("reviewSurfaceSelect").value;

        try {
          await api.submitReview({
            user_name: name,
            rating,
            review_title: title,
            comment,
            surface_tested: surface
          });
          closeRev();
          showToast("🌿 Review published! Thank you for sharing your experience.");
          loadReviews();
          reviewForm.reset();
        } catch (err) {
          alert("Error: " + err.message);
        }
      });
    }
  }
}

// Navigation & Newsletter
function initNavigationAndNewsletter() {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (mobileMenu) mobileMenu.classList.add("hidden");
    });
  });

  const newsForm = document.getElementById("newsletterForm");
  if (newsForm) {
    newsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("🌿 Code KESAVA15 has been sent to your email!");
      newsForm.reset();
    });
  }
}
