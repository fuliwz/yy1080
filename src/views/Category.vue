<template>
  <div class="container py-3">
    <div class="row">
      <template v-if="loading">
        <div class="col-video mb-3" v-for="i in 10" :key="i">
          <VideoCardSkeleton />
        </div>
      </template>

      <template v-else>
        <div class="col-video mb-3" v-for="v in list" :key="v.vod_id">
          <VideoCard :item="v" />
        </div>
      </template>
    </div>

    <Pagination
      :page="page"
      :total="totalPage"
      @change="changePage"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
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

async function loadData() {
  const p = Number(route.params.page || 1)

  page.value = Number.isInteger(p) && p > 0 ? p : 1
  loading.value = true

  try {
    const r = await getCategory(
      route.params.id,
      page.value
    )

    list.value = r?.data?.list || []

    totalPage.value = Number(
      r?.data?.pagecount || 1
    )

    // 获取分类名称
    const typeName =
      list.value[0]?.type_name || '影片分类'

    // 设置网页标题
    document.title =
      `${typeName} - 91精品 - 第${page.value}页`

  } catch {
    list.value = []
    totalPage.value = 1

    document.title =
      `影片分类 - 91精品 - 第${page.value}页`

  } finally {
    loading.value = false
  }
}

function changePage(p) {
  p = Number(p)

  if (p === page.value) return

  router.push({
    name: 'category',
    params: {
      id: route.params.id,
      ...(p > 1 ? { page: String(p) } : {})
    }
  })
}

watch(
  () => route.fullPath,
  loadData,
  { immediate: true }
)
</script>
