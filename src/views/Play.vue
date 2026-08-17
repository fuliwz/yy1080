<template>
  <div class="container py-3">
    <div v-if="loading" class="player-loading">正在加载视频…</div>
    <div v-else-if="error" class="player-error">视频加载失败，请稍后重试。</div>

    <template v-else-if="vod">
      <div class="player-wrap mb-3">
        <video ref="video" controls playsinline class="w-100"></video>
      </div>
      <h4 class="title">{{ vod.vod_name }}</h4>
      <p v-if="vod.vod_content" class="desc">{{ vod.vod_content }}</p>

      <h5 v-if="recommend.length" class="section-title mt-4">相关推荐</h5>
      <div v-if="recommend.length" class="row">
        <div class="col-video mb-3" v-for="item in recommend" :key="item.vod_id">
          <VideoCard :item="item" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import Hls from 'hls.js'
import { getDetail, getCategoryLatest } from '../api/cms'
import VideoCard from '../components/VideoCard.vue'

const route = useRoute()
const video = ref(null)
const vod = ref(null)
const recommend = ref([])
const loading = ref(false)
const error = ref(false)
let player = null
let hls = null
let requestId = 0

function destroyPlayer() {
  hls?.destroy()
  hls = null
  player?.destroy()
  player = null
  if (video.value) {
    video.value.removeAttribute('src')
    video.value.load()
  }
}

function initPlayer(url) {
  if (!video.value || !url) return
  destroyPlayer()
  player = new Plyr(video.value, {
    controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
  })

  if (Hls.isSupported()) {
    hls = new Hls({ enableWorker: true })
    hls.loadSource(url)
    hls.attachMedia(video.value)
  } else if (video.value.canPlayType('application/vnd.apple.mpegurl')) {
    video.value.src = url
  } else {
    video.value.src = url
  }
}

async function loadData() {
  const id = route.params.id
  const currentRequest = ++requestId
  if (!id) return

  destroyPlayer()
  vod.value = null
  recommend.value = []
  error.value = false
  loading.value = true

  try {
    const r = await getDetail(id)
    if (currentRequest !== requestId) return

    vod.value = r?.data?.list?.[0] || null
    if (!vod.value) {
      error.value = true
      return
    }

    const url = vod.value.vod_play_url?.split('#')?.[0]?.split('$')?.[1]
    if (url) initPlayer(url)

    if (vod.value.type_id) {
      const rec = await getCategoryLatest(vod.value.type_id, 12)
      if (currentRequest !== requestId) return
      recommend.value = (rec?.data?.list || []).filter(v => String(v.vod_id) !== String(vod.value.vod_id))
    }

    document.title = `${vod.value.vod_name} - 18XX - 在线观看`
  } catch (e) {
    if (currentRequest === requestId) {
      error.value = true
      console.error('播放页加载失败:', e)
    }
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}

watch(() => route.params.id, loadData, { immediate: true })
onBeforeUnmount(() => {
  requestId++
  destroyPlayer()
})
</script>

<style scoped>
.player-wrap {
  background: #000;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 8px;
  overflow: hidden;
}

.title {
  color: #f5f5f5;
  font-weight: 700;
}

.desc {
  color: #aaa;
  line-height: 1.7;
  white-space: pre-line;
}

.section-title { color: #f4c542; font-weight: 700; }

.player-loading,
.player-error {
  padding: 40px 20px;
  text-align: center;
  color: #aaa;
  background: #181818;
  border: 1px solid #333;
  border-radius: 12px;
}

.player-error { color: #f4c542; }
</style>
