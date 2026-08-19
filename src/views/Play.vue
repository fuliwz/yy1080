<template>
  <main class="site-main play-page">
    <div class="page-shell">
      <div class="play-layout">
        <section class="player-column">
          <div class="player-card">
            <div class="player-topbar">
              <div class="player-status"><span></span>正在播放</div>
              <div class="player-format">HD · HLS · 10秒快进</div>
            </div>
            <div class="player-wrap">
              <video ref="video" controls class="player" playsinline preload="metadata"></video>
              <div v-if="playerLoading" class="player-loading"><i class="bi bi-play-circle"></i><span>{{ playerMessage }}</span></div>
            </div>
          </div>

          <section class="video-info-card">
            <div class="info-header">
              <div class="title-area"><div class="eyebrow"><span></span>NOW PLAYING</div><h1 class="video-title">{{ vod?.vod_name || '正在加载…' }}</h1></div>
              <button type="button" class="share-btn" @click="sharePage"><i class="bi bi-share"></i><span>分享</span></button>
            </div>
            <div class="video-meta">
              <span><i class="bi bi-play-circle-fill"></i> 高清在线播放</span>
              <span v-if="vod?.vod_hits"><i class="bi bi-bar-chart-fill"></i> {{ vod.vod_hits }} 次播放</span>
              <span v-if="vod?.type_name"><i class="bi bi-collection-play"></i> {{ vod.type_name }}</span>
              <span v-if="resumeText"><i class="bi bi-clock-history"></i> {{ resumeText }}</span>
            </div>
            <div v-if="vod?.vod_content" class="description"><div class="description-title"><i class="bi bi-info-circle"></i> 视频简介</div><div class="description-text">{{ vod.vod_content }}</div></div>
          </section>
        </section>

        <aside class="side-panel">
          <div class="side-card">
            <div class="side-heading"><div><span class="side-kicker">EXPLORE</span><h2>相关推荐</h2></div><span class="recommend-count">{{ recommend.length }}</span></div>
            <div v-if="recommend.length" class="side-list">
              <router-link v-for="item in recommend.slice(0, 6)" :key="item.vod_id" :to="`/play/${item.vod_id}`" class="side-item">
                <div class="side-thumb"><img :src="item.vod_pic" :alt="item.vod_name || '视频封面'" loading="lazy" /><span class="side-play"><i class="bi bi-play-fill"></i></span></div>
                <div class="side-item-info"><strong>{{ item.vod_name || '未命名视频' }}</strong><span><i class="bi bi-play-circle"></i> {{ item.vod_hits || 0 }} 次播放</span></div>
              </router-link>
            </div>
            <div v-else class="side-empty">暂无相关推荐</div>
          </div>
        </aside>
      </div>

      <section v-if="recommend.length" class="recommend-section">
        <div class="section-bar"><div><div class="section-kicker">MORE FOR YOU</div><h2 class="section-heading">猜你喜欢</h2><div class="section-subtitle">更多同类精彩内容</div></div><span class="section-count">{{ recommend.length }} 部</span></div>
        <div class="video-grid"><VideoCard v-for="item in recommend" :key="item.vod_id" :item="item" /></div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import Hls from 'hls.js'
import { getDetail, getCategoryLatest } from '../api/cms'
import VideoCard from '../components/VideoCard.vue'

const route = useRoute()
const video = ref(null), vod = ref(null), recommend = ref([]), playerLoading = ref(true), playerMessage = ref('正在加载视频…')
let player = null, hls = null, progressTimer = null
const historyKey = 'yy1080_watch_history'
const progressKey = 'yy1080_watch_progress'
const resumeText = ref('')

function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback } }
function writeHistory(item) {
  if (!item?.vod_id) return
  const history = readJson(historyKey, []).filter(v => String(v.vod_id) !== String(item.vod_id))
  history.unshift({ vod_id: item.vod_id, vod_name: item.vod_name, vod_pic: item.vod_pic, type_name: item.type_name, watched_at: Date.now() })
  localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 30)))
}
function saveProgress() {
  if (!vod.value?.vod_id || !video.value?.duration || !video.value.currentTime) return
  const data = readJson(progressKey, {})
  data[vod.value.vod_id] = { currentTime: video.value.currentTime, duration: video.value.duration, updatedAt: Date.now() }
  localStorage.setItem(progressKey, JSON.stringify(data))
}
function getProgress(id) { return readJson(progressKey, {})[id] }
function formatTime(sec) { const m = Math.floor(sec / 60); const s = Math.floor(sec % 60).toString().padStart(2, '0'); return `${m}:${s}` }
function applyResume() {
  const p = getProgress(vod.value?.vod_id)
  if (!p || p.currentTime < 15 || p.currentTime > p.duration - 5) return
  const restore = () => { if (video.value && Number.isFinite(p.currentTime)) video.value.currentTime = p.currentTime; video.value?.removeEventListener('loadedmetadata', restore) }
  video.value?.addEventListener('loadedmetadata', restore)
  resumeText.value = `上次看到 ${formatTime(p.currentTime)}`
}

