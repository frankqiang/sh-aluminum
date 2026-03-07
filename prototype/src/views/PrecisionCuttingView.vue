<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <Microscope stroke-width="2.5" :size="24" class="title-icon" />
          精切排产
        </h1>
        <p class="page-desc">精切机台的生产排程，处理分切完成后的子卷。</p>
      </div>
    </div>
    
    <div class="placeholder-content" style="padding: 2rem; color: var(--text-secondary);">
      视图组件加载中... (Task 7 将详细实现此页面)
    </div>
  </div>
</template>

<script setup>
import { Microscope } from 'lucide-vue-next'
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  padding-bottom: 0;
  gap: 1.5rem;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  letter-spacing: -0.01em;
}

.title-icon {
  color: var(--primary-color);
}

.page-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
}
</style>
