/* UIUX-0.9.3 — Preferências visuais inspiradas no SIAB 1.0.0. */
(() => {
  'use strict';
  const KEY = 'mrl_accessibility_preferences_v1';
  const root = document.documentElement;
  const el = id => document.getElementById(id);
  const validCvd = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'acromatopsia'];
  const systemMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const defaults = () => ({dark: true, contrast: false, font: 100, spacing: false, motion: !!systemMotion,
    intro: true, reading: false, cvd: 'none'});
  function clean(raw) {
    const base = defaults();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
    for (const k of ['dark', 'contrast', 'spacing', 'motion', 'intro', 'reading']) {
      if (typeof raw[k] === 'boolean') base[k] = raw[k];
    }
    if (Number.isInteger(raw.font) && raw.font >= 80 && raw.font <= 200 && raw.font % 10 === 0) base.font = raw.font;
    if (validCvd.includes(raw.cvd)) base.cvd = raw.cvd;
    return base;
  }
  let state = defaults();
  let storageAvailable = true;
  try { state = clean(JSON.parse(localStorage.getItem(KEY) || 'null')); }
  catch (_) { storageAvailable = false; }
  const ids = {dark:'mrlA11yDark',contrast:'mrlA11yContrast',spacing:'mrlA11ySpacing',motion:'mrlA11yMotion',
    intro:'mrlA11yIntro',reading:'mrlA11yReading',cvd:'mrlA11yCvd'};
  function apply() {
    root.dataset.mrlTheme = state.dark ? 'dark' : 'light';
    root.dataset.mrlContrast = state.contrast ? 'on' : 'off';
    root.dataset.mrlSpacing = state.spacing ? 'on' : 'off';
    root.dataset.mrlMotion = state.motion ? 'reduced' : 'normal';
    root.dataset.mrlIntro = state.intro ? 'on' : 'off';
    root.dataset.mrlReading = state.reading ? 'on' : 'off';
    root.dataset.mrlCvd = state.cvd;
    root.style.setProperty('--mrl-font-scale', String(state.font / 100));
    for (const [key,id] of Object.entries(ids)) {
      const control = el(id);
      if (control) control[key === 'cvd' ? 'value' : 'checked'] = state[key];
    }
    if (el('mrlFontOutput')) el('mrlFontOutput').textContent = `${state.font}%`;
    if (el('mrlFontMinus')) el('mrlFontMinus').disabled = state.font <= 80;
    if (el('mrlFontPlus')) el('mrlFontPlus').disabled = state.font >= 200;
    const overlay = el('mrlCvdOverlay');
    if (overlay) overlay.hidden = state.cvd === 'none';
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageAvailable = true; }
    catch (_) { storageAvailable = false; }
    const status = el('mrlA11yStorageStatus');
    if (status) {
      status.hidden = storageAvailable;
      status.textContent = storageAvailable ? '' : 'As preferências estão ativas nesta sessão, mas não puderam ser salvas no navegador.';
    }
  }
  function change(key,value) { state = clean({...state,[key]:value});apply();persist(); }
  for (const [key,id] of Object.entries(ids)) {
    const control = el(id);
    if (!control) continue;
    control.addEventListener('change', () => change(key, key === 'cvd' ? control.value : control.checked));
  }
  el('mrlFontMinus')?.addEventListener('click', () => change('font',Math.max(80,state.font-10)));
  el('mrlFontPlus')?.addEventListener('click', () => change('font',Math.min(200,state.font+10)));
  el('mrlA11yReset')?.addEventListener('click', () => { state = defaults();apply();persist();el('mrlA11ySummary')?.focus(); });
  const vlibras = el('mrlEnableVlibras');
  const vlibrasStatus = el('mrlVlibrasStatus');
  let vlibrasLoading = false;
  vlibras?.addEventListener('click', () => {
    if (vlibrasLoading) return;
    if (navigator.onLine === false) {
      vlibrasStatus.textContent = 'Sem conexão: o VLibras requer internet. O editor continua disponível offline.';
      return;
    }
    vlibrasLoading = true;
    vlibras.disabled = true;
    vlibrasStatus.textContent = 'Carregando o recurso externo VLibras…';
    const container = document.createElement('div');
    container.setAttribute('vw','');
    container.className = 'enabled';
    container.innerHTML = '<div vw-access-button class="active" aria-label="Abrir VLibras"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    document.body.append(container);
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      try {
        if (!window.VLibras?.Widget) throw Error('API ausente');
        new window.VLibras.Widget('https://vlibras.gov.br/app');
        vlibrasStatus.textContent = 'VLibras ativado. Recurso externo opcional.';
      } catch (_) {
        vlibrasStatus.textContent = 'O VLibras não pôde iniciar. O editor continua funcionando.';
        vlibras.disabled = false; vlibrasLoading = false; container.remove();
      }
    };
    script.onerror = () => {
      vlibrasStatus.textContent = 'Não foi possível acessar o VLibras. Verifique a conexão.';
      vlibras.disabled = false; vlibrasLoading = false; container.remove();script.remove();
    };
    document.head.append(script);
  });
  apply();
  if (!storageAvailable) persist();
  // API somente de leitura para testes/consulta; não modifica projetos nem Canvas.
  window.MRLAccessibility = Object.freeze({getPreferences: () => ({...state}), reset: () => {state=defaults();apply();persist();}});
})();
