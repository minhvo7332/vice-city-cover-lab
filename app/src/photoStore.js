// Photo loading: files from the user's machine (never uploaded) and the
// bundled samples. Every photo becomes { img, zoom, ox, oy } for the renderer.

/** Loads an image from a URL; resolves once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Wraps a loaded image as a panel photo at cover-fit zoom. */
export function asPanelPhoto(img) {
  return { img, zoom: 1, ox: 0, oy: 0 };
}

// Sample photos are small and shared by every panel, so one load serves all:
// the cache keeps the <img> after the first use, but every call still returns
// a fresh { img, zoom, ox, oy } wrapper — panels must pan and zoom on their own.
const sampleImageCache = new Map();

/** Loads a bundled sample photo (samples/<name>.jpg), image cached after first load. */
export async function loadSample(name) {
  let img = sampleImageCache.get(name);
  if (!img) {
    img = await loadImage(`samples/${name}.jpg`);
    sampleImageCache.set(name, img);
  }
  return asPanelPhoto(img);
}

/** Warms the sample cache in the background, so sample buttons feel instant. */
export function preloadSamples(names) {
  for (const name of names) {
    if (!sampleImageCache.has(name)) loadSample(name).catch(() => {});
  }
}

/** Reads a user-picked File into a panel photo via an object URL. */
export async function loadUserFile(file) {
  const url = URL.createObjectURL(file);
  try {
    return asPanelPhoto(await loadImage(url));
  } finally {
    URL.revokeObjectURL(url);
  }
}
