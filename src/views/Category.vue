<template>
  <main class="site-main category-page">
    <div class="page-shell">
      <section class="category-hero">
        <div><div class="section-kicker">CATEGORY</div><h1>{{ typeName }}</h1><p>发现 {{ typeName }} 中最新、最热门的影片。</p></div>
      </section>

      <div class="sort-tabs" role="tablist">
        <button v-for="item in sorts" :key="item.key" :class="{active: sort === item.key}" type="button" @click="changeSort(item.key)"><i :class="item.icon"></i>{{ item.label }}</button>
      </div>

      <div class="section-bar"><div><h2 class="section-heading">{{ activeSortLabel }}</h2><div class="section-subtitle">第 {{ page }} 页 · {{ totalPage }} 页</div></div></div>
      <div class="video-grid">
        <template v-if="loading"><div v-for="i in 10" :key="i"><VideoCardSkeleton /></div></template>
        <template v-else><VideoCard v-for="v in list" :key="v.vod_id" :item="v" /></template>
      </div>
      <div v-if="!loading && !list.length" class="empty-state"><i class="bi bi-inbox"></i><strong>这个分类暂时没有影片</strong><span>可以切换排序方式或稍后再试。</span></div>
      <Pagination v-if="list.length || loading" :page="page" :total="totalPage" @change="changePage" />
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

const route = useRoute(), router = useRouter()
const list = ref([]), loading = ref(false), page = ref(1), totalPage = ref(1), typeName = ref('影片分类'), sort = ref(String(route.query.sort || 'latest'))
const sorts = [
  { key:'latest', label:'最新', icon:'bi bi-lightning-charge-fill' },
  { key:'hot', label:'最热', icon:'bi bi-fire' },
  { key:'day', label:'今日热门', icon:'bi bi-bar-chart-fill' },
  { key:'week', label:'本周热门', icon:'bi bi-graph-up-arrow' },
  { key:'score', label:'高分', icon:'bi bi-star-fill' }
]
const activeSortLabel = computed(() => sorts.find(v => v.key === sort.value)?.label || '最新')

async function loadData() {
  page.value = Math.max(1, Number(route.params.page || 1) || 1)
  sort.value = sorts.some(v => v.key === route.query.sort) ? route.query.sort : 'latest'
  loading.value = true
  try {
    const r = await getCategory(route.params.id, page.value, sort.value)
    list.value = r?.data?.list || []
    totalPage.value = Number(r?.data?.pagecount || 1)
    typeName.value = list.value[0]?.type_name || typeName.value || '影片分类'
  } catch { list.value = []; totalPage.value = 1 } finally { loading.value = false }
  document.title = `${typeName.value} - ${activeSortLabel.value} - 91精品`
}
function changeSort(key) { router.push({ name:'category', params:{ id:route.params.id }, query:{ sort:key } }) }
function changePage(p) { router.push({ name:'category', params:{ id:route.params.id, ...(Number(p)>1 ? {page:String(p)} : {}) }, query:{ sort:sort.value } }) }
watch(() => route.fullPath, loadData, { immediate:true })
</script>

<style scoped>
.category-page{padding:20px 0 50px}.category-hero{padding:28px 30px;margin-bottom:14px;border:1px solid rgba(255,255,255,.07);border-radius:16px;background:radial-gradient(circle at 85% 30%,rgba(255,77,115,.15),transparent 30%),#121218}.category-hero h1{margin:5px 0;color:#f4f4f6;font-size:28px}.category-hero p{margin:0;color:#777783;font-size:12px}.section-kicker{color:#ff6b8d;font-size:9px;font-weight:800;letter-spacing:.16em}.sort-tabs{display:flex;gap:7px;padding:6px;margin-bottom:22px;overflow:auto;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:#111117}.sort-tabs button{display:inline-flex;align-items:center;gap:7px;flex:0 0 auto;padding:9px 14px;border:0;border-radius:8px;background:transparent;color:#858590;font-size:12px;cursor:pointer}.sort-tabs button i{color:#ff6b8d}.sort-tabs button.active{color:#fff;background:rgba(255,77,115,.13);box-shadow:inset 0 0 0 1px rgba(255,77,115,.16)}.section-bar{display:flex;align-items:flex-end;justify-content:space-between;margin:18px 0 15px}.section-heading{margin:0;color:#f0f0f3;font-size:20px}.section-subtitle{margin-top:4px;color:#777783;font-size:11px}.empty-state{min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px dashed rgba(255,255,255,.08);border-radius:16px;color:#777783}.empty-state i{font-size:34px;color:#ff7894}.empty-state strong{color:#ddd;font-size:14px}.empty-state span{font-size:11px}
@media(max-width:640px){.category-page{padding-top:10px}.category-hero{padding:22px 18px}.category-hero h1{font-size:23px}.sort-tabs{margin:0 -1px 18px}.sort-tabs button{padding:9px 12px}}
</style>
