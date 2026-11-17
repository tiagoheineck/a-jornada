import { W, rnd, dist } from '../engine.js';
import { PERS, pessoa, balao, salaInterna, sofa, arCondicionado, rr, preencher, circulo, coracao, texto } from '../draw.js';

const DURACAO_ABRACO = 10;

export default {
  titulo: 'Quem chegou?',
  legenda: 'As meninas acharam que era o Marcos chegando...',
  dica: 'Ache as três meninas escondidas e toque nelas. Depois toque nos corações do abraço!',
  criar(api) {
    const meninas = [
      { p: PERS.duda, nome: 'Duda', x: 66, y: 462, sx: 180, esc: 'porta', achada: false },
      { p: PERS.tina, nome: 'Tina', x: 316, y: 470, sx: 120, esc: 'planta', achada: false },
      { p: PERS.amanda, nome: 'Amanda', x: 232, y: 432, sx: 240, esc: 'sofa', achada: false },
    ];
    let t = 0, fase = 'busca', ft = 0, bispoX = W + 60, coletados = 0, prox = 0;
    const coracoes = [];

    const alvo = (m) => ({ x: m.x, y: m.y - 80 });

    return {
      update(dt) {
        t += dt; ft += dt;
        for (const m of meninas) {
          if (m.achada) {
            m.x += (m.sx - m.x) * Math.min(1, dt * 5);
            m.y += (468 - m.y) * Math.min(1, dt * 5);
          }
        }
        if (fase === 'busca' && meninas.every((m) => m.achada) && ft > 0.3) { fase = 'chega'; ft = 0; }
        if (fase === 'chega') {
          bispoX = Math.max(180, bispoX - dt * 170);
          if (bispoX <= 180 && ft > 1.5) { fase = 'abraco'; ft = 0; api.sfx.ceu(); }
        }
        if (fase === 'abraco') {
          prox -= dt;
          if (prox <= 0) {
            coracoes.push({ x: rnd(50, W - 50), y: 440, vx: rnd(-20, 20), vy: rnd(-95, -60), t: 0 });
            prox = rnd(0.25, 0.5);
          }
          if (ft >= DURACAO_ABRACO) {
            fase = 'fim'; ft = 0;
            api.fim(coletados >= 12 ? 3 : coletados >= 7 ? 2 : 1);
          }
        }
        for (let i = coracoes.length - 1; i >= 0; i--) {
          const c = coracoes[i];
          c.t += dt; c.x += c.vx * dt; c.y += c.vy * dt;
          if (c.y < 70 || c.morto > 0.3) coracoes.splice(i, 1);
          else if (c.morto !== undefined) c.morto += dt;
        }
      },
      draw(ctx) {
        salaInterna(ctx, 470);
        arCondicionado(ctx, 180, 110);
        // porta
        rr(ctx, 14, 300, 80, 170, 4); preencher(ctx, '#7a5230', 3);
        // menina atrás da porta (escondida) / atrás do sofá
        for (const m of meninas) {
          if (!m.achada && m.esc === 'porta') pessoa(ctx, m.x, m.y, m.p, { olhar: 3 });
          if (!m.achada && m.esc === 'sofa') pessoa(ctx, m.x, m.y, m.p, { olhar: -2 });
        }
        rr(ctx, 14, 300, 52, 170, 4); preencher(ctx, '#a0703f', 3);
        circulo(ctx, 56, 390, 4, '#ffd23f', 1.5);

        sofa(ctx, 180, 478, 180);
        // meninas achadas no sofá
        for (const m of meninas) {
          if (m.achada) pessoa(ctx, m.x, m.y, m.p, { humor: fase === 'abraco' ? 'riso' : 'sorri' });
        }
        // planta
        const pm = meninas.find((m) => m.esc === 'planta');
        if (!pm.achada) pessoa(ctx, pm.x, pm.y, pm.p, { olhar: -3 });
        rr(ctx, 296, 430, 40, 40, 6); preencher(ctx, '#c0622f', 3);
        for (let i = 0; i < 6; i++) {
          ctx.beginPath(); ctx.ellipse(316 + Math.cos(i) * 18, 400 - i * 6, 14, 26, i * 0.8, 0, 7);
          preencher(ctx, i % 2 ? '#3f9b4a' : '#5aa84c', 2);
        }

        // bispo
        if (fase !== 'busca') pessoa(ctx, bispoX, 540, PERS.bispo, { braco: fase === 'abraco' || fase === 'fim' ? 'abertos' : 'tchau' });
        if (fase === 'busca') pessoa(ctx, 300, 590, PERS.tiago, { braco: 'cima', s: 0.95 });

        // falas
        if (fase === 'busca') {
          if (t < 2.6) balao(ctx, 'Meninas, venham ver quem chegou!', 210, 400, { larg: 200, cauda: { x: 290, y: 460 } });
          else if (t < 5) balao(ctx, 'Será que é o Marcos?', 170, 200, { larg: 170, tam: 15 });
          const faltam = meninas.filter((m) => !m.achada).length;
          if (t >= 5) balao(ctx, `Ache as meninas: ${3 - faltam}/3`, 180, 200, { larg: 190, tam: 15 });
        }
        if (fase === 'abraco') {
          balao(ctx, 'Que alegria, crianças! Obrigado por me receberem neste lugar tão bonito!', 190, 190, { larg: 250, tam: 14, cauda: { x: 190, y: 300 } });
          if (ft > 1.5 && ft < 3.5) balao(ctx, 'Oba!', 70, 300, { grito: true, tam: 16, larg: 60 });
          texto(ctx, `❤️ ${coletados}`, 300, 300, { tam: 22, peso: 900, cor: '#fff', contorno: 5 });
          ctx.fillStyle = '#e3e3e3'; ctx.fillRect(40, 260, W - 80, 8);
          ctx.fillStyle = '#f2768f'; ctx.fillRect(40, 260, (W - 80) * (1 - ft / DURACAO_ABRACO), 8);
        }
        for (const c of coracoes) {
          ctx.save();
          if (c.morto !== undefined) { ctx.globalAlpha = 1 - c.morto / 0.3; }
          coracao(ctx, c.x, c.y, c.morto !== undefined ? 1.6 + c.morto * 3 : 1.6);
          ctx.restore();
        }
      },
      down(p) {
        if (fase === 'busca') {
          for (const m of meninas) {
            if (!m.achada && dist(p, alvo(m)) < 50) {
              m.achada = true; ft = 0; api.sfx.certo();
              return;
            }
          }
          api.sfx.toque();
        } else if (fase === 'abraco') {
          for (const c of coracoes) {
            if (c.morto === undefined && dist(p, c) < 34) { c.morto = 0; coletados++; api.sfx.coracao(); return; }
          }
        }
      },
    };
  },
};
