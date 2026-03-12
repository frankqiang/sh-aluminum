<template>
  <div class="stat-card" :class="{ 'stat-card-clickable': clickable }" @click="clickable && $emit('card-click')">
    <div class="stat-header">
      <div class="title-wrapper">
        <div class="icon-bubble" :class="theme">
          <slot name="icon"></slot>
        </div>
        <h3 class="title">{{ title }}</h3>
      </div>
      <div class="main-stat" v-if="mainValue !== undefined">
        <span class="value">{{ mainValue }}</span>
        <span class="label">{{ mainLabel || '总数' }}</span>
        <!-- ② 吨位副文本 -->
        <span class="sub-text" v-if="subText">{{ subText }}</span>
      </div>
    </div>

    <!-- 进度条结构 -->
    <div class="progress-section" v-if="hasProgress">
      <div class="progress-bar">
        <div class="progress-fill completed" :style="{ width: completedPercent + '%' }"></div>
        <div class="progress-fill running" :style="{ width: runningPercent + '%' }"></div>
      </div>
      <div class="progress-labels">
        <div class="progress-label">
          <span class="dot completed"></span>
          <span>已完成 {{ completed }}</span>
        </div>
        <div class="progress-label">
          <span class="dot running"></span>
          <span>进行中 {{ running }}</span>
        </div>
        <div class="progress-label">
          <span class="dot waiting"></span>
          <span>等待中 {{ waiting }}</span>
        </div>
      </div>
    </div>

    <!-- 完全自定义内容插槽 -->
    <div class="custom-body" v-else>
      <slot name="body"></slot>
    </div>

    <!-- ④ 可点击时的跳转箭头提示 -->
    <div class="clickable-hint" v-if="clickable">
      <ExternalLink :size="12" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ExternalLink } from 'lucide-vue-next'

const props = defineProps({
  title: String,
  theme: {
    type: String,
    default: 'blue' // blue, green, purple, orange, teal, red
  },
  mainValue: [Number, String],
  mainLabel: String,
  subText: String,       // ② 吨位等副文本
  clickable: {           // ④ 是否可点击跳转
    type: Boolean,
    default: false,
  },
  // 进度相关
  hasProgress: {
    type: Boolean,
    default: true
  },
  total: {
    type: Number,
    default: 0
  },
  completed: {
    type: Number,
    default: 0
  },
  running: {
    type: Number,
    default: 0
  },
  waiting: {
    type: Number,
    default: 0
  }
})

defineEmits(['card-click'])

const completedPercent = computed(() => {
  if (!props.total) return 0
  return (props.completed / props.total) * 100
})

const runningPercent = computed(() => {
  if (!props.total) return 0
  return (props.running / props.total) * 100
})
</script>

<style scoped>
.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* ④ 可点击卡片样式 */
.stat-card-clickable {
  cursor: pointer;
}

.stat-card-clickable:hover {
  border-color: var(--primary-color);
}

.clickable-hint {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.2s;
}

.stat-card-clickable:hover .clickable-hint {
  opacity: 1;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.icon-bubble {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-bubble.blue {
  background: #eff6ff;
  color: #2563eb;
}

.icon-bubble.green {
  background: #f0fdf4;
  color: #16a34a;
}

.icon-bubble.purple {
  background: #faf5ff;
  color: #9333ea;
}

.icon-bubble.orange {
  background: #fff7ed;
  color: #ea580c;
}

.icon-bubble.red {
  background: #fef2f2;
  color: #dc2626;
}

.icon-bubble.teal {
  background: #f0fdfa;
  color: #0d9488;
}

.title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
  line-height: 1.3;
}

.main-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.main-stat .value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-main);
  margin-bottom: 0.2rem;
}

.main-stat .label {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* ② 吨位副文本 */
.sub-text {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
  font-family: var(--font-mono);
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.progress-bar {
  height: 7px;
  background-color: var(--border-light);
  border-radius: var(--radius-full);
  display: flex;
  overflow: hidden;
}

.progress-fill.completed {
  background-color: var(--status-success);
}

.progress-fill.running {
  background-color: var(--status-processing);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.completed {
  background-color: var(--status-success);
}

.dot.running {
  background-color: var(--status-processing);
}

.dot.waiting {
  background-color: var(--border-medium);
}

.custom-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
