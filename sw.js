/* UIUX-0.8.2 — Offline app shell, cache versionado e atualização explícita. */
'use strict';
const CACHE_PREFIX = 'mapa-riscos-shell-';
const CACHE_NAME = CACHE_PREFIX + 'uiux-0.8.3-v1';
// Apenas o shell local: nunca armazenar projetos, JSON do usuário ou APIs remotas.
const SHELL_PATHS = [
  './', './index.html', './manifest.webmanifest',
  './css/mapa.css', './css/identidade-alerta-precisao.css',
  './js/types.js', './js/geometry.js', './js/validation.js',
  './js/metric-ruler.js', './js/mapa.js', './js/pwa.js',
  './js/project-library.js', './js/library-ui.js',
  './assets/svg/mrl-symbol.svg', './assets/svg/mrl-app-icon.svg',
  './assets/svg/risk-biological.svg', './assets/svg/risk-chemical.svg',
  './assets/svg/risk-electrical.svg', './assets/svg/risk-ergonomic.svg',
  './assets/svg/risk-fire.svg', './assets/svg/risk-physical.svg',
  './assets/svg/risk-radiation.svg', './assets/svg/risk-slip.svg',
  './assets/svg/equipment-extinguisher.svg',
  './assets/svg/equipment-eyewash.svg', './assets/svg/equipment-shower.svg',
  './assets/icons/icon-180.png', './assets/icons/icon-192.png',
  './assets/icons/icon-512.png', './assets/icons/icon-maskable-192.png',
  './assets/icons/icon-maskable-512.png'
];
const assetURLs = SHELL_PATHS.map(path => new URL(path, self.registration.scope).href);
const allowedURLs = new Set(assetURLs);
const homeURL = new URL('./', self.registration.scope).href;
const indexURL = new URL('./index.html', self.registration.scope).href;

self.addEventListener('install', event => {
  // install falha se QUALQUER arquivo obrigatório faltar, mantendo SW anterior.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll(assetURLs);
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
    // Sem skipWaiting automático: atualização só após confirmação do usuário.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Redirecionamentos e rotas não pertinentes permanecem fora do cache.
  const isHomeNavigation = request.mode === 'navigate' &&
    (url.pathname === new URL(homeURL).pathname || url.pathname === new URL(indexURL).pathname);
  const canonicalURL = url.origin + url.pathname;
  if (!isHomeNavigation && !allowedURLs.has(canonicalURL)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const lookup = isHomeNavigation ? indexURL : canonicalURL;
    const cached = await cache.match(lookup);
    if (cached) return cached;
    // Se cache foi esvaziado pelo navegador, tentar rede; NÃO gravar em cache
    // uma versão parcial do shell (atualizações são feitas na instalação).
    return fetch(request);
  })());
});
