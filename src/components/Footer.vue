<template>
  <div class="footer">
    Copyright © 2026
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 防止重复加载
  if (window.__histats_loaded) return

  window.__histats_loaded = true

  window._Hasync = window._Hasync || []

  window._Hasync.push([
    'Histats.start',
    '1,4657865,4,0,0,0,00010000'
  ])

  window._Hasync.push([
    'Histats.fasi',
    '1'
  ])

  window._Hasync.push([
    'Histats.track_hits',
    ''
  ])

  const hs = document.createElement('script')

  hs.type = 'text/javascript'
  hs.async = true
  hs.src = '//s10.histats.com/js15_as.js'

  ;(document.head || document.body).appendChild(hs)
})
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 20px 0;
  font-size: 12px;
  color: #888;
}
</style>
