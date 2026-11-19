// Bold poster lettering: Anton for the title, Archivo Black for the kicker
// and subtitle. White fill, black outline and a hard offset shadow — the
// look of a poster title you can read from across the street.

/** Splits `text` into at most `maxLines` lines that fit `maxWidth` at `font`. */
export function wrapTitle(ctx, text, maxWidth, font, maxLines) {
  ctx.font = font;
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break; // overflow words are dropped
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.slice(0, maxLines);
}

/** Draws one line of poster text with outline + hard shadow. */
export function drawPosterLine(ctx, text, x, y, size, fontFamily) {
  const font = `${size}px ${fontFamily}`;
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.92)';
  ctx.lineWidth = Math.max(2, size * 0.085);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillText(text, x + size * 0.045, y + size * 0.05);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y);
}

/** Fits `text` to `maxWidth` (shrinking the font, then wrapping to 2 lines).
 * Draws with the LAST line's baseline at `bottomY`; returns the block height. */
export function drawPosterTitle(ctx, text, x, bottomY, maxWidth, maxSize) {
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
    drawPosterLine(ctx, line, x, firstBaseline + i * lineHeight, size, "Anton, 'Arial Narrow', sans-serif");
  });
  return lines.length * lineHeight;
}

/** Small caps kicker with wide letter spacing, drawn letter by letter. */
export function drawKicker(ctx, text, x, y, size) {
  const clean = (text || '').trim().toUpperCase();
  if (!clean) return;
  ctx.font = `${size}px 'Archivo Black', sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const gap = size * 0.28;
  let cx = x;
  for (const ch of clean) {
    ctx.fillStyle = '#ffe9a8';
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + gap;
  }
}

/** The subtitle: Archivo Black, smaller, with a soft shadow. */
export function drawSubtitle(ctx, text, x, y, size, maxWidth) {
  const clean = (text || '').trim();
  if (!clean) return;
  let s = size;
  while (s > 10) {
    ctx.font = `${s}px 'Archivo Black', sans-serif`;
    if (ctx.measureText(clean).width <= maxWidth) break;
    s -= 1;
  }
  ctx.font = `${s}px 'Archivo Black', sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillText(clean, x + 2, y + 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(clean, x, y);
}
