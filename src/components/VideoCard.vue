<template>
  <RouterLink
    class="video-card"
    :to="`/play/${video.vod_id}`"
  >
    <div class="thumb-wrap">
      <img
        :src="imageUrl"
        :alt="video.vod_name"
        loading="lazy"
        @error="onImageError"
      />

      <span
        v-if="video.vod_remarks"
        class="tag"
      >
        {{ video.vod_remarks }}
      </span>
    </div>

    <div class="content">
      <h3 class="title">
        {{ video.vod_name }}
      </h3>

      <div class="meta">
        <span>{{ video.vod_year || "未知年份" }}</span>

        <span v-if="video.type_name">
          · {{ video.type_name }}
        </span>

        <span v-if="video.vod_area">
          · {{ video.vod_area }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
});

const DEFAULT_COVER =
  "/images/default-cover.webp";

const imageUrl = computed(() => {
  return props.video.vod_pic || DEFAULT_COVER;
});

function onImageError(e) {
  e.target.src = DEFAULT_COVER;
}
</script>

<style scoped>
.video-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: #181818;
  color: #fff;
  text-decoration: none;
  transition: .2s;
}

.video-card:hover {
  transform: translateY(-4px);
}

.thumb-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #2b2b2b;
}

.thumb-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(229, 9, 20, .9);
  color: #fff;
  font-size: 12px;
  line-height: 1;
}

.content {
  display: flex;
  flex-direction: column;
  padding: 12px;
  flex: 1;
}

.title {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  min-height: 3em;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  overflow: hidden;
}

.meta {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
  line-height: 1.4;
}
</style>
