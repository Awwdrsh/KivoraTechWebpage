#!/usr/bin/env node
/**
 * make_avatars.js — founder avatar tiles.
 *
 * Geometric monogram tiles, not photographs. These are real, named, public
 * people, and generating a photorealistic face for someone who has not
 * consented to it would put a false likeness of them on a marketing page.
 * A designed monogram says the same thing honestly: this is a person, here
 * is who to contact.
 *
 * Deterministic — same name always yields the same tile.
 *
 * Usage:  node tools/make_avatars.js
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.resolve(__dirname, '..');
const FONT_DIR = path.join(__dirname, 'fonts');

const C = {
  bg: '#0a0a0b',
  tile: '#141416',
  gold: '#c99a3f',
  goldLt: '#e3c06a',
  goldDk: '#b08947',
  text: '#e8ecf1',
  muted: '#8a919d',
};

const S = 512; // output size

/* deterministic hash so a name always maps to the same motif */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* ---- motifs: low-contrast structure behind the monogram ---- */

function arcs(seed) {
  const cx = 140 + (seed % 100), cy = 140 + ((seed >> 3) % 100);
  let out = '';
  for (let i = 0; i < 10; i++) {
    const r = 90 + i * 34;
    out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.gold}" stroke-opacity="${(0.2 - i * 0.018).toFixed(3)}" stroke-width="1.6"/>`;
  }
  return out;
}

function hexGrid(seed) {
  const s = 96, w = Math.sqrt(3) * s, h = 1.5 * s;
  let out = '';
  const off = seed % 40;
  for (let row = -1; row * h < S + 200; row++) {
    for (let col = -1; col * w < S + 200; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0) + off;
      const cy = row * h;
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        pts.push(`${(cx + s * 0.94 * Math.cos(a)).toFixed(1)},${(cy + s * 0.94 * Math.sin(a)).toFixed(1)}`);
      }
      out += `<polygon points="${pts.join(' ')}" fill="none" stroke="${C.gold}" stroke-opacity="0.13" stroke-width="1.5"/>`;
    }
  }
  return out;
}

function ticks(seed) {
  const cx = S / 2, cy = S / 2;
  let out = '';
  const n = 60;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const long = i % 5 === 0;
    const len = long ? 62 + ((seed >> (i % 8)) & 15) : 22 + ((seed >> (i % 5)) & 7);
    const r0 = 244;
    out += `<line x1="${(cx + r0 * Math.cos(a)).toFixed(1)}" y1="${(cy + r0 * Math.sin(a)).toFixed(1)}" x2="${(cx + (r0 - len) * Math.cos(a)).toFixed(1)}" y2="${(cy + (r0 - len) * Math.sin(a)).toFixed(1)}" stroke="${C.gold}" stroke-opacity="${long ? 0.32 : 0.17}" stroke-width="${long ? 2.6 : 1.5}" stroke-linecap="round"/>`;
  }
  out += `<circle cx="${cx}" cy="${cy}" r="204" fill="none" stroke="${C.gold}" stroke-opacity="0.14" stroke-width="1.5"/>`;
  return out;
}

function iso(seed) {
  const gap = 52, off = seed % 30;
  let out = '';
  for (let i = -S; i < S * 2; i += gap) {
    out += `<line x1="${i + off}" y1="-40" x2="${i + off - S}" y2="${S + 40}" stroke="${C.gold}" stroke-opacity="0.14" stroke-width="1.5"/>`;
  }
  return out;
}

const MOTIFS = { arcs, hex: hexGrid, ticks, iso };
const MOTIF_NAMES = Object.keys(MOTIFS);

/* ---- tile ---- */

function tile({ initials, name, role }) {
  const seed = hash(name);
  const motif = MOTIFS[MOTIF_NAMES[seed % MOTIF_NAMES.length]];
  const gx = 120 + (seed % 120), gy = 80 + ((seed >> 5) % 120);
  const id = 'g' + (seed % 99999);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <linearGradient id="mono${id}" gradientUnits="userSpaceOnUse" x1="130" y1="180" x2="382" y2="330">
      <stop offset="0%" stop-color="${C.goldLt}"/>
      <stop offset="55%" stop-color="${C.gold}"/>
      <stop offset="100%" stop-color="${C.goldDk}"/>
    </linearGradient>
    <radialGradient id="glow${id}" cx="${gx}px" cy="${gy}px" r="360">
      <stop offset="0%" stop-color="${C.gold}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${C.gold}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="scrim${id}" cx="${S / 2}px" cy="${S / 2}px" r="190">
      <stop offset="0%" stop-color="${C.tile}" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="${C.tile}" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="${C.tile}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="clip${id}"><rect width="${S}" height="${S}" rx="0"/></clipPath>
  </defs>

  <g clip-path="url(#clip${id})">
    <rect width="${S}" height="${S}" fill="${C.tile}"/>
    <rect width="${S}" height="${S}" fill="url(#glow${id})"/>
    ${motif(seed)}
    <circle cx="${S / 2}" cy="${S / 2}" r="190" fill="url(#scrim${id})"/>
    <text x="${S / 2}" y="${S / 2 + 62}" text-anchor="middle"
          font-family="Space Grotesk" font-size="168" font-weight="700"
          letter-spacing="6" fill="url(#mono${id})">${initials}</text>
  </g>
  <rect x="10" y="10" width="${S - 20}" height="${S - 20}" rx="2" fill="none"
        stroke="${C.gold}" stroke-opacity="0.4" stroke-width="2"/>
</svg>`;
}

const PEOPLE = [
  { file: 'avatar-an.png', initials: 'AN', name: 'Aleena Neupane', role: 'Co-Founder & CEO' },
  { file: 'avatar-ak.png', initials: 'AK', name: 'Aadarsha Kc', role: 'AI, Infrastructure & Security' },
];

if (!fs.existsSync(FONT_DIR)) {
  console.error('missing ' + FONT_DIR + ' — run: npm run fonts');
  process.exit(1);
}
const fontFiles = fs.readdirSync(FONT_DIR)
  .filter((f) => f.endsWith('.ttf') || f.endsWith('.otf'))
  .map((f) => path.join(FONT_DIR, f));

for (const p of PEOPLE) {
  const svg = tile(p);
  for (const size of [512, 128]) {
    const png = new Resvg(svg, {
      background: C.tile,
      font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Space Grotesk' },
      fitTo: { mode: 'width', value: size },
    }).render().asPng();
    const out = size === 512 ? p.file : p.file.replace('.png', '-128.png');
    fs.writeFileSync(path.join(ROOT, 'img', out), png);
    console.log(`  ${out.padEnd(20)} ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
  }
}