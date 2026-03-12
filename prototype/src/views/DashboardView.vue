<template>
  <div class="dashboard-container">
    <div class="dashboard-header-bar">
      <div>
        <h1 class="page-title">总览</h1>
        <p class="page-subtitle">{{ todayLabel }} · 实时全厂生产与排产负荷一览</p>
      </div>

      <div class="date-switcher-wrap" ref="pickerAnchorRef">
        <div class="date-switcher">
          <button class="date-btn" @click="prevDay" title="前一天">
            <ChevronLeft :size="16" />
          </button>
          <button class="current-date date-label-btn" @click="togglePicker" title="点击选择日期">
            {{ currentDateLabel }}
            <CalendarDays :size="13" style="opacity:0.5;margin-left:4px" />
          </button>
          <button class="date-btn" @click="nextDay" title="后一天">
            <ChevronRight :size="16" />
          </button>
        </div>

        <!-- 日历弹出面板 -->
        <Transition name="picker-fade">
          <div v-if="showPicker" class="date-picker-popup">
            <!-- 月份导航 -->
            <div class="picker-header">
              <button class="picker-nav-btn" @click.stop="prevMonth">
                <ChevronLeft :size="14" />
              </button>
              <span class="picker-month-label">{{ pickerHeader }}</span>
              <button class="picker-nav-btn" @click.stop="nextMonth">
                <ChevronRight :size="14" />
              </button>
            </div>
            <!-- 星期标题 -->
            <div class="picker-weekdays">
              <span v-for="w in ['日', '一', '二', '三', '四', '五', '六']" :key="w">{{ w }}</span>
            </div>
            <!-- 日期格子 -->
            <div class="picker-days">
              <button v-for="cell in calendarDays" :key="cell.key" class="picker-day-btn" :class="{
                'other-month': !cell.inMonth,
                'is-today': cell.isBase,
                'is-selected': cell.isSelected,
              }" @click.stop="selectDay(cell.date)">{{ cell.day }}</button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- ① 统计卡片区（5张） -->
      <div class="stats-grid">
        <!-- 轧机 -->
        <StatCard title="轧机排产计划" theme="blue" :hasProgress="false" clickable @card-click="router.push('/rolling')">
          <template #icon>
            <Cpu :size="20" />
          </template>
          <template #body>
            <ProcessStatBody :planned="dashboardStats.rolling.planned" :completed="dashboardStats.rolling.completed"
              :running="dashboardStats.rolling.running" :waiting="dashboardStats.rolling.waiting"
              :plannedTons="dashboardStats.rolling.plannedTons" :completedTons="dashboardStats.rolling.completedTons"
              unit="卷" />
          </template>
        </StatCard>

        <!-- 分切 -->
        <StatCard title="分切排产计划" theme="purple" :hasProgress="false" clickable @card-click="router.push('/slitting')">
          <template #icon>
            <Scissors :size="20" />
          </template>
          <template #body>
            <ProcessStatBody :planned="dashboardStats.slitting.planned" :completed="dashboardStats.slitting.completed"
              :running="dashboardStats.slitting.running" :waiting="dashboardStats.slitting.waiting"
              :plannedTons="dashboardStats.slitting.plannedTons" :completedTons="dashboardStats.slitting.completedTons"
              unit="卷" />
          </template>
        </StatCard>

        <!-- 精切 -->
        <StatCard title="精切排产计划" theme="green" :hasProgress="false" clickable
          @card-click="router.push('/precision-cutting')">
          <template #icon>
            <Crosshair :size="20" />
          </template>
          <template #body>
            <ProcessStatBody :planned="dashboardStats.finishing.planned" :completed="dashboardStats.finishing.completed"
              :running="dashboardStats.finishing.running" :waiting="dashboardStats.finishing.waiting"
              :plannedTons="dashboardStats.finishing.plannedTons"
              :completedTons="dashboardStats.finishing.completedTons" unit="子卷" />
          </template>
        </StatCard>

        <!-- ④ 在制品积压（增强版） -->
        <StatCard title="在制品积压状态" theme="orange"
          :mainValue="dashboardStats.wip.waitSlitting + dashboardStats.wip.waitFinishing" mainLabel="全厂积压卷"
          :hasProgress="false" clickable @card-click="router.push('/material/dashboard')">
          <template #icon>
            <Boxes :size="20" />
          </template>
          <template #body>
            <div class="wip-details">
              <div class="wip-item">
                <span class="wip-label">待分切</span>
                <span class="wip-value warning">{{ dashboardStats.wip.waitSlitting }}</span>
              </div>
              <div class="wip-item">
                <span class="wip-label">待精切</span>
                <span class="wip-value danger">{{ dashboardStats.wip.waitFinishing }}</span>
              </div>
              <div class="wip-item">
                <span class="wip-label">待评审</span>
                <span class="wip-value">{{ dashboardStats.wip.pendingReview }}</span>
              </div>
              <div class="wip-divider"></div>
              <!-- ③ 质量阻塞（调研7.1：评审决定排产能否继续） -->
              <div class="wip-item">
                <span class="wip-label wip-label-alert">
                  <AlertTriangle :size="12" style="margin-right: 3px;" />质量阻塞
                </span>
                <span class="wip-value danger">{{ dashboardStats.wip.qualityBlocked }}</span>
              </div>
              <!-- ③ 呆滞料预警（方案3.4明确功能） -->
              <div class="wip-item stale-row" :class="{ 'stale-danger': dashboardStats.wip.stale7Days > 0 }">
                <span class="wip-label wip-label-alert">
                  <Clock :size="12" style="margin-right: 3px;" />呆滞预警
                </span>
                <div class="stale-badges">
                  <span class="stale-badge warning">≥3天 {{ dashboardStats.wip.stale3Days }}卷</span>
                  <span class="stale-badge danger" v-if="dashboardStats.wip.stale7Days > 0">≥7天 {{
                    dashboardStats.wip.stale7Days }}卷</span>
                </div>
              </div>
            </div>
          </template>
        </StatCard>

        <!-- ⑤ 整体进度（方案3.2界面示意明确要求） -->
        <StatCard title="整体进度" theme="teal" :hasProgress="false" clickable
          @card-click="router.push('/execution/dashboard')">
          <template #icon>
            <TrendingUp :size="20" />
          </template>
          <template #body>
            <div class="overview-kpi">
              <!-- 订单完成率：大数字突出 -->
              <div class="kpi-main-row">
                <div class="kpi-big">
                  <span class="kpi-num" :class="completionRateClass">{{ dashboardStats.overview.orderCompletionRate
                  }}%</span>
                  <span class="kpi-desc">订单完成率</span>
                </div>
                <div class="kpi-overdue" :class="{ 'has-overdue': dashboardStats.overview.overdueOrders > 0 }">
                  <span class="overdue-num">{{ dashboardStats.overview.overdueOrders }}</span>
                  <span class="overdue-desc">逾期订单</span>
                </div>
              </div>
              <div class="kpi-divider"></div>
              <!-- 次级 KPI 指标（调研9.4） -->
              <div class="kpi-sub-grid">
                <div class="kpi-sub-item">
                  <span class="kpi-sub-val">{{ dashboardStats.overview.onTimeRate }}%</span>
                  <span class="kpi-sub-label">准时率</span>
                </div>
                <div class="kpi-sub-item">
                  <span class="kpi-sub-val">{{ dashboardStats.overview.schedulePlanRate }}%</span>
                  <span class="kpi-sub-label">计划达成</span>
                </div>
                <div class="kpi-sub-item">
                  <span class="kpi-sub-val">{{ dashboardStats.overview.avgWasteRate }}%</span>
                  <span class="kpi-sub-label">平均废料率</span>
                </div>
                <!-- ⑤ 急单标识 -->
                <div class="kpi-sub-item" v-if="dashboardStats.overview.urgentOrders > 0">
                  <span class="kpi-sub-val urgent-val">
                    <Zap :size="12" />{{ dashboardStats.overview.urgentOrders }}
                  </span>
                  <span class="kpi-sub-label">急单</span>
                </div>
              </div>
            </div>
          </template>
        </StatCard>
      </div>

      <!-- ⑧ 道次缓冲库存看板（调研3.2：道次间保持2卷以上缓冲） -->
      <div class="buffer-section">
        <div class="buffer-header">
          <span class="buffer-title">
            <Layers :size="14" class="buffer-icon" />
            轧机道次缓冲库存
          </span>
          <span class="buffer-hint">阈值：≥ 2卷</span>
        </div>
        <div class="buffer-bars">
          <div v-for="stage in bufferStages" :key="stage.key" class="buffer-item" :class="stage.statusClass">
            <div class="buffer-label">{{ stage.label }}</div>
            <div class="buffer-bar-wrap">
              <div class="buffer-bar-track">
                <div class="buffer-bar-fill" :style="{ width: Math.min(stage.count / 10 * 100, 100) + '%' }"
                  :class="stage.statusClass"></div>
              </div>
              <div class="buffer-count" :class="stage.statusClass">
                {{ stage.count }}卷
                <span class="buffer-status-tag">{{ stage.statusLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 机台状态条 -->
      <div class="machine-status-section">
        <MachineStatusBar title="轧机设备实时状态 (14台)" machineType="rolling" :machines="rollingMachines" :plans="rollingPlans"
          coilField="coilNo" />
        <MachineStatusBar title="分切设备实时状态 (14台)" machineType="slitting" :machines="slittingMachines"
          :plans="slittingPlans" coilField="motherCoilNo" />
        <MachineStatusBar class="finishing-status" title="精切设备实时状态 (49台)" machineType="finishing"
          :machines="finishingMachines" :plans="finishingPlans" coilField="childCoilNo" />
      </div>

      <!-- 底部双列区 -->
      <div class="bottom-panels">
        <!-- 交期预警 -->
        <div class="panel warning-panel">
          <div class="panel-header">
            <h3 class="panel-title">
              <span class="panel-icon-bubble red">
                <PhSiren :size="16" weight="fill" />
              </span>
              交期预警
            </h3>
            <router-link to="/execution/orders" class="view-all-link">查看全部</router-link>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>订单号 / 合同号</th>
                  <th>客户</th>
                  <th>产品规格</th>
                  <th>交期</th>
                  <th>距交期</th>
                  <th>进度</th>
                  <!-- ⑤ 急单标识列 -->
                  <th>紧急等级</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in deliveryWarnings.slice(0, 6)" :key="order.id"
                  :class="['warning-row', order.urgencyLevel]" style="cursor: pointer;"
                  @click="router.push(`/execution/orders/${order.id}`)">
                  <td>
                    <div class="td-main-wrap">
                      <!-- ⑤ 急单标签 -->
                      <span v-if="order.isUrgent" class="urgent-tag">
                        <Zap :size="10" />急
                      </span>
                      <div>
                        <div class="td-main">{{ order.orderNo }}</div>
                        <div class="td-sub">{{ order.contractNo }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ order.customer }}</td>
                  <td>
                    <div class="td-main">{{ order.thickness }}×{{ order.width }}</div>
                    <div class="td-sub">{{ order.product }}</div>
                  </td>
                  <td>{{ order.deliveryDate }}</td>
                  <td>
                    <span :class="['days-badge', order.urgencyLevel]">
                      {{ order.isOverdue ? `逾期 ${Math.abs(order.daysUntilDelivery)} 天` : `剩 ${order.daysUntilDelivery}
                      天` }}
                    </span>
                  </td>
                  <td>
                    <div class="progress-cell">
                      <div class="prog-bar">
                        <div class="prog-fill"
                          :style="{ width: order.progressPct + '%', background: order.urgencyLevel === 'critical' ? 'var(--status-error)' : '#f59e0b' }">
                        </div>
                      </div>
                      <span class="prog-text">{{ order.completedCoils }}/{{ order.totalCoils }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['urgency-badge', riskLevel(order)]">
                      {{ riskLabel(order) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 今日动态记录（增强：急单高亮 + 操作类型图标） -->
        <div class="panel logs-panel">
          <div class="panel-header">
            <h3 class="panel-title">📝 今日动态记录</h3>
          </div>
          <div class="logs-list">
            <div class="log-item" v-for="log in changeLogs" :key="log.id" :class="{ 'log-urgent': log.isUrgent }">
              <div class="log-time">{{ log.time }}</div>
              <div class="log-content-wrap">
                <div class="log-bubble" :class="log.type"></div>
                <div class="log-info">
                  <div class="log-text-row">
                    <span v-if="log.isUrgent" class="log-urgent-tag">
                      <Zap :size="10" />急单
                    </span>
                    <span class="log-text">{{ log.content }}</span>
                  </div>
                  <span class="log-operator">{{ log.operator }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Cpu,
  Scissors,
  Crosshair,
  Boxes,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  Zap,
} from 'lucide-vue-next'
import { PhSiren } from '@phosphor-icons/vue'
import StatCard from '../components/StatCard.vue'
import MachineStatusBar from '../components/MachineStatusBar.vue'
import ProcessStatBody from '../components/ProcessStatBody.vue'

import {
  dashboardStats,
  capacityBalance,
  rollingMachines,
  slittingMachines,
  finishingMachines,
  rollingPlans,
  slittingPlans,
  finishingPlans,
  changeLogs
} from '../data/mock.js'
import { deliveryWarnings } from '../data/execution/stats.js'

const router = useRouter()

// 今日标签（副标题固定）
const todayLabel = '2026年3月5日 星期四'

// ── 日期切换器逻辑 ──
// 以 mock 数据的基准日期（2026-03-05）为"今天"
const BASE_DATE = new Date(2026, 2, 5) // 月份从0开始，2 = 3月
const selectedDate = ref(new Date(BASE_DATE))

// 格式化为「今天 (MM-DD)」或「MM月DD日」
const currentDateLabel = computed(() => {
  const d = selectedDate.value
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const isToday = d.toDateString() === BASE_DATE.toDateString()
  return isToday ? `今天 (${mm}-${dd})` : `${d.getMonth() + 1}月${d.getDate()}日`
})

// 切换到前一天
function prevDay() {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() - 1)
  selectedDate.value = d
}

// 切换到后一天
function nextDay() {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + 1)
  selectedDate.value = d
}

// ── 日历弹出面板逻辑 ──
const showPicker = ref(false)
const pickerAnchorRef = ref(null)
// 弹出面板当前显示的年月
const pickerYear = ref(selectedDate.value.getFullYear())
const pickerMonth = ref(selectedDate.value.getMonth()) // 0-based

// 弹出面板标题
const pickerHeader = computed(() => `${pickerYear.value}年${pickerMonth.value + 1}月`)

// 生成当月日历格子（含上下月补位，共 42 格）
const calendarDays = computed(() => {
  const year = pickerYear.value
  const month = pickerMonth.value
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const sel = selectedDate.value
  const cells = []
  // 上月补位
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i)
    cells.push({ date: d, day: d.getDate(), inMonth: false, isBase: false, isSelected: false, key: `p${d.getTime()}` })
  }
  // 本月
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    cells.push({
      date: d, day,
      inMonth: true,
      isBase: d.toDateString() === BASE_DATE.toDateString(),
      isSelected: d.toDateString() === sel.toDateString(),
      key: `c${d.getTime()}`,
    })
  }
  // 下月补位
  let next = 1
  while (cells.length < 42) {
    const d = new Date(year, month + 1, next++)
    cells.push({ date: d, day: d.getDate(), inMonth: false, isBase: false, isSelected: false, key: `n${d.getTime()}` })
  }
  return cells
})

