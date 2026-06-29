/* =============================================
   SCRIPT.JS — Interactions & Animations
   ============================================= */

// ── Smooth Scroll (Lenis) ──────────────────────
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1.2,
  touchMultiplier: 2,
  lerp: 0.08,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ── Custom Cursor ──────────────────────────────
(function () {
  if (window.matchMedia("(max-width: 767px)").matches) return;

  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;
  const cursorText = cursor.querySelector('.custom-cursor-text');

  // Set initial position out of view
  gsap.set(cursor, { x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const quickX = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3" });
  const quickY = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3" });

  window.addEventListener('mousemove', (e) => {
    quickX(e.clientX);
    quickY(e.clientY);
  });

  // Handle pointer states using event delegation
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target) return;

    // Find closest interactive element or one with data-cursor
    const cursorType = target.closest('[data-cursor]')?.getAttribute('data-cursor');

    if (cursorType === 'view') {
      cursor.className = 'custom-cursor state-view';
      cursorText.textContent = 'VIEW';
    } else if (cursorType === 'read') {
      cursor.className = 'custom-cursor state-view';
      cursorText.textContent = 'READ';
    } else if (target.closest('a') || target.closest('button') || cursorType === 'true' || cursorType === '') {
      cursor.className = 'custom-cursor state-hover';
      cursorText.textContent = '';
    } else {
      cursor.className = 'custom-cursor';
      cursorText.textContent = '';
    }
  });

  // Hide/Show cursor when leaving/entering the viewport
  document.addEventListener('mouseleave', () => {
    gsap.to(cursor, { opacity: 0, duration: 0.2 });
  });

  document.addEventListener('mouseenter', () => {
    gsap.to(cursor, { opacity: 1, duration: 0.2 });
  });
})();

// ── Theme Toggle ───────────────────────────────
const toggleBtn = document.getElementById('theme-toggle');
const DARK_ICON = '☀️';
const LIGHT_ICON = '🌙';

function applyTheme(isLight) {
  document.body.classList.toggle('light', isLight);
  toggleBtn.textContent = isLight ? LIGHT_ICON : DARK_ICON;
  toggleBtn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

applyTheme(localStorage.getItem('theme') === 'light');
toggleBtn.addEventListener('click', () => applyTheme(!document.body.classList.contains('light')));

// ── Mobile Hamburger Menu ──────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', !isOpen);
    // Disable scroll when menu is open
    if (!isOpen) {
      lenis.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis.start();
      document.body.style.overflow = '';
    }
  }

  hamburger.addEventListener('click', toggleMobileMenu);

  // Close menu when a link is clicked
  mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        // Close menu first
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        lenis.start();
        document.body.style.overflow = '';
        // Then scroll
        setTimeout(() => {
          lenis.scrollTo(targetId, {
            offset: 0,
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        }, 100);
      }
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMobileMenu();
    }
  });
}


// ── Hero Name Stagger Reveal ──────────────────
(function () {
  const nameMain = document.querySelector('.name-main');
  const nameOverlay = document.querySelector('.name-overlay');
  if (!nameMain || !nameOverlay) return;

  // Helper to split text into characters
  function splitText(element) {
    const text = element.textContent.trim();
    element.textContent = '';
    
    element.style.overflow = 'hidden';
    element.style.display = 'block';
    element.style.whiteSpace = 'nowrap';

    Array.from(text).forEach(char => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.display = 'inline-block';
      span.style.transform = 'translateY(110%)';
      span.style.opacity = '0';
      span.style.willChange = 'transform, opacity';
      
      if (char === ' ') {
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = char;
      }
      element.appendChild(span);
    });
  }

  // Split main name for stagger reveal
  splitText(nameMain);

  // GSAP Stagger Reveal
  if (typeof gsap !== 'undefined') {
    // Set initial state of hero photo
    gsap.set('#hero-photo', { opacity: 0, scale: 0.85, rotation: 6, y: 30 });

    const tl = gsap.timeline();

    tl.to('.hero-name .char', {
      y: '0%',
      opacity: 1,
      duration: 0.65,
      stagger: 0.03,
      ease: 'power4.out',
      delay: 0.2
    });

    tl.fromTo(nameOverlay, {
      opacity: 0,
      scale: 0.7,
      rotation: -15,
      x: 20
    }, {
      opacity: 1,
      scale: 1,
      rotation: -6,
      x: 0,
      duration: 0.7,
      ease: 'back.out(1.5)'
    }, "-=0.45");

    tl.to('#hero-photo', {
      opacity: 1,
      scale: 1,
      rotation: 0,
      y: 0,
      duration: 0.8,
      ease: 'back.out(1.2)'
    }, "-=0.85");
  }
})();


