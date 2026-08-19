<template>
  <main class="site-main home-page">
    <div class="page-shell">
      <section class="hero-panel" aria-label="精选内容">
        <div class="hero-copy">
          <span class="hero-kicker"><i class="bi bi-stars"></i> TODAY'S PICKS</span>
          <h1>发现更多精彩内容</h1>
          <p>简洁、沉浸、快速浏览，随时找到你感兴趣的内容。</p>
          <div class="hero-actions">
            <button class="hero-primary" type="button" @click="scrollToVideos"><i class="bi bi-play-fill"></i>开始浏览</button>
            <router-link class="hero-secondary" :to="{ name: 'home' }"><i class="bi bi-grid-3x3-gap"></i>全部内容</router-link>
          </div>
        </div>
        <div class="hero-orbit" aria-hidden="true">
          <span class="orbit-dot orbit-dot-a"></span><span class="orbit-dot orbit-dot-b"></span><span class="orbit-ring"></span>
          <i class="bi bi-play-fill"></i>
        </div>
      </section>

      <section class="quick-nav" aria-label="快速浏览">
        <div class="quick-item active"><i class="bi bi-lightning-charge-fill"></i><span>最新</span></div>
        <div class="quick-item"><i class="bi bi-fire"></i><span>热门</span></div>
        <div class="quick-item"><i class="bi bi-clock-history"></i><span>最近更新</span></div>
        <div class="quick-item"><i class="bi bi-collection-play"></i><span>精选</span></div>
      </section>

      <section id="video-list" class="content-section">
        <div class="section-bar">
          <div><h2 class="section-heading">最新影片</h2><div class="section-subtitle">每日更新 · 精选内容</div></div>
          <span class="section-count" v-if="!loading">共 {{ list.length }} 部</span>
        </div>
        <div class="video-grid">
          <template v-if="loading"><div v-for="i in 10" :key="i"><VideoCardSkeleton /></div></template>
          <template v-else><VideoCard v-for="v in list" :key="v.vod_id" :item="v" /></template>
        </div>
        <div v-if="!loading && !list.length" class="empty-state"><i class="bi bi-inbox"></i><strong>暂时没有内容</strong><span>请稍后再试，或切换其他分类。</span></div>
        <Pagination v-if="list.length || loading" :page="page" :total="totalPage" @change="changePage" />
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getHome } from '../api/cms'
import VideoCard from '../components/VideoCard.vue'
import VideoCardSkeleton from '../components/VideoCardSkeleton.vue'
import Pagination from '../components/Pagination.vue'

const route = useRoute()
const router = useRouter()
const list = ref([])
const loading = ref(false)
const page = ref(1)
const totalPage = ref(1)

function getPage() {
  const v = Number(route.query.page || 1)
  return Number.isInteger(v) && v > 0 ? v : 1
}

async function loadData() {
  page.value = getPage()
  loading.value = true
  try {
    const r = await getHome(page.value)
    list.value = r?.data?.list || []
    totalPage.value = Number(r?.data?.pagecount || 1)
  } catch {
    list.value = []
    totalPage.value = 1
  } finally {
    loading.value = false
  }
  document.title = `91精品 - 第${page.value}页`
}

function changePage(p) {
  p = Number(p)
  if (p !== page.value) router.push({ name: 'home', query: p > 1 ? { page: String(p) } : {} })
}

function scrollToVideos() {
  document.getElementById('video-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(() => route.fullPath, loadData, { immediate: true })
</script>
