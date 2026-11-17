import { W, dentro } from '../engine.js';
import { COR, PERS, pessoa, balao, rr, preencher, circulo, casaFachada, texto } from '../draw.js';

const CHAO = 430;
const GARAGEM = { x: 28, y: 300, w: 150, h: CHAO - 300 };

function carroPequeno(ctx, x, y) {
  rr(ctx, x - 44, y - 32, 88, 24, 8); preencher(ctx, '#d94841', 2.5);
  ctx.beginPath(); ctx.moveTo(x - 26, y - 32); ctx.lineTo(x - 15, y - 52); ctx.lineTo(x + 18, y - 52); ctx.lineTo(x + 28, y - 32); ctx.closePath();
  preencher(ctx, '#d94841', 2.5);
  ctx.beginPath(); ctx.moveTo(x - 17, y - 33); ctx.lineTo(x - 10, y - 48); ctx.lineTo(x + 14, y - 48); ctx.lineTo(x + 21, y - 33); ctx.closePath();
  preencher(ctx, '#cfe8f7', 1.5);
  circulo(ctx, x - 24, y - 8, 10, '#2b2d42', 0); circulo(ctx, x + 24, y - 8, 10, '#2b2d42', 0);
}

function mochila(ctx, x, y) {
  rr(ctx, x - 13, y - 30, 26, 30, 7); preencher(ctx, '#2f3e66', 2.5);
  rr(ctx, x - 9, y - 16, 18, 10, 3); preencher(ctx, '#3a5a9a', 2);
}

