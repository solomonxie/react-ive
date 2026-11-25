// Lesson 01: the dev server. No framework, no bundling.
//
// `vite` starts a server. Vite does NOT bundle your code in dev. The browser
// requests /main.ts, Vite turns the TypeScript into JavaScript on the fly and
// sends it. Each `import` becomes another request. Open the Network tab and
// look at the list of files: that is the whole idea.
//
// In a real app: `npm start` often runs `vite --host`. That is this same server, just
// with a lot more modules, and vite.config.ts `server: { port, strictPort }`
// choosing where it listens.
import { render } from './counter.ts'

const app = document.querySelector<HTMLDivElement>('#app')!
const button = document.createElement('button')
const label = document.createElement('p')
app.append(button, label)
button.textContent = 'click me'

let count = 0
let hotCount = import.meta.hot?.data.count
if (typeof hotCount === 'number') count = hotCount

button.addEventListener('click', () => {
  count += 1
  render(label, count)
})
render(label, count)

if (import.meta.hot) {
  // Keep our state when THIS file is edited, by stashing it before the swap.
  import.meta.hot.dispose((data) => {
    data.count = count
  })
  // Accept updates to counter.ts and re-render with the new code.
  import.meta.hot.accept('./counter.ts', (mod) => {
    mod?.render(label, count)
  })
}
