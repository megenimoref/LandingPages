# images — rosh-hashana-moments

## Drop-in files (nothing in index.html needs editing)

Each demo slot loads a `.webp` and silently falls back to a styled `.svg`
placeholder while that file is missing. Add the real file and the placeholder
disappears on its own.

| File | Size | Status | What it is |
|---|---|---|---|
| `before.webp` | 1080×1350 | **in place** | Stock family portrait, cropped 4:5 and centred on the group |
| `after1.webp` | 1080×1350 | **in place** | Style 01 — חגיגי־לבן. White clothing, white linen, shofar and tallit |
| `after2.webp` | 1080×1350 | **in place** | Style 02 — מלכותי. Candlelit terrace table at dusk, generated from `before.webp` |
| `after3.webp` | 1080×1350 | **in place** | Style 03 — מאוייר. 1920s storybook watercolour with honey pots |
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

## Why some files come in pairs

`afterN.webp` / `afterN-clean.webp`, for all three styles.

The `-clean` file is the raw AI output: no lettering, clean sky across the top,
exactly what the current prompt asks for. The file without the suffix is that
same image with a greeting composited on, and it is the one the comparison
slider shows — sliding to an unlettered picture gives away no payoff, so the
demo reveals a finished card.

Keep the `-clean` originals. They are what you re-bake from if the wording,
palette or position changes.

`og-preview.webp` is built from the finished `after2.webp` for the same reason:
a WhatsApp preview should show the product, not an intermediate.

## Two text palettes

The studio renders in one of two: **gold on a dark scrim** for photographs, and
**ink on a cream scrim** for the illustrated style. A dark scrim over the
watercolour's pale sky ruins it, and cream lettering disappears into it — one
palette cannot serve both. `after2` uses dark; `after1` and `after3` use light.
