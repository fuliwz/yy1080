<template>
  <Header />
  <AdContainer />
  <router-view />
  <Footer />
</template>

<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import AdContainer from './components/AdContainer.vue'

const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (!document.title || document.title === '18xx') {
      document.title = '18xx'
    }
  },
  { immediate: true }
)
</script>
