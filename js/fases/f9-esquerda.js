import { W, H, dentro } from '../engine.js';
import { COR, PERS, pessoa, balao, fundoCeu, nuvem, sol, rr, preencher, botaoCanvas, texto } from '../draw.js';

const SETAS = ['⬅', '⬆', '➡'];
const TAMANHOS = [3, 4, 5];

function sequencia(n) {
  const s = [];
  for (let i = 0; i < n; i++) s.push(Math.random() < 0.6 ? 0 : Math.random() < 0.5 ? 1 : 2);
  s[0] = 0; // sempre começa pela esquerda
  return s;
}

export default {
  titulo: 'Esquerda, esquerda, esquerda',
  legenda: 'E o caminho? Esquerda, esquerda, esquerda... direto pro almoço certo!',
  dica: 'Observe as setas na placa e repita a sequência tocando nos botões.',
  criar(api) {
    let rodada = 0, seq = sequencia(TAMANHOS[0]), estado = 'fala', et = 0, idx = 0, erros = 0;
    let acesa = -1, apertado = -1, bispoX = 230, t = 0;
    const botoes = [0, 1, 2].map((i) => ({ x: 14 + i * 114, y: 436, w: 104, h: 76 }));

    function demo() { estado = 'demo'; et = 0; idx = 0; }

    return {
      teste: () => ({ seq, estado }),
      update(dt) {
        t += dt; et += dt;
        if (estado === 'fala' && et > 2.4) demo();
        if (estado === 'demo') {
          const passo = 0.75;
          const i = Math.floor(et / passo);
          const dentroPasso = et % passo;
          if (i >= seq.length) { estado = 'entrada'; acesa = -1; idx = 0; et = 0; }
          else {
            const nova = dentroPasso < 0.55 ? seq[i] : -1;
            if (nova !== acesa && nova >= 0) api.sfx.seta(nova);
            acesa = nova;
          }
        }
        if (estado === 'erro' && et > 1.3) demo();
        if (estado === 'certo' && et > 1) {
          rodada++;
          if (rodada >= TAMANHOS.length) { estado = 'tchau'; et = 0; api.sfx.ceu(); }
          else { seq = sequencia(TAMANHOS[rodada]); demo(); }
        }
        if (estado === 'tchau') {
          if (et > 2.4) bispoX -= dt * 120;
          if (et > 5.2) { estado = 'fim'; api.fim(erros === 0 ? 3 : erros <= 2 ? 2 : 1); }
        }
        if (estado === 'entrada' && et > 0.3) acesa = -1;
      },
      draw(ctx) {
        fundoCeu(ctx, 270);
        sol(ctx, 320, 70);
        nuvem(ctx, 30, 80, 0.9); nuvem(ctx, 230, 60, 0.7);
        ctx.fillStyle = COR.grama; ctx.fillRect(0, 262, W, 76);
        ctx.fillStyle = COR.asfalto; ctx.fillRect(0, 330, W, 74);
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 7; i++) ctx.fillRect(10 + i * 55, 365, 30, 4);
        ctx.fillStyle = COR.gramaEsc; ctx.fillRect(0, 404, W, H - 404);

        // placa
        ctx.fillStyle = '#7a5230'; ctx.fillRect(176, 170, 8, 100);
        rr(ctx, 110, 112, 140, 66, 12); preencher(ctx, '#1f8f7a', 3);
        rr(ctx, 118, 120, 124, 50, 8); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        if (acesa >= 0) texto(ctx, SETAS[acesa], 180, 146, { tam: 40, peso: 900, cor: '#fff' });
        else texto(ctx, estado === 'entrada' ? 'Sua vez!' : '…', 180, 146, { tam: 18, peso: 900, cor: '#fff' });

        // personagens
        const tchau = estado === 'tchau' || estado === 'fim';
        pessoa(ctx, 48, 396, PERS.tiago, { s: 0.9, braco: tchau || estado === 'fala' ? 'tchau' : 'cima' });
        pessoa(ctx, 92, 398, PERS.duda, { s: 0.9 });
        pessoa(ctx, 122, 398, PERS.tina, { s: 0.9, braco: tchau ? 'tchau' : 'lados' });
        pessoa(ctx, 152, 398, PERS.amanda, { s: 0.9 });
        if (bispoX > -60) pessoa(ctx, bispoX, 396, PERS.bispo, { s: 0.9, braco: tchau ? 'tchau' : 'lados', virar: estado === 'tchau' && et > 2.4 });

        // falas
        if (estado === 'fala') balao(ctx, 'É à esquerda, da esquerda, da esquerda!', 110, 220, { larg: 200, tam: 14, cauda: { x: 50, y: 280 } });
        if (estado === 'erro') balao(ctx, 'Hmm... era pra lá mesmo? Mostra de novo!', 240, 220, { larg: 190, tam: 14, cauda: { x: 230, y: 280 } });
        if (estado === 'certo') balao(ctx, 'Entendi! 👍', 260, 226, { larg: 120, tam: 15, cauda: { x: 232, y: 280 } });
        if (tchau && et < 2.6) balao(ctx, 'Deus abençoe vocês! Que vizinhança bonita, que criançada feliz!', 220, 216, { larg: 230, tam: 13, cauda: { x: 232, y: 280 } });
        if (tchau && et >= 2.6) balao(ctx, 'Tchau, bispo!', 110, 226, { grito: true, tam: 17, larg: 140 });

        // progresso das rodadas
        texto(ctx, `Rodada ${Math.min(rodada + 1, 3)}/3`, 56, 246, { tam: 14, peso: 900, cor: '#fff', contorno: 4 });
        if (estado === 'entrada') {
          for (let i = 0; i < seq.length; i++) {
            ctx.beginPath(); ctx.arc(290 + i * 18 - (seq.length - 1) * 9, 246, 6, 0, 7);
            preencher(ctx, i < idx ? '#2e9e52' : '#fff', 2);
          }
        }
        botoes.forEach((b, i) => botaoCanvas(ctx, b, SETAS[i], {
          tam: 34, apertado: apertado === i, desabilitado: estado !== 'entrada', cor: '#cdeccf',
        }));
      },
      down(p) {
        if (estado !== 'entrada') return;
        botoes.forEach((b, i) => {
          if (!dentro(p, b)) return;
          apertado = i; acesa = i; et = 0;
          api.sfx.seta(i);
          if (seq[idx] === i) {
            idx++;
            if (idx >= seq.length) { estado = 'certo'; et = 0; api.sfx.certo(); }
          } else {
            erros++; estado = 'erro'; et = 0; api.sfx.errado();
          }
        });
      },
      up() { apertado = -1; },
    };
  },
};
