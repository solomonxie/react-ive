# HTMX from Scratch

A progressive path through HTMX: driving the DOM with HTML attributes and
server responses instead of client-side JavaScript. Each numbered file is a
complete, standalone HTML page — the idiomatic HTMX shape, unlike the
single-page-app style used elsewhere in this repo. htmx itself loads from a
pinned CDN script tag; a tiny zero-dependency Node HTTP server serves the
pages and implements the small API endpoints each lesson calls.

## Setup

```sh
cd hello-htmx
npm start
```

or, equivalently:

```sh
cd hello-htmx
make dev
```

Then open http://localhost:3000/ for the lesson menu.

## Lessons

| File | Concept | What's new |
| --- | --- | --- |
| `01-hello-world.html` | Loading htmx, a first swap | A button issues `hx-get`, htmx swaps the response into the page — http://localhost:3000/01-hello-world.html |
| `02-triggers-and-targets.html` | `hx-trigger`, `hx-target`, `hx-swap` | Debounced live search (`keyup changed delay:500ms`), plus `outerHTML` and `beforeend` swap variants — http://localhost:3000/02-triggers-and-targets.html |
| `03-forms.html` | `hx-post`, server-side validation | Form re-renders itself with inline errors or a success state, decided entirely by the server — http://localhost:3000/03-forms.html |
| `04-indicators-and-polling.html` | Loading indicators, polling | `htmx-indicator` spinner class during a slow request; `hx-trigger="every 2s"` keeps a region fresh on a timer — http://localhost:3000/04-indicators-and-polling.html |
| `05-out-of-band-swaps.html` | `hx-swap-oob` | One server response updates the main target and a second, unrelated region (a notification counter) at once — http://localhost:3000/05-out-of-band-swaps.html |

## Layout

```
hello-htmx/
  index.html                        # lesson menu, links to all 5 lessons
  01-hello-world.html
  02-triggers-and-targets.html
  03-forms.html
  04-indicators-and-polling.html
  05-out-of-band-swaps.html
  server.mjs                        # static file server + API routes (node:http only)
  package.json
  Makefile
```
