// Panel geometry for the multi-panel poster: every layout returns the panel
// rectangles (in cover pixels) for a cover of width w and height h, with a
// white gutter between panels and a black frame around the whole cover.

export const PANEL_LAYOUTS = ['heroStrip', 'quad', 'trio', 'solo', 'wantedPoster', 'storyVertical'];

/** Returns [{x, y, w, h}] panel rects for `layout` on a w×h cover. */
export function layoutPanels(layout, w, h) {
  const frame = Math.round(Math.min(w, h) * 0.022);
  const gut = Math.round(Math.min(w, h) * 0.012);
  const ix = frame;
  const iy = frame;
  const iw = w - frame * 2;
  const ih = h - frame * 2;
  switch (layout) {
    case 'quad': {
      const cw = (iw - gut) / 2;
      const ch = (ih - gut) / 2;
      return [
        { x: ix, y: iy, w: cw, h: ch },
        { x: ix + cw + gut, y: iy, w: cw, h: ch },
        { x: ix, y: iy + ch + gut, w: cw, h: ch },
        { x: ix + cw + gut, y: iy + ch + gut, w: cw, h: ch },
      ];
    }
    case 'trio': {
      const left = Math.round(iw * 0.52);
      const right = iw - left - gut;
      const rh = (ih - gut) / 2;
      return [
        { x: ix, y: iy, w: left, h: ih },
        { x: ix + left + gut, y: iy, w: right, h: rh },
        { x: ix + left + gut, y: iy + rh + gut, w: right, h: rh },
      ];
    }
    case 'solo':
      return [{ x: ix, y: iy, w: iw, h: ih }];
    case 'wantedPoster': {
      // Split-panel wanted poster: one tall hero mug-shot on the left, a
      // stack of two smaller frames on the right, caption band below.
      const left = Math.round(iw * 0.56);
      const right = iw - left - gut;
      const rh = (ih - gut) / 2;
      return [
        { x: ix, y: iy, w: left, h: ih },
        { x: ix + left + gut, y: iy, w: right, h: rh },
        { x: ix + left + gut, y: iy + rh + gut, w: right, h: rh },
      ];
    }
    case 'storyVertical': {
      // Vertical story layout: a tall top frame, a thin middle strip, and
      // a bottom frame — built for the 1080 x 1350 portrait post.
      const topH = Math.round(ih * 0.52);
      const stripH = Math.round(ih * 0.16);
      const botH = ih - topH - stripH - gut * 2;
      return [
        { x: ix, y: iy, w: iw, h: topH },
        { x: ix, y: iy + topH + gut, w: iw, h: stripH },
        { x: ix, y: iy + topH + stripH + gut * 2, w: iw, h: botH },
      ];
    }
    case 'heroStrip':
    default: {
      const heroH = Math.round(ih * 0.58);
      const stripH = ih - heroH - gut;
      const sw = (iw - gut * 2) / 3;
      return [
        { x: ix, y: iy, w: iw, h: heroH },
        { x: ix, y: iy + heroH + gut, w: sw, h: stripH },
        { x: ix + sw + gut, y: iy + heroH + gut, w: sw, h: stripH },
        { x: ix + sw * 2 + gut * 2, y: iy + heroH + gut, w: sw, h: stripH },
      ];
    }
  }
}

/** The frame and gutter sizes, so the renderer can draw them exactly. */
export function frameMetrics(w, h) {
  return {
    frame: Math.round(Math.min(w, h) * 0.022),
    gutter: Math.round(Math.min(w, h) * 0.012),
  };
}
