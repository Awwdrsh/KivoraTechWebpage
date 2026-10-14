# Kivora Tech website

Static site for Kivora Tech Pvt. Ltd. No build step, no framework, no
dependencies. Served straight from GitHub Pages.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The page. |
| `styles.css` | All styling. |
| `main.js` | All behaviour. |
| `privacy.html` / `terms.html` / `security.html` | Legal pages. |
| `404.html` | Not-found page. |
| `icons/tech/` | 26 technology SVGs used by the tooling marquee. |
| `img/` | Team photos (WebP + PNG fallback), Aleena's monogram avatar, and `logo.jpeg` — the original raster logo, used untouched in the header, footer and share card. |
| `og-image.png` | 1200x630 social share card (embeds the real logo). |
| `favicon-*.png`, `apple-touch-icon.png`, `icon-*.png` | Favicon / PWA icons. |
| `site.webmanifest` | PWA manifest. |
| `tools/` | Generators for the share card, icons and photo avatars. |
| `img/logo.jpeg` | Original raster logo. Presented as a tile, never re-encoded. |

Content lives directly in the HTML. There is no JSON and no generator step for
the page itself — edit the markup.

## Regenerating images

The share card embeds the real logo; the icon set is drawn from the brand
palette and rasterised with `@resvg/resvg-js`, so there is no stock
photography, no AI-generated imagery, no third-party licence and no
watermark. Output is deterministic.

```sh
npm install @resvg/resvg-js
node tools/make_social_card.js    # -> og-image.png (1200x630)
node tools/make_icons.js          # -> favicon + PWA icon set
node tools/make_avatars.js        # -> img/avatar-*.png
```

Keep the card at 1200x630 — X, LinkedIn, Slack and Facebook all crop around
that ratio.

### Founder avatars

Aleena has a geometric monogram (`tools/make_avatars.js`) because we have no
photograph of her and will not generate a photorealistic face for a real,
named person who has not agreed to it.

Aadarsha has a real photograph. To regenerate the crops from the source:

```sh
npm install sharp
node tools/make_photo_avatar.js img/aadarsha-source.jpg aadarsha
node tools/make_photo_avatar.js img/manik-source.jpg manik 243 275 196
```

Crop arguments are `left top size` in source pixels (defaults fit Aadarsha's
photo). Output is WebP with a PNG fallback, served through `<picture>`.

`img/aadarsha-source.jpg` came from Aadarsha's LinkedIn profile. **Do not
hotlink LinkedIn CDN URLs** — they are signed and expire (this one lapsed
2026-10-29). Self-host, and confirm he is happy to be on a public page.
Once you have his original file you can delete the source and adjust the
crop in-repo.

## What this site claims

The site is deliberately conservative, and that is a decision, not an oversight.

It states plainly that Kivora is a three-person firm founded in 2026, that we
are **not SOC 2 certified**, and that we publish **no client names, case
studies or testimonials** — because none have cleared the bar of being real
and consented to.

The old version of this site claimed 500+ enterprise customers, 340 engineers,
42 regions, 15B daily requests, SOC 2 Type II certification, 40+ patents, and
featured invented testimonials from people at invented companies, alongside
Docker, Netflix and Stripe presented as customers. None of it was true. The
first serious security questionnaire would have exposed it.

If you win a client engagement, add the case study — with written permission,
and a real metric. That is what turns this page into a sales asset.

## Before publishing

- **Legal pages** contain `<span class="placeholder">` markers where real
  answers are required: jurisdiction, company registration number, retention
  periods, subprocessors, SLA terms, governing law. Have them reviewed.
- **Security page** asks you to confirm remediation targets and test cadence.
  It already states we are not SOC 2 certified — keep that line.

## Deploy

Push to `main`. GitHub Pages serves the repository root at
`www.kivoratech.com.np`.
