<template>
  <main class="site-main home-page">
    <div class="page-shell">
      <section class="hero-panel">
        <div class="hero-copy">
          <div class="hero-kicker"><i class="bi bi-stars"></i> 91精品 · PREMIUM VIDEO</div>
          <h1>发现今天值得看的影片</h1>
          <p>最新更新、热门影片、今日热播与高分精选，一站式快速浏览。</p>
          <div class="hero-actions">
            <button class="hero-primary" type="button" @click="scrollTo('latest')"><i class="bi bi-play-fill"></i> 浏览最新</button>
            <button class="hero-secondary" type="button" @click="scrollTo('hot')"><i class="bi bi-fire"></i> 查看热门</button>
          </div>
        </div>
        <div class="hero-orbit" aria-hidden="true">
          <span class="orbit-ring"></span><span class="orbit-dot orbit-dot-a"></span><span class="orbit-dot orbit-dot-b"></span>
          <i class="bi bi-play-fill"></i>
        </div>
      </section>

      <section class="quick-nav" aria-label="快速浏览">
        <button class="quick-item active" type="button" @click="scrollTo('latest')"><i class="bi bi-lightning-charge-fill"></i><span>最新</span></button>
        <button class="quick-item" type="button" @click="scrollTo('hot')"><i class="bi bi-fire"></i><span>热门</span></button>
        <button class="quick-item" type="button" @click="scrollTo('day-hot')"><i class="bi bi-bar-chart-fill"></i><span>今日热门</span></button>
        <button class="quick-item" type="button" @click="scrollTo('featured')"><i class="bi bi-stars"></i><span>高分精选</span></button>
      </section>

      <section id="featured" v-if="featuredList.length" class="featured-section content-section">
        <div class="section-bar compact">
          <div><div class="section-kicker">TOP RATED</div><h2 class="section-heading">高分精选</h2><div class="section-subtitle">按 AppleCMS 评分排序精选内容</div></div>
        </div>
        <div class="featured-grid">
          <router-link v-for="(item, index) in featuredList" :key="item.vod_id" :to="`/play/${item.vod_id}`" class="featured-card">
            <img :src="cover(item)" :alt="item.vod_name || '视频封面'" loading="lazy" decoding="async" />
            <div class="featured-overlay"></div>
            <span class="featured-rank">0{{ index + 1 }}</span>
            <div class="featured-content">
              <span class="featured-tag">{{ item.type_name || '精选' }}</span>
              <strong>{{ item.vod_name || '未命名视频' }}</strong>
              <small><i class="bi bi-star-fill"></i> {{ item.vod_score || '暂无评分' }} · {{ item.vod_hits || 0 }} 次播放</small>
            </div>
          </router-link>
        </div>
      </section>

      <VideoSection id="latest" title="最新影片" subtitle="按更新时间排序 · 持续更新" kicker="LATEST" :list="latest" :loading="loadingLatest" />
      <VideoSection id="hot" title="热门影片" subtitle="按总播放量排序 · 人气内容" kicker="MOST VIEWED" :list="hot" :loading="loadingHot" />
      <VideoSection id="day-hot" title="今日热门" subtitle="按今日播放量排序 · 实时热度" kicker="TODAY'S HOT" :list="dayHot" :loading="loadingDayHot" />

      <section id="latest-list" class="content-section all-latest">
        <div class="section-bar">
          <div><div class="section-kicker">BROWSE ALL</div><h2 class="section-heading">更多最新影片</h2><div class="section-subtitle">继续浏览最新入库内容</div></div>
          <span class="section-count" v-if="!loadingAll">共 {{ totalPage }} 页</span>
        </div>
        <div class="video-grid">
          <template v-if="loadingAll"><div v-for="i in 10" :key="i"><VideoCardSkeleton /></div></template>
          <template v-else><VideoCard v-for="v in allLatest" :key="v.vod_id" :item="v" /></template>
        </div>
        <div v-if="!loadingAll && !allLatest.length" class="empty-state"><i class="bi bi-inbox"></i><strong>暂时没有内容</strong><span>请稍后再试。</span></div>
        <Pagination v-if="allLatest.length || loadingAll" :page="page" :total="totalPage" @change="changePage" />
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLatestVideos, getHotVideos, getDayHotVideos, getTopVideos } from '../api/cms'
import VideoCard from '../components/VideoCard.vue'
import VideoCardSkeleton from '../components/VideoCardSkeleton.vue'
import Pagination from '../components/Pagination.vue'

