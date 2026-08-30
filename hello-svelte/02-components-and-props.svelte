<!--
  Components & Props — splits the greeting into a reusable <Greeting name>
  component that receives its data through Svelte 5's $props() rune.
  Goal: learn how data flows into a component via typed props.

  Run:  cd hello-svelte && npm run dev
        npm run lesson -- 02
  Open: http://localhost:5173/
-->
<script lang="ts">
  import Greeting from './02-greeting.svelte'
</script>

<div>
  <Greeting name="World" />
  <Greeting name="TypeScript" />
</div>
