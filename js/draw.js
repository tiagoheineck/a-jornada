// Desenho no estilo "flat" do vídeo: contorno escuro, cores chapadas, cabeças grandes.
import { W, H } from './engine.js';

export const COR = {
  linha: '#2b2d42',
  pele: '#f6c9a0',
  peleEsc: '#d9a57b',
  ceu: '#bfe3f7',
  ceuTopo: '#8fcdf0',
  grama: '#7cc96b',
  gramaEsc: '#5aa84c',
  asfalto: '#5c5f66',
  parede: '#f4ecdf',
  piso: '#e3d5c2',
  madeira: '#d9a96b',
  madeiraEsc: '#b8834a',
  quadro: '#2f5f3f',
  telhado: '#c0622f',
  branco: '#ffffff',
  amarelo: '#ffe66d',
  vermelho: '#d94841',
};

export const PERS = {
  tiago: { cabelo: '#5b3a1e', estilo: 'curto', camisa: '#2e8b4a', calca: '#2f3e66', estampa: true },
  bispo: { cabelo: '#a7a9ad', estilo: 'solideu', camisa: '#2b2d42', calca: '#2b2d42', terno: true },
  duda: { cabelo: '#e9c25b', estilo: 'longo', camisa: '#2f3e66', saia: '#f7a1c4', crianca: true },
  tina: { cabelo: '#e9c25b', estilo: 'longo', camisa: '#2f3e66', saia: '#2f3e66', crianca: true },
  amanda: { cabelo: '#4a2c17', estilo: 'longo', camisa: '#2f3e66', saia: '#2f3e66', crianca: true },
  elir: { cabelo: '#7a4a2a', estilo: 'chanel', camisa: '#ffffff', bolinhas: true, calca: '#c9b3e6' },
  tata: { cabelo: '#3d2a1e', estilo: 'longo', camisa: '#9aa0a8', saia: '#9aa0a8' },
  lucimara: { cabelo: '#6b3b22', estilo: 'longo', camisa: '#ffffff', bolinhas: true, saia: '#c9b3e6' },
  aluno1: { cabelo: '#3b2414', estilo: 'curto', camisa: '#8e5bb5', calca: '#2f3e66', crianca: true },
  aluno2: { cabelo: '#c98a3c', estilo: 'curto', camisa: '#3a7bd5', calca: '#2f3e66', crianca: true },
  aluno3: { cabelo: '#2a1a10', estilo: 'curto', camisa: '#f08a24', calca: '#2f3e66', crianca: true, pele: '#a86b45' },
  aluno4: { cabelo: '#e9c25b', estilo: 'longo', camisa: '#e05d8a', saia: '#2f3e66', crianca: true },
};

