# Flipbook Photos — How to Update

## Folder contents

| File | Purpose |
|------|---------|
| `cover.jpg` | **Front cover image** — replace this with your own photo |
| `back-cover.jpg` | Back cover image (optional — create this file to add a back cover) |
| `01.jpg` … `NN.jpg` | Interior pages, displayed in numbered order |

## How to add / remove / reorder pages

1. Put your photos in this folder named sequentially: `01.jpg`, `02.jpg`, `03.jpg` …
2. Open `flipbook.jsx` and edit the `photos` array at the top of the file to match your filenames.

## How pages are laid out as spreads

- **First spread**: title page (left) + `01.jpg` (right)
- **Second spread**: `02.jpg` (left) + `03.jpg` (right)
- **Third spread**: `04.jpg` (left) + `05.jpg` (right)
- … and so on.

So odd-numbered images always appear on the RIGHT page of a spread, even-numbered on the LEFT.
