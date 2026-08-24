(function () {
  function initializeMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const menuNav = document.querySelector('nav');
    const menu = menuNav?.querySelector('.menu');
    if (!menuToggle || !menuNav || !menu || menuToggle.dataset.ready === 'true') return;

    menuToggle.dataset.ready = 'true';
    menuToggle.setAttribute('role', 'button');
    menuToggle.setAttribute('tabindex', '0');

    const toggleMenu = () => {
      const isOpen = menu.classList.toggle('active');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    };

    menuToggle.addEventListener('click', toggleMenu);
    menuToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleMenu();
      }
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menú');
      });
    });
  }

  function initializeFloatingActions() {
    document.querySelectorAll('.redes-flotantes').forEach((panel) => {
      const trigger = panel.querySelector('.social-trigger');
      if (!trigger || trigger.dataset.ready === 'true') return;

      trigger.dataset.ready = 'true';
      trigger.addEventListener('click', () => {
        const isOpen = panel.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
        trigger.setAttribute('aria-label', isOpen ? 'Cerrar redes sociales' : 'Abrir redes sociales');
      });
    });
  }

  function initializePointerEffects() {
    const cursor = document.querySelector('.cursor-rayo');
    if (!cursor || cursor.dataset.ready === 'true') return;

    cursor.dataset.ready = 'true';
    const colors = {
      dark: ['#00d9ff', '#00d9ff'],
      light: ['#0f6fff', '#6ea7ff'],
      retro: ['#ffbf3f', '#ffd985']
    };
    let frame = 0;

    const updatePointerTheme = () => {
      const theme = document.body.dataset.theme || 'dark';
      const [color, glow] = colors[theme] || colors.dark;
      cursor.style.background = color;
      cursor.style.boxShadow = `0 0 15px ${glow}, 0 0 30px ${glow}`;
    };

    window.updatePointerTheme = updatePointerTheme;
    document.addEventListener('mousemove', (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
        frame = 0;
      });
    }, { passive: true });
    updatePointerTheme();
  }

  function initializeScrollAnimations() {
    const elements = document.querySelectorAll('main > *, .seccion-base, .tarjeta-servicio, .plan-card, footer');
    elements.forEach((element) => element.classList.add('reveal-on-scroll'));
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
  }

  window.toggleModo = function () {
    const themes = ['dark', 'light', 'retro'];
    const current = document.body.dataset.theme || 'dark';
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    document.body.dataset.theme = next;
    localStorage.setItem('tema', next);
    window.updatePointerTheme?.();
  };

  const savedTheme = localStorage.getItem('tema');
  if (savedTheme && ['dark', 'light', 'retro'].includes(savedTheme)) {
    document.body.dataset.theme = savedTheme;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeMenu();
      initializeFloatingActions();
      initializePointerEffects();
      initializeScrollAnimations();
    }, { once: true });
  } else {
    initializeMenu();
    initializeFloatingActions();
    initializePointerEffects();
    initializeScrollAnimations();
  }
})();
