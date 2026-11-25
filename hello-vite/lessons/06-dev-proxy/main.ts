// Lesson 06: call /api/hello (relative, same origin). Vite proxies it to :4000.
// Then try the direct URL below and see the CORS error in the console.
const out = document.querySelector('#out')!

const viaProxy = await fetch('/api/hello').then((r) => r.json())
out.textContent = 'via proxy:\n' + JSON.stringify(viaProxy, null, 2)

try {
  await fetch('http://localhost:4000/api/hello')
} catch (error) {
  out.textContent += '\n\ndirect call failed (CORS): ' + String(error)
}
