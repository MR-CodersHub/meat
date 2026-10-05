// ===================================================
// FarmFresh Meats – Main JavaScript
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initProfileDropdown();
  initRTL();
  initHeroSlider();
  initHamburger();
  initCategoryFilter();
  initFAQ();
  initScrollTop();
  initAOS();
  initFormValidation();
  initCounters();
  initToast();
});

// ===== THEME =====
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const html = document.documentElement;

  const saved = localStorage.getItem('ff-theme') || 'light';
  html.setAttribute('data-theme', saved);
  updateThemeIcon(saved, icon);

  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const curr = html.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ff-theme', next);
    updateThemeIcon(next, icon);
  });
}

function updateThemeIcon(theme, icon) {
  if (!icon) return;
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ===== PROFILE DROPDOWN (click) =====
function initProfileDropdown() {
  const menu = document.querySelector('.profile-menu');
  const toggle = document.getElementById('profileToggle');
  if (!menu || !toggle) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ===== RTL TOGGLE (persisted) =====
function initRTL() {
  const btn = document.getElementById('rtlToggle');

  const apply = (rtl) => {
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    try { localStorage.setItem('ff-rtl', rtl ? '1' : '0'); } catch (err) {}
    if (btn) {
      btn.classList.toggle('active', rtl);
      btn.setAttribute('aria-pressed', rtl ? 'true' : 'false');
    }
  };

  let saved = false;
  try { saved = localStorage.getItem('ff-rtl') === '1'; } catch (err) {}
  apply(saved);

  btn?.addEventListener('click', () => {
    apply(document.documentElement.getAttribute('dir') !== 'rtl');
  });
}

// ===== HAMBURGER =====
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('navMenu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        btn.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Sidebar toggle for dashboards (independent of the nav menu above —
  // dashboard pages have no #hamburger/#navMenu, so this must not sit
  // behind that early return or the button silently does nothing)
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('dashSidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// ===== HERO SLIDER =====
function initHeroSlider() {
  const wrapper = document.getElementById('slidesWrapper');
  if (!wrapper) return;

  const slides = wrapper.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  let current = 0;
  let autoTimer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }
  function stopAuto() { clearInterval(autoTimer); }

  document.getElementById('sliderNext')?.addEventListener('click', () => { goTo(current + 1); stopAuto(); startAuto(); });
  document.getElementById('sliderPrev')?.addEventListener('click', () => { goTo(current - 1); stopAuto(); startAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index));
      stopAuto();
      startAuto();
    });
  });

  // Touch swipe
  let touchStart = 0;
  wrapper.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend', e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  startAuto();
}

// ===== CATEGORY FILTER =====
function initCategoryFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('[data-category]');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
        if (match) {
          card.style.animation = 'fadeUp 0.4s ease forwards';
        }
      });
    });
  });
}

// ===== FAQ =====
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ===== SCROLL TO TOP =====
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== AOS (Animate on Scroll) =====
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, parseInt(delay));
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ===== FORM VALIDATION =====
function initFormValidation() {
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        } else {
          field.classList.remove('error');
          // Email validation
          if (field.type === 'email' && !isValidEmail(field.value)) {
            field.classList.add('error');
            valid = false;
          }
        }
      });

      if (valid) {
        showToast('success', 'Success!', 'Your message has been sent.');
        form.reset();
      }
    });

    // Real-time validation
    form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('blur', () => {
        if (!field.value.trim()) {
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });
      field.addEventListener('input', () => {
        if (field.value.trim()) field.classList.remove('error');
      });
    });
  });

  // Newsletter forms
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]');
      if (email && isValidEmail(email.value)) {
        showToast('success', 'Subscribed!', 'Welcome to FarmFresh Meats newsletter.');
        email.value = '';
      } else if (email) {
        email.classList.add('error');
        showToast('error', 'Invalid Email', 'Please enter a valid email address.');
      }
    });
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== COUNTER ANIMATION =====
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString() + suffix;
  }, 16);
}

// ===== TOAST =====
let toastTimer;
function initToast() {
  if (!document.getElementById('toast')) {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'notification-toast';
    toast.innerHTML = `
      <i class="toast-icon fas fa-check-circle success"></i>
      <div class="toast-content">
        <strong id="toastTitle"></strong>
        <span id="toastMsg"></span>
      </div>
      <button class="toast-close" onclick="hideToast()"><i class="fas fa-times"></i></button>
    `;
    document.body.appendChild(toast);
  }
}

