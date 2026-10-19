/* UIUX-0.9.2 — Configurações acessíveis na Home e no editor. */
(() => {
  'use strict';
  const panel=document.getElementById('settingsPanel');
  const closeButton=document.getElementById('settingsClose');
  const triggers=[document.getElementById('homeSettingsBtn'),document.getElementById('editorSettingsBtn')].filter(Boolean);
  if(!panel||!closeButton||!triggers.length)return;
  let activeTrigger=null;
  function close(restoreFocus=true){
    if(panel.hidden)return;
    panel.hidden=true;
    triggers.forEach(button=>button.setAttribute('aria-expanded','false'));
    if(restoreFocus&&activeTrigger&&!activeTrigger.closest('.hidden'))activeTrigger.focus({preventScroll:true});
    activeTrigger=null;
  }
  function open(trigger){
    if(!panel.hidden&&activeTrigger===trigger)return close();
    activeTrigger=trigger;panel.hidden=false;
    triggers.forEach(button=>button.setAttribute('aria-expanded',String(button===trigger)));
    closeButton.focus({preventScroll:true});
  }
  triggers.forEach(button=>button.addEventListener('click',()=>open(button)));
  closeButton.addEventListener('click',()=>close());
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();close();}});
  document.addEventListener('pointerdown',event=>{
    if(!panel.hidden&&!panel.contains(event.target)&&!triggers.some(button=>button.contains(event.target)))close(false);
  });
})();