// Caption styles for the cover: three presets that change how the whole
// caption block (kicker + title + subtitle) is lettered, so one tap gives
// the poster a different voice. Block is the classic bold poster fill;
// outline is hollow stencil lettering; neon glow is a buzzing sign.
// Every style draws with the same layout math (title block height, kicker
// above it, subtitle below), so switching style never moves the panels.

import { drawPosterTitle, drawSubtitle, wrapTitle, drawKickerStyled } from './coverLettering.js';

export const CAPTION_STYLES = ['block', 'outline', 'neonGlow'];

export const CAPTION_STYLE_LABELS = {
  block: 'Bold block',
  outline: 'Outline',
  neonGlow: 'Neon glow',
};

/** Hollow title: thick coloured stroke, near-empty fill, hard offset shadow. */
export function drawOutlineTitle(ctx, text, x, bottomY, maxWidth, maxSize) {
  const clean = (text || '').trim().toUpperCase();
  if (!clean) return 0;
  let size = maxSize;
  let lines = [];
  while (size > 14) {
    const font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    lines = wrapTitle(ctx, clean, maxWidth, font, 2);
    ctx.font = font;
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (widest <= maxWidth) break;
    size -= 2;
  }
  const lineHeight = size * 1.02;
  const firstBaseline = bottomY - (lines.length - 1) * lineHeight;
  lines.forEach((line, i) => {
    const y = firstBaseline + i * lineHeight;
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    // Hard offset shadow, then the hollow letter.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillText(line, x + size * 0.045, y + size * 0.05);
    ctx.strokeStyle = '#ffe9a8';
    ctx.lineWidth = Math.max(3, size * 0.075);
    ctx.strokeText(line, x, y);
    ctx.fillStyle = 'rgba(255, 233, 168, 0.10)';
    ctx.fillText(line, x, y);
  });
  return lines.length * lineHeight;
}

/** Neon title: cyan-to-white fill under a magenta glow, pink outline. */
export function drawNeonTitle(ctx, text, x, bottomY, maxWidth, maxSize) {
  const clean = (text || '').trim().toUpperCase();
  if (!clean) return 0;
  let size = maxSize;
  let lines = [];
  while (size > 14) {
    const font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    lines = wrapTitle(ctx, clean, maxWidth, font, 2);
    ctx.font = font;
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (widest <= maxWidth) break;
    size -= 2;
  }
  const lineHeight = size * 1.02;
  const firstBaseline = bottomY - (lines.length - 1) * lineHeight;
  lines.forEach((line, i) => {
    const y = firstBaseline + i * lineHeight;
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.save();
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = size * 0.35;
    ctx.strokeStyle = '#ff2e88';
    ctx.lineWidth = Math.max(2, size * 0.06);
    ctx.strokeText(line, x, y);
    const fill = ctx.createLinearGradient(x, y - size, x, y);
    fill.addColorStop(0, '#ffffff');
    fill.addColorStop(1, '#2ee6ff');
    ctx.fillStyle = fill;
    ctx.fillText(line, x, y);
    ctx.restore();
    // Second pass without blur keeps the letters crisp inside the glow.
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.92;
    ctx.fillText(line, x, y);
    ctx.globalAlpha = 1;
  });
  return lines.length * lineHeight;
}

/** Kicker in the style's accent colour: amber for block, cyan for neon. */
export function drawStyledKicker(ctx, text, x, y, size, style) {
  const color = style === 'outline' ? '#ffffff' : style === 'neonGlow' ? '#2ee6ff' : '#ffe9a8';
  const glow = style === 'neonGlow' ? '#2ee6ff' : null;
  drawKickerStyled(ctx, text, x, y, size, color, glow);
}

/** Draws the whole caption block (kicker, title, subtitle) in `style`.
 * Returns the title block height, as drawPosterTitle does. */
export function drawCaptionBlock(ctx, caption, x, titleBottom, textW, sizes, style) {
  const pick = style === 'outline' ? drawOutlineTitle : style === 'neonGlow' ? drawNeonTitle : drawPosterTitle;
  const titleHeight = pick(ctx, caption.title, x, titleBottom, textW, sizes.title);
  const kickerY = titleBottom - titleHeight - Math.round(sizes.kicker * 0.4);
  drawStyledKicker(ctx, caption.kicker, x, kickerY, sizes.kicker, style);
  drawSubtitle(ctx, caption.subtitle, x, titleBottom + Math.round(sizes.sub * 1.1), sizes.sub, textW);
  return titleHeight;
}

/** One random combo of layout + grade + caption style, for the remix button. */
export function randomCombo(layouts, grades) {
  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return { layout: pickOne(layouts), grade: pickOne(grades), captionStyle: pickOne(CAPTION_STYLES) };
}
