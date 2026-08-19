<template>
  <main class="site-main">
    <div class="page-shell play-page">
      <div class="player-wrap">
        <video ref="video" controls class="player"></video>
      </div>

      <section class="video-detail">
        <div class="detail-title-row">
          <div>
            <h1 class="video-title">{{ vod?.vod_name || '正在加载…' }}</h1>
            <div class="video-meta"><i class="bi bi-play-circle"></i> 高清在线播放</div>
          </div>
        </div>
        <div v-if="vod?.vod_content" class="desc">{{ vod.vod_content }}</div>
      </section>

      <section v-if="recommend.length" class="recommend-section">
        <div class="section-bar">
          <h2 class="section-heading">相关推荐</h2>
        </div>
        <div class="video-grid">
          <VideoCard v-for="item in recommend" :key="item.vod_id" :item="item" />
        </div>
      </section>
    </div>
  </main>
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
let player = null
let hls = null

function destroyPlayer() {
  hls?.destroy(); hls = null
  player?.destroy(); player = null
  if (video.value) { video.value.removeAttribute('src'); video.value.load() }
}

function initPlayer(url) {
  if (!video.value || !url) return
  destroyPlayer()
  player = new Plyr(video.value, { controls: ['play','progress','current-time','mute','volume','settings','fullscreen'] })
  if (Hls.isSupported()) {
    hls = new Hls({ enableWorker: true })
    hls.loadSource(url)
    hls.attachMedia(video.value)
  } else {
    video.value.src = url
  }
}

async function loadData() {
  const id = route.params.id
  if (!id) return
  destroyPlayer(); vod.value = null; recommend.value = []
  try {
    const r = await getDetail(id)
    vod.value = r?.data?.list?.[0] || null
    if (!vod.value) return
    const url = vod.value.vod_play_url?.split('#')?.[0]?.split('$')?.[1]
    initPlayer(url)
    if (vod.value.type_id) {
      const rec = await getCategoryLatest(vod.value.type_id, 12)
      recommend.value = (rec?.data?.list || []).filter(v => v.vod_id !== vod.value.vod_id)
    }
    document.title = `${vod.value.vod_name} - 91精品 - 在线观看`
  } catch (error) {
    console.error('播放页加载失败:', error)
  }
}

watch(() => route.params.id, loadData, { immediate: true })
onBeforeUnmount(destroyPlayer)
</script>

<style scoped>
.play-page { padding-top: 22px; padding-bottom: 36px; }
.player-wrap { overflow: hidden; background: #050508; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; box-shadow: 0 16px 42px rgba(0,0,0,.32); }
.player { display: block; width: 100%; min-height: 360px; background: #050508; aspect-ratio: 16/9; }
.video-detail { padding: 18px 2px 8px; }
.detail-title-row { display: flex; justify-content: space-between; gap: 16px; }
.video-title { margin: 0; color: #f5f5f7; font-size: clamp(18px, 2.3vw, 26px); font-weight: 750; line-height: 1.35; }
.video-meta { margin-top: 7px; color: #777783; font-size: 12px; }
.desc { margin-top: 14px; color: #8b8b96; font-size: 13px; line-height: 1.75; white-space: pre-wrap; }
.recommend-section { margin-top: 18px; }
@media (max-width: 640px) { .play-page { padding-top: 12px; } .player-wrap { border-radius: 10px; margin-left: -10px; margin-right: -10px; border-left: 0; border-right: 0; } .player { min-height: 210px; } }
</style>
