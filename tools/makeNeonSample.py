#!/usr/bin/env python3
"""Makes the fourth sample photo: a procedural neon avenue at night (1600x1200).

Drawn with PIL only — dark street, glowing neon sign bars and rings, wet
asphalt with coloured reflections, building silhouettes with lit windows.
Abstract on purpose (no words, no logos): it is our own drawing.
Run: python3 tools/makeNeonSample.py  ->  app/samples/neon-avenue.jpg
"""
import math
import random
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 1200
OUT = "app/samples/neon-avenue.jpg"
rng = random.Random(777)

img = Image.new("RGB", (W, H))
d = ImageDraw.Draw(img, "RGBA")

# Night sky: near-black violet at the top, magenta haze at the horizon.
HORIZON = 700
for y in range(HORIZON):
    t = y / HORIZON
    r = int(10 + (120 - 10) * t ** 2.0)
    g = int(6 + (30 - 6) * t ** 2.0)
    b = int(26 + (90 - 26) * t ** 1.6)
    d.line([(0, y), (W, y)], fill=(r, g, b))
d.rectangle([0, HORIZON, W, H], fill=(14, 8, 20, 255))

# Building silhouettes with neon-lit windows.
def buildings(base_y, h_min, h_max, color, seed):
    r = random.Random(seed)
    x = -20
    while x < W + 40:
        bw = r.randint(90, 200)
        bh = r.randint(h_min, h_max)
        d.rectangle([x, base_y - bh, x + bw, base_y], fill=color)
        for _ in range(r.randint(4, 14)):
            wx = r.randint(x + 8, x + bw - 14)
            wy = r.randint(base_y - bh + 10, base_y - 14)
            col = r.choice([(255, 46, 136), (46, 230, 255), (255, 214, 120),
                            (120, 255, 180)])
            d.rectangle([wx, wy, wx + 7, wy + 10], fill=col + (210,))
        x += bw + r.randint(6, 30)

buildings(HORIZON, 200, 480, (20, 8, 34, 255), 31)
buildings(HORIZON, 120, 300, (12, 5, 24, 255), 47)

# Neon sign bars and rings on the facades, with glow halos.
NEONS = [(255, 46, 136), (46, 230, 255), (255, 120, 40), (180, 80, 255),
         (120, 255, 180)]
signs = [(240, 380, 300, 26), (620, 300, 220, 22), (980, 420, 340, 26),
         (1300, 300, 180, 22), (420, 520, 180, 20), (1120, 540, 200, 20)]
for i, (sx, sy, sw, sh) in enumerate(signs):
    col = NEONS[i % len(NEONS)]
    for rad, alpha in ((46, 26), (26, 50)):
        d.rounded_rectangle([sx - rad // 2, sy - rad // 3, sx + sw + rad // 2,
                             sy + sh + rad // 3], radius=rad // 2,
                            fill=col + (alpha,))
    d.rounded_rectangle([sx, sy, sx + sw, sy + sh], radius=sh // 2,
                        fill=col + (255,))
# Two neon rings.
for cx, cy, rad, col in ((820, 470, 64, (46, 230, 255)), (1420, 480, 52, (255, 46, 136))):
    for wdt, alpha in ((26, 30), (12, 70)):
        d.ellipse([cx - rad - wdt, cy - rad - wdt, cx + rad + wdt, cy + rad + wdt],
                  outline=col + (alpha,), width=wdt)
    d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad],
              outline=col + (255,), width=6)

# Wet street: long vertical reflections under each sign.
for (sx, sy, sw, sh) in signs:
    col = NEONS[signs.index((sx, sy, sw, sh)) % len(NEONS)]
    for _ in range(26):
        x = rng.randint(sx, sx + sw)
        y0 = rng.randint(HORIZON + 10, H - 120)
        ln = rng.randint(40, 190)
        d.line([x, y0, x + rng.randint(-6, 6), y0 + ln],
               fill=col + (rng.randint(24, 80),), width=rng.randint(1, 3))

# A few silhouetted figures with neon rim light, walking the avenue.
for fx, fh, col in ((520, 190, (255, 46, 136)), (900, 210, (46, 230, 255)),
                    (1240, 175, (255, 120, 40))):
    fy = HORIZON + 150 + rng.randint(-20, 120)
    d.ellipse([fx - 16, fy - fh, fx + 16, fy - fh + 32], fill=(8, 4, 14, 255))
    d.rounded_rectangle([fx - 22, fy - fh + 30, fx + 22, fy - 40],
                        radius=12, fill=(8, 4, 14, 255))
    d.line([fx - 12, fy - 40, fx - 16, fy], fill=(8, 4, 14, 255), width=9)
    d.line([fx + 12, fy - 40, fx + 16, fy], fill=(8, 4, 14, 255), width=9)
    d.line([fx - 20, fy - fh + 44, fx - 24, fy - 40], fill=col + (200,), width=3)

# Soften + grain, then save.
img = img.filter(ImageFilter.GaussianBlur(0.5))
noise = Image.effect_noise((W, H), 22).convert("RGB")
img = Image.blend(img, noise, 0.05)
img.save(OUT, "JPEG", quality=88)
print(f"wrote {OUT} {img.size}")
