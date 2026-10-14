#!/usr/bin/env node
/**
 * make_icons.js — render the favicon / app-icon raster set.
 *
 * Emits the same gold K mark the site already uses in its data-URI favicon,
 * at the sizes platforms actually request. SVG data-URIs are still linked in
 * the HTML for modern browsers; these PNGs cover everything else, including
 * Safari pinned tabs and legacy Android home screens.
 *
 * Usage:  node tools/make_icons.js
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.resolve(__dirname, '..');
const GOLD = '#c99a3f';
const GOLD_LT = '#e3c06a';
const BG = '#0a0a0b';

const icon = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="8" y1="10" x2="56" y2="54">
      <stop offset="0%" stop-color="${GOLD_LT}"/>
      <stop offset="100%" stop-color="${GOLD}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="6" fill="${BG}"/>
  <rect x="3.5" y="3.5" width="57" height="57" rx="4" fill="none" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="2.5"/>
  <g fill="none" stroke="url(#g)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 15 V49"/>
    <path d="M24 32 L40 15"/>
    <path d="M24 32 L40 49"/>
  </g>
</svg>`;

// Maskable icons need the mark inside the 80% safe zone, so it is inset and
// the background bleeds to the edges.
const maskable = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="16" y1="18" x2="48" y2="46">
      <stop offset="0%" stop-color="${GOLD_LT}"/>
      <stop offset="100%" stop-color="${GOLD}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" fill="${BG}"/>
  <g transform="translate(32 32) scale(0.62) translate(-32 -32)">
    <g fill="none" stroke="url(#g)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 15 V49"/>
      <path d="M24 32 L40 15"/>
      <path d="M24 32 L40 49"/>
    </g>
  </g>
</svg>`;

const render = (svg, size) => new Resvg(svg, {
  background: BG,
  fitTo: { mode: 'width', value: size },
}).render().asPng();

const targets = [
  ['favicon-32.png', icon(32), 32],
  ['favicon-16.png', icon(16), 16],
  ['apple-touch-icon.png', icon(180), 180],
  ['icon-192.png', icon(192), 192],
  ['icon-512.png', icon(512), 512],
  ['icon-maskable-512.png', maskable(512), 512],
];

for (const [name, svg, size] of targets) {
  const png = render(svg, size);
  fs.writeFileSync(path.join(ROOT, name), png);
  console.log(`  ${name.padEnd(26)} ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
}