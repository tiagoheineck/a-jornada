// Service worker: guarda os arquivos para o jogo funcionar offline.
// O workflow de deploy troca __VERSAO__ pelo hash do commit, renovando o cache a cada publicação.
const CACHE = 'a-jornada-__VERSAO__';
const ARQUIVOS = [
  './',
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/main.js',
  'js/engine.js',
  'js/draw.js',
  'js/audio.js',
  'js/save.js',
  'js/fases/f1-cafe.js',
  'js/fases/f2-sinal.js',
  'js/fases/f3-transito.js',
  'js/fases/f4-portao.js',
  'js/fases/f5-denardi.js',
  'js/fases/f6-meninas.js',
  'js/fases/f7-cozinha.js',
  'js/fases/f8-foto.js',
  'js/fases/f9-esquerda.js',
  'assets/icon.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Rede primeiro (pega atualizações), cache como reserva quando estiver offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copia = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
