import { W, dentro } from '../engine.js';
import { PERS, pessoa, balao, casaFachada, botaoCanvas, rr, preencher, COR } from '../draw.js';

const PERGUNTAS = [
  {
    q: 'Vocês são os Denardi?',
    ops: [
      { t: 'Não! Os Denardi moram aqui pra CIMA!', certo: true },
      { t: 'Sim! Pode entrar, a comida tá pronta!', r: 'Que maravilha! (Lá na cozinha, a Dona Elir quase desmaiou...) Hmm, tem certeza, filho?' },
      { t: 'Denardi? Nunca ouvi falar!', r: 'Mas me disseram que era nessa rua... Pensa bem, meu filho!' },
    ],
  },
  {
    q: 'E como eu chego lá?',
    ops: [
      { t: 'Eu conto! Mas antes o senhor sobe pra dar um oi pras meninas!', certo: true },
      { t: 'Pega o GPS, bispo!', r: 'GPS? Eu me guio pelo céu, meu filho!' },
      { t: 'É só seguir o cheiro do galeto!', r: 'Galeto? Aqui também tem galeto? 😋' },
    ],
  },
];

function embaralhar(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

export default {
  titulo: 'Vocês são os Denardi?',
  legenda: 'O bispo procurava o almoço na casa dos Denardi... que moram logo ali pra cima!',
  dica: 'Escolha o que o Tiago responde. Resposta errada vira piada — tente de novo!',
  criar(api) {
    let qi = 0, erros = 0, estado = 'pergunta', et = 0, fala = null, reacao = null, apertado = -1;
    let ops = embaralhar(PERGUNTAS[0].ops);
    const botoes = [0, 1, 2].map((i) => ({ x: 14, y: 366 + i * 62, w: W - 28, h: 54 }));

    return {
      teste: () => ({ estado, certo: ops.findIndex((o) => o.certo) }),
      update(dt) {
        et += dt;
        if (estado === 'certo' && et > 2.4) {
          qi++;
          if (qi >= PERGUNTAS.length) {
            estado = 'fim';
            api.fim(erros === 0 ? 3 : erros <= 2 ? 2 : 1);
          } else { estado = 'pergunta'; ops = embaralhar(PERGUNTAS[qi].ops); fala = null; }
          et = 0;
        }
        if (estado === 'errado' && et > 3.2) { estado = 'pergunta'; fala = null; reacao = null; et = 0; }
      },
      draw(ctx) {
        casaFachada(ctx, 340);
        ctx.fillStyle = '#ece6da'; ctx.fillRect(200, 230, 110, 110);
        ctx.strokeStyle = COR.linha; ctx.lineWidth = 3; ctx.strokeRect(200, 230, 110, 110);
        pessoa(ctx, 110, 352, PERS.tiago, {
          s: 0.95,
          humor: estado === 'errado' ? 'uau' : 'sorri',
          braco: estado === 'certo' && qi === 1 ? 'cima' : 'lados',
        });
        pessoa(ctx, 250, 352, PERS.bispo, { s: 0.95, humor: estado === 'errado' ? 'riso' : 'sorri', virar: true });

        if (estado === 'pergunta') {
          balao(ctx, PERGUNTAS[qi].q, 250, 150, { tam: 17, larg: 200, cauda: { x: 250, y: 216 } });
        } else if (fala) {
          balao(ctx, fala, 120, 140, { tam: 14, larg: 200, cauda: { x: 110, y: 218 } });
          if (reacao && et > 1.1) balao(ctx, reacao, 240, 300, { tam: 13, larg: 210, cor: '#fffbe6' });
        }

        if (estado === 'pergunta') {
          ops.forEach((o, i) => botaoCanvas(ctx, botoes[i], o.t, { tam: o.t.length > 40 ? 13 : 15, apertado: apertado === i }));
        } else {
          rr(ctx, 14, 366, W - 28, 178, 14); preencher(ctx, 'rgba(255,255,255,.6)', 0);
        }
      },
      down(p) {
        if (estado !== 'pergunta') return;
        botoes.forEach((b, i) => { if (dentro(p, b)) apertado = i; });
      },
      up(p) {
        if (estado !== 'pergunta' || apertado < 0) { apertado = -1; return; }
        const i = apertado; apertado = -1;
        if (!dentro(p, botoes[i])) return;
        const o = ops[i];
        fala = o.t; et = 0;
        if (o.certo) { estado = 'certo'; reacao = null; api.sfx.certo(); }
        else { estado = 'errado'; reacao = o.r; erros++; api.sfx.errado(); }
      },
    };
  },
};
