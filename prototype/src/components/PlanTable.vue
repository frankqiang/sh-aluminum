<template>
  <div class="plan-table-wrapper">
    <!-- 机台标头 -->
    <div class="machine-header">
      <div class="machine-info">
        <Server :size="20" class="machine-icon" :class="machine.status" />
        <h3 class="machine-name">{{ machine.name }}</h3>
        <div class="machine-status" :class="machine.status">
          <span class="dot"></span>
          {{ statusLabel(machine.status) }}
        </div>
      </div>
      <div class="machine-stats">
        <div class="stat-item">
          <span class="stat-label">今日计划</span>
          <span class="stat-value">{{ totalCount }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value success">{{ completedCount }}</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <span class="progress-text">{{ progressPercent }}%</span>
        </div>
      </div>
    </div>
    
    <!-- 数据表格 -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th width="48" class="text-center">#</th>
            <th width="65">批次</th>
            <th width="155">新神火卷号<br><span class="text-xs text-muted font-normal">坯料卷号</span></th>
            <th width="95">合金/用途</th>
            <th width="105">原材规格</th>
            <th width="190">道次流转 / 目标厚度 (μm)</th>
            <th width="100">出料/终厚</th>
            <th>工艺说明</th>
            <th width="100">客户</th>
            <th width="90">状态</th>
            <th width="80" class="text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.length === 0">
            <td colspan="11">
              <div class="empty-state">
                <FileX :size="32" class="empty-icon" />
                <span>暂无排产计划</span>
              </div>
            </td>
          </tr>
          <tr v-for="(row, index) in data" :key="row.id" 
              :class="['table-row', `row-${row.status}`]"
          >
            <td class="text-center align-middle text-muted text-sm">{{ index + 1 }}</td>
            <td class="font-mono text-bold text-sm">{{ row.batch }}</td>
            <td>
              <div class="font-mono text-bold text-sm" style="color: var(--primary-color)">{{ row.coilNo }}</div>
              <div class="font-mono text-xs text-muted mt-2px">{{ row.blankCoilNo }}</div>
            </td>
            <td>
              <div class="font-mono text-bold">{{ row.alloy }}</div>
              <div class="usage-badge" :class="'usage-'+row.usage">{{ row.usage || '无' }}</div>
            </td>
            <td>
              <div class="text-sm"><span class="number">{{ row.inThickness }}</span><span class="unit">mm厚</span></div>
              <div class="text-sm"><span class="number">{{ row.width }}</span><span class="unit">mm宽</span></div>
            </td>
            <td>
              <div class="passes-wrap">
                <div v-for="p in row.passes" :key="p.n" class="pass-box" :class="{ 'active': row.currentPasses.includes(p.n) }">
                  <div class="p-num">P{{ p.n }}</div>
                  <div class="p-val">{{ p.t }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="text-sm font-medium" style="color: var(--primary-color);">本: <span class="number">{{ getCurrentPassOut(row) }}</span><span class="unit">μm</span></div>
              <div class="text-xs text-muted mt-2px">终: <span class="number">{{ row.finalThickness }}</span><span class="unit">μm</span></div>
            </td>
            <td class="remark-cell">
              <span class="remark-text" :title="row.remark">{{ row.remark || '-' }}</span>
            </td>
            <td class="text-sm font-medium">{{ row.customer || '-' }}</td>
            <td>
              <div class="status-cell" :class="row.status">
                <CheckCircle2 v-if="row.status === 'completed'" :size="14" />
                <PlayCircle v-else-if="row.status === 'running'" :size="14" />
                <Clock v-else :size="14" />
                <span>{{ rowStatusLabel(row.status) }}</span>
              </div>
            </td>
            <td class="text-center">
              <button class="action-btn" @click.stop="$emit('view', row)">
                查看
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 底部缓冲警告 -->
    <div class="warning-footer" v-if="showWarning">
      <AlertTriangle :size="14" class="warning-icon" />
      <span>缓冲库存仅 {{ bufferCount }} 卷，低于建议值！请协调上道工序。</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Server, CheckCircle2, PlayCircle, Clock, FileX, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  machine: Object,
  data: Array,
  bufferCount: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['view'])

const totalCount = computed(() => props.data.length)
const completedCount = computed(() => props.data.filter(r => r.status === 'completed').length)
const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const showWarning = computed(() => {
  return props.bufferCount !== null && props.bufferCount < 2
})

function statusLabel(status) {
  const map = { 'running': '运行中', 'waiting': '待料', 'fault': '停机' }
  return map[status] || status
}

function rowStatusLabel(status) {
  const map = { 'completed': '已完成', 'running': '进行中', 'planned': '计划中' }
  return map[status] || status
}

function getCurrentPassOut(row) {
  if (!row.currentPasses || !row.passes) return '-'
  const lastPassIdx = row.currentPasses[row.currentPasses.length - 1]
  const p = row.passes.find(pass => pass.n === lastPassIdx)
  return p ? p.t : '-'
}
</script>

<style scoped>
.plan-table-wrapper {
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.machine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  background-color: var(--bg-main);
  border-bottom: 1px solid var(--border-light);
}

.machine-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.machine-icon {
  color: var(--text-muted);
}
.machine-icon.running { color: var(--status-success); }
.machine-icon.waiting { color: var(--status-warning); }
.machine-icon.fault { color: var(--status-error); }

.machine-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: 0.01em;
}

