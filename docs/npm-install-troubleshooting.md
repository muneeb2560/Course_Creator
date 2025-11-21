# npm install troubleshooting

If `npm install` returns `403 Forbidden` errors (commonly for `@supabase/supabase-js`), the environment usually injected a stale proxy configuration. This repository ships a helper to reset npm back to the public registry, strip proxy values for the current shell, and run installation in that clean state.

## Quick fix

```bash
./scripts/reset-npm-proxy.sh
```

The script:

- Deletes npm proxy and registry overrides (`proxy`, `http-proxy`, `https-proxy`, `registry`).
- Unsets proxy-related environment variables for the script run.
- Reapplies the public npm registry `https://registry.npmjs.org/`.
- Prints the resulting `npm config list` so you can confirm no proxy entries remain.
- Runs `npm install` immediately with the cleaned configuration.

Pass any install flags through to npm by appending them to the script call, e.g. `./scripts/reset-npm-proxy.sh --legacy-peer-deps`.

## Manual steps

If you prefer to run the commands yourself, execute the following from the project root in the same shell session before running `npm install`:

```bash
npm config delete proxy
npm config delete https-proxy
npm config delete http-proxy
npm config delete registry
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY npm_config_http_proxy npm_config_https_proxy
npm config set registry https://registry.npmjs.org/
npm config list
npm install
```

You should no longer see proxy entries in the npm config output. Retry `npm install` afterward.
