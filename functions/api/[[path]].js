export async function onRequest(context) {
  const requestUrl = new URL(context.request.url)
  const upstreamUrl = new URL('https://api.heiapi.cc/' + requestUrl.pathname.replace('/api/', ''))

  // This proxy is intentionally transparent. The site uses AppleCMS legacy
  // Provide API only, so pg/limit/t/wd/ac/ids must reach the upstream API
  // unchanged. In particular, do not rewrite requests to any V2 endpoint and
  // do not fetch page 1 and paginate locally.
  requestUrl.searchParams.forEach((value, key) => {
    if (key !== 'sort') upstreamUrl.searchParams.append(key, value)
  })

  const cacheKey = new Request(requestUrl.toString(), context.request)
  const cache = caches.default
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  let resp
  try {
    resp = await fetch(upstreamUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json,text/plain,*/*'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ code: 500, msg: 'API request failed', list: [] }), {
      status: 502,
      headers: { 'Content-Type': 'application/json;charset=utf-8', 'Cache-Control': 'no-store' }
    })
  }

  const response = new Response(await resp.text(), {
    status: resp.status,
    headers: {
      'Content-Type': resp.headers.get('Content-Type') || 'application/json;charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300'
    }
  })

  context.waitUntil(cache.put(cacheKey, response.clone()))
  return response
}
