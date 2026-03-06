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
            <Scissors :size="18" class="title-icon" />
            <span>分切计划详情: {{ row.motherCoilNo }} → {{ row.machineId }}分切机</span>
          </div>
          <div class="panel-title" v-else>
            <Scissors :size="18" class="title-icon" />
            <span>分切计划详情</span>
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
                <span class="info-label">卷号</span>
                <span class="info-value coil-no">{{ row.motherCoilNo }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">合金</span>
                <span class="info-value font-bold">{{ row.alloy }}</span>
                <span class="info-label ml-auto">产品</span>
                <span class="product-badge" :class="productClass(row.productType)">{{ row.productType }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">规格</span>
                <span class="info-value">
                  <span class="number">{{ row.width }}</span><span class="unit">mm宽</span>
                  × <span class="number">{{ row.thickness }}</span><span class="unit">μm厚</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">数量</span>
                <span class="info-value">
                  <span class="number">{{ row.length }}</span><span class="unit">m</span> / 
                  <span class="number">{{ row.weight }}</span><span class="unit">kg</span>
                </span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 质量评审 -->
          <div class="section">
            <div class="section-title">
              <ClipboardCheck :size="14" class="section-icon" />质量评审
              <span class="review-status-label" :class="row.reviewStatus">
                {{ reviewLabel(row.reviewStatus) }}
              </span>
            </div>

            <!-- 已评审 or 待评审 -->
            <div v-if="row.review" class="review-content">
              <div class="info-grid mb-3">
                <div class="info-row">
                  <span class="info-label">主结论</span>
                  <span class="info-value conclusion-text" :class="{'text-warning': row.reviewStatus === 'pending'}">{{ row.review.conclusion }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">产品等级</span>
                  <span class="info-value">{{ row.review.grade }}</span>
                </div>
              </div>

              <div class="instructions-wrapper" v-if="row.review.instructions && row.review.instructions.length > 0">
                <div class="sub-title">处理指令:</div>
                <ul class="instruction-list">
                  <li v-for="(inst, idx) in row.review.instructions" :key="idx">
                    <span class="inst-num">①</span>
                    <span class="inst-side">{{ inst.side }}</span>
                    <span class="inst-range font-mono">{{ inst.start }}-{{ inst.end }}mm</span>
                    <span class="inst-defect">{{ inst.defectType }}</span>
                    <ArrowRight :size="12" class="inst-arrow"/>
                    <span class="inst-action">{{ inst.action }}</span>
                  </li>
                </ul>
              </div>

              <div class="effective-width">
                <span class="info-label">有效宽度 (算外侧边丝):</span>
                <span class="final-val">
                  <span class="number">{{ row.review.effectiveWidth }}</span><span class="unit">mm</span>
                </span>
              </div>
            </div>

            <!-- 未评审提示 -->
            <div v-if="row.reviewStatus === 'pending'" class="pending-warning-box">
              <AlertTriangle :size="16" class="warning-icon" />
              <span>评审完成后可进行分切和切刀方案安排</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 切刀方案 -->
          <div class="section">
            <div class="section-title">
              <SplitSquareHorizontal :size="14" class="section-icon" />切刀方案
            </div>

            <div v-if="row.cuttingPlan" class="cutting-plan-content">
              <!-- 多订单拆分展示列表 -->
              <div class="orders-group mb-4">
                <template v-if="getOrderGroups(row).length > 0">
                  <div
                    class="order-info-block"
                    v-for="(grp, idx) in getOrderGroups(row)"
                    :key="idx"
                  >
                    <div class="info-row">
                      <span class="info-label">订单</span>
                      <span class="info-value order-no-display" v-if="grp.orderNo">
                        {{ grp.orderNo }} <span class="customer-name" v-if="grp.customer">{{ grp.customer }}</span>
                      </span>
                      <span class="info-value text-muted" v-else>暂无订单</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">规格</span>
                      <span class="info-value font-mono">{{ grp.spec }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">订单要求</span>
                      <span class="info-value">{{ grp.req }}</span>
                    </div>
                  </div>
                </template>
              </div>

              <div class="sub-title mb-2">分配明细:</div>
              <table class="segments-table">
                <thead>
                  <tr>
                    <th width="80">段类型</th>
                    <th width="80" class="text-right">宽度(mm)</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(seg, idx) in row.cuttingPlan.segments" :key="idx" :class="['seg-row', `seg-${seg.type}`]">
                    <td>
                      <span class="seg-badge" :class="seg.type">{{ segTypeLabel(seg.type) }}</span>
                    </td>
                    <td class="text-right font-mono font-medium">{{ seg.width }}</td>
                    <td class="text-muted text-sm">
                      <span v-if="seg.label" class="seg-custom-label">{{ seg.label }}</span>
                      <span v-if="seg.note && seg.note !== seg.label" class="seg-note">{{ seg.note }}</span>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td class="font-bold">合计</td>
                    <td class="text-right font-mono font-bold">{{ totalSegmentWidth(row.cuttingPlan.segments) }}</td>
                    <td class="text-sm">
                      废料率 <span class="waste-rate" :class="wasteRateClass(row.cuttingPlan.wasteRate)">{{ row.cuttingPlan.wasteRate }}%</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div v-else class="empty-box">
              <span class="text-muted">暂未设置切刀方案</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 计划说明 -->
          <div class="section">
            <div class="section-title">
              <FileText :size="14" class="section-icon" />计划说明
            </div>
            <div class="remark-block" v-if="row.planNote">
              {{ row.planNote }}
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
import { 
  Scissors, X, Package, ClipboardCheck, SplitSquareHorizontal, 
  FileText, History, AlertTriangle, ArrowRight 
} from 'lucide-vue-next'

const props = defineProps({
  visible: Boolean,
  row: Object,
})

const emit = defineEmits(['close', 'action'])

function productClass(type) {
  if (type === '电池箔') return 'battery'
  if (type === '双零箔') return 'double-zero'
  return ''
}

function reviewLabel(status) {
  switch (status) {
    case 'reviewed': return '✅已评审'
    case 'pending': return '⚠️待评审'
    case 'none': return '❌未提交'
    default: return status || '—'
  }
}

// 提取订单组合数据，以供切刀方案区拆分展示
function getOrderGroups(row) {
  if (!row.cuttingPlan) return []
  
  // 1. 如果有 segments 数组（新结构支持多订单）
  if (row.cuttingPlan.segments) {
    const orderSegs = row.cuttingPlan.segments.filter(s => s.type === 'order' && s.width)
    if (orderSegs.length > 0) {
      // 通过 segments 生成每一个订单的属性
      // 通过 segments 生成每一个订单的属性
      return orderSegs.map(s => {
        let lengthPart = ''
        if (s.planLengthMin) {
          lengthPart = `×${s.planLengthMin}`
        } else if (s.lengthMin && s.lengthMax) {
          lengthPart = `×${s.lengthMin}-${s.lengthMax}`
        }
        return {
          orderNo: s.orderId || '（未匹配）',
          customer: s.label || '', 
          spec: `${row.thickness}×${s.width}${row.productType}${lengthPart}`,
          req: s.orderReq || '—'
        }
      })
    }
  }

  // 2. 回退处理（旧结构：只有一个订单和规格字符串）
  return [{
    orderNo: row.orderNo,
    customer: row.customer,
    spec: row.cuttingPlan.spec || '—',
    req: row.cuttingPlan.orderReq || row.cuttingPlan.coreSpec || '—'
  }]
}

function segTypeLabel(type) {
  const map = {
    'order': '订单',
    'edge': '边丝',
    'defect_cut': '切除',
    'waste': '余料'
  }
  return map[type] || type
}

function totalSegmentWidth(segments) {
  if (!segments) return 0
  return segments.reduce((sum, s) => sum + (Number(s.width) || 0), 0)
}

function wasteRateClass(rate) {
  const r = parseFloat(rate)
  if (isNaN(r)) return ''
  if (r <= 5) return 'green'
  if (r > 15) return 'red'
  return 'orange'
}

function generateLogs(row) {
  if (!row) return []
  const logs = []
  
  logs.push({
    time: '2026-03-05 08:30',
    user: '系统',
    content: '通过排产算法初步下发计划'
  })

  if (row.reviewStatus === 'reviewed') {
    logs.push({
      time: '2026-03-05 09:00',
      user: '李评审',
      content: '完成质量评审: ' + (row.review?.conclusion || '让步放行')
    })
  }

  if (row.cuttingPlan) {
    logs.push({
      time: '2026-03-05 09:15',
      user: '张计划',
      content: '确认切刀方案和工艺备注'
    })
  }
  
  return logs.reverse()
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

/* 订单分块展示 */
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

.font-bold { font-weight: 700; }
.font-mono { font-family: var(--font-mono); letter-spacing: 0.02em; }
.font-medium { font-weight: 500; }

.number {
  font-family: var(--font-mono);
  font-weight: 500;
}

.unit {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0 2px;
}

.text-muted { color: var(--text-muted); }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.text-right { text-align: right; }

/* 用途/产品标签 */
.product-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}
.product-badge.battery { background-color: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
.product-badge.double-zero { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

/* 质量评审专属样式 */
.review-status-label {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}
.review-status-label.reviewed { background: var(--status-success-bg); color: var(--status-success); }
.review-status-label.pending { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.review-status-label.none { background: var(--border-light); color: var(--text-muted); }

.conclusion-text {
  font-weight: 700;
}
.text-warning { color: #d97706; }

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
  margin-bottom: 1rem;
}

.instruction-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.instruction-list li {
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-main);
}

.inst-num { color: var(--text-muted); font-size: 0.75rem; }
.inst-side { font-weight: 600; background: var(--bg-hover); padding: 1px 4px; border-radius: 3px; }
.inst-defect { color: var(--status-error); }
.inst-arrow { color: var(--text-muted); }
.inst-action { font-weight: 600; color: var(--primary-color); }

.effective-width {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.75rem;
  background: var(--bg-main);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
}

.effective-width .info-label { margin: 0; min-width: auto; }
.effective-width .final-val .number {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
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

.warning-icon { color: #d97706; }

/* 切刀方案专属样式 */
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

.segments-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.segments-table th {
  padding: 0.5rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-main);
}
.segments-table th.text-right { text-align: right; }

.segments-table td {
  padding: 0.5rem 0.5rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
}

.seg-badge {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}
.seg-badge.order { background: #dbeafe; color: var(--primary-color); }
.seg-badge.edge { background: #f1f5f9; color: var(--text-secondary); }
.seg-badge.defect_cut { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
.seg-badge.waste { background: #f3f4f6; color: #6b7280; border: 1px dashed #d1d5db; }

.seg-custom-label {
  display: inline-block;
  margin-right: 6px;
  font-weight: 500;
  color: var(--text-main);
}
.seg-note {
  font-style: italic;
}

.segments-table tfoot td {
  padding: 0.6rem 0.5rem;
  border-top: 2px solid var(--border-medium);
  border-bottom: none;
  background: var(--bg-main);
}

.waste-rate {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.9rem;
  margin-left: 4px;
}
.waste-rate.green { color: var(--status-success); }
.waste-rate.orange { color: #d97706; }
.waste-rate.red { color: var(--status-error); }

.empty-box {
  padding: 2rem;
  text-align: center;
  background: var(--bg-main);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
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

/* 底部按钮 */
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
.footer-btn.secondary:hover { background: var(--bg-hover); }

.footer-btn.primary {
  background: var(--primary-color);
  color: white;
}
.footer-btn.primary:hover { background: var(--primary-hover); }

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