// 弹出/收起日历
function togglePicker() {
  if (!showPicker.value) {
    pickerYear.value = selectedDate.value.getFullYear()
    pickerMonth.value = selectedDate.value.getMonth()
  }
  showPicker.value = !showPicker.value
}

// 月份切换
function prevMonth() {
  if (pickerMonth.value === 0) { pickerYear.value--; pickerMonth.value = 11 }
  else { pickerMonth.value-- }
}
function nextMonth() {
  if (pickerMonth.value === 11) { pickerYear.value++; pickerMonth.value = 0 }
  else { pickerMonth.value++ }
}

// 选择日期并关闭面板
function selectDay(date) {
  selectedDate.value = new Date(date)
  showPicker.value = false
}

// 点击面板外部时关闭
function onClickOutside(e) {
  if (pickerAnchorRef.value && !pickerAnchorRef.value.contains(e.target)) {
    showPicker.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))


// ⑧ 道次缓冲库存数据（调研3.2：道次间保持2卷以上缓冲）
const bufferStages = computed(() => [
  {
    key: 'roughToMedium',
    label: '粗轧 → 中轧',
    count: capacityBalance.roughToMedium.count,
    threshold: capacityBalance.roughToMedium.threshold,
    statusClass: capacityBalance.roughToMedium.status === 'sufficient' ? 'sufficient' : 'tight',
    statusLabel: capacityBalance.roughToMedium.status === 'sufficient' ? '充足' : '偏紧',
  },
  {
    key: 'mediumToFine',
    label: '中轧 → 精轧',
    count: capacityBalance.mediumToFine.count,
    threshold: capacityBalance.mediumToFine.threshold,
    statusClass: capacityBalance.mediumToFine.status === 'sufficient' ? 'sufficient' : 'tight',
    statusLabel: capacityBalance.mediumToFine.status === 'tight' ? '⚠️ 偏紧' : '充足',
  },
  {
    key: 'fineToSlitting',
    label: '精轧 → 分切',
    count: capacityBalance.fineToSlitting.count,
    threshold: capacityBalance.fineToSlitting.threshold,
    statusClass: capacityBalance.fineToSlitting.status === 'sufficient' ? 'sufficient' : 'tight',
    statusLabel: capacityBalance.fineToSlitting.status === 'sufficient' ? '充足' : '偏紧',
  },
])

