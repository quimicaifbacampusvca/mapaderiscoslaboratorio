/* UIUX-0.9.2 — Sistema gráfico ortogonal (parede e porta).
 * Um plano geométrico compartilhado alimenta Canvas e exportação SVG.
 * Não altera medidas, rotação, caixa de seleção ou lógica de colisão. */
(function (root) {
  'use strict';
  const COLORS = Object.freeze({
    fill: '#E9F0F4', border: '#263E4B', line: '#7F98A6',
    secondary: '#D5E0E7', blue: '#2387BA', hinge: '#F8FAFB'
  });
  const number = value => Number.isFinite(value) ? value : 0;
  const fmt = n => Number(number(n).toFixed(3));
  const rect = (ctx, w, h) => { ctx.beginPath(); ctx.rect(0, 0, w, h); };

  function clipToRect(x1,y1,x2,y2,w,h) {
    // Liang-Barsky: evita que as hachuras SVG ultrapassem o objeto,
    // inclusive quando uma parede é redimensionada para formatos incomuns.
    let lo=0,hi=1;
    const dx=x2-x1,dy=y2-y1;
    for(const [p,q] of [[-dx,x1],[dx,w-x1],[-dy,y1],[dy,h-y1]]) {
      if(p===0){if(q<0)return null;continue;}
      const t=q/p;
      if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);
      if(lo>hi)return null;
    }
    return [x1+lo*dx,y1+lo*dy,x1+hi*dx,y1+hi*dy];
  }

  function wallDetails(w, h) {
    const horizontal = w >= h;
    const thickness = Math.min(w, h), length = Math.max(w, h);
    const inset = Math.min(3, thickness * 0.18);
    const hatches = [];
    if (thickness >= 6 && length >= 14) {
      const step = Math.max(10, Math.min(28, thickness * 1.45));
      const count = Math.min(160, Math.floor(length / step));
      for (let i = 1; i <= count; i++) {
        const k = i * step;
        if (k >= length - 1) break;
        const hatch = horizontal
          ? clipToRect(k, 0, k - thickness * 0.68, h, w, h)
          : clipToRect(0, k, w, k - thickness * 0.68, w, h);
        if (hatch) hatches.push(hatch);
      }
    }
    const edges = thickness >= 8
      ? (horizontal ? [[0,inset,w,inset],[0,h-inset,w,h-inset]] : [[inset,0,inset,h],[w-inset,0,w-inset,h]])
      : [];
    return {hatches,edges};
  }

  function drawWall(ctx, w, h) {
    if (!(w>0 && h>0)) return;
    ctx.save();
    ctx.fillStyle = COLORS.fill;
    ctx.fillRect(0,0,w,h);
    const plan=wallDetails(w,h);
    ctx.save();rect(ctx,w,h);ctx.clip();
    ctx.strokeStyle = 'rgba(127, 152, 166, .62)';ctx.lineWidth = 1;
    for (const [x1,y1,x2,y2] of plan.hatches) {
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    }
    ctx.strokeStyle=COLORS.line;ctx.lineWidth=.8;
    for(const [x1,y1,x2,y2] of plan.edges){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
    ctx.restore();
    ctx.strokeStyle=COLORS.border;ctx.lineWidth=1.5;ctx.strokeRect(0,0,w,h);
    ctx.restore();
  }

  function svgWall(w,h){
    if(!(w>0&&h>0))return '';
    const plan=wallDetails(w,h);
    // Mesmos traços usados no Canvas; as hachuras geradas permanecem dentro do retângulo.
    const clippedHatch=plan.hatches.map(([x1,y1,x2,y2])=>
      `<path d="M${fmt(x1)} ${fmt(y1)} L${fmt(x2)} ${fmt(y2)}"/>`).join('');
    const edges=plan.edges.map(([x1,y1,x2,y2])=>
      `<path d="M${fmt(x1)} ${fmt(y1)} L${fmt(x2)} ${fmt(y2)}"/>`).join('');
    return `<rect width="${fmt(w)}" height="${fmt(h)}" fill="${COLORS.fill}"/>`+
      `<g stroke="${COLORS.line}" stroke-width="1" opacity=".62" fill="none">${clippedHatch}</g>`+
      `<g stroke="${COLORS.line}" stroke-width=".8" fill="none">${edges}</g>`+
      `<rect width="${fmt(w)}" height="${fmt(h)}" fill="none" stroke="${COLORS.border}" stroke-width="1.5"/>`;
  }

  function doorPlan(arc, w, h) {
    const radius=arc.radius;
    const center={x:arc.centerX,y:arc.centerY};
    const leaf={x:center.x+radius*Math.cos(arc.end),y:center.y+radius*Math.sin(arc.end)};
    const mid=arc.start+(arc.anticlockwise?-1:1)*Math.abs(arc.end-arc.start)/2;
    const marker={x:center.x+radius*.58*Math.cos(mid),y:center.y+radius*.58*Math.sin(mid),angle:mid};
    return {center,leaf,marker,radius,expanded:Math.max(w,h)>=32};
  }

  function drawDoor(ctx,arc,w,h){
    if(!(w>0&&h>0))return;
    const plan=doorPlan(arc,w,h);
    const thin=Math.min(w,h);
    ctx.save();
    ctx.fillStyle=COLORS.fill;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle=COLORS.border;ctx.lineWidth=1.4;ctx.strokeRect(0,0,w,h);
    ctx.strokeStyle=COLORS.secondary;ctx.lineWidth=Math.min(2, Math.max(.8, thin*.2));
    ctx.beginPath();
    if(w>=h){ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);}
    else{ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);}
    ctx.stroke();
    // Silhueta de folha e dobradiça continuam presentes no zoom compacto.
    ctx.strokeStyle=COLORS.border;ctx.lineWidth=2.4;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(plan.center.x,plan.center.y);ctx.lineTo(plan.leaf.x,plan.leaf.y);ctx.stroke();
    ctx.fillStyle=COLORS.hinge;ctx.strokeStyle=COLORS.border;ctx.lineWidth=1.3;
    ctx.beginPath();ctx.arc(plan.center.x,plan.center.y,Math.min(3,Math.max(1.5,thin*.33)),0,Math.PI*2);ctx.fill();ctx.stroke();
    if(plan.expanded){
      ctx.beginPath();ctx.strokeStyle=COLORS.blue;ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
      ctx.arc(plan.center.x,plan.center.y,plan.radius,arc.start,arc.end,arc.anticlockwise);ctx.stroke();ctx.setLineDash([]);
      const x=plan.marker.x,y=plan.marker.y,size=Math.min(7,Math.max(4,plan.radius*.075));
      ctx.save();ctx.translate(x,y);ctx.rotate(plan.marker.angle);
      ctx.fillStyle=COLORS.blue;ctx.beginPath();ctx.moveTo(size,0);ctx.lineTo(-size*.7,-size*.52);ctx.lineTo(-size*.7,size*.52);ctx.closePath();ctx.fill();ctx.restore();
    }
    ctx.restore();
  }

  function svgDoor(arc,w,h){
    if(!(w>0&&h>0))return '';
    const plan=doorPlan(arc,w,h),thin=Math.min(w,h);
    const cx=fmt(plan.center.x),cy=fmt(plan.center.y);
    const line=w>=h?`M0 ${fmt(h/2)} H${fmt(w)}`:`M${fmt(w/2)} 0 V${fmt(h)}`;
    let out=`<rect width="${fmt(w)}" height="${fmt(h)}" fill="${COLORS.fill}" stroke="${COLORS.border}" stroke-width="1.4"/>`+
      `<path d="${line}" fill="none" stroke="${COLORS.secondary}" stroke-width="${fmt(Math.min(2,Math.max(.8,thin*.2)))}"/>`+
      `<path d="M${cx} ${cy} L${fmt(plan.leaf.x)} ${fmt(plan.leaf.y)}" stroke="${COLORS.border}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`+
      `<circle cx="${cx}" cy="${cy}" r="${fmt(Math.min(3,Math.max(1.5,thin*.33)))}" fill="${COLORS.hinge}" stroke="${COLORS.border}" stroke-width="1.3"/>`;
    if(plan.expanded){
      const sx=fmt(cx+plan.radius*Math.cos(arc.start)),sy=fmt(cy+plan.radius*Math.sin(arc.start));
      const ex=fmt(cx+plan.radius*Math.cos(arc.end)),ey=fmt(cy+plan.radius*Math.sin(arc.end));
      out+=`<path d="M${sx} ${sy} A${fmt(plan.radius)} ${fmt(plan.radius)} 0 0 ${arc.anticlockwise?0:1} ${ex} ${ey}" fill="none" stroke="${COLORS.blue}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
      const size=Math.min(7,Math.max(4,plan.radius*.075));
      out+=`<path d="M${fmt(size)} 0 L${fmt(-size*.7)} ${fmt(-size*.52)} L${fmt(-size*.7)} ${fmt(size*.52)} Z" transform="translate(${fmt(plan.marker.x)} ${fmt(plan.marker.y)}) rotate(${fmt(plan.marker.angle*180/Math.PI)})" fill="${COLORS.blue}"/>`;
    }
    return out;
  }
  const api={COLORS,wallDetails,doorPlan,drawWall,svgWall,drawDoor,svgDoor};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.ArchitecturalGlyphs=api;
})(typeof window!=='undefined'?window:globalThis);
