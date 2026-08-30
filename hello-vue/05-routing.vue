<!--
  Routing — vue-router with static routes and a dynamic /user/:id route.
  Goal: learn client-side navigation and reading route params.

  Run:  cd hello-vue && npm run dev
        npm run lesson -- 05
  Open: http://localhost:5173/
-->
<script lang="ts">
import { defineComponent, h, ref, watch, type FunctionalComponent } from 'vue'
import { createRouter, createWebHistory, useRoute, type RouteRecordRaw } from 'vue-router'

interface GreetingProps {
  name: string
}

const Greeting: FunctionalComponent<GreetingProps> = (props) => h('h1', null, `Hello, ${props.name}`)

const HomePage = defineComponent({
  name: 'HomePage',
  setup() {
    const name = ref('World')
    return () =>
      h('div', [
        h(Greeting, { name: name.value }),
        h('input', {
          value: name.value,
          onInput: (event: Event) => {
            name.value = (event.target as HTMLInputElement).value
          },
          placeholder: 'Type a name',
        }),
      ])
  },
})

const AboutPage = defineComponent({
  name: 'AboutPage',
  setup() {
    return () => h('p', 'A progressive Vue + TypeScript learning app.')
  },
})

interface User {
  id: number
  name: string
}

const UserPage = defineComponent({
  name: 'UserPage',
  setup() {
    const route = useRoute()
    const user = ref<User | null>(null)
    const error = ref<string | null>(null)

    watch(
      () => route.params.id,
      (id) => {
        user.value = null
        error.value = null
        fetch(`https://jsonplaceholder.typicode.com/users/${id ?? '1'}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Request failed: ${res.status}`)
            return res.json() as Promise<User>
          })
          .then((data) => {
            user.value = data
          })
          .catch((err: Error) => {
            error.value = err.message
          })
      },
      { immediate: true },
    )

    return () => {
      if (error.value) return h('p', `Error: ${error.value}`)
      if (!user.value) return h('p', 'Loading...')
      return h('p', `Fetched user: ${user.value.name}`)
    }
  },
})

const routes: RouteRecordRaw[] = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/user/:id', component: UserPage },
]

// Exported alongside the default component so main.ts can install it on the
// app before mounting — a real SFC's <script setup> only produces a default
// export, so a plain <script> block is used here instead to add this named
// one too.
export const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default defineComponent({
  name: 'RoutingLesson',
})
</script>

<template>
  <div>
    <nav>
      <RouterLink to="/">Home</RouterLink> | <RouterLink to="/about">About</RouterLink> |
      <RouterLink to="/user/1">User 1</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>
