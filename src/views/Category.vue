<template>
  <main class="site-main">
    <div class="page-shell">
      <div class="section-bar">
        <div>
          <h1 class="section-heading">{{ typeName }}</h1>
          <div class="section-subtitle">精选分类 · 第 {{ page }} 页</div>
        </div>
      </div>

      <div class="video-grid">
        <template v-if="loading">
          <div v-for="i in 10" :key="i"><VideoCardSkeleton /></div>
        </template>
        <template v-else>
          <VideoCard v-for="v in list" :key="v.vod_id" :item="v" />
        </template>
      </div>

      <Pagination :page="page" :total="totalPage" @change="changePage" />
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategory } from '../api/cms'
import VideoCard from '../components/VideoCard.vue'
import VideoCardSkeleton from '../components/VideoCardSkeleton.vue'
import Pagination from '../components/Pagination.vue'

const route = useRoute()
const router = useRouter()
const list = ref([])
const loading = ref(false)
const page = ref(1)
const totalPage = ref(1)
const typeName = computed(() => list.value[0]?.type_name || '影片分类')

async function loadData() {
  const p = Number(route.params.page || 1)
  page.value = Number.isInteger(p) && p > 0 ? p : 1
  loading.value = true
  try {
    const r = await getCategory(route.params.id, page.value)
    list.value = r?.data?.list || []
    totalPage.value = Number(r?.data?.pagecount || 1)
  } catch {
    list.value = []
    totalPage.value = 1
  } finally {
    loading.value = false
  }
  document.title = `${typeName.value} - 91精品 - 第${page.value}页`
}

function changePage(p) {
  p = Number(p)
  if (p === page.value) return
  router.push({ name: 'category', params: { id: route.params.id, ...(p > 1 ? { page: String(p) } : {}) } })
}

watch(() => route.fullPath, loadData, { immediate: true })
</script>
