# Vice City Cover Lab v2

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/minhvo7332/vice-city-cover-lab/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/minhvo7332/vice-city-cover-lab/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

<sub>Entered on [make.fun](https://make.fun/?ref=vtp8qmbj&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>

A multi-panel GTA-style poster maker: your photo + a caption → cover art
exported as a PNG in 1080×1080, 1080×1350 or 1920×1080.

- **6 multi-panel layouts** — hero strip, quad, trio, solo, plus v2's
  split-panel **wanted poster** (tall hero + two frames, red WANTED stamp)
  and **story vertical** (top frame + strip + bottom frame, built for
  1080×1350). Each panel takes its own photo, or one photo fills them all.
- **Crop and position** — click a panel to select it, drag the preview to pan,
  zoom slider per panel. Sample photos are cached after first load.
- **5 colour grades** — sunset, neon, noir, plus v2's teal/pink **Vice nights**
  and high-contrast two-ink **duotone**, drawn on canvas with a seeded grain.
- **3 caption styles** — bold block, hollow outline, neon glow — plus a
  one-click **Remix** that rolls a fresh layout + grade + caption combo.
- **Bold lettering** — Anton + Archivo Black (SIL Open Font License, shipped
  under `app/fonts/`), white fill with a black outline and hard shadow.
- **Offline** — static files under `app/`, no network request, photos never
  leave the machine. No Rockstar logo, artwork or font anywhere.

## Try it

```sh
node serve.ts   # then open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to `/output` and writes
`/output/dossier.json` with the vendored make.fun library.

## Screenshots

`screenshots/` holds 4 images: the first by name is an exported cover
(1920×1080, wanted poster + Vice nights grade), then the editor with a photo
loaded (neon-glow caption), then the square duotone cover and the portrait
story-vertical cover. Sample photos are the kit's image-model samples plus
procedural sunset and neon scenes (`tools/makeSample.py`,
`tools/makeNeonSample.py`); all are free to use.

## License

MIT — see LICENSE. Fonts under `app/fonts/` are under the SIL Open Font
License 1.1 (see `app/fonts/OFL.txt`).
