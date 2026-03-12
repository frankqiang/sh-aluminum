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
                <span class="info-label ml-auto">合金</span>
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
                <span class="info-label">重量</span>
                <span class="info-value">
                  <span class="number">{{ row.weight }}</span><span class="unit">kg</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">客户</span>
                <span class="info-value">{{ row.customer || '（未指定）' }}</span>
              </div>
              <div class="info-row" v-if="row.execOrderNo">
                <span class="info-label">执行单号</span>
                <span class="info-value mono" style="color:var(--primary-color);font-weight:600;">{{ row.execOrderNo
                  }}</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 质量评审（参照分切面板风格） -->
          <div class="section">
            <div class="section-title">
              <ClipboardCheck :size="14" class="section-icon" />质量评审
              <span class="review-status-label" :class="qualityStatusClass">
                {{ qualityStatusLabel }}
              </span>
            </div>

            <!-- 已有质量评审结果 -->
            <div v-if="row.qualityInfo" class="review-content">
              <div class="info-grid mb-3">
                <div class="info-row">
                  <span class="info-label">质量判定</span>
                  <span class="info-value conclusion-text"
                    :class="row.qualityInfo.judgment === '合格' ? 'text-success' : 'text-danger'">
                    {{ row.qualityInfo.judgment }}
                  </span>
                </div>
              </div>
              <!-- 评审信息（处置意见） -->
              <div class="instructions-wrapper" v-if="row.qualityInfo.reviewInfo">
                <div class="sub-title">评审信息:</div>
                <div class="review-info-text">{{ row.qualityInfo.reviewInfo }}</div>
              </div>
            </div>

            <!-- 未评审提示 -->
            <div v-else class="pending-warning-box">
              <AlertTriangle :size="16" class="warning-icon" />
              <span>轧制完成后将送检，评审结果影响后续分切安排</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 轧制方案（对应分切「切刀方案」） -->
          <div class="section">
            <div class="section-title">
              <SlidersHorizontal :size="14" class="section-icon" />轧制方案
            </div>

            <div v-if="row.rollingPlan" class="cutting-plan-content">
              <!-- 订单信息块（对应分切 orders-group） -->
              <div class="orders-group mb-4">
                <div class="order-info-block">
                  <div class="info-row" v-if="row.execOrderNo">
                    <span class="info-label">执行单号</span>
                    <span class="info-value order-no-display">{{ row.execOrderNo }}
                      <span class="customer-name" v-if="row.customer">{{ row.customer }}</span>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">订单规格</span>
                    <span class="info-value font-mono">{{ row.rollingPlan.spec }}</span>
                  </div>
                  <div class="info-row" v-if="row.rollingPlan.orderReq">
                    <span class="info-label">订单要求</span>
                    <span class="info-value">{{ row.rollingPlan.orderReq }}</span>
                  </div>
                </div>
              </div>

              <!-- 计划要求 -->
              <div v-if="row.rollingPlan.planNote" class="plan-note-block">
                <div class="sub-title">计划要求:</div>
                <div class="remark-block">{{ row.rollingPlan.planNote }}</div>
              </div>

              <!-- 质量评审批注（如有） -->
              <div v-if="row.rollingPlan.qualityReview" class="instructions-wrapper quality-note mt-3">
                <div class="sub-title">质量评审批注:</div>
                <div class="review-info-text">{{ row.rollingPlan.qualityReview }}</div>
              </div>
            </div>

            <div v-else class="empty-box">
              <span class="text-muted">暂未设置轧制方案</span>
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
                <tr v-for="p in row.passes" :key="p.n" :class="{ 'pass-active': row.currentPasses.includes(p.n) }">
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
            <div class="effective-width">
              <span class="info-label">最终成品厚度:</span>
              <span class="final-val">
                <span class="number">{{ row.finalThickness }}</span><span class="unit">μm</span>
              </span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 工艺备注（结构化标签） -->
          <div class="section" v-if="hasRemarkTags || (row.remark && row.remark !== '-')">
            <div class="section-title">
              <FileText :size="14" class="section-icon" />工艺备注
            </div>
            <div v-if="hasRemarkTags" class="remark-tags-grid">
              <div v-if="tagsByType.contact.length" class="tag-group">
                <div class="tag-group-title"><span class="tag-icon">📞</span>通知事项</div>
                <div class="tag-list">
                  <span v-for="(tag, idx) in tagsByType.contact" :key="idx" class="remark-tag contact">{{ tag.text
                    }}</span>
                </div>
              </div>
              <div v-if="tagsByType.quality.length" class="tag-group">
                <div class="tag-group-title"><span class="tag-icon">🔬</span>质量要求</div>
                <div class="tag-list">
                  <span v-for="(tag, idx) in tagsByType.quality" :key="idx" class="remark-tag quality">{{ tag.text
                    }}</span>
                </div>
              </div>
              <div v-if="tagsByType.process.length" class="tag-group">
                <div class="tag-group-title"><span class="tag-icon">⚙️</span>工艺要求</div>
                <div class="tag-list">
                  <span v-for="(tag, idx) in tagsByType.process" :key="idx" class="remark-tag process">{{ tag.text
                    }}</span>
                </div>
              </div>
              <div v-if="tagsByType.action.length" class="tag-group">
                <div class="tag-group-title"><span class="tag-icon">📋</span>操作指令</div>
                <div class="tag-list">
                  <span v-for="(tag, idx) in tagsByType.action" :key="idx" class="remark-tag action">{{ tag.text
                    }}</span>
                </div>
              </div>
              <div v-if="tagsByType.split.length" class="tag-group">
                <div class="tag-group-title"><span class="tag-icon">📦</span>分卷参考</div>
                <div class="tag-list">
                  <span v-for="(tag, idx) in tagsByType.split" :key="idx" class="remark-tag split">{{ tag.text }}</span>
                </div>
              </div>
            </div>
            <div class="remark-block" v-else-if="row.remark && row.remark !== '-'">
              {{ row.remark }}
            </div>
          </div>

          <div class="divider" v-if="hasRemarkTags || (row.remark && row.remark !== '-')"></div>

          <!-- 修改记录（对齐分切面板风格） -->
          <div class="section">
            <div class="section-title">
              <History :size="14" class="section-icon" />修改记录
            </div>
            <div class="log-list">
              <div class="log-item" v-for="(log, idx) in sortedLogs" :key="idx">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-user">{{ log.operator }}</span>
                <span class="log-content">
                  {{ log.detail }}
                  <span v-if="log.reason" class="log-reason">（{{ log.reason }}）</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作（对齐分切面板：关闭/删除/编辑） -->
        <div class="panel-footer">
          <button class="footer-btn secondary" @click="$emit('close')">关闭</button>
          <div class="right-actions">
            <button class="footer-btn danger-outline" @click="handleAction('删除计划')">删除</button>
            <button class="footer-btn primary" @click="handleAction('编辑计划')">编辑计划</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import {
  Wrench, X, Package, ClipboardCheck, SlidersHorizontal,
  FileText, History, GitCommitVertical, AlertTriangle
} from 'lucide-vue-next'
import { rollingMachines } from '../data/mock.js'

