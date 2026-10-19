/* UIUX-0.9.3 — Configurações como diálogo modal, incluindo Acessibilidade. */
(() => {
  'use strict';
  const panel = document.getElementById('settingsPanel');
  const closeButton = document.getElementById('settingsClose');
  const triggers = [document.getElementById('homeSettingsBtn'), document.getElementById('editorSettingsBtn')].filter(Boolean);
  if (!panel || !closeButton || !triggers.length) return;
  let activeTrigger = null;
  function updateExpanded(isOpen) {
    triggers.forEach(button => button.setAttribute('aria-expanded', String(isOpen && button === activeTrigger)));
  }
  function close() { if (panel.open) panel.close(); }
  function open(trigger) {
    if (panel.open) { close(); return; }
    activeTrigger = trigger;
    panel.hidden = false;
    panel.showModal(); // foco limitado ao diálogo, fundo inerte e Escape nativo
    updateExpanded(true);
    closeButton.focus({preventScroll:true});
  }
  triggers.forEach(button => button.addEventListener('click', () => open(button)));
  closeButton.addEventListener('click', close);
  panel.addEventListener('close', () => {
    panel.hidden = true;
    updateExpanded(false);
    if (activeTrigger && activeTrigger.isConnected && !activeTrigger.closest('.hidden')) activeTrigger.focus({preventScroll:true});
    activeTrigger = null;
  });
  panel.addEventListener('click', event => {
    if (event.target !== panel) return;
    const rect = panel.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
})();
