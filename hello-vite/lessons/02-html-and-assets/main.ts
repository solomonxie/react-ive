// Lesson 02: index.html is the entry, and imports are how things get in.
//
// In older tools (webpack) a JS file was the entry. In Vite, index.html is.
// Vite reads it, finds <script type="module">, and follows imports from there.
// The same follows for <link> and <img> tags inside the HTML.
//
// What you can import:
//  - CSS: `import './style.css'` adds the styles to the page (and in a build,
//    extracts them to a .css file).
//  - JSON: becomes a JS object, with named imports if you want them.
//  - Images and other files: the import gives you a URL string. In a build the
//    file gets a hashed name (logo-3f2a1b.svg) so browsers can cache it forever.
//  - `?raw` gives the file's text, `?url` forces a URL.
//
// In a real app: svgs are imported as `foo.svg?react` (lesson 03), big
// libraries can be imported as `?raw` strings for custom pages, and
// public-style files (like version.txt) are served from the site root.
import './style.css'
import data from './data.json'
import logoUrl from './logo.svg'
import styleText from './style.css?raw'

document.querySelector<HTMLImageElement>('#logo')!.src = logoUrl

document.querySelector('#out')!.textContent = JSON.stringify(
  {
    logoUrl,
    json: data,
    cssLengthAsText: styleText.length,
    publicFileIsAt: '/favicon.svg (not imported, just served)',
  },
  null,
  2,
)
