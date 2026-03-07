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
            <Microscope :size="18" class="title-icon" />
            <span>精切排产详情: {{ row.subCoilNo }} → {{ row.machineId }}#机台</span>
          </div>
          <div class="panel-title" v-else>
            <Microscope :size="18" class="title-icon" />
            <span>精切排产详情</span>
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
                <span class="info-label">子卷号</span>
                <span class="info-value coil-no">{{ row.subCoilNo }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">母卷号</span>
                <span class="info-value font-mono">{{ row.motherCoilNo }}</span>
                <span class="info-label ml-auto">框号</span>
                <span class="info-value font-mono font-bold">{{ row.frameNo }}</span>
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
                <span class="info-label">长度</span>
                <span class="info-value">
                  <span class="number">{{ row.length }}</span><span class="unit">m</span>
                </span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 质量评审 -->
          <div class="section">
            <div class="section-title">
              <ClipboardCheck :size="14" class="section-icon" />分切质量评审
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
                    <Ruler v-if="inst.locationType === 'length'" :size="14" class="inst-icon length-icon" />
                    <ArrowLeftRight v-else-if="inst.locationType === 'width'" :size="14" class="inst-icon width-icon" />
                    
                    <!-- 宽度方向指令 -->
                    <template v-if="inst.locationType === 'width'">
                      <span class="inst-side">{{ inst.side }}</span>
                      <span class="inst-pos font-mono">{{ inst.position }}mm</span>
                    </template>
                    
                    <!-- 长度方向指令 -->
                    <template v-if="inst.locationType === 'length'">
                      <span class="inst-side">{{ inst.locationDesc }}</span>
                    </template>

                    <span class="inst-defect">{{ inst.defectType }}</span>
                    <ArrowRight :size="12" class="inst-arrow"/>
                    <span class="inst-action">{{ inst.action }}</span>
                  </li>
                </ul>
              </div>

              <div class="effective-width">
                <span class="info-label">有效宽度:</span>
                <span class="final-val">
                  <span class="number">{{ row.review.effectiveWidth }}</span><span class="unit">mm</span>
                </span>
              </div>
            </div>

            <!-- 未评审提示 -->
            <div v-if="row.reviewStatus === 'pending'" class="pending-warning-box">
              <AlertTriangle :size="16" class="warning-icon" />
              <span>该子卷尚未完成质量评审，请谨慎排产</span>
            </div>
            <div v-if="row.reviewStatus === 'none'" class="empty-box mt-2">
              <span class="text-muted">未提交评审</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 精切方案 -->
          <div class="section">
            <div class="section-title">
              <SplitSquareHorizontal :size="14" class="section-icon" />精切方案
            </div>

            <div v-if="row.plan && row.plan.length > 0" class="cutting-plan-content">
              
              <div class="corona-req">
                <span class="info-label">电晕要求:</span>
                <span class="corona-badge" :class="`passes-${row.coronaPasses}`">{{ row.coronaPasses }}遍</span>
                <span class="text-sm text-muted ml-2">(达因值≥33)</span>
              </div>

              <div v-if="row.plan.length > 1 && row.seqReason" class="seq-reason-box mt-3 mb-3">
                <div class="seq-reason-title"><AlertTriangle :size="14" /> 多订单切割顺序说明</div>
                <div class="seq-reason-text">{{ row.seqReason }}</div>
              </div>

              <div class="sub-title mb-2 mt-3">订单段列表:</div>
              <table class="segments-table">
                <thead>
                  <tr>
                    <th width="40" class="text-center">顺序</th>
                    <th width="80">客户</th>
                    <th width="70" class="text-right">订单宽度</th>
                    <th width="110">米数要求</th>
                    <th>等级</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in row.plan" :key="idx" class="order-row">
                    <td class="text-center">
                      <span class="seq-badge">{{ item.seq }}</span>
                    </td>
                    <td class="font-medium text-main">{{ item.customer }}</td>
                    <td class="text-right font-mono">{{ item.orderWidth }}<span class="text-xs text-muted">mm</span></td>
                    <td class="font-mono text-sm">{{ item.lengthMin }}-{{ item.lengthMax }}m</td>
                    <td><span class="grade-badge">{{ item.grade }}</span></td>
                  </tr>
                </tbody>
              </table>

              <div class="waste-calc mt-3">
                <span class="info-label">废料率:</span>
                <span class="waste-rate" :class="wasteRateClass(row.wasteRate)">
                  {{ row.wasteRate }}%
                </span>
                <div class="edge-info text-muted">
                  (左边丝 {{ row.edgeTrimLeft }}mm, 右边丝 {{ row.edgeTrimRight }}mm)
                </div>
              </div>
            </div>
            
            <div v-else class="empty-box">
              <span class="text-muted">暂无预排方案</span>
            </div>
          </div>

          <div class="divider"></div>
          
          <!-- 计划备注 -->
          <div class="section" v-if="row.note">
            <div class="section-title">
              <FileText :size="14" class="section-icon" />计划备注
            </div>
            <div class="remark-block">
              {{ row.note }}
            </div>
          </div>
          <div class="divider" v-if="row.note"></div>

          <!-- 修改记录 -->
          <div class="section">
            <div class="section-title">
              <History :size="14" class="section-icon" />修改记录
            </div>
            <div class="log-list">
              <div class="log-item" v-for="(log, idx) in row.changeLog" :key="idx">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-user">{{ log.operator }}</span>
                <span class="log-content">{{ log.action }}</span>
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
  Microscope, X, Package, ClipboardCheck, SplitSquareHorizontal, 
  FileText, History, AlertTriangle, ArrowRight, Ruler, ArrowLeftRight
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

function wasteRateClass(rate) {
  const r = parseFloat(rate)
  if (isNaN(r)) return ''
  if (r <= 5) return 'green'
  if (r > 15) return 'red'
  return 'orange'
}

function handleAction(actionName) {
  alert(`触发操作: ${actionName} (原型功能)`)
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

/* 信息网格 */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-label {
  font-size: 0.82rem;
  color: var(--text-muted);
  min-width: 60px;
  flex-shrink: 0;
}

.ml-auto {
  margin-left: auto;
  min-width: auto;
}
.ml-2 { margin-left: 0.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.text-right { text-align: right; }
.text-center { text-align: center; }

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
.text-xs { font-size: 0.7rem; }
.text-sm { font-size: 0.85rem; }
.text-main { color: var(--text-main); }
.text-muted { color: var(--text-muted); }

.number {
  font-family: var(--font-mono);
  font-weight: 500;
}

.unit {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0 2px;
}

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

.inst-icon {
  opacity: 0.6;
}
.inst-icon.width-icon {
  color: #0369a1;
}
.inst-icon.length-icon {
  color: #d97706;
}

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

/* 方案区样式 */
.corona-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}
.corona-badge.passes-1 { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.corona-badge.passes-2 { background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }

.seq-reason-box {
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-md);
  padding: 0.75rem;
}
.seq-reason-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #b45309;
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 4px;
}
.seq-reason-text {
  color: #92400e;
  font-size: 0.85rem;
  line-height: 1.4;
}

.segments-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  background: var(--bg-main);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.segments-table th {
  padding: 0.6rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-align: left;
  border-bottom: 1px solid var(--border-medium);
  background: var(--bg-hover);
}
.segments-table th.text-right { text-align: right; }
.segments-table th.text-center { text-align: center; }

.segments-table td {
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
}

.order-row:last-child td {
  border-bottom: none;
}

.seq-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

.grade-badge {
  font-size: 0.7rem;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(0,0,0,0.05);
  color: var(--text-secondary);
}

.waste-calc {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: var(--bg-main);
  border-radius: var(--radius-md);
}

.waste-rate {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.05rem;
}
.waste-rate.green { color: var(--status-success); }
.waste-rate.orange { color: #d97706; }
.waste-rate.red { color: var(--status-error); }

.edge-info {
  font-size: 0.75rem;
  margin-left: auto;
}

.empty-box {
  padding: 1.5rem;
  text-align: center;
  background: var(--bg-main);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

/* 计划备注 */
.remark-block {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
  background: var(--bg-main);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  white-space: pre-wrap;
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
  border-bottom: 1px dashed var(--border-light);
}

.log-item:last-child {
  border-bottom: none;
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
  color: var(--text-main);
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
  background: var(--bg-hover);
  color: var(--text-secondary);
}
.footer-btn.secondary:hover {
  background: #e2e8f0;
  color: var(--text-main);
}

.footer-btn.primary {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
}
.footer-btn.primary:hover {
  background: var(--primary-hover);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
}

.footer-btn.danger-outline {
  background: transparent;
  color: var(--status-error);
  border: 1px solid #fca5a5;
}
.footer-btn.danger-outline:hover {
  background: #fee2e2;
}
</style>
