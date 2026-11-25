// Writes generated/routes.json from src/routes.js. Generated files are
// committed, so CI re-runs this and fails if the result differs (lesson 07).
import { writeFileSync } from 'node:fs'
import { slugify } from '@sample/common'
import { pages } from '../src/routes.js'

const routes = pages.map((title) => ({ title, path: `/${slugify(title)}` }))
const file = new URL('../generated/routes.json', import.meta.url)
writeFileSync(file, JSON.stringify(routes, null, 2) + '\n')
console.log(`wrote ${routes.length} routes`)
