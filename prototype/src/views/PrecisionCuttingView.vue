<template>
  <div class="view-container">
    <header class="view-header">
      <div class="header-left">
        <h1 class="view-title">
          <Microscope stroke-width="2.5" :size="24" class="title-icon" />
          精切排产
        </h1>
        <p class="view-subtitle">精切机台的生产计划，接续分切工序产出的半成品子卷</p>
      </div>
      
      <div class="header-actions">
        <!-- 筛选过滤组 -->
        <div class="controls-area">
          <div class="filter-group">
            <div class="filter-item">
              <CalendarDays :size="16" class="icon" />
              <span class="label">日期</span>
              <input type="date" v-model="filterDate" class="control-input" />
            </div>
            <div class="filter-item" style="width: 140px;">
              <Server :size="16" class="icon" />
              <span class="label">机台</span>
              <CustomSelect v-model="filterMachine" :options="machineOptions" class="filter-select" />
            </div>
            <div class="filter-item" style="width: 130px;">
              <ListFilter :size="16" class="icon" />
              <span class="label">状态</span>
              <CustomSelect v-model="filterStatus" :options="statusOptions" class="filter-select" />
            </div>
            <div class="filter-item" style="width: 150px;">
              <Users :size="16" class="icon" />
              <span class="label">客户</span>
              <CustomSelect v-model="filterCustomer" :options="customerOptions" class="filter-select" />
            </div>
          </div>
          
          <div class="search-box">
            <Search :size="16" class="search-icon" />
            <input type="text" v-model="searchText" placeholder="搜索卷号/客户..." class="search-input" />
          </div>

          <button class="action-btn secondary">
            <Printer :size="16" />
            <span>打印</span>
          </button>
        </div>

        <button class="action-btn primary" @click="showAddModal = true">
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
      </div>

      <!-- 表格内容 -->
      <PrecisionPlanTable :data="pagedPlans" @view="handleView" />

      <!-- 分页控制 -->
      <div class="pagination" v-if="totalPages > 0">
        <div class="page-info">共 {{ filteredPlans.length }} 条记录 · 第 {{ currentPage }}/{{ totalPages }} 页</div>
        <div class="page-controls">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
          <button 
            v-for="p in totalPages" 
            :key="p" 
            class="page-btn num" 
            :class="{ active: p === currentPage }"
            @click="currentPage = p"
          >
            {{ p }}
          </button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
        </div>
      </div>
    </div>

    <!-- 详情面板 -->
    <PrecisionDetailPanel 
      :visible="showDetailPanel" 
      :row="selectedRow" 
      @close="showDetailPanel = false" 
    />

    <!-- 新增弹窗 -->
    <AddPrecisionPlanModal 
      :visible="showAddModal" 
      @close="showAddModal = false" 
      @submit="handleSubmit" 
    />

    <!-- 提示框 -->
    <ToastNotification 
      :visible="toastVisible" 
      :message="toastMessage" 
      @close="toastVisible = false" 
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Microscope, Plus, CalendarDays, Search, Printer, Server, ListFilter, Users 
} from 'lucide-vue-next'
import { precisionPlans } from '../data/mock.js'

import PrecisionPlanTable from '../components/PrecisionPlanTable.vue'
import PrecisionDetailPanel from '../components/PrecisionDetailPanel.vue'
import AddPrecisionPlanModal from '../components/AddPrecisionPlanModal.vue'
import ToastNotification from '../components/ToastNotification.vue'
import CustomSelect from '../components/CustomSelect.vue'

// 本地可响应式列表
const localPlans = ref([...precisionPlans])

// 筛选状态
const filterDate = ref('2026-03-05')
const filterMachine = ref('全部')
const filterStatus = ref('全部')
const filterCustomer = ref('全部')
const searchText = ref('')

// 分页
const pageSize = 12
const currentPage = ref(1)

// 弹窗状态
const showAddModal = ref(false)
const showDetailPanel = ref(false)
const selectedRow = ref(null)

const toastVisible = ref(false)
const toastMessage = ref('')

// 选项数据
const machineOptions = computed(() => {
  const ops = [{ value: '全部', label: '全部机台' }]
  for(let i=1; i<=49; i++) {
    ops.push({ value: String(i), label: `${i}#` })
  }
  return ops
})

const statusOptions = [
  { value: '全部', label: '全部状态' },
  { value: '已完成', label: '已完成' },
  { value: '进行中', label: '进行中' },
  { value: '待评审', label: '待评审' },
  { value: '计划中', label: '计划中' }
]

