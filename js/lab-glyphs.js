/* UIUX-0.9.2 / Etapa 2 — Biblioteca de seis elementos técnicos.
 * Plano geométrico único para Canvas 2D, SVG exportado e miniaturas.
 * Nenhuma dependência de estado, dimensionamento físico ou dados JSON. */
(function(root){
  'use strict';
  const COLOR = Object.freeze({
    surface:'#E8F0F4', rim:'#C8D7E0', edge:'#294657', detail:'#6D8797',
    blue:'#2387BA', dark:'#233F4D', hood:'#D7E4EB', red:'#D43E43', redDark:'#8E2630',
    amber:'#A87942', amberFill:'#F6EEE3', white:'#FFFFFF'
  });
  const n=v=>Number.isFinite(v)?v:0;
  const f=v=>Number(n(v).toFixed(3));
  const min=(w,h)=>Math.min(w,h);
  const rect=(x,y,w,h,fill,stroke=null,lw=1.4,rx=0)=>({kind:'rect',x,y,w,h,fill,stroke,lw,rx});
  const circle=(cx,cy,r,fill,stroke=null,lw=1.4)=>({kind:'circle',cx,cy,r,fill,stroke,lw});
  const poly=(points,fill,stroke=null,lw=1.4)=>({kind:'poly',points,fill,stroke,lw});
  const line=(points,stroke=COLOR.detail,lw=1.4)=>({kind:'poly',points,fill:null,stroke,lw});
  const cap=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  function plan(type,w,h){
    w=n(w);h=n(h);
    if(!(w>0&&h>0))return [];
    const m=min(w,h),compact=m<25,thin=cap(m*.075,1,2.2);
    const operations=[];
    const add=(...v)=>operations.push(...v);
    if(type==='bench'){
      const edge=cap(m*.15,1.2,4.5);
      add(rect(0,0,w,h,COLOR.surface,COLOR.edge,1.5,cap(m*.07,0,3)));
      add(rect(edge,edge,Math.max(0,w-2*edge),Math.max(0,h-2*edge),COLOR.rim,null,0,1));
      // Barra de apoio longitudinal: persiste mesmo em representação compacta.
      add(line([[edge,h*.66],[w-edge,h*.66]],COLOR.detail,thin));
      if(!compact&&w>55){
        add(line([[w*.22,h*.66],[w*.22,h*.91]],COLOR.detail,.9),line([[w*.78,h*.66],[w*.78,h*.91]],COLOR.detail,.9));
      }
    } else if(type==='benchL'){
      const t=Math.max(2.5,m*.29), inr=cap(m*.12,1,4);
      add(poly([[0,0],[w,0],[w,t],[t,t],[t,h],[0,h]],COLOR.surface,COLOR.edge,1.5));
      add(poly([[inr,inr],[Math.max(inr,w-inr),inr],[Math.max(inr,w-inr),Math.max(inr,t-inr)],
        [Math.max(inr,t-inr),Math.max(inr,t-inr)],[Math.max(inr,t-inr),Math.max(inr,h-inr)],
        [inr,Math.max(inr,h-inr)]],COLOR.rim,null,0));
      // Duas bordas internas reforçam leitura de L sem depender de cor.
      if(!compact){
        add(line([[t*.65,t*.65],[w-inr,t*.65]],COLOR.detail,thin),line([[t*.65,t*.65],[t*.65,h-inr]],COLOR.detail,thin));
      }
    } else if(type==='sink'){
      const p=cap(m*.08,.8,4),bX=w*.16,bY=h*.24,bW=w*.68,bH=h*.57;
      add(rect(0,0,w,h,COLOR.surface,COLOR.edge,1.4,cap(m*.07,0,3)));
      add(rect(bX,bY,bW,bH,COLOR.white,COLOR.detail,thin,cap(m*.09,1,5)));
      add(circle(w*.5,h*.57,cap(m*.055,.85,3.1),COLOR.detail));
      // A torneira mantém uma silhueta em U nas dimensões reduzidas.
      add(line([[w*.5,h*.22],[w*.5,h*.11],[w*.67,h*.11],[w*.67,h*.27]],COLOR.dark,cap(m*.085,1.2,2.2)));
      if(!compact)add(line([[w*.23,h*.3],[w*.77,h*.3]],COLOR.rim,1));
    } else if(type==='hood'){
      add(rect(0,0,w,h,COLOR.surface,COLOR.edge,1.5,cap(m*.04,0,2)));
      add(rect(w*.09,h*.11,w*.82,h*.66,COLOR.hood,COLOR.detail,1,cap(m*.04,0,2)));
      add(rect(w*.09,h*.79,w*.82,h*.12,COLOR.dark)); // duto de exaustão
      // Duto + fluxo direcionado: nunca transformar a capela em retângulo amarelo.
      const xs=compact?[.5]:[.32,.68];
      for(const q of xs){
        const x=w*q,y=h*.54,top=h*.29,d=cap(m*.09,1.4,5);
        add(line([[x,y],[x,top]],COLOR.blue,cap(m*.085,1.1,2)));
        add(line([[x-d,top+d],[x,top],[x+d,top+d]],COLOR.blue,cap(m*.08,1,1.8)));
      }
    } else if(type==='extinguisher'){
      const c=w*.5,s=min(w,h);
      // Símbolo circular de equipamento de emergência; corpo legível a 12px.
      add(circle(c,h*.5,s*.45,'#FFF5F4',COLOR.redDark,cap(s*.07,1,2)));
      add(rect(w*.34,h*.34,w*.32,h*.47,COLOR.red,COLOR.redDark,cap(s*.07,.8,1.6),cap(s*.045,.3,1.8)));
      add(rect(w*.42,h*.25,w*.16,h*.10,COLOR.redDark));
      add(line([[w*.49,h*.25],[w*.63,h*.18],[w*.7,h*.25]],COLOR.redDark,cap(s*.07,.9,1.5)));
      if(s>=22)add(rect(w*.39,h*.5,w*.22,h*.07,COLOR.white));
    } else if(type==='chemical'){
      const s=m,cx=w*.5,cy=h*.5;
      add(circle(cx,cy,s*.46,COLOR.amberFill,COLOR.amber,cap(s*.055,1,2.6)));
      // Pictograma em forma de frasco; sem depender de iniciais na exportação.
      const px=v=>cx+v*s,py=v=>cy+v*s;
      add(poly([[px(-.1),py(-.28)],[px(.1),py(-.28)],[px(.1),py(-.12)],
        [px(.28),py(.20)],[px(.24),py(.29)],[px(-.24),py(.29)],
        [px(-.28),py(.20)],[px(-.1),py(-.12)]],COLOR.white,COLOR.amber,cap(s*.055,1,2)));
      add(poly([[px(-.22),py(.12)],[px(.22),py(.12)],[px(.28),py(.2)],[px(.24),py(.29)],[px(-.24),py(.29)],[px(-.28),py(.2)]],COLOR.amber));
      add(line([[px(-.13),py(-.3)],[px(.13),py(-.3)]],COLOR.amber,cap(s*.06,1,2.3)));
      if(!compact)add(circle(px(.04),py(.02),s*.027,COLOR.amber));
    }
    return operations;
  }
  function draw(ctx,type,w,h){
    ctx.save();
    for(const c of plan(type,w,h)){
      ctx.beginPath();
      if(c.kind==='rect'){
        if(c.rx>0&&ctx.roundRect)ctx.roundRect(c.x,c.y,c.w,c.h,Math.min(c.rx,c.w/2,c.h/2));
        else ctx.rect(c.x,c.y,c.w,c.h);
      }else if(c.kind==='circle')ctx.arc(c.cx,c.cy,c.r,0,Math.PI*2);
      else if(c.kind==='poly'){
        c.points.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
        if(c.fill)ctx.closePath();
      }
      if(c.fill){ctx.fillStyle=c.fill;ctx.fill();}
      if(c.stroke){ctx.strokeStyle=c.stroke;ctx.lineWidth=c.lw;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
    }
    ctx.restore();
  }
  function svg(type,w,h){
    return plan(type,w,h).map(c=>{
      const style=`fill="${c.fill||'none'}"`+(c.stroke?` stroke="${c.stroke}" stroke-width="${f(c.lw)}" stroke-linejoin="round" stroke-linecap="round"`:'');
      if(c.kind==='rect')return `<rect x="${f(c.x)}" y="${f(c.y)}" width="${f(c.w)}" height="${f(c.h)}" rx="${f(c.rx)}" ${style}/>`;
      if(c.kind==='circle')return `<circle cx="${f(c.cx)}" cy="${f(c.cy)}" r="${f(c.r)}" ${style}/>`;
      if(c.kind==='poly')return `<path d="${c.points.map(([x,y],i)=>`${i?'L':'M'}${f(x)} ${f(y)}`).join(' ')}${c.fill?' Z':''}" ${style}/>`;
      return '';
    }).join('');
  }
  const api=Object.freeze({COLOR,plan,draw,svg,types:['bench','benchL','sink','hood','extinguisher','chemical']});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LabGlyphs=api;
})(typeof window!=='undefined'?window:globalThis);
