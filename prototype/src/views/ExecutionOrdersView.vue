<template>
  <div class="orders-view">

    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">订单跟踪</h1>
        <p class="page-subtitle">实时掌握每张订单的生产进度与交期状态</p>
      </div>
      <router-link to="/execution/dashboard" class="btn-back">
        <PhArrowLeft :size="15" weight="bold" />
        返回看板
      </router-link>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <!-- 关键词搜索 -->
      <div class="search-box" :class="{ focused: searchFocused }">
        <PhMagnifyingGlass :size="15" class="search-icon" />
        <input
          v-model="searchQuery"
          class="search-input"
          placeholder="订单号 / 合同号 / 客户名..."
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
          <PhX :size="13" weight="bold" />
        </button>
      </div>

      <!-- 状态筛选 -->
      <div class="filter-group">
        <span class="filter-label">状态</span>
        <div class="filter-pills">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            :class="['pill', { active: selectedStatus === s.value }, s.colorClass]"
            @click="selectedStatus = s.value"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- 客户筛选 -->
      <div class="filter-group">
        <span class="filter-label">客户</span>
        <select v-model="selectedCustomer" class="filter-select">
          <option value="all">全部客户</option>
          <option v-for="c in customerList" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <!-- 产品类型 -->
      <div class="filter-group">
        <span class="filter-label">产品</span>
        <div class="filter-pills">
          <button
            v-for="t in typeOptions"
            :key="t.value"
            :class="['pill', { active: selectedType === t.value }]"
            @click="selectedType = t.value"
          >{{ t.label }}</button>
        </div>
      </div>

      <!-- 仅看逾期 -->
      <label class="overdue-toggle">
        <input type="checkbox" v-model="overdueOnly" class="toggle-input" />
        <span class="toggle-track" :class="{ on: overdueOnly }">
          <span class="toggle-thumb"></span>
        </span>
        <span class="toggle-label">仅逾期</span>
      </label>

      <!-- 结果计数 -->
      <div class="result-count">
        共 <strong>{{ filteredOrders.length }}</strong> 张
      </div>

      <!-- 清除筛选 -->
      <button v-if="hasFilters" class="btn-clear-filter" @click="clearFilters">
        <PhX :size="13" weight="bold" />
        清除筛选
      </button>
    </div>

    <!-- 主区域：订单表格 -->
    <div class="main-area">

      <!-- 订单表格 -->
      <div class="table-wrap">
        <table class="order-table">
          <thead>
            <tr>
              <th @click="toggleSort('orderNo')" class="sortable">
                订单号
                <PhCaretUpDown :size="12" class="sort-icon" :class="{ active: sortKey === 'orderNo' }" />
              </th>
              <th>客户</th>
              <th>产品规格</th>
              <th>合金</th>
              <th @click="toggleSort('deliveryDate')" class="sortable">
                交期
                <PhCaretUpDown :size="12" class="sort-icon" :class="{ active: sortKey === 'deliveryDate' }" />
              </th>
              <th>距交期</th>
              <th>总量</th>
              <th @click="toggleSort('progress')" class="sortable">
                完成进度
                <PhCaretUpDown :size="12" class="sort-icon" :class="{ active: sortKey === 'progress' }" />
              </th>
              <th>当前工序</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              :class="[
                'order-row',
                order.isOverdue ? 'row-overdue' : (order.daysUntilDelivery <= 3 && order.status !== 'completed' ? 'row-warning' : '')
              ]"
              @click="goToDetail(order)"
              style="cursor: pointer;"
            >
              <!-- 订单号 / 合同号 -->
              <td>
                <div class="order-no">{{ order.orderNo }}</div>
                <div class="order-contract">{{ order.contractNo }}</div>
              </td>

              <!-- 客户 -->
              <td class="td-customer">{{ order.customer }}</td>

              <!-- 产品规格 -->
              <td>
                <div class="spec-main">{{ order.thickness }}μm × {{ order.width }}mm</div>
                <div class="spec-sub">{{ order.product }}</div>
              </td>

              <!-- 合金牌号 -->
              <td class="td-alloy">{{ order.alloy ?? '—' }}</td>

              <!-- 交期 -->
              <td class="td-date">{{ order.deliveryDate }}</td>

              <!-- 距交期 -->
              <td>
                <span :class="['days-chip', daysClass(order)]">
                  {{ daysLabel(order) }}
                </span>
              </td>

              <!-- 总量 -->
              <td class="td-qty">
                <span class="qty-coils">{{ order.totalCoils }} 卷</span>
                <div class="qty-weight">{{ order.totalWeight ? (order.totalWeight / 1000).toFixed(1) + ' 吨' : '—' }}</div>
              </td>

              <!-- 完成进度 -->
              <td>
                <div class="progress-cell">
                  <div class="prog-bar-wrap">
                    <div class="prog-bar-track">
                      <div
                        class="prog-bar-fill"
                        :style="{
                          width: progressPct(order) + '%',
                          background: progressColor(order)
                        }"
                      ></div>
                    </div>
                    <span class="prog-fraction">{{ order.completedCoils }}/{{ order.totalCoils }}</span>
                  </div>
                  <span class="prog-pct">{{ progressPct(order) }}%</span>
                </div>
              </td>

              <!-- 当前工序 -->
              <td>
                <span :class="['stage-chip', currentStageClass(order)]">
                  {{ currentStageLabel(order) }}
                </span>
              </td>

              <!-- 状态 -->
              <td>
                <span :class="['status-badge', `status-${order.status}`]">
                  {{ statusLabel(order.status) }}
                </span>
              </td>
            </tr>

            <!-- 空状态 -->
            <tr v-if="filteredOrders.length === 0">
              <td colspan="9" class="empty-row">
                <div class="empty-content">
                  <PhClipboardText :size="36" class="empty-icon" />
                  <div>未找到符合条件的订单</div>
                  <button v-if="hasFilters" class="link-btn" @click="clearFilters">清除所有筛选</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhMagnifyingGlass, PhX, PhArrowLeft, PhCaretUpDown,
  PhClipboardText
} from '@phosphor-icons/vue'
import { fullOrders } from '../data/execution/index.js'

