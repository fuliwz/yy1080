<template>
  <router-link :to="`/play/${item.vod_id}`" class="video-card">
    <div class="thumb-wrap">
      <img :src="coverUrl" :alt="item.vod_name || '视频封面'" class="thumb" loading="lazy" decoding="async" @error="handleImageError" />
      <div class="thumb-shade"></div>
      <div v-if="item.type_name" class="tag category">{{ item.type_name }}</div>
      <div v-if="item.vod_time || item.vod_remarks" class="tag time">{{ item.vod_time || item.vod_remarks }}</div>
      <div class="play-btn" aria-hidden="true"><i class="bi bi-play-fill"></i></div>
      <div class="card-bottom"><span><i class="bi bi-play-circle-fill"></i> {{ item.vod_hits || 0 }}</span><span v-if="item.vod_score"><i class="bi bi-star-fill"></i> {{ item.vod_score }}</span></div>
    </div>
    <div class="info"><div class="title">{{ item.vod_name || '未命名视频' }}</div><div class="meta">{{ item.type_name || '影片' }} · 在线观看</div></div>
  </router-link>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ item: { type: Object, required: true } })
const FALLBACK_COVER = '/fallback.jpg'
const imageFailed = ref(false)
const coverUrl = computed(() => {
  if (imageFailed.value) return FALLBACK_COVER
  const pic = props.item?.vod_pic
  if (!pic) return FALLBACK_COVER
  return pic.startsWith('//') ? `https:${pic}` : pic
})
function handleImageError(event) { if (event.target.dataset.fallback) return; event.target.dataset.fallback = '1'; imageFailed.value = true }
</script>

<style scoped>
.video-card{display:block;width:100%;min-width:0;color:#f5f5f7;text-decoration:none}.thumb-wrap{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:12px;background:#15151b;isolation:isolate;box-shadow:0 7px 22px rgba(0,0,0,.2)}.thumb{position:absolute;inset:0;display:block;width:100%!important;height:100%!important;object-fit:cover;object-position:center;transition:transform .4s ease}.thumb-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.02) 35%,rgba(0,0,0,.72));opacity:.8;transition:.25s}.video-card:hover .thumb{transform:scale(1.055)}.video-card:hover .thumb-shade{opacity:1}.tag{position:absolute;z-index:3;max-width:48%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:4px 7px;border-radius:6px;background:rgba(10,10,14,.78);color:#eee;font-size:10px;line-height:1.15;backdrop-filter:blur(5px)}.category{top:8px;left:8px}.time{right:8px;bottom:8px}.play-btn{position:absolute;z-index:4;top:50%;left:50%;width:50px;height:50px;display:grid;place-items:center;transform:translate(-50%,-50%) scale(.78);border:1px solid rgba(255,255,255,.2);border-radius:50%;background:rgba(255,77,115,.94);color:#fff;font-size:29px;opacity:0;transition:.22s;box-shadow:0 8px 24px rgba(0,0,0,.35)}.video-card:hover .play-btn{opacity:1;transform:translate(-50%,-50%) scale(1)}.card-bottom{position:absolute;z-index:3;right:9px;bottom:8px;left:9px;display:flex;gap:10px;color:rgba(255,255,255,.76);font-size:10px}.card-bottom span{display:inline-flex;align-items:center;gap:4px}.card-bottom i{color:#ff7894}.info{min-width:0;padding:9px 2px 2px}.title{min-height:2.75em;overflow:hidden;color:rgb(255,120,148)!important;font-size:14px;font-weight:650;line-height:1.38;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;transition:color .2s}.video-card:hover .title{color:#ff9bb1!important}.meta{margin-top:4px;color:#777783;font-size:11px;line-height:1.3}.meta i{font-size:10px}@media(max-width:640px){.thumb-wrap{border-radius:9px}.play-btn{width:42px;height:42px;font-size:25px}.title{font-size:13px}}
</style>
