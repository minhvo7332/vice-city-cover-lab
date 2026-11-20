#!/usr/bin/env python3
"""Makes the third sample photo: a procedural sunset-drive scene (1600x1200).

Drawn with PIL only — gradient sky, low sun with glow, skyline silhouettes,
palm trees, a wet boulevard with reflections, and grain. Free to use: it is
our own drawing, no photo of a real person, no Rockstar artwork.
Run: python3 tools/makeSample.py  ->  app/samples/sunset-drive.jpg
"""
import math
import random
import sys
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 1200
OUT = "app/samples/sunset-drive.jpg"
# v2: the scene seed is a CLI argument now (default 20261119), so a variant
# can be re-rolled without editing the file: python3 tools/makeSample.py 42
rng = random.Random(int(sys.argv[1]) if len(sys.argv) > 1 else 20261119)

img = Image.new("RGB", (W, H))
px = img.load()

# Sky: deep purple at the top, through magenta, to burning orange at the horizon.
HORIZON = 760
for y in range(H):
    t = y / HORIZON if y < HORIZON else 1.0
    if y < HORIZON:
        r = int(58 + (255 - 58) * t ** 1.6)
        g = int(24 + (120 - 24) * t ** 2.2)
        b = int(96 + (40 - 96) * t ** 1.4)
    else:
        r, g, b = 255, 120, 40
    for x in range(0, W, 4):
        px[x, y] = (r, g, b)
        px[x + 1, y] = (r, g, b)
        px[x + 2, y] = (r, g, b)
        px[x + 3, y] = (r, g, b)

d = ImageDraw.Draw(img, "RGBA")

# Sun glow + disc, low over the boulevard.
sun_x, sun_y, sun_r = 820, 690, 150
for rad, alpha in ((420, 26), (300, 45), (210, 70)):
    d.ellipse([sun_x - rad, sun_y - rad, sun_x + rad, sun_y + rad],
              fill=(255, 200, 110, alpha))
d.ellipse([sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r],
          fill=(255, 236, 180, 255))
d.ellipse([sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r],
          outline=(255, 170, 80, 255), width=6)

# Distant skyline silhouettes, two depths.
def skyline(base_y, h_min, h_max, color, seed):
    r = random.Random(seed)
    x = -20
    while x < W + 40:
        bw = r.randint(60, 150)
        bh = r.randint(h_min, h_max)
        d.rectangle([x, base_y - bh, x + bw, base_y], fill=color)
        # A few lit windows.
        for _ in range(r.randint(2, 9)):
            wx = r.randint(x + 6, x + bw - 10)
            wy = r.randint(base_y - bh + 8, base_y - 12)
            d.rectangle([wx, wy, wx + 5, wy + 7], fill=(255, 214, 120, 200))
        x += bw + r.randint(4, 26)

skyline(HORIZON, 120, 320, (52, 18, 74, 255), 11)
skyline(HORIZON, 60, 190, (34, 10, 52, 255), 23)

