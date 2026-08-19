export async function onRequest(context) {
  const requestUrl = new URL(context.request.url)
  const sort = requestUrl.searchParams.get('sort')
  const upstreamUrl = new URL('https://api.heiapi.cc/' + requestUrl.pathname.replace('/api/', ''))

  requestUrl.searchParams.forEach((value, key) => {
    if (key !== 'sort') upstreamUrl.searchParams.append(key, value)
  })

  const target = upstreamUrl.toString()
  const cacheKey = new Request(requestUrl.toString(), context.request)
  const cache = caches.default

  let response = await cache.match(cacheKey)
  if (response) return response

  const resp = await fetch(target, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })

  const text = await resp.text()
  let body = text

  // Some AppleCMS-compatible APIs ignore the `by`/`order` parameters.
  // Sort the returned list at the proxy layer so Latest/Hot/Today Hot are
  // genuinely different datasets even when the upstream provider ignores them.
  if (resp.ok && sort && sort !== 'default') {
    try {
      const json = JSON.parse(text)
      const list = Array.isArray(json?.list) ? json.list : Array.isArray(json?.data?.list) ? json.data.list : null
      if (list) {
        const num = (v) => Number(v ?? 0) || 0
        const time = (v) => {
          const n = num(v)
          if (n) return n
          const t = Date.parse(v || '')
          return Number.isNaN(t) ? 0 : t
        }
        const score = (item) => {
          if (sort === 'latest') return time(item.vod_time || item.vod_time_add || item.time || item.time_add)
          if (sort === 'hot') return num(item.vod_hits || item.hits)
          if (sort === 'day') return num(item.vod_hits_day || item.hits_day)
          if (sort === 'week') return num(item.vod_hits_week || item.hits_week)
          if (sort === 'month') return num(item.vod_hits_month || item.hits_month)
          if (sort === 'score') return num(item.vod_score || item.score)
          return 0
        }
        list.sort((a, b) => score(b) - score(a))
        body = JSON.stringify(json)
      }
    } catch {
      // Keep the original upstream response if it is not valid JSON.
    }
  }

  response = new Response(body, {
    status: resp.status,
    headers: {
      'Content-Type': resp.headers.get('Content-Type') || 'application/json;charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  })

  context.waitUntil(cache.put(cacheKey, response.clone()))
  return response
}
