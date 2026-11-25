// TypeScript does not know virtual modules exist; tell it their shape.
declare module 'virtual:build-info' {
  export const builtAt: string
  export const name: string
}
// Declared so tsc accepts the call that the shout plugin removes at build time.
declare function __SHOUT(text: string): string
