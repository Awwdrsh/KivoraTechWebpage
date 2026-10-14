#!/usr/bin/env node
/**
 * make_photo_avatar.js — turn a supplied photo into team-avatar sizes.
 *
 * Crops to a square centred on the subject, then emits WebP (and a PNG
 * fallback) via sharp. Photographs must not go out as PNG: the same crop
 * is ~400 KB as PNG and ~12 KB as WebP.
 *
 * The output is self-hosted. Do NOT hotlink a LinkedIn CDN URL — those are
 * signed and expire (this source expired 2026-10-29), and republishing
 * someone's profile photo needs their agreement.
 *
 * Usage:  node tools/make_photo_avatar.js <source> <out-basename>
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');

const src = process.argv[2];
const base = process.argv[3] || 'aadarsha';
if (!src || !fs.existsSync(src)) {
  console.error('usage: node tools/make_photo_avatar.js <source> <out-basename>');
  process.exit(1);
}

// Square crop window in source pixels — frames head and shoulders.
// Defaults fit Aadarsha's photo; override per subject: left top size.
const CROP = {
  left: Number(process.argv[4] ?? 400),
  top: Number(process.argv[5] ?? 280),
  size: Number(process.argv[6] ?? 340),
};

const SIZES = [512, 288, 144, 96];
const dir = path.join(ROOT, 'img');
fs.mkdirSync(dir, { recursive: true });

(async () => {
  for (const size of SIZES) {
    const extract = {
      left: CROP.left, top: CROP.top, width: CROP.size, height: CROP.size,
    };
    const pipe = sharp(src).extract(extract).resize(size, size, { fit: 'cover' });

    const webp = await pipe.clone().webp({ quality: 82, effort: 5 }).toBuffer();
    fs.writeFileSync(path.join(dir, `${base}-${size}.webp`), webp);

    // PNG fallback for the single largest size only
    if (size === 512) {
      const png = await pipe.clone().png({ quality: 80, compressionLevel: 9, palette: true }).toBuffer();
      fs.writeFileSync(path.join(dir, `${base}-512.png`), png);
      console.log(`  ${`${base}-512.png`.padEnd(22)} 512x512  ${(png.length / 1024).toFixed(1)} KB`);
    }
    console.log(`  ${`${base}-${size}.webp`.padEnd(22)} ${size}x${size}  ${(webp.length / 1024).toFixed(1)} KB`);
  }
  console.log('\n  self-hosted. Confirm the subject is happy to appear on a public page.');
})();