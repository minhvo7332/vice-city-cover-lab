# Vice City Cover Lab v1

A multi-panel GTA-style poster maker: your photo + a caption → cover art
exported as a PNG in 1080×1080, 1080×1350 or 1920×1080.

- **Multi-panel layouts** — hero strip, quad, trio, solo; each panel takes its
  own photo, or one photo fills them all.
- **Crop and position** — click a panel to select it, drag the preview to pan,
  zoom slider per panel.
- **Colour grades** — sunset, neon, noir, drawn on canvas with a seeded grain.
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
(1920×1080), then the editor with a photo loaded, then the square and
portrait covers. Sample photos are the kit's image-model samples plus a
procedural sunset scene (`tools/makeSample.py`); all are free to use.

## License

MIT — see LICENSE. Fonts under `app/fonts/` are under the SIL Open Font
License 1.1 (see `app/fonts/OFL.txt`).
