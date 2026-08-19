export async function onRequest(context) {
  const requestUrl = new URL(context.request.url)
  const sort = requestUrl.searchParams.get('sort') || 'default'
  const requestedPage = Math.max(1, Number(requestUrl.searchParams.get('pg') || 1) || 1)
  const requestedLimit = Math.min(50, Math.max(1, Number(requestUrl.searchParams.get('limit') || 20) || 20))
  const upstreamUrl = new URL('https://api.heiapi.cc/' + requestUrl.pathname.replace('/api/', ''))

  // For sorted feeds, fetch a larger first-page pool and sort it here.
  // This fixes providers that ignore AppleCMS `by`/`order` and return the same
  // dataset for latest/hot/day-hot requests. Pagination is then applied locally.
  const isSortedFeed = ['latest', 'hot', 'day', 'week', 'month', 'score'].includes(sort)

  requestUrl.searchParams.forEach((value, key) => {
    if (key !== 'sort' && key !== 'pg' && key !== 'limit') upstreamUrl.searchParams.append(key, value)
  })

  if (isSortedFeed) {
    upstreamUrl.searchParams.set('pg', '1')
    upstreamUrl.searchParams.set('limit', '100')
  } else {
    upstreamUrl.searchParams.set('pg', String(requestedPage))
    upstreamUrl.searchParams.set('limit', String(requestedLimit))
  }

  const cacheKey = new Request(requestUrl.toString(), context.request)
  const cache = caches.default
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  let resp
  try {
    resp = await fetch(upstreamUrl.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json,text/plain,*/*' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ code: 500, msg: 'API request failed', list: [] }), {
      status: 502,
      headers: { 'Content-Type': 'application/json;charset=utf-8', 'Cache-Control': 'no-store' }
    })
  }

  const text = await resp.text()
  let body = text

  if (resp.ok && isSortedFeed) {
    try {
      const json = JSON.parse(text)
      const root = json?.data && typeof json.data === 'object' ? json.data : json
      const list = Array.isArray(root?.list) ? root.list : []

      const num = value => {
        const n = Number(value ?? 0)
        return Number.isFinite(n) ? n : 0
      }
      const time = value => {
        const numeric = num(value)
        if (numeric) return numeric
        const parsed = Date.parse(value || '')
        return Number.isNaN(parsed) ? 0 : parsed
      }
      const score = item => {
        if (sort === 'latest') return time(item.vod_time || item.vod_time_add || item.time || item.time_add)
        if (sort === 'hot') return num(item.vod_hits ?? item.hits)
        if (sort === 'day') return num(item.vod_hits_day ?? item.hits_day)
        if (sort === 'week') return num(item.vod_hits_week ?? item.hits_week)
        if (sort === 'month') return num(item.vod_hits_month ?? item.hits_month)
        if (sort === 'score') return num(item.vod_score ?? item.score)
        return 0
      }

      // Stable tie-breaker by id keeps results deterministic when two videos
      // have the same hit count or timestamp.
      list.sort((a, b) => {
        const diff = score(b) - score(a)
        if (diff !== 0) return diff
        return num(b.vod_id ?? b.id) - num(a.vod_id ?? a.id)
      })

      const total = list.length
      const start = (requestedPage - 1) * requestedLimit
      const paged = list.slice(start, start + requestedLimit)
      const pagecount = Math.max(1, Math.ceil(total / requestedLimit))

      if (json?.data && typeof json.data === 'object') {
        json.data.list = paged
        json.data.page = requestedPage
        json.data.pagecount = pagecount
        json.data.total = total
      } else {
        json.list = paged
        json.page = requestedPage
        json.pagecount = pagecount
        json.total = total
      }
      body = JSON.stringify(json)
    } catch {
      // Keep the original upstream response if it is not valid JSON.
    }
  }

  const response = new Response(body, {
    status: resp.status,
    headers: {
      'Content-Type': resp.headers.get('Content-Type') || 'application/json;charset=utf-8',
      'Cache-Control': 'public, max-age=120, s-maxage=300, stale-while-revalidate=600'
    }
  })

  context.waitUntil(cache.put(cacheKey, response.clone()))
  return response
}
