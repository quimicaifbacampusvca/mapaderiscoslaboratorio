/**
 * UIUX-0.3.0 / 0.8.1.1 — Graduação métrica com apresentação visual discreta.
 * As coordenadas em metros e dimensões da área ativa continuam no modelo.
 * Funciona em Canvas 2D, não participa do hit testing nem dos arquivos JSON.
 */
(function (root) {
  'use strict';

  // Cada limiar é medido em pixels REAIS entre marcas adjacentes.
  // A sequência evita a densidade excessiva no enquadramento inicial.
  const LEVELS = Object.freeze([
    { meters: 1, label: '1 m', minPixels: 0 },
    { meters: 0.5, label: '50 cm', minPixels: 45 },
    { meters: 0.2, label: '20 cm', minPixels: 40 },
    { meters: 0.1, label: '10 cm', minPixels: 34 },
    { meters: 0.05, label: '5 cm', minPixels: 28 },
    { meters: 0.02, label: '2 cm', minPixels: 17 },
    { meters: 0.01, label: '1 cm', minPixels: 10 }
  ]);
  const MAX_ZOOM = 1200; // 12 px por centímetro: 1 cm distinguível.
  const MIN_ZOOM = 15;
  const MAX_TICKS_PER_AXIS = 400;
  const nf = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /** Escolha de nível ancorada em px/m, com margem para evitar cintilação. */
  function chooseLevel(zoomPxPerMeter, currentMeters = null) {
    const currentIndex = LEVELS.findIndex(level => level.meters === currentMeters);
    let chosen = LEVELS[0];
    if (!Number.isFinite(zoomPxPerMeter) || zoomPxPerMeter <= 0) return chosen;
    for (let i = 1; i < LEVELS.length; i++) {
      const level = LEVELS[i];
      const stabilityFactor = currentIndex >= i ? 0.93 : 1.07;
      if (level.meters * zoomPxPerMeter >= level.minPixels * stabilityFactor) chosen = level;
    }
    return chosen;
  }

  /** Faixa visível de coordenadas reais para não renderizar a área fora da tela. */
  function visibleAxis(origin, zoom, extentMeters, viewportPixels, paddingPixels = 0) {
    const start = Math.max(0, (-origin + paddingPixels) / zoom);
    const end = Math.min(extentMeters, (viewportPixels - origin - paddingPixels) / zoom);
    return end >= start ? { start, end } : null;
  }

  function forEachTick(axis, stepMeters, zoom, callback) {
    if (!axis || !(stepMeters > 0)) return;
    const first = Math.ceil((axis.start - 1e-9) / stepMeters);
    const last = Math.floor((axis.end + 1e-9) / stepMeters);
    // Segurança para inputs malformados: jamais criar milhares de operações por frame.
    const count = last - first + 1;
    if (count > MAX_TICKS_PER_AXIS) return;
    for (let n = first; n <= last; n++) callback(Number((n * stepMeters).toFixed(5)), n);
  }

  const nearMultiple = (coordinate, interval) => Math.abs(coordinate / interval - Math.round(coordinate / interval)) < 0.0001;

  function render(ctx, config) {
    const { width, height, roomWidth, roomHeight, zoom, originX, originY } = config;
    if (!ctx || ![width,height,roomWidth,roomHeight,zoom,originX,originY].every(Number.isFinite)
        || width <= 0 || height <= 0 || roomWidth <= 0 || roomHeight <= 0 || zoom <= 0) return null;

    const level = chooseLevel(zoom, config.previousStep);
    const x0 = Math.max(0, originX), x1 = Math.min(width, originX + roomWidth * zoom);
    const y0 = Math.max(0, originY), y1 = Math.min(height, originY + roomHeight * zoom);
    if (x1 <= x0 || y1 <= y0) return level;

    const rulerSize = 18;
    const rulerLeft = x0;
    // Evita a sobreposição da régua horizontal pela barra flutuante de ferramentas.
    const rulerTop = Math.max(y0, 76);
    const xAxis = visibleAxis(originX, zoom, roomWidth, width);
    const yAxis = visibleAxis(originY, zoom, roomHeight, height);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, x1 - x0, y1 - y0);
    ctx.clip();

    // Linhas estruturantes a cada metro, ancoradas na geometria do laboratório.
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(28, 77, 96, 0.075)';
    forEachTick(xAxis, 1, zoom, meter => {
      const x = originX + meter * zoom;
      ctx.moveTo(Math.round(x) + .5, y0);
      ctx.lineTo(Math.round(x) + .5, y1);
    });
    forEachTick(yAxis, 1, zoom, meter => {
      const y = originY + meter * zoom;
      ctx.moveTo(x0, Math.round(y) + .5);
      ctx.lineTo(x1, Math.round(y) + .5);
    });
    ctx.stroke();

    // Réguas sobre a parte visível do laboratório: funcionam mesmo após pan.
    ctx.fillStyle = 'rgba(233, 240, 244, 0.38)';
    ctx.fillRect(x0, rulerTop, x1 - x0, Math.min(rulerSize, y1 - rulerTop));
    ctx.fillRect(rulerLeft, y0, Math.min(rulerSize, x1 - rulerLeft), y1 - y0);
    ctx.fillStyle = 'rgba(225, 235, 240, 0.44)';
    ctx.fillRect(rulerLeft, rulerTop, Math.min(rulerSize, x1 - rulerLeft), Math.min(rulerSize, y1 - rulerTop));

    const minLabelMeters = Math.max(1, Math.ceil(58 / zoom));
    ctx.textBaseline = 'middle';
    ctx.font = '500 9px system-ui, -apple-system, sans-serif';
    forEachTick(xAxis, level.meters, zoom, value => {
      const sx = originX + value * zoom;
      const meter = nearMultiple(value, 1);
      const decimeter = nearMultiple(value, .1);
      const length = meter ? 8 : decimeter ? 5 : 3;
      ctx.beginPath();
      ctx.strokeStyle = meter ? 'rgba(48, 83, 101, .43)' : 'rgba(48, 83, 101, .23)';
      ctx.lineWidth = meter ? 1 : 0.75;
      ctx.moveTo(Math.round(sx) + .5, rulerTop);
      ctx.lineTo(Math.round(sx) + .5, Math.min(y1, rulerTop + length));
      ctx.stroke();
      if (meter && nearMultiple(value, minLabelMeters) && sx >= x0 + rulerSize + 3 && sx <= x1 - 18) {
        ctx.fillStyle = 'rgba(36, 68, 82, .62)';
        ctx.fillText(String(Math.round(value)), sx + 2, rulerTop + 13);
      }
    });
    forEachTick(yAxis, level.meters, zoom, value => {
      const sy = originY + value * zoom;
      const meter = nearMultiple(value, 1);
      const decimeter = nearMultiple(value, .1);
      const length = meter ? 8 : decimeter ? 5 : 3;
      ctx.beginPath();
      ctx.strokeStyle = meter ? 'rgba(48, 83, 101, .43)' : 'rgba(48, 83, 101, .23)';
      ctx.lineWidth = meter ? 1 : 0.75;
      ctx.moveTo(rulerLeft, Math.round(sy) + .5);
      ctx.lineTo(Math.min(x1, rulerLeft + length), Math.round(sy) + .5);
      ctx.stroke();
      if (meter && nearMultiple(value, minLabelMeters) && sy >= y0 + rulerSize + 7 && sy <= y1 - 10) {
        ctx.fillStyle = 'rgba(36, 68, 82, .62)';
        ctx.fillText(String(Math.round(value)), rulerLeft + 5, sy + 1);
      }
    });
    ctx.restore();
    return level;
  }

  /** Indicador estável, legível independentemente do enquadramento e do pan. */
  function renderSummary(ctx, config) {
    const { width, height, roomWidth, roomHeight, level } = config;
    if (!ctx || !level || !Number.isFinite(roomWidth) || !Number.isFinite(roomHeight) || width < 120) return;
    const dimensions = `${nf.format(roomWidth)} × ${nf.format(roomHeight)} m`;
    const message = `${dimensions}  ·  ${level.label}`;
    ctx.save();
    ctx.font = '500 10px system-ui, -apple-system, sans-serif';
    const textW = ctx.measureText(message).width;
    const boxW = Math.min(width - 16, textW + 18);
    const x = width - boxW - 8;
    const y = Math.max(105, (Number.isFinite(height) ? height : 720) - 78);
    ctx.fillStyle = 'rgba(13, 32, 43, .77)';
    ctx.strokeStyle = 'rgba(160, 204, 225, .25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, boxW, 24, 6);
    else ctx.rect(x, y, boxW, 24);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(227, 239, 244, .82)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, x + boxW / 2, y + 12, boxW - 12);
    ctx.restore();
  }

  const api = Object.freeze({ LEVELS, MIN_ZOOM, MAX_ZOOM, chooseLevel, visibleAxis, render, renderSummary });
  root.MetricRuler = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
