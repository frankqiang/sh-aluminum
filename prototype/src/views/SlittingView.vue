<template>
  <div class="view-container">
    <header class="view-header">
      <div class="header-left">
        <h1 class="view-title">分切排产</h1>
        <p class="view-subtitle">分切机组生产计划与组合排料</p>
      </div>

      <div class="header-actions">
        <div class="controls-area">
          <div class="filter-group">
            <div class="filter-item">
              <CalendarDays :size="16" class="icon" />
              <span class="label">日期</span>
              <input type="date" value="2026-03-05" class="control-input" />
            </div>
            <div class="filter-item" style="width: 160px;">
              <Server :size="16" class="icon" />
              <span class="label">机台</span>
              <CustomSelect v-model="filterMachine" :options="machineOptions" class="filter-select" />
            </div>
            <div class="filter-item" style="width: 160px;">
              <ListFilter :size="16" class="icon" />
              <span class="label">状态</span>
              <CustomSelect v-model="filterStatus" :options="statusOptions" class="filter-select" />
            </div>
          </div>

          <div class="search-box">
            <Search :size="16" class="search-icon" />
            <input type="text" v-model="searchQuery" placeholder="搜索卷号/客户..." class="search-input" />
          </div>

          <button class="action-btn secondary">
            <Printer :size="16" />
            <span>打印</span>
          </button>
        </div>

        <button class="action-btn primary" @click="addModalVisible = true">
          <Plus :size="16" />
          <span>新增计划</span>
        </button>
      </div>
    </header>

    <div class="view-content">
      <!-- 统计条 -->
      <div class="stats-bar">
        <div class="stat-group">
          <span class="stat-label">过滤结果总计:</span>
          <span class="stat-value total">{{ stats.total }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-group">
          <span class="stat-label">已完成:</span>
          <span class="stat-value success">{{ stats.completed }}</span>
        </div>
        <div class="stat-group">
          <span class="stat-label">进行中:</span>
          <span class="stat-value running">{{ stats.running }}</span>
        </div>
        <div class="stat-group">
          <span class="stat-label">待评审:</span>
          <span class="stat-value pending">{{ stats.pendingReview }}</span>
        </div>
        <div class="stat-group">
          <span class="stat-label">计划中:</span>
          <span class="stat-value planned">{{ stats.planned }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-group">
          <span class="stat-label">完成率:</span>
          <span class="stat-value" :class="stats.completionRate >= 50 ? 'success' : 'pending'">{{ stats.completionRate
            }}%</span>
        </div>
        <div class="stat-group">
          <span class="stat-label">平均废料率:</span>
          <span class="stat-value"
            :class="stats.avgWasteRate <= 5 ? 'success' : stats.avgWasteRate <= 10 ? 'pending' : 'running'">{{
              stats.avgWasteRate }}%</span>
        </div>
      </div>

      <!-- 表格内容 -->
      <SlittingPlanTable :data="pagedPlans" @view="handleView" />

      <!-- 分页控制 -->
      <div class="pagination" v-if="totalPages > 0">
        <div class="page-info">共 {{ filteredPlans.length }} 条记录 · 第 {{ currentPage }}/{{ totalPages }} 页</div>
        <div class="page-controls">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
          <button v-for="p in totalPages" :key="p" class="page-btn num" :class="{ active: p === currentPage }"
            @click="currentPage = p">
            {{ p }}
          </button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
        </div>
      </div>
    </div>

    <SlittingDetailPanel :visible="detailVisible" :row="selectedRow" @close="detailVisible = false" />

    <AddSlittingPlanModal :visible="addModalVisible" :machines="slittingMachines" @close="addModalVisible = false"
      @submit="handleAddSubmit" />

    <ToastNotification :visible="toastVisible" :message="toastMessage" @close="toastVisible = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, CalendarDays, Search, Printer, Server, ListFilter } from 'lucide-vue-next'
import SlittingPlanTable from '../components/SlittingPlanTable.vue'
import SlittingDetailPanel from '../components/SlittingDetailPanel.vue'
import AddSlittingPlanModal from '../components/AddSlittingPlanModal.vue'
import ToastNotification from '../components/ToastNotification.vue'
import CustomSelect from '../components/CustomSelect.vue'
import { slittingPlans as rawPlans, slittingMachines } from '../data/mock.js'

// 使用 ref 包裹以支持动态新增
import { reactive } from 'vue'
const slittingPlans = reactive([...rawPlans])

// 下拉选项
const machineOptions = computed(() => [
  { value: '全部', label: '全部机台' },
  ...slittingMachines.map(m => ({ value: m.id, label: m.name }))
])

const statusOptions = [
  { value: '全部', label: '全部状态' },
  { value: '已完成', label: '已完成' },
  { value: '进行中', label: '进行中' },
  { value: '待评审', label: '待评审' },
  { value: '计划中', label: '计划中' }
]

// 筛选状态
const filterMachine = ref('全部')
const filterStatus = ref('全部')
const searchQuery = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = 12

// 弹窗状态
const detailVisible = ref(false)
const selectedRow = ref(null)
const addModalVisible = ref(false)
const toastVisible = ref(false)
const toastMessage = ref('')

// 计算过滤后的数据
const filteredPlans = computed(() => {
  let result = [...slittingPlans]

  if (filterMachine.value !== '全部') {
    result = result.filter(p => p.machineId === filterMachine.value)
  }
  if (filterStatus.value !== '全部') {
    const statusMap = {
      '已完成': 'completed',
      '进行中': 'running',
      '待评审': 'pending_review',
      '计划中': 'planned'
    }
    result = result.filter(p => p.status === statusMap[filterStatus.value])
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      (p.motherCoilNo && p.motherCoilNo.toLowerCase().includes(q)) ||
      (p.customer && p.customer.toLowerCase().includes(q)) ||
      (p.orderNo && p.orderNo.toLowerCase().includes(q))
    )
  }
  return result
})

// 分页逻辑
const totalPages = computed(() => Math.ceil(filteredPlans.value.length / pageSize))
const pagedPlans = computed(() => {
  // 如果当前页大于计算出的总页数且不仅有一页，重置到第一页
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = 1
  }
  const start = (currentPage.value - 1) * pageSize
  return filteredPlans.value.slice(start, start + pageSize)
})

