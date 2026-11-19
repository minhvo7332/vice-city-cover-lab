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

/** Loads a bundled sample photo (samples/<name>.jpg). */
export async function loadSample(name) {
  return asPanelPhoto(await loadImage(`samples/${name}.jpg`));
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
