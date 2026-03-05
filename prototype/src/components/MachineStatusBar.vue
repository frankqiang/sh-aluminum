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
      <div 
        v-for="machine in machines" 
        :key="machine.id"
        class="machine-block"
        :class="machine.status"
        :title="getTooltipText(machine)"
      >
        <span class="machine-id">{{ extractId(machine.name) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  machines: {
    type: Array,
    default: () => []
  },
  plans: {
    type: Array,
    default: () => []
  },
  coilField: {
    type: String,
    default: 'coilNo'
  }
})

const getStatusLabel = (status) => {
  const map = {
    running: '运行中',
    waiting: '待料',
    fault: '停机/异常'
  }
  return map[status] || '未知'
}

const getTooltipText = (machine) => {
  let tooltip = `${machine.name}\n状态: ${getStatusLabel(machine.status)}`;
  if (machine.status === 'running' && props.plans && props.plans.length > 0) {
    const runningPlan = props.plans.find(p => String(p.machineId) === String(machine.id) && p.status === 'running');
    if (runningPlan && runningPlan[props.coilField]) {
      tooltip += `\n当前作业: ${runningPlan[props.coilField]}`;
      if (runningPlan.alloy) tooltip += ` [${runningPlan.alloy}]`;
    } else {
      tooltip += '\n当前作业: 未知卷号';
    }
  }
  return tooltip;
}

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

.dot.running { background-color: var(--status-success); }
.dot.waiting { background-color: var(--status-warning); }
.dot.fault { background-color: var(--status-error); }

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
  transition: all 0.2s ease;
  font-family: var(--font-mono);
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
</style>
