<template>
  <main class="site-main search-page">
    <div class="page-shell">
      <section class="search-hero">
        <div class="section-kicker">SEARCH</div>
        <h1>搜索影片</h1>
        <form class="search-form" @submit.prevent="submitSearch">
          <i class="bi bi-search"></i>
          <input v-model="input" autofocus placeholder="输入影片名称或关键词" aria-label="搜索关键词" />
          <button type="submit">搜索</button>
        </form>
        <div v-if="history.length" class="history-row"><span>搜索历史</span><button v-for="word in history" :key="word" type="button" @click="searchWord(word)">{{ word }}</button><button class="clear-history" type="button" @click="clearSearchHistory">清除</button></div>
      </section>

      <section v-if="!wd" class="popular-box">
        <div class="section-bar"><div><h2 class="section-heading">热门搜索</h2><div class="section-subtitle">快速找到大家正在看的影片</div></div></div>
        <div class="popular-list"><button v-for="(word,index) in popular" :key="word" type="button" @click="searchWord(word)"><b>{{ String(index+1).padStart(2,'0') }}</b>{{ word }}</button></div>
      </section>

      <section v-else>
        <div class="section-bar"><div><div class="section-kicker">RESULTS</div><h2 class="section-heading">“{{ wd }}” 的搜索结果</h2><div class="section-subtitle">第 {{ page }} 页 · {{ totalPage }} 页</div></div></div>
        <div class="video-grid">
          <template v-if="loading"><div v-for="i in 10" :key="i"><VideoCardSkeleton /></div></template>
          <template v-else-if="list.length"><VideoCard v-for="v in list" :key="v.vod_id" :item="v" /></template>
        </div>
        <div v-if="!loading && !list.length" class="empty-state"><i class="bi bi-search"></i><strong>没有找到相关影片</strong><span>换一个关键词试试。</span></div>
        <Pagination v-if="list.length || loading" :page="page" :total="totalPage" @change="changePage" />
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchVideo } from '../api/cms'
import VideoCard from '../components/VideoCard.vue'
import VideoCardSkeleton from '../components/VideoCardSkeleton.vue'
import Pagination from '../components/Pagination.vue'

const route = useRoute(), router = useRouter()
const list = ref([]), loading = ref(false), wd = ref(''), input = ref(''), page = ref(1), totalPage = ref(1)
const history = ref([])
const popular = ['最新影片','热门影片','高清','推荐','中文字幕','经典']
const HISTORY_KEY = 'yy1080_search_history'

function loadSearchHistory() { try { const v = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); history.value = Array.isArray(v) ? v.slice(0,8) : [] } catch { history.value=[] } }
function saveSearchHistory(word) { history.value = [word, ...history.value.filter(v => v !== word)].slice(0,8); localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value)) }
function clearSearchHistory() { localStorage.removeItem(HISTORY_KEY); history.value=[] }
function searchWord(word) { input.value=word; submitSearch() }
function submitSearch() { const word=input.value.trim(); if (!word) return; saveSearchHistory(word); router.push({name:'search',query:{wd:word,page:'1'}}) }
function sync() { wd.value=String(route.query.wd || '').trim(); input.value=wd.value; page.value=Math.max(1,Number(route.query.page || 1)||1) }
async function loadData() {
  sync(); loadSearchHistory(); if (!wd.value) { list.value=[]; return }
  loading.value=true
  try { const r=await searchVideo(wd.value,page.value); list.value=r?.data?.list || []; totalPage.value=Number(r?.data?.pagecount || 1); document.title=`${wd.value} - 搜索 - 91精品` }
  catch { list.value=[]; totalPage.value=1 }
  finally { loading.value=false }
}
function changePage(p) { router.push({name:'search',query:{wd:wd.value,page:String(p)}}) }
watch(() => route.fullPath, loadData, {immediate:true})
</script>

<style scoped>
.search-page{padding:20px 0 50px}.search-hero{padding:30px;margin-bottom:28px;border:1px solid rgba(255,255,255,.07);border-radius:18px;background:radial-gradient(circle at 80% 20%,rgba(255,77,115,.15),transparent 30%),#121218}.section-kicker{color:#ff6b8d;font-size:9px;font-weight:800;letter-spacing:.16em}.search-hero h1{margin:5px 0 18px;color:#f5f5f7;font-size:28px}.search-form{display:flex;align-items:center;height:48px;max-width:760px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#0d0d12}.search-form i{margin-left:15px;color:#ff7894}.search-form input{min-width:0;flex:1;height:100%;padding:0 12px;border:0;outline:0;background:transparent;color:#fff;font-size:14px}.search-form input::placeholder{color:#60606a}.search-form button{height:38px;margin-right:5px;padding:0 18px;border:0;border-radius:9px;background:#ff4d73;color:#fff;font-size:12px;font-weight:700;cursor:pointer}.history-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:15px;color:#666670;font-size:11px}.history-row button{padding:5px 9px;border:1px solid rgba(255,255,255,.06);border-radius:7px;background:#191920;color:#9999a4;font-size:11px;cursor:pointer}.history-row button:hover{color:#ff7894}.history-row .clear-history{border:0;background:transparent;color:#5e5e68}.popular-box{padding-bottom:20px}.section-bar{display:flex;align-items:flex-end;margin:18px 0 15px}.section-heading{margin:0;color:#f0f0f3;font-size:20px}.section-subtitle{margin-top:4px;color:#777783;font-size:11px}.popular-list{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.popular-list button{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid rgba(255,255,255,.07);border-radius:11px;background:#131319;color:#bbb;cursor:pointer;text-align:left}.popular-list button:hover{border-color:rgba(255,120,148,.25);color:#ff7894;transform:translateY(-1px)}.popular-list b{color:#ff6b8d;font-size:10px}.empty-state{min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px dashed rgba(255,255,255,.08);border-radius:16px;color:#777783}.empty-state i{font-size:34px;color:#ff7894}.empty-state strong{color:#ddd;font-size:14px}.empty-state span{font-size:11px}
@media(max-width:640px){.search-page{padding-top:10px}.search-hero{padding:22px 16px}.search-hero h1{font-size:23px}.popular-list{grid-template-columns:1fr 1fr}.popular-list button{padding:12px 10px}}
</style>