// ---------- primitivas ----------
export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function preencher(ctx, cor, linha = 2.5) {
  ctx.fillStyle = cor;
  ctx.fill();
  if (linha) {
    ctx.lineWidth = linha;
    ctx.strokeStyle = COR.linha;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

export function circulo(ctx, x, y, r, cor, linha = 2.5) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  preencher(ctx, cor, linha);
}

export function texto(ctx, str, x, y, o = {}) {
  ctx.font = `${o.peso || 800} ${o.tam || 16}px "Nunito","Trebuchet MS",system-ui,sans-serif`;
  ctx.textAlign = o.alinh || 'center';
  ctx.textBaseline = o.base || 'middle';
  if (o.contorno) {
    ctx.lineWidth = o.contorno;
    ctx.strokeStyle = o.corContorno || COR.linha;
    ctx.lineJoin = 'round';
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = o.cor || COR.linha;
  ctx.fillText(str, x, y);
}

function quebrar(ctx, str, larg) {
  const linhas = [];
  for (const par of String(str).split('\n')) {
    let atual = '';
    for (const p of par.split(' ')) {
      const t = atual ? atual + ' ' + p : p;
      if (ctx.measureText(t).width > larg && atual) {
        linhas.push(atual);
        atual = p;
      } else atual = t;
    }
    linhas.push(atual);
  }
  return linhas;
}

// Balão de fala. (x, y) = centro do balão. cauda = ponto para onde a ponta aponta.
export function balao(ctx, str, x, y, o = {}) {
  const tam = o.tam || 14;
  const larg = o.larg || 170;
  ctx.font = `800 ${tam}px "Nunito","Trebuchet MS",system-ui,sans-serif`;
  const linhas = quebrar(ctx, str, larg - 20);
  const lh = tam * 1.25;
  const w = Math.min(larg, Math.max(...linhas.map((l) => ctx.measureText(l).width)) + 24);
  const h = linhas.length * lh + 16;
  const bx = Math.max(4, Math.min(W - w - 4, x - w / 2));
  const by = y - h / 2;

  if (o.grito) {
    // balão estourado amarelo
    const cx = bx + w / 2, cy = y, rx = w / 2 + 14, ry = h / 2 + 12, n = 16;
    ctx.beginPath();
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const k = i % 2 ? 0.86 : 1.06;
      ctx.lineTo(cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k);
    }
    ctx.closePath();
    preencher(ctx, o.cor || COR.amarelo, 2.5);
  } else {
    if (o.cauda) {
      ctx.beginPath();
      const cx = Math.max(bx + 16, Math.min(bx + w - 16, o.cauda.x));
      const baseY = o.cauda.y > y ? by + h - 2 : by + 2;
      ctx.moveTo(cx - 9, baseY);
      ctx.lineTo(o.cauda.x, o.cauda.y);
      ctx.lineTo(cx + 9, baseY);
      ctx.closePath();
      preencher(ctx, '#fff', 2.5);
    }
    rr(ctx, bx, by, w, h, 12);
    preencher(ctx, o.cor || '#fff', 2.5);
    if (o.cauda) {
      // apaga a linha entre a cauda e o balão
      const cx = Math.max(bx + 16, Math.min(bx + w - 16, o.cauda.x));
      const baseY = o.cauda.y > y ? by + h : by;
      ctx.fillStyle = o.cor || '#fff';
      ctx.fillRect(cx - 7.5, baseY - 2.5, 15, 5);
    }
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COR.linha;
  linhas.forEach((l, i) => ctx.fillText(l, bx + w / 2, by + 8 + lh / 2 + i * lh));
  return { x: bx, y: by, w, h };
}

// ---------- personagem ----------
// (x, y) = ponto entre os pés. o: { s escala, humor: 'sorri'|'uau'|'pisca'|'serio', braco: 'cima'|'lados'|'abertos', suor, olhar }
export function pessoa(ctx, x, y, p, o = {}) {
  const s = (o.s || 1) * (p.crianca ? 0.72 : 1);
  const pele = p.pele || COR.pele;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (o.virar) ctx.scale(-1, 1);
  const lw = 2.5 / s * Math.max(1, s);
  ctx.lineWidth = lw;

  // pernas
  const corPerna = p.calca || pele;
  rr(ctx, -12, -44, 10, 42, 3); preencher(ctx, corPerna, lw);
  rr(ctx, 2, -44, 10, 42, 3); preencher(ctx, corPerna, lw);
  // sapatos
  rr(ctx, -15, -5, 14, 7, 3); preencher(ctx, COR.linha, 0);
  rr(ctx, 1, -5, 14, 7, 3); preencher(ctx, COR.linha, 0);

  // braços
  const braco = o.braco || 'lados';
  const corBraco = p.terno ? p.camisa : (p.crianca || p.bolinhas || p.saia ? pele : p.camisa);
  const desenhaBraco = (lado, ang) => {
    ctx.save();
    ctx.translate(lado * 22, -84);
    ctx.rotate(ang);
    rr(ctx, -5, 0, 10, 38, 5); preencher(ctx, corBraco, lw);
    circulo(ctx, 0, 40, 5.5, pele, lw);
    ctx.restore();
  };
  if (braco === 'cima') { desenhaBraco(-1, 0.12); desenhaBraco(1, -2.6); }
  else if (braco === 'abertos') { desenhaBraco(-1, 1.1); desenhaBraco(1, -1.1); }
  else if (braco === 'tchau') { desenhaBraco(-1, 0.12); desenhaBraco(1, -2.3 + Math.sin(performance.now() / 120) * 0.35); }
  else { desenhaBraco(-1, 0.12); desenhaBraco(1, -0.12); }

  // tronco
  if (p.saia) {
    ctx.beginPath();
    ctx.moveTo(-18, -88); ctx.lineTo(18, -88); ctx.lineTo(26, -36); ctx.lineTo(-26, -36); ctx.closePath();
    preencher(ctx, p.saia, lw);
    rr(ctx, -19, -90, 38, 32, 8); preencher(ctx, p.camisa, lw);
  } else {
    rr(ctx, -21, -90, 42, 50, 9); preencher(ctx, p.camisa, lw);
  }
  if (p.bolinhas) {
    ctx.fillStyle = COR.linha;
    for (let i = 0; i < 12; i++) {
      const bx = -14 + (i % 4) * 9 + ((i / 4 | 0) % 2) * 4;
      const by = -80 + (i / 4 | 0) * 12;
      ctx.beginPath(); ctx.arc(bx, by, 1.6, 0, 7); ctx.fill();
    }
  }
  if (p.terno) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(-7, -90); ctx.lineTo(0, -76); ctx.lineTo(7, -90); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9aa0a8';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, -70 + i * 9, 1.8, 0, 7); ctx.fill(); }
  }
  if (p.estampa) {
    rr(ctx, -11, -80, 22, 22, 4); preencher(ctx, '#fff', 0);
    texto(ctx, '100', 0, -74, { tam: 8, peso: 900, cor: '#1f7a3d' });
    ctx.fillStyle = COR.vermelho; ctx.fillRect(-9, -69.5, 18, 5);
    texto(ctx, 'NOVOS', 0, -67, { tam: 4, peso: 900, cor: '#fff' });
    texto(ctx, 'IFs', 0, -61, { tam: 6, peso: 900, cor: '#1f7a3d' });
  }

  // pescoço + cabeça
  ctx.save();
  ctx.translate(0, -112);
  if (o.inclina) ctx.rotate(o.inclina);
  if (p.estilo === 'longo') { rr(ctx, -23, -14, 46, 44, 14); preencher(ctx, p.cabelo, lw); }
  if (p.estilo === 'chanel') { rr(ctx, -24, -16, 48, 36, 16); preencher(ctx, p.cabelo, lw); }
  circulo(ctx, 0, 0, 21, pele, lw);
  // cabelo
  ctx.beginPath();
  if (p.estilo === 'curto') {
    ctx.arc(0, -2, 22, Math.PI * 1.02, Math.PI * 1.98);
    ctx.quadraticCurveTo(10, -14, -6, -10);
    ctx.quadraticCurveTo(-16, -8, -21.5, -4);
    ctx.closePath();
    preencher(ctx, p.cabelo, lw);
  } else if (p.estilo === 'solideu') {
    ctx.arc(0, -4, 21, Math.PI * 1.05, Math.PI * 1.95);
    ctx.closePath();
    preencher(ctx, p.cabelo, lw);
    ctx.beginPath(); ctx.moveTo(-20, -6); ctx.lineTo(20, -6);
    ctx.strokeStyle = COR.linha; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.lineWidth = lw;
  } else {
    ctx.arc(0, -3, 22, Math.PI * 1.0, Math.PI * 2.0);
    ctx.quadraticCurveTo(14, -6, 2, -12);
    ctx.quadraticCurveTo(-12, -6, -22, -2);
    ctx.closePath();
    preencher(ctx, p.cabelo, lw);
  }
  // rosto
  const humor = o.humor || 'sorri';
  const ox = o.olhar || 0;
  ctx.fillStyle = COR.linha;
  if (humor === 'pisca') {
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-10 + ox, 3); ctx.lineTo(-4 + ox, 3); ctx.moveTo(4 + ox, 3); ctx.lineTo(10 + ox, 3);
    ctx.strokeStyle = COR.linha; ctx.stroke();
  } else if (humor === 'uau') {
    circulo(ctx, -7 + ox, 1, 4.2, '#fff', 1.6);
    circulo(ctx, 7 + ox, 1, 4.2, '#fff', 1.6);
    ctx.fillStyle = COR.linha;
    ctx.beginPath(); ctx.arc(-7 + ox, 1, 2, 0, 7); ctx.arc(7 + ox, 1, 2, 0, 7); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(-7 + ox, 2, 2.4, 0, 7); ctx.arc(7 + ox, 2, 2.4, 0, 7); ctx.fill();
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = COR.linha;
  if (humor === 'uau') {
    ctx.beginPath(); ctx.ellipse(ox, 12, 3.5, 4.5, 0, 0, 7); ctx.fillStyle = '#7a2e2e'; ctx.fill(); ctx.stroke();
  } else if (humor === 'serio') {
    ctx.beginPath(); ctx.moveTo(-5 + ox, 11); ctx.lineTo(5 + ox, 11); ctx.stroke();
  } else if (humor === 'riso') {
    ctx.beginPath(); ctx.arc(ox, 8, 7, 0.1, Math.PI - 0.1); ctx.closePath(); ctx.fillStyle = '#7a2e2e'; ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(ox, 7, 6, 0.3, Math.PI - 0.3); ctx.stroke();
  }
  // bochechas
  ctx.fillStyle = 'rgba(240,120,120,.35)';
  ctx.beginPath(); ctx.arc(-13, 9, 3.5, 0, 7); ctx.arc(13, 9, 3.5, 0, 7); ctx.fill();
  if (o.suor) {
    const t = performance.now() / 300;
    ctx.fillStyle = '#5aa9e6';
    for (let i = 0; i < 3; i++) {
      const yy = -28 - ((t + i * 0.7) % 2) * 6;
      ctx.beginPath(); ctx.ellipse(-26 + i * 26, yy, 2.5, 4, 0, 0, 7); ctx.fill();
    }
  }
  ctx.restore();
  ctx.restore();
}

// ---------- cenários ----------
export function fundoCeu(ctx, ate = H) {
  const g = ctx.createLinearGradient(0, 0, 0, ate);
  g.addColorStop(0, COR.ceuTopo);
  g.addColorStop(1, COR.ceu);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, ate);
}

