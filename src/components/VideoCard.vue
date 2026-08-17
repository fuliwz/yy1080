<template>
  <router-link :to="`/play/${item.vod_id}`" class="video-card">
    <div class="thumb-wrap">
      <img :src="coverUrl" :alt="item.vod_name || '视频封面'" class="thumb" loading="lazy" decoding="async" @error="handleImageError" />
      <div v-if="item.type_name || item.vod_remarks" class="tag category">{{ item.type_name || '视频' }}</div>
      <div v-if="item.vod_time || item.vod_remarks" class="tag time">{{ item.vod_time || item.vod_remarks }}</div>
      <div class="play-btn" aria-hidden="true"><i class="bi bi-play-circle-fill"></i></div>
    </div>
    <div class="info">
      <div class="title">{{ item.vod_name || '未命名视频' }}</div>
      <div class="meta">播放 {{ item.vod_hits || 0 }} 次</div>
    </div>
  </router-link>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  item: { type: Object, required: true }
})

const FALLBACK_COVER = '/fallback.jpg'
const imageFailed = ref(false)

const coverUrl = computed(() => {
  if (imageFailed.value) return FALLBACK_COVER
  const pic = props.item?.vod_pic
  if (!pic) return FALLBACK_COVER
  if (pic.startsWith('//')) return `https:${pic}`
  return pic
})

function handleImageError(event) {
  if (event.target.dataset.fallback) return
  event.target.dataset.fallback = '1'
  imageFailed.value = true
}
</script>

<style scoped>
.video-card {
  display: block;
  width: 100%;
  min-width: 0;
  color: #f5f5f5;
  text-decoration: none;
}

.thumb-wrap {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 0;
  overflow: hidden;
  border-radius: 10px;
  background: #222;
  isolation: isolate;
}

.thumb {
  position: absolute;
  inset: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover;
  object-position: center;
}

.tag {
  position: absolute;
  z-index: 2;
  max-width: 45%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 3px 7px;
  border-radius: 4px;
  background: rgba(0, 0, 0, .72);
  color: #f4d35e;
  font-size: 11px;
  line-height: 1.2;
}

.category { top: 7px; left: 7px; }
.time { right: 7px; bottom: 7px; }

.play-btn {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(.9);
  color: #f4c542;
  font-size: 42px;
  line-height: 1;
  opacity: 0;
  transition: opacity .2s ease, transform .2s ease;
  pointer-events: none;
}

.video-card:hover .play-btn {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.info { min-width: 0; padding: 8px 2px 4px; }

.title {
  min-height: 2.8em;
  overflow: hidden;
  color: #f5f5f5;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  margin-top: 3px;
  overflow: hidden;
  color: #999;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  text-overflow: ellipsis;
}

@media (max-width: 576px) {
  .thumb-wrap { border-radius: 8px; }
  .play-btn { font-size: 38px; }
}
</style>
