<template>
  <div class="mat-dash">
    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">在制品看板</h1>
        <p class="page-subtitle">2026年3月9日 · 全厂在制品实时状态概览</p>
      </div>
      <router-link to="/material/location" class="btn-secondary">
        <MapPin :size="14" />
        查看库位地图
      </router-link>
    </div>

    <!-- 统计卡片行（7个） -->
    <div class="stats-row">
      <div class="stat-card" v-for="card in statCards" :key="card.key">
        <div class="stat-icon" :style="{ background: card.bg, color: card.color }">
          <component :is="card.icon" :size="18" />
        </div>
        <div class="stat-body">
          <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <!-- 工序流转管道图（SVG 分叉式） -->
    <div class="panel pipeline-panel">
      <div class="panel-header">
        <h3 class="panel-title">
          <GitBranch :size="15" />
          工序流转状态
        </h3>
        <span class="panel-hint">点击节点跳转库位地图</span>
      </div>
      <div class="pipeline-svg-wrap">
        <!--
          viewBox: 1200 x 155
          主节点 y=100, r=22  → 圆底边 122, 计数 138, 名称 152
          退火节点 y=28,  r=20  → 圆底边  48, 计数  64, 名称  78, tag 82-97
          “双零箔”标签 y=12  （弧线最高点 y≈9 上方）
          “电池箔”标签 y=116 （主线 y=100 下方）
          “仅双零箔” tag    y=82-97（退火节点底部）
          三者垂直不重叠：12 / 82-97 / 116
        -->
        <svg viewBox="0 0 1200 155" preserveAspectRatio="xMidYMid meet" class="pipeline-svg">
          <defs>
            <marker id="pm-gray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,1.5 L8,5 L0,8.5" fill="none" stroke="#94a3b8" stroke-width="2" />
            </marker>
            <marker id="pm-cyan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,1.5 L8,5 L0,8.5" fill="none" stroke="#06b6d4" stroke-width="2" />
            </marker>
            <marker id="pm-purple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,1.5 L8,5 L0,8.5" fill="none" stroke="#8b5cf6" stroke-width="2" />
            </marker>
            <marker id="pm-violet" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,1.5 L8,5 L0,8.5" fill="none" stroke="#a855f7" stroke-width="2" />
            </marker>
            <marker id="pm-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,1.5 L8,5 L0,8.5" fill="none" stroke="#10b981" stroke-width="2" />
            </marker>
          </defs>

          <!-- 主干线：胚料→轧机→分切 -->
          <path d="M 102,100 L 218,100" stroke="#94a3b8" stroke-width="2" fill="none" marker-end="url(#pm-gray)" />
          <path d="M 282,100 L 408,100" stroke="#06b6d4" stroke-width="2" fill="none" marker-end="url(#pm-cyan)" />

          <!-- 分切→精切（电池箔直达，实线）-->
          <path d="M 452,100 L 858,100" stroke="#8b5cf6" stroke-width="2" fill="none" marker-end="url(#pm-purple)" />
          <!-- “电池箔” 标签：靠精切一侧，与退火水平距离远 -->
          <text x="800" y="117" text-anchor="middle" fill="#8b5cf6" font-size="11" font-weight="500">电池箔</text>

          <!-- 分切→退火（双零箔，虚线）-->
          <!-- 弧形路径：从分切(430,78)弧到退火(700,28)，控制点使弧形平滑 -->
          <path d="M 447,80 C 447,25 620,5 680,28" stroke="#a855f7" stroke-width="1.8" fill="none"
            stroke-dasharray="6 4" marker-end="url(#pm-violet)" />
          <!-- “双零箔” 标签：弧线左中段上方，靠左不与退火重叠 -->
          <text x="530" y="13" text-anchor="middle" fill="#a855f7" font-size="11" font-weight="500">双零箔</text>

          <!-- 退火→精切（虚线）-->
          <path d="M 740,28 C 775,5 870,45 878,80" stroke="#a855f7" stroke-width="1.8" fill="none"
            stroke-dasharray="6 4" marker-end="url(#pm-violet)" />

          <!-- 精切→包装 -->
          <path d="M 922,100 L 1038,100" stroke="#10b981" stroke-width="2" fill="none" marker-end="url(#pm-green)" />

          <!-- 节点：用 v-for 渲染 -->
          <g v-for="node in pipelineNodes" :key="node.id" class="svg-node" :class="{ active: node.count > 0 }"
            @click="node.count > 0 && $router.push('/material/location')">
            <!-- 圆圈 -->
            <circle :cx="node.x" :cy="node.y" :r="node.r || 22" :fill="node.count > 0 ? node.activeBg : '#f1f5f9'"
              :stroke="node.count > 0 ? node.activeColor : '#e2e8f0'" stroke-width="2" />
            <!-- 图标（foreignObject）-->
            <foreignObject :x="node.x - 9" :y="node.y - 9" width="18" height="18">
              <div class="svg-icon" :style="{ color: node.count > 0 ? node.activeColor : '#94a3b8' }">
                <component :is="node.icon" :size="14" />
              </div>
            </foreignObject>
            <!-- 数字 -->
            <text :x="node.x" :y="node.y + (node.r || 22) + 14" text-anchor="middle" class="svg-count"
              :fill="node.count > 0 ? '#1e293b' : '#94a3b8'">{{ node.count }}</text>
            <!-- 名称 -->
            <text :x="node.x" :y="node.y + (node.r || 22) + 28" text-anchor="middle" class="svg-name">{{ node.name
            }}</text>
            <!-- 退火专用 tag：在名称下方，与主线标签很远 -->
            <g v-if="node.tag">
              <rect :x="node.x - 27" :y="node.y + (node.r || 22) + 32" width="54" height="15" rx="3"
                fill="rgba(168,85,247,0.12)" />
              <text :x="node.x" :y="node.y + (node.r || 22) + 43" text-anchor="middle" fill="#a855f7" font-size="9.5"
                font-weight="500">{{ node.tag }}</text>
            </g>
          </g>
        </svg>
      </div>
    </div>

    <!-- 新增行：业务维度概览（产品类型 | 质量等级 | 停留时间分布） -->
    <div class="dimension-row">
      <!-- 产品类型分布 -->
      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <Layers :size="15" />
            产品类型分布
          </h3>
        </div>
        <div class="chart-with-legend">
          <div class="chart-area">
            <Doughnut :data="productTypeChartData" :options="doughnutNoLegend" />
          </div>
          <div class="chart-legend">
            <div class="legend-row" v-for="item in productTypeLegend" :key="item.label">
              <span class="legend-dot" :style="{ background: item.color }"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ item.value }} 卷</span>
              <span class="legend-pct">{{ item.pct }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 质量等级分布 -->
      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <Shield :size="15" />
            质量等级分布
          </h3>
        </div>
        <div class="chart-with-legend">
          <div class="chart-area">
            <Doughnut :data="gradeChartData" :options="doughnutNoLegend" />
          </div>
          <div class="chart-legend">
            <div class="legend-row" v-for="item in gradeLegend" :key="item.label">
              <span class="legend-dot" :style="{ background: item.color }"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ item.value }} 卷</span>
              <span class="legend-pct">{{ item.pct }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 停留时间分布 -->
      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <Clock :size="15" />
            停留时间分布
          </h3>
        </div>
        <div class="chart-wrapper">
          <Bar :data="daysChartData" :options="barOptions" />
        </div>
      </div>
    </div>

    <!-- 底部行：三列并排（保持原有） -->
    <div class="bottom-row">
      <!-- 各区在制品分布条形图 -->
      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <BarChart2 :size="15" />
            各区在制品分布
          </h3>
        </div>
        <div class="zone-bars">
          <div class="zone-bar-item" v-for="zone in zoneDistribution" :key="zone.id">
            <div class="zone-bar-label">
              <span class="zone-name">{{ zone.name }}</span>
              <span class="zone-count">{{ zone.count }} 卷</span>
            </div>
            <div class="zone-bar-track">
              <div class="zone-bar-fill" :style="{
                width: (zone.count / maxZoneCount * 100) + '%',
                background: zone.color
              }"></div>
            </div>
            <div class="zone-bar-sub">
              <span class="zone-sub-item" v-for="sub in zone.breakdown" :key="sub.label">
                <span class="dot" :style="{ background: sub.color }"></span>
                {{ sub.label }}: {{ sub.count }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 呆滞预警列表 -->
      <div class="panel stale-panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <AlertTriangle :size="15" />
            呆滞预警
          </h3>
          <router-link to="/material/coils" class="view-all">查看全部</router-link>
        </div>
        <div class="stale-list">
          <div v-for="coil in staleCoils" :key="coil.id" class="stale-item" :class="coil.level"
            @click="$router.push('/material/coils')">
            <div class="stale-left">
              <div class="stale-bar" :style="{ background: coil.barColor }"></div>
              <div class="stale-info">
                <div class="stale-coilno">{{ coil.coilNo }}</div>
                <div class="stale-meta">{{ coil.zone }} · {{ coil.row }}-{{ coil.col }} · {{ coil.customer }}</div>
              </div>
            </div>
            <div class="stale-right">
              <div class="stale-days" :style="{ color: coil.barColor }">{{ coil.daysStayed }}天</div>
              <div class="stale-status" :style="{ color: coil.barColor }">{{ coil.levelLabel }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近流转记录 -->
      <div class="panel movement-panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <ArrowRightLeft :size="15" />
            最近流转记录
          </h3>
          <span class="panel-hint">今日 {{ todayMovements }} 条</span>
        </div>
        <div class="movement-list">
          <div class="movement-item" v-for="mv in recentMovements.slice(0, 8)" :key="mv.id">
            <div class="mv-time">{{ mv.time.slice(11) }}</div>
            <div class="mv-dot" :class="mv.action"></div>
            <div class="mv-content">
              <div class="mv-coil">{{ mv.coilNo }}</div>
              <div class="mv-detail">
                <span class="mv-action-badge" :class="mv.action">{{ mv.action }}</span>
                {{ mv.fromZone }} → {{ mv.toZone }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, markRaw } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js'

import {
  MapPin, GitBranch, BarChart2, AlertTriangle,
  ArrowRightLeft, Layers, Shield, Clock,
  Warehouse, Cpu, Scissors, Flame, Target, Package,
  ClipboardCheck,
} from 'lucide-vue-next'

import { materialStats, recentMovements, materialCoils, staleThresholds } from '../data/material/index.js'

// 注册 chart.js 组件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

// ─── 统计卡片数据（7个） ──────────────────────────────────────────────
const statCards = [
  { key: 'total', label: '在制品总数', value: materialStats.total, icon: markRaw(Warehouse), color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { key: 'flow', label: '今日流转', value: materialStats.todayFlow, icon: markRaw(ArrowRightLeft), color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { key: 'wait-slit', label: '待分切', value: materialStats.waitSlitting, icon: markRaw(Scissors), color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { key: 'wait-fin', label: '待精切', value: materialStats.waitFinishing, icon: markRaw(Target), color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { key: 'wait-review', label: '质检/待审', value: materialStats.waitReview, icon: markRaw(ClipboardCheck), color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  { key: 'overdue', label: '超7天未动', value: materialStats.overdueCount, icon: markRaw(AlertTriangle), color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { key: 'stale', label: '呆滞预警', value: materialStats.staleCount, icon: markRaw(Package), color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
]

// ─── SVG 管道图节点数据 ──────────────────────────────────────────────
// viewBox 1200 x 155：主节点 y=100, r=22；退火 y=28, r=20
// 标签垂直分布："双零箔" y=11 / "仅双零箔"tag y=82-97 / "电池箔" y=117 不重叠
const pipelineNodes = [
  { id: 'billet', name: '胚料', count: 0, x: 80, y: 100, r: 22, icon: markRaw(Warehouse), activeBg: 'rgba(59,130,246,0.08)', activeColor: '#3b82f6' },
  { id: 'rolling', name: '轧机', count: 12, x: 250, y: 100, r: 22, icon: markRaw(Cpu), activeBg: 'rgba(6,182,212,0.1)', activeColor: '#06b6d4' },
  { id: 'slitting', name: '分切', count: 25, x: 430, y: 100, r: 22, icon: markRaw(Scissors), activeBg: 'rgba(139,92,246,0.1)', activeColor: '#8b5cf6' },
  { id: 'annealing', name: '退火', count: 0, x: 710, y: 28, r: 20, icon: markRaw(Flame), activeBg: 'rgba(168,85,247,0.1)', activeColor: '#a855f7', tag: '仅双零箔' },
  { id: 'finishing', name: '精切', count: 10, x: 900, y: 100, r: 22, icon: markRaw(Target), activeBg: 'rgba(16,185,129,0.1)', activeColor: '#10b981' },
  { id: 'packaging', name: '包装', count: 0, x: 1100, y: 100, r: 22, icon: markRaw(Package), activeBg: 'rgba(249,115,22,0.1)', activeColor: '#f97316' },
]

// ─── 业务维度图表数据 ──────────────────────────────────────────────────

// 产品类型分布
const productTypeStats = computed(() => {
  const battery = materialCoils.filter(c => c.productType === '电池箔').length
  const doubleZero = materialCoils.filter(c => c.productType === '双零箔').length
  return { battery, doubleZero }
})

const productTypeChartData = computed(() => ({
  labels: ['电池箔', '双零箔'],
  datasets: [{
    data: [productTypeStats.value.battery, productTypeStats.value.doubleZero],
    backgroundColor: ['#3b82f6', '#f59e0b'],
    borderWidth: 0,
    hoverOffset: 6,
  }],
}))

// 质量等级分布
const gradeStats = computed(() => {
  const grade1 = materialCoils.filter(c => c.reviewInfo?.grade === '一级品').length
  const grade2 = materialCoils.filter(c => c.reviewInfo?.grade === '二级品').length
  const pending = materialCoils.filter(c => c.reviewInfo?.grade === '-' || !c.reviewInfo?.grade).length
  return { grade1, grade2, pending }
})

const gradeChartData = computed(() => ({
  labels: ['一级品', '二级品', '质检中'],
  datasets: [{
    data: [gradeStats.value.grade1, gradeStats.value.grade2, gradeStats.value.pending],
    backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
    borderWidth: 0,
    hoverOffset: 6,
  }],
}))

// 停留时间分布
const daysStats = computed(() => {
  const lt3 = materialCoils.filter(c => c.daysStayed < 3).length
  const d3to7 = materialCoils.filter(c => c.daysStayed >= 3 && c.daysStayed < 7).length
  const d7to14 = materialCoils.filter(c => c.daysStayed >= 7 && c.daysStayed < 14).length
  const gt14 = materialCoils.filter(c => c.daysStayed >= 14).length
  return { lt3, d3to7, d7to14, gt14 }
})

const daysChartData = computed(() => ({
  labels: ['<3天', '3-7天', '7-14天', '>14天'],
  datasets: [{
    label: '料卷数',
    data: [daysStats.value.lt3, daysStats.value.d3to7, daysStats.value.d7to14, daysStats.value.gt14],
    backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
    borderRadius: 6,
    barThickness: 36,
  }],
}))

// 自定义图例数据（带数值和百分比）
const productTypeLegend = computed(() => {
  const { battery, doubleZero } = productTypeStats.value
  const total = battery + doubleZero || 1
  return [
    { label: '电池箔', value: battery, pct: (battery / total * 100).toFixed(1), color: '#3b82f6' },
    { label: '双零箔', value: doubleZero, pct: (doubleZero / total * 100).toFixed(1), color: '#f59e0b' },
  ]
})

const gradeLegend = computed(() => {
  const { grade1, grade2, pending } = gradeStats.value
  const total = grade1 + grade2 + pending || 1
  return [
    { label: '一级品', value: grade1, pct: (grade1 / total * 100).toFixed(1), color: '#10b981' },
    { label: '二级品', value: grade2, pct: (grade2 / total * 100).toFixed(1), color: '#ef4444' },
    { label: '质检中', value: pending, pct: (pending / total * 100).toFixed(1), color: '#f59e0b' },
  ]
})

// 图表配置（隐藏默认图例，用自定义HTML图例替代）
const doughnutNoLegend = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.raw} 卷`,
      },
    },
  },
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.raw} 卷`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 5,
        font: { size: 11 },
      },
      grid: { color: 'rgba(0,0,0,0.04)' },
    },
  },
}

// ─── 各区分布（保持原逻辑） ─────────────────────────────────────────
const zoneDistribution = computed(() => {
  const slittingCoils = materialCoils.filter(c => c.zone === 'slitting')
  const rollingCoils = materialCoils.filter(c => c.zone === 'rolling')
  const finishingCoils = materialCoils.filter(c => c.zone === 'finishing')
  const countByStatus = (coils, statuses) => coils.filter(c => statuses.includes(c.status)).length

  return [
    {
      id: 'slitting', name: '分切区', count: slittingCoils.length, color: '#8b5cf6',
      breakdown: [
        { label: '待精切', count: countByStatus(slittingCoils, ['slitting_reviewed', 'finishing_planned']), color: '#10b981' },
        { label: '质检中', count: countByStatus(slittingCoils, ['slitting_qc']), color: '#f59e0b' },
        { label: '超期', count: slittingCoils.filter(c => c.daysStayed >= staleThresholds.warning && c.daysStayed < staleThresholds.stale).length, color: '#f97316' },
        { label: '呆滞', count: slittingCoils.filter(c => c.daysStayed >= staleThresholds.stale).length, color: '#ef4444' },
      ],
    },
    {
      id: 'rolling', name: '轧机区', count: rollingCoils.length, color: '#3b82f6',
      breakdown: [
        { label: '待分切', count: countByStatus(rollingCoils, ['rolling_reviewed']), color: '#10b981' },
        { label: '质检中', count: countByStatus(rollingCoils, ['rolling_qc']), color: '#f59e0b' },
        { label: '已下料', count: countByStatus(rollingCoils, ['rolled']), color: '#94a3b8' },
      ],
    },
    {
      id: 'finishing', name: '精切区', count: finishingCoils.length, color: '#06b6d4',
      breakdown: [
        { label: '精切中', count: countByStatus(finishingCoils, ['finishing']), color: '#06b6d4' },
        { label: '待精切', count: countByStatus(finishingCoils, ['finishing_planned']), color: '#3b82f6' },
        { label: '质检中', count: countByStatus(finishingCoils, ['finishing_qc']), color: '#f59e0b' },
        { label: '待包装', count: countByStatus(finishingCoils, ['finishing_reviewed']), color: '#10b981' },
      ],
    },
  ]
})

const maxZoneCount = computed(() => Math.max(...zoneDistribution.value.map(z => z.count)))

// ─── 呆滞预警列表 ───────────────────────────────────────────────────
const staleCoils = computed(() => {
  const result = materialCoils
    .filter(c => c.daysStayed >= staleThresholds.warning)
    .map(c => {
      const isStale = c.daysStayed >= staleThresholds.stale
      return {
        ...c,
        zone: { slitting: '分切区', rolling: '轧机区', finishing: '精切区' }[c.zone] || c.zone,
        level: isStale ? 'stale' : 'overdue',
        levelLabel: isStale ? '呆滞' : '超期',
        barColor: isStale ? '#ef4444' : '#f97316',
      }
    })
    .sort((a, b) => b.daysStayed - a.daysStayed)
  return result.slice(0, 8)
})

// ─── 今日流转条数 ───────────────────────────────────────────────────
const todayMovements = computed(() =>
  recentMovements.filter(m => m.time.startsWith('2026-03-09')).length
)
</script>

<style scoped>
.mat-dash {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
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

.btn-secondary {
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

.btn-secondary:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
  background: var(--primary-light);
}

/* 统计卡片行（7列） */
.stats-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.85rem;
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 0.875rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: box-shadow 0.2s, transform 0.2s;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-mono);
  line-height: 1;
  margin-bottom: 0.15rem;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* ─── SVG 管道图 ─────────────────────────────────────── */
.pipeline-panel {
  width: 100%;
}

/* 固定面板高度，与统计卡片行进行视觉平衡 */
.pipeline-svg-wrap {
  width: 100%;
  height: 135px;
  overflow: hidden;
}

.pipeline-svg {
  width: 100%;
  height: 135px;
  display: block;
}

.svg-node {
  cursor: default;
}

.svg-node.active {
  cursor: pointer;
}

.svg-node.active circle {
  transition: all 0.2s;
}

.svg-node.active:hover circle {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.25));
  stroke-width: 3;
}

.svg-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.svg-count {
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-mono, 'SF Mono', monospace);
}

.svg-name {
  font-size: 13px;
  fill: #64748b;
  font-weight: 500;
}

/* ─── 图表自定义图例 ──────────────────────────────────────────── */
.chart-with-legend {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  min-height: 180px;
}

.chart-area {
  flex: 0 0 140px;
  height: 140px;
  position: relative;
}

.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.legend-row {
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
  font-size: 0.82rem;
  color: var(--text-main);
  font-weight: 500;
  min-width: 42px;
}

.legend-value {
  font-size: 0.85rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-main);
  min-width: 40px;
}

