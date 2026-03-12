<template>
  <div class="quality-view">
    <!-- 顶部统计卡片 -->
    <div class="page-header">
      <h1 class="page-title">质量评审</h1>
      <div class="stat-cards">
        <div class="stat-card entry">
          <span class="stat-value">{{ pendingEntryCount }}</span>
          <span class="stat-label">待录入</span>
        </div>
        <div class="stat-card review">
          <span class="stat-value">{{ pendingReviewCount }}</span>
          <span class="stat-label">待评审</span>
        </div>
        <div class="stat-card done">
          <span class="stat-value">{{ completedCount }}</span>
          <span class="stat-label">今日已完成</span>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <select v-model="filters.status" class="select-input">
            <option value="">全部</option>
            <option value="pending_entry">待录入</option>
            <option value="pending_review">待评审</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        <div class="filter-item">
          <span class="filter-label">机台</span>
          <select v-model="filters.machine" class="select-input">
            <option value="">全部</option>
            <option v-for="m in ['1#', '2#', '4#', '5#']" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="filter-item search-wrapper">
          <Search :size="14" class="search-icon" />
          <input type="text" v-model="filters.search" placeholder="搜索卷号..." class="text-input">
        </div>
      </div>

    </div>

    <!-- 列表表格 -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th width="120">大卷号</th>
            <th width="70">车次</th>
            <th width="60">机台</th>
            <th width="80">客户</th>
            <th width="120">规格</th>
            <th width="80">米数</th>
            <th width="200">针孔摘要</th>
            <th width="80">质量初判</th>
            <th width="100">评审结论</th>
            <th width="100">状态</th>
            <th width="100">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredList" :key="item.id" :class="['data-row', item.status]">
            <!-- 大卷号 -->
            <td class="font-mono font-medium">{{ item.coilNo }}</td>
            <!-- 车次 -->
            <td class="text-dim">{{ item.tripNo }}</td>
            <!-- 机台 -->
            <td>
              <span class="machine-badge">{{ item.machine }}</span>
            </td>
            <!-- 客户 -->
            <td>{{ item.customer }}</td>
            <!-- 规格 -->
            <td class="spec-cell">{{ item.thickness }}μm × {{ item.width }}mm</td>
            <!-- 米数 -->
            <td class="text-dim">
              {{ item.entryData?.meters ? item.entryData.meters.toLocaleString() + 'm' : '—' }}
            </td>
            <!-- 针孔摘要 -->
            <td>
              <span v-if="item.entryData" class="pinhole-summary">
                <span class="ph-group">
                  <span class="ph-label">AB</span>
                  <span class="ph-val">{{ item.entryData.pinholeA }}/{{ item.entryData.pinholeB }}</span>
                </span>
                <span class="ph-group">
                  <span class="ph-label">CD</span>
                  <span class="ph-val">{{ item.entryData.pinholeC }}/{{ item.entryData.pinholeD }}</span>
                </span>
                <span class="ph-group">
                  <span class="ph-label">E</span>
                  <span class="ph-val">{{ item.entryData.pinholeE }}</span>
                </span>
                <span v-if="item.entryData.densePinhole" class="dense-badge" title="有密集型针孔">密</span>
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <!-- 质量初判 -->
            <td>
              <span v-if="item.entryData"
                :class="item.entryData.qualityJudgment === 'conform' ? 'text-success' : 'text-danger'">
                {{ item.entryData.qualityJudgment === 'conform' ? '合格' : '不合格' }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <!-- 评审结论（方案C：hover popover） -->
            <td class="conclusion-cell">
              <div v-if="item.reviewData?.mainConclusion" class="conclusion-wrapper" @mouseenter="showPopover(item.id)"
                @mouseleave="hidePopover">
                <span :class="['conclusion-badge', getConclusionClass(item.reviewData.mainConclusion)]">
                  {{ item.reviewData.mainConclusion }}
                </span>
                <!-- 指令数徽标 -->
                <span v-if="item.reviewData.instructions?.length" class="inst-count">{{
                  item.reviewData.instructions.length }}</span>

                <!-- Popover 浮层 -->
                <div v-if="activePopoverId === item.id" class="review-popover">
                  <div class="popover-header">
                    <span :class="['conclusion-badge', getConclusionClass(item.reviewData.mainConclusion)]">
                      {{ item.reviewData.mainConclusion }}
                    </span>
                    <span v-if="item.reviewData.deliveryTarget" class="delivery-tag">
                      → {{ item.reviewData.deliveryTarget }}
                    </span>
                  </div>
                  <div v-if="item.reviewData.instructions?.length" class="popover-instructions">
                    <div v-for="(inst, idx) in item.reviewData.instructions" :key="idx" class="popover-inst-row">
                      <span class="inst-index">{{ idx + 1 }}</span>
                      <span class="inst-location">
                        {{ inst.locationSide }}
                        <template v-if="inst.startMm !== null && inst.startMm !== undefined">
                          {{ inst.startMm }}–{{ inst.endMm }}mm
                        </template>
                        <template v-if="inst.lengthStartM != null">
                          · {{ inst.lengthStartM }}-{{ inst.lengthEndM }}m
                        </template>
                      </span>
                      <span class="inst-defect">{{ inst.defectType }}</span>
                      <span class="inst-treatment">{{ inst.treatment }}</span>
                    </div>
                  </div>
                  <div v-else class="popover-empty">无处理指令</div>
                  <div v-if="item.reviewData.note" class="popover-remarks">
                    📝 {{ item.reviewData.note }}
                  </div>
                </div>
              </div>
              <span v-else class="text-muted">—</span>
            </td>
            <!-- 状态 -->
            <td>
              <span :class="['status-badge', item.status]">
                {{ getStatusText(item.status) }}
              </span>
            </td>
            <!-- 操作 -->
            <td>
              <button v-if="item.status === 'pending_entry'" class="btn-action btn-entry"
                @click="goToEntry(item.id)">录入数据</button>
              <button v-else-if="item.status === 'pending_review'" class="btn-action btn-review"
                @click="goToReview(item.id)">进入评审</button>
              <button v-else class="btn-action btn-view" @click="goToReview(item.id)">查看</button>
            </td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="11" class="empty-state">没有符合条件的记录</td>
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

// Popover 控制
const activePopoverId = ref(null)
let hideTimer = null
function showPopover(id) {
  clearTimeout(hideTimer)
  activePopoverId.value = id
}
function hidePopover() {
  // 短延迟，避免鼠标在 popover 内移动时闪烁
  hideTimer = setTimeout(() => { activePopoverId.value = null }, 120)
}

const router = useRouter()

// 全局响应式列表（引用同一数组，支持跨页面更新）
const coils = ref(qualityCoilList)

// 筛选状态
const filters = ref({ status: '', machine: '', search: '' })



// 统计数据
const pendingEntryCount = computed(() =>
  coils.value.filter(c => c.status === 'pending_entry').length
)
const pendingReviewCount = computed(() =>
  coils.value.filter(c => c.status === 'pending_review').length
)
const completedCount = computed(() =>
  coils.value.filter(c => c.status === 'completed').length
)

// 过滤 + 排序
const filteredList = computed(() => {
  // 防御性过滤：排除数组中可能存在的 undefined/null 元素
  let result = coils.value.filter(Boolean)
  if (filters.value.status) {
    result = result.filter(c => c.status === filters.value.status)
  }
  if (filters.value.machine) {
    result = result.filter(c => c.machine === filters.value.machine)
  }
  if (filters.value.search) {
    const term = filters.value.search.toLowerCase()
    result = result.filter(c => c.coilNo.toLowerCase().includes(term))
  }
  // 排序：pending_review > pending_entry > completed，再按下料时间倒序
  const order = { pending_review: 0, pending_entry: 1, completed: 2 }
  return [...result].sort((a, b) => {
    const od = order[a.status] - order[b.status]
    if (od !== 0) return od
    return new Date(b.downloadTime) - new Date(a.downloadTime)
  })
})

// 状态文本
function getStatusText(status) {
  return { pending_entry: '待录入', pending_review: '待评审', completed: '已完成' }[status] || status
}

// 评审结论样式
function getConclusionClass(conclusion) {
  if (!conclusion) return ''
  if (['让步放行', '沟通放行', '正常处理', '评审可切'].includes(conclusion)) return 'c-pass'
  if (['改切', '改切二级品', '直接降级处理', '转精切'].includes(conclusion)) return 'c-recut'
  if (['扒废', '建议扒废'].includes(conclusion)) return 'c-scrap'
  return 'c-other'
}



// 导航
function goToEntry(id) { router.push(`/quality/${id}/entry`) }
function goToReview(id) { router.push(`/quality/${id}/review`) }
</script>

<style scoped>
.quality-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main);
  gap: 1rem;
}