export default {
  titulo: 'A voz que veio do céu',
  legenda: 'Guardou o carro, pegou a mochila, abriu o portão. E ouviu uma voz que parecia vir do céu!',
  dica: 'Arraste o carro até a garagem, toque na mochila e arraste o portão para abrir.',
  criar(api) {
    let t = 0, etapa = 0, et = 0; // 0 carro, 1 mochila, 2 portão, 3 voz, 4 bispo, 5 fim
    const car = { x: 270, y: 545, arr: false, dx: 0, dy: 0 };
    let garagemFechada = 0; // 0..1 porta descendo
    let portao = 0; // 0 fechado .. 1 aberto
    let arrPortao = null;
    let rangeu = false;
    let bispoX = W + 60;

    const avanca = () => { etapa++; et = 0; };

    return {
      update(dt) {
        t += dt; et += dt;
        if (etapa === 1 && car.x !== null) {
          // carro entra na garagem
          car.y += (360 - car.y) * Math.min(1, dt * 6);
          car.x += (GARAGEM.x + GARAGEM.w / 2 - car.x) * Math.min(1, dt * 6);
          garagemFechada = Math.min(1, garagemFechada + dt * 1.2);
        }
        if (etapa === 3 && et > 2.4) avanca();
        if (etapa === 4) {
          bispoX = Math.max(285, bispoX - dt * 160);
          if (et > 3.2) {
            avanca();
            const est = t < 22 ? 3 : t < 35 ? 2 : 1;
            api.fim(est);
          }
        }
      },
      draw(ctx) {
        casaFachada(ctx, CHAO);
        // garagem
        ctx.fillStyle = '#9aa0a8'; ctx.fillRect(GARAGEM.x, GARAGEM.y, GARAGEM.w, GARAGEM.h);
        if (etapa === 0) {
          ctx.setLineDash([8, 6]); ctx.strokeStyle = '#2e9e52'; ctx.lineWidth = 3;
          ctx.strokeRect(GARAGEM.x + 4, GARAGEM.y + 4, GARAGEM.w - 8, GARAGEM.h - 8); ctx.setLineDash([]);
          texto(ctx, 'Garagem', GARAGEM.x + GARAGEM.w / 2, GARAGEM.y + 30, { tam: 15, peso: 900, cor: '#fff', contorno: 4 });
        }
        if (etapa >= 1 && car.y < 420) carroPequeno(ctx, car.x, car.y + 60);
        // porta de enrolar
        const ph = GARAGEM.h * (etapa >= 1 ? garagemFechada : 0);
        ctx.fillStyle = '#e1e3e6'; ctx.fillRect(GARAGEM.x, GARAGEM.y, GARAGEM.w, ph);
        ctx.strokeStyle = '#b5b8bd'; ctx.lineWidth = 2;
        for (let y = GARAGEM.y + 8; y < GARAGEM.y + ph; y += 10) { ctx.beginPath(); ctx.moveTo(GARAGEM.x, y); ctx.lineTo(GARAGEM.x + GARAGEM.w, y); ctx.stroke(); }
        ctx.strokeStyle = COR.linha; ctx.lineWidth = 3; ctx.strokeRect(GARAGEM.x, GARAGEM.y, GARAGEM.w, GARAGEM.h);

        // portão de grade
        const px = 210 - portao * 90;
        ctx.fillStyle = '#ece6da'; ctx.fillRect(205, 300, 125, CHAO - 300);
        ctx.strokeStyle = COR.linha; ctx.lineWidth = 3; ctx.strokeRect(205, 300, 125, CHAO - 300);
        ctx.save();
        ctx.beginPath(); ctx.rect(120, 290, 215, CHAO - 285); ctx.clip();
        ctx.fillStyle = '#2b2d42';
        for (let i = 0; i < 9; i++) ctx.fillRect(px + 6 + i * 13, 304, 5, CHAO - 306);
        ctx.fillRect(px, 304, 122, 6); ctx.fillRect(px, CHAO - 10, 122, 6);
        ctx.restore();

        // luz do céu
        if (etapa >= 3) {
          ctx.save();
          ctx.globalAlpha = 0.45 + Math.sin(t * 6) * 0.1;
          const g = ctx.createLinearGradient(0, 0, 0, 560);
          g.addColorStop(0, '#fff7c2'); g.addColorStop(1, 'rgba(255,247,194,0)');
          ctx.fillStyle = g;
          for (let i = 0; i < 5; i++) {
            ctx.beginPath(); ctx.moveTo(150 + i * 20, 0); ctx.lineTo(i * 90 - 40, 560); ctx.lineTo(i * 90 + 10, 560); ctx.closePath(); ctx.fill();
          }
          ctx.restore();
        }

        // Tiago e mochila
        if (etapa >= 1) {
          pessoa(ctx, 170, 552, PERS.tiago, {
            humor: etapa === 3 ? 'uau' : etapa >= 4 ? 'riso' : 'sorri',
            braco: etapa >= 4 ? 'cima' : 'lados',
          });
          if (etapa === 1) mochila(ctx, 245, 552);
          else mochila(ctx, 142, 500);
        }
        if (etapa === 0) carroPequeno(ctx, car.x, car.y);
        if (etapa >= 4) pessoa(ctx, bispoX, 552, PERS.bispo, { braco: 'tchau' });

        // dicas e falas
        const pul = 1 + Math.sin(t * 6) * 0.08;
        if (etapa === 0) {
          texto(ctx, '⬅ arraste', car.x, car.y - 78, { tam: 18 * pul, peso: 900, cor: '#fff', contorno: 5 });
        } else if (etapa === 1 && garagemFechada >= 1) {
          texto(ctx, '👆', 245, 505 + Math.sin(t * 6) * 4, { tam: 26 });
        } else if (etapa === 2) {
          texto(ctx, '⬅ arraste o portão', 268, 286, { tam: 15, peso: 900, cor: '#fff', contorno: 5 });
        }
        if (etapa === 2 && portao > 0.25) balao(ctx, 'NHÉÉÉC...', 300, 250, { grito: true, tam: 14, larg: 100 });
        if (etapa === 3) balao(ctx, 'É AQUI QUE É O ALMOÇO?', W / 2, 150, { grito: true, tam: 18, larg: 200 });
        if (etapa >= 4 && et > 0.8) {
          balao(ctx, 'Dom Cleocir! Que bom que o senhor está aqui!', 150, 330, { larg: 210, tam: 15, cauda: { x: 170, y: 420 } });
        }
      },
      down(p) {
        if (etapa === 0 && Math.abs(p.x - car.x) < 60 && Math.abs(p.y - (car.y - 25)) < 45) {
          car.arr = true; car.dx = p.x - car.x; car.dy = p.y - car.y;
        } else if (etapa === 1 && garagemFechada >= 1 && Math.abs(p.x - 245) < 40 && Math.abs(p.y - 535) < 40) {
          api.sfx.certo(); avanca();
        } else if (etapa === 2 && dentro(p, { x: 120, y: 280, w: 230, h: 170 })) {
          arrPortao = p.x + portao * 90;
        }
      },
      move(p) {
        if (car.arr) { car.x = p.x - car.dx; car.y = Math.max(380, p.y - car.dy); }
        if (arrPortao !== null) {
          portao = Math.max(0, Math.min(1, (arrPortao - p.x) / 90));
          if (portao > 0.3 && !rangeu) { rangeu = true; api.sfx.portao(); }
        }
      },
      up() {
        if (car.arr) {
          car.arr = false;
          if (dentro({ x: car.x, y: car.y - 30 }, { x: GARAGEM.x - 20, y: GARAGEM.y - 20, w: GARAGEM.w + 40, h: GARAGEM.h + 70 })) {
            api.sfx.certo(); avanca();
          } else { car.x = 270; car.y = 545; api.sfx.errado(); }
        }
        if (arrPortao !== null) {
          arrPortao = null;
          if (portao > 0.75) { portao = 1; avanca(); api.sfx.ceu(); }
          else portao = 0;
        }
      },
    };
  },
};
