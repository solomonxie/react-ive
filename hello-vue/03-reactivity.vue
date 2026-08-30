<!--
  Reactivity — ref/reactive state, v-model, and a typed custom event via
  defineEmits.
  Goal: learn Vue's reactivity primitives and how data flows back up to a
  parent through events.

  Run:  cd hello-vue && npm run dev
        npm run lesson -- 03
  Open: http://localhost:5173/
-->
<script setup lang="ts">
import { h, reactive, ref, type FunctionalComponent } from 'vue'

interface GreetingProps {
  name: string
}

const Greeting: FunctionalComponent<GreetingProps> = (props) => h('h1', null, `Hello, ${props.name}`)

// A small functional component whose click is reported to its parent via a
// plain callback prop. In a template, `@like="handler"` on a component
// compiles to an `onLike` prop — the same mechanism defineEmits formalizes
// below for this file's own root component.
interface LikeButtonProps {
  likes: number
  onLike: () => void
}

const LikeButton: FunctionalComponent<LikeButtonProps> = (props) =>
  h('button', { onClick: props.onLike }, `Liked ${props.likes} times`)

const name = ref('World')
const stats = reactive({ clicks: 0 })

// This file's own root component declares the typed custom events it can
// emit to ITS parent. Mounting it directly (as main.ts does) means nothing
// is listening, so we just log the emit here for visibility.
const emit = defineEmits<{ liked: [count: number] }>()

function handleLike() {
  stats.clicks++
  emit('liked', stats.clicks)
  console.info(`emitted "liked" with count ${stats.clicks}`)
}
</script>

<template>
  <div>
    <Greeting :name="name" />
    <input v-model="name" placeholder="Type a name" />
    <p>
      <LikeButton :likes="stats.clicks" :on-like="handleLike" />
    </p>
  </div>
</template>
