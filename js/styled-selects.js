/* UIUX-0.9.2.4 — Seletores visuais acessíveis, mantendo o <select> como fonte de dados. */
(() => {
  'use strict';
  const selectors = ['areaType', 'areaSelect', 'doorConnection'];
  let opened = null;
  const cssEscape = value => String(value).replace(/[^a-zA-Z0-9_-]/g, '_');

  function close(restoreFocus = false) {
    if (!opened) return;
    const previous = opened;
    opened = null;
    previous.popup.remove();
    previous.button.setAttribute('aria-expanded', 'false');
    previous.button.removeAttribute('aria-activedescendant');
    if (restoreFocus) previous.button.focus({preventScroll: true});
  }

  function enhance(select) {
    if (!select || select.dataset.mrlEnhanced === 'true') return;
    const name = select.getAttribute('aria-label') || select.id;
    const container = document.createElement('span');
    container.className = 'mrl-select';
    const button = document.createElement('button');
    button.id = 'mrl-trigger-' + cssEscape(select.id);
    button.type = 'button';
    button.className = 'mrl-select-trigger';
    button.setAttribute('role', 'combobox');
    button.setAttribute('aria-label', name);
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'mrl-list-' + cssEscape(select.id));
    const title = document.createElement('span');
    title.className = 'mrl-select-title';
    title.setAttribute('aria-hidden', 'true');
    const chevron = document.createElement('span');
    chevron.className = 'mrl-select-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    button.append(title, chevron);
    select.before(container);
    container.append(select, button);
    select.classList.add('mrl-select-native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    select.dataset.mrlEnhanced = 'true';
    const label = select.closest('label');
    if (label?.htmlFor === select.id) label.htmlFor = button.id;
    let entries = [];
    let highlighted = 0;
    let popup = null;
    let searchText = '';
    let searchAt = 0;

    function getEntries() {
      return [...select.options].filter(option => !option.hidden).map(option => ({
        label: option.label || option.textContent.trim(),
        value: option.value,
        disabled: option.disabled,
        selected: option.selected
      }));
    }

    function sync() {
      entries = getEntries();
      const option = [...select.options].find(item => item.selected);
      title.textContent = option ? (option.label || option.textContent.trim()) : 'Selecionar…';
      button.disabled = select.disabled || entries.filter(e => !e.disabled).length === 0;
      if (opened?.select === select) renderOptions();
    }

    function position() {
      if (!popup) return;
      const rect = button.getBoundingClientRect();
      const availableBelow = window.innerHeight - rect.bottom - 12;
      const availableAbove = rect.top - 12;
      const height = Math.min(320, Math.max(120, entries.length * 50 + 12));
      const above = availableBelow < Math.min(height, 180) && availableAbove > availableBelow;
      popup.style.width = Math.max(180, Math.min(rect.width + 16, window.innerWidth - 20)) + 'px';
      popup.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - popup.offsetWidth - 10)) + 'px';
      popup.style.maxHeight = Math.max(85, Math.min(height, above ? availableAbove : availableBelow)) + 'px';
      popup.style.top = above ? Math.max(8, rect.top - popup.offsetHeight - 6) + 'px' : rect.bottom + 6 + 'px';
    }

    function highlight(index) {
      if (!popup || !entries.length) return;
      const length = entries.length;
      for (let n = 0; n < length; n++) {
        const i = (index + n + length) % length;
        if (!entries[i].disabled) { highlighted = i; break; }
      }
      popup.querySelectorAll('[role="option"]').forEach((item, i) => {
        item.classList.toggle('mrl-select-highlight', highlighted === i);
        if (highlighted === i) {
          button.setAttribute('aria-activedescendant', item.id);
          item.scrollIntoView({block:'nearest'});
        }
      });
    }

    function choose(index) {
      const entry = entries[index];
      if (!entry || entry.disabled) return;
      const changed = select.value !== entry.value;
      select.value = entry.value;
      close(true);
      sync();
      if (changed) select.dispatchEvent(new Event('change', {bubbles:true}));
    }

    function renderOptions() {
      if (!popup) return;
      popup.replaceChildren();
      entries.forEach((entry, i) => {
        const option = document.createElement('div');
        option.id = popup.id + '-opt-' + i;
        option.className = 'mrl-select-option';
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', String(entry.selected));
        if (entry.disabled) option.setAttribute('aria-disabled', 'true');
        option.textContent = entry.label;
        option.addEventListener('pointerdown', event => event.preventDefault());
        option.addEventListener('click', () => choose(i));
        option.addEventListener('pointerenter', () => { if (!entry.disabled) highlight(i); });
        popup.append(option);
      });
      const selected = entries.findIndex(e => e.selected && !e.disabled);
      highlight(selected < 0 ? 0 : selected);
      position();
    }

    function open() {
      if (button.disabled) return;
      if (opened?.select === select) {close(true); return;}
      close();
      sync();
      popup = document.createElement('div');
      popup.id = 'mrl-list-' + cssEscape(select.id);
      popup.className = 'mrl-select-listbox';
      popup.setAttribute('role', 'listbox');
      popup.setAttribute('aria-label', name);
      document.body.append(popup);
      opened = {select, button, popup};
      button.setAttribute('aria-expanded', 'true');
      renderOptions();
    }

    button.addEventListener('click', () => open());
    button.addEventListener('keydown', event => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        if (!opened || opened.select !== select) {
          open();
          if (event.key === 'Enter' || event.key === ' ') return;
        } else if (event.key === 'Enter' || event.key === ' ') {
          choose(highlighted); return;
        }
        if (event.key === 'ArrowDown') highlight(highlighted + 1);
        else if (event.key === 'ArrowUp') highlight(highlighted - 1);
        else if (event.key === 'Home') highlight(0);
        else if (event.key === 'End') highlight(entries.length - 1);
      } else if (event.key === 'Escape' && opened?.select === select) {
        event.preventDefault(); close(true);
      } else if (event.key === 'Tab') close();
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const now = Date.now();
        searchText = now - searchAt < 700 ? searchText + event.key.toLocaleLowerCase() : event.key.toLocaleLowerCase();
        searchAt = now;
        const i = entries.findIndex(e => !e.disabled && e.label.toLocaleLowerCase().startsWith(searchText));
        if (i >= 0) {if (!opened || opened.select !== select) open(); highlight(i);}
      }
    });
    select.addEventListener('change', sync);
    select.addEventListener('input', sync);
    new MutationObserver(sync).observe(select, {childList:true, subtree:true, attributes:true, characterData:true});
    sync();
  }

  document.addEventListener('pointerdown', event => {
    if (opened && !opened.button.contains(event.target) && !opened.popup.contains(event.target)) close();
  }, true);
  window.addEventListener('resize', () => {if (opened) close();});
  document.addEventListener('scroll', event => {if (opened && !opened.popup.contains(event.target)) close();}, true);
  document.addEventListener('keydown', event => {if (event.key === 'Escape' && opened) close(true);}, true);
  selectors.forEach(id => enhance(document.getElementById(id)));
})();
