// The cover renderer: panels + grade + lettering, drawn the same way for
// the live preview and the exported PNG, so what you see is what you get.
// A cover state is { layout, grade, size, title, subtitle, kicker, photos },
// where photos[i] is { img, zoom, ox, oy } (zoom 1 = cover-fit, ox/oy pan in
// fractions of the panel) or null — an empty slot reuses the first photo.

import { layoutPanels, frameMetrics } from './panelLayouts.js';
import { applyGrade } from './viceGrade.js';
import { drawPosterTitle, drawKicker, drawSubtitle } from './coverLettering.js';

export const EXPORT_SIZES = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  wide: { w: 1920, h: 1080, label: '1920 × 1080' },
};

/** Draws one photo into one panel, cover-fit, with the panel's zoom and pan. */
export function drawPanelPhoto(ctx, photo, rect) {
  if (!photo || !photo.img) return false;
  const img = photo.img;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return false;
  const zoom = photo.zoom || 1;
  const base = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const pw = iw * base;
  const ph = ih * base;
  const ox = (photo.ox || 0) * rect.w;
  const oy = (photo.oy || 0) * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, rect.x + (rect.w - pw) / 2 + ox, rect.y + (rect.h - ph) / 2 + oy, pw, ph);
  ctx.restore();
  return true;
}

/** Renders the whole cover onto `canvas` (sized to the export size first). */
export function renderCover(canvas, state) {
  const size = EXPORT_SIZES[state.size] || EXPORT_SIZES.square;
  const { w, h } = size;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  const { frame, gutter } = frameMetrics(w, h);

  // Frame and gutters: black outside, white between panels.
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#f5efe8';
  ctx.fillRect(frame, frame, w - frame * 2, h - frame * 2);

  const panels = layoutPanels(state.layout, w, h);
  const first = (state.photos || []).find((p) => p && p.img) || null;
  panels.forEach((rect, i) => {
    const photo = (state.photos && state.photos[i] && state.photos[i].img)
      ? state.photos[i]
      : first;
    if (!drawPanelPhoto(ctx, photo, rect)) {
      // No photo at all yet: a sunset placeholder so the cover never looks empty.
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      g.addColorStop(0, '#ff9a3d');
      g.addColorStop(0.6, '#ff4d6d');
      g.addColorStop(1, '#5b2a86');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
  });

  applyGrade(ctx, w, h, state.grade);

  // Caption band: a dark gradient rising from the foot, then the lettering.
  const bandH = Math.round(h * 0.34);
  const band = ctx.createLinearGradient(0, h - bandH, 0, h);
  band.addColorStop(0, 'rgba(5, 2, 10, 0)');
  band.addColorStop(1, 'rgba(5, 2, 10, 0.82)');
  ctx.fillStyle = band;
  ctx.fillRect(0, h - bandH, w, h - (h - bandH));

  const padX = Math.round(w * 0.055);
  const textW = w - padX * 2;
  const titleSize = Math.round(Math.min(w, h) * 0.115);
  const kickerSize = Math.round(Math.min(w, h) * 0.026);
  const subSize = Math.round(Math.min(w, h) * 0.03);
  const titleBottom = h - Math.round(h * 0.075);
  const subY = h - Math.round(h * 0.038);

  const titleHeight = drawPosterTitle(ctx, state.title, padX, titleBottom, textW, titleSize);
  // Kicker sits just above the title block's top edge.
  const kickerY = titleBottom - titleHeight - Math.round(kickerSize * 0.4);
  drawKicker(ctx, state.kicker, padX, kickerY, kickerSize);
  drawSubtitle(ctx, state.subtitle, padX, subY, subSize, textW);
  return { w, h, panels };
}

/** Which panel (index) holds point (x, y) in cover pixels, or -1. */
export function panelAt(state, x, y) {
  const size = EXPORT_SIZES[state.size] || EXPORT_SIZES.square;
  const panels = layoutPanels(state.layout, size.w, size.h);
  for (let i = 0; i < panels.length; i++) {
    const r = panels[i];
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return i;
  }
  return -1;
}
