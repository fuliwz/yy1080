import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 12000 });
const responseCache = new Map();
const pendingRequests = new Map();
const CACHE_TIME = 60 * 1000;

function fixVod(item) {
  if (!item) return item;
  let pic = item.vod_pic || item.vod_pic_thumb || item.vod_pic_slide || item.vod_pic_small || "";
  if (pic && !/^https?:\/\//i.test(pic)) pic = "https://i0.wp.com/" + pic.replace(/^https?:\/\//, "");
  return { ...item, vod_pic: pic || "/fallback.jpg" };
}

function normalize(res) {
  if (res?.data) {
    const root = res.data?.data && typeof res.data.data === "object" ? res.data.data : res.data;
    if (Array.isArray(root.list)) root.list = root.list.map(fixVod);
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

export function getClass() {
  return get("/api.php/provide/vod/", { ac: "list", pg: 1, pagesize: 100 });
}

// Homepage random pages deliberately use a wide 1-500 range. Each section
// gets a different page from a shuffled pool until the pool is exhausted.
let homePagePool = [];
function nextHomePage(min = 1, max = 500) {
  if (!homePagePool.length) {
    homePagePool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    for (let i = homePagePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [homePagePool[i], homePagePool[j]] = [homePagePool[j], homePagePool[i]];
    }
  }
  return homePagePool.pop();
}

export function getHome(page = 1, limit = 20, randomPage = false) {
  const pg = randomPage ? nextHomePage(1, 500) : page;
  return get("/api.php/provide/vod/", { ac: "detail", pg, limit });
}

// Latest is always page 1 on the homepage. Other homepage feeds use a
// different random page from 1-500. Passing page > 1 explicitly is reserved
// for normal pagination such as the browse-all-latest section.
export function getLatestVideos(page = 1, limit = 12) {
  return getHome(page, limit, false);
}
export function getHotVideos(page = 1, limit = 12) {
  return getHome(page, limit, true);
}
export function getDayHotVideos(page = 1, limit = 12) {
  return getHome(page, limit, true);
}
export function getWeekHotVideos(page = 1, limit = 12) {
  return getHome(page, limit, true);
}
export function getMonthHotVideos(page = 1, limit = 12) {
  return getHome(page, limit, true);
}
export function getTopVideos(page = 1, limit = 12) {
  return getHome(page, limit, true);
}

export async function getCategory(id, page = 1, sort = "latest") {
  return get("/api.php/provide/vod/", { ac: "detail", t: id, pg: page, sort });
}

export async function searchVideo(wd, page = 1) {
  const keyword = (wd || "").trim();
  if (!keyword) return { data: { list: [], pagecount: 0 } };
  return get("/api.php/provide/vod/", { ac: "detail", wd: keyword, pg: page });
}

export function getDetail(id) {
  return get("/api.php/provide/vod/", { ac: "detail", ids: id });
}

export function getCategoryLatest(id, limit = 12) {
  return getCategory(id, 1, "latest").then(res => {
    const root = res.data?.data && typeof res.data.data === "object" ? res.data.data : res.data;
    root.list = (root.list || []).slice(0, limit);
    return res;
  });
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
    const res = await get("/api.php/provide/vod/", { ac: "detail", t: type_id, pg: 1, limit: 1 });
    const root = res.data?.data && typeof res.data.data === "object" ? res.data.data : res.data;
    return (root?.list || []).length > 0;
  } catch { return false; }
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

export function clearApiCache() {
  responseCache.clear();
}