// 订单完成率颜色
const completionRateClass = computed(() => {
  const rate = dashboardStats.overview.orderCompletionRate
  if (rate >= 90) return 'rate-good'
  if (rate >= 75) return 'rate-warn'
  return 'rate-bad'
})

// ── 综合风险等级（交期 + 进度双维度）
function riskLevel(order) {
  const pct = order.totalCoils > 0 ? order.completedCoils / order.totalCoils : 0
  if (order.isOverdue && pct < 0.7) return 'critical'
  if (order.isOverdue) return 'overdue'
  if (order.daysUntilDelivery <= 1 && pct < 0.6) return 'critical'
  if (order.daysUntilDelivery <= 3 && pct < 0.3) return 'high-risk'
  if (order.urgencyLevel === 'critical') return 'critical'
  return 'warning'
}

function riskLabel(order) {
  const level = riskLevel(order)
  if (level === 'critical') return '极度紧急'
  if (level === 'overdue') return '逾期可控'
  if (level === 'high-risk') return '进度滞后'
  return '预警'
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.dashboard-header-bar {
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

.date-switcher-wrap {
  position: relative;
}

.date-switcher {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 0.25rem;
}

.date-btn {
  padding: 0.375rem 0.5rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.date-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* 中间日期文字按钮 */
.current-date {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0 1rem;
  color: var(--text-main);
}

.date-label-btn {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
  cursor: pointer;
}

.date-label-btn:hover {
  background: var(--bg-hover);
}

/* ── 日历弹出面板 ── */
.date-picker-popup {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 999;
  width: 260px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 0.75rem;
  user-select: none;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.625rem;
}

.picker-month-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
}

.picker-nav-btn {
  padding: 0.25rem 0.4rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: background 0.15s;
}

.picker-nav-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.picker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.25rem;
}

.picker-weekdays span {
  text-align: center;
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
  padding: 0.25rem 0;
}

.picker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.picker-day-btn {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--text-main);
  border-radius: 6px;
  transition: background 0.12s, color 0.12s;
  cursor: pointer;
}

