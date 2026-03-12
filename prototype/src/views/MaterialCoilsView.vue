<template>
  <div class="coils-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">料卷查询</h1>
        <p class="page-subtitle">在制品找料主工具 — 按条件检索料卷，精准定位至 <strong>区域 → 库位 → 料框 → 层</strong></p>
      </div>
    </div>

    <!-- 搜索与筛选栏 -->
    <div class="filter-bar">
      <!-- 搜索输入 -->
      <div class="search-box">
        <Search :size="15" class="search-icon" />
        <input v-model="searchQuery" class="search-input" placeholder="卷号 / 母卷号 / 客户名 / 料框号..." />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
          <X :size="13" />
        </button>
      </div>

      <!-- 区域筛选 -->
      <div class="filter-group">
        <span class="filter-label">区域</span>
        <div class="filter-pills">
          <button v-for="z in zoneOptions" :key="z.value" :class="['pill', { active: selectedZone === z.value }]"
            @click="selectedZone = z.value">{{ z.label }}</button>
        </div>
      </div>

      <!-- 停放状态筛选 -->
      <div class="filter-group">
        <span class="filter-label">停放</span>
        <div class="filter-pills">
          <button v-for="f in stayOptions" :key="f.value"
            :class="['pill', { active: selectedStay === f.value }, f.colorClass]" @click="selectedStay = f.value">{{
              f.label }}</button>
        </div>
      </div>

      <!-- 评审结论筛选 -->
      <div class="filter-group">
        <span class="filter-label">评审</span>
        <div class="filter-pills">
          <button v-for="r in reviewOptions" :key="r.value" :class="['pill', { active: selectedReview === r.value }]"
            @click="selectedReview = r.value">{{ r.label }}</button>
        </div>
      </div>

      <!-- 有指令过滤 -->
      <div class="filter-group">
        <button :class="['pill pill-warn', { active: onlyWithInstructions }]"
          @click="onlyWithInstructions = !onlyWithInstructions">⚠ 有指令</button>
      </div>

      <!-- 结果计数 -->
      <div class="result-count">共 <strong>{{ filteredCoils.length }}</strong> 条</div>
    </div>

    <!-- 主区域：列表 + 详情面板 -->
    <div class="main-area" :class="{ 'has-detail': !!selectedCoil }">
      <!-- 料卷列表 -->
      <div class="coil-list-wrap">
        <table class="coil-table">
          <thead>
            <tr>
              <th>卷号</th>
              <th>规格</th>
              <th>客户</th>
              <th>状态</th>
              <th>区域</th>
              <th>库位</th>
              <th>料框</th>
              <th>停放</th>
              <th>评审</th>
              <th>指令</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coil in filteredCoils" :key="coil.id"
              :class="['coil-row', { selected: selectedCoil?.id === coil.id }, `stay-${stayLevel(coil.daysStayed)}`]"
              @click="selectCoil(coil)">
              <!-- 卷号 -->
              <td>
                <div class="coil-no">{{ coil.coilNo }}</div>
                <div class="coil-mother">母：{{ coil.motherCoilNo }}</div>
              </td>
              <!-- 规格 -->
              <td>
                <div class="spec-main">{{ coil.thickness }}μm × {{ coil.width }}mm</div>
                <div class="spec-sub">{{ coil.alloy }} · {{ coil.productType }}</div>
              </td>
              <!-- 客户 -->
              <td>
                <div class="customer">{{ coil.customer }}</div>
              </td>
              <!-- 状态 -->
              <td>
                <span class="status-tag" :style="{
                  background: statusColor(coil.status) + '18',
                  color: statusColor(coil.status),
                  borderColor: statusColor(coil.status) + '40'
                }">{{ statusLabel(coil.status) }}</span>
              </td>
              <!-- 区域 -->
              <td>
                <span class="zone-chip">{{ zoneLabel(coil.zone) }}</span>
              </td>
              <!-- 库位坐标 -->
              <td>
                <span class="loc-coord" v-if="getCoilFrame(coil)">
                  {{ getCoilFrame(coil).row }}-{{ getCoilFrame(coil).col }}
                </span>
                <span v-else class="loc-unknown">—</span>
              </td>
              <!-- 料框 + 层数 -->
              <td>
                <div v-if="getCoilFrame(coil)" class="frame-cell">
                  <span class="frame-no-tag">#{{ getCoilFrame(coil).frameNo }}</span>
                  <span class="layer-info" :class="{ 'layer-bottom': isBottomLayer(coil) }">
                    L{{ getCoilFrame(coil).stackLevel }}
                  </span>
                  <span v-if="isBottomLayer(coil)" class="bottom-badge" title="底层料框，取料需先搬上层">底</span>
                </div>
                <span v-else class="loc-unknown">—</span>
              </td>
              <!-- 停放天数 -->
              <td>
                <div class="days-badge" :class="`level-${stayLevel(coil.daysStayed)}`">
                  {{ coil.daysStayed }}天
                </div>
              </td>
              <!-- 评审结论 -->
              <td>
                <span class="review-tag" :class="reviewClass(coil.reviewInfo?.conclusion)">
                  {{ coil.reviewInfo?.conclusion || '-' }}
                </span>
              </td>
              <!-- 处理指令 -->
              <td>
                <span v-if="coil.reviewInfo?.instructions?.length" class="inst-warn-icon" title="有处理指令，请查看详情">
                  ⚠ {{ coil.reviewInfo.instructions.length }}
                </span>
                <span v-else class="inst-none">—</span>
              </td>
            </tr>

            <tr v-if="filteredCoils.length === 0">
              <td colspan="10" class="empty-row">
                <div class="empty-content">
                  <PackageSearch :size="36" class="empty-icon" />
                  <div>未找到符合条件的料卷</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 详情面板（右侧滑入） -->
      <transition name="panel-slide">
        <div class="detail-panel" v-if="selectedCoil">
          <!-- 面板头部 -->
          <div class="dp-header">
            <div class="dp-coilno">{{ selectedCoil.coilNo }}</div>
            <button class="dp-close" @click="selectedCoil = null">
              <X :size="16" />
            </button>
          </div>

          <!-- 三级定位路径 -->
          <div class="dp-location-path" v-if="getCoilFrame(selectedCoil)">
            <div class="path-step">
              <span class="path-label">区域</span>
              <span class="path-value">{{ zoneLabel(selectedCoil.zone) }}</span>
            </div>
            <span class="path-arrow">›</span>
            <div class="path-step">
              <span class="path-label">库位</span>
              <span class="path-value path-coord">{{ getCoilFrame(selectedCoil).row }}-{{ getCoilFrame(selectedCoil).col
                }}</span>
            </div>
            <span class="path-arrow">›</span>
            <div class="path-step">
              <span class="path-label">料框</span>
              <span class="path-value">#{{ getCoilFrame(selectedCoil).frameNo }}</span>
            </div>
            <span class="path-arrow">›</span>
            <div class="path-step">
              <span class="path-label">层</span>
              <span class="path-value" :class="{ 'path-bottom-warn': isBottomLayer(selectedCoil) }">
                第{{ getCoilFrame(selectedCoil).stackLevel }}层
                <span v-if="isBottomLayer(selectedCoil)" class="bottom-hint">（底层）</span>
              </span>
            </div>
          </div>

          <!-- 在地图中定位按钮 -->
          <button class="btn-locate-map" @click="goToMap(selectedCoil)">
            <MapPin :size="14" />
            在库位地图中定位
          </button>

          <!-- 状态 + 停放 -->
          <div class="dp-status-row">
            <span class="status-tag" :style="{
              background: statusColor(selectedCoil.status) + '18',
              color: statusColor(selectedCoil.status),
              borderColor: statusColor(selectedCoil.status) + '40'
            }">{{ statusLabel(selectedCoil.status) }}</span>
            <span class="dp-days" :style="{ color: stayColor(selectedCoil.daysStayed) }">
              已停放 {{ selectedCoil.daysStayed }} 天
            </span>
          </div>

          <!-- 基本信息 -->
          <div class="dp-section">
            <div class="dp-sec-title">基本信息</div>
            <div class="info-grid">
              <div class="ig-row"><span class="ig-k">母卷号</span><span class="ig-v mono">{{ selectedCoil.motherCoilNo
                  }}</span></div>
              <div class="ig-row"><span class="ig-k">合金</span><span class="ig-v">{{ selectedCoil.alloy }}</span></div>
              <div class="ig-row"><span class="ig-k">规格</span><span class="ig-v">{{ selectedCoil.thickness }}μm × {{
                  selectedCoil.width }}mm × {{ selectedCoil.length }}m</span></div>
              <div class="ig-row"><span class="ig-k">重量</span><span class="ig-v">{{ selectedCoil.weight }} kg</span>
              </div>
              <div class="ig-row"><span class="ig-k">产品</span><span class="ig-v">{{ selectedCoil.productType }}</span>
              </div>
              <div class="ig-row"><span class="ig-k">客户</span><span class="ig-v">{{ selectedCoil.customer }}</span>
              </div>
              <div class="ig-row"><span class="ig-k">入库时间</span><span class="ig-v">{{ selectedCoil.entryTime }}</span>
              </div>
            </div>
          </div>

          <!-- 质量评审 -->
          <div class="dp-section" v-if="selectedCoil.reviewInfo">
            <div class="dp-sec-title">
              质量评审
              <span v-if="isNotReviewed(selectedCoil)" class="review-pending-badge">⚠ 待评审</span>
            </div>

            <div v-if="isNotReviewed(selectedCoil)" class="not-reviewed-alert">
              评审未完成，不可领料进入下道工序
            </div>

            <div v-else class="review-block">
              <div class="review-meta">
                <span class="review-tag lg" :class="reviewClass(selectedCoil.reviewInfo.conclusion)">
                  {{ selectedCoil.reviewInfo.conclusion }}
                </span>
                <span class="review-grade">{{ selectedCoil.reviewInfo.grade }}</span>
              </div>
            </div>

            <!-- 处理指令 -->
            <div v-if="selectedCoil.reviewInfo.instructions?.length" class="review-instructions">
              <div class="ins-title">处理指令：</div>
              <div class="ins-card" v-for="(ins, i) in selectedCoil.reviewInfo.instructions" :key="i"
                :class="getInsClass(ins.action)">
                <span class="ins-action">{{ ins.action }}</span>
                <span class="ins-detail">
                  {{ ins.side }} {{ ins.startMm === ins.endMm ? ins.startMm + 'mm' : ins.startMm + '-' + ins.endMm +
                  'mm' }}
                  {{ ins.defectType }}
                </span>
              </div>
            </div>
            <div v-else-if="selectedCoil.reviewInfo.conclusion === '正常处理'" class="review-ok">
              <CheckCircle :size="14" />无需特殊处理
            </div>
          </div>

          <!-- 流转历史时间线 -->
          <div class="dp-section">
            <div class="dp-sec-title">流转历史</div>
            <div class="timeline">
              <div class="tl-item" v-for="(ev, idx) in selectedCoil.history" :key="idx">
                <div class="tl-left">
                  <div class="tl-dot" :style="{ background: statusColor(ev.status) }"></div>
                  <div v-if="idx < selectedCoil.history.length - 1" class="tl-line"></div>
                </div>
                <div class="tl-right">
                  <div class="tl-label">{{ ev.label }}</div>
                  <div class="tl-meta">
                    <span class="tl-loc">{{ ev.location }}</span>
                    <span class="tl-sep">·</span>
                    <span class="tl-op">{{ ev.operator }}</span>
                  </div>
                  <div class="tl-time">{{ ev.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, X, CheckCircle, PackageSearch, MapPin } from 'lucide-vue-next'
import { materialCoils, warehouseFrames, coilStatuses, staleThresholds } from '../data/material/index.js'

const router = useRouter()

// ── 筛选状态 ─────────────────────────────────────────────────────
const searchQuery = ref('')
const selectedZone = ref('all')
const selectedStay = ref('all')
const selectedReview = ref('all')
const onlyWithInstructions = ref(false)
const selectedCoil = ref(null)

const zoneOptions = [
  { value: 'all', label: '全部' },
  { value: 'slitting', label: '分切区' },
  { value: 'rolling', label: '轧机区' },
  { value: 'finishing', label: '精切区' },
]

const stayOptions = [
  { value: 'all', label: '全部', colorClass: '' },
  { value: 'normal', label: '<3天', colorClass: 'pill-green' },
  { value: 'caution', label: '3-7天', colorClass: 'pill-yellow' },
  { value: 'overdue', label: '7-14天', colorClass: 'pill-orange' },
  { value: 'stale', label: '>14天', colorClass: 'pill-red' },
]

const reviewOptions = [
  { value: 'all', label: '全部' },
  { value: 'normal', label: '正常处理' },
  { value: 'concession', label: '让步放行' },
  { value: 'recut', label: '改切' },
  { value: 'pending', label: '待评审' },
]

// ── 从 frames.js 查找料框信息 ────────────────────────────────────
function getCoilFrame(coil) {
  return warehouseFrames.find(f => f.frameId === coil.frameId) || null
}

function isBottomLayer(coil) {
  const frame = getCoilFrame(coil)
  return frame && frame.stackLevel === 1 && frame.stackTotal > 1
}

// ── 筛选逻辑 ─────────────────────────────────────────────────────
const filteredCoils = computed(() => {
  let list = [...materialCoils]

  // 搜索（新增：料框号搜索）
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(c => {
      // 卷号/母卷号/客户名匹配
      if (c.coilNo?.toLowerCase().includes(q)) return true
      if (c.motherCoilNo?.toLowerCase().includes(q)) return true
      if (c.customer?.toLowerCase().includes(q)) return true
      // 料框号匹配
      const frame = getCoilFrame(c)
      if (frame && frame.frameNo.includes(q)) return true
      return false
    })
  }

  // 区域
  if (selectedZone.value !== 'all') {
    list = list.filter(c => c.zone === selectedZone.value)
  }

  // 停放状态
  if (selectedStay.value !== 'all') {
    list = list.filter(c => stayLevel(c.daysStayed) === selectedStay.value)
  }

  // 评审结论
  if (selectedReview.value !== 'all') {
    list = list.filter(c => {
      const conclusion = c.reviewInfo?.conclusion
      switch (selectedReview.value) {
        case 'normal': return conclusion === '正常处理'
        case 'concession': return conclusion === '让步放行'
        case 'recut': return conclusion === '改切'
        case 'pending': return isNotReviewed(c)
        default: return true
      }
    })
  }

  // 有指令过滤
  if (onlyWithInstructions.value) {
    list = list.filter(c => c.reviewInfo?.instructions?.length > 0)
  }

  // 排序：呆滞 → 超期 → 注意 → 正常
  return list.sort((a, b) => b.daysStayed - a.daysStayed)
})

