#!/usr/bin/env node
/**
 * make_social_card.js — render the 1200x630 social share card as a PNG.
 *
 * Builds the card as SVG (so text uses real font metrics rather than a
 * hand-rolled bitmap font) and rasterises it with @resvg/resvg-js.
 * Deterministic, no network, no third-party imagery or licence.
 *
 * Usage:  node tools/make_social_card.js [out.png]
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const W = 1200, H = 630;
const ROOT = path.resolve(__dirname, '..');

const C = {
  bg: '#0a0a0b',
  gold: '#c99a3f',
  goldLt: '#e3c06a',
  goldDk: '#b08947',
  text: '#e8ecf1',
  muted: '#7a8290',
};

// The real company logo, embedded as base64 so the build stays offline and
// deterministic. Its near-black box melts into the card via a blurred mask.
const logoB64 = fs.readFileSync(path.join(ROOT, 'img', 'logo.jpeg')).toString('base64');
const LW = 620, LH = Math.round(LW * 435 / 800), LX = (W - LW) / 2, LY = 96;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="22%" cy="6%" r="62%">
      <stop offset="0%" stop-color="${C.gold}" stop-opacity="0.11"/>
      <stop offset="100%" stop-color="${C.gold}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0 L0 0 0 60" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
    </pattern>
    <filter id="soft" x="-8%" y="-8%" width="116%" height="116%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <mask id="melt">
      <rect x="${LX}" y="${LY}" width="${LW}" height="${LH}" rx="28" fill="#fff" filter="url(#soft)"/>
    </mask>
  </defs>

  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  <image href="data:image/jpeg;base64,${logoB64}" x="${LX}" y="${LY}" width="${LW}" height="${LH}" mask="url(#melt)"/>

  <text x="${W / 2}" y="512" text-anchor="middle"
        font-family="JetBrains Mono, DejaVu Sans Mono, monospace"
        font-size="21" letter-spacing="3" fill="${C.muted}" fill-opacity="0.92">ENTERPRISE CLOUD  ·  SECURITY  ·  AI  ·  INFRASTRUCTURE</text>

  <g stroke="${C.gold}" stroke-opacity="0.32" stroke-width="2">
    <line x1="56" y1="56" x2="${W - 56}" y2="56"/>
    <line x1="56" y1="${H - 56}" x2="${W - 56}" y2="${H - 56}"/>
  </g>
</svg>`;

const out = process.argv[2] || path.join(ROOT, 'og-image.png');
const png = new Resvg(svg, {
  background: C.bg,
  font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' },
  fitTo: { mode: 'width', value: W },
}).render().asPng();

fs.writeFileSync(out, png);
console.log(`wrote ${out}  (${(png.length / 1024).toFixed(0)} KB, ${W}x${H})`);