<template>
  <div class="dashboard-container">
    <div class="dashboard-header-bar">
      <div>
        <h1 class="page-title">总览</h1>
        <p class="page-subtitle">2026年3月5日 星期四 · 实时全厂生产与排产负荷一览</p>
      </div>

      <div class="date-switcher">
        <button class="date-btn"><ChevronLeft :size="16" /></button>
        <span class="current-date">今天 (03-05)</span>
        <button class="date-btn"><ChevronRight :size="16" /></button>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 统计卡片区 -->
      <div class="stats-grid">
        <StatCard 
          title="轧机排产计划" 
          theme="blue"
          :mainValue="dashboardStats.rolling.planned"
          mainLabel="总计划卷数"
          :total="dashboardStats.rolling.planned"
          :completed="dashboardStats.rolling.completed"
          :running="dashboardStats.rolling.running"
          :waiting="dashboardStats.rolling.waiting"
        >
          <template #icon><Cpu :size="20" /></template>
        </StatCard>

        <StatCard 
          title="分切排产计划" 
          theme="purple"
          :mainValue="dashboardStats.slitting.planned"
          mainLabel="总计划方案数"
          :total="dashboardStats.slitting.planned"
          :completed="dashboardStats.slitting.completed"
          :running="dashboardStats.slitting.running"
          :waiting="dashboardStats.slitting.waiting"
        >
          <template #icon><Scissors :size="20" /></template>
        </StatCard>

        <StatCard 
          title="精切排产计划" 
          theme="green"
          :mainValue="dashboardStats.finishing.planned"
          mainLabel="总计划子卷数"
          :total="dashboardStats.finishing.planned"
          :completed="dashboardStats.finishing.completed"
          :running="dashboardStats.finishing.running"
          :waiting="dashboardStats.finishing.waiting"
        >
          <template #icon><Crosshair :size="20" /></template>
        </StatCard>

        <StatCard 
          title="在制品积压状态" 
          theme="orange"
          :mainValue="dashboardStats.wip.waitSlitting + dashboardStats.wip.waitFinishing"
          mainLabel="全厂积压卷"
          :hasProgress="false"
        >
          <template #icon><Boxes :size="20" /></template>
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
            </div>
          </template>
        </StatCard>
      </div>

      <!-- 机台状态条 -->
      <div class="machine-status-section">
        <MachineStatusBar title="轧机设备实时状态 (14台)" :machines="rollingMachines" :plans="rollingPlans" coilField="coilNo" />
        <MachineStatusBar title="分切设备实时状态 (14台)" :machines="slittingMachines" :plans="slittingPlans" coilField="motherCoilNo" />
        <MachineStatusBar class="finishing-status" title="精切设备实时状态 (49台)" :machines="finishingMachines" :plans="finishingPlans" coilField="childCoilNo" />
      </div>

      <!-- 底部双列区 -->
      <div class="bottom-panels">
        <!-- 逾期预警 -->
        <div class="panel warning-panel">
          <div class="panel-header">
            <h3 class="panel-title">⚠️ 近期交付订单预警</h3>
            <button class="view-all">查看全部</button>
          </div>
          <div class="panel-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>订单号/客户</th>
                  <th>规格/产品</th>
                  <th>进度</th>
                  <th>距离交期</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in sortOrders(orders).slice(0, 5)" :key="order.orderNo">
                  <td>
                    <div class="td-main">{{ order.orderNo }}</div>
                    <div class="td-sub">{{ order.customer }}</div>
                  </td>
                  <td>
                    <div class="td-main">{{ order.thickness }}×{{ order.width }} {{ order.product }}</div>
                    <div class="td-sub">{{ order.alloy }}</div>
                  </td>
                  <td>
                    <div class="progress-simple">
                      <div class="bar">
                        <div class="fill" :style="{ width: (order.completedQuantity / order.quantity * 100) + '%' }"></div>
                      </div>
                      <span class="text">{{ order.completedQuantity }}/{{ order.quantity }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['days-left', order.urgency]">剩 {{ order.daysLeft }} 天</span>
                  </td>
                  <td>
                    <span :class="['status-badge', order.urgency]">
                      {{ order.urgency === 'critical' ? '极度紧急' : order.urgency === 'warning' ? '预警' : '正常' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 修改记录 -->
        <div class="panel logs-panel">
          <div class="panel-header">
            <h3 class="panel-title">📝 今日动态记录</h3>
          </div>
          <div class="logs-list">
            <div class="log-item" v-for="log in changeLogs" :key="log.id">
              <div class="log-time">{{ log.time }}</div>
              <div class="log-content-wrap">
                <div class="log-bubble"></div>
                <div class="log-info">
                  <span class="log-text">{{ log.content }}</span>
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
import { 
  ChevronLeft, 
  ChevronRight, 
  Cpu, 
  Scissors, 
  Crosshair, 
  Boxes 
} from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import MachineStatusBar from '../components/MachineStatusBar.vue'

import { 
  dashboardStats, 
  rollingMachines, 
  slittingMachines, 
  finishingMachines,
  rollingPlans,
  slittingPlans,
  finishingPlans,
  orders, 
  changeLogs 
} from '../data/mock.js'

// 排序订单，紧急的在前面
const sortOrders = (orderList) => {
  const urgencyMap = { 'critical': 3, 'warning': 2, 'normal': 1 }
  return [...orderList].sort((a, b) => {
    return urgencyMap[b.urgency] - urgencyMap[a.urgency] || a.daysLeft - b.daysLeft
  })
}
</script>

<style scoped>
.dashboard-container {
  padding: 1.5rem;
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

.current-date {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0 1rem;
  color: var(--text-main);
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.wip-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.wip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
  border-bottom: 1px dashed var(--border-light);
}

.wip-item:last-child {
  border-bottom: none;
}

.wip-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.wip-value {
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

.wip-value.warning { color: #d97706; }
.wip-value.danger { color: var(--status-error); }

.machine-status-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.finishing-status {
  grid-column: 1 / -1;
}

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

.view-all {
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.panel-table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  border-bottom: 1px solid var(--border-light);
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.875rem;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.td-main {
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 0.125rem;
}

.td-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.progress-simple {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-simple .bar {
  width: 60px;
  height: 6px;
  background: var(--border-light);
  border-radius: 4px;
}

.progress-simple .fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 4px;
}

.progress-simple .text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.days-left {
  font-weight: 600;
  font-family: var(--font-mono);
}

.days-left.critical { color: var(--status-error); }
.days-left.warning { color: #d97706; }
.days-left.normal { color: var(--status-success); }

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.critical {
  background: var(--status-error-bg);
  color: var(--status-error);
}

.status-badge.warning {
  background: var(--status-warning-bg);
  color: #b45309;
}

.status-badge.normal {
  background: var(--status-success-bg);
  color: var(--status-success);
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.log-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  position: relative;
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
  bottom: -20px;
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
}

.log-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.log-text {
  font-size: 0.85rem;
  color: var(--text-main);
  line-height: 1.4;
}

.log-operator {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