.picker-day-btn:hover {
  background: var(--bg-hover);
}

/* 非当月日期，灰色 */
.picker-day-btn.other-month {
  color: var(--text-muted);
  opacity: 0.45;
}

/* 基准"今天"（绿色小圆点） */
.picker-day-btn.is-today {
  font-weight: 700;
  color: var(--primary-color, #3b82f6);
  background: rgba(59, 130, 246, 0.08);
}

.picker-day-btn.is-today:hover {
  background: rgba(59, 130, 246, 0.16);
}

/* 当前选中日期（实心蓝） */
.picker-day-btn.is-selected {
  background: var(--primary-color, #3b82f6);
  color: #fff;
  font-weight: 600;
}

.picker-day-btn.is-selected:hover {
  background: var(--primary-color, #3b82f6);
  filter: brightness(1.1);
}

/* 淡入淡出过渡 */
.picker-fade-enter-active,
.picker-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.picker-fade-enter-from,
.picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}


.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ① 5张卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.25rem;
}

/* ── 在制品卡片内容 ── */
.wip-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.wip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
  border-bottom: 1px dashed var(--border-light);
}

.wip-item:last-child {
  border-bottom: none;
}

.wip-label {
  font-size: 0.82rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.wip-label-alert {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.wip-value {
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

.wip-value.warning {
  color: #d97706;
}

.wip-value.danger {
  color: var(--status-error);
}

.wip-divider {
  height: 1px;
  background: var(--border-light);
  margin: 0.25rem 0;
}

/* 呆滞料徽章 */
.stale-badges {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.stale-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.stale-badge.warning {
  background: var(--status-warning-bg);
  color: #b45309;
}

.stale-badge.danger {
  background: var(--status-error-bg);
  color: var(--status-error);
}

/* ── 整体进度卡片 ── */
.overview-kpi {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  flex: 1;
}

.kpi-main-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.kpi-big {
  display: flex;
  flex-direction: column;
}

.kpi-num {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.2rem;
}

.kpi-num.rate-good {
  color: var(--status-success);
}

.kpi-num.rate-warn {
  color: #d97706;
}

.kpi-num.rate-bad {
  color: var(--status-error);
}

.kpi-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.kpi-overdue {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.375rem 0.6rem;
  border-radius: var(--radius-md);
  background: var(--bg-base);
}

.kpi-overdue.has-overdue {
  background: var(--status-error-bg);
}

.overdue-num {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
}

.kpi-overdue.has-overdue .overdue-num {
  color: var(--status-error);
}

.overdue-desc {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.kpi-divider {
  height: 1px;
  background: var(--border-light);
}

.kpi-sub-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.375rem 0.5rem;
}

.kpi-sub-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.kpi-sub-val {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
  font-family: var(--font-mono);
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.kpi-sub-val.urgent-val {
  color: #d97706;
}

.kpi-sub-label {
  font-size: 0.68rem;
  color: var(--text-muted);
}

/* ⑧ 道次缓冲库存 */
.buffer-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 0.875rem 1.25rem;
}

.buffer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.buffer-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.buffer-icon {
  color: var(--text-secondary);
}

.buffer-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.buffer-bars {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.buffer-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.buffer-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.buffer-bar-wrap {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.buffer-bar-track {
  flex: 1;
  height: 6px;
  background: var(--border-light);
  border-radius: 3px;
  overflow: hidden;
}

.buffer-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.buffer-bar-fill.sufficient {
  background: var(--status-success);
}

.buffer-bar-fill.tight {
  background: #f59e0b;
}

.buffer-count {
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-mono);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.buffer-count.sufficient {
  color: var(--status-success);
}

.buffer-count.tight {
  color: #d97706;
}

.buffer-status-tag {
  font-size: 0.65rem;
  font-weight: 500;
  font-family: var(--font-body);
  color: var(--text-muted);
}

/* 机台状态区 */
.machine-status-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.finishing-status {
  grid-column: 1 / -1;
}

/* 底栏双列面板 */
.bottom-panels {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.25rem;
}

.panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.panel-title {
  font-size: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-icon-bubble {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
}

.panel-icon-bubble.red {
  background: #fee2e2;
  color: #ef4444;
}

.view-all-link {
  font-size: 0.85rem;
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

/* 预警表格 */
.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.625rem 0.875rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  border-bottom: 1px solid var(--border-light);
}

.data-table td {
  padding: 0.6rem 0.875rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.875rem;
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: var(--bg-hover);
}

.warning-row.critical td:first-child {
  border-left: 3px solid var(--status-error);
}

.warning-row.warning td:first-child {
  border-left: 3px solid #f59e0b;
}

.td-main-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.375rem;
}

.td-main {
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 0.1rem;
}

.td-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

/* ⑤ 急单标签 */
.urgent-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.3rem;
  white-space: nowrap;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.days-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

.days-badge.critical {
  background: var(--status-error-bg);
  color: var(--status-error);
}

.days-badge.warning {
  background: var(--status-warning-bg);
  color: #b45309;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.prog-bar {
  width: 64px;
  height: 6px;
  background: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
}

.prog-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.prog-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  white-space: nowrap;
}

.urgency-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.urgency-badge.critical {
  background: var(--status-error-bg);
  color: var(--status-error);
}

.urgency-badge.overdue {
  background: #fef3c7;
  color: #92400e;
}

.urgency-badge.high-risk {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.urgency-badge.warning {
  background: var(--status-warning-bg);
  color: #b45309;
}

/* 今日动态记录 */
.logs-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.log-item {
  display: flex;
  gap: 1rem;
  padding: 0.625rem 0;
  position: relative;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}

.log-item.log-urgent {
  background: #fffbeb;
  margin: 0 -0.5rem;
  padding: 0.625rem 0.5rem;
  border-radius: var(--radius-md);
}

.log-time {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  width: 40px;
  flex-shrink: 0;
  padding-top: 0.125rem;
}

.log-content-wrap {
  flex: 1;
  display: flex;
  gap: 0.75rem;
  position: relative;
}

.log-content-wrap::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 14px;
  bottom: -14px;
  width: 1px;
  background: var(--border-light);
  z-index: 1;
}

.log-item:last-child .log-content-wrap::before {
  display: none;
}

.log-bubble {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-medium);
  border: 2px solid var(--bg-surface);
  position: relative;
  z-index: 2;
  margin-top: 0.25rem;
  flex-shrink: 0;
}

/* 日志气泡颜色按类型区分 */
.log-bubble.urgent {
  background: #f59e0b;
}

.log-bubble.priority {
  background: #f59e0b;
}

.log-bubble.machine {
  background: var(--status-error);
}

.log-bubble.add {
  background: var(--status-success);
}

.log-bubble.status {
  background: var(--status-processing);
}

.log-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.log-text-row {
  display: flex;
  align-items: flex-start;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.log-urgent-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.05rem 0.3rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.log-text {
  font-size: 0.82rem;
  color: var(--text-main);
  line-height: 1.4;
}

.log-operator {
  font-size: 0.72rem;
  color: var(--text-muted);
}
</style>
