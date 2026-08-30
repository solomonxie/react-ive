<!--
  Fetches a user by id and refetches whenever the id prop changes, using
  $effect the way lesson 05's routing example needs a dynamic route param
  to drive a side effect. Kept local to lesson 05 to stay self-contained.
-->
<script lang="ts">
  interface Props {
    userId: string
  }

  interface User {
    id: number
    name: string
  }

  const { userId }: Props = $props()

  let user = $state<User | null>(null)
  let error = $state<string | null>(null)

  $effect(() => {
    user = null
    error = null
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return res.json() as Promise<User>
      })
      .then((data) => (user = data))
      .catch((err: Error) => (error = err.message))
  })
</script>

{#if error}
  <p>Error: {error}</p>
{:else if !user}
  <p>Loading...</p>
{:else}
  <p>Fetched user: {user.name}</p>
{/if}
