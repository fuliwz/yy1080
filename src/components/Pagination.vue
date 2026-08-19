<template>
  <nav v-if="totalPage > 1" class="pagination-wrap" aria-label="分页">
    <button class="page-btn arrow" :disabled="current <= 1" @click="change(current - 1)"><i class="bi bi-chevron-left"></i></button>
    <button v-for="p in pageList" :key="p" class="page-btn" :class="{active:p===current}" @click="change(p)">{{ p }}</button>
    <button class="page-btn arrow" :disabled="current >= totalPage" @click="change(current + 1)"><i class="bi bi-chevron-right"></i></button>
    <select class="page-select" :value="current" aria-label="选择页码" @change="change(Number($event.target.value))">
      <option v-for="p in totalPage" :key="p" :value="p">第 {{ p }} 页</option>
    </select>
  </nav>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ page: { type: Number, default: 1 }, total: { type: Number, default: 1 } })
const emit = defineEmits(['change'])
const current = computed(() => props.page)
const totalPage = computed(() => props.total)
const pageList = computed(() => {
  const start = Math.max(1, current.value - 4)
  const end = Math.min(totalPage.value, current.value + 4)
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)
})
function change(p) { p = Number(p); if (p >= 1 && p <= totalPage.value && p !== current.value) emit('change', p) }
</script>
<style scoped>
.pagination-wrap { display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:7px; margin:30px 0 8px; }
.page-btn { min-width:34px; height:34px; padding:0 9px; border:1px solid rgba(255,255,255,.09); border-radius:9px; background:#15151b; color:#92929d; font-size:12px; cursor:pointer; transition:.18s ease; }
.page-btn:hover:not(:disabled) { color:#fff; border-color:rgba(255,77,115,.4); background:#1b1b23; }
.page-btn.active { border-color:#ff4d73; background:#ff4d73; color:#fff; box-shadow:0 6px 18px rgba(255,77,115,.2); }
.page-btn.arrow { font-size:12px; }
.page-btn:disabled { opacity:.35; cursor:not-allowed; }
.page-select { width:105px; height:34px; margin-left:6px; padding:0 9px; border:1px solid rgba(255,255,255,.09); border-radius:9px; outline:0; background:#15151b; color:#aaaab3; font-size:12px; }
@media(max-width:640px){.pagination-wrap{gap:5px;margin-top:24px}.page-btn{min-width:32px;height:32px}.page-select{display:none}}
</style>
