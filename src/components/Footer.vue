<template>
  <div class="footer">
    <div
      v-if="links.length"
      class="friend-links"
    >
      <a
        v-for="item in links"
        :key="item.url"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ item.name }}
      </a>
    </div>

    <div class="copyright">
      Copyright © 2026
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const links = ref([])

async function loadLinks() {
  try {
    const response = await fetch(
      `/links.json?_=${Date.now()}`
    )

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      )
    }

    const config = await response.json()

    const hostname =
      window.location.hostname

    links.value =
      Array.isArray(config[hostname])
        ? config[hostname]
        : []

  } catch (error) {
    console.error(
      '[Footer] 友情链接加载失败:',
      error
    )

    links.value = []
  }
}

onMounted(() => {
  loadLinks()
})
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 20px 0;
}

.friend-links {
  margin-bottom: 10px;
}

.friend-links a {
  display: inline-block;
  margin: 0 8px;
  color: #888;
  text-decoration: none;
  font-size: 12px;
}

.friend-links a:hover {
  color: #4da3ff;
}

.copyright {
  color: #888;
  font-size: 12px;
}
</style>
