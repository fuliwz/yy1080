
<template>
  <router-link :to="`/play/${item.vod_id}`" class="video-card">
    <div class="thumb-wrap"><img :src="item.vod_pic" class="thumb" /><div class="tag category">{{ item.type_name || '视频' }}</div><div class="tag time">{{ item.vod_time || item.vod_remarks }}</div><div class="play-btn"><i class="bi bi-play-circle-fill"></i></div></div>
    <div class="info"><div class="title text-truncate">{{ item.vod_name }}</div><div class="meta">播放 {{ item.vod_hits || 0 }} 次</div></div>
  </router-link>
</template>
<script setup>defineProps({ item: Object })</script>
<style scoped>
.video-card{
    display:block;
    text-decoration:none;
    color:#e6f1ff;
}

.thumb-wrap{
    position:relative;
    width:100%;
    aspect-ratio:16/9;
    overflow:hidden;
    border-radius:10px;
    background:#1f2937; /* 图片加载前或比例不一致时的背景 */
}

.thumb{
    display:block;
    width:100%;
    height:100%;
    object-fit:cover;      /* 统一裁剪填充 */
    object-position:center;/* 居中裁剪 */
}

.tag{
    position:absolute;
    font-size:12px;
    padding:2px 6px;
    border-radius:4px;
    background:rgba(0,0,0,.65);
    color:#fff;
    z-index:2;
}

.category{
    top:6px;
    left:6px;
}

.time{
    bottom:6px;
    right:6px;
}

.play-btn{
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    font-size:38px;
    color:#2b6fff;
    opacity:0;
    transition:opacity .2s;
}

.video-card:hover .play-btn{
    opacity:1;
}

.info{
    padding:6px 2px;
}

.title{
    font-size:14px;
    font-weight:600;
    line-height:1.4;
    min-height:2.8em;

    display:-webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
    overflow:hidden;
}

.meta{
    font-size:12px;
    color:#8aa0b8;
    margin-top:2px;
}
</style>