const router = useRouter()

// ── 筛选状态 ──────────────────────────────────────────────────
const searchQuery    = ref('')
const searchFocused  = ref(false)
const selectedStatus = ref('all')
const selectedCustomer = ref('all')
const selectedType   = ref('all')
const overdueOnly    = ref(false)

// 排序
const sortKey = ref('deliveryDate')
const sortAsc = ref(true)

// ── 筛选选项 ──────────────────────────────────────────────────
const statusOptions = [
  { value: 'all',       label: '全部',    colorClass: '' },
  { value: 'pending',   label: '待排产',  colorClass: '' },
  { value: 'producing', label: '生产中',  colorClass: 'pill-blue' },
  { value: 'packing',   label: '待包装',  colorClass: 'pill-purple' },
  { value: 'completed', label: '已完成',  colorClass: 'pill-green' },
]

const typeOptions = [
  { value: 'all',  label: '全部' },
  { value: '电池箔', label: '电池箔' },
  { value: '双零箔', label: '双零箔' },
]

const customerList = computed(() => {
  const set = new Set(fullOrders.map(o => o.customer))
  return [...set].sort()
})

// ── 计算：是否有活跃筛选 ──────────────────────────────────────
const hasFilters = computed(() =>
  searchQuery.value.trim() !== '' ||
  selectedStatus.value !== 'all' ||
  selectedCustomer.value !== 'all' ||
  selectedType.value !== 'all' ||
  overdueOnly.value
)

function clearFilters() {
  searchQuery.value     = ''
  selectedStatus.value  = 'all'
  selectedCustomer.value = 'all'
  selectedType.value    = 'all'
  overdueOnly.value     = false
}

// ── 筛选 + 排序逻辑 ──────────────────────────────────────────
const filteredOrders = computed(() => {
  let list = [...fullOrders]

  // 关键词搜索
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(o =>
      o.orderNo?.toLowerCase().includes(q) ||
      o.contractNo?.toLowerCase().includes(q) ||
      o.customer?.toLowerCase().includes(q)
    )
  }

  // 状态筛选
  if (selectedStatus.value !== 'all') {
    list = list.filter(o => o.status === selectedStatus.value)
  }

  // 客户筛选
  if (selectedCustomer.value !== 'all') {
    list = list.filter(o => o.customer === selectedCustomer.value)
  }

  // 产品类型
  if (selectedType.value !== 'all') {
    list = list.filter(o => o.product?.includes(selectedType.value))
  }

  // 仅逾期
  if (overdueOnly.value) {
    list = list.filter(o => o.isOverdue)
  }

  // 排序
  list.sort((a, b) => {
    let va, vb
    if (sortKey.value === 'orderNo') {
      va = a.orderNo; vb = b.orderNo
      return sortAsc.value ? va.localeCompare(vb) : vb.localeCompare(va)
    } else if (sortKey.value === 'deliveryDate') {
      va = new Date(a.deliveryDate); vb = new Date(b.deliveryDate)
    } else if (sortKey.value === 'progress') {
      va = a.totalCoils ? a.completedCoils / a.totalCoils : 0
      vb = b.totalCoils ? b.completedCoils / b.totalCoils : 0
    } else {
      va = a.daysUntilDelivery; vb = b.daysUntilDelivery
    }
    return sortAsc.value ? va - vb : vb - va
  })

  return list
})