.machine-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
  border: 1px solid transparent;
}

.machine-status.running { background-color: var(--status-success-bg); color: #059669; border-color: #a7f3d0;}
.machine-status.running .dot { background-color: var(--status-success); }
.machine-status.waiting { background-color: var(--status-warning-bg); color: #b45309; border-color: #fde68a;}
.machine-status.waiting .dot { background-color: var(--status-warning); }
.machine-status.fault { background-color: var(--status-error-bg); color: var(--status-error); border-color: #fecaca;}
.machine-status.fault .dot { background-color: var(--status-error); }

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.machine-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.stat-value.success {
  color: var(--status-success);
}

.stat-divider {
  width: 1px;
  height: 14px;
  background-color: var(--border-medium);
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: var(--spacing-sm);
}

.progress-bar {
  width: 60px;
  height: 6px;
  background-color: var(--border-light);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 32px;
}

/* 表格样式 */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 2px solid var(--border-light);
  white-space: nowrap;
}

.data-table td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-main);
}

.table-row {
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: var(--bg-hover);
}

.table-row:last-child td {
  border-bottom: none;
}

/* 状态行高亮 */
.row-running {
  background-color: var(--primary-light);
}
.row-running td {
  border-bottom-color: #dbeafe;
}
.row-running:hover {
  background-color: #e0edff;
}

.text-center { text-align: center; }
.text-muted { color: var(--text-muted); }
.text-secondary { color: var(--text-secondary); }
.text-bold { font-weight: 600; color: var(--text-main); }
.font-mono { font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.02em; }
.text-sm { font-size: 0.85rem; }
.text-xs { font-size: 0.75rem; }
.mt-2px { margin-top: 2px; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }

.number {
  font-family: var(--font-mono);
  font-weight: 500;
}

.unit {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: 2px;
}

.usage-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-top: 4px;
}
.usage-电 { background-color: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
.usage-药 { background-color: #dbeafe; color: #2563eb; border: 1px solid #93c5fd; }
.usage-食 { background-color: #fef08a; color: #ca8a04; border: 1px solid #fde047; }
.usage-双零 { background-color: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; }
.usage-无 { background-color: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }

.passes-wrap {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.pass-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--border-medium);
  border-radius: 4px;
  background-color: var(--bg-surface);
  min-width: 34px;
  overflow: hidden;
  opacity: 0.6;
}

.pass-box.active {
  opacity: 1;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.pass-box .p-num {
  background-color: var(--bg-main);
  color: var(--text-secondary);
  font-size: 0.7rem;
  width: 100%;
  text-align: center;
  padding: 1px 0;
  border-bottom: 1px solid var(--border-medium);
  font-weight: 500;
}

.pass-box.active .p-num {
  background-color: var(--primary-light);
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}

.pass-box .p-val {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 2px 4px;
  color: var(--text-main);
  font-weight: 600;
}

.remark-cell {
  max-width: 250px;
}
.remark-text {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-secondary);
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-cell.completed { color: var(--status-success); background-color: var(--status-success-bg);}
.status-cell.running { color: var(--primary-color); background-color: #dbeafe;}
.status-cell.planned { color: var(--status-warning); background-color: var(--status-warning-bg);}

.action-btn {
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.action-btn:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: var(--text-muted);
  gap: 0.5rem;
}

.empty-icon {
  opacity: 0.5;
}

.warning-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1rem;
  background-color: #fffbeb;
  border-top: 1px solid #fde68a;
  color: #b45309;
  font-size: 0.85rem;
  font-weight: 500;
}

.warning-icon {
  color: var(--status-warning);
}
</style>
