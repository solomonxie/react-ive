<!-- Reusable Greeting component, kept local to lesson 05 to stay self-contained. -->
<script lang="ts">
  interface Props {
    name: string
  }

  const { name }: Props = $props()
</script>

<h1>Hello, {name}</h1>
