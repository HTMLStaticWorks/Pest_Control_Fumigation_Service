/* ==========================================================================
   SAFESHIELD PEST CONTROL & FUMIGATION - MAIN JAVASCRIPT
   Features: Three.js 3D Shield & Particles, GSAP ScrollTrigger, Lenis Smooth Scroll,
   Swiper Slider, GLightbox, VanillaTilt, Live Booking Price Calculator
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Preloader hide (Instant dismissal)
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const hideLoader = () => {
      preloader.classList.add('loaded');
      setTimeout(() => {
        if (preloader.parentNode) preloader.style.display = 'none';
      }, 400);
    };
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
      setTimeout(hideLoader, 800); // Fast fallback
    }
  }

  // Optimized Sticky Navbar Scroll Handler (rAF Throttled + Passive)
  const navbar = document.querySelector('.navbar-safeshield');
  if (navbar) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Mobile Offcanvas Auto Close on Link Click
  const mobileNavClickables = document.querySelectorAll('.mobile-nav-link:not([data-bs-toggle]), .mobile-nav-sublink');
  const offcanvasElem = document.getElementById('mobileNavDrawer');
  if (offcanvasElem && typeof bootstrap !== 'undefined') {
    mobileNavClickables.forEach(link => {
      link.addEventListener('click', () => {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElem);
        if (bsOffcanvas) bsOffcanvas.hide();
      });
    });
  }

  // HIGH PERFORMANCE NATIVE INTERSECTION OBSERVER ANIMATIONS
  initScrollAnimations();

  // DYNAMIC NAVBAR SCROLLSPY
  initScrollSpy();

  // DIAGNOSTIC RISK CALCULATOR
  initRiskCalculator();

  // SWIPER TESTIMONIALS
  if (document.querySelector('.swiper-testimonials')) {
    new Swiper('.swiper-testimonials', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        768: { slidesPerView: 2 },
        1200: { slidesPerView: 3 }
      }
    });
  }

  // GLIGHTBOX FOR GALLERY
  if (typeof GLightbox !== 'undefined') {
    GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
    });
  }

  // TREATMENT TYPE FILTERING
  initTreatmentFilters();

  // GALLERY FILTERING
  initGalleryFilters();

  // INTERACTIVE BOOKING ESTIMATE CALCULATOR
  initBookingCalculator();

  // FAQ SEARCH
  initFAQSearch();

  // THEME & RTL TOGGLES
  initThemeAndRTL();

  // BACK TO TOP SCROLL BUTTON
  initScrollToTop();
});

/* ==========================================================================
   HIGH PERFORMANCE NATIVE INTERSECTION OBSERVER ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  // Hero Text Reveal (GSAP for page load only)
  if (typeof gsap !== 'undefined') {
    gsap.from('.hero-badge', { opacity: 0, y: -20, duration: 0.8, delay: 0.2 });
    gsap.from('.hero-title', { opacity: 0, y: 30, duration: 1, delay: 0.4 });
    gsap.from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.8, delay: 0.6 });
    gsap.from('.hero-cta-wrap', { opacity: 0, y: 20, duration: 0.8, delay: 0.8 });
    gsap.from('.hero-trust-box', { opacity: 0, scale: 0.9, duration: 0.8, delay: 1.0 });
  }

  // Native IntersectionObserver for zero-lag 60 FPS scroll reveals
  const revealElements = document.querySelectorAll('.gsap-fade-up, .gsap-stagger-item');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('in-view'));
  }

  // Native Animated Numbers Counter (IntersectionObserver)
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    statNumbers.forEach(stat => statObserver.observe(stat));
  } else {
    statNumbers.forEach(stat => {
      const target = stat.getAttribute('data-count');
      const suffix = stat.getAttribute('data-suffix') || '';
      stat.innerText = target + suffix;
    });
  }
}

function animateCounter(stat) {
  const target = parseInt(stat.getAttribute('data-count'), 10);
  const suffix = stat.getAttribute('data-suffix') || '';
  const duration = 1500; // ms
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease out
    const currentCount = Math.floor(easeProgress * target);

    stat.innerText = currentCount.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      stat.innerText = target.toLocaleString() + suffix;
    }
  }
  requestAnimationFrame(update);
}

/* ==========================================================================
   TREATMENT & GALLERY FILTERING
   ========================================================================== */