// ── 排序切换 ─────────────────────────────────────────────────
function toggleSort(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

// ── 跳转到订单详情页 ──────────────────────────────────────────
function goToDetail(order) {
  router.push(`/execution/orders/${order.id}`)
}

// ── 辅助函数 ─────────────────────────────────────────────────
function progressPct(order) {
  if (!order.totalCoils) return 0
  return Math.round(order.completedCoils / order.totalCoils * 100)
}

function progressColor(order) {
  if (order.isOverdue) return 'var(--status-error)'
  if (order.status === 'completed') return 'var(--status-success)'
  if (order.daysUntilDelivery <= 3) return '#f59e0b'
  return 'var(--status-processing)'
}

function daysLabel(order) {
  if (order.status === 'completed') return '已完成'
  if (order.isOverdue) return `逾期 ${Math.abs(order.daysUntilDelivery)} 天`
  if (order.daysUntilDelivery === 0) return '今日截止'
  return `剩 ${order.daysUntilDelivery} 天`
}

function daysClass(order) {
  if (order.status === 'completed') return 'chip-done'
  if (order.isOverdue) return 'chip-critical'
  if (order.daysUntilDelivery <= 3) return 'chip-warning'
  return 'chip-normal'
}

function statusLabel(status) {
  const map = {
    pending:   '待排产',
    producing: '生产中',
    packing:   '待包装',
    completed: '已完成',
  }
  return map[status] ?? status
}

// 当前工序：取关联料卷中最靠前的未完成工序
const stagePriority = { rolling: 1, slitting: 2, finishing: 3, packing: 4, completed: 5 }
function currentStageLabel(order) {
  if (order.status === 'pending') return '待排产'
  if (order.status === 'completed') return '已完成'
  const coils = order.linkedCoils || []
  if (!coils.length) return '—'
  // 找最靠前的未完成工序
  let earliest = 'completed'
  for (const c of coils) {
    if (c.stage !== 'completed' && (stagePriority[c.stage] || 99) < (stagePriority[earliest] || 99)) {
      earliest = c.stage
    }
  }
  const labels = { rolling: '轧制中', slitting: '分切中', finishing: '精切中', packing: '待包装', completed: '全部完成' }
  return labels[earliest] || earliest
}
function currentStageClass(order) {
  if (order.status === 'pending') return 'stg-pending'
  if (order.status === 'completed') return 'stg-done'
  const coils = order.linkedCoils || []
  if (!coils.length) return 'stg-pending'
  let earliest = 'completed'
  for (const c of coils) {
    if (c.stage !== 'completed' && (stagePriority[c.stage] || 99) < (stagePriority[earliest] || 99)) {
      earliest = c.stage
    }
  }
  const cls = { rolling: 'stg-rolling', slitting: 'stg-slitting', finishing: 'stg-finishing', packing: 'stg-packing', completed: 'stg-done' }
  return cls[earliest] || 'stg-pending'
}
</script>

<style scoped>
/* ── 页面布局 ───────────────────────────────── */
.orders-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.875rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-back:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

/* ── 筛选栏 ─────────────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 0.7rem 1rem;
  flex-shrink: 0;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 0.38rem 0.7rem;
  min-width: 210px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box.focused {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.search-icon { color: var(--text-muted); flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: var(--text-main);
}
.search-input::placeholder { color: var(--text-muted); }

.search-clear {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: color 0.15s;
}
.search-clear:hover { color: var(--text-main); }

/* 筛选组 */
.filter-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.filter-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
}

/* 筛选 pills */
.filter-pills {
  display: flex;
  gap: 0.25rem;
}

.pill {
  padding: 0.28rem 0.65rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-main);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.pill:hover { background: var(--bg-hover); color: var(--text-main); }
