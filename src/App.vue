<template>
  <Header />
  <AdContainer />
  <router-view />
  <Footer />
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import AdContainer from './components/AdContainer.vue'

const route = useRoute()

let lastTrackedUrl = ''

/**
 * 加载统计脚本
 */
function loadStatistics() {
  if (document.querySelector('script[data-site-tj="1"]')) {
    return
  }

  const script = document.createElement('script')

  script.src = '/tj.js'
  script.async = true
  script.dataset.siteTj = '1'

  script.onerror = () => {
    console.warn('[Statistics] tj.js 加载失败')
  }

  document.head.appendChild(script)
}

/**
 * 统计当前页面
 */
function trackPage() {
  const currentUrl = window.location.href

  if (currentUrl === lastTrackedUrl) {
    return
  }

  lastTrackedUrl = currentUrl

  window._Hasync = window._Hasync || []

  window._Hasync.push([
    'Histats.track_hits',
    ''
  ])

  console.log(
    '[Histats]',
    currentUrl,
    document.title
  )
}

/**
 * 初始化
 */
onMounted(() => {
  loadStatistics()

  setTimeout(() => {
    trackPage()
  }, 500)
})

/**
 * Vue Router 页面切换
 */
watch(
  () => route.fullPath,
  async () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

    await nextTick()

    setTimeout(() => {
      trackPage()
    }, 100)
  }
)
</script>