const customerOptions = computed(() => {
  const customers = new Set()
  localPlans.value.forEach(p => {
    if(p.plan) {
      p.plan.forEach(o => customers.add(o.customer))
    }
  })
  const ops = [{ value: '全部', label: '全部客户' }]
  Array.from(customers).sort().forEach(c => {
    ops.push({ value: c, label: c })
  })
  return ops
})

// 显示状态逻辑映射 (待评审 具有高优先级)
function getDisplayStatus(p) {
  if (p.reviewStatus !== 'reviewed') return 'pending_review'
  return p.status
}

// 过滤后的数据
const filteredPlans = computed(() => {
  let result = [...localPlans.value]
  
  // 日期过滤
  if (filterDate.value && filterDate.value !== '') {
    result = result.filter(p => (p.date === filterDate.value) || (p.planDate === filterDate.value))
  }
  
  // 机台过滤
  if (filterMachine.value !== '全部') {
    const selected = filterMachine.value.replace('#', '')
    result = result.filter(p => p.machineId && p.machineId.toString().replace('#', '') === selected)
  }
  
  // 状态过滤
  if (filterStatus.value !== '全部') {
    const statusMap = {
      '已完成': 'completed', 
      '进行中': 'running',
      '待评审': 'pending_review', 
      '计划中': 'planned'
    }
    const targetStatus = statusMap[filterStatus.value]
    result = result.filter(p => getDisplayStatus(p) === targetStatus)
  }
  
  // 客户过滤
  if (filterCustomer.value !== '全部') {
    result = result.filter(p => p.plan && p.plan.some(o => o.customer === filterCustomer.value))
  }
  
  // 文本搜索
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    result = result.filter(p =>
      (p.subCoilNo && p.subCoilNo.toLowerCase().includes(q)) ||
      (p.motherCoilNo && p.motherCoilNo.toLowerCase().includes(q)) ||
      (p.plan && p.plan.some(o => o.customer.toLowerCase().includes(q))) ||
      (p.plan && p.plan.some(o => o.orderNo && o.orderNo.toLowerCase().includes(q)))
    )
  }
  return result
})

// 分页逻辑
const totalPages = computed(() => Math.ceil(filteredPlans.value.length / pageSize))
const pagedPlans = computed(() => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = 1
  }
  const start = (currentPage.value - 1) * pageSize
  return filteredPlans.value.slice(start, start + pageSize)
})

// 状态统计
const stats = computed(() => {
  const plans = filteredPlans.value
  return {
    total: plans.length,
    completed: plans.filter(p => getDisplayStatus(p) === 'completed').length,
    running: plans.filter(p => getDisplayStatus(p) === 'running').length,
    pendingReview: plans.filter(p => getDisplayStatus(p) === 'pending_review').length,
    planned: plans.filter(p => getDisplayStatus(p) === 'planned').length,
  }
})

// 操作事件
function handleView(row) {
  selectedRow.value = row
  showDetailPanel.value = true
}

function handleSubmit(formData) {
  // 生成演示用 ID 和提交时间
  const newRow = {
    ...formData,
    id: `PC-NEW-${Date.now().toString().slice(-4)}`,
    date: filterDate.value || new Date().toISOString().slice(0, 10),
    changeLog: [
      {
        time: new Date().toLocaleString('zh-CN', { hour12: false }),
        operator: "张计划",
        action: "新增排产计划",
      }
    ]
  }
  
  // 插入到当前过滤日期的最前面
  localPlans.value.unshift(newRow)
  showAddModal.value = false
  
  // 提示信息
  const statusLabel = newRow.status === 'pending_review' ? '待评审' : '计划中'
  toastMessage.value = `精切计划添加成功！当前状态：${statusLabel}`
  toastVisible.value = true
}
</script>

<style scoped>
/* 延续分切排产页面的基础布局系统 */
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: -0.02em;
  margin: 0;
}

.title-icon {
  color: var(--primary-color);
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
.filter-item:last-child { border-right: none; }

.icon { color: var(--text-secondary); flex-shrink: 0; }
.label { font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); white-space: nowrap; flex-shrink: 0; }

.control-input {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.85rem;
  color: var(--text-main);
  outline: none;
  padding: 4px 0;
  width: 100%;
  cursor: pointer;
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
  width: 200px;
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
.action-btn.secondary:hover { background-color: var(--bg-hover); color: var(--text-main); }
.action-btn.primary {
  background-color: var(--primary-color);
  color: white;
}
.action-btn.primary:hover { background-color: var(--primary-hover); }

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
.stat-value.total { color: var(--text-main); }
.stat-value.success { color: var(--status-success); }
.stat-value.running { color: var(--primary-color); }
.stat-value.pending { color: #d97706; }
.stat-value.planned { color: var(--text-secondary); }

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
