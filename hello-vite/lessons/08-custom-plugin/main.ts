// Lesson 08: use the plugin's results. No file named 'virtual:build-info' exists.
// Open the Network tab: /@id/__x00__virtual:build-info is served by the plugin.
// Open the served /main.ts in the browser: __SHOUT("...") is already replaced.
import { builtAt, name } from 'virtual:build-info'

const out = {
  fromVirtualModule: { name, builtAt },
  fromTransform: __SHOUT('this text was upper-cased by a plugin'),
  versionTxt: await fetch('/version.txt').then((r) => r.text()),
}
document.querySelector('#out')!.textContent = JSON.stringify(out, null, 2)