.pill.active {
  background: var(--primary-light);
  color: var(--primary-color);
  border-color: var(--primary-color);
}
.pill-blue.active   { background: #dbeafe; color: #1d4ed8; border-color: #3b82f6; }
.pill-purple.active { background: #faf5ff; color: #7c3aed; border-color: #a855f7; }
.pill-green.active  { background: #d1fae5; color: #059669; border-color: #10b981; }

/* Select 下拉 */
.filter-select {
  height: 30px;
  padding: 0 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-main);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}
.filter-select:focus { border-color: var(--primary-color); }

/* 自定义 Toggle */
.overdue-toggle {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  user-select: none;
}
.toggle-input { display: none; }

.toggle-track {
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: var(--border-medium);
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-track.on { background: var(--status-error); }

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-track.on .toggle-thumb { transform: translateX(14px); }

.toggle-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 结果计数 + 清除 */
.result-count {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-left: auto;
}
.result-count strong { color: var(--text-main); font-family: var(--font-mono); }

.btn-clear-filter {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.28rem 0.65rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  font-size: 0.78rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  background: transparent;
}
.btn-clear-filter:hover {
  color: var(--status-error);
  border-color: var(--status-error);
}

/* ── 主区域布局 ──────────────────────────────── */
.main-area {
  display: flex;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

/* ── 订单表格 ────────────────────────────────── */
.table-wrap {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: auto;
  flex: 1;
  width: 100%;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
}

.order-table th {
  text-align: left;
  padding: 0.7rem 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-main);
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
  user-select: none;
}

.order-table th.sortable {
  cursor: pointer;
  display: table-cell;
}
.order-table th.sortable:hover { color: var(--primary-color); }

.sort-icon {
  margin-left: 0.25rem;
  opacity: 0.4;
  transition: opacity 0.15s;
}
.sort-icon.active { opacity: 1; color: var(--primary-color); }

.order-table td {
  padding: 0.72rem 1rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
  font-size: 0.875rem;
}

.order-table tbody tr:last-child td { border-bottom: none; }

/* 行状态 */
.order-row {
  transition: background 0.12s;
}
.order-row:hover { background: var(--bg-hover); }

/* 逾期行左边框 */
.order-row td:first-child {
  border-left: 3px solid transparent;
  padding-left: 0.75rem;
}
.row-overdue td:first-child  { border-left-color: var(--status-error); }
.row-warning td:first-child  { border-left-color: #f59e0b; }

/* 单元格内容样式 */
.order-no {
  font-size: 0.84rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-main);
}
.order-contract {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-top: 0.1rem;
}

.td-customer { font-weight: 500; color: var(--text-main); }
.td-date     { font-family: var(--font-mono); font-size: 0.82rem; white-space: nowrap; }
.td-alloy    { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; }
.td-qty      { white-space: nowrap; }
.qty-coils   { font-size: 0.82rem; font-weight: 500; color: var(--text-main); font-family: var(--font-mono); }
.qty-weight  { font-size: 0.7rem; color: var(--text-muted); margin-top: 0.1rem; font-family: var(--font-mono); }

.spec-main { font-weight: 500; }
.spec-sub { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.1rem; }

/* 距交期 chip */
.days-chip {
  display: inline-block;
  padding: 0.22rem 0.55rem;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-mono);
  white-space: nowrap;
}
.chip-critical { background: var(--status-error-bg);   color: var(--status-error); }
.chip-warning  { background: var(--status-warning-bg); color: #b45309; }
.chip-normal   { background: var(--bg-main);           color: var(--text-muted); }
.chip-done     { background: var(--status-success-bg); color: var(--status-success); }

/* 进度条 */
.progress-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.prog-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.prog-bar-track {
  height: 5px;
  background: var(--border-light);
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
}
.prog-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.prog-fraction {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.prog-pct {
  font-size: 0.78rem;
  font-weight: 600;
  font-family: var(--font-mono);
  width: 36px;
  text-align: right;
  color: var(--text-secondary);
}

/* 状态 badge */
.status-badge {
  display: inline-block;
  padding: 0.22rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}
.status-pending   { background: var(--bg-main);           color: var(--text-muted); }
.status-producing { background: #dbeafe;                  color: #1d4ed8; }
.status-packing   { background: #faf5ff;                  color: #7c3aed; }
.status-completed { background: var(--status-success-bg); color: var(--status-success); }

/* 当前工序 chip */
.stage-chip {
  display: inline-block;
  padding: 0.22rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}
.stg-rolling   { background: #dbeafe; color: #1d4ed8; }
.stg-slitting  { background: #fef3c7; color: #b45309; }
.stg-finishing { background: #ede9fe; color: #6d28d9; }
.stg-packing   { background: #d1fae5; color: #059669; }
.stg-done      { background: var(--status-success-bg); color: var(--status-success); }
.stg-pending   { background: var(--bg-main); color: var(--text-muted); }

/* 空状态 */
.empty-row { text-align: center; padding: 3rem !important; }
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}
.empty-icon { opacity: 0.3; }
.link-btn {
  color: var(--primary-color);
  font-size: 0.85rem;
  cursor: pointer;
  background: none;
  border: none;
  text-decoration: underline;
}
</style>
