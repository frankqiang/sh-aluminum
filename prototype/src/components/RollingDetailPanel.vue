<template>
  <!-- 遮罩层 -->
  <Teleport to="body">
    <Transition name="panel-fade">
      <div v-if="visible" class="panel-overlay" @click="$emit('close')"></div>
    </Transition>
    <Transition name="panel-slide">
      <div v-if="visible" class="detail-panel" role="dialog" aria-modal="true">
        <!-- 面板头部 -->
        <div class="panel-header">
          <div class="panel-title" v-if="row">
            <Wrench :size="18" class="title-icon" />
            <span>轧机计划详情: {{ row.coilNo }} → {{ getMachineName(row.machineId) }}</span>
          </div>
          <div class="panel-title" v-else>
            <Wrench :size="18" class="title-icon" />
            <span>轧机计划详情</span>
          </div>
          <button class="close-btn" @click="$emit('close')" title="关闭">
            <X :size="20" />
          </button>
        </div>

        <div class="panel-body" v-if="row">
          <!-- 来料信息 -->
          <div class="section">
            <div class="section-title">
              <Package :size="14" class="section-icon" />来料信息
            </div>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">新神火卷号</span>
                <span class="info-value coil-no">{{ row.coilNo }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">坯料卷号</span>
                <span class="info-value mono">{{ row.blankCoilNo }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">批次</span>
                <span class="info-value mono">{{ row.batch }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">合金</span>
                <span class="info-value font-bold">{{ row.alloy }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">用途</span>
                <span class="usage-badge" :class="'usage-' + row.usage">{{ row.usage || '无' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">来料规格</span>
                <span class="info-value">
                  <span class="number">{{ row.inThickness }}</span><span class="unit">mm厚</span>
                  × <span class="number">{{ row.width }}</span><span class="unit">mm宽</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">客户</span>
                <span class="info-value">{{ row.customer || '（未指定）' }}</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 道次流转详情 -->
          <div class="section">
            <div class="section-title">
              <GitCommitVertical :size="14" class="section-icon" />道次流转详情
            </div>
            <table class="pass-table">
              <thead>
                <tr>
                  <th>道次</th>
                  <th>目标厚度</th>
                  <th>设备分配</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in row.passes" :key="p.n"
                    :class="{ 'pass-active': row.currentPasses.includes(p.n) }">
                  <td class="pass-n">P{{ p.n }}</td>
                  <td class="pass-t"><span class="number">{{ p.t }}</span><span class="unit">μm</span></td>
                  <td class="pass-machine">{{ getPassMachine(row, p.n) }}</td>
                  <td>
                    <span v-if="row.currentPasses.includes(p.n)" class="pass-status current">★ 当前</span>
                    <span v-else-if="isPastPass(row, p.n)" class="pass-status done">已完成</span>
                    <span v-else class="pass-status future">待安排</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="final-thickness-row">
              <span class="info-label">最终成品厚度</span>
              <span class="final-val">
                <span class="number">{{ row.finalThickness }}</span><span class="unit">μm</span>
              </span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 工艺说明 -->
          <div class="section">
            <div class="section-title">
              <FileText :size="14" class="section-icon" />工艺说明
            </div>
            <div class="remark-block" v-if="row.remark">
              {{ row.remark }}
            </div>
            <div class="empty-remark" v-else>无特殊说明</div>
          </div>

          <div class="divider"></div>

          <!-- 修改记录 -->
          <div class="section">
            <div class="section-title">
              <History :size="14" class="section-icon" />修改记录
            </div>
            <div class="log-list">
              <div class="log-item" v-for="(log, idx) in generateLogs(row)" :key="idx">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-user">{{ log.user }}</span>
                <span class="log-content">{{ log.content }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="panel-footer">
          <button class="footer-btn secondary" @click="$emit('close')">关闭</button>
          <button class="footer-btn primary">编辑计划</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { Wrench, X, Package, FileText, History, GitCommitVertical } from 'lucide-vue-next'
import { rollingMachines } from '../data/mock.js'

defineProps({
  visible: Boolean,
  row: Object,
})

defineEmits(['close'])

// 动态推算各道次的设备分配
function getPassMachine(row, passN) {
  // 1. 如果是当前机台负责的道次，明确显示该机台名称
  if (row.currentPasses && row.currentPasses.includes(passN)) {
    return getMachineName(row.machineId)
  }
  
  // 2. 如果是已经完成的过去道次，理论上应该显示当时的机台。
  // 原型里我们做个简单的合理推断：如果在中精轧阶段，那之前肯定经历了某台粗轧机。
  // 为了不突兀，显示确定的工序名即可。
  if (isPastPass(row, passN)) {
    if (passN <= 3) return '已结束 (粗轧)'
    if (passN === 4) return '已结束 (中轧)'
    return '已结束 (精轧)'
  }
  
  // 3. 将来的道次，显示“待分配到对应的工序组”
  if (passN <= 3) return '待分配粗轧'
  if (passN === 4) return '待分配中轧'
  if (passN >= 5) return '待分配精轧'
  
  return '待安排'
}

function getMachineName(machineId) {
  const m = rollingMachines.find(m => m.id === machineId)
  return m ? m.name : `${machineId}号机`
}

// 判断是否是已经过去的道次（比当前最小道次还早）
function isPastPass(row, passN) {
  if (!row.currentPasses || row.currentPasses.length === 0) return false
  return passN < Math.min(...row.currentPasses)
}

// 模拟生成与该排产记录相关的动态修改日志
function generateLogs(row) {
  if (!row) return []
  const logs = []
  
  // 第一条：创建记录
  logs.push({
    time: '2026-03-05 08:30',
    user: '系统',
    content: '通过订单下发自动生成初始计划'
  })

  // 如果有手动备注，生成一条修改记录
  if (row.remark && row.remark !== '-') {
    logs.push({
      time: '2026-03-05 09:15',
      user: '张计划',
      content: `添加工艺说明: "${row.remark}"`
    })
  }
  
  // 倒序排列，最新的在前面
  return logs.reverse()
}
</script>

<style scoped>
/* 遮罩 */
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 100;
}

/* 面板主体 */
.detail-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  max-width: 95vw;
  height: 100vh;
  background: var(--bg-surface);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  z-index: 101;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border-light);
}

/* 过渡动画 */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.25s ease;
}
.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}

/* 头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-main);
  flex-shrink: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
}

.title-icon {
  color: var(--primary-color);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  transition: background-color 0.2s, color 0.2s;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* 内容区 */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.section {
  padding: 1.1rem 1.25rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.85rem;
}

.section-icon {
  color: var(--primary-color);
}

.divider {
  height: 1px;
  background-color: var(--border-light);
  margin: 0 1.25rem;
}

/* 信息网格 */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-label {
  font-size: 0.82rem;
  color: var(--text-muted);
  min-width: 80px;
  flex-shrink: 0;
}

.info-value {
  font-size: 0.88rem;
  color: var(--text-main);
  font-weight: 500;
}

.info-value.coil-no {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--primary-color);
  font-size: 0.95rem;
}

.info-value.mono {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.font-bold { font-weight: 700; }

/* 用途标签 */
.usage-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}
.usage-电 { background-color: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
.usage-药 { background-color: #dbeafe; color: #2563eb; border: 1px solid #93c5fd; }
.usage-食 { background-color: #fef08a; color: #ca8a04; border: 1px solid #fde047; }
.usage-双零 { background-color: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; }
.usage-无 { background-color: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }

/* 道次表格 */
.pass-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.pass-table th {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-main);
}

.pass-table td {
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-main);
}

.pass-table tr:last-child td {
  border-bottom: none;
}

.pass-table tr.pass-active {
  background-color: var(--primary-light);
}

.pass-n {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--primary-color);
}

.pass-t .number {
  font-family: var(--font-mono);
  font-weight: 600;
}

.pass-machine {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.pass-status {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
}
.pass-status.current { background: #dbeafe; color: var(--primary-color); }
.pass-status.done { background: var(--status-success-bg); color: var(--status-success); }
.pass-status.future { background: var(--bg-main); color: var(--text-muted); border: 1px solid var(--border-light); }

.final-thickness-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-main);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-medium);
}

.final-val .number {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1rem;
  color: var(--primary-color);
}

.number {
  font-family: var(--font-mono);
  font-weight: 500;
}

.unit {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-left: 2px;
}

/* 工艺说明 */
.remark-block {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.7;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  white-space: pre-wrap;
}

.empty-remark {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

/* 修改记录 */
.log-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.83rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border-light);
}

.log-time {
  font-family: var(--font-mono);
  color: var(--text-muted);
  font-size: 0.78rem;
  flex-shrink: 0;
}

.log-user {
  color: var(--primary-color);
  font-weight: 600;
  flex-shrink: 0;
}

.log-content {
  color: var(--text-secondary);
  flex: 1;
}

/* 底部按钮 */
.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-light);
  background: var(--bg-main);
  flex-shrink: 0;
}

.footer-btn {
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-btn.secondary {
  background: var(--bg-surface);
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);
}

.footer-btn.secondary:hover {
  background: var(--bg-hover);
}

.footer-btn.primary {
  background: var(--primary-color);
  color: white;
}

.footer-btn.primary:hover {
  background: var(--primary-hover);
}
</style>
