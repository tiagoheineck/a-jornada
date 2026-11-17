import { W, rnd, reduzMovimento } from '../engine.js';
import { PERS, pessoa, balao, salaInterna } from '../draw.js';
import { relogio } from './f1-cafe.js';

const META = 5;

export default {
  titulo: 'O sinal das 11h45',
  legenda: 'Lá pelas onze e quarenta e cinco, depois de muito café, veio um sinal.',
  dica: 'Toque só nos balões amarelos “É UM SINAL!”. Os roncos não contam!',
  criar(api) {
    const baloes = [];
    let t = 0, prox = 0.6, acertos = 0, erros = 0, tremor = 0, fim = 0;

    function criarBalao() {
      const sinal = Math.random() < 0.38;
      baloes.push({
        sinal,
        x: rnd(80, W - 80),
        y: rnd(200, 360),
        vida: sinal ? 1.25 : 1.5,
        t: 0,
      });
      if (!sinal && Math.random() < 0.6) api.sfx.ronco();
    }

    return {
      teste: () => baloes,
      update(dt) {
        t += dt;
        tremor = Math.max(0, tremor - dt);
        if (fim) {
          fim += dt;
          return;
        }
        prox -= dt;
        if (prox <= 0) { criarBalao(); prox = rnd(0.45, 0.8); }
        for (let i = baloes.length - 1; i >= 0; i--) {
          const b = baloes[i];
          b.t += dt;
          if (b.t > b.vida) {
            if (b.sinal) erros += 0.5;
            baloes.splice(i, 1);
          }
        }
      },
      draw(ctx) {
        salaInterna(ctx, 470);
        relogio(ctx, W / 2, 120, 44, 11, 45);
        const dx = tremor > 0 && !reduzMovimento() ? Math.sin(t * 60) * 5 : 0;
        pessoa(ctx, W / 2 + dx, 540, PERS.tiago, {
          s: 1.35,
          humor: fim ? 'riso' : tremor > 0 ? 'uau' : 'sorri',
          braco: fim ? 'cima' : 'lados',
        });
        if (!fim) {
          for (const b of baloes) {
            const k = Math.min(1, b.t * 6);
            ctx.save();
            ctx.globalAlpha = b.t > b.vida - 0.25 ? Math.max(0, (b.vida - b.t) / 0.25) : 1;
            ctx.translate(b.x, b.y); ctx.scale(k, k); ctx.translate(-b.x, -b.y);
            if (b.sinal) balao(ctx, 'É UM SINAL!', b.x, b.y, { grito: true, tam: 17, larg: 150 });
            else balao(ctx, 'Ronc... ronc...', b.x, b.y, { tam: 14, larg: 130, cor: '#eef1f4' });
            ctx.restore();
          }
          balao(ctx, `Sinais: ${acertos}/${META}`, W / 2, 214, { tam: 15, larg: 140 });
        } else {
          balao(ctx, 'Turma, podem ir! Eu preciso ir pra casa!', W / 2, 250, { larg: 230, tam: 16, cauda: { x: W / 2, y: 330 } });
        }
      },
      down(p) {
        if (fim) return;
        for (let i = baloes.length - 1; i >= 0; i--) {
          const b = baloes[i];
          const w = b.sinal ? 85 : 68, h = b.sinal ? 40 : 28;
          if (Math.abs(p.x - b.x) < w && Math.abs(p.y - b.y) < h) {
            baloes.splice(i, 1);
            if (b.sinal) {
              acertos++;
              api.sfx.certo();
              if (acertos >= META) {
                fim = 0.001;
                const est = erros <= 1 ? 3 : erros <= 3 ? 2 : 1;
                setTimeout(() => api.fim(est), 2200);
              }
            } else {
              erros++;
              tremor = 0.4;
              api.sfx.errado();
            }
            return;
          }
        }
      },
    };
  },
};
