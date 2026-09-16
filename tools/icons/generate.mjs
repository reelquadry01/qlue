// One-shot Qlue icon renderer (no dependencies, stdlib only).
//
// Usage: `node tools/icons/generate.mjs`
//
// Draws the Q-monogram used by the app shell, the install banner and the
// maskable icon, then writes plain PNGs into `public/icons/`. The art is
// generated from math (an annulus + a rotated tail), so it stays crisp at
// every launcher size and never needs a font on the build machine.

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(root, 'public', 'icons');

// Brand: deep-space background, violet-to-pink gradient band, white Q.
const BACKGROUND = [12, 10, 26];
const GRADIENT_START = [168, 85, 247];
const GRADIENT_END = [244, 114, 182];
const GLYPH = [255, 255, 255];

function lerpChannel(a, b, t) {
  return Math.round(a + (b - a) * t);
}

/** Fill `rgba` (Uint8Array) with the artwork for one `size` x `size` icon. */
function paint(rgba, size, { ringBand = 0.52, tail = true } = {}) {
  const center = (size - 1) / 2;
  const outer = size * 0.32;
  const inner = size * 0.185;
  const thickness = outer - inner;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      rgba[i] = BACKGROUND[0];
      rgba[i + 1] = BACKGROUND[1];
      rgba[i + 2] = BACKGROUND[2];
      rgba[i + 3] = 255;
    }
  }

  const dist = (x, y) => Math.hypot(x - center, y - center);

  for (let y = 0; y < size; y += 1) {
    // Gently diagonal gradient so the 512px launcher tile has depth.
    const rowT = y / (size - 1);
    for (let x = 0; x < size; x += 1) {
      const d = dist(x, y);
      if (d > outer || d < inner) continue;
      // Sampling the band across the ring so opposite sides carry the
      // violet and pink ends of the gradient.
      const bandT = (Math.atan2(y - center, x - center) / Math.PI + 1) / 2;
      const glow = 0.85 + 0.15 * (1 - (d - inner) / thickness);
      const i = (y * size + x) * 4;
      rgba[i] = Math.min(255, Math.round(lerpChannel(GRADIENT_START[0], GRADIENT_END[0], bandT * ringBand + rowT * (1 - ringBand)) * glow));
      rgba[i + 1] = Math.min(255, Math.round(lerpChannel(GRADIENT_START[1], GRADIENT_END[1], bandT * ringBand + rowT * (1 - ringBand)) * glow));
      rgba[i + 2] = Math.min(255, Math.round(lerpChannel(GRADIENT_START[2], GRADIENT_END[2], bandT * ringBand + rowT * (1 - ringBand)) * glow));
      rgba[i + 3] = 255;
    }
  }

  // The Q tail: a rotated bar crossing the lower-right of the ring.
  if (tail) {
    const angle = Math.PI / 4;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tailLength = size * 0.2;
    const tailWidth = size * 0.06;
    const start = size * 0.08;
    for (let t = 0; t < tailLength; t += 0.5) {
      for (let w = -tailWidth / 2; w < tailWidth / 2; w += 0.5) {
        // Start just inside the ring and walk outward to the corner.
        const px = center + (inner * 0.55 + start + t) * cos - w * sin;
        const py = center + (inner * 0.55 + start + t) * sin + w * cos;
        const x = Math.round(px);
        const y = Math.round(py);
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const i = (y * size + x) * 4;
        rgba[i] = GLYPH[0];
        rgba[i + 1] = GLYPH[1];
        rgba[i + 2] = GLYPH[2];
        rgba[i + 3] = 255;
      }
    }
  }

  // Crisp inner disc so small sizes stay legible instead of turning to mush.
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const d = dist(x, y);
      if (d >= inner) continue;
      const i = (y * size + x) * 4;
      rgba[i] = BACKGROUND[0];
      rgba[i + 1] = BACKGROUND[1];
      rgba[i + 2] = BACKGROUND[2];
      rgba[i + 3] = 255;
    }
  }
}

/** Wrap raw RGBA scanlines in a minimal PNG (8-bit truecolor+alpha). */
function encodePng(rgba, size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = crc32(body);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0);
    return Buffer.concat([length, body, crcBuf]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function writeIcon(name, size, options) {
  const rgba = new Uint8ClampedArray(size * size * 4);
  paint(rgba, size, options);
  writeFileSync(join(outDir, name), encodePng(rgba, size));
  console.log(`wrote ${name} (${size}x${size})`);
}

mkdirSync(outDir, { recursive: true });
writeIcon('icon-192.png', 192, {});
writeIcon('icon-512.png', 512, {});
writeIcon('icon-maskable-512.png', 512, { ringBand: 0.35, tail: true });