const props = defineProps({
  visible: Boolean,
  row: Object,
})

defineEmits(['close'])

// 质量状态
const qualityStatusClass = computed(() => {
  if (!props.row?.qualityInfo) return 'pending'
  return props.row.qualityInfo.judgment === '合格' ? 'reviewed' : 'none'
})

const qualityStatusLabel = computed(() => {
  if (!props.row?.qualityInfo) return '⏳ 待检验'
  return props.row.qualityInfo.judgment === '合格' ? '✅ 合格' : '❌ 不合格'
})

// 工艺标签按类型分组
const tagsByType = computed(() => {
  const tags = props.row?.remarkTags || []
  return {
    quality: tags.filter(t => t.type === 'quality'),
    process: tags.filter(t => t.type === 'process'),
    action: tags.filter(t => t.type === 'action'),
    contact: tags.filter(t => t.type === 'contact'),
    split: tags.filter(t => t.type === 'split'),
  }
})

const hasRemarkTags = computed(() => {
  return props.row?.remarkTags && props.row.remarkTags.length > 0
})

// 修改记录倒序
const sortedLogs = computed(() => {
  if (!props.row?.changeLog) return []
  return [...props.row.changeLog].reverse()
})

// 动态推算各道次的设备分配
function getPassMachine(row, passN) {
  if (row.currentPasses && row.currentPasses.includes(passN)) {
    return getMachineName(row.machineId)
  }
  if (isPastPass(row, passN)) {
    if (passN <= 3) return '已结束 (粗轧)'
    if (passN === 4) return '已结束 (中轧)'
    return '已结束 (精轧)'
  }
  if (passN <= 3) return '待分配粗轧'
  if (passN === 4) return '待分配中轧'
  if (passN >= 5) return '待分配精轧'
  return '待安排'
}

