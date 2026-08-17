<template>
  <div class="pagination-wrap">
    <button class="btn btn-outline-light btn-sm" :disabled="current <= 1" @click="change(current - 1)">上一页</button>
    <button v-for="p in pageList" :key="p" class="btn btn-sm mx-1" :class="p === current ? 'btn-primary' : 'btn-outline-light'" @click="change(p)">{{ p }}</button>
    <button class="btn btn-outline-light btn-sm" :disabled="current >= totalPage" @click="change(current + 1)">下一页</button>
    <select class="form-select form-select-sm ms-3 page-select" :value="current" @change="change(Number($event.target.value))">
      <option v-for="p in totalPage" :key="p" :value="p">第 {{ p }} 页</option>
    </select>
  </div>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ page: { type: Number, default: 1 }, total: { type: Number, default: 1 } })
const emit = defineEmits(['change'])
const current = computed(() => props.page)
const totalPage = computed(() => props.total)
const pageList = computed(() => {
  const start = Math.max(1, current.value - 5), end = Math.min(totalPage.value, current.value + 5)
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)
})
function change(p) { p = Number(p); if (p >= 1 && p <= totalPage.value) emit('change', p) }
</script>
<style scoped>
.pagination-wrap{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:20px}.page-select{width:120px;background:#0f172a;color:#fff;border:1px solid #2b6fff}
</style>
