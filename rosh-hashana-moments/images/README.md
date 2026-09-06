# images — rosh-hashana-moments

## Drop-in files (nothing in index.html needs editing)

Each demo slot loads a `.webp` and silently falls back to a styled `.svg`
placeholder while that file is missing. Add the real file and the placeholder
disappears on its own.

| File | Size | Status | What it is |
|---|---|---|---|
| `before.webp` | 1080×1350 | **in place** | Stock family portrait, cropped 4:5 and centred on the group |
| `after1.webp` | 4:5, ~1080×1350 | missing | Style 01 — קולנועי, made with the page's own "cinematic" prompt |
| `after2.webp` | 1080×1350 | **in place** | Style 02 — מלכותי. Candlelit terrace table at dusk, generated from `before.webp` |
| `after3.webp` | 4:5, ~1080×1350 | missing | Style 03 — זהוב, made with the "golden" prompt |
| `og-preview.webp` | 1200×630 | **in place** | Share card: `after2.webp` whole, on a blurred fill of itself so the greeting survives the 1.91:1 crop |

`og-preview.webp` is the one file with no placeholder fallback — Open Graph is
read by scrapers that never run our `onerror` handler, so a missing file means
a blank share preview rather than a stand-in.

## How to produce them

1. Open the live page, click **📋 העתק פרומפט בלבד** on card 01.
2. In ChatGPT or Gemini: upload `before.webp` **first**, then paste the prompt.
   Uploading first matters — the prompt describes edits to an existing image.
3. Save the result as `after1.webp`. Repeat with cards 02 and 03.

To swap in a different source photo, replace `before.webp` (4:5, faces lit and
unobstructed) and regenerate all three `after` files from it.

Converting to webp:

```bash
python -c "from PIL import Image; Image.open('after1.png').save('after1.webp', quality=88)"
```

## Placeholders (keep these)

`ph-before.svg`, `ph-after1.svg`, `ph-after2.svg`, `ph-after3.svg` — hand-drawn
SVG stand-ins referenced by the `onerror` fallback. Leave them in place so the
page never shows a broken image if a webp is renamed or lost.

## Shared logos

`maganim-center.webp`, `oref-haifa.webp`, `shaagat-hari-logo.webp` are copies of
the org logos in the repo root `/images`. Update both if a logo changes.
