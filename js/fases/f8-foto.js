import { W, H, dentro, rnd } from '../engine.js';
import { PERS, pessoa, balao, salaInterna, sofa, arCondicionado, botaoCanvas, texto } from '../draw.js';

const VAGAS = [62, 112, 158, 204, 250, 300];
const Y_SOFA = 404;
const CICLO = 2.6;
const JANELA = 0.85;

export default {
  titulo: 'A foto para a história',
  legenda: 'A foto para a história: as meninas, a Dona Elir e a tata, todo mundo no sofá com o bispo!',
  dica: 'Arraste cada pessoa para um lugar no sofá. Depois tire a foto quando TODOS estiverem sorrindo.',
  criar(api) {
    const nomes = ['tina', 'elir', 'bispo', 'duda', 'tata', 'amanda'];
    const gente = nomes.map((n, i) => ({
      p: PERS[n], x: 36 + i * 58 + rnd(-6, 6), y: 548, vaga: -1, humor: 'sorri', troca: rnd(0.2, 0.8),
    }));
    let t = 0, arr = null, flash = 0, tentativas = 0, aviso = '', avisoT = 0, apertado = false;
    let fase = 'arrumar', ft = 0;
    const btn = { x: W / 2 - 90, y: 446, w: 180, h: 56 };

    const sorrindoTodos = () => (t % CICLO) > CICLO - JANELA;

    return {
      update(dt) {
        t += dt; ft += dt;
        flash = Math.max(0, flash - dt);
        avisoT -= dt;
        if (fase === 'arrumar' && gente.every((g) => g.vaga >= 0)) { fase = 'foto'; ft = 0; t = 0; }
        for (const g of gente) {
          if (g.vaga >= 0 && g !== arr) {
            g.x += (VAGAS[g.vaga] - g.x) * Math.min(1, dt * 12);
            g.y += (Y_SOFA - g.y) * Math.min(1, dt * 12);
          }
          if (fase === 'foto') {
            if (sorrindoTodos()) g.humor = 'riso';
            else {
              g.troca -= dt;
              if (g.troca <= 0) { g.humor = ['pisca', 'serio', 'uau', 'sorri'][Math.floor(Math.random() * 4)]; g.troca = rnd(0.25, 0.7); }
            }
          }
        }
        if (fase === 'tirada' && ft > 3.2) { fase = 'fim'; api.fim(3 - Math.min(2, tentativas - 1)); }
      },
      draw(ctx) {
        salaInterna(ctx, 420);
        arCondicionado(ctx, 180, 110);
        sofa(ctx, 180, 418, 290);
        if (fase === 'arrumar') {
          VAGAS.forEach((x, i) => {
            if (gente.some((g) => g.vaga === i)) return;
            ctx.setLineDash([5, 5]); ctx.strokeStyle = '#2e9e52'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.ellipse(x, Y_SOFA - 4, 20, 8, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
          });
        }
        const ordem = gente.slice().sort((a, b) => (a === arr) - (b === arr) || a.y - b.y);
        for (const g of ordem) {
          const s = g.p.crianca ? 0.95 : 0.78;
          pessoa(ctx, g.x, g.y, g.p, { s, humor: fase === 'arrumar' ? 'sorri' : g.humor });
        }
        if (fase === 'arrumar') {
          if (ft < 3) balao(ctx, 'Antes de ir, uma foto! Todo mundo junto!', W / 2, 190, { larg: 230, tam: 15 });
          else balao(ctx, `No sofá: ${gente.filter((g) => g.vaga >= 0).length}/6`, W / 2, 190, { larg: 150, tam: 15 });
        }
        if (fase === 'foto') {
          botaoCanvas(ctx, btn, '📸 Tirar foto', { cor: '#ffe66d', tam: 20, apertado });
          texto(ctx, sorrindoTodos() ? '😁 Agora!' : '…esperem…', W / 2, 190, { tam: 20, peso: 900, cor: '#fff', contorno: 5 });
        }
        if (avisoT > 0) balao(ctx, aviso, W / 2, 250, { larg: 200, tam: 15 });
        if (fase === 'tirada' || fase === 'fim') {
          // moldura da foto
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 10;
          ctx.strokeRect(14, 230, W - 28, 200);
          texto(ctx, 'Foto para a história ❤', W / 2, 452, { tam: 16, peso: 900, cor: '#fff', contorno: 5 });
          if (ft > 0.8) balao(ctx, 'Obrigado por abrirem a porta da casa de vocês! Que crianças bonitas!', W / 2, 150, { larg: 250, tam: 14, cauda: { x: VAGAS[gente[2].vaga] || 158, y: 270 } });
        }
        if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash / 0.35})`; ctx.fillRect(0, 0, W, H); }
      },
      down(p) {
        if (fase === 'arrumar') {
          let melhor = null, md = 1e9;
          for (const g of gente) {
            const d = Math.hypot(p.x - g.x, p.y - (g.y - 55));
            if (d < 48 && d < md) { md = d; melhor = g; }
          }
          if (melhor) { arr = melhor; arr.vaga = -1; api.sfx.toque(); }
        } else if (fase === 'foto' && dentro(p, btn)) {
          apertado = true;
          tentativas++;
          flash = 0.35;
          api.sfx.flash();
          if (sorrindoTodos()) { fase = 'tirada'; ft = 0; gente.forEach((g) => (g.humor = 'riso')); }
          else { aviso = 'Ops! Alguém piscou! 😅'; avisoT = 1.2; }
        }
      },
      move(p) { if (arr) { arr.x = p.x; arr.y = p.y + 55; } },
      up() {
        apertado = false;
        if (!arr) return;
        let melhor = -1, md = 70;
        VAGAS.forEach((x, i) => {
          if (gente.some((g) => g.vaga === i)) return;
          const d = Math.hypot(arr.x - x, arr.y - Y_SOFA);
          if (d < md) { md = d; melhor = i; }
        });
        if (melhor >= 0) { arr.vaga = melhor; api.sfx.certo(); }
        else { arr.y = Math.min(560, Math.max(460, arr.y)); }
        arr = null;
      },
    };
  },
};
