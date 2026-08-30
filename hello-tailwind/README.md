# Tailwind CSS from Scratch

A progressive path through Tailwind CSS v4: plain HTML pages styled entirely
with utility classes, no JavaScript framework. Each numbered lesson is a
complete, self-contained page — it carries forward the markup and utilities
from the previous step, plus one new concept. All lessons link the same
compiled `dist/output.css`, since Tailwind scans every HTML file for classes
in use and compiles them into one shared stylesheet.

## Setup

```sh
cd hello-tailwind
npm install
npm run build
```

## How to view a lesson

Open the numbered HTML file directly in a browser, or use the Makefile:

```sh
make lesson N=03
```

This builds `dist/output.css` if needed, then opens `03-*.html`.

## Lessons

| File | Concept | What's new |
| --- | --- | --- |
| `01-hello-world.html` | Setup, first utilities | Typography, spacing, and color utility classes on a simple page |
| `02-layout.html` | Flexbox & grid | A nav + sidebar + content layout with a card grid, built with `flex` and `grid` |
| `03-responsive.html` | Responsive variants | `sm:`/`md:`/`lg:` breakpoint prefixes reflow lesson 02's layout for mobile, tablet, and desktop |
| `04-states.html` | Interactive & dark-mode variants | `hover:`, `focus:`, and `dark:` on buttons and form inputs |
| `05-theming.html` | CSS-first theming | A custom `@theme` block (brand colors, display font) plus `@apply`-based component classes |

## Layout

```
hello-tailwind/
  src/
    input.css           # @import "tailwindcss"; @theme block; @apply components
  01-hello-world.html
  02-layout.html
  03-responsive.html
  04-states.html
  05-theming.html
  dist/
    output.css          # compiled stylesheet, shared by every lesson (generated)
  package.json
  Makefile
```