// ── 停放等级 ─────────────────────────────────────────────────────
function stayLevel(days) {
  if (days >= staleThresholds.stale) return 'stale'
  if (days >= staleThresholds.warning) return 'overdue'
  if (days >= staleThresholds.normal) return 'caution'
  return 'normal'
}

function stayColor(days) {
  if (days >= staleThresholds.stale) return '#ef4444'
  if (days >= staleThresholds.warning) return '#f97316'
  if (days >= staleThresholds.normal) return '#f59e0b'
  return '#10b981'
}

// ── 状态辅助 ─────────────────────────────────────────────────────
function statusLabel(status) {
  return coilStatuses[status]?.label ?? status
}

function statusColor(status) {
  return coilStatuses[status]?.color ?? '#94a3b8'
}

// ── 区域名称 ─────────────────────────────────────────────────────
const zoneMap = { slitting: '分切区', rolling: '轧机区', finishing: '精切区' }
function zoneLabel(zone) {
  return zoneMap[zone] || zone
}

// ── 评审辅助 ─────────────────────────────────────────────────────
function reviewClass(conclusion) {
  if (conclusion === '正常处理') return 'review-ok-tag'
  if (conclusion === '让步放行') return 'review-warn-tag'
  if (conclusion === '改切') return 'review-danger-tag'
  return 'review-muted-tag'
}

