import * as THREE from "three";

/** Smooth filtering — reduces blocky/mosaic look when rotating at grazing angles. */
export function configureTexture(tex, repeat = [1, 1]) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 16;
  tex.colorSpace = tex.colorSpace ?? THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function smoothGrain(x, y) {
  return Math.sin(y * 0.14) * 4 + Math.cos(x * 0.11 + y * 0.06) * 3 + Math.sin((x + y) * 0.09) * 2;
}

export function createBrushedMetalMap(w = 512, h = 512, base = [160, 168, 178]) {
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const streak = smoothGrain(x, y);
      data[i] = Math.min(255, Math.max(0, base[0] + streak));
      data[i + 1] = Math.min(255, Math.max(0, base[1] + streak));
      data[i + 2] = Math.min(255, Math.max(0, base[2] + streak));
      data[i + 3] = 255;
    }
  }
  return configureTexture(new THREE.DataTexture(data, w, h), [1.5, 1.5]);
}

/** Soft round vent holes (no hard 8px checker blocks). */
export function createGrilleAlphaMap(w = 256, h = 256) {
  const data = new Uint8Array(w * h * 4);
  const cell = 20;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const ux = (x % cell) / cell - 0.5;
      const uy = (y % cell) / cell - 0.5;
      const dist = Math.sqrt(ux * ux + uy * uy);
      let alpha = 255;
      if (dist < 0.16) alpha = 35;
      else if (dist < 0.24) alpha = 35 + ((dist - 0.16) / 0.08) * 220;
      data[i] = 200;
      data[i + 1] = 210;
      data[i + 2] = 220;
      data[i + 3] = Math.round(alpha);
    }
  }
  const tex = new THREE.DataTexture(data, w, h);
  tex.format = THREE.RGBAFormat;
  return configureTexture(tex, [3, 3]);
}

export function createPanelGradientMap(w = 512, h = 128, tint = [90, 110, 130]) {
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = 0.88 + (y / h) * 0.1;
      const n = smoothGrain(x, y) * 0.4;
      data[i] = Math.min(255, Math.max(0, tint[0] * v + n));
      data[i + 1] = Math.min(255, Math.max(0, tint[1] * v + n));
      data[i + 2] = Math.min(255, Math.max(0, tint[2] * v + n));
      data[i + 3] = 255;
    }
  }
  return configureTexture(new THREE.DataTexture(data, w, h), [1, 1]);
}

/** Vent perforation baked into albedo (replaces hundreds of hole cylinders). */
export function createPerforatedPanelMap(w = 256, h = 256) {
  const data = new Uint8Array(w * h * 4);
  const cell = 18;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const ux = (x % cell) / cell - 0.5;
      const uy = (y % cell) / cell - 0.5;
      const dist = Math.sqrt(ux * ux + uy * uy);
      const base = 74;
      const dark = 28;
      const t = dist < 0.14 ? 0 : dist < 0.2 ? (dist - 0.14) / 0.06 : 1;
      const c = dark + (base - dark) * t + smoothGrain(x, y) * 0.3;
      data[i] = c + 4;
      data[i + 1] = c + 8;
      data[i + 2] = c + 12;
      data[i + 3] = 255;
    }
  }
  return configureTexture(new THREE.DataTexture(data, w, h), [2, 2]);
}

/** Light datacenter floor — clearly brighter than scene background. */
export function createFloorTileMap(w = 512, h = 512) {
  const data = new Uint8Array(w * h * 4);
  const tile = 128;
  const light = [90, 112, 136];
  const lightAlt = [107, 132, 152];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const checker = (Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0;
      const base = checker ? light : lightAlt;
      const n = smoothGrain(x, y) * 0.12;
      data[i] = Math.min(255, base[0] + n);
      data[i + 1] = Math.min(255, base[1] + n);
      data[i + 2] = Math.min(255, base[2] + n);
      data[i + 3] = 255;
    }
  }
  return configureTexture(new THREE.DataTexture(data, w, h), [1.2, 1.2]);
}

export function createLabelTexture(text, w = 256, h = 48) {
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const border = x < 4 || x > w - 5 || y < 3 || y > h - 4;
      const bg = border ? 55 : 38;
      data[i] = bg;
      data[i + 1] = bg + 6;
      data[i + 2] = bg + 12;
      data[i + 3] = 255;
    }
  }
  const tex = configureTexture(new THREE.DataTexture(data, w, h), [1, 1]);
  tex.userData.label = text;
  return tex;
}