const route = useRoute()
const router = useRouter()
const latest = ref([]), hot = ref([]), dayHot = ref([]), topRated = ref([]), allLatest = ref([])
const loadingLatest = ref(false), loadingHot = ref(false), loadingDayHot = ref(false), loadingAll = ref(false)
const page = ref(1), totalPage = ref(1)

const featuredList = computed(() => topRated.value.slice(0, 3))

const VideoSection = defineComponent({
  props: { title: String, subtitle: String, kicker: String, list: Array, loading: Boolean },
  setup(props) {
    return () => h('section', { class: 'content-section video-section' }, [
      h('div', { class: 'section-bar' }, [h('div', [h('div', { class: 'section-kicker' }, props.kicker), h('h2', { class: 'section-heading' }, props.title), h('div', { class: 'section-subtitle' }, props.subtitle)])]),
      h('div', { class: 'video-grid' }, props.loading ? Array.from({ length: 6 }, (_, i) => h(VideoCardSkeleton, { key: i })) : props.list.map(v => h(VideoCard, { key: v.vod_id, item: v }))),
      !props.loading && !props.list?.length ? h('div', { class: 'empty-state compact-empty' }, '暂无内容') : null
    ])
  }
})

function cover(item) {
  const pic = item?.vod_pic
  if (!pic) return '/fallback.jpg'
  return pic.startsWith('//') ? `https:${pic}` : pic
}

function getPage() {
  const v = Number(route.query.page || 1)
  return Number.isInteger(v) && v > 0 ? v : 1
}

function listOf(result) {
  return result?.status === 'fulfilled' ? result.value?.data?.list || [] : []
}

async function loadData() {
  page.value = getPage()
  loadingLatest.value = loadingHot.value = loadingDayHot.value = loadingAll.value = true

  // Home is now driven by AppleCMS V2's /vod/get_list/ endpoint.
  // Each section uses the documented orderby field instead of a custom
  // `sort` parameter handled by the old Cloudflare proxy.
  const results = await Promise.allSettled([
    getLatestVideos(1, 12),
    getHotVideos(1, 12),
    getDayHotVideos(1, 12),
    getTopVideos(1, 12),
    getLatestVideos(page.value, 20)
  ])

  latest.value = listOf(results[0])
  hot.value = listOf(results[1])
  dayHot.value = listOf(results[2])
  topRated.value = listOf(results[3])
  allLatest.value = listOf(results[4])

  const allResult = results[4]?.status === 'fulfilled' ? results[4].value?.data : null
  totalPage.value = Number(allResult?.pagecount || 1)

  loadingLatest.value = loadingHot.value = loadingDayHot.value = loadingAll.value = false
  document.title = `91精品 - 最新影片${page.value > 1 ? ` - 第${page.value}页` : ''}`
}

function changePage(p) {
  p = Number(p)
  if (p !== page.value) router.push({ name: 'home', query: p > 1 ? { page: String(p) } : {} })
}

function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
watch(() => route.fullPath, loadData, { immediate: true })
</script>

