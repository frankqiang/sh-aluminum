<template>
  <div class="quality-view">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">质量评审</h1>
        <div class="stats-cards">
          <div class="stat-card">
            <span class="stat-value warning">{{ pendingCount }}</span>
            <span class="stat-label">待评审</span>
          </div>
          <div class="stat-card">
            <span class="stat-value success">{{ reviewedTodayCount }}</span>
            <span class="stat-label">今日已完成</span>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <div class="filter-item">
          <span class="label">工序</span>
          <select v-model="filters.process" class="select-input">
            <option value="">全部</option>
            <option value="轧机">轧机</option>
            <option value="分切">分切</option>
            <option value="精切">精切</option>
          </select>
        </div>
        <div class="filter-item">
          <span class="label">状态</span>
          <select v-model="filters.status" class="select-input">
            <option value="">全部</option>
            <option value="pending">待评审</option>
            <option value="reviewed">已评审</option>
            <option value="revising">修改中</option>
          </select>
        </div>
        <div class="filter-item search-input-wrapper">
          <Search :size="16" class="search-icon" />
          <input 
            type="text" 
            v-model="filters.search" 
            placeholder="搜索卷号..." 
            class="text-input"
          >
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th width="80">序号</th>
            <th width="140">卷号</th>
            <th width="160">来料规格</th>
            <th width="100">工序</th>
            <th width="180">下料时间</th>
            <th width="120">状态</th>
            <th width="120">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filteredList" :key="item.id">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="font-mono font-medium">{{ item.coilNo }}</td>
            <td>{{ item.thickness }}×{{ item.width }}mm</td>
            <td>{{ item.process }}</td>
            <td :class="{ 'warning-text': isOverdue(item) }">
              {{ formatRelativeTime(item.downloadTime) }}
            </td>
            <td>
              <span :class="['status-badge', item.status]">
                {{ getStatusText(item.status) }}
              </span>
            </td>
            <td>
              <button 
                class="btn-action" 
                :class="item.status === 'reviewed' ? 'btn-view' : 'btn-primary'"
                @click="goToReview(item.id)"
              >
                {{ item.status === 'reviewed' ? '查看' : '进入评审' }}
              </button>
            </td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="7" class="empty-state">没有符合条件的料卷</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { qualityCoilList } from '../data/quality-review-data'

const router = useRouter()

// --- Data ---
// In a real app we would use a store or API, here we just use the mock array
// We need to make it reactive so stats could update when navigating back
const coils = ref([...qualityCoilList])

// --- Filters ---
const filters = ref({
  process: '',
  status: '',
  search: ''
})

// --- Stats ---
const pendingCount = computed(() => {
  return coils.value.filter(c => c.status === 'pending' || c.status === 'revising').length
})

const reviewedTodayCount = computed(() => {
  // Mock logic: counting all reviewed for demo purposes
  return coils.value.filter(c => c.status === 'reviewed').length
})

// --- List Logic ---
// Default sort: pending/revising first, then oldest downloadTime first (most urgent)
const filteredList = computed(() => {
  let result = coils.value

  // Apply filters
  if (filters.value.process) {
    result = result.filter(c => c.process === filters.value.process)
  }
  if (filters.value.status) {
    result = result.filter(c => c.status === filters.value.status)
  }
  if (filters.value.search) {
    const term = filters.value.search.toLowerCase()
    result = result.filter(c => c.coilNo.toLowerCase().includes(term))
  }

  // Sort
  result.sort((a, b) => {
    // 1. Status priority: pending/revising > reviewed
    const aIsPending = a.status === 'pending' || a.status === 'revising'
    const bIsPending = b.status === 'pending' || b.status === 'revising'
    
    if (aIsPending && !bIsPending) return -1
    if (!aIsPending && bIsPending) return 1
    
    // 2. Older downloadTime first (ascending)
    return new Date(a.downloadTime) - new Date(b.downloadTime)
  })

  return result
})

// --- Formatting ---
function getStatusText(status) {
  const map = {
    pending: '⏳ 待评审',
    reviewed: '✅ 已评审',
    revising: '🔄 修改中'
  }
  return map[status] || status
}

function formatRelativeTime(dateString) {
  if (!dateString) return '-'
  
  const now = new Date('2026-03-07T13:30:00') // using the current local time context from prompt
  const date = new Date(dateString)
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours < 0) return '刚刚' // Handles slightly negative due to hardcoded 'now'
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24)
    if (days === 1) return '昨天'
    return `${days}天前`
  }
  
  if (diffHours === 0) return `${diffMinutes}分钟前`
  return `${diffHours}小时前`
}

// 超过24小时算逾期
function isOverdue(item) {
  // Only matters for pending stuff
  if (item.status === 'reviewed') return false
  
  const now = new Date('2026-03-07T13:30:00')
  const date = new Date(item.downloadTime)
  const diffHours = (now - date) / (1000 * 60 * 60)
  return diffHours >= 24
}

// --- Navigation ---
function goToReview(id) {
  router.push(`/quality/${id}/review`)
}
</script>

<style scoped>
.quality-view {
  padding: 1.5rem 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main);
}

.page-header {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-main);
  font-weight: 600;
}

.stats-cards {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-value.warning {
  color: var(--warning-color, #f59e0b);
}

.stat-value.success {
  color: var(--success-color, #10b981);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.filter-bar {
  background: var(--bg-surface);
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-light);
  display: flex;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.filter-group {
  display: flex;
  gap: 1.5rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-item .label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.select-input, .text-input {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background-color: var(--bg-main);
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}

.select-input:focus, .text-input:focus {
  border-color: var(--primary-color);
}

.search-input-wrapper {
  position: relative;
  margin-left: 1rem;
}

.search-icon {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input-wrapper .text-input {
  padding-left: 2rem;
  width: 200px;
}

.table-container {
  flex: 1;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  overflow: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.data-table th {
  background-color: var(--bg-main);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table td {
  font-size: 0.9rem;
  color: var(--text-main);
}

.data-table tbody tr {
  transition: background-color 0.2s;
}

.data-table tbody tr:hover {
  background-color: var(--bg-hover);
}

.text-center {
  text-align: center !important;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.font-medium {
  font-weight: 500;
}

.warning-text {
  color: var(--danger-color, #ef4444);
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.status-badge.reviewed {
  background-color: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.status-badge.revising {
  background-color: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}

.btn-action {
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-view {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.btn-view:hover {
  background-color: var(--primary-light);
}

.empty-state {
  text-align: center !important;
  padding: 3rem !important;
  color: var(--text-muted) !important;
}
</style>

