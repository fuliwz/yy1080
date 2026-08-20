import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 12000 });
const responseCache = new Map();
const pendingRequests = new Map();
const CACHE_TIME = 60 * 1000;

function fixVod(item) {
  if (!item) return item;
  let pic = item.vod_pic || item.vod_pic_thumb || item.vod_pic_slide || item.vod_pic_small || "";
  if (pic && !/^https?:\/\//i.test(pic)) pic = pic.startsWith("//") ? `https:${pic}` : pic;
  return { ...item, vod_pic: pic || "/fallback.jpg" };
}

function normalize(res) {
  if (!res?.data) return res;
  const payload = res.data;
  const info = payload?.info && typeof payload.info === "object" ? payload.info : null;
  const root = payload?.data && typeof payload.data === "object" ? payload.data : payload;

  if (info && Array.isArray(info.rows)) {
    const limit = Number(info.limit || 20) || 20;
    const offset = Number(info.offset || 0) || 0;
    const total = Number(info.total || info.rows.length) || 0;
    const list = info.rows.map(fixVod);
    res.data = {
      ...payload,
      ...info,
      list,
      rows: list,
      page: Math.floor(offset / limit) + 1,
      pagecount: Math.max(1, Math.ceil(total / limit)),
      total
    };
    return res;
  }

  if (Array.isArray(root?.list)) {
    if (root !== payload) res.data = { ...payload, ...root, list: root.list.map(fixVod) };
    else res.data.list = root.list.map(fixVod);
  }
  return res;
}

function cacheKey(url, params) {
  const query = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  return `${url}?${new URLSearchParams(query).toString()}`;
}

async function request(url, params = {}, retry = 1) {
  const key = cacheKey(url, params);
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.time < CACHE_TIME) return cached.value;
  if (pendingRequests.has(key)) return pendingRequests.get(key);

  const task = (async () => {
    try {
      const res = normalize(await api.get(url, { params }));
      responseCache.set(key, { time: Date.now(), value: res });
      return res;
    } catch (error) {
      if (retry > 0 && (!error.response || error.response.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, 350));
        return request(url, params, retry - 1);
      }
      throw error;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, task);
  return task;
}

const get = (url, params = {}) => request(url, params);

// Legacy Provide API is kept for category discovery and playback compatibility.
export function getClass() {
  return get("/api.php/provide/vod/", { ac: "list", pg: 1, pagesize: 100 });
}

// AppleCMS V2 home/list API: offset + limit + documented orderby.
export function getHome(page = 1, limit = 20, orderby = "pubdate") {
  const offset = Math.max(0, (page - 1) * limit);
  return get("/api.php/vod/get_list/", { offset, limit, orderby });
}

function getFeed(page = 1, limit = 12, orderby = "pubdate") {
  return getHome(page, limit, orderby);
}

export function getLatestVideos(page = 1, limit = 12) { return getFeed(page, limit, "pubdate"); }
export function getHotVideos(page = 1, limit = 12) { return getFeed(page, limit, "hits"); }
export function getDayHotVideos(page = 1, limit = 12) { return getFeed(page, limit, "hits_day"); }
export function getWeekHotVideos(page = 1, limit = 12) { return getFeed(page, limit, "hits_week"); }
export function getMonthHotVideos(page = 1, limit = 12) { return getFeed(page, limit, "hits_month"); }
export function getTopVideos(page = 1, limit = 12) { return getFeed(page, limit, "score"); }

export async function getCategory(id, page = 1, sort = "pubdate", limit = 20) {
  const offset = Math.max(0, (page - 1) * limit);
  return get("/api.php/vod/get_list/", { type_id: id, offset, limit, orderby: sort });
}

export async function searchVideo(wd, page = 1, limit = 20) {
  const keyword = (wd || "").trim();
  if (!keyword) return { data: { list: [], page: 1, pagecount: 0, total: 0 } };
  const offset = Math.max(0, (page - 1) * limit);
  return get("/api.php/vod/get_list/", { vod_name: keyword, offset, limit, orderby: "pubdate" });
}

// Keep the playback detail contract on the legacy endpoint because Play.vue
// consumes vod_play_url and the Provide detail response already supplies it.
export function getDetail(id) {
  return get("/api.php/provide/vod/", { ac: "detail", ids: id });
}

export function getCategoryLatest(id, limit = 12) {
  return getCategory(id, 1, "pubdate", limit);
}

let classCache = null;
let classCacheTime = 0;
const CLASS_CACHE_TIME = 5 * 60 * 1000;

async function asyncPool(limit, array, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    if (limit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) await Promise.race(executing);
    }
  }
  return Promise.all(ret);
}

async function hasVideo(type_id) {
  try {
    const res = await get("/api.php/vod/get_list/", { type_id, offset: 0, limit: 1, orderby: "pubdate" });
    return (res.data?.list || []).length > 0;
  } catch {
    return false;
  }
}

export async function getActiveClass() {
  const now = Date.now();
  if (classCache && now - classCacheTime < CLASS_CACHE_TIME) return classCache;
  const res = await getClass();
  const root = res.data?.data && typeof res.data.data === "object" ? res.data.data : res.data;
  const all = root?.class || [];
  const result = await asyncPool(5, all, async item => (await hasVideo(item.type_id)) ? item : null);
  classCache = result.filter(Boolean);
  classCacheTime = now;
  return classCache;
}

export function clearApiCache() { responseCache.clear(); }