<style scoped>
.hero-panel{position:relative;display:flex;align-items:center;justify-content:space-between;min-height:310px;margin:20px 0 18px;padding:50px 58px;overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:22px;background:radial-gradient(circle at 76% 50%,rgba(255,77,115,.2),transparent 25%),linear-gradient(135deg,#17171f 0%,#111117 60%,#0f0f14 100%);box-shadow:0 14px 36px rgba(0,0,0,.28)}
.hero-panel:before{content:"";position:absolute;inset:0;background:linear-gradient(110deg,rgba(255,255,255,.04),transparent 40%);pointer-events:none}.hero-copy{position:relative;z-index:2;max-width:680px}.hero-kicker,.section-kicker{color:#ff6b8d;font-size:10px;font-weight:800;letter-spacing:.16em}.hero-kicker{display:flex;gap:7px;align-items:center;margin-bottom:14px}.hero-copy h1{margin:0;color:#fff;font-size:clamp(31px,4.5vw,54px);font-weight:850;letter-spacing:-.045em;line-height:1.05}.hero-copy p{margin:15px 0 24px;color:#92929d;font-size:14px;line-height:1.7}.hero-actions{display:flex;gap:10px}.hero-primary,.hero-secondary{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:43px;padding:0 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer}.hero-primary{border:0;color:#fff;background:linear-gradient(135deg,#ff4d73,#ff7894);box-shadow:0 8px 24px rgba(255,77,115,.24)}.hero-secondary{border:1px solid rgba(255,255,255,.1);color:#ddd;background:rgba(255,255,255,.035)}.hero-orbit{position:relative;width:250px;height:250px;flex:0 0 250px;margin-right:25px;display:grid;place-items:center;color:#fff;font-size:34px}.hero-orbit:before{content:"";position:absolute;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(255,77,115,.35),rgba(255,77,115,.03) 66%,transparent 67%);filter:blur(2px)}.orbit-ring{position:absolute;width:190px;height:190px;border:1px solid rgba(255,77,115,.24);border-radius:50%;box-shadow:0 0 60px rgba(255,77,115,.12)}.orbit-dot{position:absolute;width:10px;height:10px;border-radius:50%;background:#ff7894;box-shadow:0 0 18px rgba(255,107,141,.7)}.orbit-dot-a{top:35px;right:55px}.orbit-dot-b{bottom:42px;left:42px;width:7px;height:7px;background:#9b83ff}.hero-orbit i{position:relative;z-index:2;width:76px;height:76px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:50%;background:rgba(255,255,255,.06);backdrop-filter:blur(10px)}
.quick-nav{display:flex;gap:8px;margin:0 0 28px;padding:7px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.025);overflow:auto}.quick-item{display:inline-flex;align-items:center;gap:8px;min-width:max-content;padding:10px 16px;border:0;border-radius:9px;color:#92929d;background:transparent;font:inherit;font-size:13px;font-weight:650;cursor:pointer}.quick-item.active,.quick-item:hover{color:#fff;background:rgba(255,77,115,.13)}.quick-item i{color:#ff6b8d}.content-section{scroll-margin-top:88px}.video-section{margin-top:30px}.section-bar{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin:24px 0 16px}.section-bar.compact{margin-top:0}.section-heading{display:flex;align-items:center;gap:10px;margin:3px 0 0;color:#f0f0f3;font-size:20px;font-weight:750;letter-spacing:-.02em}.section-heading:before{content:"";width:4px;height:20px;border-radius:99px;background:linear-gradient(180deg,#ff4d73,#ff7894);box-shadow:0 0 14px rgba(255,77,115,.35)}.section-subtitle{margin-top:4px;color:#777783;font-size:11px}.section-count{padding:6px 10px;border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#777783;font-size:11px}.featured-section{margin-bottom:28px}.featured-grid{display:grid;grid-template-columns:1.55fr 1fr 1fr;gap:14px}.featured-card{position:relative;display:block;min-height:250px;overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:#15151b;color:#fff;text-decoration:none}.featured-card:first-child{min-height:300px}.featured-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .45s ease}.featured-card:hover img{transform:scale(1.055)}.featured-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.04) 20%,rgba(0,0,0,.84) 100%)}.featured-rank{position:absolute;top:14px;left:14px;padding:5px 8px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:rgba(8,8,12,.55);font-size:11px;font-weight:800}.featured-content{position:absolute;right:18px;bottom:17px;left:18px;display:flex;flex-direction:column;gap:6px}.featured-tag{width:max-content;padding:4px 7px;border-radius:6px;background:rgba(255,77,115,.88);font-size:10px}.featured-content strong{display:-webkit-box;overflow:hidden;color:#ff7894;font-size:15px;line-height:1.4;-webkit-line-clamp:2;-webkit-box-orient:vertical}.featured-card:first-child .featured-content strong{font-size:18px}.featured-content small{color:rgba(255,255,255,.68);font-size:11px}.all-latest{margin-top:30px}.compact-empty{min-height:100px}
@media(max-width:900px){.hero-panel{padding:40px}.hero-orbit{opacity:.6}.featured-grid{grid-template-columns:1fr 1fr}.featured-card:first-child{grid-column:1/-1;min-height:290px}}
@media(max-width:640px){.hero-panel{min-height:0;margin:12px 0;padding:30px 22px;border-radius:17px}.hero-copy h1{font-size:30px}.hero-copy p{font-size:13px;margin:12px 0 18px}.hero-orbit{display:none}.hero-actions{flex-wrap:wrap}.hero-primary,.hero-secondary{min-height:40px;padding:0 15px}.quick-nav{margin-bottom:22px;padding:5px}.quick-item{padding:9px 12px;font-size:12px}.featured-grid{grid-template-columns:1fr;gap:10px}.featured-card,.featured-card:first-child{min-height:240px}.featured-card:first-child{grid-column:auto}.section-heading{font-size:18px}.section-bar{margin-top:20px}}
</style>
