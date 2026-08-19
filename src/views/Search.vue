<template>
  <main class="site-main">
    <div class="page-shell">
      <div class="section-bar">
        <div>
          <h1 class="section-heading">搜索结果</h1>
          <div class="section-subtitle">“{{ wd || '请输入关键词' }}” 的相关影片</div>
        </div>
      </div>

      <div v-if="!wd" class="empty-state">
        <i class="bi bi-search"></i>
        <p>请输入关键词搜索影片</p>
      </div>

      <div v-else class="video-grid">
        <template v-if="loading">
          <div v-for="i in 10" :key="i"><VideoCardSkeleton /></div>
        </template>
        <template v-else-if="list.length">
          <VideoCard v-for="v in list" :key="v.vod_id" :item="v" />
        </template>
        <div v-else class="empty-state grid-empty"><i class="bi bi-inbox"></i><p>没有找到相关影片</p></div>
      </div>

      <Pagination v-if="wd" :page="page" :total="totalPage" @change="changePage" />
    </div>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchVideo } from '../api/cms'
import VideoCard from '../components/VideoCard.vue'
import VideoCardSkeleton from '../components/VideoCardSkeleton.vue'
import Pagination from '../components/Pagination.vue'

const route = useRoute()
const router = useRouter()
const list = ref([])
const loading = ref(false)
const wd = ref('')
const page = ref(1)
const totalPage = ref(1)

function sync() {
  wd.value = String(route.query.wd || '').trim()
  const p = Number(route.query.page || 1)
  page.value = Number.isInteger(p) && p > 0 ? p : 1
}

async function loadData() {
  sync()
  if (!wd.value) { list.value = []; return }
  loading.value = true
  try {
    const r = await searchVideo(wd.value, page.value)
    list.value = r?.data?.list || []
    totalPage.value = Number(r?.data?.pagecount || 1)
    document.title = `${wd.value}相关视频-91精品`
  } catch {
    list.value = []
    totalPage.value = 1
  } finally {
    loading.value = false
  }
}

function changePage(p) { router.push({ name: 'search', query: { wd: wd.value, page: String(p) } }) }
watch(() => route.fullPath, loadData, { immediate: true })
</script>

<style scoped>
.empty-state { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #6f6f7a; }
.empty-state i { margin-bottom: 12px; font-size: 34px; color: #454550; }
.empty-state p { margin: 0; font-size: 13px; }
.grid-empty { grid-column: 1 / -1; min-height: 300px; }
</style>
