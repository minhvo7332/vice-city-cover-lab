// Fixed scenes for screenshots: ?shot=cover shows the cover alone,
// ?shot=editor shows the editor with a photo loaded. The query picks the
// sample, layout, grade, caption and export size. window.__shotReady is set
// once the scene has painted, twice, so a screenshot never catches a half
// painted frame.

import { loadSample } from './photoStore.js';

/** Applies a shot scene to `state`, then calls `paint`. */
export async function runShotScene(shot, query, state, paint) {
  const photoName = query.get('photo') || 'pier';
  const secondName = query.get('photo2') || 'boulevard';
  const thirdName = query.get('photo3') || 'sunset-drive';
  const fourthName = query.get('photo4') || 'neon-avenue';
  const layout = query.get('layout') || 'heroStrip';
  const grade = query.get('grade') || 'sunset';
  const size = query.get('size') || 'square';
  const title = query.get('title') || query.get('caption') || 'VICE CITY NIGHTS';
  const subtitle = query.get('subtitle') || 'A sunset heist in four frames';
  const kicker = query.get('kicker') || 'COVER LAB · EST. 2026';
  const captionStyle = query.get('captionStyle') || 'block';

  const first = await loadSample(photoName);
  const second = await loadSample(secondName);
  const third = await loadSample(thirdName);
  const fourth = await loadSample(fourthName);
  state.photos = [first, second, third, fourth];
  // v2: a shot may nudge a panel's photo vertically (?oy3=0.4) so a wide
  // short panel frames the subject instead of cropping it out.
  state.photos.forEach((photo, i) => {
    const oy = Number(query.get(`oy${i + 1}`));
    if (Number.isFinite(oy) && oy !== 0) photo.oy = oy;
  });
  state.layout = layout;
  state.grade = grade;
  state.size = size;
  state.title = title;
  state.subtitle = subtitle;
  state.kicker = kicker;
  state.captionStyle = captionStyle;
  state.selected = 0;

  if (shot === 'cover') document.body.classList.add('shot-cover');
  await document.fonts.ready;
  paint();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
