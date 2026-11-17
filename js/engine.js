// Motor mínimo: canvas com coordenadas lógicas 360x640, entrada por toque e laço de animação.
export const W = 360;
export const H = 640;

export function criarMotor(canvas) {
  const ctx = canvas.getContext('2d');
  const estado = { escala: 1, ox: 0, oy: 0, cena: null, ultimo: 0, rodando: false, pausado: false };

  function ajustar() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    estado.escala = Math.min(canvas.width / W, canvas.height / H);
    estado.ox = (canvas.width - W * estado.escala) / 2;
    estado.oy = (canvas.height - H * estado.escala) / 2;
  }
  window.addEventListener('resize', ajustar);
  ajustar();

  function ponto(ev) {
    const r = canvas.getBoundingClientRect();
    const dpr = canvas.width / r.width;
    return {
      x: ((ev.clientX - r.left) * dpr - estado.ox) / estado.escala,
      y: ((ev.clientY - r.top) * dpr - estado.oy) / estado.escala,
      id: ev.pointerId,
    };
  }

  const despachar = (nome) => (ev) => {
    ev.preventDefault();
    if (nome === 'down') { try { canvas.setPointerCapture(ev.pointerId); } catch (_) { /* ok */ } }
    const c = estado.cena;
    if (!c || estado.pausado || !c[nome]) return;
    c[nome](ponto(ev));
  };
  canvas.addEventListener('pointerdown', despachar('down'));
  canvas.addEventListener('pointermove', despachar('move'));
  canvas.addEventListener('pointerup', despachar('up'));
  canvas.addEventListener('pointercancel', despachar('up'));
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  function quadro(t) {
    if (!estado.rodando) return;
    const dt = Math.min(0.05, (t - (estado.ultimo || t)) / 1000);
    estado.ultimo = t;
    const c = estado.cena;
    if (c) {
      if (!estado.pausado && c.update) c.update(dt);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#fdf3e3';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(estado.escala, 0, 0, estado.escala, estado.ox, estado.oy);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.clip();
      if (c.draw) c.draw(ctx);
      ctx.restore();
    }
    requestAnimationFrame(quadro);
  }

  return {
    ctx,
    definirCena(c) { estado.cena = c; },
    pausar(v) { estado.pausado = v; estado.ultimo = 0; },
    get pausado() { return estado.pausado; },
    iniciar() {
      if (estado.rodando) return;
      estado.rodando = true;
      requestAnimationFrame(quadro);
    },
  };
}

// Utilidades
export const rnd = (a, b) => a + Math.random() * (b - a);
export const rndInt = (a, b) => Math.floor(rnd(a, b + 1));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const dentro = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const reduzMovimento = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