const stats = computed(() => {
  const data = filteredPlans.value
  const total = data.length
  const completed = data.filter(p => p.status === 'completed').length
  const running = data.filter(p => p.status === 'running').length
  const pendingReview = data.filter(p => p.status === 'pending_review').length
  const planned = data.filter(p => p.status === 'planned').length

  // 完成率
  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0'

  // 平均废料率：从计划数据的 cutting.wasteRate 字段计算
  const wasteRates = data
    .filter(p => p.cutting?.wasteRate != null)
    .map(p => parseFloat(p.cutting.wasteRate))
  const avgWasteRate = wasteRates.length > 0
    ? (wasteRates.reduce((a, b) => a + b, 0) / wasteRates.length).toFixed(1)
    : '0.0'

  return { total, completed, running, pendingReview, planned, completionRate, avgWasteRate }
})

function handleView(row) {
  selectedRow.value = row
  detailVisible.value = true
}

function handleAddSubmit(formData) {
  // 将新计划插入列表头部，实现演示闭环
  slittingPlans.unshift(formData)
  addModalVisible.value = false
  const statusLabel = formData.status === 'pending_review' ? '待评审' : '计划中'
  toastMessage.value = `分切计划添加成功！状态：${statusLabel}`
  toastVisible.value = true
}
</script>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.header-left {
  display: flex;
  flex-direction: column;
}

.view-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: -0.02em;
  margin: 0;
}

.view-subtitle {
  color: var(--text-muted);
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.controls-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.filter-group {
  display: flex;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  padding: 4px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-right: 1px solid var(--border-light);
  white-space: nowrap;
}

.filter-item:last-child {
  border-right: none;
}

.icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.control-input {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.85rem;
  color: var(--text-main);
  outline: none;
  padding: 4px 0;
  width: 100%;
}

.filter-select {
  flex: 1;
  min-width: 0;
}

.filter-select :deep(.select-trigger) {
  border: none !important;
  background: transparent !important;
  padding: 4px 0 !important;
  min-height: auto !important;
  box-shadow: none !important;
}

.filter-select :deep(.selected-text) {
  font-size: 0.85rem !important;
}

.search-box {
  position: relative;
  width: 220px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 32px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  background-color: var(--bg-surface);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-btn.secondary {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);
}

.action-btn.secondary:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}

.action-btn.primary {
  background-color: var(--primary-color);
  color: white;
}

.action-btn.primary:hover {
  background-color: var(--primary-hover);
}

/* 内容区域 */
.view-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: var(--spacing-md);
}

/* 统计条 */
.stats-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: 0.75rem 1.25rem;
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.stat-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-divider {
  width: 1px;
  height: 20px;
  background-color: var(--border-light);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 1.15rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

.stat-value.total {
  color: var(--text-main);
}

.stat-value.success {
  color: var(--status-success);
}

.stat-value.running {
  color: var(--primary-color);
}

.stat-value.pending {
  color: #d97706;
}

.stat-value.planned {
  color: var(--text-secondary);
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-sm);
}

.page-info {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.page-controls {
  display: flex;
  gap: 4px;
}

.page-btn {
  padding: 4px 10px;
  font-size: 0.85rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-main);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.num {
  min-width: 32px;
  font-weight: 500;
}

.page-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
</style>
