// Pretend this is a big chart library. It only loads when asked.
export function heavyWork(): string {
  return `computed at ${new Date().toISOString()}`
}
