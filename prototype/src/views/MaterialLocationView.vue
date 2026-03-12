<template>
  <div class="location-view">
    <!-- ── 页面头部 ── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">库位地图</h1>
        <p class="page-desc">按物理库位查看在制品分布，三级精准定位：<strong>区域 → 库位（行列坐标）→ 料框号 → 层数</strong></p>
      </div>
      <div class="header-right">
        <div class="search-box" :class="{ 'search-active': searchQuery }">
          <Search class="search-icon" :size="16" />
          <input v-model="searchQuery" type="text" class="search-input" placeholder="输入卷号或料框号快速定位..." @input="onSearch"
            @keyup.enter="onSearch" />
          <button v-if="searchQuery" class="search-clear" @click="clearSearch">
            <X :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── 顶部统计栏 ── -->
    <div class="stats-bar">
      <div class="zone-stats">
        <div v-for="zone in warehouseZones" :key="zone.id" class="zone-stat-item"
          :class="{ active: activeZone === zone.id }" @click="activeZone = zone.id">
          <div class="zone-stat-name">{{ zone.name }}</div>
          <div class="zone-stat-numbers">
            <span class="coil-count">{{ getZoneCoilCount(zone.id) }}</span>
            <span class="zone-stat-sep">卷 /</span>
            <span class="frame-count">{{ getZoneOccupiedLocs(zone.id) }}</span>
            <span class="zone-stat-sep">库位有料</span>
          </div>
        </div>
      </div>
      <div class="alert-stats">
        <div class="alert-item alert-warning">
          <AlertTriangle :size="14" />
          <span>超期 &gt;7天：<strong>{{ getAlertCount(7) }}</strong> 卷</span>
        </div>
        <div class="alert-item alert-danger">
          <AlertTriangle :size="14" />
          <span>呆滞 &gt;14天：<strong>{{ getAlertCount(14) }}</strong> 卷</span>
        </div>
      </div>
    </div>

    <!-- ── 工具栏 ── -->
    <div class="toolbar">
      <div class="zone-tabs">
        <button v-for="zone in warehouseZones" :key="zone.id" class="zone-tab"
          :class="{ active: activeZone === zone.id }" @click="activeZone = zone.id">
          {{ zone.name }}
        </button>
      </div>
      <div class="toolbar-right">
        <div class="color-mode-switch">
          <span class="mode-label">着色：</span>
          <button class="mode-btn" :class="{ active: colorMode === 'staleness' }"
            @click="colorMode = 'staleness'">停放时长</button>
          <button class="mode-btn" :class="{ active: colorMode === 'status' }"
            @click="colorMode = 'status'">料卷状态</button>
        </div>
        <div class="legend">
          <template v-if="colorMode === 'staleness'">
            <span class="legend-item"><span class="dot dot-normal"></span>&lt;3天</span>
            <span class="legend-item"><span class="dot dot-warning"></span>3-7天</span>
            <span class="legend-item"><span class="dot dot-overdue"></span>7-14天</span>
            <span class="legend-item"><span class="dot dot-stale"></span>&gt;14天</span>
          </template>
          <template v-else>
            <span class="legend-item"><span class="dot" style="background:#10b981"></span>已评审</span>
            <span class="legend-item"><span class="dot" style="background:#f59e0b"></span>质检中</span>
            <span class="legend-item"><span class="dot" style="background:#3b82f6"></span>已排产</span>
          </template>
          <span class="legend-item"><span class="warn-icon">⚠</span>待评审/有指令</span>
        </div>
      </div>
    </div>

    <!-- ── 搜索反馈 ── -->
    <div v-if="searchMessage" class="search-feedback" :class="searchFound ? 'found' : 'not-found'">
      <MapPin v-if="searchFound" :size="14" />
      <X v-else :size="14" />
      {{ searchMessage }}
    </div>

    <!-- ══════════════════════════════════════════════════════
             库位网格地图
             行 = 物理行（A/B/C/D），列 = 物理列（1-10）
             每格 = 一个地面喷涂库位，内含料框和料卷
        ═══════════════════════════════════════════════════════ -->
    <div class="map-container">
      <!-- 列号表头 -->
      <div class="map-header">
        <div class="row-label-placeholder"></div>
        <div v-for="col in currentZone.cols" :key="col" class="col-header">
          {{ col }}
        </div>
      </div>

      <!-- 逐行渲染 -->
      <div v-for="row in currentZone.rows" :key="row" class="map-row">
        <!-- 行号 -->
        <div class="row-label">{{ row }}</div>

        <!-- 每个库位格子 -->
        <div v-for="col in currentZone.cols" :key="col" class="location-cell" :class="getCellClass(row, col)"
          :id="`cell-${activeZone}-${row}-${col}`">
          <!-- 格子左上角：库位编号 -->
          <div class="cell-pos-label">{{ row }}-{{ col }}</div>

          <!-- 空库位（无料框） -->
          <div v-if="getFramesAtLoc(row, col).length === 0" class="cell-empty">
            <span class="empty-icon">—</span>
          </div>

          <!-- 有料框：从上到下依次显示各层 -->
          <div v-else class="cell-frames-stack">
            <div v-for="frame in getFramesAtLoc(row, col)" :key="frame.frameId" class="frame-layer" :class="{
              'frame-bottom': frame.stackLevel === 1 && frame.stackTotal > 1,
              'frame-top': frame.stackLevel === frame.stackTotal,
            }">
              <!-- 料框标签行 -->
              <div class="frame-tag-row">
                <span class="frame-tag">
                  <Box :size="10" />
                  #{{ frame.frameNo }}
                </span>
                <span class="layer-tag">第{{ frame.stackLevel }}层</span>
                <span v-if="frame.stackLevel === 1 && frame.stackTotal > 1" class="bottom-tag">底</span>
              </div>

              <!-- 该料框内的料卷 -->
              <div class="frame-coil-chips">
                <template v-if="getFrameCoils(frame.frameId).length === 0">
                  <span class="empty-frame-chip">空框</span>
                </template>
                <div v-for="coil in getFrameCoils(frame.frameId)" :key="coil.id" class="coil-chip" :class="[
                  getCoilChipClass(coil),
                  { 'chip-highlighted': coil.id === highlightCoilId },
                  { 'chip-stale-pulse': coil.daysStayed >= staleThresholds.stale },
                ]" @click="openPopup(coil)">
                  <!-- 第一行：停放天数 + 警告标识（同行，flex 排列） -->
                  <div class="chip-header-row">
                    <div class="chip-days-line">
                      {{ colorMode === 'staleness' ? coil.daysStayed + '天' : getStatusLabel(coil.status) }}
                    </div>
                    <div v-if="needsWarningBadge(coil)" class="chip-warn-badge">⚠</div>
                  </div>
                  <!-- 第二行：卷号（省略前缀） -->
                  <div class="chip-coil-no">{{ shortCoilNo(coil.coilNo) }}</div>
                  <!-- 第三行：客户缩写 · 宽度 -->
                  <div class="chip-meta">{{ coil.customer.slice(0, 3) }}·{{ coil.width }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════ -->
    <!-- 料卷详情弹窗                                   -->
    <!-- ══════════════════════════════════════════════ -->
    <Transition name="popup">
      <div v-if="selectedCoil" class="popup-overlay" @click.self="closePopup">
        <div class="popup-card">
          <div class="popup-header">
            <div class="popup-coil-no">{{ selectedCoil.coilNo }}</div>
            <button class="popup-close" @click="closePopup">
              <X :size="18" />
            </button>
          </div>

          <!-- ① 三级定位：区域 / 库位 / 料框层 -->
          <div class="popup-section section-location">
            <div class="location-path">
              <div class="path-item">
                <span class="path-label">区域</span>
                <span class="path-value">{{ currentZone?.name }}</span>
              </div>
              <span class="path-arrow">›</span>
              <div class="path-item">
                <span class="path-label">库位</span>
                <span class="path-value location-badge">{{ getCoilLocation(selectedCoil) }}</span>
              </div>
              <span class="path-arrow">›</span>
              <div class="path-item">
                <span class="path-label">料框</span>
                <span class="path-value">
                  <Box :size="13" style="vertical-align:-2px" />
                  #{{ getFrameNo(selectedCoil.frameId) }}
                </span>
              </div>
              <span class="path-arrow">›</span>
              <div class="path-item">
                <span class="path-label">层</span>
                <span class="path-value"
                  :class="{ 'bottom-warn': getFrameStackInfo(selectedCoil.frameId)?.stackLevel === 1 && getFrameStackInfo(selectedCoil.frameId)?.stackTotal > 1 }">
                  第{{ getFrameStackInfo(selectedCoil.frameId)?.stackLevel }}层
                  <template
                    v-if="getFrameStackInfo(selectedCoil.frameId)?.stackLevel === 1 && getFrameStackInfo(selectedCoil.frameId)?.stackTotal > 1">
                    <span class="bottom-hint">（底层）</span>
                  </template>
                </span>
              </div>
            </div>

            <div class="status-row">
              <span class="status-badge"
                :style="{ background: getStatusColor(selectedCoil.status) + '20', color: getStatusColor(selectedCoil.status), borderColor: getStatusColor(selectedCoil.status) + '50' }">
                {{ getStatusLabel(selectedCoil.status) }}
              </span>
              <span class="days-badge" :class="getStalenessClass(selectedCoil.daysStayed)">
                已停放 {{ selectedCoil.daysStayed }} 天
              </span>
            </div>
          </div>

          <!-- ② 基础信息 -->
          <div class="popup-section">
            <div class="section-title">基础信息</div>
            <div class="info-grid">
              <div class="info-row"><span class="info-label">母卷号</span><span class="info-value">{{
                selectedCoil.motherCoilNo
              }}</span></div>
              <div class="info-row"><span class="info-label">规格</span><span class="info-value">{{ selectedCoil.thickness
              }}μm × {{ selectedCoil.width }}mm × {{ selectedCoil.length }}m</span></div>
              <div class="info-row"><span class="info-label">合金</span><span class="info-value">{{ selectedCoil.alloy
              }}</span></div>
              <div class="info-row"><span class="info-label">产品类型</span><span class="info-value">{{
                selectedCoil.productType
              }}</span></div>
              <div class="info-row"><span class="info-label">重量</span><span class="info-value">{{ selectedCoil.weight }}
                  kg</span></div>
              <div class="info-row"><span class="info-label">客户</span><span class="info-value">{{ selectedCoil.customer
              }}</span></div>
              <div class="info-row"><span class="info-label">入库时间</span><span class="info-value">{{
                selectedCoil.entryTime
              }}</span></div>
            </div>
          </div>

          <!-- ③ 质量评审 -->
          <div class="popup-section section-review" :class="reviewSectionClass(selectedCoil)">
            <div class="section-title">
              质量评审
              <span v-if="isNotReviewed(selectedCoil)" class="review-warn-badge">⚠ 待评审</span>
            </div>
            <div v-if="isNotReviewed(selectedCoil)" class="not-reviewed-alert">
              评审未完成，不可领料进入下道工序
            </div>
            <div v-else class="review-conclusion">
              <span class="review-badge" :class="reviewBadgeClass(selectedCoil.reviewInfo.conclusion)">{{
                selectedCoil.reviewInfo.conclusion }}</span>
              <span class="review-grade">{{ selectedCoil.reviewInfo.grade }}</span>
            </div>
            <div v-if="selectedCoil.reviewInfo.instructions?.length > 0" class="instructions-block">
              <div class="instructions-title">处理指令：</div>
              <div v-for="(inst, i) in selectedCoil.reviewInfo.instructions" :key="i" class="instruction-item"
                :class="getInstructionClass(inst.action)">
                <span class="inst-action">{{ inst.action }}</span>
                {{ inst.side }} {{ inst.startMm === inst.endMm ? inst.startMm + 'mm' : inst.startMm + '-' + inst.endMm +
                  'mm' }} {{ inst.defectType }}
              </div>
            </div>
          </div>

          <!-- ④ 关联订单 -->
          <div class="popup-section">
            <div class="section-title">关联订单</div>
            <div v-if="selectedCoil.orderId" class="info-grid">
              <div class="info-row"><span class="info-label">执行单号</span><span class="info-value order-no">{{
                selectedCoil.orderNo }}</span></div>
              <div class="info-row"><span class="info-label">客户</span><span class="info-value">{{ selectedCoil.customer
              }}</span></div>
              <div class="info-row">
                <span class="info-label">交期</span>
                <span class="info-value">
                  {{ selectedCoil.orderDeadline }}
                  <span class="deadline-days" :class="deadlineDaysClass(selectedCoil.orderDeadline)">{{
                    deadlineDaysText(selectedCoil.orderDeadline) }}</span>
                </span>
              </div>
            </div>
            <div v-else class="no-order">未关联订单</div>
          </div>

          <!-- ⑤ 工序流转轨迹 -->
          <div class="popup-section section-history">
            <div class="section-title">工序流转轨迹</div>
            <div class="history-timeline">
              <div v-for="(item, idx) in [...selectedCoil.history].reverse()" :key="idx" class="timeline-item">
                <div class="timeline-dot" :class="idx === 0 ? 'dot-active' : 'dot-done'"></div>
                <div class="timeline-line" v-if="idx < selectedCoil.history.length - 1"></div>
                <div class="timeline-content">
                  <div class="timeline-time">{{ item.time }}</div>
                  <div class="timeline-label">{{ item.label }}</div>
                  <div class="timeline-meta">{{ item.operator }}<span v-if="item.location"> · {{ item.location }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="popup-actions">
            <button class="btn-primary" @click="goToCoilDetail">查看完整详情</button>
            <button class="btn-secondary" @click="closePopup">关闭</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, X, MapPin, AlertTriangle, Box } from 'lucide-vue-next'
import {
  warehouseZones,
  warehouseFrames,
  staleThresholds,
  materialCoils,
  coilStatuses,
} from '../data/material/index.js'

const router = useRouter()
const route = useRoute()

// ── 状态 ────────────────────────────────────────────────────────
const activeZone = ref('slitting')
const colorMode = ref('staleness')
const searchQuery = ref('')
const searchMessage = ref('')
const searchFound = ref(false)
const highlightCoilId = ref(null)
const selectedCoil = ref(null)

// ── 挂载时读取URL参数，支持从其他页面跳转定位 ─────────────────
onMounted(() => {
  const q = route.query.search
  if (q) {
    searchQuery.value = q
    nextTick(() => onSearch())
  }
})

// ── 计算属性 ─────────────────────────────────────────────────────

const currentZone = computed(() =>
  warehouseZones.find(z => z.id === activeZone.value)
)

// ── 网格数据 ─────────────────────────────────────────────────────

/** 获取指定库位（row, col）的料框列表，按层数从高到低排列（最上层优先） */
function getFramesAtLoc(row, col) {
  return warehouseFrames
    .filter(f => f.zone === activeZone.value && f.row === row && f.col === col)
    .sort((a, b) => b.stackLevel - a.stackLevel)  // 高层在上展示
}

/** 获取料框内的料卷 */
function getFrameCoils(frameId) {
  return materialCoils.filter(c => c.frameId === frameId)
}

/** 库位格子 class */
function getCellClass(row, col) {
  const frames = getFramesAtLoc(row, col)
  if (frames.length === 0) return 'cell-empty-loc'

  const coils = frames.flatMap(f => getFrameCoils(f.frameId))
  if (coils.length === 0) return 'cell-has-frames-empty'  // 框在但无料

  // 是否含被搜索高亮的料卷
  if (coils.some(c => c.id === highlightCoilId.value)) return 'cell-highlighted'

  // 最严重的停放状态决定格子边框颜色
  const maxDays = Math.max(...coils.map(c => c.daysStayed))
  if (maxDays >= staleThresholds.stale) return 'cell-has-stale'
  if (maxDays >= staleThresholds.warning) return 'cell-has-overdue'
  if (maxDays >= staleThresholds.normal) return 'cell-has-warning'
  return 'cell-has-normal'
}

// ── 统计 ─────────────────────────────────────────────────────────

function getZoneCoilCount(zoneId) {
  return materialCoils.filter(c => c.zone === zoneId).length
}

function getZoneOccupiedLocs(zoneId) {
  const frames = warehouseFrames.filter(f => f.zone === zoneId)
  const locs = new Set(frames.map(f => `${f.row}-${f.col}`))
  return locs.size
}

function getAlertCount(days) {
  return materialCoils.filter(c => c.daysStayed >= days).length
}

// ── 料卷样式 ─────────────────────────────────────────────────────

function getCoilChipClass(coil) {
  if (colorMode.value === 'staleness') {
    if (coil.daysStayed >= staleThresholds.stale) return 'chip-stale'
    if (coil.daysStayed >= staleThresholds.warning) return 'chip-overdue'
    if (coil.daysStayed >= staleThresholds.normal) return 'chip-warning'
    return 'chip-normal'
  } else {
    const s = coil.status
    if (s.endsWith('_reviewed')) return 'chip-status-reviewed'
    if (s.endsWith('_qc')) return 'chip-status-qc'
    if (s.endsWith('_planned')) return 'chip-status-planned'
    return 'chip-status-other'
  }
}

function getStalenessClass(days) {
  if (days >= staleThresholds.stale) return 'days-stale'
  if (days >= staleThresholds.warning) return 'days-overdue'
  if (days >= staleThresholds.normal) return 'days-warning'
  return 'days-normal'
}

function needsWarningBadge(coil) {
  return isNotReviewed(coil) || (coil.reviewInfo?.instructions?.length > 0)
}

function isNotReviewed(coil) {
  return ['质检中', '未质检', '-'].includes(coil.reviewInfo?.conclusion)
}

function getStatusLabel(status) {
  return coilStatuses[status]?.label ?? status
}

function getStatusColor(status) {
  return coilStatuses[status]?.color ?? '#94a3b8'
}

function getStatusShort(status) {
  // 简略状态文字，适合芯片内显示
  const map = {
    slitting_reviewed: '评', slitting_qc: '检', slitting_planned: '排', slitting: '切',
    rolling_reviewed: '评', rolling_qc: '检', rolled: '下',
    finishing_reviewed: '评', finishing_qc: '检', finishing_planned: '排', finishing: '精',
  }
  return map[status] ?? '?'
}

function reviewBadgeClass(conclusion) {
  if (conclusion === '正常处理') return 'badge-normal'
  if (conclusion === '让步放行') return 'badge-warning'
  if (conclusion === '改切') return 'badge-danger'
  return 'badge-default'
}

function reviewSectionClass(coil) {
  if (isNotReviewed(coil)) return 'review-pending'
  if (coil.reviewInfo?.instructions?.length > 0) return 'review-has-instructions'
  return ''
}

function getInstructionClass(action) {
  if (action === '切除' || action === '改切') return 'inst-danger'
  if (action === '避留白' || action === '吸边') return 'inst-warning'
  return 'inst-info'
}

// ── 定位信息 ─────────────────────────────────────────────────────

/** 获取料卷所在的库位坐标标签，如"A-3" */
function getCoilLocation(coil) {
  const frame = warehouseFrames.find(f => f.frameId === coil.frameId)
  if (!frame) return '—'
  return `${frame.row}-${frame.col}`
}

function getFrameNo(frameId) {
  return warehouseFrames.find(f => f.frameId === frameId)?.frameNo ?? frameId
}

function getFrameStackInfo(frameId) {
  return warehouseFrames.find(f => f.frameId === frameId)
}

// ── 交期 ─────────────────────────────────────────────────────────

function deadlineDaysText(deadline) {
  if (!deadline) return ''
  const days = Math.ceil((new Date(deadline) - new Date('2026-03-11')) / 86400000)
  if (days < 0) return `已超期 ${Math.abs(days)} 天`
  if (days === 0) return '今天到期'
  return `还剩 ${days} 天`
}

function deadlineDaysClass(deadline) {
  if (!deadline) return ''
  const days = Math.ceil((new Date(deadline) - new Date('2026-03-11')) / 86400000)
  if (days <= 0) return 'deadline-danger'
  if (days <= 5) return 'deadline-warning'
  return 'deadline-ok'
}

// ── 搜索 ─────────────────────────────────────────────────────────

function onSearch() {
  const q = searchQuery.value.trim()
  if (!q) { clearSearch(); return }

  // 先按卷号搜索
  let found = materialCoils.find(c =>
    c.coilNo.includes(q) || c.motherCoilNo.includes(q)
  )
  // 再按料框号搜索（找框内第一卷）
  if (!found) {
    const frame = warehouseFrames.find(f => f.frameNo === q || f.frameId === q)
    if (frame) found = materialCoils.find(c => c.frameId === frame.frameId)
  }

  if (found) {
    activeZone.value = found.zone
    highlightCoilId.value = found.id
    searchFound.value = true
    const loc = getCoilLocation(found)
    const frameNo = getFrameNo(found.frameId)
    const zName = warehouseZones.find(z => z.id === found.zone)?.name
    searchMessage.value = `已定位：${found.coilNo} — ${zName} 库位 ${loc}，#${frameNo}框`

    // 等 DOM 更新后滚动到格子
    nextTick(() => {
      const el = document.getElementById(`cell-${found.zone}-${loc.split('-')[0]}-${loc.split('-')[1]}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  } else {
    highlightCoilId.value = null
    searchFound.value = false
    searchMessage.value = `未找到"${q}"，请检查输入`
  }
}

// 缩短卷号前缀显示，如 Y2601205/1-2 → 01205/1-2
function shortCoilNo(coilNo) {
  return coilNo.replace(/^Y\d{2}/, '')
}

function clearSearch() {

  searchQuery.value = ''
  searchMessage.value = ''
  searchFound.value = false
  highlightCoilId.value = null
}

// ── 弹窗 ─────────────────────────────────────────────────────────

function openPopup(coil) {
  selectedCoil.value = coil
}

function closePopup() {
  selectedCoil.value = null
}

function goToCoilDetail() {
  router.push({ path: '/material/coils', query: { search: selectedCoil.value.coilNo } })
  closePopup()
}
</script>

<style scoped>
/* ── 全局布局 ── */
.location-view {
  /*padding: 24px;*/
  /* background: #f1f5f9; */
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── 页面头部 ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.page-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.page-desc strong {
  color: #3b82f6;
}

/* ── 搜索框 ── */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  width: 280px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box.search-active,
.search-box:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.search-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.search-input {
  border: none;
  outline: none;
  font-size: 13px;
  color: #1e293b;
  flex: 1;
  background: transparent;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
  display: flex;
}

.search-clear:hover {
  color: #ef4444;
}

/* ── 统计栏 ── */
.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 20px;
}

.zone-stats {
  display: flex;
  gap: 32px;
}

.zone-stat-item {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}

.zone-stat-item:hover {
  background: #f8fafc;
}

.zone-stat-item.active {
  background: #eff6ff;
}

.zone-stat-name {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
}

.zone-stat-numbers {
  font-size: 14px;
  font-weight: 600;
}

.coil-count {
  color: #1e293b;
  font-size: 18px;
}

.frame-count {
  color: #64748b;
}

.zone-stat-sep {
  color: #94a3b8;
  margin: 0 2px;
  font-size: 12px;
}

.alert-stats {
  display: flex;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 8px;
}

.alert-warning {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.alert-danger {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.alert-item strong {
  font-weight: 700;
}

/* ── 工具栏 ── */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.zone-tabs {
  display: flex;
  gap: 4px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 4px;
}

.zone-tab {
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.zone-tab.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.zone-tab:not(.active):hover {
  background: #f1f5f9;
  color: #1e293b;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.color-mode-switch {
  display: flex;
  align-items: center;
  gap: 4px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 8px;
}

.mode-label {
  font-size: 12px;
  color: #64748b;
}

.mode-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  color: #64748b;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #3b82f6;
  color: white;
}

.legend {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #64748b;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-normal {
  background: #4ade80;
}

.dot-warning {
  background: #facc15;
}

.dot-overdue {
  background: #fb923c;
}

.dot-stale {
  background: #f87171;
}

.warn-icon {
  font-size: 13px;
  color: #f59e0b;
}

/* ── 搜索反馈 ── */
.search-feedback {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.found {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.not-found {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* ══════════════════════════════════════════════════════════════════
   库位网格地图
══════════════════════════════════════════════════════════════════ */
.map-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  overflow-x: auto;
}

/* 列表头 */
.map-header {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  padding-left: 0;
}

.row-label-placeholder {
  width: 28px;
  flex-shrink: 0;
}

.col-header {
  flex: 1;
  min-width: 160px;
  text-align: center;
  font-size: 12px;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: 0.08em;
  /* 蓝色胶囊背景，让列号醒目 */
  background: rgba(37, 99, 235, 0.08);
  border-radius: 6px;
  padding: 3px 0;
  border: 1px solid rgba(37, 99, 235, 0.15);
}

/* 行 */
.map-row {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.row-label {
  width: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: 0.08em;
  /* 与列号保持一致：浅蓝胶囊背景 */
  background: rgba(37, 99, 235, 0.08);
  border-radius: 6px;
  border: 1px solid rgba(37, 99, 235, 0.15);
}


/* ── 库位格子 ── */
.location-cell {
  flex: 1;
  min-width: 160px;
  min-height: 80px;
  border-radius: 9px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  position: relative;
  padding: 5px;
  cursor: default;
  transition: box-shadow 0.15s;
}

/* 库位编号标签 */
.cell-pos-label {
  position: absolute;
  top: 4px;
  left: 5px;
  font-size: 10px;
  font-weight: 800;
  color: #475569;
  line-height: 1;
  pointer-events: none;
  /* 半透明白底胶囊，与格子内容有所区分 */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 4px;
  padding: 1px 4px;
  letter-spacing: 0.04em;
}

/* 空库位（没有料框） */
.cell-empty-loc {
  background: #f8fafc;
  border-color: #e8ecf0;
}

.cell-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 52px;
}

.empty-icon {
  font-size: 16px;
  color: #e2e8f0;
}

/* 有料时格子边框颜色——反映最严重状态 */
.cell-has-normal {
  border-color: #86efac;
}

.cell-has-warning {
  border-color: #fde047;
}

.cell-has-overdue {
  border-color: #fb923c;
}

.cell-has-stale {
  border-color: #fca5a5;
  animation: cell-stale-pulse 2.5s ease-in-out infinite;
}

@keyframes cell-stale-pulse {

  0%,
  100% {
    border-color: #fca5a5;
  }

  50% {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
}

.cell-has-frames-empty {
  background: #f8fafc;
  border-color: #e2e8f0;
  border-style: dashed;
}

.cell-highlighted {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2) !important;
  background: #eff6ff;
  animation: highlight-pulse 1s ease-in-out 4;
}

@keyframes highlight-pulse {

  0%,
  100% {
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  50% {
    box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.08);
  }
}

.location-cell:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* ── 料框层 ── */
.cell-frames-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 16px;
  /* 给 cell-pos-label 让位 */
}

.frame-layer {
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  padding: 4px 5px;
  transition: box-shadow 0.15s;
}

.frame-layer:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
}

.frame-bottom {
  border-color: #fde68a;
  background: #fffef0;
}

.frame-tag-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.frame-tag {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 700;
  color: #334155;
}

.layer-tag {
  font-size: 10px;
  color: #94a3b8;
}

.bottom-tag {
  font-size: 10px;
  background: #fef3c7;
  color: #92400e;
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 600;
}

/* ── 料卷小卡片 ── */
.frame-coil-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.empty-frame-chip {
  font-size: 10px;
  color: #94a3b8;
  font-style: italic;
  padding: 2px 0;
}

/* 料卷小卡片：纵向3行布局，宽度固定让内容对齐 */
.coil-chip {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 5px 7px;
  border-radius: 7px;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: transform 0.12s, box-shadow 0.12s;
  position: relative;
  min-width: 72px;
  max-width: 100%;
}

.coil-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

/* 第一行容器：天数文字 + 警告角标并排 */
.chip-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 3px;
}

/* 警告角标（内联，不再 absolute） */
.chip-warn-badge {
  font-size: 11px;
  color: #f59e0b;
  line-height: 1.2;
  flex-shrink: 0;
  margin-top: 1px;
}

/* 第一行：停放天数（粗体，显眼） */
.chip-days-line {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 第二行：卷号缩写 */
.chip-coil-no {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 第三行：客户·宽度（辅助信息，略小） */
.chip-meta {
  font-size: 10px;
  opacity: 0.7;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── 停放时长着色 ── */
.chip-normal {
  background: #dcfce7;
  border-color: #86efac;
  color: #166534;
}

.chip-warning {
  background: #fef9c3;
  border-color: #fde047;
  color: #713f12;
}

.chip-overdue {
  background: #ffedd5;
  border-color: #fb923c;
  color: #7c2d12;
}

.chip-stale {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #7f1d1d;
}

.chip-stale-pulse {
  animation: chip-stale-pulse 2s ease-in-out infinite;
}

@keyframes chip-stale-pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

/* ── 料卷状态着色 ── */
.chip-status-reviewed {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #065f46;
}

.chip-status-qc {
  background: #fef9c3;
  border-color: #fde047;
  color: #78350f;
}

.chip-status-planned {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1e3a8a;
}

.chip-status-other {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

.chip-highlighted {
  outline: 2px solid #2563eb !important;
  outline-offset: 1px;
}

/* ══════════════════════════════════════════════════════════════════
   弹窗
══════════════════════════════════════════════════════════════════ */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.popup-card {
  background: white;
  border-radius: 16px;
  width: 500px;
  max-width: 100%;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.popup-enter-active,
.popup-leave-active {
  transition: all 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
}

.popup-coil-no {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  font-family: monospace;
}

.popup-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.15s;
  display: flex;
}

.popup-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.popup-section {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ① 三级定位区块 */
.section-location {
  background: #f8fafc;
}

.location-path {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.path-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 60px;
}

.path-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
}

.path-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.path-arrow {
  font-size: 18px;
  color: #cbd5e1;
  align-self: center;
}

.location-badge {
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 15px;
  letter-spacing: 0.05em;
}

.bottom-warn {
  color: #d97706;
}

.bottom-hint {
  font-size: 11px;
  color: #f59e0b;
  font-weight: 400;
}

.status-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}

.days-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.days-normal {
  background: #dcfce7;
  color: #166534;
}

.days-warning {
  background: #fef9c3;
  color: #713f12;
}

.days-overdue {
  background: #ffedd5;
  color: #7c2d12;
}

.days-stale {
  background: #fee2e2;
  color: #7f1d1d;
}

/* ② 基础信息 */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  gap: 12px;
  font-size: 13px;
  align-items: baseline;
}

.info-label {
  color: #64748b;
  flex-shrink: 0;
  width: 64px;
}

.info-value {
  color: #1e293b;
  font-weight: 500;
}

.order-no {
  font-family: monospace;
  color: #3b82f6;
}

/* ③ 评审 */
.review-warn-badge {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.section-review.review-pending {
  background: #fef2f2;
}

.not-reviewed-alert {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.review-conclusion {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.review-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge-normal {
  background: #dcfce7;
  color: #166534;
}

.badge-warning {
  background: #fef9c3;
  color: #713f12;
}

.badge-danger {
  background: #fee2e2;
  color: #7f1d1d;
}

.badge-default {
  background: #f1f5f9;
  color: #475569;
}

.review-grade {
  font-size: 13px;
  color: #64748b;
}

.instructions-block {
  margin-top: 8px;
}

.instructions-title {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 7px;
  font-size: 13px;
  margin-bottom: 4px;
  font-weight: 500;
}

.inst-danger {
  background: #fef2f2;
  color: #7f1d1d;
  border-left: 3px solid #ef4444;
}

.inst-warning {
  background: #fffbeb;
  color: #78350f;
  border-left: 3px solid #f59e0b;
}

.inst-info {
  background: #eff6ff;
  color: #1e3a8a;
  border-left: 3px solid #3b82f6;
}

.inst-action {
  font-weight: 700;
}

/* ④ 订单 */
.deadline-days {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 5px;
  margin-left: 8px;
}

.deadline-danger {
  background: #fee2e2;
  color: #dc2626;
}

.deadline-warning {
  background: #fffbeb;
  color: #d97706;
}

.deadline-ok {
  background: #f0fdf4;
  color: #166534;
}

.no-order {
  font-size: 13px;
  color: #94a3b8;
}

/* ⑤ 工序轨迹 */
.history-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 12px;
  position: relative;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.dot-active {
  background: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.dot-done {
  background: #cbd5e1;
}

.timeline-line {
  position: absolute;
  left: 4px;
  top: 14px;
  bottom: -14px;
  width: 2px;
  background: #e2e8f0;
}

.timeline-content {
  padding-bottom: 16px;
  flex: 1;
}

.timeline-time {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 2px;
  font-family: monospace;
}

.timeline-label {
  font-size: 13px;
  color: #334155;
  font-weight: 500;
}

.timeline-meta {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

/* 弹窗按钮 */
.popup-actions {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-primary {
  flex: 1;
  padding: 10px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #1e293b;
}
</style>
