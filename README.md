# yy1080

Vue 3 + Vite video site based on the yy4070 project.

## API

Frontend requests use `/api/*`, proxied by the Cloudflare Pages Function in `functions/api/[[path]].js` to:

`https://slapibf.com/`

## Features

- Vue Router URL-driven pagination and navigation
- Route-aware advertisement reload and cleanup
- HLS.js + Plyr playback
- Cloudflare API proxy with edge caching
