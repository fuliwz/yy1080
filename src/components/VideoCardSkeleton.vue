<template>
  <div class="sk-card" aria-hidden="true">
    <div class="sk-thumb"></div>
    <div class="sk-line w80"></div>
    <div class="sk-line w60"></div>
  </div>
</template>

<style scoped>
.sk-card {
  width: 100%;
  padding: 0;
  overflow: hidden;
  background: transparent;
}

.sk-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  background: linear-gradient(90deg, #222 25%, #2d2d2d 50%, #222 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}

.sk-line {
  height: 10px;
  margin-top: 9px;
  border-radius: 4px;
  background: #292929;
}

.w80 { width: 80%; }
.w60 { width: 60%; }

@keyframes shimmer {
  to { background-position: -200% 0; }
}
</style>
