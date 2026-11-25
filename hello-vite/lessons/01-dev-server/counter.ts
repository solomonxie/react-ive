// Edit the text below while the page is open and watch it change without a reload.
export function render(el: HTMLElement, count: number): void {
  el.textContent = `clicks: ${count} (edit counter.ts and save)`
}

// Lesson 01: HMR (hot module replacement).
// Without this block, saving counter.ts reloads the whole page and the count
// resets. With it, Vite swaps in the new module and we keep our state.
// In a real app: the React plugin writes this kind of block for you (React Fast
// Refresh), which is why editing a component keeps its useState values.
if (import.meta.hot) {
  import.meta.hot.accept()
}
