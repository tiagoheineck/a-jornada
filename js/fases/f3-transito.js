import { W, H, rnd } from '../engine.js';
import { COR, fundoCeu, nuvem, sol, rr, preencher, circulo, balao, texto } from '../draw.js';

const DURACAO = 30;
const FAIXAS = [418, 478];

function carro(ctx, x, y, cor, tiago = false) {
  // (x, y) = centro da base
  rr(ctx, x - 40, y - 30, 80, 22, 8); preencher(ctx, cor, 2.5);
  ctx.beginPath();
  ctx.moveTo(x - 24, y - 30); ctx.lineTo(x - 14, y - 48); ctx.lineTo(x + 16, y - 48); ctx.lineTo(x + 26, y - 30); ctx.closePath();
  preencher(ctx, cor, 2.5);
  ctx.beginPath();
  ctx.moveTo(x - 16, y - 31); ctx.lineTo(x - 10, y - 44); ctx.lineTo(x + 13, y - 44); ctx.lineTo(x + 20, y - 31); ctx.closePath();
  preencher(ctx, '#cfe8f7', 1.5);
  if (tiago) {
    circulo(ctx, x + 2, y - 36, 6, COR.pele, 1.5);
    ctx.fillStyle = '#5b3a1e'; ctx.beginPath(); ctx.arc(x + 2, y - 38, 6.3, Math.PI, 0); ctx.fill();
  }
  circulo(ctx, x - 22, y - 7, 9, '#2b2d42', 0); circulo(ctx, x - 22, y - 7, 4, '#ccc', 0);
  circulo(ctx, x + 22, y - 7, 9, '#2b2d42', 0); circulo(ctx, x + 22, y - 7, 4, '#ccc', 0);
}

export default {
  titulo: 'Trânsito tranquilo',
  legenda: 'O trânsito estava tranquilo.',
  dica: 'Toque na tela para trocar de faixa. Desvie dos carros e buracos e pegue as marmitas 🍱.',
  criar(api) {
    let t = 0, faixa = 0, yCarro = FAIXAS[0], batidas = 0, invul = 0, marmitas = 0;
    let prox = 1.2, rolagem = 0, fim = 0;
    const coisas = [];
    const coresCarro = ['#3a7bd5', '#f08a24', '#8e5bb5', '#2e9e52'];

    function gerar() {
      const lane = Math.random() < 0.5 ? 0 : 1;
      const tipo = Math.random() < 0.25 ? 'buraco' : 'carro';
      coisas.push({ tipo, lane, x: W + 60, cor: coresCarro[Math.floor(Math.random() * 4)] });
      if (Math.random() < 0.55) coisas.push({ tipo: 'marmita', lane: 1 - lane, x: W + 60 + rnd(0, 60) });
    }

    return {
      update(dt) {
        t += dt;
        const vel = fim ? 120 : 180 + t * 5;
        rolagem += vel * dt;
        yCarro += (FAIXAS[faixa] - yCarro) * Math.min(1, dt * 14);
        invul = Math.max(0, invul - dt);
        if (fim) { fim += dt; coisas.forEach((c) => (c.x -= vel * dt)); return; }
        if (t >= DURACAO) {
          fim = 0.001;
          const est = batidas === 0 ? 3 : batidas <= 2 ? 2 : 1;
          setTimeout(() => api.fim(est), 1800);
          return;
        }
        prox -= dt;
        if (prox <= 0 && t < DURACAO - 2) { gerar(); prox = rnd(0.85, 1.35) - Math.min(0.35, t / 80); }
        for (let i = coisas.length - 1; i >= 0; i--) {
          const c = coisas[i];
          c.x -= vel * dt;
          if (c.x < -80) { coisas.splice(i, 1); continue; }
          const mesma = Math.abs(FAIXAS[c.lane] - yCarro) < 22;
          if (mesma && Math.abs(c.x - 80) < (c.tipo === 'carro' ? 70 : 40)) {
            if (c.tipo === 'marmita') {
              marmitas++; api.sfx.certo(); coisas.splice(i, 1);
            } else if (invul <= 0) {
              batidas++; invul = 1.2; api.sfx.batida();
            }
          }
        }
        if (Math.random() < dt * 0.15) api.sfx.buzina();
      },
      draw(ctx) {
        fundoCeu(ctx, 330);
        sol(ctx, 300, 90);
        for (let i = 0; i < 4; i++) {
          const x = ((i * 130 - rolagem * 0.15) % 520 + 520) % 520 - 60;
          nuvem(ctx, x, 140 + (i % 2) * 40, 0.9);
        }
        ctx.fillStyle = COR.grama; ctx.fillRect(0, 300, W, 90);
        for (let i = 0; i < 8; i++) {
          const x = ((i * 70 - rolagem * 0.5) % 560 + 560) % 560 - 40;
          rr(ctx, x - 4, 320, 8, 40, 2); preencher(ctx, '#7a5230', 2);
          circulo(ctx, x, 310, 22, '#3f9b4a', 2.5);
        }
        ctx.fillStyle = COR.asfalto; ctx.fillRect(0, 384, W, 124);
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 10; i++) {
          const x = ((i * 60 - rolagem) % 600 + 600) % 600 - 40;
          ctx.fillRect(x, 445, 32, 5);
        }
        ctx.fillStyle = COR.gramaEsc; ctx.fillRect(0, 508, W, H - 508);

        for (const c of coisas) {
          const y = FAIXAS[c.lane] + 20;
          if (c.tipo === 'carro') carro(ctx, c.x, y, c.cor);
          else if (c.tipo === 'buraco') { ctx.beginPath(); ctx.ellipse(c.x, y - 10, 26, 9, 0, 0, 7); preencher(ctx, '#2b2d42', 0); }
          else { texto(ctx, '🍱', c.x, y - 20, { tam: 28 }); }
        }
        const pisca = invul > 0 && Math.floor(invul * 10) % 2 === 0;
        if (!pisca) carro(ctx, 80, yCarro + 20, '#d94841', true);

        rr(ctx, 12, 228, 160, 54, 12); preencher(ctx, '#fff', 2.5);
        texto(ctx, `🍱 ${marmitas}   💥 ${batidas}`, 92, 244, { tam: 16, peso: 900 });
        const resta = Math.max(0, DURACAO - t);
        ctx.fillStyle = '#e3e3e3'; ctx.fillRect(24, 262, 136, 10);
        ctx.fillStyle = '#2e9e52'; ctx.fillRect(24, 262, 136 * (1 - resta / DURACAO), 10);
        if (fim) balao(ctx, 'Ufa! Caminho livre!', 150, 330, { tam: 16, larg: 170, cauda: { x: 90, y: yCarro - 20 } });
      },
      down() {
        if (fim) return;
        faixa = 1 - faixa;
        api.sfx.toque();
      },
    };
  },
};
