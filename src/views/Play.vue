<template>
  <div class="container py-3">
    <div class="player-wrap mb-3">
      <video ref="video" controls class="w-100"></video>
    </div>

    <h4 class="title">{{ vod?.vod_name }}</h4>
    <div class="desc">{{ vod?.vod_content }}</div>

    <h5 class="section-title mt-4">相关推荐</h5>
    <div class="row">
      <div
        class="col-video mb-3"
        v-for="item in recommend"
        :key="item.vod_id"
      >
        <VideoCard :item="item" />
      </div>
    </div>
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

let player = null
let hls = null

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
    controls: [
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'fullscreen'
    ]
  })

  if (Hls.isSupported()) {
    hls = new Hls()
    hls.loadSource(url)
    hls.attachMedia(video.value)
  } else {
    video.value.src = url
  }
}

async function loadData() {
  const id = route.params.id

  if (!id) return

  destroyPlayer()

  vod.value = null
  recommend.value = []

  try {
    const r = await getDetail(id)

    vod.value = r?.data?.list?.[0] || null

    if (!vod.value) return

    const url =
      vod.value.vod_play_url
        ?.split('#')?.[0]
        ?.split('$')?.[1]

    initPlayer(url)

    if (vod.value.type_id) {
      const rec = await getCategoryLatest(
        vod.value.type_id,
        12
      )

      recommend.value =
        (rec?.data?.list || [])
          .filter(
            v => v.vod_id !== vod.value.vod_id
          )
    }

    document.title =
      `${vod.value.vod_name} - 91精品 - 在线观看`

  } catch (error) {
    console.error(
      '播放页加载失败:',
      error
    )
  }
}

watch(
  () => route.params.id,
  () => loadData(),
  {
    immediate: true
  }
)

onBeforeUnmount(destroyPlayer)
</script>

<style scoped>
.player-wrap {
  background: #000;
  border-radius: 12px;
  padding: 8px;
  border: 1px solid #1e2a44;
}

.title {
  color: #e6f1ff;
  font-weight: 700;
}

.desc {
  color: #9fb3c8;
}

.section-title {
  color: #4da3ff;
  font-weight: 700;
}
</style>