// ── Active nav link on scroll ──────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

// ── Scroll reveal ──────────────────────────────
const reveals = document.querySelectorAll(
  '.service-card, .career-item, .portfolio-card, .about-card, .about-main-wrap'
);

reveals.forEach((el, i) => {
  el.classList.add('reveal');
  if (i % 3 === 1) el.classList.add('reveal-delay-1');
  if (i % 3 === 2) el.classList.add('reveal-delay-2');
});

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Remove will-change after transition to free GPU memory
        entry.target.addEventListener('transitionend', () => {
          entry.target.style.willChange = 'auto';
        }, { once: true });
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
);

reveals.forEach(el => revealObserver.observe(el));

// ── Smooth anchor scrolling ────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const targetId = anchor.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      lenis.scrollTo(targetId, {
        offset: 0,
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    }
  });
});

// ── Ticker duplicate for seamless loop ─────────
document.querySelectorAll('.ticker-wrap').forEach(wrap => {
  const track = wrap.querySelector('.ticker-track');
  if (!track) return;
  wrap.appendChild(track.cloneNode(true));
});

// ── Project Lightbox ────────────────────────────
(function () {
  const overlay = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const counterEl = document.getElementById('lightbox-counter');
  const dotsEl = document.getElementById('lightbox-dots');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lb-prev');
  const nextBtn = document.getElementById('lb-next');

  let images = [];
  let current = 0;

  function show(index) {
    current = (index + images.length) % images.length;
    const src = images[current];
    const isVideo = src.toLowerCase().endsWith('.mp4');

    // Reset contents
    const imgWrap = img.parentElement;
    const existingVideo = imgWrap.querySelector('video');
    if (existingVideo) existingVideo.remove();

    img.classList.remove('lb-visible');
    img.style.display = isVideo ? 'none' : 'block';

    if (isVideo) {
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.className = 'lightbox-img lb-visible';
      imgWrap.appendChild(video);
    } else {
      img.src = ''; // Clear prev
      img.src = src;
      img.onload = () => img.classList.add('lb-visible');
    }

    counterEl.textContent = `${current + 1} / ${images.length}`;
    // dots
    dotsEl.querySelectorAll('.lb-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));
    prevBtn.style.display = images.length > 1 ? '' : 'none';
    nextBtn.style.display = images.length > 1 ? '' : 'none';
  }

  function open(trigger) {
    const isGallery = trigger.classList.contains('gallery-trigger');

    if (isGallery) {
      // Collect all gallery images
      const galleryItems = Array.from(document.querySelectorAll('.gallery-trigger'));
      images = galleryItems.map(item => item.dataset.src || item.dataset.images.split('|')[0]);
      current = galleryItems.indexOf(trigger);
      titleEl.textContent = 'Gallery';
    } else {
      images = trigger.dataset.images.split('|').filter(Boolean);
      current = 0;
      titleEl.textContent = trigger.dataset.title || '';
    }

    // build dots
    dotsEl.innerHTML = images.map((_, i) =>
      `<span class="lb-dot${i === current ? ' active' : ''}"></span>`).join('');
    dotsEl.querySelectorAll('.lb-dot').forEach((d, i) =>
      d.addEventListener('click', () => show(i)));

    show(current);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    img.src = '';
    const existingVideo = img.parentElement.querySelector('video');
    if (existingVideo) existingVideo.remove();
  }

  // triggers
  document.querySelectorAll('.project-trigger, .gallery-trigger').forEach(trigger => {
    trigger.addEventListener('click', e => { e.preventDefault(); open(trigger); });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();


// ── Contact Section Animations ──────
(function () {
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('#contact .contact-col', {
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });

    gsap.from('#contact .contact-huge-title', {
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 75%',
        toggleActions: 'play none none none'
      },
      scale: 0.9,
      y: 50,
      opacity: 0,
      duration: 1.0,
      ease: 'back.out(1.5)'
    });
  }
})();

// ── CV Widget Interaction ──────────────────────
(function () {
  const container = document.querySelector('.cv-widget-container');
  const toggleBtn = document.getElementById('cv-toggle');
  const panel = document.getElementById('cv-panel');
  if (!container || !toggleBtn || !panel) return;

  let isOpen = false;
  let tl = null;

  function openCV() {
    isOpen = true;
    container.classList.add('open');
    panel.classList.add('open');

    // Kill any active timeline
    if (tl) tl.kill();

    tl = gsap.timeline();

    const title = panel.querySelector('.cv-panel-title');
    const desc = panel.querySelector('.cv-panel-desc');
    const links = panel.querySelectorAll('.cv-panel-link');

    // Make sure panel is visible before animating
    tl.set(panel, { visibility: 'visible', display: 'flex' });
    
    tl.fromTo(panel, {
      opacity: 0,
      scale: 0.95,
      y: -10
    }, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.45,
      ease: 'power3.out'
    });

    // Stagger reveal of content elements inside panel
    tl.fromTo([title, desc, ...links], {
      opacity: 0,
      y: 15
    }, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: 'power3.out'
    }, '-=0.3');
  }

  function closeCV() {
    isOpen = false;
    container.classList.remove('open');
    panel.classList.remove('open');

    if (tl) tl.kill();

    tl = gsap.timeline();
    tl.to(panel, {
      opacity: 0,
      scale: 0.95,
      y: -10,
      duration: 0.3,
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.set(panel, { visibility: 'hidden' });
      }
    });
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isOpen) {
      openCV();
    } else {
      closeCV();
    }
  });

  // Close when clicking outside the widget
  document.addEventListener('click', (e) => {
    if (isOpen && !container.contains(e.target)) {
      closeCV();
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (isOpen && e.key === 'Escape') {
      closeCV();
    }
  });
})();