export function nuvem(ctx, x, y, s = 1) {
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, 14 * s, 0, 7);
  ctx.arc(x + 16 * s, y - 6 * s, 16 * s, 0, 7);
  ctx.arc(x + 34 * s, y, 13 * s, 0, 7);
  ctx.fill();
}

export function sol(ctx, x, y) {
  circulo(ctx, x, y, 20, '#ffd23f', 0);
}

export function salaInterna(ctx, chaoY = 460) {
  ctx.fillStyle = COR.parede; ctx.fillRect(0, 0, W, chaoY);
  ctx.fillStyle = COR.piso; ctx.fillRect(0, chaoY, W, H - chaoY);
  ctx.strokeStyle = 'rgba(0,0,0,.06)'; ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(i * 52, chaoY); ctx.lineTo(i * 52 - 30, H); ctx.stroke(); }
}

export function arCondicionado(ctx, x, y) {
  rr(ctx, x - 40, y - 12, 80, 24, 6); preencher(ctx, '#fff', 2);
  ctx.fillStyle = '#5ccf7a'; ctx.beginPath(); ctx.arc(x + 32, y - 4, 2, 0, 7); ctx.fill();
}

export function sofa(ctx, x, y, w = 260) {
  // (x, y) = centro da base
  rr(ctx, x - w / 2, y - 92, w, 50, 14); preencher(ctx, '#6b6f78');
  rr(ctx, x - w / 2 - 10, y - 60, w + 20, 46, 12); preencher(ctx, '#7c808a');
  rr(ctx, x - w / 2 - 18, y - 72, 26, 60, 10); preencher(ctx, '#6b6f78');
  rr(ctx, x + w / 2 - 8, y - 72, 26, 60, 10); preencher(ctx, '#6b6f78');
  ctx.fillStyle = COR.linha;
  ctx.fillRect(x - w / 2, y - 14, 8, 14); ctx.fillRect(x + w / 2 - 8, y - 14, 8, 14);
}