function initTreatmentFilters() {
  const filterBtns = document.querySelectorAll('[data-treatment-filter]');
  const items = document.querySelectorAll('.treatment-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'btn-shield-primary'));
      filterBtns.forEach(b => b.classList.add('btn-shield-outline'));
      btn.classList.add('active', 'btn-shield-primary');
      btn.classList.remove('btn-shield-outline');

      const filter = btn.getAttribute('data-treatment-filter');
      items.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block';
          gsap.fromTo(item, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4 });
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('[data-gallery-filter]');
  const items = document.querySelectorAll('.gallery-col');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'btn-shield-primary'));
      filterBtns.forEach(b => b.classList.add('btn-shield-outline'));
      btn.classList.add('active', 'btn-shield-primary');
      btn.classList.remove('btn-shield-outline');

      const filter = btn.getAttribute('data-gallery-filter');
      items.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block';
          gsap.fromTo(item, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   INTERACTIVE BOOKING ESTIMATE CALCULATOR
   ========================================================================== */
function initBookingCalculator() {
  const propertySelect = document.getElementById('calcPropertyType');
  const pestSelect = document.getElementById('calcPestType');
  const packageSelect = document.getElementById('calcPackage');
  const estimateDisplay = document.getElementById('liveEstimatePrice');
  const bookingForm = document.getElementById('safeshieldBookingForm');

  if (!propertySelect || !estimateDisplay) return;

  const basePrices = {
    'apartment': 149,
    'villa': 249,
    'commercial': 399,
    'warehouse': 599
  };

  const pestMultipliers = {
    'cockroach': 1.0,
    'termite': 1.6,
    'bedbug': 1.4,
    'rodent': 1.2,
    'mosquito': 1.1,
    'general': 1.0
  };

  const packageMultipliers = {
    'basic': 1.0,
    'standard': 1.35,
    'premium': 1.8,
    'commercial': 2.2
  };

  function updateEstimate() {
    const propVal = propertySelect.value || 'apartment';
    const pestVal = pestSelect ? pestSelect.value : 'cockroach';
    const packVal = packageSelect ? packageSelect.value : 'standard';

    const base = basePrices[propVal] || 149;
    const pestMult = pestMultipliers[pestVal] || 1.0;
    const packMult = packageMultipliers[packVal] || 1.35;

    const total = Math.round(base * pestMult * packMult);
    estimateDisplay.innerText = `$${total}`;
  }

  [propertySelect, pestSelect, packageSelect].forEach(select => {
    if (select) select.addEventListener('change', updateEstimate);
  });

  updateEstimate();

  // Form Submit Handler
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Processing Request...`;
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Launch Bootstrap Modal Confirmation
        const confirmModalElem = document.getElementById('bookingSuccessModal');
        if (confirmModalElem && typeof bootstrap !== 'undefined') {
          const bsModal = new bootstrap.Modal(confirmModalElem);
          bsModal.show();
        } else {
          alert('Inspection Request Confirmed! Our certified pest control specialist will call you shortly.');
        }
        bookingForm.reset();
        updateEstimate();
      }, 1200);
    });
  }
}

/* ==========================================================================
   FAQ SEARCH FILTER
   ========================================================================== */
function initFAQSearch() {
  const searchInput = document.getElementById('faqSearchInput');
  const accordionItems = document.querySelectorAll('.accordion-item');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    accordionItems.forEach(item => {
      const text = item.innerText.toLowerCase();
      if (text.includes(term)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

/* ==========================================================================
   THEME (DARK/LIGHT) AND RTL TOGGLE LOGIC
   ========================================================================== */
function initThemeAndRTL() {
  const themeBtns = [document.getElementById('themeToggleBtn'), document.getElementById('themeToggleBtnMobile')].filter(Boolean);
  const rtlBtns = [document.getElementById('rtlToggleBtn'), document.getElementById('rtlToggleBtnMobile')].filter(Boolean);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('safeshield_theme', theme);

    themeBtns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        if (theme === 'dark') {
          icon.setAttribute('data-lucide', 'sun');
        } else {
          icon.setAttribute('data-lucide', 'moon');
        }
      }
    });
    if (window.lucide) lucide.createIcons();
  }

  const savedTheme = localStorage.getItem('safeshield_theme') || 'light';
  applyTheme(savedTheme);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isDark ? 'light' : 'dark');
    });
  });

  function applyRTL(isRTL) {
    if (isRTL) {
      document.documentElement.setAttribute('dir', 'rtl');
      localStorage.setItem('safeshield_rtl', 'true');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      localStorage.setItem('safeshield_rtl', 'false');
    }
    rtlBtns.forEach(btn => {
      const label = btn.querySelector('#rtlLabelMobile') || btn.querySelector('span');
      if (label) {
        label.textContent = isRTL ? 'LTR' : 'RTL';
      }
      btn.title = isRTL ? 'Switch to LTR Mode' : 'Switch to RTL Mode';
      if (isRTL) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    if (window.lucide) lucide.createIcons();
  }

  const savedRTL = localStorage.getItem('safeshield_rtl') === 'true';
  applyRTL(savedRTL);

  rtlBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isCurrentlyRTL = document.documentElement.getAttribute('dir') === 'rtl';
      applyRTL(!isCurrentlyRTL);
    });
  });
}

/* Diagnostic Risk Calculator Interaction */
function initRiskCalculator() {
  const pestBtns = document.querySelectorAll('[data-pest]');
  const areaBtns = document.querySelectorAll('[data-area]');
  const protocolText = document.getElementById('calcProtocolText');
  const timeText = document.getElementById('calcTimeText');

  if (!protocolText || !timeText) return;

  const protocols = {
    cockroach: { text: "Micro-Encapsulated Bio-Barrier + Dual-Action Nest Elimination Gel Baiting System.", time: "24 to 48 Hours" },
    bedbug: { text: "Deep Thermal Steam Diffusion + Sub-Micron Aerosol Egg Sterilization Protocol.", time: "12 to 24 Hours" },
    termite: { text: "Precision Soil Barrier Injection + Acoustic Void Colony Elimination Matrix.", time: "48 to 72 Hours" },
    rodent: { text: "Multi-Catch Ultrasonic Exclusion Barriers + Sanitary Structural Sealing.", time: "24 to 36 Hours" },
    ant: { text: "Pheromone Trail Disruptor + Bio-Targeted Colony Eradication Granules.", time: "12 to 24 Hours" }
  };

  pestBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pestBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const pest = btn.getAttribute('data-pest');
      if (protocols[pest]) {
        protocolText.textContent = protocols[pest].text;
        timeText.textContent = protocols[pest].time;
      }
    });
  });

  areaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      areaBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* Dynamic ScrollSpy for Navbar Links */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav-menu .nav-link-custom, .mobile-nav-list .mobile-nav-link, .mobile-nav-sublink, .dropdown-menu-custom .dropdown-item');
  const homeDropdown = document.getElementById('homeDropdown');

  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    let scrollPos = window.scrollY + 200;
    let activeSectionId = '';

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        activeSectionId = id;
      }
    });

    // Default to home if near the very top of page
    if (!activeSectionId && window.scrollY < 300) {
      activeSectionId = 'home';
    }

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + activeSectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Highlight Home dropdown ONLY when Home 1 (#home) or Home 2 (#home2) is active
    if (homeDropdown) {
      if (activeSectionId === 'home' || activeSectionId === 'home2') {
        homeDropdown.classList.add('active');
      } else {
        homeDropdown.classList.remove('active');
      }
    }
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

/* Scroll To Top Floating Button Handler */
function initScrollToTop() {
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (!scrollBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}



