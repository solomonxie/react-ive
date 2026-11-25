# hello-auth0

Auth0 from the ground up, following the path a request takes in a typical web app and API.

## Run

```
make install
make lesson N=01      # or: npm run lesson -- 01
make typecheck
```

Lessons 01–04 run offline. Lessons 05–06 need a free Auth0 tenant: copy `.env.example` to `.env` and fill it in.

## Lessons

- **01 what is a JWT**: builds a token by hand, decodes it, and shows that changing the payload breaks the signature.
- **02 sign and verify with jose**: RS256 tokens; a wrong audience, an expired token and a forged signature are each rejected.
- **03 fake issuer**: a fake Auth0 tenant on localhost:4100 that serves its public keys (`/.well-known/jwks.json`) and issues tokens.
- **04 protect an API**: an API that answers 401 (no or bad token), 403 (wrong scope) or 200.
- **05 real tenant, machine to machine**: gets a token with `client_credentials` from a real tenant.
- **06 SPA login**: logs a user in in the browser with `@auth0/auth0-spa-js`, then calls an API with the token.

## How this maps to a real app

- Browser login is lesson 06: the front end uses `@auth0/auth0-spa-js`, and `getTokenSilently()` gives the bearer token sent to the API.
- Checking the token is lessons 02-04: the API's JWT middleware checks signature, issuer and audience. It can also read `aud` to tell which kind of client is calling.
- Service to service is lesson 05: a backend gets a `client_credentials` token and caches it.
- Users are keyed by their Auth0 id (`auth0|...`).
