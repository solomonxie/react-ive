# CSS from Scratch

A progressive path through plain CSS: selectors and the box model, flexbox,
grid, responsive design, animation, and theming with custom properties — no
framework, no build step. Each numbered file is a complete, self-contained
HTML page with its own `<style>` block; it contains everything the previous
lesson taught, plus one new concept.

## How to view a lesson

Every lesson is a plain HTML file — open it directly, no server required:

```sh
open 03-layout-grid.html
```

Or with the Makefile:

```sh
make lesson N=03
```

If you'd rather use a URL than `file://`, serve the folder and visit the
lesson in a browser:

```sh
make serve
# then open http://localhost:8000/03-layout-grid.html
```

## Lessons

| File | Concept | What's new |
| --- | --- | --- |
| `01-hello-world.html` | Selectors & box model | Element, class, id, and descendant selectors; margin/border/padding/content made visible |
| `02-layout-flexbox.html` | Flexbox | A flex nav bar and card row with `display: flex`, `justify-content`, `align-items`, `gap` |
| `03-layout-grid.html` | CSS Grid | A page shell (header/sidebar/content/footer) with `display: grid`, `grid-template-columns`, `grid-template-areas` |
| `04-responsive.html` | Responsive design | `@media` breakpoints reflowing the grid and flex layouts; `rem`, `%`, `clamp()` |
| `05-animations.html` | Transitions & animation | `transition` on hover states; a looping `@keyframes` animation |
| `06-custom-properties.html` | Custom properties & theming | `:root` variables driving colors/spacing; a light/dark toggle via a class swap on `<body>` |

## Layout

```
hello-css/
  01-hello-world.html
  02-layout-flexbox.html
  03-layout-grid.html
  04-responsive.html
  05-animations.html
  06-custom-properties.html
  Makefile
```
