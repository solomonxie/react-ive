// Stable application entry point. The lesson runner adds ?lesson=NN to the URL.
import { createApp } from 'vue'

type LessonLoader = () => Promise<typeof import('./01-hello-world.vue')>

const lessons: Record<string, LessonLoader> = {
  '01': () => import('./01-hello-world.vue'),
  '02': () => import('./02-components-and-props.vue'),
  '03': () => import('./03-reactivity.vue'),
  '04': () => import('./04-effects-and-fetching.vue'),
  '05': () => import('./05-routing.vue'),
}

const requestedLesson = new URLSearchParams(window.location.search).get('lesson') ?? '01'
const lesson = lessons[requestedLesson] ? requestedLesson : '01'

if (lesson !== requestedLesson) {
  console.warn(`Unknown lesson "${requestedLesson}". Starting lesson 01 instead.`)
}

const mod = await lessons[lesson]()
const app = createApp(mod.default)
if (mod.router) app.use(mod.router)
app.mount('#app')
