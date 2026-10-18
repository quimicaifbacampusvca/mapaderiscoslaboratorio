/* UIUX-0.8.2 — instalação opcional e atualização de versão controlada. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const controls = $('pwaControls');
  if (!controls) return;
  const installButton = $('pwaInstall');
  const updateButton = $('pwaUpdate');
  const offlineStatus = $('pwaOfflineStatus');
  let installPrompt = null;
  let registration = null;
  let userRequestedUpdate = false;
  let lastUpdateCheck = 0;

  function refresh() {
    offlineStatus.hidden = navigator.onLine !== false;
    installButton.hidden = !installPrompt;
    updateButton.hidden = !(registration && registration.waiting);
    controls.hidden = offlineStatus.hidden && installButton.hidden && updateButton.hidden;
  }

  window.addEventListener('online', () => { refresh(); checkForUpdates(); });
  window.addEventListener('offline', refresh);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdates();
  });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    refresh();
  });
  window.addEventListener('appinstalled', () => { installPrompt = null; refresh(); });

  installButton.addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    refresh();
    try { await prompt.prompt(); await prompt.userChoice; } catch (_) { /* instalação opcional */ }
    refresh();
  });

  updateButton.addEventListener('click', () => {
    if (!registration?.waiting) return;
    userRequestedUpdate = true;
    updateButton.disabled = true;
    updateButton.textContent = 'Atualizando…';
    registration.waiting.postMessage({type:'SKIP_WAITING'});
  });

  function watchInstalling(worker) {
    if (!worker) return;
    worker.addEventListener('statechange', () => {
      // installed sem controller significa primeira instalação, não atualização.
      if (worker.state === 'installed') refresh();
    });
  }

  async function checkForUpdates() {
    if (!registration || navigator.onLine === false) return;
    if (Date.now() - lastUpdateCheck < 15 * 60 * 1000) return;
    lastUpdateCheck = Date.now();
    try { await registration.update(); } catch (_) { /* offline/erro transitório */ }
    refresh();
  }

  if (!('serviceWorker' in navigator) || !window.isSecureContext ||
      !/^https?:$/.test(location.protocol)) {
    refresh();
    return;
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Recarregar somente após o clique explícito para atualizar.
    if (userRequestedUpdate) location.reload();
  });

  navigator.serviceWorker.register('./sw.js', {scope:'./', updateViaCache:'none'})
    .then(reg => {
      registration = reg;
      watchInstalling(reg.installing);
      reg.addEventListener('updatefound', () => {
        watchInstalling(reg.installing);
        refresh();
      });
      refresh();
      checkForUpdates();
    }).catch(() => { /* Editor continua funcionando mesmo sem SW. */ });
  refresh();
})();
