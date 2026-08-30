<!--
  Reactivity — Svelte 5 runes ($state, $derived) driving a controlled input
  and a click counter, plus event handling on plain DOM elements.
  Goal: learn how $state changes trigger UI updates, and how $derived
  recomputes automatically instead of being tracked and re-run by hand.

  Run:  cd hello-svelte && npm run dev
        npm run lesson -- 03
  Open: http://localhost:5173/
-->
<script lang="ts">
  import Greeting from './03-greeting.svelte'

  let name = $state('World')
  let count = $state(0)
  let isEven = $derived(count % 2 === 0)
</script>

<div>
  <Greeting {name} />
  <input
    value={name}
    oninput={(event) => (name = event.currentTarget.value)}
    placeholder="Type a name"
  />
  <p>
    <button onclick={() => (count += 1)}>Clicked {count} times</button>
    ({isEven ? 'even' : 'odd'})
  </p>
</div>