function isNotReviewed(coil) {
  const c = coil.reviewInfo?.conclusion
  return !c || c === '质检中' || c === '未质检' || c === '-'
}

function getInsClass(action) {
  if (action === '切除' || action === '改切') return 'ins-danger'
  if (action === '避留白' || action === '吸边') return 'ins-warning'
  return 'ins-info'
}

// ── 选择料卷 ─────────────────────────────────────────────────────
function selectCoil(coil) {
  selectedCoil.value = selectedCoil.value?.id === coil.id ? null : coil
}

// ── 跳转库位地图 ─────────────────────────────────────────────────
function goToMap(coil) {
  router.push({ path: '/material/location', query: { search: coil.coilNo } })
}
</script>

<style scoped>
.coils-view {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  width: 100%;
  height: 100%;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

.page-subtitle strong {
  color: var(--primary-color);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.1rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-layout);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 0.4rem 0.75rem;
  min-width: 220px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: var(--text-main);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-clear {
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.search-clear:hover {
  color: var(--text-main);
}

/* 筛选组 */
.filter-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.filter-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.filter-pills {
  display: flex;
  gap: 0.3rem;
}

.pill {
  padding: 0.3rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-layout);
  border: 1px solid transparent;
  transition: all 0.15s;
  cursor: pointer;
}

.pill:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.pill.active {
  background: var(--primary-light);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.pill-green.active {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  border-color: #10b981;
}

.pill-yellow.active {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border-color: #f59e0b;
}

.pill-orange.active {
  background: rgba(249, 115, 22, 0.12);
  color: #ea580c;
  border-color: #f97316;
}

.pill-red.active {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  border-color: #ef4444;
}

.pill-warn.active {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  border-color: #f59e0b;
}

.result-count {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-left: auto;
}

.result-count strong {
  color: var(--text-main);
}

/* 主区域 */
.main-area {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.1rem;
  min-height: 0;
  flex: 1;
  transition: grid-template-columns 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.main-area.has-detail {
  grid-template-columns: 3fr 2fr;
}

/* 料卷表格 */
.coil-list-wrap {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: auto;
}

.coil-table {
  width: 100%;
  border-collapse: collapse;
}

.coil-table th {
  text-align: left;
  vertical-align: middle;
  padding: 0.7rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-layout);
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}

.coil-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
  line-height: 1.4;
}

.coil-row {
  cursor: pointer;
  transition: background 0.12s;
}

.coil-row:hover {
  background: var(--bg-hover);
}

.coil-row.selected td {
  background: var(--primary-light);
}

/* 左侧颜色警示条 */
.coil-row td:first-child {
  padding-left: 0.75rem;
  border-left: 3px solid transparent;
}

.coil-row.stay-stale td:first-child {
  border-left-color: #ef4444;
}

.coil-row.stay-overdue td:first-child {
  border-left-color: #f97316;
}

.coil-row.stay-caution td:first-child {
  border-left-color: #f59e0b;
}

.coil-row.stay-normal td:first-child {
  border-left-color: #10b981;
}

.coil-no {
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-main);
}

