// Progresso salvo no localStorage, com tolerância a navegadores sem armazenamento.
const CHAVE = 'a-jornada-v1';
const PADRAO = { liberada: 1, estrelas: [], melhorTempo: null, zerou: false };
let memoria = { ...PADRAO };

export function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) memoria = { ...PADRAO, ...JSON.parse(bruto) };
  } catch (_) { /* usa memória */ }
  return memoria;
}

export function salvar(dados) {
  memoria = { ...memoria, ...dados };
  try { localStorage.setItem(CHAVE, JSON.stringify(memoria)); } catch (_) { /* segue sem salvar */ }
  return memoria;
}

export function registrarFase(n, estrelas, total) {
  const est = memoria.estrelas.slice();
  est[n - 1] = Math.max(est[n - 1] || 0, estrelas);
  return salvar({ estrelas: est, liberada: Math.min(total, Math.max(memoria.liberada, n + 1)) });
}