function showToast(type, title, msg) {
  const toast = document.getElementById('toast');
  const icon = toast.querySelector('.toast-icon');
  icon.className = `toast-icon fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-exclamation-circle'} ${type}`;
  toast.className = `notification-toast ${type}`;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hideToast(), 4000);
}

function hideToast() {
  const toast = document.getElementById('toast');
  if (toast) toast.classList.remove('show');
}

// ===== QUANTITY SELECTOR =====
function initQtySelectors() {
  document.querySelectorAll('.qty-selector').forEach(sel => {
    const minus = sel.querySelector('.qty-minus');
    const plus = sel.querySelector('.qty-plus');
    const val = sel.querySelector('.qty-value');

    minus?.addEventListener('click', () => {
      const v = parseInt(val.value || val.textContent) || 0;
      if (v > 0) {
        val.tagName === 'INPUT' ? (val.value = v - 1) : (val.textContent = v - 1);
      }
    });
    plus?.addEventListener('click', () => {
      const v = parseInt(val.value || val.textContent) || 0;
      val.tagName === 'INPUT' ? (val.value = v + 1) : (val.textContent = v + 1);
    });
  });
}

// ===== TABS =====
function initTabs() {
  document.querySelectorAll('.tab-nav').forEach(nav => {
    const tabs = nav.querySelectorAll('.tab-btn');
    const panels = nav.closest('.tab-container')?.querySelectorAll('.tab-panel');

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels?.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        if (panels && panels[idx]) panels[idx].classList.add('active');
      });
    });
  });
}

// ===== DASHBOARD SIDEBAR =====
function initDashboard() {
  const links = document.querySelectorAll('.sidebar-link[data-section]');
  const sections = document.querySelectorAll('.dash-section');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const target = link.dataset.section;

      sections.forEach(s => {
        s.style.display = s.id === target ? '' : 'none';
      });

      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        document.getElementById('dashSidebar')?.classList.remove('open');
      }
    });
  });

  // Toggle switches
  document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const label = toggle.closest('.setting-item')?.querySelector('.setting-status');
      if (label) label.textContent = toggle.checked ? 'Enabled' : 'Disabled';
    });
  });
}

// ===== COUNTDOWN TIMER =====
function initCountdown(endDate) {
  const timerEl = document.getElementById('countdown');
  if (!timerEl) return;

  function update() {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) { timerEl.innerHTML = '<span>Event Started!</span>'; return; }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    timerEl.innerHTML = `
      <div class="cd-unit"><span class="cd-num">${String(d).padStart(2,'0')}</span><span class="cd-label">Days</span></div>
      <div class="cd-sep">:</div>
      <div class="cd-unit"><span class="cd-num">${String(h).padStart(2,'0')}</span><span class="cd-label">Hours</span></div>
      <div class="cd-sep">:</div>
      <div class="cd-unit"><span class="cd-num">${String(m).padStart(2,'0')}</span><span class="cd-label">Mins</span></div>
      <div class="cd-sep">:</div>
      <div class="cd-unit"><span class="cd-num">${String(s).padStart(2,'0')}</span><span class="cd-label">Secs</span></div>
    `;
  }
  update();
  setInterval(update, 1000);
}

// ===== DELIVERY DATE PICKER =====
function initDeliveryScheduler() {
  const picker = document.getElementById('deliveryDate');
  if (!picker) return;

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  picker.min = tomorrow.toISOString().split('T')[0];
}

// ===== ORDER TRACKING PROGRESS =====
function initTrackingProgress() {
  const steps = document.querySelectorAll('.tracking-step');
  steps.forEach((step, i) => {
    setTimeout(() => {
      step.classList.add('animate');
    }, i * 300);
  });
}

// Re-export for individual pages
window.FF = {
  showToast,
  hideToast,
  initQtySelectors,
  initTabs,
  initDashboard,
  initCountdown,
  initCounters,
  initDeliveryScheduler,
  initTrackingProgress,
  initAOS
};