.coil-mother {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-top: 0.1rem;
}

.spec-main {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-main);
}

.spec-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

.customer {
  font-size: 0.85rem;
  color: var(--text-main);
}

/* 状态标签 */
.status-tag {
  padding: 0.22rem 0.6rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
  white-space: nowrap;
}

/* 区域芯片 */
.zone-chip {
  font-size: 0.72rem;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: var(--bg-layout);
  color: var(--text-muted);
  white-space: nowrap;
}

/* 库位坐标 */
.loc-coord {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.loc-unknown {
  color: var(--text-muted);
  font-size: 0.82rem;
}

/* 料框 + 层数 */
.frame-cell {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.frame-no-tag {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-main);
  font-family: var(--font-mono);
}

.layer-info {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.layer-info.layer-bottom {
  color: #d97706;
  font-weight: 600;
}

.bottom-badge {
  font-size: 0.65rem;
  background: #fef3c7;
  color: #92400e;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-weight: 600;
  cursor: help;
}

/* 停放天数 */
.days-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

.days-badge.level-normal {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.days-badge.level-caution {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.days-badge.level-overdue {
  background: rgba(249, 115, 22, 0.12);
  color: #ea580c;
}

.days-badge.level-stale {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

/* 评审标签 */
.review-tag {
  font-size: 0.75rem;
  padding: 0.18rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
}

.review-ok-tag {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.review-warn-tag {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.review-danger-tag {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.review-muted-tag {
  background: var(--bg-layout);
  color: var(--text-muted);
}

/* 指令列 */
.inst-warn-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.78rem;
  color: #d97706;
  font-weight: 600;
  background: rgba(245, 158, 11, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  cursor: help;
}

.inst-none {
  color: var(--text-muted);
  font-size: 0.82rem;
}

/* 空状态 */
.empty-row {
  text-align: center;
  padding: 3rem !important;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.empty-icon {
  opacity: 0.35;
}

/* ── 详情面板 ──────────────────────────────────────────────────── */
.detail-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.dp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.dp-coilno {
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-main);
}

.dp-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all 0.15s;
}

.dp-close:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* 三级定位路径 */
.dp-location-path {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.7rem 0.9rem;
  background: var(--bg-layout);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.path-step {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 50px;
}

.path-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.path-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
}

.path-coord {
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-family: var(--font-mono);
}

.path-arrow {
  font-size: 1.1rem;
  color: var(--border-medium);
  align-self: center;
}

.path-bottom-warn {
  color: #d97706;
}

.bottom-hint {
  font-size: 0.72rem;
  color: #f59e0b;
  font-weight: 400;
}

/* 在地图中定位按钮 */
.btn-locate-map {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: var(--primary-light);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  align-self: flex-start;
}

.btn-locate-map:hover {
  background: var(--primary-color);
  color: white;
}

.dp-status-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.dp-days {
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

/* 详情分区 */
.dp-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dp-sec-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 评审待审醒目提示 */
.review-pending-badge {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.not-reviewed-alert {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  border-radius: var(--radius-md);
  padding: 0.6rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 500;
}

/* 信息网格 */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ig-row {
  display: flex;
  align-items: baseline;
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--border-light);
  gap: 0.5rem;
}

.ig-row:last-child {
  border-bottom: none;
}

.ig-k {
  width: 64px;
  font-size: 0.75rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.ig-v {
  font-size: 0.82rem;
  color: var(--text-main);
  font-weight: 500;
}

.ig-v.mono {
  font-family: var(--font-mono);
}

/* 质量评审块 */
.review-block {
  background: var(--bg-layout);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.75rem;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.review-tag.lg {
  padding: 0.25rem 0.7rem;
  font-size: 0.8rem;
}

.review-grade {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

/* 处理指令卡片 */
.review-instructions {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.ins-title {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.15rem;
}

.ins-card {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 500;
}

.ins-danger {
  background: rgba(239, 68, 68, 0.08);
  color: #7f1d1d;
  border-left: 3px solid #ef4444;
}

.ins-warning {
  background: rgba(245, 158, 11, 0.08);
  color: #78350f;
  border-left: 3px solid #f59e0b;
}

.ins-info {
  background: rgba(59, 130, 246, 0.08);
  color: #1e3a8a;
  border-left: 3px solid #3b82f6;
}

.ins-action {
  font-weight: 700;
}

.ins-detail {
  font-weight: 400;
}

.review-ok {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #059669;
}

/* 流转历史时间线 */
.timeline {
  display: flex;
  flex-direction: column;
}

.tl-item {
  display: flex;
  gap: 0.75rem;
}

.tl-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
  flex-shrink: 0;
}

.tl-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 3px;
  border: 2px solid var(--bg-surface);
  box-shadow: 0 0 0 1.5px currentColor;
}

.tl-line {
  flex: 1;
  width: 1.5px;
  background: var(--border-light);
  margin: 3px 0;
  min-height: 16px;
}

.tl-right {
  padding-bottom: 0.875rem;
  flex: 1;
}

.tl-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-main);
  line-height: 1.3;
}

.tl-meta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.2rem;
}

.tl-loc {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.tl-sep {
  font-size: 0.72rem;
  color: var(--border-medium);
}

.tl-op {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.tl-time {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-top: 0.15rem;
}
</style>
