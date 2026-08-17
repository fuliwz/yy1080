export async function onRequest(context) {
  const url = new URL(context.request.url)

  const target =
    'https://slapibf.com/' +
    url.pathname.replace('/api/', '') +
    url.search

  const cacheKey = new Request(target, context.request)
  const cache = caches.default

  let response = await cache.match(cacheKey)
  if (response) return response

  const resp = await fetch(target, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  })

  const text = await resp.text()

  response = new Response(text, {
    status: resp.status,
    headers: {
      'Content-Type': resp.headers.get('Content-Type') || 'application/json;charset=utf-8',
      'Cache-Control': 'public, max-age=600'
    }
  })

  context.waitUntil(cache.put(cacheKey, response.clone()))

  return response
}