function destroyPlayer() {
  saveProgress();
  clearInterval(progressTimer); progressTimer = null
  hls?.destroy(); hls = null
  player?.destroy(); player = null
  if (video.value) { video.value.removeAttribute('src'); video.value.load() }
}

function initPlayer(url) {
  if (!video.value || !url) { playerLoading.value = false; playerMessage.value = '暂无可播放源'; return }
  destroyPlayer()
  playerLoading.value = true; playerMessage.value = '正在连接播放源…'
  player = new Plyr(video.value, { controls:['play','progress','current-time','mute','volume','settings','fullscreen'], settings:['quality','speed'], seekTime:10, tooltips:{controls:true,seek:true}, keyboard:{focused:true,global:true} })
  const onReady = () => { playerLoading.value = false; applyResume() }
  video.value.addEventListener('loadedmetadata', onReady, { once:true })
  video.value.addEventListener('error', () => { playerLoading.value = true; playerMessage.value = '播放失败，请重新加载或切换视频' })
  video.value.addEventListener('timeupdate', () => { if (video.value.currentTime > 5) writeHistory(vod.value) })
  if (Hls.isSupported()) {
    hls = new Hls({ enableWorker:true, lowLatencyMode:false, backBufferLength:90 })
    hls.on(Hls.Events.MANIFEST_PARSED, () => { playerLoading.value = false; applyResume() })
    hls.on(Hls.Events.ERROR, (_, data) => { if (data?.fatal) { playerLoading.value = true; playerMessage.value = '播放源加载失败，请重试' } })
    hls.loadSource(url); hls.attachMedia(video.value)
  } else { video.value.src = url; video.value.addEventListener('loadedmetadata', onReady, { once:true }) }
  progressTimer = setInterval(saveProgress, 10000)
}

async function sharePage() {
  try { if (navigator.share) await navigator.share({ title:vod.value?.vod_name || document.title, url:location.href }); else { await navigator.clipboard.writeText(location.href); alert('播放页链接已复制') } } catch (_) {}
}

async function loadData() {
  const id = route.params.id
  if (!id) return
  destroyPlayer(); vod.value = null; recommend.value = []; resumeText.value = ''; playerLoading.value = true
  try {
    const r = await getDetail(id); vod.value = r?.data?.list?.[0] || null
    if (!vod.value) { playerMessage.value = '未找到该视频'; playerLoading.value = false; return }
    writeHistory(vod.value)
    const url = vod.value.vod_play_url?.split('#')?.[0]?.split('$')?.[1]
    initPlayer(url)
    if (vod.value.type_id) {
      const rec = await getCategoryLatest(vod.value.type_id, 12)
      recommend.value = (rec?.data?.list || []).filter(v => String(v.vod_id) !== String(vod.value.vod_id))
    }
    document.title = `${vod.value.vod_name} - 91精品 - 在线观看`
  } catch (error) { console.error('播放页加载失败:', error); playerLoading.value = true; playerMessage.value = '视频加载失败，请刷新重试' }
}

watch(() => route.params.id, loadData, { immediate:true })
onBeforeUnmount(destroyPlayer)
</script>

