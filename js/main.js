import { criarMotor, W, H } from './engine.js';
import { pessoa, PERS, estrelas as htmlEstrelas } from './draw.js';
import * as audio from './audio.js';
import * as save from './save.js';

import f1 from './fases/f1-cafe.js';
import f2 from './fases/f2-sinal.js';
import f3 from './fases/f3-transito.js';
import f4 from './fases/f4-portao.js';
import f5 from './fases/f5-denardi.js';
import f6 from './fases/f6-meninas.js';
import f7 from './fases/f7-cozinha.js';
import f8 from './fases/f8-foto.js';
import f9 from './fases/f9-esquerda.js';

const FASES = [f1, f2, f3, f4, f5, f6, f7, f8, f9];
const LIMITE_HISTORIA = 240; // "4 minutos cravados"

const $ = (s) => document.querySelector(s);
const camada = $('#camada');
const hud = $('#hud');
const legenda = $('#legenda');
const motor = criarMotor($('#tela'));

let dados = save.carregar();
let corrida = null; // { tempo, sequencial, estrelas[] }
let faseAtual = 0;
let jogando = false;
let instanciaAtual = null;

// ---------- utilidades de interface ----------
function tela(html, classe = '') {
  camada.innerHTML = `<div class="tela ${classe}">${html}</div>`;
  return camada.firstElementChild;
}
function limparTela() { camada.innerHTML = ''; }
function ao(el, sel, fn) {
  el.querySelector(sel).addEventListener('click', (e) => {
    e.preventDefault();
    audio.destravar();
    audio.sfx.toque();
    fn();
  });
}
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function mostrarLegenda(t) {
  if (!t) { legenda.hidden = true; return; }
  legenda.textContent = t;
  legenda.hidden = false;
}

function atualizarSom() { $('#btn-som').textContent = audio.estaMudo() ? '🔇' : '🔊'; }
atualizarSom();

// ---------- cena de fundo para capa e fim ----------
function cenaFamilia(c1, c2) {
  let giro = 0;
  return {
    update(dt) { giro += dt * 0.05; },
    draw(ctx) {
      ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = c2;
      for (let i = 0; i < 18; i++) {
        const a = giro + (i / 18) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(W / 2, 250);
        ctx.arc(W / 2, 250, 900, a, a + Math.PI / 18); ctx.closePath(); ctx.fill();
      }
      const y = H - 48;
      pessoa(ctx, 70, y - 10, PERS.tiago, { braco: 'cima', s: 1.05 });
      pessoa(ctx, 180, y - 14, PERS.bispo, { braco: 'tchau', s: 1.05 });
      pessoa(ctx, 290, y - 10, PERS.elir, { s: 1.0 });
      pessoa(ctx, 115, y + 30, PERS.tina, { s: 1.05 });
      pessoa(ctx, 180, y + 34, PERS.duda, { s: 1.05, humor: 'riso' });
      pessoa(ctx, 245, y + 30, PERS.amanda, { s: 1.05 });
    },
  };
}

// ---------- capa ----------
function capa() {
  jogando = false;
  hud.hidden = true;
  mostrarLegenda('');
  motor.pausar(false);
  motor.definirCena(cenaFamilia('#ffb347', '#ffcf6b'));
  dados = save.carregar();
  const el = tela(`
    <div style="flex:1"></div>
    <h1 class="titulo-capa"><small>A JORNADA</small>O dia em que o bispo veio almoçar!</h1>
    <p class="sub-capa">uma história do Tiago, em 9 fases</p>
    <div class="botoes">
      <button class="btn" id="b-jogar">▶ Jogar</button>
      ${dados.liberada > 1 ? '<button class="btn sec" id="b-fases">Escolher fase</button>' : ''}
    </div>
    ${dados.melhorTempo ? `<p class="sub-capa">Melhor tempo: ${fmt(dados.melhorTempo)}</p>` : ''}
    <div style="flex:2.2"></div>
  `);
  ao(el, '#b-jogar', () => { corrida = { tempo: 0, sequencial: true, estrelas: [] }; intro(1); });
  if (dados.liberada > 1) ao(el, '#b-fases', escolherFase);
}

function escolherFase() {
  dados = save.carregar();
  const botoes = FASES.map((f, i) => {
    const n = i + 1;
    const ok = n <= dados.liberada;
    const e = dados.estrelas[i] || 0;
    return `<button data-n="${n}" ${ok ? '' : 'disabled'} aria-label="Fase ${n}: ${f.titulo}">
      ${ok ? n : '🔒'}<small>${ok ? '⭐'.repeat(e) || '—' : ''}</small></button>`;
  }).join('');
  const el = tela(`
    <div class="cartao">
      <h2>Escolha a fase</h2>
      <div class="grade-fases" style="margin-top:12px">${botoes}</div>
    </div>
    <button class="btn sec" id="b-voltar">Voltar</button>
  `, 'sol');
  el.querySelectorAll('.grade-fases button:not([disabled])').forEach((b) =>
    b.addEventListener('click', () => {
      audio.destravar(); audio.sfx.toque();
      corrida = { tempo: 0, sequencial: false, estrelas: [] };
      intro(Number(b.dataset.n));
    }));
  ao(el, '#b-voltar', capa);
}

