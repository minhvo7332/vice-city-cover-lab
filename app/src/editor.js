// Wires the editor: photo slots, layout / grade / size controls, caption
// inputs, drag-to-pan on the preview, and PNG export at the chosen size.
// The preview canvas IS the export canvas: what you see is what you get.

import { EXPORT_SIZES, renderCover, panelAt } from './coverRenderer.js';
import { loadSample, loadUserFile } from './photoStore.js';
import { runShotScene } from './shotScenes.js';

const canvas = document.getElementById('preview');
const liveLine = document.getElementById('liveLine');
const status = document.getElementById('status');
const zoomInput = document.getElementById('zoom');
const panelHint = document.getElementById('panelHint');
const slotsBox = document.getElementById('slots');

const state = {
  layout: 'heroStrip',
  grade: 'sunset',
  size: 'square',
  title: 'VICE CITY NIGHTS',
  subtitle: 'A sunset heist in four frames',
  kicker: 'COVER LAB · EST. 2026',
  photos: [null, null, null, null],
  selected: 0,
};

const SLOT_NAMES = ['Panel 1 · hero', 'Panel 2', 'Panel 3', 'Panel 4'];

/** Redraws the preview and refreshes the live counters. */
function paint() {
  renderCover(canvas, state);
  const loaded = state.photos.filter((p) => p && p.img).length;
  const size = EXPORT_SIZES[state.size];
  liveLine.textContent =
    `${state.layout === 'solo' ? 1 : state.layout === 'trio' ? 3 : 4} panels · ` +
    `${loaded} photo${loaded === 1 ? '' : 's'} loaded · ${size.label} · ${state.grade} grade`;
  panelHint.textContent =
    `Panel ${state.selected + 1} selected — drag the preview to pan its photo.`;
  document.querySelectorAll('.slot').forEach((el, i) => {
    el.classList.toggle('selected', i === state.selected);
  });
  zoomInput.value = String(Math.round(((state.photos[state.selected] || {}).zoom || 1) * 100));
}

/** Builds the four photo slot cards (file pickers + names). */
function buildSlots() {
  SLOT_NAMES.forEach((name, i) => {
    const label = document.createElement('label');
    label.className = 'slot';
    label.innerHTML = `<b>${name}</b><span data-name>No photo yet</span><input type="file" accept="image/*">`;
    label.querySelector('input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        state.photos[i] = await loadUserFile(file);
        state.selected = i;
        label.querySelector('[data-name]').textContent = file.name;
        status.textContent = `Loaded ${file.name} into panel ${i + 1}.`;
        paint();
      } catch {
        status.textContent = 'That file could not be read as an image.';
      }
    });
    label.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        state.selected = i;
        paint();
      }
    });
    slotsBox.appendChild(label);
  });
}

/** A segmented control: one group of buttons sharing one state key. */
function wireSegment(id, key, onChange) {
  const seg = document.getElementById(id);
  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    seg.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
    btn.classList.add('on');
    const attr = btn.dataset.layout || btn.dataset.grade || btn.dataset.size;
    state[key] = attr;
    if (key === 'layout' && state.selected >= (state.layout === 'solo' ? 1 : state.layout === 'trio' ? 3 : 4)) {
      state.selected = 0;
    }
    onChange();
    paint();
  });
}

wireSegment('layoutSeg', 'layout', () => {});
wireSegment('gradeSeg', 'grade', () => {});
wireSegment('sizeSeg', 'size', () => {});

for (const [id, key] of [['kicker', 'kicker'], ['title', 'title'], ['subtitle', 'subtitle']]) {
  document.getElementById(id).addEventListener('input', (e) => {
    state[key] = e.target.value;
    paint();
  });
}

zoomInput.addEventListener('input', () => {
  const photo = state.photos[state.selected];
  if (!photo) return;
  photo.zoom = Number(zoomInput.value) / 100;
  paint();
});

document.querySelectorAll('[data-sample]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      const photo = await loadSample(btn.dataset.sample);
      state.photos[state.selected] = photo;
      const slot = slotsBox.children[state.selected];
      if (slot) slot.querySelector('[data-name]').textContent = `${btn.dataset.sample}.jpg (sample)`;
      status.textContent = `Sample ${btn.dataset.sample} loaded into panel ${state.selected + 1}.`;
      paint();
    } catch {
      status.textContent = 'That sample could not be loaded.';
    }
  });
});

/** Drag-to-pan: pointer down picks a panel, drag pans its photo inside it. */
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  const panel = panelAt(state, x, y);
  if (panel < 0) return;
  state.selected = panel;
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add('dragging');
  drag = { x, y };
  paint();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  const photo = state.photos[state.selected] || (state.photos.find((p) => p && p.img) ?? null);
  if (photo) {
    photo.ox = (photo.ox || 0) + (x - drag.x) / canvas.width;
    photo.oy = (photo.oy || 0) + (y - drag.y) / canvas.height;
  }
  drag = { x, y };
  paint();
});
const endDrag = () => {
  drag = null;
  canvas.classList.remove('dragging');
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

/** Export: the preview canvas already holds the cover at export size. */
document.getElementById('export').addEventListener('click', () => {
  const size = EXPORT_SIZES[state.size];
  canvas.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Export failed — try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-city-cover-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    status.textContent = `Saved vice-city-cover-${size.w}x${size.h}.png (${size.label}).`;
  }, 'image/png');
});

buildSlots();

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  // Screenshot scene: fixed photos and caption, no user interaction needed.
  runShotScene(shot, new URLSearchParams(location.search), state, paint).then(() => {
    // Keep the controls in sync with the scene (layout/grade/size buttons).
    const syncSeg = (id, attr, value) => {
      document.querySelectorAll(`#${id} button`).forEach((b) => {
        b.classList.toggle('on', b.dataset[attr] === value);
      });
    };
    syncSeg('layoutSeg', 'layout', state.layout);
    syncSeg('gradeSeg', 'grade', state.grade);
    syncSeg('sizeSeg', 'size', state.size);
    document.getElementById('title').value = state.title;
    document.getElementById('subtitle').value = state.subtitle;
    document.getElementById('kicker').value = state.kicker;
    // And the slot cards: show which sample each panel holds.
    const sampleNames = ['pier', 'boulevard', 'sunset-drive', 'neon-avenue'];
    state.photos.forEach((p, i) => {
      const slot = slotsBox.children[i];
      if (slot && p && p.img) {
        const name = sampleNames.find((n) => p.img.src.includes(n)) || 'sample';
        slot.querySelector('[data-name]').textContent = `${name}.jpg (sample)`;
      }
    });
  }).catch((err) => {
    status.textContent = `Shot scene failed: ${err.message}`;
    window.__shotReady = true;
  });
} else {
  // First paint: two sample photos already loaded, so the cover is alive.
  Promise.all([loadSample('pier'), loadSample('boulevard')]).then(([pier, boulevard]) => {
    state.photos = [pier, boulevard, pier, boulevard];
    const names = ['pier.jpg (sample)', 'boulevard.jpg (sample)'];
    if (slotsBox.children[0]) slotsBox.children[0].querySelector('[data-name]').textContent = names[0];
    if (slotsBox.children[1]) slotsBox.children[1].querySelector('[data-name]').textContent = names[1];
    paint();
  }).catch(() => paint());
  paint();
}
