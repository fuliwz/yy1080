<template>
  <main class="site-main history-page">
    <div class="page-shell">
      <div class="section-bar">
        <div>
          <div class="section-kicker">WATCH HISTORY</div>
          <h1 class="section-heading">观看历史</h1>
          <div class="section-subtitle">继续观看你最近浏览过的影片</div>
        </div>
        <button v-if="items.length" class="clear-btn" type="button" @click="clearHistory"><i class="bi bi-trash3"></i> 清空历史</button>
      </div>

      <div v-if="items.length" class="video-grid">
        <VideoCard v-for="item in items" :key="item.vod_id" :item="item" />
      </div>
      <div v-else class="empty-state">
        <i class="bi bi-clock-history"></i>
        <strong>还没有观看记录</strong>
        <span>打开影片后会自动记录到这里。</span>
        <router-link to="/" class="back-btn">去发现影片</router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VideoCard from '../components/VideoCard.vue'

const KEY = 'yy1080_watch_history'
const items = ref([])

function loadHistory() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '[]')
    items.value = Array.isArray(data) ? data : []
  } catch {
    items.value = []
  }
}

function clearHistory() {
  localStorage.removeItem(KEY)
  items.value = []
}

onMounted(() => {
  loadHistory()
  document.title = '观看历史 - 91精品'
})
</script>

<style scoped>
.clear-btn{border:1px solid rgba(255,255,255,.08);border-radius:9px;background:#15151b;color:#9999a4;padding:8px 12px;font-size:12px;cursor:pointer}.clear-btn:hover{color:#ff7894;border-color:rgba(255,120,148,.3)}.empty-state{min-height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px dashed rgba(255,255,255,.08);border-radius:16px;color:#777783}.empty-state i{font-size:38px;color:#ff7894}.empty-state strong{color:#ddd;font-size:15px}.empty-state span{font-size:12px}.back-btn{margin-top:12px;padding:9px 15px;border-radius:9px;background:#ff4d73;color:#fff;text-decoration:none;font-size:12px}
@media(max-width:640px){.section-bar{align-items:flex-start}.clear-btn{margin-top:4px}}
</style>
