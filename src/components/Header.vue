<template>
  <nav class="navbar navbar-dark nav-glass px-3">
    <button class="btn btn-menu me-2" type="button" aria-label="打开分类导航" @click="drawerOpen=true">
      <i class="bi bi-list"></i>
    </button>
    <router-link class="navbar-brand brand" to="/">18XX</router-link>
    <form class="search-box ms-auto" @submit.prevent="goSearch">
      <input v-model="keyword" class="search-input" placeholder="搜索影片 / 演员 / 分类" aria-label="搜索影片" />
      <button class="search-btn" type="submit" aria-label="搜索"><i class="bi bi-search"></i></button>
    </form>
  </nav>

  <div v-if="drawerOpen" class="drawer-mask" @click="drawerOpen=false"></div>
  <div class="drawer" :class="{open:drawerOpen}">
    <div class="drawer-header">
      <span>分类导航</span>
      <button class="close-btn" type="button" aria-label="关闭" @click="drawerOpen=false">×</button>
    </div>
    <div class="drawer-body">
      <router-link class="nav-item" to="/" @click="drawerOpen=false"><i class="bi bi-house"></i>首页</router-link>
      <router-link v-for="c in classList" :key="c.type_id" class="nav-item" :to="{name:'category',params:{id:c.type_id}}" @click="drawerOpen=false">
        <i class="bi bi-play-circle"></i>{{ c.type_name }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')
const classList = ref([])
const drawerOpen = ref(false)

function goSearch() {
  const wd = keyword.value.trim()
  if (wd) router.push({ name: 'search', query: { wd, page: '1' } })
}

async function loadClass() {
  try {
    const r = await fetch('/class.json', { cache: 'no-cache' })
    if (r.ok) classList.value = await r.json()
  } catch {
    classList.value = []
  }
}

onMounted(loadClass)
</script>

<style scoped>
.nav-glass {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(18, 18, 18, .96);
  border-bottom: 1px solid #333;
}

.brand {
  color: #f4c542 !important;
  font-weight: 800;
}

.btn-menu {
  border: 1px solid #555;
  color: #f4c542;
  background: #222;
}

.btn-menu:hover { border-color: #f4c542; color: #ffd866; }

.search-box {
  display: flex;
  max-width: min(420px, 60vw);
  background: #222;
  border: 1px solid #3b3b3b;
  border-radius: 999px;
  overflow: hidden;
}

.search-input {
  width: 200px;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;
  padding: 7px 12px;
}

.search-input::placeholder { color: #888; }

.search-btn {
  flex: 0 0 auto;
  border: 0;
  background: #f4c542;
  color: #111;
  padding: 6px 13px;
}

.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 1098;
  background: rgba(0,0,0,.68);
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1099;
  width: 280px;
  max-width: 85vw;
  height: 100vh;
  overflow-y: auto;
  background: #171717;
  border-right: 1px solid #3a3a3a;
  transform: translateX(-100%);
  transition: transform .25s ease;
}

.drawer.open { transform: translateX(0); }

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  color: #f4c542;
  font-weight: 700;
  border-bottom: 1px solid #333;
}

.close-btn {
  border: 0;
  background: transparent;
  color: #aaa;
  font-size: 24px;
  line-height: 1;
}

.nav-item {
  display: flex;
  gap: 9px;
  align-items: center;
  margin-bottom: 5px;
  padding: 10px 12px;
  color: #ddd;
  text-decoration: none;
  border-radius: 8px;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #111;
  background: #f4c542;
}

@media (max-width: 576px) {
  .search-box { max-width: 52vw; }
  .search-input { width: 100%; }
}
</style>
