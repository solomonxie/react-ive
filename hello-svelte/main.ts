// Stable application entry point. The lesson runner adds ?lesson=NN to the URL.

import { mount, type Component } from 'svelte'

type LessonLoader = () => Promise<{ default: Component }>

const lessons: Record<string, LessonLoader> = {
  '01': () => import('./01-hello-world.svelte'),
  '02': () => import('./02-components-and-props.svelte'),
  '03': () => import('./03-reactivity.svelte'),
  '04': () => import('./04-stores.svelte'),
  '05': () => import('./05-routing.svelte'),
}

const requestedLesson = new URLSearchParams(window.location.search).get('lesson') ?? '01'
const lesson = lessons[requestedLesson] ? requestedLesson : '01'

if (lesson !== requestedLesson) {
  console.warn(`Unknown lesson "${requestedLesson}". Starting lesson 01 instead.`)
}

void lessons[lesson]().then(({ default: Lesson }) => {
  mount(Lesson, { target: document.getElementById('app')! })
})
