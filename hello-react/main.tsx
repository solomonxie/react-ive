// Stable application entry point. The lesson runner adds ?lesson=NN to the URL.

type LessonLoader = () => Promise<unknown>

const lessons: Record<string, LessonLoader> = {
  '01': () => import('./01-hello-world.tsx'),
  '02': () => import('./02-components-and-props.tsx'),
  '03': () => import('./03-state-and-events.tsx'),
  '04': () => import('./04-effects-and-fetching.tsx'),
  '05': () => import('./05-routing.tsx'),
  '06': () => import('./06-context-and-guards.tsx'),
  '07': () => import('./07-forms.tsx'),
  '08': () => import('./08-styling.tsx'),
  '09': () => import('./09-custom-hooks.tsx'),
  '10': () => import('./10-context-provider.tsx'),
  '11': () => import('./11-react-hook-form-zod.tsx'),
  '12': () => import('./12-form-wizard.tsx'),
  '13': () => import('./13-tanstack-query.tsx'),
  '14': () => import('./14-apollo-graphql.tsx'),
  '15': () => import('./15-jotai-atoms.tsx'),
  '16': () => import('./16-performance.tsx'),
  '17': () => import('./17-error-boundary-suspense-use.tsx'),
}

const requestedLesson = new URLSearchParams(window.location.search).get('lesson') ?? '01'
const lesson = lessons[requestedLesson] ? requestedLesson : '01'

if (lesson !== requestedLesson) {
  console.warn(`Unknown lesson "${requestedLesson}". Starting lesson 01 instead.`)
}

void lessons[lesson]()
