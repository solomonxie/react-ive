<!--
  Components & Props — a reusable Greeting component plus this file's own
  root props, typed via defineProps().
  Goal: learn how data flows into a component, both through an SFC's typed
  props and through a small reusable functional component.

  Run:  cd hello-vue && npm run dev
        npm run lesson -- 02
  Open: http://localhost:5173/
-->
<script setup lang="ts">
import { h, type FunctionalComponent } from 'vue'

interface GreetingProps {
  name: string
}

// A plain functional component: Vue's closest analog to a small stateless
// function component. It renders via h() instead of its own <template>,
// since a single .vue file can only compile one SFC <template>.
const Greeting: FunctionalComponent<GreetingProps> = (props) => h('h1', null, `Hello, ${props.name}`)

// This file's own root component is a real SFC, so its props are declared
// with the defineProps() macro and are fully type-checked.
interface AppProps {
  subtitle?: string
}

const props = withDefaults(defineProps<AppProps>(), {
  subtitle: 'Components & Props',
})
</script>

<template>
  <div>
    <p class="subtitle">{{ props.subtitle }}</p>
    <Greeting name="World" />
    <Greeting name="TypeScript" />
  </div>
</template>
