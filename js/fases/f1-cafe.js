import { W } from '../engine.js';
import { COR, PERS, pessoa, balao, rr, preencher, circulo, texto, botaoCanvas, salaInterna } from '../draw.js';
import { dentro } from '../engine.js';

const TOTAL = 8;
const DURACAO = 50; // segundos de 11h15 a 11h45

export function relogio(ctx, x, y, r, horas, minutos, legenda = true) {
  circulo(ctx, x, y, r, '#fff', 3);
  ctx.strokeStyle = COR.linha;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8);
    ctx.lineTo(x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92);
    ctx.stroke();
  }
  const am = (minutos / 60) * Math.PI * 2 - Math.PI / 2;
  const ah = ((horas % 12 + minutos / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  ctx.lineCap = 'round';
  ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ah) * r * 0.5, y + Math.sin(ah) * r * 0.5); ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(am) * r * 0.78, y + Math.sin(am) * r * 0.78); ctx.stroke();
  ctx.lineCap = 'butt';
  if (legenda) {
    texto(ctx, `${horas}:${String(Math.floor(minutos)).padStart(2, '0')}`, x, y + r + 14, { tam: 16, peso: 900, cor: '#b5301f' });
  }
}

export default {
  titulo: 'Café especial no IFC',
  legenda: 'Hoje o Tiago levou café especial para os alunos do IFC.',
  dica: 'Segure “Café” para encher a xícara e solte na faixa verde. Toque em “Pão de queijo” quando pedirem.',
  criar(api) {
    const tipos = ['aluno1', 'aluno2', 'aluno3', 'aluno4'];
    const alunos = Array.from({ length: TOTAL }, (_, i) => ({
      p: PERS[tipos[i % 4]],
      pedido: Math.random() < 0.62 ? 'cafe' : 'pao',
      x: -60 - i * 55,
      saindo: false,
      fala: null,
      falaT: 0,
    }));
    const bCafe = { x: 18, y: 488, w: 158, h: 60 };
    const bPao = { x: 184, y: 488, w: 158, h: 60 };
    let t = 0, atual = 0, servidos = 0, perfeitos = 0;
    let enchendo = false, nivel = 0, apertoPao = 0, acabou = false;
    let falaTiago = 'Hoje tem café especial, turma!', falaTiagoT = 3;

    const frente = () => alunos[atual];
    const pronto = () => frente() && !frente().saindo && frente().x >= 105;

    function servir(perfeito, msg) {
      const a = frente();
      servidos++;
      if (perfeito) perfeitos++;
      a.fala = msg; a.falaT = 1.2; a.saindo = true;
      api.sfx.certo();
      atual++;
      nivel = 0;
      if (servidos >= TOTAL) terminar();
    }
    function errar(msg) {
      const a = frente();
      a.fala = msg; a.falaT = 1.4;
      t += 2.5;
      api.sfx.errado();
    }
    function terminar() {
      if (acabou) return;
      acabou = true;
      falaTiago = servidos >= TOTAL ? 'Todo mundo servido! ☕' : 'Opa, já é quase meio-dia!';
      falaTiagoT = 3;
      const est = servidos >= TOTAL ? (perfeitos >= 6 ? 3 : 2) : (servidos >= 5 ? 2 : 1);
      setTimeout(() => api.fim(est), 900);
    }

    return {
      teste: () => ({ pedido: frente() && frente().pedido, pronto: pronto(), nivel }),
      update(dt) {
        if (!acabou) {
          t += dt;
          if (t >= DURACAO) { t = DURACAO; terminar(); }
        }
        if (enchendo) nivel = Math.min(1.25, nivel + dt * 0.62);
        apertoPao = Math.max(0, apertoPao - dt);
        falaTiagoT -= dt;
        alunos.forEach((a, i) => {
          a.falaT -= dt;
          if (a.saindo) { a.x += dt * 260; return; }
          const alvo = 110 - (i - atual) * 58;
          if (a.x < alvo) a.x = Math.min(alvo, a.x + dt * 200);
        });
        if (t > 3 && t < 6 && atual === 0 && !alunos[0].fala) {
          alunos[0].fala = 'E nós trouxemos pão de queijo quentinho!'; alunos[0].falaT = 3;
        }
      },
      draw(ctx) {
        salaInterna(ctx, 400);
        // quadro
        rr(ctx, 16, 66, 220, 104, 8); preencher(ctx, COR.madeiraEsc, 3);
        rr(ctx, 24, 74, 204, 88, 4); preencher(ctx, COR.quadro, 0);
        texto(ctx, 'IFC', 44, 92, { tam: 18, peso: 900, cor: '#fff', alinh: 'left' });
        texto(ctx, 'Aula de hoje:', 126, 118, { tam: 15, cor: '#fff' });
        texto(ctx, 'café especial!', 126, 140, { tam: 16, peso: 900, cor: '#ffe66d' });
        // relógio
        const min = 15 + (t / DURACAO) * 30;
        relogio(ctx, 300, 120, 34, 11, min);

        // Tiago atrás da mesa
        pessoa(ctx, 285, 352, PERS.tiago, { braco: falaTiagoT > 0 ? 'cima' : 'lados' });
        // mesa
        rr(ctx, 14, 300, W - 28, 22, 4); preencher(ctx, COR.madeira, 3);
        ctx.fillStyle = COR.madeiraEsc;
        ctx.fillRect(30, 322, 10, 70); ctx.fillRect(W - 40, 322, 10, 70);
        // garrafa térmica (inclina enquanto serve)
        ctx.save();
        ctx.translate(70, 298);
        if (enchendo) ctx.rotate(0.5);
        rr(ctx, -14, -62, 28, 62, 7); preencher(ctx, '#d94841', 3);
        rr(ctx, -8, -72, 16, 12, 3); preencher(ctx, '#2b2d42', 0);
        ctx.restore();
        if (enchendo) {
          ctx.fillStyle = '#6b3a1e';
          ctx.fillRect(108, 250, 4, 36);
        }
        // xícara medidora
        const cx = 110, cy = 300;
        ctx.fillStyle = '#e9f7ec';
        ctx.fillRect(cx - 20, cy - 52 + (1 - 0.88) * 46, 40, (0.88 - 0.65) * 46);
        const nv = Math.min(1, nivel);
        ctx.fillStyle = nivel > 1 ? '#8a4b23' : '#6b3a1e';
        ctx.fillRect(cx - 18, cy - 6 - nv * 46, 36, nv * 46);
        rr(ctx, cx - 20, cy - 54, 40, 52, 6);
        ctx.lineWidth = 3; ctx.strokeStyle = COR.linha; ctx.stroke();
        ctx.strokeStyle = '#2e9e52'; ctx.lineWidth = 2;
        [0.65, 0.88].forEach((k) => { ctx.beginPath(); ctx.moveTo(cx - 26, cy - 6 - k * 46); ctx.lineTo(cx + 26, cy - 6 - k * 46); ctx.stroke(); });
        if (nivel > 1) texto(ctx, 'Derramou!', cx, cy - 66, { tam: 13, cor: '#b5301f' });
        // xícaras e cesta
        for (let i = 0; i < 4; i++) { rr(ctx, 150 + i * 22, 284, 16, 16, 3); preencher(ctx, '#fff', 2); }
        ctx.beginPath(); ctx.ellipse(225, 296, 30, 10, 0, 0, Math.PI); preencher(ctx, COR.madeira, 2.5);
        for (let i = 0; i < 5; i++) circulo(ctx, 205 + i * 10, 288 - (i % 2) * 5, 6, '#f2c14e', 1.5);

        // alunos
        for (let i = alunos.length - 1; i >= 0; i--) {
          const a = alunos[i];
          if (a.x < -50 || a.x > W + 50) continue;
          pessoa(ctx, a.x, 468, a.p, { humor: a.saindo ? 'riso' : 'sorri' });
        }
        // pedido do aluno da frente
        const f = frente();
        if (f && pronto() && !acabou && !(f.falaT > 0)) {
          balao(ctx, f.pedido === 'cafe' ? 'Um café, prof! ☕' : 'Pão de queijo! 🧀', 110, 352, { larg: 150, tam: 15, cauda: { x: 110, y: 380 } });
        }
        alunos.forEach((a) => {
          if (a.falaT > 0 && a.fala) balao(ctx, a.fala, Math.min(Math.max(a.x, 90), 270), 352, { larg: 170, cauda: { x: a.x, y: 380 } });
        });
        if (falaTiagoT > 0) balao(ctx, falaTiago, 252, 200, { larg: 170, tam: 15, cauda: { x: 280, y: 228 } });

        rr(ctx, 16, 182, 136, 30, 10); preencher(ctx, '#fff', 2.5);
        texto(ctx, `Servidos: ${servidos}/${TOTAL}`, 84, 197, { tam: 15, peso: 900 });

        botaoCanvas(ctx, bCafe, '☕ Café', { apertado: enchendo, cor: '#ffe0b3', tam: 20 });
        botaoCanvas(ctx, bPao, '🧀 Pão de queijo', { apertado: apertoPao > 0, cor: '#fff3b0', tam: 17 });
      },
      down(p) {
        if (acabou) return;
        if (dentro(p, bCafe)) { enchendo = true; nivel = 0; api.sfx.toque(); }
        else if (dentro(p, bPao)) {
          apertoPao = 0.15;
          if (!pronto()) return;
          if (frente().pedido === 'pao') servir(true, 'Quentinho! Valeu, prof!');
          else errar('Eu pedi café!');
        }
      },
      up() {
        if (!enchendo) return;
        enchendo = false;
        if (acabou || !pronto()) { nivel = 0; return; }
        if (frente().pedido !== 'cafe') { errar('Eu queria pão de queijo!'); nivel = 0; return; }
        if (nivel < 0.4) { frente().fala = 'Enche mais, prof!'; frente().falaT = 1.2; api.sfx.errado(); nivel = 0; return; }
        if (nivel >= 0.65 && nivel <= 0.88) servir(true, 'Café perfeito! ☕');
        else if (nivel > 1) servir(false, 'Opa, transbordou!');
        else servir(false, 'Valeu, prof!');
      },
    };
  },
};
