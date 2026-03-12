<template>
  <div class="execution-dashboard">
    <!-- 页面头部 -->
    <div class="page-header-bar">
      <div>
        <h1 class="page-title">订单看板</h1>
        <p class="page-subtitle">2026年3月9日 星期一 · 全厂订单执行状态总览</p>
      </div>
      <router-link to="/execution/orders" class="btn-view-all">
        <PhListBullets :size="16" weight="bold" />
        查看全部订单
      </router-link>
    </div>

    <!-- 统计卡片区（6张，3列×2行） -->
    <div class="stats-grid">
      <!-- 今日活跃订单 -->
      <!-- 在制订单总览：主值=生产中，附展示待排产/待包装数量，方便计划员快速掌握在制全貌 -->
      <StatCard title="在制订单总览" theme="blue" :mainValue="executionStats.activeOrders" mainLabel="生产中订单数" :hasProgress="false">
        <template #icon><PhLightning :size="22" weight="fill" /></template>
        <template #body>
          <div class="card-body-row">
            <span class="body-label">待排产</span>
            <span class="body-value">{{ statusDistribution.pending }}</span>
          </div>
          <div class="card-body-row">
            <span class="body-label">待包装</span>
            <span class="body-value">{{ statusDistribution.packing }}</span>
          </div>
        </template>
      </StatCard>

      <!-- 逾期订单 -->
      <StatCard title="逾期订单" theme="orange" :mainValue="executionStats.overdueOrders" mainLabel="已超出交期" :hasProgress="false">
        <template #icon><PhWarningOctagon :size="22" weight="fill" /></template>
        <template #body>
          <div v-if="executionStats.overdueOrders > 0" class="overdue-tip">
            <span class="overdue-dot"></span>
            需立即处理，请联系计划员
          </div>
          <div v-else class="ok-tip">
            <PhCheckCircle :size="16" weight="fill" />
            暂无逾期订单
          </div>
        </template>
      </StatCard>


      <!-- 3天内到期 -->
      <StatCard title="即将到期" theme="orange" :mainValue="executionStats.dueSoon" mainLabel="3天内交期" :hasProgress="false">
        <template #icon><PhTimer :size="22" weight="fill" /></template>
        <template #body>
          <div class="card-body-row">
            <span class="body-label">今明两日</span>
            <span class="body-value warning">{{ deliveryWarnings.filter(o => o.daysUntilDelivery <= 1 && o.daysUntilDelivery >= 0).length }}</span>
          </div>
          <div class="card-body-row">
            <span class="body-label">后天</span>
            <span class="body-value">{{ deliveryWarnings.filter(o => o.daysUntilDelivery === 2).length }}</span>
          </div>
        </template>
      </StatCard>

      <!-- 准时完成率 -->
      <StatCard title="订单准时率" theme="green" :mainValue="executionStats.onTimeRate + '%'" mainLabel="本月已完成" :hasProgress="false">
        <template #icon><PhTrendUp :size="22" weight="fill" /></template>
        <template #body>
          <div class="rate-bar-wrap">
            <div class="rate-bar">
              <div class="rate-fill" :style="{ width: executionStats.onTimeRate + '%' }"></div>
            </div>
            <span class="rate-text">{{ executionStats.onTimeRate }}%</span>
          </div>
          <div class="card-body-row" style="margin-top:0.25rem">
            <span class="body-label">已完成订单</span>
            <span class="body-value">{{ executionStats.completedThisMonth }}</span>
          </div>
        </template>
      </StatCard>

      <!-- 本月已完成 -->
      <StatCard title="本月已完成" theme="green" :mainValue="executionStats.completedThisMonth" mainLabel="已完成订单数" :hasProgress="false">
        <template #icon><PhPackage :size="22" weight="fill" /></template>
        <template #body>
          <div class="card-body-row">
            <span class="body-label">总重量</span>
            <span class="body-value">{{ (200000 / 1000).toFixed(0) }} 吨</span>
          </div>
          <div class="card-body-row">
            <span class="body-label">已汇报ERP</span>
            <span class="body-value">{{ executionStats.completedThisMonth }}</span>
          </div>
        </template>
      </StatCard>

      <!-- 生产中订单 -->
      <StatCard title="生产中订单" theme="purple" :mainValue="executionStats.producingOrders" mainLabel="订单进行中" :hasProgress="false">
        <template #icon><PhGear :size="22" weight="fill" /></template>
        <template #body>
          <div class="card-body-row">
            <span class="body-label">关联料卷</span>
            <span class="body-value">{{ totalActiveCoils }}</span>
          </div>
          <div class="card-body-row">
            <span class="body-label">平均进度</span>
            <span class="body-value">{{ avgProgress }}%</span>
          </div>
        </template>
      </StatCard>
    </div>

    <!-- 图表区（双列） -->
    <div class="charts-grid">
      <!-- 左：订单状态分布（环形图） -->
      <div class="panel chart-panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-bubble blue"><PhChartDonut :size="16" weight="fill" /></span>
            订单状态分布
          </h3>
          <span class="panel-sub">共 {{ totalOrders }} 张订单</span>
        </div>
        <div class="doughnut-wrap">
          <div class="doughnut-chart-area">
            <Doughnut :data="doughnutData" :options="doughnutOptions" />
            <div class="doughnut-center">
              <span class="center-num">{{ totalOrders }}</span>
              <span class="center-label">总订单</span>
            </div>
          </div>
          <div class="doughnut-legend">
            <div class="legend-item" v-for="item in statusLegend" :key="item.label">
              <span class="legend-dot" :style="{ background: item.color }"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：工序维度分布（堆叠横向柱状图） -->
      <div class="panel chart-panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-bubble purple"><PhFactory :size="16" weight="fill" /></span>
            工序订单分布
          </h3>
          <span class="panel-sub">关联料卷统计</span>
        </div>
        <div class="bar-chart-wrap">
          <Bar :data="barData" :options="barOptions" />
        </div>
      </div>
    </div>

    <!-- 交期预警列表（全宽） -->
    <div class="panel warning-panel">
      <div class="panel-header">
        <h3 class="panel-title">
          <span class="panel-icon-bubble red"><PhSiren :size="16" weight="fill" /></span>
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
              <th>紧急等级</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in deliveryWarnings.slice(0, 8)"
              :key="order.id"
              :class="['warning-row', order.urgencyLevel]"
              style="cursor: pointer;"
              @click="router.push(`/execution/orders/${order.id}`)"
            >
              <td>
                <div class="td-main">{{ order.orderNo }}</div>
                <div class="td-sub">{{ order.contractNo }}</div>
              </td>
              <td>{{ order.customer }}</td>
              <td>
                <div class="td-main">{{ order.thickness }}×{{ order.width }}</div>
                <div class="td-sub">{{ order.product }}</div>
              </td>
              <td>{{ order.deliveryDate }}</td>
              <td>
                <span :class="['days-badge', order.urgencyLevel]">
                  {{ order.isOverdue ? `逾期 ${Math.abs(order.daysUntilDelivery)} 天` : `剩 ${order.daysUntilDelivery} 天` }}
                </span>
              </td>
              <td>
                <div class="progress-cell">
                  <div class="prog-bar">
                    <div class="prog-fill" :style="{ width: order.progressPct + '%', background: order.urgencyLevel === 'critical' ? 'var(--status-error)' : '#f59e0b' }"></div>
                  </div>
                  <span class="prog-text">{{ order.completedCoils }}/{{ order.totalCoils }}</span>
                </div>
              </td>
          <!-- 紧急等级（综合进度风险） -->
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

    <!-- 底部双列区 -->
    <div class="bottom-grid">
      <!-- 左：客户维度汇总 -->
      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-bubble teal"><PhUsers :size="16" weight="fill" /></span>
            客户订单分布
          </h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>客户</th>
              <th>总订单</th>
              <th>进行中</th>
              <th>已完成</th>
              <th>逾期</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in customerSummary" :key="row.customer">
              <td class="customer-name">{{ row.customer }}</td>
              <td>{{ row.total }}</td>
              <td>{{ row.producing }}</td>
              <td>{{ row.completed }}</td>
              <td :class="{ 'overdue-num': row.overdue > 0 }">{{ row.overdue || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 右：近期完成订单 -->
      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="panel-icon-bubble green"><PhCheckSquare :size="16" weight="fill" /></span>
            近期完成
          </h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>客户</th>
              <th>规格</th>
              <th>完成时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentCompleted" :key="order.orderNo">
              <td>
                <div class="td-main order-no-full">{{ order.orderNo }}</div>
              </td>
              <td>{{ order.customer }}</td>
              <td>
                <div class="td-main">{{ order.spec }} μm×mm</div>
                <div class="td-sub">{{ order.alloy }} · {{ order.totalCoils }} 卷</div>
              </td>
              <td class="comp-time">{{ formatTime(order.completedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhLightning, PhWarningOctagon, PhTimer, PhTrendUp,
  PhPackage, PhGear, PhListBullets, PhCheckCircle,
  PhChartDonut, PhFactory, PhSiren, PhUsers, PhCheckSquare
} from '@phosphor-icons/vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale
} from 'chart.js'

import StatCard from '../components/StatCard.vue'
import {
  executionStats,
  statusDistribution,
  processDistribution,
  customerSummary,
  recentCompleted,
  deliveryWarnings,
} from '../data/execution/stats.js'
import { fullOrders } from '../data/execution/index.js'

const router = useRouter()

// 注册 Chart.js 组件
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// ── 综合风险等级（交期 + 进度双维度）───────────────────────────
// 返回 badge class：critical / overdue / high-risk / warning
function riskLevel(order) {
  const pct = order.totalCoils > 0 ? order.completedCoils / order.totalCoils : 0
  if (order.isOverdue && pct < 0.7)  return 'critical'    // 逾期且进度不足70%
  if (order.isOverdue)               return 'overdue'     // 逾期但进度尚可
  if (order.daysUntilDelivery <= 1 && pct < 0.6) return 'critical'  // 今明两日且进度<60%
  if (order.daysUntilDelivery <= 3 && pct < 0.3) return 'high-risk' // 3天内且进度<30%
  if (order.urgencyLevel === 'critical') return 'critical'
  return 'warning'
}

function riskLabel(order) {
  const level = riskLevel(order)
  if (level === 'critical')  return '极度紧急'
  if (level === 'overdue')   return '逾期可控'
  if (level === 'high-risk') return '进度滞后'
  return '预警'
}

const totalOrders = computed(() =>
  statusDistribution.pending + statusDistribution.producing +
  statusDistribution.packing + statusDistribution.completed
)

const totalActiveCoils = computed(() => {
  return fullOrders
    .filter(o => o.status === 'producing' || o.status === 'packing')
    .reduce((sum, o) => sum + (o.linkedCoils?.length || 0), 0)
})

const avgProgress = computed(() => {
  const producing = fullOrders.filter(o => o.status === 'producing')
  if (!producing.length) return 0
  const total = producing.reduce((sum, o) =>
    sum + (o.totalCoils > 0 ? o.completedCoils / o.totalCoils : 0), 0)
  return Math.round(total / producing.length * 100)
})

// ── 环形图配置 ────────────────────────────────────────────────
const STATUS_COLORS = ['#94a3b8', '#3b82f6', '#a855f7', '#22c55e']

const doughnutData = computed(() => ({
  labels: ['待排产', '生产中', '待包装', '已完成'],
  datasets: [{
    data: [
      statusDistribution.pending,
      statusDistribution.producing,
      statusDistribution.packing,
      statusDistribution.completed,
    ],
    backgroundColor: STATUS_COLORS,
    borderWidth: 2,
    borderColor: '#ffffff',
    hoverOffset: 6,
  }],
}))

const doughnutOptions = {
  cutout: '68%',
  plugins: { legend: { display: false }, tooltip: { callbacks: {
    label: ctx => ` ${ctx.label}: ${ctx.raw} 张`
  }}},
  responsive: true,
  maintainAspectRatio: false,
}

const statusLegend = [
  { label: '待排产', color: STATUS_COLORS[0], value: statusDistribution.pending },
  { label: '生产中', color: STATUS_COLORS[1], value: statusDistribution.producing },
  { label: '待包装', color: STATUS_COLORS[2], value: statusDistribution.packing },
  { label: '已完成', color: STATUS_COLORS[3], value: statusDistribution.completed },
]

// ── 柱状图配置 ────────────────────────────────────────────────
const barData = computed(() => ({
  labels: ['轧机', '分切', '精切'],
  datasets: [
    {
      label: '进行中',
      data: [
        processDistribution.rolling.active,
        processDistribution.slitting.active,
        processDistribution.finishing.active,
      ],
      backgroundColor: '#3b82f6',
      borderRadius: 4,
    },
    {
      label: '已完成',
      data: [
        processDistribution.rolling.completed,
        processDistribution.slitting.completed,
        processDistribution.finishing.completed,
      ],
      backgroundColor: '#22c55e',
      borderRadius: 4,
    },
  ],
}))

const barOptions = {
  indexAxis: 'y',
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } } },
  scales: {
    x: { stacked: false, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
    y: { stacked: false, grid: { display: false }, ticks: { font: { size: 12 } } },
  },
  responsive: true,
  maintainAspectRatio: false,
}

// ── 工具函数 ─────────────────────────────────────────────────
const formatTime = (dt) => {
  if (!dt) return '—'
  const d = new Date(dt.replace(' ', 'T'))
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${min}`
}
</script>

<style scoped>
/* ── 页面布局 ─────────────────────────── */
.execution-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header-bar {
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

.btn-view-all {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-view-all:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

/* ── 统计卡片区 ──────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

/* 卡片内自定义内容 */
.card-body-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
  border-bottom: 1px dashed var(--border-light);
}
.card-body-row:last-child { border-bottom: none; }

.body-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.body-value {
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-main);
}
.body-value.warning { color: #d97706; }

/* 逾期提示 */
.overdue-tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--status-error);
  font-weight: 500;
  padding: 0.5rem 0;
}
.overdue-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--status-error);
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.ok-tip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--status-success);
  padding: 0.5rem 0;
}

/* 准时率进度条 */
.rate-bar-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.rate-bar {
  flex: 1;
  height: 8px;
  background: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
}
.rate-fill {
  height: 100%;
  background: var(--status-success);
  border-radius: 4px;
  transition: width 0.6s ease;
}
.rate-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--status-success);
  font-family: var(--font-mono);
  width: 36px;
  text-align: right;
}

/* ── 图表区 ──────────────────────────── */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.chart-panel {
  min-height: 280px;
}

.doughnut-wrap {
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 200px;
}

.doughnut-chart-area {
  position: relative;
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}

.doughnut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.center-num {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: var(--font-display);
  line-height: 1;
  color: var(--text-main);
}

.center-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.doughnut-legend {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  /* 不使用 flex:1，避免把 legend-value 推到最右侧 */
  /* 所有状态标签均为3个汉字，min-width 保持对齐 */
  min-width: 3.6rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.legend-value {
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-main);
}

.bar-chart-wrap {
  height: 200px;
}

/* ── 通用面板 ────────────────────────── */
.panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
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
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 面板标题图标气泡 */
.panel-icon-bubble {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
}
.panel-icon-bubble.blue   { background: #eff6ff; color: #2563eb; }
.panel-icon-bubble.purple { background: #faf5ff; color: #9333ea; }
.panel-icon-bubble.red    { background: #fee2e2; color: #ef4444; }
.panel-icon-bubble.teal   { background: #f0fdfa; color: #0d9488; }
.panel-icon-bubble.green  { background: #f0fdf4; color: #16a34a; }

.panel-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.view-all-link {
  font-size: 0.85rem;
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
}
.view-all-link:hover { text-decoration: underline; }

/* ── 预警表格 ────────────────────────── */
.table-wrap { overflow-x: auto; }

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
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.875rem;
  vertical-align: middle;
}

.data-table tbody tr:last-child td { border-bottom: none; }

.data-table tbody tr:hover { background: var(--bg-hover); }

/* 预警行左边框 */
.warning-row.critical td:first-child {
  border-left: 3px solid var(--status-error);
}
.warning-row.warning td:first-child {
  border-left: 3px solid #f59e0b;
}

.td-main { font-weight: 500; color: var(--text-main); }
.td-sub  { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem; }

.days-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-mono);
}
.days-badge.critical { background: var(--status-error-bg); color: var(--status-error); }
.days-badge.warning  { background: var(--status-warning-bg); color: #b45309; }

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
.urgency-badge.critical   { background: var(--status-error-bg);   color: var(--status-error); }
.urgency-badge.overdue    { background: #fef3c7; color: #92400e; }
.urgency-badge.high-risk  { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.urgency-badge.warning    { background: var(--status-warning-bg); color: #b45309; }

/* ── 底部双列 ────────────────────────── */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.customer-name { font-weight: 500; color: var(--text-main); }
.overdue-num   { color: var(--status-error); font-weight: 700; font-family: var(--font-mono); }
.order-no      { font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-secondary); }
/* 近期完成 — 订单号不截断，全显但字号缩小增加可读性 */
.order-no-full { font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-secondary); letter-spacing: 0; }
.comp-time     { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); }
</style>
