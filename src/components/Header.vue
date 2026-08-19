<template>
  <header class="site-header">
    <div class="header-inner">
      <button class="menu-btn" type="button" aria-label="打开分类导航" @click="drawerOpen=true">
        <i class="bi bi-list"></i>
      </button>

      <router-link class="brand" to="/" aria-label="91精品首页">
        <span class="brand-mark">91</span><span>精品</span>
      </router-link>

      <nav class="desktop-nav" aria-label="主导航">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link
          v-for="c in classList.slice(0, 7)"
          :key="c.type_id"
          :to="{name:'category',params:{id:c.type_id}}"
          class="nav-link"
        >{{ c.type_name }}</router-link>
      </nav>

      <form class="search-box" @submit.prevent="goSearch">
        <i class="bi bi-search search-icon"></i>
        <input v-model="keyword" class="search-input" placeholder="搜索影片" aria-label="搜索影片" />
        <button class="search-btn" type="submit" aria-label="搜索">搜索</button>
      </form>
    </div>
  </header>

  <div v-if="drawerOpen" class="drawer-mask" @click="drawerOpen=false"></div>
  <aside class="drawer" :class="{open:drawerOpen}" aria-label="分类导航">
    <div class="drawer-header">
      <div class="drawer-title">分类导航</div>
      <button class="close-btn" type="button" aria-label="关闭" @click="drawerOpen=false"><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="drawer-body">
      <router-link class="drawer-item" to="/" @click="drawerOpen=false"><i class="bi bi-house"></i>首页</router-link>
      <router-link v-for="c in classList" :key="c.type_id" class="drawer-item" :to="{name:'category',params:{id:c.type_id}}" @click="drawerOpen=false">
        <i class="bi bi-collection-play"></i>{{ c.type_name }}
      </router-link>
    </div>
  </aside>
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
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(11,11,15,.88);
  border-bottom: 1px solid rgba(255,255,255,.07);
  backdrop-filter: blur(18px);
}
.header-inner {
  width: min(1400px, calc(100% - 32px));
  min-height: 68px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 18px;
}
.menu-btn {
  width: 38px; height: 38px; flex: 0 0 auto;
  border: 1px solid rgba(255,255,255,.1); border-radius: 10px;
  background: #17171f; color: #ddd; font-size: 19px;
}
.menu-btn:hover { color: #fff; border-color: rgba(255,77,115,.45); }
.brand {
  display: inline-flex; align-items: center; gap: 7px;
  color: #fff; text-decoration: none; font-size: 18px; font-weight: 800; white-space: nowrap;
}
.brand-mark { color: #fff; background: linear-gradient(135deg,#ff416d,#ff7894); padding: 4px 7px; border-radius: 8px; box-shadow: 0 5px 18px rgba(255,77,115,.25); }
.desktop-nav { display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden; }
.nav-link { padding: 8px 10px; border-radius: 8px; color: #a9a9b2; text-decoration: none; font-size: 13px; white-space: nowrap; }
.nav-link:hover, .nav-link.router-link-active { color: #fff; background: rgba(255,255,255,.06); }
.search-box { margin-left: auto; display: flex; align-items: center; width: min(310px, 30vw); min-width: 170px; height: 40px; padding-left: 12px; border: 1px solid rgba(255,255,255,.09); border-radius: 12px; background: #15151b; }
.search-icon { color: #777783; font-size: 14px; }
.search-input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: #fff; padding: 0 10px; font-size: 13px; }
.search-input::placeholder { color: #666671; }
.search-btn { height: 32px; margin-right: 4px; padding: 0 12px; border: 0; border-radius: 9px; background: #ff4d73; color: #fff; font-size: 12px; font-weight: 650; }
.search-btn:hover { background: #ff6385; }
.drawer-mask { position: fixed; inset: 0; z-index: 1098; background: rgba(0,0,0,.72); }
.drawer { position: fixed; top: 0; left: 0; z-index: 1099; width: 290px; max-width: 86vw; height: 100vh; overflow-y: auto; background: #111117; border-right: 1px solid rgba(255,255,255,.08); transform: translateX(-100%); transition: transform .25s ease; box-shadow: 18px 0 40px rgba(0,0,0,.35); }
.drawer.open { transform: translateX(0); }
.drawer-header { height: 68px; padding: 0 18px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.07); }
.drawer-title { color: #fff; font-weight: 750; }
.close-btn { border: 0; background: transparent; color: #777783; font-size: 17px; }
.close-btn:hover { color: #fff; }
.drawer-body { padding: 12px; }
.drawer-item { display: flex; align-items: center; gap: 11px; margin: 3px 0; padding: 11px 12px; border-radius: 9px; color: #aaaab3; text-decoration: none; font-size: 14px; }
.drawer-item i { width: 18px; text-align: center; }
.drawer-item:hover, .drawer-item.router-link-active { color: #fff; background: rgba(255,77,115,.12); }
.drawer-item.router-link-active i { color: #ff5a7c; }
@media (max-width: 900px) { .desktop-nav { display: none; } .search-box { width: min(320px, 48vw); } }
@media (max-width: 640px) { .header-inner { width: calc(100% - 20px); min-height: 60px; gap: 9px; } .brand { font-size: 16px; } .menu-btn { width: 36px; height: 36px; } .search-box { width: auto; flex: 1; min-width: 0; } .search-btn { font-size: 11px; padding: 0 9px; } }
</style>
