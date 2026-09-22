(function () {
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

  const savedTheme = localStorage.getItem('tema');
  if (savedTheme && ['dark', 'light', 'retro'].includes(savedTheme)) document.body.dataset.theme = savedTheme;

  function start() {
    initializeTechControls();
    initializeScrollAnimations();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
