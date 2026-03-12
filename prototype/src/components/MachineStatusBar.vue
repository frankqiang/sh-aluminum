<template>
  <div class="machine-status-wrapper">
    <div class="group-header">
      <h4 class="group-title">{{ title }}</h4>
      <div class="status-legend">
        <span class="legend-item"><span class="dot running"></span>运行</span>
        <span class="legend-item"><span class="dot waiting"></span>待料</span>
        <span class="legend-item"><span class="dot fault"></span>异常</span>
      </div>
    </div>

    <div class="status-grid">
      <div v-for="machine in machines" :key="machine.id" class="machine-block"
        :class="[machine.status, { 'is-selected': selected?.id === machine.id }]" @click="handleClick(machine)">
        <span class="machine-id">{{ extractId(machine.name) }}</span>
      </div>
    </div>

    <!-- 机台详情弹窗 -->
    <Teleport to="body">
      <div class="popup-overlay" v-if="selected" @click.self="close">
        <div class="popup-panel">
          <!-- 弹窗头部 -->
          <div class="popup-header">
            <div class="popup-machine-info">
              <span class="popup-machine-name">{{ selected.name }}</span>
              <span class="status-pill" :class="selected.status">
                {{ statusLabel(selected.status) }}
              </span>
              <span v-if="selected.type" class="type-tag">{{ selected.type }}</span>
              <span v-if="selected.period" class="type-tag">{{ selected.period }}</span>
            </div>
            <button class="popup-close" @click="close">
              <X :size="16" />
            </button>
          </div>

          <!-- ── 轧机弹窗内容 ── -->
          <template v-if="machineType === 'rolling'">
            <RollingMachineDetail :machine="selected" :plans="machinePlans" />
          </template>

          <!-- ── 分切弹窗内容 ── -->
          <template v-else-if="machineType === 'slitting'">
            <SlittingMachineDetail :machine="selected" :plans="machinePlans" />
          </template>

          <!-- ── 精切弹窗内容 ── -->
          <template v-else-if="machineType === 'finishing'">
            <FinishingMachineDetail :machine="selected" :plans="machinePlans" />
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'
import RollingMachineDetail from './machine-detail/RollingMachineDetail.vue'
import SlittingMachineDetail from './machine-detail/SlittingMachineDetail.vue'
import FinishingMachineDetail from './machine-detail/FinishingMachineDetail.vue'

const props = defineProps({
  title: String,
  machineType: { type: String, default: '' }, // 'rolling' | 'slitting' | 'finishing'
  machines: { type: Array, default: () => [] },
  plans: { type: Array, default: () => [] },
  coilField: { type: String, default: 'coilNo' },
})

// 当前选中的机台
const selected = ref(null)

// 当前机台的所有计划
const machinePlans = computed(() => {
  if (!selected.value) return []
  return props.plans.filter(p => String(p.machineId) === String(selected.value.id))
})

function handleClick(machine) {
  selected.value = selected.value?.id === machine.id ? null : machine
}

function close() {
  selected.value = null
}

const statusLabel = (s) => ({ running: '运行中', waiting: '待料', fault: '停机/异常' }[s] || '未知')

const extractId = (name) => {
  const match = name.match(/(\d+)(#|号)/)
  return match ? match[1] : name.substring(0, 2)
}
</script>

<style scoped>
.machine-status-wrapper {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.group-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.status-legend {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot.running {
  background-color: var(--status-success);
}

.dot.waiting {
  background-color: var(--status-warning);
}

.dot.fault {
  background-color: var(--status-error);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 0.5rem;
}

.machine-block {
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: var(--font-mono);
  user-select: none;
}

.machine-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.machine-block.running {
  background-color: var(--status-success-bg);
  color: var(--status-success);
  border: 1px solid #a7f3d0;
}

.machine-block.waiting {
  background-color: var(--status-warning-bg);
  color: #b45309;
  border: 1px solid #fde68a;
}

.machine-block.fault {
  background-color: var(--status-error-bg);
  color: var(--status-error);
  border: 1px solid #fecaca;
}

/* 选中态：蓝色描边 */
.machine-block.is-selected {
  outline: 2px solid var(--primary-color);
  outline-offset: 1px;
}

/* ─── 弹窗遮罩 ─── */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 1000;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

/* 右侧滑出面板 */
.popup-panel {
  width: 480px;
  max-width: 92vw;
  background: var(--bg-surface);
  border-left: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  animation: slideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid var(--border-light);
  gap: 0.75rem;
  flex-shrink: 0;
}

.popup-machine-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.popup-machine-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
}

/* 状态胶囊 */
.status-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.status-pill.running {
  background: var(--status-success-bg);
  color: var(--status-success);
}

.status-pill.waiting {
  background: var(--status-warning-bg);
  color: #b45309;
}

.status-pill.fault {
  background: var(--status-error-bg);
  color: var(--status-error);
}

.type-tag {
  font-size: 0.7rem;
  color: var(--text-muted);
  background: var(--bg-base);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  padding: 0.1rem 0.4rem;
}

.popup-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  transition: background 0.15s;
  flex-shrink: 0;
}

.popup-close:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}
</style>
