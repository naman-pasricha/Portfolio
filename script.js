/* =============================================
   SCRIPT.JS — Interactions & Animations
   ============================================= */

// ── Smooth Scroll (Lenis) ──────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 2,
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

// ── Custom Cursor Removed ──────────────────

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


// ── Text Scramble Engine Removed ──────────────────


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
  '.service-card, .career-item, .portfolio-card, .gallery-item'
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
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
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

// ── Hero Scroll Transformation ──────────────────
(function () {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const heroPhoto = document.getElementById('hero-photo');
  const target = document.getElementById('services-target');
  if (!heroPhoto || !target) return;
  const targetImg = target.querySelector('.sticky-img');

  let mm = gsap.matchMedia();

  // Desktop only animation
  mm.add("(min-width: 1025px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "bottom bottom",
        endTrigger: "#services",
        end: "top top",
        scrub: 1,
        invalidateOnRefresh: true,
        onLeave: () => {
          gsap.set(heroPhoto, { opacity: 0 });
          gsap.set(targetImg, { opacity: 1 });
        },
        onEnterBack: () => {
          gsap.set(heroPhoto, { opacity: 1 });
        },
        onEnter: () => {
          gsap.set(heroPhoto, { opacity: 1 });
        },
        onLeaveBack: () => {
          gsap.set(heroPhoto, { opacity: 1, clearProps: "transform,boxShadow" });
          gsap.set(targetImg, { opacity: 0 });
        }
      }
    });

    tl.set(targetImg, { opacity: 0 });

    tl.to(heroPhoto, {
      boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
      duration: 0.5
    }, 0);

    tl.to(heroPhoto, {
      x: () => {
        const targetRect = target.getBoundingClientRect();
        const photoRect = heroPhoto.getBoundingClientRect();
        return targetRect.left + (targetRect.width / 2) - (photoRect.width / 2) - photoRect.left;
      },
      y: () => {
        const targetRect = target.getBoundingClientRect();
        const photoRect = heroPhoto.getBoundingClientRect();
        return targetRect.top + (targetRect.height / 2) - (photoRect.height / 2) - photoRect.top + window.scrollY;
      },
      scale: 0.85,
      rotationY: 180,
      rotationZ: 0,
      borderRadius: "12px",
      ease: "power2.inOut"
    });

    tl.to(heroPhoto, { opacity: 0, duration: 0.1 }, "-=0.1");
    tl.to(targetImg, { opacity: 1, duration: 0.1 }, "-=0.1");

    return () => {
      // Cleanup
      gsap.set(heroPhoto, { clearProps: "all" });
      gsap.set(targetImg, { clearProps: "all" });
    };
  });

  // Mobile/Tablet: Ensure images are visible normally
  mm.add("(max-width: 1024px)", () => {
    gsap.set(heroPhoto, { opacity: 1, visibility: "visible" });
    gsap.set(targetImg, { opacity: 1, visibility: "visible" });
  });

})();
