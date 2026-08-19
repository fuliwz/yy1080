<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div v-if="links.length" class="friend-links">
        <a v-for="item in links" :key="item.url" :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
      </div>
      <div class="footer-brand">91精品</div>
      <div class="copyright">Copyright © 2026 · All rights reserved.</div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const links = ref([])
async function loadLinks() {
  try {
    const response = await fetch(`/links.json?_=${Date.now()}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const config = await response.json()
    const hostname = window.location.hostname
    links.value = Array.isArray(config[hostname]) ? config[hostname] : []
  } catch (error) {
    console.error('[Footer] 友情链接加载失败:', error)
    links.value = []
  }
}
onMounted(loadLinks)
</script>

<style scoped>
.site-footer { margin-top: 34px; border-top: 1px solid rgba(255,255,255,.06); background: #0a0a0e; }
.footer-inner { width: min(1400px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 32px; text-align: center; }
.friend-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 18px; margin-bottom: 18px; }
.friend-links a { color: #777783; text-decoration: none; font-size: 12px; }
.friend-links a:hover { color: #ff5b7d; }
.footer-brand { color: #d7d7dd; font-size: 14px; font-weight: 700; }
.copyright { margin-top: 6px; color: #4f4f59; font-size: 11px; }
</style>