// ---------- fases ----------
function intro(n) {
  faseAtual = n;
  const def = FASES[n - 1];
  jogando = false;
  let instancia = null;
  const api = {
    fim: (estrelas) => terminouFase(n, estrelas),
    legenda: mostrarLegenda,
    sfx: audio.sfx,
  };
  instancia = def.criar(api);
  instanciaAtual = instancia;
  motor.definirCena({
    update(dt) {
      if (jogando && corrida) corrida.tempo += dt;
      $('#hud-tempo').textContent = fmt(corrida ? corrida.tempo : 0);
      instancia.update && instancia.update(dt);
    },
    draw: (ctx) => instancia.draw(ctx),
    down: (p) => jogando && instancia.down && instancia.down(p),
    move: (p) => jogando && instancia.move && instancia.move(p),
    up: (p) => jogando && instancia.up && instancia.up(p),
  });
  motor.pausar(true);
  hud.hidden = false;
  $('#hud-fase').textContent = `Fase ${n}/9`;
  mostrarLegenda('');
  const el = tela(`
    <div class="cartao">
      <p style="margin:0;color:#1f7a3d">FASE ${n}</p>
      <h2>${def.titulo}</h2>
      <p>“${def.legenda}”</p>
      <p class="dica">👆 ${def.dica}</p>
      <button class="btn" id="b-comecar" style="margin-top:8px">Começar</button>
    </div>
  `, 'escurece');
  ao(el, '#b-comecar', () => {
    limparTela();
    mostrarLegenda(def.legenda);
    jogando = true;
    audio.tocarMusica();
    motor.pausar(false);
  });
}

function terminouFase(n, estrelas) {
  if (!jogando) return;
  jogando = false;
  estrelas = Math.max(1, Math.min(3, Math.round(estrelas)));
  dados = save.registrarFase(n, estrelas, FASES.length);
  if (corrida) corrida.estrelas[n - 1] = estrelas;
  audio.sfx.vitoria();
  setTimeout(() => {
    motor.pausar(true);
    if (n === FASES.length) { telaFim(); return; }
    const el = tela(`
      <div class="cartao">
        <h2>Fase ${n} completa!</h2>
        <div class="estrelas">${htmlEstrelas(estrelas)}</div>
        <div class="botoes">
          <button class="btn" id="b-prox">Próxima fase ▶</button>
          <button class="btn sec" id="b-rep">Repetir</button>
        </div>
      </div>
    `, 'escurece');
    ao(el, '#b-prox', () => intro(n + 1));
    ao(el, '#b-rep', () => intro(n));
  }, 900);
}

function telaFim() {
  hud.hidden = true;
  mostrarLegenda('');
  audio.pararMusica();
  motor.pausar(false);
  motor.definirCena(cenaFamilia('#8e5bb5', '#b06ab3'));
  const tempo = corrida ? corrida.tempo : 0;
  const valeTempo = corrida && corrida.sequencial;
  if (valeTempo && (!dados.melhorTempo || tempo < dados.melhorTempo)) save.salvar({ melhorTempo: tempo });
  dados = save.salvar({ zerou: true });
  const total = dados.estrelas.reduce((a, b) => a + (b || 0), 0);
  const cravados = valeTempo && tempo <= LIMITE_HISTORIA;
  const el = tela(`
    <h1 class="fim-titulo">FIM!</h1>
    <div class="cartao">
      <p>E o almoço era na casa dos Denardi, logo ali pra cima!</p>
      <p>⭐ ${total} de 27 estrelas</p>
      ${valeTempo ? `<p>⏱ Tempo da história: ${fmt(tempo)}</p>` : ''}
      ${cravados ? '<p><span class="selo">4 minutos cravados!</span></p>' : ''}
      <div class="botoes" style="margin-top:10px">
        <button class="btn" id="b-novo">Jogar de novo</button>
        <button class="btn sec" id="b-fases">Escolher fase</button>
        <button class="btn lar" id="b-comp">Compartilhar</button>
      </div>
    </div>
    <div style="flex:1"></div>
  `);
  ao(el, '#b-novo', () => { corrida = { tempo: 0, sequencial: true, estrelas: [] }; intro(1); });
  ao(el, '#b-fases', escolherFase);
  ao(el, '#b-comp', () => compartilhar(total, valeTempo ? fmt(tempo) : null));
}

async function compartilhar(total, tempo) {
  const txt = `Zerei "A Jornada — o dia em que o bispo veio almoçar!" com ${total}/27 estrelas` +
    (tempo ? ` em ${tempo}` : '') + '. Joga aí:';
  const url = location.href.split('#')[0];
  try {
    if (navigator.share) { await navigator.share({ title: 'A Jornada', text: txt, url }); return; }
    await navigator.clipboard.writeText(`${txt} ${url}`);
    alertaCurto('Link copiado!');
  } catch (_) { /* cancelado */ }
}

function alertaCurto(msg) {
  mostrarLegenda(msg);
  setTimeout(() => mostrarLegenda(''), 1800);
}

// ---------- pausa e som ----------
$('#btn-pausa').addEventListener('click', () => {
  if (!jogando) return;
  audio.sfx.toque();
  motor.pausar(true);
  const el = tela(`
    <div class="cartao">
      <h2>Pausa</h2>
      <div class="botoes" style="margin-top:12px">
        <button class="btn" id="b-cont">Continuar</button>
        <button class="btn sec" id="b-rein">Reiniciar fase</button>
        <button class="btn sec" id="b-sair">Sair para a capa</button>
      </div>
    </div>
  `, 'escurece');
  ao(el, '#b-cont', () => { limparTela(); motor.pausar(false); });
  ao(el, '#b-rein', () => intro(faseAtual));
  ao(el, '#b-sair', () => { audio.pararMusica(); capa(); });
});

$('#btn-som').addEventListener('click', () => {
  audio.destravar();
  audio.alternarMudo();
  atualizarSom();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && jogando && !motor.pausado) $('#btn-pausa').click();
});

// ---------- início ----------
motor.iniciar();
capa();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => { /* sem offline */ });
}

// gancho para testes automatizados
window.__aJornada = { intro, telaFim, FASES, fase: () => instanciaAtual };
