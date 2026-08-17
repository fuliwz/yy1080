import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 15000 });
const get = (url, params = {}) => api.get(url, { params });

function fixVod(item) {
  if (!item) return item;
  let pic = item.vod_pic || item.vod_pic_thumb || item.vod_pic_slide || item.vod_pic_small || "";
  if (pic && !pic.includes("http")) pic = "https://i0.wp.com/" + pic.replace(/^https?:\/\//, "");
  return { ...item, vod_pic: pic || "/fallback.jpg" };
}

export function getClass() { return get("/api.php/provide/vod/", { ac: "list" }); }

export async function getHome(page = 1) {
  const res = await get("/api.php/provide/vod/", { ac: "detail", pg: page });
  res.data.list = (res.data.list || []).map(fixVod);
  return res;
}

export async function getCategory(id, page = 1) {
  const res = await get("/api.php/provide/vod/", { ac: "detail", t: id, pg: page });
  res.data.list = (res.data.list || []).map(fixVod);
  return res;
}

export async function searchVideo(wd, page = 1) {
  const keyword = (wd || "").trim();
  if (!keyword) return { data: { list: [], pagecount: 0 } };
  const res = await get("/api.php/provide/vod/", { ac: "detail", wd: keyword, pg: page });
  res.data.list = (res.data.list || []).map(fixVod);
  return res;
}

export function getDetail(id) { return get("/api.php/provide/vod/", { ac: "detail", ids: id }); }
export function getCategoryLatest(id, limit = 6) { return get("/api.php/provide/vod/", { ac: "detail", t: id, pg: 1, limit }); }

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
