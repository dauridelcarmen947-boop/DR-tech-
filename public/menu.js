(function () {
  function initializeMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const menuNav = menuToggle?.closest('nav');
    const menu = menuNav?.querySelector('ul.menu');
    if (!menuToggle || !menuNav || !menu || menuToggle.dataset.ready === 'true') return;

    menuToggle.dataset.ready = 'true';
    menuToggle.setAttribute('role', 'button');
    menuToggle.setAttribute('tabindex', '0');
    menuToggle.setAttribute('aria-controls', menu.id || 'primary-menu');
    if (!menu.id) menu.id = 'primary-menu';
    menu.setAttribute('aria-hidden', 'true');

    const closeMenu = () => {
      menu.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
      menu.setAttribute('aria-hidden', 'true');
    };

    const toggleMenu = () => {
      const isOpen = !menu.classList.contains('active');
      if (isOpen) {
        menu.classList.add('active');
        menuToggle.classList.add('active');
        document.body.classList.add('menu-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Cerrar menú');
        menu.setAttribute('aria-hidden', 'false');
      } else {
        closeMenu();
      }
    };

    menuToggle.addEventListener('click', toggleMenu);
    menuToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('active')) {
        closeMenu();
        menuToggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (menu.classList.contains('active') && !menuNav.contains(event.target)) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 620 && menu.classList.contains('active')) closeMenu();
    }, { passive: true });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  }

  function initializeTechControls() {
    const backgroundButton = document.querySelector('.tech-theme');
    if (!backgroundButton || !window.drtechBackground) return;

    const updateLabel = () => {
      const current = window.drtechBackground.modeNames[window.drtechBackground.getMode()];
      backgroundButton.setAttribute('aria-label', `Cambiar fondo. Actual: ${current}`);
      backgroundButton.title = current;
    };

    backgroundButton.addEventListener('click', (event) => {
      event.preventDefault();
      const modes = window.drtechBackground.modes;
      const currentIndex = modes.indexOf(window.drtechBackground.getMode());
      window.drtechBackground.setMode(modes[(currentIndex + 1) % modes.length]);
      updateLabel();
    });
    document.addEventListener('drtech:background-change', updateLabel);
    updateLabel();
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
    if (!window.drtechBackground) return;
    const modes = window.drtechBackground.modes;
    const currentIndex = modes.indexOf(window.drtechBackground.getMode());
    window.drtechBackground.setMode(modes[(currentIndex + 1) % modes.length]);
  };

  const savedTheme = localStorage.getItem('tema');
  if (savedTheme && ['dark', 'light', 'retro'].includes(savedTheme)) document.body.dataset.theme = savedTheme;

  function start() {
    initializeMenu();
    initializeTechControls();
    initializeScrollAnimations();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
