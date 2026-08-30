<!--
  Effects & Data Fetching — watchEffect runs a fetch() on mount, and watch
  reacts to the name input, both with typed state.
  Goal: learn Vue's two flavors of reactive side effects and async data.

  Run:  cd hello-vue && npm run dev
        npm run lesson -- 04
  Open: http://localhost:5173/
-->
<script setup lang="ts">
import { h, ref, watch, watchEffect, type FunctionalComponent } from 'vue'

interface GreetingProps {
  name: string
}

const Greeting: FunctionalComponent<GreetingProps> = (props) => h('h1', null, `Hello, ${props.name}`)

const name = ref('World')

// watch() runs only when the source it's given changes, and receives the
// old/new values — a good fit for reacting to one specific piece of state.
const nameChangeCount = ref(0)
watch(name, () => {
  nameChangeCount.value++
})

interface User {
  id: number
  name: string
}

const user = ref<User | null>(null)
const error = ref<string | null>(null)

// watchEffect() runs immediately and re-runs whenever any reactive value it
// reads changes. It reads nothing reactive here, so — like an effect with an
// empty dependency array — it simply runs once, on mount.
watchEffect(() => {
  fetch('https://jsonplaceholder.typicode.com/users/1')
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
})
</script>

<template>
  <div>
    <Greeting :name="name" />
    <input v-model="name" placeholder="Type a name" />
    <p>You've changed the name {{ nameChangeCount }} times.</p>
    <p v-if="error">Error: {{ error }}</p>
    <p v-else-if="!user">Loading...</p>
    <p v-else>Fetched user: {{ user.name }}</p>
  </div>
</template>
