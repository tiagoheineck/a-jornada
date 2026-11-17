import { W, clamp, dentro, reduzMovimento } from '../engine.js';
import { COR, PERS, pessoa, balao, rr, preencher, botaoCanvas, texto } from '../draw.js';

const DURACAO = 16;
const PORTA = 300;
const CHAO = 552;
const ASSUNTOS = [
  'Bispo, olha que vista bonita pela janela!',
  'O senhor aceita um cafezinho especial?',
  'Bispo, já conheceu as plantas da Lucimara?',
  'E aquele jogo de domingo, hein?',
  'Bispo, o senhor gosta de pão de queijo?',
];

function prato(ctx, x, y, cheio) {
  ctx.beginPath(); ctx.ellipse(x, y, 34, 9, 0, 0, 7); preencher(ctx, '#fff', 2.5);
  if (cheio) {
    ctx.strokeStyle = '#f3ead8'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - 20 + i * 12, y - 3); ctx.lineTo(x - 8 + i * 12, y - 6); ctx.stroke(); }
    ctx.lineCap = 'butt';
  }
}

export default {
  titulo: 'Pânico na cozinha',
  legenda: 'Enquanto isso, na cozinha, a Dona Elir quase caiu da cadeira! E esse ossinho ia ser o almoço do Tiago e da Lucimara!',
  dica: 'Arraste o Tiago para ficar na frente do bispo e use “Puxar conversa” para afastá-lo da cozinha.',
  criar(api) {
    let t = 0, progresso = 0, falhas = 0, cool = 0, curiosidade = 0;
    let bispo = { x: 40, conversa: 0, falaT: 0, fala: '', pausa: 0 };
    let tiago = { x: 200, alvo: 200, falaT: 0, fala: '' };
    let arrastando = false, apertado = false, fim = false, elirFala = '', elirT = 0, ai = 0;
    const btn = { x: 96, y: 318, w: 168, h: 48 };

    function falhou() {
      falhas++;
      progresso = Math.max(0, progresso - 0.15);
      bispo.fala = 'Que cheirinho bom! Hmm... osso?'; bispo.falaT = 1.8; bispo.pausa = 1.8;
      elirFala = 'AAAH! Ele tá vindo!'; elirT = 1.8;
      api.sfx.errado();
      setTimeout(() => { bispo.x = 40; curiosidade = 0; }, 1500);
    }

    return {
      update(dt) {
        t += dt;
        cool = Math.max(0, cool - dt);
        bispo.falaT -= dt; tiago.falaT -= dt; elirT -= dt;
        if (t < 2.5) { elirFala = 'Meu Deus do céu! O Tiago trouxe o BISPO pra almoçar!'; elirT = 0.1; }
        else if (t < 5) { elirFala = '... e só tem OSSO de galeto!!'; elirT = 0.1; }
        // Tiago segue o dedo
        const d = tiago.alvo - tiago.x;
        tiago.x += clamp(d, -300 * dt, 300 * dt);
        if (fim) return;
        progresso = Math.min(1, progresso + dt / DURACAO);
        if (progresso >= 1) {
          fim = true;
          elirFala = 'Ufa! Ninguém vai ver os ossos!'; elirT = 3;
          setTimeout(() => api.fim(3 - falhas), 1600);
          return;
        }
        if (bispo.pausa > 0) { bispo.pausa -= dt; return; }
        if (bispo.conversa > 0) {
          bispo.conversa -= dt;
          bispo.x = Math.max(30, bispo.x - 70 * dt);
          return;
        }
        bispo.x += (34 + t * 1.6) * dt;
        const gap = tiago.x - bispo.x;
        if (gap > 0 && gap < 48) {
          bispo.x = tiago.x - 48;
          curiosidade += dt / 2.6;
          if (curiosidade >= 1) {
            curiosidade = 0;
            bispo.x = tiago.x + 52;
            bispo.fala = 'Com licença, filho!'; bispo.falaT = 1.4;
            api.sfx.errado();
          }
        } else curiosidade = Math.max(0, curiosidade - dt * 0.3);
        if (bispo.x >= PORTA - 20) falhou();
      },
      draw(ctx) {
        // ----- cozinha (metade de cima)
        ctx.fillStyle = '#fbeedd'; ctx.fillRect(0, 0, W, 300);
        for (let i = 0; i < 4; i++) { rr(ctx, 96 + i * 62, 70, 54, 64, 4); preencher(ctx, COR.madeira, 2.5); }
        ctx.fillStyle = '#e8dccb'; ctx.fillRect(0, 266, W, 34);
        const tremor = elirT > 0 && !reduzMovimento() ? Math.sin(t * 50) * 2 : 0;
        pessoa(ctx, 90 + tremor, 292, PERS.elir, { s: 0.92, humor: progresso >= 1 ? 'riso' : 'uau', braco: progresso >= 1 ? 'lados' : 'abertos', suor: progresso < 1 });
        rr(ctx, 150, 214, 196, 52, 6); preencher(ctx, COR.madeira, 3);
        const cheio = progresso < 0.98;
        prato(ctx, 250 + progresso * 80, 210, cheio);
        if (cheio) texto(ctx, '🔻', 250 + progresso * 80, 186, { tam: 14 });
        // barra de progresso
        rr(ctx, 160, 154, 180, 34, 10); preencher(ctx, '#fff', 2.5);
        texto(ctx, 'Escondendo os ossos', 250, 164, { tam: 11, peso: 900 });
        ctx.fillStyle = '#e3e3e3'; ctx.fillRect(172, 174, 156, 8);
        ctx.fillStyle = '#2e9e52'; ctx.fillRect(172, 174, 156 * progresso, 8);
        if (elirT > 0) balao(ctx, elirFala, 180, 116, { larg: 200, tam: 13, grito: elirFala.includes('OSSO') || elirFala.includes('AAAH'), cauda: { x: 100, y: 180 } });

        // divisória
        ctx.fillStyle = COR.linha; ctx.fillRect(0, 300, W, 6);

        // ----- sala (metade de baixo)
        ctx.fillStyle = COR.parede; ctx.fillRect(0, 306, W, 200);
        ctx.fillStyle = COR.piso; ctx.fillRect(0, 506, W, 140);
        rr(ctx, PORTA, 380, 52, 128, 4); preencher(ctx, '#a0703f', 3);
        texto(ctx, 'COZINHA', PORTA + 26, 396, { tam: 9, peso: 900, cor: '#fff' });

        pessoa(ctx, bispo.x, CHAO, PERS.bispo, { s: 0.9, humor: bispo.conversa > 0 ? 'riso' : 'sorri' });
        pessoa(ctx, tiago.x, CHAO, PERS.tiago, { s: 0.9, braco: arrastando ? 'abertos' : 'lados', humor: 'riso' });
        // curiosidade do bispo
        if (curiosidade > 0.05) {
          ctx.fillStyle = '#e3e3e3'; ctx.fillRect(bispo.x - 22, 432, 44, 6);
          ctx.fillStyle = '#d94841'; ctx.fillRect(bispo.x - 22, 432, 44 * curiosidade, 6);
          texto(ctx, '❓', bispo.x, 420, { tam: 14 });
        }
        if (bispo.falaT > 0) balao(ctx, bispo.fala, clamp(bispo.x, 90, 270), 400, { larg: 170, tam: 13 });
        if (tiago.falaT > 0) balao(ctx, tiago.fala, clamp(tiago.x, 100, 260), 400, { larg: 190, tam: 13 });

        botaoCanvas(ctx, btn, cool > 0 ? `💬 ${cool.toFixed(1)}s` : '💬 Puxar conversa', {
          desabilitado: cool > 0, apertado, cor: '#cdeccf', tam: 15,
        });
      },
      down(p) {
        if (dentro(p, btn)) {
          apertado = true;
          if (cool > 0 || fim) return;
          cool = 3;
          tiago.fala = ASSUNTOS[ai++ % ASSUNTOS.length]; tiago.falaT = 1.6;
          if (Math.abs(bispo.x - tiago.x) < 110) {
            bispo.conversa = 1.8; curiosidade = 0; api.sfx.certo();
          } else { api.sfx.toque(); }
          return;
        }
        if (p.y > 380) { arrastando = true; tiago.alvo = clamp(p.x, 30, PORTA - 10); }
      },
      move(p) { if (arrastando) tiago.alvo = clamp(p.x, 30, PORTA - 10); },
      up() { arrastando = false; apertado = false; },
    };
  },
};
