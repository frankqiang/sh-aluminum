<template>
  <div class="capacity-balance">
    <div class="balance-header">
      <Scale :size="18" class="header-icon" />
      <span class="title">产能平衡分析</span>
    </div>
    <div class="balance-divider"></div>
    <div class="balance-list">
      <div class="balance-item" v-for="(item, key) in data" :key="key">
        <div class="item-label">{{ item.label }}</div>
        <div class="arrow-icon">
          <ArrowRight :size="14" />
        </div>
        <div class="item-status" :class="item.status">
          <div class="status-badge">
            <span class="dot"></span>
            <span class="text">{{ item.status === 'sufficient' ? '充足' : '紧张' }}</span>
          </div>
          <span class="count">{{ item.count }} <span class="unit">卷</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Scale, ArrowRight } from 'lucide-vue-next'

defineProps({
  data: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.capacity-balance {
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  height: 60px;
}

.balance-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-right: var(--spacing-lg);
}

.header-icon {
  color: var(--primary-color);
}

.title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: 0.02em;
}

.balance-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border-light);
  margin-right: var(--spacing-xl);
}

.balance-list {
  display: flex;
  gap: 2.5rem;
  flex: 1;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.item-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.arrow-icon {
  color: var(--border-medium);
  display: flex;
  align-items: center;
}

.item-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--bg-main);
  padding: 4px 12px 4px 6px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-light);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.item-status.sufficient .status-badge {
  background-color: var(--status-success-bg);
  color: var(--status-success);
}
.item-status.sufficient .dot {
  background-color: var(--status-success);
}

.item-status.tight .status-badge {
  background-color: var(--status-warning-bg);
  color: var(--status-warning);
}
.item-status.tight .dot {
  background-color: var(--status-warning);
}

.count {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  font-family: var(--font-mono);
}

.unit {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-muted);
  font-family: var(--font-main);
}
</style>
