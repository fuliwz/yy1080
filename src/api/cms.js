import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 15000 });
const get = (url, params = {}) => api.get(url, { params });

function fixVod(item) {
  if (!item) return item;
  let pic = item.vod_pic || item.vod_pic_thumb || item.vod_pic_slide || item.vod_pic_small || "";
  if (pic && !/^https?:\/\//i.test(pic)) pic = "https://i0.wp.com/" + pic.replace(/^https?:\/\//, "");
  return { ...item, vod_pic: pic || "/fallback.jpg" };
}

function normalize(res) {
  res.data.list = (res.data.list || []).map(fixVod);
  return res;
}

export function getClass() { return get("/api.php/provide/vod/", { ac: "list" }); }

export function getHome(page = 1, limit = 20) {
  return get("/api.php/provide/vod/", { ac: "detail", pg: page, limit }).then(normalize);
}

// `sort` is handled by the Cloudflare API proxy. This avoids relying on
// third-party AppleCMS-compatible providers to honor by/order consistently.
export function getLatestVideos(page = 1, limit = 12) {
  return get("/api.php/provide/vod/", { ac: "detail", pg: page, limit, sort: "latest" }).then(normalize);
}

export function getHotVideos(page = 1, limit = 12) {
  return get("/api.php/provide/vod/", { ac: "detail", pg: page, limit, sort: "hot" }).then(normalize);
}

export function getDayHotVideos(page = 1, limit = 12) {
  return get("/api.php/provide/vod/", { ac: "detail", pg: page, limit, sort: "day" }).then(normalize);
}

export function getWeekHotVideos(page = 1, limit = 12) {
  return get("/api.php/provide/vod/", { ac: "detail", pg: page, limit, sort: "week" }).then(normalize);
}

export function getMonthHotVideos(page = 1, limit = 12) {
  return get("/api.php/provide/vod/", { ac: "detail", pg: page, limit, sort: "month" }).then(normalize);
}

export function getTopVideos(page = 1, limit = 12) {
  return get("/api.php/provide/vod/", { ac: "detail", pg: page, limit, sort: "score" }).then(normalize);
}

export async function getCategory(id, page = 1, sort = "latest") {
  const res = await get("/api.php/provide/vod/", { ac: "detail", t: id, pg: page, sort });
  return normalize(res);
}

export async function searchVideo(wd, page = 1) {
  const keyword = (wd || "").trim();
  if (!keyword) return { data: { list: [], pagecount: 0 } };
  const res = await get("/api.php/provide/vod/", { ac: "detail", wd: keyword, pg: page });
  return normalize(res);
}

export function getDetail(id) { return get("/api.php/provide/vod/", { ac: "detail", ids: id }).then(normalize); }
export function getCategoryLatest(id, limit = 12) { return getCategory(id, 1, "latest").then(res => { res.data.list = res.data.list.slice(0, limit); return res; }); }

let classCache = null;
let classCacheTime = 0;
const CACHE_TIME = 60 * 1000;

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
    const res = await get("/api.php/provide/vod/", { ac: "detail", t: type_id, pg: 1 });
    return (res.data.list || []).length > 0;
  } catch { return false; }
}

export async function getActiveClass() {
  const now = Date.now();
  if (classCache && now - classCacheTime < CACHE_TIME) return classCache;
  const res = await getClass();
  const all = res.data.class || [];
  const result = await asyncPool(5, all, async item => (await hasVideo(item.type_id)) ? item : null);
  classCache = result.filter(Boolean);
  classCacheTime = now;
  return classCache;
}
