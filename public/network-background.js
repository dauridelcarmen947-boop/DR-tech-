(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const context = canvas.getContext('2d', { alpha: true });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const modes = ['network', 'quantum', 'matrix', 'aurora'];
  const modeNames = { network: 'Red neuronal cyber', quantum: 'Ondas cuanticas neon', matrix: 'Lluvia de codigo', aurora: 'Aurora boreal cyberpunk' };
  let mode = localStorage.getItem('drtech-background') || 'network';
  let width = 0; let height = 0; let nodes = []; let drops = [];
  let animationFrame; let resizeTimer; let lastFrame = 0;
  const pointer = { x: 0, y: 0, active: false, pressed: false };
  if (!modes.includes(mode)) mode = 'network';

  function colors() {
    if (mode === 'matrix') return { primary: '#54f7a2', secondary: '#24a7ff', background: '#030b0d' };
    if (mode === 'aurora') return { primary: '#69e7ff', secondary: '#bf70ff', background: '#08091a' };
    return { primary: '#5bdcff', secondary: '#397fff', background: '#050811' };
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.floor(width * ratio); canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(width < 768 ? 34 : 54, Math.max(18, Math.round((width * height) / 22000)));
    nodes = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, radius: Math.random() * 1.5 + 0.8 }));
    drops = Array.from({ length: Math.min(90, Math.max(35, Math.round(width / 13))) }, () => ({ x: Math.random() * width, y: Math.random() * height, speed: Math.random() * 1.8 + 0.7, length: Math.random() * 16 + 5, char: String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96)) }));
  }

  function fillBase() {
    const palette = colors(); context.fillStyle = palette.background; context.fillRect(0, 0, width, height);
    const veil = context.createRadialGradient(width * 0.68, height * 0.42, 0, width * 0.68, height * 0.42, Math.max(width, height) * 0.8);
    veil.addColorStop(0, 'rgba(25, 81, 148, .16)'); veil.addColorStop(0.55, 'rgba(5, 8, 17, .2)'); veil.addColorStop(1, 'rgba(0, 0, 0, .62)');
    context.fillStyle = veil; context.fillRect(0, 0, width, height);
  }

  function drawNetwork(palette) {
    context.fillStyle = palette.primary; context.strokeStyle = palette.primary;
    nodes.forEach((node) => {
      const dx = pointer.x - node.x; const dy = pointer.y - node.y; const distance = Math.hypot(dx, dy);
      if (pointer.active && distance > 0 && distance < 170) { const force = (1 - distance / 170) * (pointer.pressed ? 0.24 : 0.1); node.vx += (dx / distance) * force; node.vy += (dy / distance) * force; }
      node.x += node.vx; node.y += node.vy; node.vx *= 0.995; node.vy *= 0.995;
      if (node.x < 0 || node.x > width) node.vx *= -1; if (node.y < 0 || node.y > height) node.vy *= -1;
      context.globalAlpha = 0.8; context.beginPath(); context.arc(node.x, node.y, node.radius, 0, Math.PI * 2); context.fill();
    });
    for (let index = 0; index < nodes.length; index += 1) for (let next = index + 1; next < nodes.length; next += 1) {
      const first = nodes[index]; const second = nodes[next]; const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (distance < 125) { context.globalAlpha = (1 - distance / 125) * 0.6; context.beginPath(); context.moveTo(first.x, first.y); context.lineTo(second.x, second.y); context.stroke(); }
    }
  }

  function drawQuantum(palette, time) {
    for (let line = 0; line < 14; line += 1) { context.beginPath(); for (let x = 0; x <= width; x += 18) { const y = height * (0.25 + line * 0.055) + Math.sin(x * 0.012 + time * 0.0014 + line) * 25 + Math.cos(x * 0.004 - time * 0.0008) * 18; if (x === 0) context.moveTo(x, y); else context.lineTo(x, y); } context.globalAlpha = 0.12 + (line % 3) * 0.035; context.strokeStyle = line % 2 ? palette.secondary : palette.primary; context.stroke(); }
  }

  function drawMatrix(palette) {
    context.font = '12px monospace'; context.fillStyle = palette.primary;
    drops.forEach((drop) => { drop.y += drop.speed; if (drop.y > height + drop.length * 12) { drop.y = -20; drop.x = Math.random() * width; } context.globalAlpha = 0.12 + (drop.x % 3) * 0.04; context.fillText(drop.char, drop.x, drop.y); });
  }

  function drawAurora(palette, time) {
    for (let band = 0; band < 4; band += 1) { const gradient = context.createLinearGradient(0, 0, width, height); gradient.addColorStop(0, `rgba(40, 120, 255, ${0.04 + band * 0.01})`); gradient.addColorStop(0.5, `rgba(${band % 2 ? '191, 90, 255' : '67, 220, 255'}, .1)`); gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); context.fillStyle = gradient; context.beginPath(); context.moveTo(0, height * (0.15 + band * 0.12)); for (let x = 0; x <= width; x += 24) context.lineTo(x, height * (0.15 + band * 0.12) + Math.sin(x * 0.008 + time * 0.0006 + band) * 70); context.lineTo(width, height); context.lineTo(0, height); context.fill(); }
  }

  function draw(time) {
    const palette = colors(); context.clearRect(0, 0, width, height); fillBase();
    if (mode === 'network') drawNetwork(palette); if (mode === 'quantum') drawQuantum(palette, time); if (mode === 'matrix') drawMatrix(palette); if (mode === 'aurora') drawAurora(palette, time);
    if (pointer.active) { const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 190); glow.addColorStop(0, 'rgba(91, 220, 255, .13)'); glow.addColorStop(1, 'rgba(91, 220, 255, 0)'); context.globalAlpha = 1; context.fillStyle = glow; context.fillRect(0, 0, width, height); }
    context.globalAlpha = 1;
  }

  function animate(time) { if (time - lastFrame >= 33) { draw(time); lastFrame = time; } animationFrame = requestAnimationFrame(animate); }
  function setMode(nextMode) { mode = modes.includes(nextMode) ? nextMode : 'network'; localStorage.setItem('drtech-background', mode); document.body.dataset.background = mode; document.dispatchEvent(new CustomEvent('drtech:background-change', { detail: { mode, label: modeNames[mode] } })); draw(performance.now()); }

  window.drtechBackground = { modes, modeNames, getMode: () => mode, setMode };
  resize(); document.body.dataset.background = mode;
  document.addEventListener('pointermove', (event) => { pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true; }, { passive: true });
  document.addEventListener('pointerdown', (event) => { pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true; pointer.pressed = true; }, { passive: true });
  document.addEventListener('pointerup', () => { pointer.pressed = false; }, { passive: true }); document.addEventListener('pointercancel', () => { pointer.pressed = false; pointer.active = false; }, { passive: true });
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(animationFrame); animationFrame = undefined; } else if (!reducedMotion.matches && !animationFrame) animate(performance.now()); });
  if (reducedMotion.matches) draw(0); else animate(0);
})();