# Palm trees: a gently curving trunk, then fronds that arc up and droop down
# (each frond is a quadratic bezier drawn as short thick segments).
def palm(x, base_y, scale, lean):
    top_x = x + lean
    top_y = base_y - int(300 * scale)
    # Curved trunk: sample a quadratic curve from base to crown.
    ctrl_x, ctrl_y = x + lean * 0.4, base_y - int(150 * scale)
    prev = None
    for i in range(25):
        t = i / 24
        cx = (1 - t) ** 2 * x + 2 * (1 - t) * t * ctrl_x + t * t * top_x
        cy = (1 - t) ** 2 * base_y + 2 * (1 - t) * t * ctrl_y + t * t * top_y
        if prev is not None:
            d.line([prev, (cx, cy)], fill=(26, 8, 40, 255),
                   width=max(2, int(11 * scale * (1 - t * 0.5))))
        prev = (cx, cy)
    # Fronds: 7 arcs fanning out, each rising then drooping.
    for k in range(7):
        spread = -0.95 + 0.32 * k  # -0.95 .. 0.97 radians from vertical
        length = 150 * scale * (0.85 + 0.15 * ((k * 37) % 10) / 10)
        mx = top_x + math.sin(spread) * length * 0.55
        my = top_y - math.cos(spread) * length * 0.35 - 26 * scale
        ex = top_x + math.sin(spread) * length
        ey = top_y + length * 0.52
        prev = (top_x, top_y)
        for i in range(1, 13):
            t = i / 12
            cx = (1 - t) ** 2 * top_x + 2 * (1 - t) * t * mx + t * t * ex
            cy = (1 - t) ** 2 * top_y + 2 * (1 - t) * t * my + t * t * ey
            d.line([prev, (cx, cy)], fill=(26, 8, 40, 255),
                   width=max(2, int(7 * scale * (1 - t * 0.6))))
            prev = (cx, cy)

palm(150, HORIZON + 6, 1.0, 40)
palm(1420, HORIZON + 6, 1.15, -50)
palm(1180, HORIZON + 6, 0.7, 24)

# Wet boulevard: dark asphalt with a sunset reflection streak.
d.rectangle([0, HORIZON, W, H], fill=(24, 10, 30, 255))
for i in range(240):
    x = rng.randint(0, W - 1)
    y = rng.randint(HORIZON + 8, H - 4)
    length = rng.randint(20, 130)
    alpha = rng.randint(18, 70)
    warm = rng.random() < 0.7
    col = (255, 140, 70, alpha) if warm else (255, 80, 140, alpha)
    d.line([x, y, x + rng.randint(-8, 8), y + length], fill=col, width=rng.randint(1, 3))

# Lane dashes receding to the sun.
for i, t in enumerate([0.0, 0.22, 0.42, 0.60, 0.76, 0.89]):
    y = HORIZON + int((H - HORIZON) * t)
    half = int(8 + 46 * t)
    d.rectangle([sun_x - half, y, sun_x + half, y + int(4 + 10 * t)],
                fill=(255, 220, 130, 220))

# A car silhouette driving into the sunset, with tail lights.
car_y = HORIZON + 150
d.rounded_rectangle([sun_x - 260, car_y, sun_x + 260, car_y + 110],
                    radius=28, fill=(12, 4, 18, 255))
d.rounded_rectangle([sun_x - 170, car_y - 62, sun_x + 150, car_y + 8],
                    radius=24, fill=(12, 4, 18, 255))
d.ellipse([sun_x - 210, car_y + 78, sun_x - 110, car_y + 178], fill=(8, 3, 12, 255))
d.ellipse([sun_x + 110, car_y + 78, sun_x + 210, car_y + 178], fill=(8, 3, 12, 255))
d.rectangle([sun_x - 252, car_y + 30, sun_x - 228, car_y + 52], fill=(255, 60, 60, 255))
d.rectangle([sun_x + 228, car_y + 30, sun_x + 252, car_y + 52], fill=(255, 60, 60, 255))
# Tail-light glow on the wet road.
for rad, alpha in ((180, 30), (110, 55)):
    d.ellipse([sun_x - 250 - rad, car_y + 120 - rad // 3,
               sun_x - 250 + rad, car_y + 120 + rad // 3], fill=(255, 60, 60, alpha))
    d.ellipse([sun_x + 250 - rad, car_y + 120 - rad // 3,
               sun_x + 250 + rad, car_y + 120 + rad // 3], fill=(255, 60, 60, alpha))

# Soften + a whisper of grain, then save.
img = img.filter(ImageFilter.GaussianBlur(0.6))
noise = Image.effect_noise((W, H), 24).convert("RGB")
img = Image.blend(img, noise, 0.05)
img.save(OUT, "JPEG", quality=88)
print(f"wrote {OUT} {img.size}")
