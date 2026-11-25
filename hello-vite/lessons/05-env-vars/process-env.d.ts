// Types for the `define`d process.env.* values (no @types/node in the browser)
declare namespace NodeJS {
  interface ProcessEnv {
    MY_BUILD_LABEL?: string
  }
}
