// Lesson 07: code splitting with dynamic import().
// A normal `import` is bundled into the main file. `import()` returns a
// promise and tells the bundler "make this a separate file, fetch on demand".
// In a real app: React.lazy(() => import('./Page')) does this for routes, which
// is why the app loads page code only when you visit the page.
document.querySelector('#load')!.addEventListener('click', async () => {
  const { heavyWork } = await import('./heavy.ts')
  document.querySelector('#out')!.textContent = heavyWork()
})
console.log('mode:', import.meta.env.MODE, 'prod:', import.meta.env.PROD)