.legend-pct {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* ─── 业务维度行 ─────────────────────────────────────────────── */
.dimension-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.25rem;
}

.chart-wrapper {
  height: 200px;
  position: relative;
}

/* ─── 底部三列 ──────────────────────────────────────────────── */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

/* 通用 panel */
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
  margin-bottom: 1.1rem;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-main);
}

.panel-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.view-all {
  font-size: 0.8rem;
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

/* 条形图 */
.zone-bars {
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-around;
  gap: 0.5rem;
}

.zone-bar-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.zone-bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.zone-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-main);
}

.zone-count {
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.zone-bar-track {
  height: 10px;
  background: var(--bg-layout);
  border-radius: 6px;
  overflow: hidden;
}

.zone-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.zone-bar-sub {
  display: flex;
  gap: 0.875rem;
  flex-wrap: wrap;
}

.zone-sub-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 呆滞预警列表 */
.stale-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stale-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-md);
  background: var(--bg-layout);
  cursor: pointer;
  transition: background 0.15s;
}

.stale-item:hover {
  background: var(--bg-hover);
}

.stale-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.stale-bar {
  width: 3px;
  height: 32px;
  border-radius: 2px;
  flex-shrink: 0;
}

.stale-info {
  min-width: 0;
}

.stale-coilno {
  font-size: 0.82rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stale-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

.stale-right {
  text-align: right;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.stale-days {
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-mono);
  line-height: 1.2;
}

.stale-status {
  font-size: 0.7rem;
  font-weight: 500;
  margin-top: 0.1rem;
}

/* 流转记录 */
.movement-list {
  display: flex;
  flex-direction: column;
  position: relative;
}

.movement-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.55rem 0;
  position: relative;
}

.movement-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 53px;
  top: 26px;
  bottom: 0;
  width: 1px;
  background: var(--border-light);
}

.mv-time {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  width: 44px;
  flex-shrink: 0;
  padding-top: 0.15rem;
}

.mv-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.25rem;
  position: relative;
  z-index: 1;
}

.mv-dot.入库 {
  background: #10b981;
}

.mv-dot.出库 {
  background: #6366f1;
}

.mv-dot.领料 {
  background: #3b82f6;
}

.mv-dot.移库 {
  background: #f59e0b;
}

.mv-content {
  flex: 1;
  min-width: 0;
}

.mv-coil {
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mv-detail {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.mv-action-badge {
  padding: 0.05rem 0.35rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
}

.mv-action-badge.入库 {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.mv-action-badge.出库 {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}

.mv-action-badge.领料 {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.mv-action-badge.移库 {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}
</style>
