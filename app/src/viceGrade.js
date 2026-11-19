// Colour grades: a sunset wash, a neon split, and a high-contrast noir.
// Each grade is pure canvas compositing over the finished panels, so the
// export is identical to the preview. Grain is seeded, so two renders of
// the same cover are byte-identical.

/** Deterministic PRNG (mulberry32) so the grain never flickers between renders. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A warm sunset wash: orange from the top, magenta pooling at the bottom. */
export function applySunsetGrade(ctx, w, h) {
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, 'rgba(255, 140, 40, 0.10)');
  wash.addColorStop(0.55, 'rgba(255, 90, 60, 0.08)');
  wash.addColorStop(1, 'rgba(190, 30, 120, 0.34)');
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, w * 0.55);
  glow.addColorStop(0, 'rgba(255, 214, 130, 0.20)');
  glow.addColorStop(1, 'rgba(255, 214, 130, 0)');
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  applyVignette(ctx, w, h, 0.34);
  applyGrain(ctx, w, h, 0.05, 20261119);
}

/** A neon split: magenta light from the left, cyan from the right. */
export function applyNeonGrade(ctx, w, h) {
  const left = ctx.createLinearGradient(0, 0, w, 0);
  left.addColorStop(0, 'rgba(255, 46, 136, 0.38)');
  left.addColorStop(0.5, 'rgba(255, 46, 136, 0)');
  left.addColorStop(1, 'rgba(46, 230, 255, 0.34)');
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = left;
  ctx.fillRect(0, 0, w, h);
  const top = ctx.createLinearGradient(0, 0, 0, h);
  top.addColorStop(0, 'rgba(20, 8, 60, 0.22)');
  top.addColorStop(1, 'rgba(255, 46, 136, 0.16)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  applyVignette(ctx, w, h, 0.4);
  applyGrain(ctx, w, h, 0.06, 777);
}

/** High-contrast noir: desaturate, crush the shadows, lift the highlights. */
export function applyNoirGrade(ctx, w, h) {
  ctx.globalCompositeOperation = 'saturation';
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);
  const shade = ctx.createLinearGradient(0, 0, 0, h);
  shade.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.30)');
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  applyVignette(ctx, w, h, 0.5);
  applyGrain(ctx, w, h, 0.08, 4242);
}

/** Darkens the corners so the lettering and the panels pop. */
export function applyVignette(ctx, w, h, strength) {
  const r = Math.hypot(w, h) / 2;
  const v = ctx.createRadialGradient(w / 2, h / 2, r * 0.45, w / 2, h / 2, r);
  v.addColorStop(0, 'rgba(0, 0, 0, 0)');
  v.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

/** Sparse monochrome grain: cheap, seeded, and invisible at post size. */
export function applyGrain(ctx, w, h, alpha, seed) {
  const rand = seededRandom(seed);
  const count = Math.round((w * h) / 2600);
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h;
    ctx.fillStyle = rand() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  ctx.restore();
}

/** Runs the named grade over the whole canvas. */
export function applyGrade(ctx, w, h, grade) {
  if (grade === 'neon') applyNeonGrade(ctx, w, h);
  else if (grade === 'noir') applyNoirGrade(ctx, w, h);
  else applySunsetGrade(ctx, w, h);
}