/* ── 顶部 ── */
.page-header {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.page-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
}

.stat-cards {
  display: flex;
  gap: 0.75rem;
}

.stat-card {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 0.5rem 1.1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.stat-card.entry .stat-value {
  color: var(--primary-color, #2563eb);
}

.stat-card.review .stat-value {
  color: #d97706;
}

.stat-card.done .stat-value {
  color: #059669;
}

/* ── 筛选栏 ── */
.filter-bar {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.82rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.select-input,
.text-input {
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background-color: var(--bg-main);
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.15s;
}

.select-input:focus,
.text-input:focus {
  border-color: var(--primary-color);
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-wrapper .text-input {
  padding-left: 1.8rem;
  width: 180px;
}



/* ── 表格 ── */
.table-container {
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th,
.data-table td {
  padding: 0.75rem 0.85rem;
  text-align: center;
  border-bottom: 1px solid var(--border-light);
}

.data-table th {
  background-color: var(--bg-main);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.8rem;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

.data-table td {
  color: var(--text-main);
}

/* 行高亮 */
.data-row.pending_review {
  background-color: rgba(245, 158, 11, 0.04);
}

.data-row.pending_review:hover {
  background-color: rgba(245, 158, 11, 0.09);
}

.data-row:not(.pending_review):hover {
  background-color: var(--bg-hover);
}

/* 文字辅助 */
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.font-medium {
  font-weight: 500;
}

.text-left {
  text-align: left !important;
}

.text-center {
  text-align: center !important;
}

.text-right {
  text-align: right !important;
}

.text-dim {
  color: var(--text-secondary);
}

.text-muted {
  color: var(--text-muted);
}

.text-success {
  color: #059669;
  font-weight: 500;
}

.text-danger {
  color: #dc2626;
  font-weight: 500;
}

/* 规格列 */
.spec-cell {
  white-space: nowrap;
  color: var(--text-secondary);
  font-size: 0.83rem;
}

/* 机台标签 */
.machine-badge {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* 针孔摘要 */
.pinhole-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.ph-group {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.ph-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
}

.ph-val {
  font-size: 0.82rem;
  font-family: ui-monospace, monospace;
  color: var(--text-main);
}

.dense-badge {
  padding: 0.1rem 0.35rem;
  background-color: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 700;
}

/* 评审结论列 */
.conclusion-cell {
  position: relative;
}

.conclusion-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: default;
  position: relative;
}

/* 处理指令数量小徽标 */
.inst-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--text-muted);
  color: white;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
}

/* 评审结论标签 */
.conclusion-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 500;
  white-space: nowrap;
}

.c-pass {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.c-recut {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.c-scrap {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.c-other {
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
}

/* Popover 浮层 */
.review-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  min-width: 280px;
  max-width: 380px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 0.75rem;
  text-align: left;

  /* 小箭头 */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: var(--bg-surface);
    pointer-events: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 7px solid transparent;
    border-top-color: var(--border-light);
    pointer-events: none;
    margin-top: 1px;
  }
}

.popover-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-light);
}

.delivery-tag {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--bg-main);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.popover-instructions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.popover-inst-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: var(--text-main);
}

.inst-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  font-size: 0.65rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.inst-location {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.inst-defect {
  color: #dc2626;
  font-weight: 500;
  flex-shrink: 0;
}

.inst-treatment {
  color: #2563eb;
  font-weight: 500;
  margin-left: auto;
  flex-shrink: 0;
}

.popover-empty {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: center;
  padding: 0.25rem 0;
}

.popover-remarks {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-light);
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 状态标签 */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.pending_entry {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}

.status-badge.pending_review {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

/* 操作按钮 */
.btn-action {
  padding: 0.3rem 0.7rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-entry {
  background: var(--primary-color);
  color: white;
}

.btn-entry:hover {
  background: var(--primary-hover);
}

.btn-review {
  background: #d97706;
  color: white;
}

.btn-review:hover {
  background: #b45309;
}

.btn-view {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.btn-view:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* 空状态 */
.empty-state {
  text-align: center !important;
  padding: 3rem !important;
  color: var(--text-muted) !important;
}
</style>
