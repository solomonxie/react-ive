<!--
  Routing — client-side navigation with svelte-routing: static routes and a
  dynamic /user/:id route.
  Goal: learn navigation without full page reloads and reading URL params
  via a Route's slot props.

  Run:  cd hello-svelte && npm run dev
        npm run lesson -- 05
  Open: http://localhost:5173/
-->
<script lang="ts">
  import { Link, Route, Router } from 'svelte-routing'
  import Greeting from './05-greeting.svelte'
  import UserInfo from './05-user-info.svelte'

  let name = $state('World')
</script>

<Router>
  <nav>
    <Link to="/">Home</Link> | <Link to="/about">About</Link> |
    <Link to="/user/1">User 1</Link>
  </nav>

  <Route path="/">
    <div>
      <Greeting {name} />
      <input
        value={name}
        oninput={(event) => (name = event.currentTarget.value)}
        placeholder="Type a name"
      />
    </div>
  </Route>

  <Route path="/about">
    <p>A progressive Svelte learning app.</p>
  </Route>

  <Route path="/user/:id" let:params>
    <UserInfo userId={params.id} />
  </Route>
</Router>
