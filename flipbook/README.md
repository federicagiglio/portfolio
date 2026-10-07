# Flipbook — how to update

The book lives at `yoursite.com/#portfolio`. Code: `flipbook.jsx` + `flipbook.css`.

## Folder contents

| File | Purpose |
|------|---------|
| `web/` | High-quality web copies (max 2800px, JPEG q88) — **these are what the book shows** |
| `web/cover.jpg` | Image set into the red cover |
| `concrete.jpg` | Concrete background (colour-matched to the reference photo) |
| `01.jpg` … | Full-size originals (not loaded by the site) |

## Add / remove / reorder photos

1. Make a web copy of the photo (long edge ≤ 2800px, JPEG ~88% quality, no spaces in the name) and put it in `web/`.
2. Edit the `photos` list at the top of `flipbook.jsx`.

## Layout

- Front cover → endpaper + title page → photos two per spread → endpaper → back cover.
- Cover text is `coverTop` / `coverBottom` in `flipbook.jsx`.
- Turning: arrows, ← → keys, click a page, or drag a page corner. Esc goes back to the site.
