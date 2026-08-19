<template>
  <main class="site-main">
    <div class="page-shell play-page">
      <div class="player-wrap">
        <video ref="video" controls class="player"></video>
      </div>

      <section class="video-detail">
        <div class="detail-main">
          <div class="title-area">
            <div class="eyebrow"><span></span> NOW PLAYING</div>
            <h1 class="video-title">{{ vod?.vod_name || '正在加载…' }}</h1>
            <div class="video-meta">
              <span><i class="bi bi-play-circle-fill"></i> 高清在线播放</span>
              <span v-if="vod?.vod_hits"><i class="bi bi-bar-chart-fill"></i> {{ vod.vod_hits }} 次播放</span>
              <span v-if="vod?.type_name"><i class="bi bi-collection-play"></i> {{ vod.type_name }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <button type="button" class="action-btn" @click="sharePage"><i class="bi bi-share"></i><span>分享</span></button>
          </div>
        </div>
        <div v-if="vod?.vod_content" class="desc">{{ vod.vod_content }}</div>
      </section>

      <section v-if="recommend.length" class="recommend-section">
        <div class="section-bar">
          <div>
            <h2 class="section-heading">相关推荐</h2>
            <div class="section-subtitle">更多同类精彩内容</div>
          </div>
          <span class="section-count">{{ recommend.length }} 部</span>
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
  player = new Plyr(video.value, {
    controls: ['play','progress','current-time','mute','volume','settings','fullscreen'],
    settings: ['quality','speed'],
    seekTime: 10,
    tooltips: { controls: true, seek: true }
  })
  if (Hls.isSupported()) {
    hls = new Hls({ enableWorker: true })
    hls.loadSource(url)
    hls.attachMedia(video.value)
  } else {
    video.value.src = url
  }
}

async function sharePage() {
  try {
    if (navigator.share) {
      await navigator.share({ title: vod.value?.vod_name || document.title, url: location.href })
    } else {
      await navigator.clipboard.writeText(location.href)
      alert('播放页链接已复制')
    }
  } catch (_) {}
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
.play-page { padding-top: 22px; padding-bottom: 50px; }
.player-wrap { overflow: hidden; background: #050508; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; box-shadow: 0 20px 55px rgba(0,0,0,.34); }
.player { display: block; width: 100%; min-height: 360px; background: #050508; aspect-ratio: 16/9; }
.video-detail { margin-top: 14px; padding: 22px 24px; border: 1px solid rgba(255,255,255,.07); border-radius: 15px; background: linear-gradient(135deg,rgba(255,255,255,.035),rgba(255,255,255,.015)); }
.detail-main { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; }
.title-area { min-width:0; }
.eyebrow { display:flex; align-items:center; gap:7px; margin-bottom:8px; color:#ff6b8d; font-size:10px; font-weight:800; letter-spacing:.15em; }
.eyebrow span { width:5px; height:5px; border-radius:50%; background:#ff4d73; box-shadow:0 0 10px rgba(255,77,115,.8); }
.video-title { margin:0; color:#f5f5f7; font-size:clamp(20px,2.5vw,28px); font-weight:750; line-height:1.35; letter-spacing:-.025em; }
.video-meta { display:flex; flex-wrap:wrap; gap:14px; margin-top:10px; color:#858590; font-size:12px; }
.video-meta span { display:inline-flex; align-items:center; gap:5px; }
.video-meta i { color:#a0a0ab; font-size:11px; }
.detail-actions { flex:0 0 auto; }
.action-btn { display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 13px; border:1px solid rgba(255,255,255,.09); border-radius:9px; color:#dddde3; background:rgba(255,255,255,.035); cursor:pointer; transition:.2s ease; }
.action-btn:hover { color:#fff; border-color:rgba(255,77,115,.35); background:rgba(255,77,115,.1); transform:translateY(-1px); }
.desc { margin-top:17px; padding-top:15px; border-top:1px solid rgba(255,255,255,.06); color:#858590; font-size:13px; line-height:1.8; white-space:pre-wrap; }
.recommend-section { margin-top:30px; }
.section-subtitle { margin-top:4px; color:#777783; font-size:11px; }
.section-count { padding:6px 10px; border:1px solid rgba(255,255,255,.08); border-radius:8px; color:#777783; font-size:11px; }
@media (max-width:640px) {
  .play-page { padding-top:12px; padding-bottom:30px; }
  .player-wrap { border-radius:10px; margin-left:-10px; margin-right:-10px; border-left:0; border-right:0; box-shadow:0 12px 35px rgba(0,0,0,.3); }
  .player { min-height:210px; }
  .video-detail { margin-top:10px; padding:16px 14px; border-radius:12px; }
  .detail-main { gap:10px; }
  .video-title { font-size:19px; }
  .video-meta { gap:8px 12px; font-size:11px; }
  .action-btn { width:36px; height:36px; padding:0; justify-content:center; border-radius:50%; }
  .action-btn span { display:none; }
  .desc { margin-top:13px; padding-top:12px; font-size:12px; }
  .recommend-section { margin-top:22px; }
  .section-count { display:none; }
}
</style>