export function casaFachada(ctx, chaoY = 470) {
  fundoCeu(ctx, chaoY);
  // telhado
  ctx.beginPath(); ctx.moveTo(-10, 150); ctx.lineTo(W / 2, 40); ctx.lineTo(W + 10, 150); ctx.closePath();
  preencher(ctx, COR.telhado, 3);
  ctx.fillStyle = '#f2ead9'; ctx.fillRect(14, 150, W - 28, chaoY - 150);
  ctx.strokeStyle = COR.linha; ctx.lineWidth = 3; ctx.strokeRect(14, 150, W - 28, chaoY - 150);
  // janelas
  for (const jx of [50, 210]) {
    rr(ctx, jx, 180, 100, 70, 4); preencher(ctx, '#cfe8f7', 3);
    ctx.beginPath(); ctx.moveTo(jx + 50, 180); ctx.lineTo(jx + 50, 250); ctx.moveTo(jx, 215); ctx.lineTo(jx + 100, 215); ctx.stroke();
  }
  ctx.fillStyle = '#cfc9bd'; ctx.fillRect(0, chaoY, W, H - chaoY);
  ctx.strokeStyle = COR.linha; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, chaoY); ctx.lineTo(W, chaoY); ctx.stroke();
}

export function estrelas(n) {
  return '<span>' + [1, 2, 3].map((i) => (i <= n ? '⭐' : '<span class="off">⭐</span>')).join('') + '</span>';
}

export function coracao(ctx, x, y, s = 1, cor = '#f2768f') {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-14, -4, -8, -16, 0, -8);
  ctx.bezierCurveTo(8, -16, 14, -4, 0, 6);
  ctx.closePath();
  preencher(ctx, cor, 2 / s);
  ctx.restore();
}

export function botaoCanvas(ctx, r, rotulo, o = {}) {
  rr(ctx, r.x, r.y + 4, r.w, r.h, 14); preencher(ctx, COR.linha, 0);
  rr(ctx, r.x, r.y + (o.apertado ? 3 : 0), r.w, r.h, 14);
  preencher(ctx, o.desabilitado ? '#c8c8c8' : (o.cor || '#fff'), 3);
  const tam = o.tam || 16;
  ctx.font = `900 ${tam}px "Nunito","Trebuchet MS",system-ui,sans-serif`;
  const linhas = quebrar(ctx, rotulo, r.w - 20);
  const lh = tam * 1.2;
  const y0 = r.y + r.h / 2 + (o.apertado ? 3 : 0) - ((linhas.length - 1) * lh) / 2;
  linhas.forEach((l, i) => texto(ctx, l, r.x + r.w / 2, y0 + i * lh, { tam, peso: 900, cor: o.corTexto || COR.linha }));
}