function getMachineName(machineId) {
  const m = rollingMachines.find(m => m.id === machineId)
  return m ? m.name : `${machineId}号机`
}

function isPastPass(row, passN) {
  if (!row.currentPasses || row.currentPasses.length === 0) return false
  return passN < Math.min(...row.currentPasses)
}

function handleAction(actionName) {
  alert(`触发操作: ${actionName} (功能开发中...)`)
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
  width: 440px;
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
  background: transparent;
  border: none;
  cursor: pointer;
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

/* 订单分块展示（对应分切 order-info-block） */
.orders-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-info-block {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.75rem;
  background-color: var(--bg-hover);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
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

.ml-auto {
  margin-left: auto;
  min-width: auto;
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

.font-bold {
  font-weight: 700;
}

.font-mono {
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

.number {
  font-family: var(--font-mono);
  font-weight: 500;
}

.unit {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0 2px;
}

.text-muted {
  color: var(--text-muted);
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

/* 用途标签 */
.usage-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.usage-电 {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.usage-药 {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #86efac;
}

.usage-食 {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #93c5fd;
}

.usage-双零 {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.usage-无 {
  background: var(--bg-main);
  color: var(--text-muted);
  border: 1px solid var(--border-light);
}

/* 质量评审专属样式（完全对齐分切面板） */
.review-status-label {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.review-status-label.reviewed {
  background: var(--status-success-bg);
  color: var(--status-success);
}

.review-status-label.none {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.review-status-label.pending {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.conclusion-text {
  font-weight: 700;
}

.text-success {
  color: var(--status-success);
}

.text-danger {
  color: #dc2626;
}

.sub-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.instructions-wrapper {
  background: var(--bg-main);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

.instructions-wrapper.quality-note {
  border-color: #fde68a;
  background: #fffbeb;
}

.review-info-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.pending-warning-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1rem;
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-md);
  color: #b45309;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.warning-icon {
  color: #d97706;
}

/* 轧制方案（对应分切「切刀方案」） */
.cutting-plan-content {
  display: flex;
  flex-direction: column;
}

.order-no-display {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--primary-color);
}

.customer-name {
  font-family: var(--font-main);
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}

.plan-note-block {
  margin-top: 0.75rem;
}

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

.empty-box {
  padding: 2rem;
  text-align: center;
  background: var(--bg-main);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

/* 道次流转表格 */
.pass-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.pass-table th {
  padding: 0.5rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-main);
}

.pass-table td {
  padding: 0.5rem 0.5rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
}

.pass-table tr.pass-active td {
  background: var(--bg-hover);
}

.pass-n {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--text-muted);
}

.pass-t {
  font-family: var(--font-mono);
}

.pass-machine {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.pass-status {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
}

.pass-status.current {
  background: #dbeafe;
  color: var(--primary-color);
}

.pass-status.done {
  background: var(--status-success-bg);
  color: var(--status-success);
}

.pass-status.future {
  background: var(--bg-main);
  color: var(--text-muted);
  border: 1px solid var(--border-light);
}

.effective-width {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.75rem;
  background: var(--bg-main);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
}

.effective-width .info-label {
  margin: 0;
  min-width: auto;
}

.effective-width .final-val .number {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
}

/* 工艺备注标签 */
.remark-tags-grid {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.tag-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tag-group-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.remark-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.remark-tag.quality {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.remark-tag.process {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.remark-tag.action {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.remark-tag.contact {
  background: #fdf2f8;
  color: #9d174d;
  border: 1px solid #fbcfe8;
}

.remark-tag.split {
  background: #f5f3ff;
  color: #5b21b6;
  border: 1px solid #ddd6fe;
}

.empty-remark {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

/* 修改记录（对齐分切面板风格） */
.log-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.83rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border-light);
}

.log-time {
  font-family: var(--font-mono);
  color: var(--text-muted);
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-top: 2px;
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

.log-reason {
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* 底部按钮（完全对齐分切面板） */
.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-light);
  background: var(--bg-main);
  flex-shrink: 0;
}

.right-actions {
  display: flex;
  gap: 0.75rem;
}

.footer-btn {
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
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

.footer-btn.danger-outline {
  background: transparent;
  border: 1px solid #fecaca;
  color: var(--status-error);
}

.footer-btn.danger-outline:hover {
  background: #fef2f2;
  border-color: #f87171;
}
</style>
