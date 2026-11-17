// Sons sintetizados com Web Audio (sem arquivos externos). Só começa após o primeiro toque.
let ac = null;
let mudo = false;
let musicaTimer = null;

try { mudo = localStorage.getItem('a-jornada-mudo') === '1'; } catch (_) { /* sem storage */ }

export function destravar() {
  if (!ac) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    ac = new C();
  }
  if (ac.state === 'suspended') ac.resume();
}

export const estaMudo = () => mudo;
export function alternarMudo() {
  mudo = !mudo;
  try { localStorage.setItem('a-jornada-mudo', mudo ? '1' : '0'); } catch (_) { /* ok */ }
  if (mudo) pararMusica(); else tocarMusica();
  return mudo;
}

function tom(freq, dur, o = {}) {
  if (!ac || mudo) return;
  const t = ac.currentTime + (o.atraso || 0);
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = o.tipo || 'sine';
  osc.frequency.setValueAtTime(freq, t);
  if (o.ate) osc.frequency.exponentialRampToValueAtTime(o.ate, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.vol || 0.18, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function ruido(dur, o = {}) {
  if (!ac || mudo) return;
  const n = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = o.filtro || 'lowpass';
  f.frequency.value = o.freq || 800;
  const g = ac.createGain();
  g.gain.value = o.vol || 0.2;
  src.connect(f).connect(g).connect(ac.destination);
  src.start();
}

export const sfx = {
  toque: () => tom(660, 0.08, { tipo: 'triangle', vol: 0.12 }),
  certo: () => { tom(660, 0.1, { tipo: 'triangle' }); tom(990, 0.15, { tipo: 'triangle', atraso: 0.08 }); },
  errado: () => tom(220, 0.25, { tipo: 'square', vol: 0.08, ate: 140 }),
  ronco: () => { tom(70, 0.45, { tipo: 'sawtooth', vol: 0.12, ate: 50 }); ruido(0.4, { freq: 300, vol: 0.15 }); },
  buzina: () => { tom(392, 0.25, { tipo: 'square', vol: 0.07 }); tom(330, 0.25, { tipo: 'square', vol: 0.07 }); },
  batida: () => ruido(0.3, { freq: 500, vol: 0.35 }),
  portao: () => tom(900, 0.7, { tipo: 'sawtooth', vol: 0.05, ate: 500 }),
  flash: () => { ruido(0.15, { filtro: 'highpass', freq: 3000, vol: 0.3 }); tom(1800, 0.2, { vol: 0.06 }); },
  coracao: () => tom(880 + Math.random() * 300, 0.12, { tipo: 'sine', vol: 0.1 }),
  ceu: () => [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.6, { tipo: 'sine', vol: 0.08, atraso: i * 0.12 })),
  vitoria: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tom(f, 0.18, { tipo: 'triangle', vol: 0.12, atraso: i * 0.1 })),
  seta: (i) => tom([392, 523, 659][i] || 440, 0.22, { tipo: 'triangle', vol: 0.14 }),
};

// Trilha curtinha e alegre em loop (bem baixinha).
const MELODIA = [523, 587, 659, 523, 659, 784, 659, 587, 523, 587, 659, 659, 587, 523, 587, 0];
export function tocarMusica() {
  if (!ac || mudo || musicaTimer) return;
  let i = 0;
  musicaTimer = setInterval(() => {
    const f = MELODIA[i % MELODIA.length];
    if (f) tom(f / 2, 0.22, { tipo: 'triangle', vol: 0.035 });
    if (i % 4 === 0) tom(130.8, 0.3, { tipo: 'sine', vol: 0.05 });
    i++;
  }, 260);
}
export function pararMusica() {
  clearInterval(musicaTimer);
  musicaTimer = null;
}
