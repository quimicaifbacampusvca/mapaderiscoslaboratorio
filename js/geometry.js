
/**
 * Calcula os quatro cantos de um objeto considerando posição, dimensões e rotação.
 */
function getObjectCorners(o) {
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h / 2;
  const hw = o.w / 2;
  const hh = o.h / 2;
  const rad = ((o.rot || 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const localCorners = [
    { x: -hw, y: -hh }, { x: hw, y: -hh },
    { x: hw, y: hh }, { x: -hw, y: hh }
  ];
  return localCorners.map(p => ({
    x: cx + p.x * cos - p.y * sin,
    y: cy + p.x * sin + p.y * cos
  }));
}

/**
 * Decompõe objetos compostos em retângulos usados nos cálculos de ocupação e colisão; Bancada L recebe duas partes.
 */
function getObjectRects(o) {
  if (o.type === 'benchL') {
    const t = Math.min(o.w, o.h) * 0.28;
    return [
      { x: o.x, y: o.y, w: o.w, h: t },
      { x: o.x, y: o.y + t, w: t, h: Math.max(0, o.h - t) }
    ];
  }
  return [{ x: o.x, y: o.y, w: o.w, h: o.h }];
}

/**
 * Calcula a área de interseção entre dois retângulos alinhados aos eixos.
 */
function getRectIntersectionArea(r1, r2) {
  const minX = Math.max(r1.x, r2.x);
  const maxX = Math.min(r1.x + r1.w, r2.x + r2.w);
  const minY = Math.max(r1.y, r2.y);
  const maxY = Math.min(r1.y + r1.h, r2.y + r2.h);
  return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
}

/**
 * Converte os sub-retângulos de um objeto em polígonos na orientação real.
 * A rotação ocorre em torno do centro do objeto completo, inclusive em bancadas L.
 */
function getObjectPolygons(o) {
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h / 2;
  const rad = (o.rot || 0) * Math.PI / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  return getObjectRects(o).map(r => [
    {x:r.x, y:r.y}, {x:r.x+r.w, y:r.y},
    {x:r.x+r.w, y:r.y+r.h}, {x:r.x, y:r.y+r.h}
  ].map(p => {
    const dx = p.x - cx, dy = p.y - cy;
    return {x:cx + dx*cos - dy*sin, y:cy + dx*sin + dy*cos};
  }));
}

/** Interseção de polígonos convexos por recorte Sutherland-Hodgman. */
function clipConvexPolygon(subject, clip) {
  const eps = 1e-9;
  const inside = (p,a,b) => (b.x-a.x)*(p.y-a.y) - (b.y-a.y)*(p.x-a.x) >= -eps;
  const intersection = (p,q,a,b) => {
    const rx=q.x-p.x, ry=q.y-p.y, sx=b.x-a.x, sy=b.y-a.y;
    const denom=rx*sy-ry*sx;
    if (Math.abs(denom) < eps) return {x:q.x,y:q.y};
    const t=((a.x-p.x)*sy-(a.y-p.y)*sx)/denom;
    return {x:p.x+t*rx,y:p.y+t*ry};
  };
  let output=subject;
  for (let i=0;i<clip.length && output.length;i++) {
    const a=clip[i], b=clip[(i+1)%clip.length], input=output;
    output=[];
    for (let j=0;j<input.length;j++) {
      const curr=input[j], prev=input[(j+input.length-1)%input.length];
      const currIn=inside(curr,a,b), prevIn=inside(prev,a,b);
      if (currIn) {
        if (!prevIn) output.push(intersection(prev,curr,a,b));
        output.push(curr);
      } else if (prevIn) output.push(intersection(prev,curr,a,b));
    }
  }
  return output;
}
function polygonArea(points) {
  if (points.length<3) return 0;
  let sum=0;
  for (let i=0;i<points.length;i++) {
    const a=points[i],b=points[(i+1)%points.length];
    sum+=a.x*b.y-b.x*a.y;
  }
  return Math.abs(sum)/2;
}

/**
 * Área real de interseção: polígonos rotacionados e partes sem sobreposição de bancada L.
 * Não altera a geometria serializada no JSON.
 */
function getIntersectionArea(o1, o2) {
  let total=0;
  for (const p1 of getObjectPolygons(o1))
    for (const p2 of getObjectPolygons(o2))
      total+=polygonArea(clipConvexPolygon(p1,p2));
  return total;
}

/**
 * Verifica se um retângulo está completamente contido em outro, usando uma pequena tolerância numérica.
 */
function isRectFullyContained(inner, outer) {
  const eps = 0.001;
  return inner.x >= outer.x - eps && inner.y >= outer.y - eps &&
    inner.x + inner.w <= outer.x + outer.w + eps &&
    inner.y + inner.h <= outer.y + outer.h + eps;
}

/**
 * Verifica se um item apoiado cabe inteiramente em uma das superfícies da base.
 */
function isSupportedItemContainedOnBase(supported, base) {
  const needed = supported.w * supported.h;
  const covered = getIntersectionArea(supported, base);
  return covered >= needed - Math.max(1e-6, needed * 1e-5);
}

/**
 * Determina se a sobreposição entre dois objetos é permitida pela relação base/item apoiado.
 */
function canOverlapAsSupportedPair(o1, o2) {
  if (TIPOS_BASE.includes(o1.type) && TIPOS_APOIADOS.includes(o2.type)) return isSupportedItemContainedOnBase(o2, o1);
  if (TIPOS_BASE.includes(o2.type) && TIPOS_APOIADOS.includes(o1.type)) return isSupportedItemContainedOnBase(o1, o2);
  return false;
}

/**
 * Cria o retângulo de segurança ao redor de uma porta ou saída.
 */
function getExitClearanceRect(exitObj) {
  return {
    x: exitObj.x - EXIT_CLEARANCE,
    y: exitObj.y - EXIT_CLEARANCE,
    w: exitObj.w + EXIT_CLEARANCE * 2,
    h: exitObj.h + EXIT_CLEARANCE * 2
  };
}

/**
 * Verifica se algum elemento sólido bloqueia a área de aproximação de uma saída.
 */
function isExitClearanceBlocked(exitObj, objects = []) {
  // Envelope didático de aproximação (1,2 m), NÃO um limite legal universal.
  const rect = {...getExitClearanceRect(exitObj), rot:0};
  return objects.some(o => {
    if (o.id === exitObj.id || !SOLID_BLOCKERS.includes(o.type)) return false;
    // Ocultar não desmaterializa obstáculos; rotação é considerada pela SAT.
    return checkRectangleOverlap(o, rect);
  });
}

/**
 * Verifica colisão entre dois retângulos rotacionados usando o Separating Axis Theorem.
 */
function checkRectangleOverlap(o1, o2) {
  const c1 = getObjectCorners(o1);
  const c2 = getObjectCorners(o2);
  const getAxes = corners => corners.map((p1, i) => {
    const p2 = corners[(i + 1) % corners.length];
    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
    const normal = { x: -edge.y, y: edge.x };
    const len = Math.hypot(normal.x, normal.y);
    return len > 0 ? { x: normal.x / len, y: normal.y / len } : null;
  }).filter(Boolean);
  const project = (corners, axis) => {
    let min = Infinity, max = -Infinity;
    for (const p of corners) {
      const dot = p.x * axis.x + p.y * axis.y;
      min = Math.min(min, dot); max = Math.max(max, dot);
    }
    return { min, max };
  };
  for (const axis of [...getAxes(c1), ...getAxes(c2)]) {
    const p1 = project(c1, axis), p2 = project(c2, axis);
    if (p1.max <= p2.min || p2.max <= p1.min) return false;
  }
  return true;
}

/**
 * Calcula a fração da largura útil da porta bloqueada por outro objeto.
 */
function calculateDoorBlockRatio(doorObj, blockerObj) {
  const rad = ((doorObj.rot || 0) + (doorObj.w < doorObj.h ? 90 : 0)) * Math.PI / 180;
  const doorAxis = { x: Math.cos(rad), y: Math.sin(rad) };
  const project = (corners, axis) => {
    let min = Infinity, max = -Infinity;
    for (const p of corners) {
      const dot = p.x * axis.x + p.y * axis.y;
      min = Math.min(min, dot); max = Math.max(max, dot);
    }
    return { min, max };
  };
  const pDoor = project(getObjectCorners(doorObj), doorAxis);
  const pBlocker = project(getObjectCorners(blockerObj), doorAxis);
  const overlapMin = Math.max(pDoor.min, pBlocker.min);
  const overlapMax = Math.min(pDoor.max, pBlocker.max);
  if (overlapMax <= overlapMin) return 0;
  const doorWidthProj = pDoor.max - pDoor.min;
  if (doorWidthProj <= 0) return 0;
  return Math.min(1, Math.max(0, (overlapMax - overlapMin) / doorWidthProj));
}