// ── Certifications Section (Redesign) ──────────────────────────
(function () {
  // 1. DATA MODELING
  const certificatesData = [
    // ── Jun 2025 ──────────────────────────────────
    {
      id: 1,
      title: "Bloomberg Finance Fundamentals (BFF)",
      issuer: "Bloomberg for Education",
      date: "June 2025",
      category: "Bloomberg",
      image: "Assets/Certificates - Copy/Bloomberg Finance Fundamentals (BFF).webp",
      tags: ["Bloomberg", "BFF", "Finance", "Finance Fundamentals"],
      aspectRatio: 1.414
    },
    {
      id: 2,
      title: "Bloomberg Query Language (BQL)",
      issuer: "Bloomberg for Education",
      date: "June 2025",
      category: "Bloomberg",
      image: "Assets/Certificates - Copy/Bloomberg Query Language (BQL).webp",
      tags: ["Bloomberg", "BQL", "Data Query", "Finance"],
      aspectRatio: 1.414
    },
    {
      id: 3,
      title: "Bloomberg Market Concepts (BMC)",
      issuer: "Bloomberg for Education",
      date: "June 2025",
      category: "Bloomberg",
      image: "Assets/Certificates - Copy/Bloomberg Market Concepts (BMC).webp",
      tags: ["Bloomberg", "BMC", "Finance", "Terminal"],
      aspectRatio: 1.414
    },
    {
      id: 7,
      title: "Bloomberg Environmental, Social & Governance (ESG)",
      issuer: "Bloomberg for Education",
      date: "June 2025",
      category: "Bloomberg",
      image: "Assets/Certificates - Copy/Bloomberg Environmental, Social & Governance (ESG).webp",
      tags: ["Bloomberg", "ESG", "Sustainability", "Investing"],
      aspectRatio: 1.414
    },
    // ── Oct 2024 ──────────────────────────────────
    {
      id: 4,
      title: "NISM Series V-A: Mutual Fund Distributors",
      issuer: "National Institute of Securities Markets",
      date: "October 2024",
      category: "Finance",
      image: "Assets/Certificates - Copy/NISM Series V-A Mutual Fund Distributors.webp",
      tags: ["Finance", "Mutual Funds", "Wealth Management", "NISM"],
      aspectRatio: 1.414
    },
    // ── Aug 2024 ──────────────────────────────────
    {
      id: 5,
      title: "Crash Course on Python",
      issuer: "Google",
      date: "August 2024",
      category: "Analytics",
      image: "Assets/Certificates - Copy/Crash Course on Python.webp",
      tags: ["Technology", "Python", "Programming", "Coding"],
      aspectRatio: 1.414
    },
    // ── Jun 2024 ──────────────────────────────────
    {
      id: 14,
      title: "Cost of Capital (WACC)",
      issuer: "University of Melbourne",
      date: "June 2024",
      category: "Finance",
      image: "Assets/Certificates - Copy/Cost of Capital (WACC).webp",
      tags: ["Finance", "WACC", "Corporate Finance", "Valuation"],
      aspectRatio: 1.414
    },
    // ── May 2024 ──────────────────────────────────
    {
      id: 11,
      title: "Six Sigma Yellow Belt",
      issuer: "University System of Georgia",
      date: "May 2024",
      category: "Business",
      image: "Assets/Certificates - Copy/Six Sigma Yellow Belt.webp",
      tags: ["Business", "Process Optimization", "Quality Management", "Six Sigma"],
      aspectRatio: 1.414
    },
    // ── Apr 2024 ──────────────────────────────────
    {
      id: 13,
      title: "Trading Basics",
      issuer: "Interactive Brokers",
      date: "April 2024",
      category: "Finance",
      image: "Assets/Certificates - Copy/Trading Basics.webp",
      tags: ["Finance", "Trading", "Financial Markets"],
      aspectRatio: 1.414
    },
    // ── Mar 2024 ──────────────────────────────────
    {
      id: 10,
      title: "Statistics for Business",
      issuer: "IIM Ahmedabad",
      date: "March 2024",
      category: "Analytics",
      image: "Assets/Certificates - Copy/Statistics for Business.webp",
      tags: ["Analytics", "Statistics", "Quantitative Methods", "Data"],
      aspectRatio: 1.414
    },
    // ── Feb 2024 ──────────────────────────────────
    {
      id: 6,
      title: "365 Data Science Certificate",
      issuer: "365 Data Science",
      date: "February 2024",
      category: "Business",
      image: "Assets/Certificates - Copy/365 Data Science Certificate.webp",
      tags: ["AI", "Data Science", "Machine Learning", "Analytics"],
      aspectRatio: 1.414
    },
    // ── Jan 2024 ──────────────────────────────────
    {
      id: 9,
      title: "Language and Tools of Financial Analysis",
      issuer: "University of Melbourne",
      date: "January 2024",
      category: "Finance",
      image: "Assets/Certificates - Copy/Language and Tools of Financial Analysis.webp",
      tags: ["Finance", "Accounting", "Financial Statements"],
      aspectRatio: 1.414
    },
    {
      id: 12,
      title: "Stock Valuation",
      issuer: "University of Melbourne",
      date: "January 2024",
      category: "Finance",
      image: "Assets/Certificates - Copy/Stock Valuation.webp",
      tags: ["Finance", "Valuation", "Stock Market", "Equities"],
      aspectRatio: 1.414
    },
    {
      id: 15,
      title: "Investment Portfolio Management",
      issuer: "Rice University",
      date: "January 2024",
      category: "Finance",
      image: "Assets/Certificates - Copy/Investment Portfolio Management.webp",
      tags: ["Finance", "Portfolio Management", "Risk Management", "Asset Allocation"],
      aspectRatio: 1.414
    },
    // ── Nov 2023 ──────────────────────────────────
    {
      id: 8,
      title: "Behavioural Finance",
      issuer: "Duke University",
      date: "November 2023",
      category: "Finance",
      image: "Assets/Certificates - Copy/Behavioural Finance.webp",
      tags: ["Finance", "Behavioral Economics", "Investing Psychology"],
      aspectRatio: 1.414
    }
  ];

  // DOM Elements
  const gridContainer = document.getElementById('certsMasonryGrid');
  const filterChips = document.querySelectorAll('.filter-chip');

  if (!gridContainer) return;

  let currentFilter = 'all';
  let activeCertificates = [...certificatesData];

  // --- 2. BALANCED MASONRY DISTRIBUTION ---
  function getColumnCount() {
    const width = window.innerWidth;
    if (width < 480) return 1;
    if (width < 768) return 2;
    return 3; // 3 columns for optimal desktop visual balance
  }

  function renderMasonry() {
    gridContainer.innerHTML = '';
    const columnCount = getColumnCount();

    // Create column containers
    const columns = [];
    const columnHeights = [];
    for (let i = 0; i < columnCount; i++) {
      const colDiv = document.createElement('div');
      colDiv.className = 'masonry-column';
      gridContainer.appendChild(colDiv);
      columns.push(colDiv);
      columnHeights.push(0);
    }

    // Distribute active certificates
    activeCertificates.forEach((cert) => {
      // Find the shortest column index
      let shortestIndex = 0;
      let minHeight = columnHeights[0];
      for (let i = 1; i < columnCount; i++) {
        if (columnHeights[i] < minHeight) {
          minHeight = columnHeights[i];
          shortestIndex = i;
        }
      }

      // Create card
      const card = createCertCard(cert);
      columns[shortestIndex].appendChild(card);

      // heightWeight: landscape counts as 0.75 weight, portrait as 1.4
      const cardWeight = cert.aspectRatio < 1 ? 1.4 : 0.75;
      columnHeights[shortestIndex] += cardWeight;
    });

    // Stagger show animation
    const cards = gridContainer.querySelectorAll('.cert-card');
    cards.forEach((card, idx) => {
      setTimeout(() => {
        card.classList.add('show');
      }, idx * 60);
    });

    // Initialize/re-run lazy loading
    initLazyLoading();
  }

  function createCertCard(cert) {
    const card = document.createElement('div');
    card.className = 'cert-card';
    card.setAttribute('data-id', cert.id);
    card.setAttribute('data-cursor', 'view');

    // aspect ratio padding placeholder (primarily landscape 2506 / 1412 -> 56.3%)
    const paddingPercent = cert.aspectRatio ? (100 / cert.aspectRatio) : 56.3;

    card.innerHTML = `
      <div class="cert-img-container shimmer" style="padding-bottom: ${paddingPercent}%;">
        <img data-src="${cert.image}" alt="${cert.title}" class="cert-img" />
        <div class="cert-hover-badge">
          <div class="view-badge-text">VIEW</div>
        </div>
      </div>
      <div class="cert-info">
        <span class="cert-card-tag">${cert.category}</span>
        <h3>${cert.title}</h3>
        <div class="cert-card-issuer">${cert.issuer}</div>
      </div>
    `;

    // Click event to open lightbox
    card.addEventListener('click', () => {
      openLightbox(cert.id);
    });

    return card;
  }

  // --- 3. FILTERING LOGIC ---
  function filterAndSearch() {
    activeCertificates = certificatesData.filter((cert) => {
      if (currentFilter === 'all') return true;
      if (currentFilter === 'business') {
        return cert.category.toLowerCase() === 'business';
      }
      if (currentFilter === 'finance') {
        return cert.category.toLowerCase() === 'finance' || cert.category.toLowerCase() === 'bloomberg';
      }
      return cert.category.toLowerCase() === currentFilter;
    });

    renderMasonry();
  }

  // Filter chips listeners
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-filter');
      filterAndSearch();
    });
  });

  // --- 4. LAZY LOADING INTERSECTION OBSERVER ---
  let lazyObserver = null;
  function initLazyLoading() {
    if (lazyObserver) {
      lazyObserver.disconnect();
    }

    const images = gridContainer.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
      lazyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            if (src) {
              img.src = src;
              img.onload = () => {
                img.classList.add('loaded');
                img.parentElement.classList.remove('shimmer');
              };
            }
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '0px 0px 200px 0px' // preload ahead of view
      });

      images.forEach(img => lazyObserver.observe(img));
    } else {
      // Fallback
      images.forEach((img) => {
        img.src = img.getAttribute('data-src');
        img.classList.add('loaded');
        img.parentElement.classList.remove('shimmer');
      });
    }
  }

  // --- 5. INTERACTIVE LIGHTBOX INTERACTION ---
  const modal = document.getElementById('certModal');
  const modalClose = document.getElementById('certModalClose');
  const modalImg = document.getElementById('certModalImg');
  const modalIssuerLogo = document.getElementById('certIssuerLogo');
  const modalIssuerName = document.getElementById('certIssuerName');
  const modalTitleHeading = document.getElementById('certTitleHeading');
  const modalIssueDate = document.getElementById('certIssueDate');
  const modalCategory = document.getElementById('certCategory');
  const modalTagsWrap = document.getElementById('certTagsWrap');

  const btnPrev = document.getElementById('btnPrevCert');
  const btnNext = document.getElementById('btnNextCert');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const zoomPercent = document.getElementById('zoomPercent');
  const viewport = document.getElementById('lightboxViewport');
  const canvas = document.getElementById('lightboxCanvas');

  let currentCertIndex = -1;
  let zoomScale = 1.0;
  const zoomMin = 0.5;
  const zoomMax = 3.0;
  const zoomStep = 0.2;

  // Panning/Dragging State
  let isDragging = false;
  let startX = 0, startY = 0;
  let translateX = 0, translateY = 0;

  function updateCanvasTransform() {
    canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
    zoomPercent.textContent = `${Math.round(zoomScale * 100)}%`;
  }

  function resetZoomAndPan() {
    zoomScale = 1.0;
    translateX = 0;
    translateY = 0;
    updateCanvasTransform();
  }

  function openLightbox(certId) {
    currentCertIndex = activeCertificates.findIndex(c => c.id === certId);
    if (currentCertIndex === -1) return;

    modal.style.display = 'flex';
    modal.classList.add('open');
    resetZoomAndPan();
    loadCertDetails(activeCertificates[currentCertIndex]);
    updateNavButtons();

    // Prevent body scroll (with Lenis safety check)
    if (window.lenis) window.lenis.stop();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('open');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);

    if (window.lenis) window.lenis.start();
    document.body.style.overflow = '';
  }

  function loadCertDetails(cert) {
    modalImg.src = cert.image;

    // First letter logo for the organization
    modalIssuerLogo.textContent = cert.issuer ? cert.issuer.charAt(0) : 'C';
    modalIssuerName.textContent = cert.issuer;
    modalTitleHeading.textContent = cert.title;
    modalIssueDate.textContent = cert.date;
    modalCategory.textContent = cert.category;

    // Tags
    modalTagsWrap.innerHTML = '';
    cert.tags.forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'cert-tag-badge';
      span.textContent = tag;
      modalTagsWrap.appendChild(span);
    });
  }

  function updateNavButtons() {
    if (currentCertIndex <= 0) {
      btnPrev.classList.add('disabled');
    } else {
      btnPrev.classList.remove('disabled');
    }

    if (currentCertIndex >= activeCertificates.length - 1) {
      btnNext.classList.add('disabled');
    } else {
      btnNext.classList.remove('disabled');
    }
  }

  function navigateCert(direction) {
    const nextIdx = currentCertIndex + direction;
    if (nextIdx >= 0 && nextIdx < activeCertificates.length) {
      currentCertIndex = nextIdx;
      resetZoomAndPan();
      loadCertDetails(activeCertificates[currentCertIndex]);
      updateNavButtons();
    }
  }

  // --- Zoom logic ---
  function adjustZoom(factor) {
    let newScale = zoomScale + factor;
    if (newScale < zoomMin) newScale = zoomMin;
    if (newScale > zoomMax) newScale = zoomMax;
    zoomScale = newScale;
    updateCanvasTransform();
  }

  // --- Drag-to-pan handlers ---
  function dragStart(e) {
    if (zoomScale <= 1.001) return; // only pan if zoomed in
    isDragging = true;
    canvas.classList.add('grabbing');

    // Handle touch vs mouse coordinates
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    startX = clientX - translateX;
    startY = clientY - translateY;
  }

  function dragMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    translateX = clientX - startX;
    translateY = clientY - startY;
    updateCanvasTransform();
  }

  function dragEnd() {
    isDragging = false;
    canvas.classList.remove('grabbing');
  }

  // Attach Lightbox event listeners
  if (modalClose) modalClose.addEventListener('click', closeLightbox);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  if (btnPrev) btnPrev.addEventListener('click', () => navigateCert(-1));
  if (btnNext) btnNext.addEventListener('click', () => navigateCert(1));

  if (btnZoomIn) btnZoomIn.addEventListener('click', () => adjustZoom(zoomStep));
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => adjustZoom(-zoomStep));

  // Double click to zoom toggle
  canvas.addEventListener('dblclick', () => {
    if (zoomScale > 1.01) {
      resetZoomAndPan();
    } else {
      zoomScale = 2.0;
      updateCanvasTransform();
    }
  });

  // Mouse pan triggers
  canvas.addEventListener('mousedown', dragStart);
  window.addEventListener('mousemove', dragMove);
  window.addEventListener('mouseup', dragEnd);

  // Touch pan triggers
  canvas.addEventListener('touchstart', dragStart);
  canvas.addEventListener('touchmove', dragMove);
  canvas.addEventListener('touchend', dragEnd);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (typeof e.target.closest === "function" && e.target.closest('input, textarea')) return; // ignore when typing in search
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateCert(-1);
    if (e.key === 'ArrowRight') navigateCert(1);
  });

  // --- Initial renders & responsive resizing ---
  renderMasonry();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderMasonry();
    }, 150);
  });

  // Handle sticky filter bar styling on scroll
  const stickyBar = document.querySelector('.sticky-filter-bar');
  if (stickyBar) {
    const originalOffset = stickyBar.offsetTop;
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > originalOffset - 90) {
        stickyBar.classList.add('is-sticky');
      } else {
        stickyBar.classList.remove('is-sticky');
      }
    });
  }
})();
