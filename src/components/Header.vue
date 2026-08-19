<template>
  <header class="site-header">
    <div class="header-inner">
      <button class="menu-btn" type="button" aria-label="打开分类导航" @click="drawerOpen=true"><i class="bi bi-list"></i></button>
      <router-link class="brand" to="/" aria-label="91精品首页"><span class="brand-mark">91</span><span>精品</span></router-link>

      <nav class="desktop-nav" aria-label="主导航">
        <router-link to="/" class="nav-link">首页</router-link>
        <a href="#latest" class="nav-link" @click="goHomeAnchor('latest')">最新</a>
        <a href="#hot" class="nav-link" @click="goHomeAnchor('hot')">热门</a>
        <a href="#day-hot" class="nav-link" @click="goHomeAnchor('day-hot')">今日热门</a>
        <router-link v-for="c in classList.slice(0, 5)" :key="c.type_id" :to="{name:'category',params:{id:c.type_id}}" class="nav-link">{{ c.type_name }}</router-link>
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
    <div class="drawer-header"><div class="drawer-title">浏览影片</div><button class="close-btn" type="button" aria-label="关闭" @click="drawerOpen=false"><i class="bi bi-x-lg"></i></button></div>
    <div class="drawer-body">
      <router-link class="drawer-item" to="/" @click="drawerOpen=false"><i class="bi bi-house"></i>首页</router-link>
      <a class="drawer-item" href="/#latest" @click="goHomeAnchor('latest', true)"><i class="bi bi-lightning-charge"></i>最新影片</a>
      <a class="drawer-item" href="/#hot" @click="goHomeAnchor('hot', true)"><i class="bi bi-fire"></i>热门影片</a>
      <a class="drawer-item" href="/#day-hot" @click="goHomeAnchor('day-hot', true)"><i class="bi bi-bar-chart"></i>今日热门</a>
      <div class="drawer-divider">分类</div>
      <router-link v-for="c in classList" :key="c.type_id" class="drawer-item" :to="{name:'category',params:{id:c.type_id}}" @click="drawerOpen=false"><i class="bi bi-collection-play"></i>{{ c.type_name }}</router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const keyword = ref('')
const classList = ref([])
const drawerOpen = ref(false)

function goSearch() {
  const wd = keyword.value.trim()
  if (wd) router.push({ name: 'search', query: { wd, page: '1' } })
}

function goHomeAnchor(id, close = false) {
  if (close) drawerOpen.value = false
  if (route.name !== 'home') {
    router.push({ name: 'home' }).then(() => setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80))
  } else {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 0)
  }
}

async function loadClass() {
  try {
    const r = await fetch('/class.json', { cache: 'no-cache' })
    if (r.ok) classList.value = await r.json()
  } catch { classList.value = [] }
}

onMounted(loadClass)
</script>

<style scoped>
.site-header{position:sticky;top:0;z-index:1000;background:rgba(11,11,15,.88);border-bottom:1px solid rgba(255,255,255,.07);backdrop-filter:blur(18px)}
.header-inner{width:min(1400px,calc(100% - 32px));min-height:68px;margin:0 auto;display:flex;align-items:center;gap:12px}.menu-btn{width:38px;height:38px;flex:0 0 auto;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:#17171f;color:#ddd;font-size:19px;cursor:pointer}.menu-btn:hover{color:#fff;border-color:rgba(255,77,115,.45)}
.brand{display:inline-flex;align-items:center;gap:7px;color:#fff;text-decoration:none;font-size:18px;font-weight:800;white-space:nowrap}.brand-mark{color:#fff;background:linear-gradient(135deg,#ff416d,#ff7894);padding:4px 7px;border-radius:8px;box-shadow:0 5px 18px rgba(255,77,115,.25)}
.desktop-nav{display:flex;align-items:center;gap:3px;min-width:0;overflow:hidden;margin-left:4px}.nav-link{padding:8px 9px;border-radius:8px;color:#a9a9b2;text-decoration:none;font-size:12px;white-space:nowrap;transition:.2s}.nav-link:hover,.nav-link.router-link-active{color:#fff;background:rgba(255,255,255,.06)}
.search-box{margin-left:auto;display:flex;align-items:center;width:min(310px,30vw);min-width:170px;height:40px;padding-left:12px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:#15151b}.search-icon{color:#777783;font-size:14px}.search-input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:#fff;padding:0 10px;font-size:13px}.search-input::placeholder{color:#666671}.search-btn{height:32px;margin-right:4px;padding:0 12px;border:0;border-radius:9px;background:#ff4d73;color:#fff;font-size:12px;font-weight:650;cursor:pointer}.search-btn:hover{background:#ff6385}
.drawer-mask{position:fixed;inset:0;z-index:1098;background:rgba(0,0,0,.72)}.drawer{position:fixed;top:0;left:0;z-index:1099;width:290px;max-width:86vw;height:100vh;overflow-y:auto;background:#111117;border-right:1px solid rgba(255,255,255,.08);transform:translateX(-100%);transition:transform .25s ease;box-shadow:18px 0 40px rgba(0,0,0,.35)}.drawer.open{transform:translateX(0)}.drawer-header{height:68px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07)}.drawer-title{color:#fff;font-weight:750}.close-btn{border:0;background:transparent;color:#777783;font-size:17px;cursor:pointer}.drawer-body{padding:12px}.drawer-item{display:flex;align-items:center;gap:11px;margin:3px 0;padding:11px 12px;border-radius:9px;color:#aaaab3;text-decoration:none;font-size:14px}.drawer-item i{width:18px;text-align:center;color:#ff7894}.drawer-item:hover,.drawer-item.router-link-active{color:#fff;background:rgba(255,77,115,.12)}.drawer-divider{margin:16px 8px 7px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06);color:#666670;font-size:10px;font-weight:800;letter-spacing:.14em}
@media(max-width:1100px){.desktop-nav .nav-link:nth-child(n+6){display:none}}@media(max-width:900px){.desktop-nav{display:none}.search-box{width:min(320px,48vw)}}@media(max-width:640px){.header-inner{width:calc(100% - 20px);min-height:60px;gap:9px}.brand{font-size:16px}.menu-btn{width:36px;height:36px}.search-box{width:auto;flex:1;min-width:0}.search-btn{font-size:11px;padding:0 9px}}
</style>
