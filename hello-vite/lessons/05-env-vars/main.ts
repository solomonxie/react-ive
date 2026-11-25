// Lesson 05: environment variables and modes.
//
// Try:
//   npm run lesson -- 05                      mode = development
//   npm run lesson -- 05 --mode staging       also loads .env.staging
//   MY_BUILD_LABEL=abc npm run lesson -- 05   shows up through `define`
//
// Rules worth remembering:
//  - Files: .env, .env.local, .env.[mode], .env.[mode].local (later wins;
//    *.local is for your machine and is git-ignored).
//  - Only names starting with VITE_ are exposed to the browser. SECRET_TOKEN
//    below is undefined on purpose: anything in the browser bundle is public.
//  - The mode is not NODE_ENV. `vite` defaults to mode "development", `vite build`
//    to "production", and `--mode` changes it. import.meta.env.DEV / PROD are
//    booleans derived from it.
//  - Values are always strings: "false" is truthy!
//  - import.meta.env.X is replaced with its value at build time, so it is not
//    a runtime lookup.
//
// In a real app: `.env`-style values often reach the app through a `define`
// list in vite.config.ts (see that file's comment), and command === "serve" vs
// "build" decides the NODE_ENV value.
const out = {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  VITE_API_NAME: import.meta.env.VITE_API_NAME,
  VITE_FEATURE_X_raw: import.meta.env.VITE_FEATURE_X,
  VITE_FEATURE_X_asBoolean: import.meta.env.VITE_FEATURE_X === 'true',
  SECRET_TOKEN: (import.meta.env as Record<string, unknown>).SECRET_TOKEN,
  fromDefine: process.env.MY_BUILD_LABEL,
}
document.querySelector('#out')!.textContent = JSON.stringify(out, null, 2)