<style scoped>
.play-page{padding:24px 0 56px}.play-layout{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:18px;align-items:start}.player-column{min-width:0}.player-card,.video-info-card,.side-card{border:1px solid rgba(255,255,255,.075);background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));box-shadow:0 14px 40px rgba(0,0,0,.22)}.player-card{overflow:hidden;border-radius:18px}.player-topbar{height:42px;display:flex;align-items:center;justify-content:space-between;padding:0 15px;background:rgba(255,255,255,.025);border-bottom:1px solid rgba(255,255,255,.06)}.player-status,.player-format{display:flex;align-items:center;gap:7px;color:#a5a5af;font-size:11px;font-weight:700}.player-status span{width:6px;height:6px;border-radius:50%;background:#ff4d73;box-shadow:0 0 10px rgba(255,77,115,.8)}.player-format{color:#686873;font-size:10px;letter-spacing:.08em}.player-wrap{position:relative;overflow:hidden;background:#050508}.player{display:block;width:100%;aspect-ratio:16/9;min-height:360px;background:#050508}.player-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#777783;background:#050508;pointer-events:none}.player-loading i{color:#ff7894;font-size:42px;opacity:.8}.player-loading span{font-size:12px}.video-info-card{margin-top:14px;padding:22px 24px;border-radius:16px}.info-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.title-area{min-width:0}.eyebrow{display:flex;align-items:center;gap:7px;margin-bottom:9px;color:#ff6b8d;font-size:10px;font-weight:800;letter-spacing:.16em}.eyebrow span{width:5px;height:5px;border-radius:50%;background:#ff4d73;box-shadow:0 0 10px rgba(255,77,115,.8)}.video-title{margin:0;color:rgb(255,120,148)!important;font-size:clamp(20px,2.2vw,29px);font-weight:750;line-height:1.38;letter-spacing:-.025em}.share-btn{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 14px;border:1px solid rgba(255,255,255,.09);border-radius:10px;color:#c9c9d0;background:rgba(255,255,255,.035);cursor:pointer}.video-meta{display:flex;flex-wrap:wrap;gap:9px;margin-top:13px}.video-meta span{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border:1px solid rgba(255,255,255,.06);border-radius:7px;color:#858590;background:rgba(255,255,255,.025);font-size:11px}.video-meta i{color:#ff6b8d}.description{margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,.06)}.description-title{display:flex;align-items:center;gap:7px;margin-bottom:7px;color:#b5b5be;font-size:12px;font-weight:700}.description-title i{color:#ff6b8d}.description-text{color:#777783;font-size:12px;line-height:1.8;white-space:pre-wrap}.side-panel{min-width:0}.side-card{padding:17px;border-radius:16px}.side-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.side-kicker,.section-kicker{display:block;margin-bottom:3px;color:#ff6b8d;font-size:9px;font-weight:800;letter-spacing:.16em}.side-heading h2{margin:0;color:#f0f0f3;font-size:18px;font-weight:750}.recommend-count{min-width:28px;height:28px;display:grid;place-items:center;border:1px solid rgba(255,77,115,.2);border-radius:8px;color:#ff7894;background:rgba(255,77,115,.08);font-size:11px}.side-list{display:flex;flex-direction:column;gap:10px}.side-item{display:flex;gap:10px;min-width:0;padding:7px;border-radius:11px;color:inherit;text-decoration:none;transition:.2s}.side-item:hover{background:rgba(255,255,255,.045)}.side-thumb{position:relative;flex:0 0 112px;height:68px;overflow:hidden;border-radius:8px;background:#15151b}.side-thumb img{width:100%;height:100%;display:block;object-fit:cover}.side-play{position:absolute;inset:0;display:grid;place-items:center;color:#fff;background:rgba(0,0,0,.2);opacity:0;transition:.2s}.side-item:hover .side-play{opacity:1}.side-item-info{min-width:0;display:flex;flex-direction:column;justify-content:center;gap:7px}.side-item-info strong{display:-webkit-box;overflow:hidden;color:rgb(255,120,148);font-size:12px;line-height:1.45;font-weight:650;-webkit-line-clamp:2;-webkit-box-orient:vertical}.side-item-info span{color:#666670;font-size:10px}.side-item-info i{color:#ff6b8d}.side-empty{display:grid;min-height:180px;place-items:center;color:#666670;font-size:12px}.recommend-section{margin-top:32px}.section-bar{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:17px}.section-heading{margin:0;color:#f0f0f3;font-size:20px;font-weight:750}.section-subtitle{margin-top:4px;color:#777783;font-size:11px}.section-count{padding:6px 10px;border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#777783;font-size:11px}
@media(max-width:1100px){.play-layout{grid-template-columns:minmax(0,1fr) 280px}.side-thumb{flex-basis:96px;height:62px}.player{min-height:320px}}@media(max-width:820px){.play-layout{display:block}.side-panel{display:none}.player{min-height:0}.video-info-card{padding:20px}.recommend-section{margin-top:26px}}@media(max-width:640px){.play-page{padding:10px 0 32px}.page-shell{width:calc(100% - 20px)}.player-card{margin:0 -10px;border-radius:0;border-left:0;border-right:0}.player-topbar{height:36px;padding:0 12px}.player{aspect-ratio:16/9}.video-info-card{margin-top:10px;padding:16px 14px;border-radius:13px}.info-header{gap:10px}.video-title{font-size:19px}.eyebrow{font-size:9px;margin-bottom:6px}.share-btn{width:36px;height:36px;padding:0;justify-content:center;border-radius:50%}.share-btn span{display:none}.video-meta{gap:6px;margin-top:10px}.video-meta span{padding:5px 7px;font-size:10px}.description{margin-top:14px;padding-top:13px}.description-text{font-size:11px}.recommend-section{margin-top:24px}.section-bar{margin-bottom:12px}.section-heading{font-size:17px}.section-count{display:none}}
</style>
