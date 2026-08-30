<!--
  Stores — writable and derived stores from svelte/store, subscribed to
  with the `$store` auto-subscription syntax, plus a fetch() call that
  writes its result into a writable store instead of local component state.
  Goal: learn how svelte/store shares reactive state that any component
  (not just the one that created it) can read and update.

  Run:  cd hello-svelte && npm run dev
        npm run lesson -- 04
  Open: http://localhost:5173/
-->
<script lang="ts">
  import { derived, writable } from 'svelte/store'
  import Greeting from './04-greeting.svelte'

  const name = writable('World')
  const count = writable(0)
  const isEven = derived(count, ($count) => $count % 2 === 0)

  interface User {
    id: number
    name: string
  }

  const user = writable<User | null>(null)
  const error = writable<string | null>(null)

  fetch('https://jsonplaceholder.typicode.com/users/1')
    .then((res) => {
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      return res.json() as Promise<User>
    })
    .then((data) => user.set(data))
    .catch((err: Error) => error.set(err.message))
</script>

<div>
  <Greeting name={$name} />
  <input
    value={$name}
    oninput={(event) => name.set(event.currentTarget.value)}
    placeholder="Type a name"
  />
  <p>
    <button onclick={() => count.update((n) => n + 1)}>Clicked {$count} times</button>
    ({$isEven ? 'even' : 'odd'})
  </p>
  {#if $error}
    <p>Error: {$error}</p>
  {:else if !$user}
    <p>Loading...</p>
  {:else}
    <p>Fetched user: {$user.name}</p>
  {/if}
</div>
