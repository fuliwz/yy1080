<template><div class="container py-3"><div class="row"><template v-if="loading"><div class="col-video mb-3" v-for="i in 10" :key="i"><VideoCardSkeleton/></div></template><template v-else><div class="col-video mb-3" v-for="v in list" :key="v.vod_id"><VideoCard :item="v"/></div></template></div><Pagination :page="page" :total="totalPage" @change="changePage"/></div></template>
<script setup>
import {ref,watch} from 'vue';import {useRoute,useRouter} from 'vue-router';import {getCategory} from '../api/cms';import VideoCard from '../components/VideoCard.vue';import VideoCardSkeleton from '../components/VideoCardSkeleton.vue';import Pagination from '../components/Pagination.vue';
const route=useRoute(),router=useRouter(),list=ref([]),loading=ref(false),page=ref(1),totalPage=ref(1)
async function loadData(){const p=Number(route.params.page||1);page.value=Number.isInteger(p)&&p>0?p:1;loading.value=true;try{const r=await getCategory(route.params.id,page.value);list.value=r?.data?.list||[];totalPage.value=Number(r?.data?.pagecount||1)}catch{list.value=[];totalPage.value=1}finally{loading.value=false}}
function changePage(p){p=Number(p);if(p===page.value)return;router.push({name:'category',params:{id:route.params.id,...(p>1?{page:String(p)}:{})}})}
watch(()=>route.fullPath,loadData,{immediate:true})
</script>
