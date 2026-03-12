<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="closeModal">
        <Transition name="modal-scale">
          <div v-if="visible" class="modal-content" role="dialog" aria-modal="true">

            <!-- 弹窗头部 -->
            <div class="modal-header">
              <div class="modal-title-row">
                <Microscope :size="18" class="title-icon" />
                <h3 class="modal-title">新增精切计划</h3>
              </div>
              <button class="close-btn" @click="closeModal" title="关闭">
                <X :size="20" />
              </button>
            </div>

            <div class="modal-body">

              <!-- ❶ 来料选择区 -->
              <div class="section-block">
                <div class="section-label">
                  <span class="section-num">①</span> 来料选择
                </div>
                <div class="select-row">
                  <div class="form-group flex-2">
                    <label>子卷号 <span class="required">*</span></label>
                    <CustomSelect v-model="selectedSubCoilNo" :options="subCoilOptions" placeholder="选择待精切子卷" />
                  </div>
                  <div class="form-group flex-1">
                    <label>机台设备 <span class="required">*</span></label>
                    <CustomSelect v-model="selectedMachineId" :options="machineOptions" placeholder="选择精切机" />
                  </div>
                </div>

                <!-- 子卷自动带出信息（只读） -->
                <Transition name="fade-in">
                  <div v-if="selectedMaterial" class="material-info-bar">
                    <div class="info-chip">
                      <span class="chip-label">合金</span>
                      <span class="chip-val font-mono">{{ selectedMaterial.alloy }}</span>
                    </div>
                    <div class="info-chip">
                      <span class="chip-label">产品</span>
                      <span class="chip-val" :class="productClass(selectedMaterial.productType)">
                        {{ selectedMaterial.productType }}
                      </span>
                    </div>
                    <div class="info-chip">
                      <span class="chip-label">宽度</span>
                      <span class="chip-val font-mono">{{ selectedMaterial.width }}<span
                          class="chip-unit">mm</span></span>
                    </div>
                    <div class="info-chip">
                      <span class="chip-label">厚度</span>
                      <span class="chip-val font-mono">{{ selectedMaterial.thickness }}<span
                          class="chip-unit">μm</span></span>
                    </div>
                    <div class="info-chip">
                      <span class="chip-label">长度</span>
                      <span class="chip-val font-mono">{{ selectedMaterial.length }}<span
                          class="chip-unit">m</span></span>
                    </div>
                    <div class="info-chip">
                      <span class="chip-label">框号</span>
                      <span class="chip-val font-mono font-bold">{{ selectedMaterial.frameNo }}</span>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- ❷ 质量评审区（只读参考） -->
              <Transition name="fade-in">
                <div v-if="selectedMaterial" class="section-block review-block">
                  <div class="section-label">
                    <span class="section-num">②</span> 分切质量评审
                    <span class="review-status-tag" :class="selectedMaterial.reviewStatus">
                      {{ reviewStatusLabel(selectedMaterial.reviewStatus) }}
                    </span>
                  </div>

                  <!-- 待评审警告 -->
                  <div v-if="selectedMaterial.reviewStatus === 'pending'" class="review-warning">
                    <AlertTriangle :size="15" />
                    <span>该子卷尚未完成质量评审，排定计划后需等待评审通过才能执行生产！</span>
                  </div>
                  <!-- 未提交提示 -->
                  <div v-else-if="selectedMaterial.reviewStatus === 'none'" class="review-warning none">
                    <Info :size="15" />
                    <span>该子卷尚未提交质量评审，可能存在未识别的缺陷。</span>
                  </div>

                  <!-- 降级品流转提示 -->
                  <div v-if="materialGrade === '二级品'" class="grade-warn">
                    <AlertTriangle :size="14" />
                    <span>⚠️ 此卷已降为二级品，可匹配的订单范围已自动收窄</span>
                  </div>

                  <!-- 已评审展示 -->
                  <div v-else-if="selectedMaterial.review" class="review-content-row">
                    <div class="review-left">
                      <div class="review-info-item">
                        <span class="review-key">评审结论</span>
                        <span class="review-val conclusion">{{ selectedMaterial.review.conclusion }}</span>
                      </div>
                      <div class="review-info-item">
                        <span class="review-key">产品等级</span>
                        <span class="review-val" :class="gradeClass(selectedMaterial.review.grade)">
                          {{ selectedMaterial.review.grade }}
                        </span>
                      </div>
                    </div>
                    <div class="review-right">
                      <!-- 处理指令 -->
                      <div v-if="selectedMaterial.review.instructions.length > 0" class="instructions-area">
                        <span class="review-key">处理指令</span>
                        <div class="instruction-list">
                          <div v-for="(inst, idx) in selectedMaterial.review.instructions" :key="idx" class="inst-item">
                            <span class="inst-badge">{{ idx + 1 }}</span>
                            <template v-if="inst.locationType === 'width'">
                              <span class="inst-side">{{ inst.side }}</span>
                              <span class="inst-range font-mono">{{ inst.position }}mm</span>
                            </template>
                            <template v-else-if="inst.locationType === 'length'">
                              <span class="inst-side">{{ inst.locationDesc }}</span>
                            </template>
                            <span class="inst-defect">{{ inst.defectType }}</span>
                            <ArrowRight :size="11" class="inst-arrow" />
                            <span class="inst-action">{{ inst.action }}</span>
                          </div>
                        </div>
                      </div>
                      <div v-else class="no-defect-tip">
                        <CheckCircle :size="14" />
                        <span>无缺陷处理指令，质量判定正常</span>
                      </div>
                    </div>
                    <!-- 有效宽度单独放在最右侧块内，与SlittingPlan保持一致 -->
                    <div class="effective-width-block">
                      <span class="ew-label">有效宽度</span>
                      <span class="ew-value">{{ effectiveWidth }}</span>
                      <span class="ew-unit">mm</span>
                      <span class="ew-diff" v-if="effectiveWidth < selectedMaterial.width">
                        (原始 {{ selectedMaterial.width }}mm，减少 {{ selectedMaterial.width - effectiveWidth }}mm)
                      </span>
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- ❸ 精切方案设计区 -->
              <div class="section-block">
                <div class="section-label">
                  <span class="section-num">③</span> 精切方案设计
                </div>

                <div v-if="!selectedMaterial" class="no-material-tip">
                  <Info :size="14" />
                  <span>请先选择待精切子卷，随后配置电晕并设计切割方案</span>
                </div>

                <template v-else>

                  <div class="segments-area-header mb-2 flex-between">
                    <div class="sub-title">段列表设计:</div>
                    <button class="add-seg-btn btn-sm" @click="addOrderSegment">
                      <Plus :size="13" /> 添加订单段
                    </button>
                  </div>

                  <!-- 段列表表头 -->
                  <div class="segments-header">
                    <div class="col-tag">顺序</div>
                    <div class="col-type">类型</div>
                    <div class="col-order">绑定订单</div>
                    <div class="col-width text-right">宽度(mm)</div>
                    <div class="col-customer">客户</div>
                    <div class="col-length">订单米数范围</div>
                    <div class="col-plan">本次计划</div>
                    <div class="col-core">订单要求</div>
                    <div class="col-corona">破卷备注</div>
                    <div class="col-note">说明</div>
                    <div class="col-action"></div>
                  </div>

                  <!-- 段列表 -->
                  <div v-for="(seg, idx) in segments" :key="seg.id" class="segment-row" :class="`seg-row-${seg.type}`">
                    <!-- 顺序编号 -->
                    <div class="col-tag">
                      <span class="seq-badge" v-if="seg.type === 'order'">{{ getOrderDisplayIndex(seg.id) }}</span>
                    </div>

                    <!-- 类型标签（只读） -->
                    <div class="col-type">
                      <span class="seg-type-tag" :class="seg.type">
                        {{ segTypeLabel(seg.type) }}
                      </span>
                    </div>

                    <!-- 绑定订单（仅订单类型） -->
                    <div class="col-order">
                      <template v-if="seg.type === 'order'">
                        <button v-if="!seg.orderInfo" class="order-pick-btn" @click="openOrderMatch(seg)">
                          📋 选择订单
                        </button>
                        <button v-else class="order-pick-btn has-order" @click="openOrderMatch(seg)">
                          <span class="picked-no font-mono">{{ seg.orderInfo.orderNo }}</span>
                          <span class="picked-cust">{{ seg.orderInfo.customer }}</span>
                        </button>
                      </template>
                      <span v-else class="col-dash text-muted">—</span>
                    </div>

                    <!-- 宽度 -->
                    <div class="col-width text-right">
                      <!-- 边丝：可调整 -->
                      <input v-if="seg.type === 'edge'" type="number" v-model="seg.width"
                        class="form-input seg-input text-right font-mono full-w"
                        :class="{ 'input-warn': Number(seg.width) < 5 || Number(seg.width) > 20 }" min="5" max="20" />
                      <!-- 订单：只读 -->
                      <span v-else class="readonly-val font-mono">
                        {{ seg.width ?? '—' }}
                      </span>
                    </div>

                    <!-- 客户（仅订单类型，只读） -->
                    <div class="col-customer">
                      <span v-if="seg.type === 'order' && seg.orderInfo" class="order-customer">
                        {{ seg.orderInfo.customer }}
                      </span>
                      <span v-else class="col-dash">—</span>
                    </div>

                    <!-- 米数范围（仅订单类型，只读） -->
                    <div class="col-length">
                      <span v-if="seg.type === 'order' && seg.orderInfo" class="font-mono text-sm">
                        {{ seg.orderInfo.lengthMin }}~{{ seg.orderInfo.lengthMax }}m
                      </span>
                      <span v-else class="col-dash">—</span>
                    </div>

                    <!-- 本次计划：本次切几卷 + 目标米数 -->
                    <div class="col-plan">
                      <template v-if="seg.type === 'order'">
                        <div class="plan-inputs">
                          <input type="number" v-model="seg.planCoils" class="form-input seg-input text-right font-mono"
                            min="1" placeholder="卷数" title="本次计划切制卷数" />
                          <span class="plan-sep">卷</span>
                          <input type="number" v-model="seg.planLengthMin"
                            class="form-input seg-input text-right font-mono" min="0" placeholder="目标米"
                            title="本次单卷目标米数" />
                          <span class="plan-sep">m</span>
                        </div>
                      </template>
                      <span v-else class="col-dash">—</span>
                    </div>

                    <!-- 订单要求（可编辑，选订单后自动带出） -->
                    <div class="col-core">
                      <template v-if="seg.type === 'order'">
                        <input type="text" v-model="seg.orderReq" class="form-input seg-input seg-req-input"
                          placeholder="管芯规格、装框要求…" />
                      </template>
                      <span v-else class="col-dash">—</span>
                    </div>

                    <!-- 破卷备注（仅订单类型，可编辑） -->
                    <div class="col-corona">
                      <template v-if="seg.type === 'order'">
                        <input type="text" v-model="seg.coronaNote" class="form-input seg-input seg-corona-input"
                          placeholder="如: Q1000+330扒废" />
                      </template>
                      <span v-else class="col-dash">—</span>
                    </div>

                    <!-- 说明 -->
                    <div class="col-note">
                      <span v-if="seg.note" class="seg-note-text">{{ seg.note }}</span>
                      <span v-else class="col-dash">—</span>
                    </div>

                    <!-- 删除 -->
                    <div class="col-action">
                      <button v-if="seg.type === 'order'" class="icon-btn delete" @click="removeSegment(idx)"
                        title="移除此订单">
                        <Trash2 :size="15" />
                      </button>
                    </div>
                  </div>

                  <!-- 切刀横截面可视化 -->
                  <CuttingDiagram :segments="segments" :totalWidth="selectedMaterial.width"
                    :instructions="selectedMaterial.review?.instructions ?? []" />

                  <!-- 实时计算区 -->
                  <div class="calc-summary mt-4"
                    :class="{ 'has-error': isOverEffective, 'has-warn': isOverTotal && !isOverEffective }">
                    <div class="calc-item">
                      <span class="calc-label">子卷宽度</span>
                      <span class="calc-val font-mono">{{ selectedMaterial.width }}</span>
                      <span class="calc-unit">mm</span>
                    </div>
                    <div class="calc-sep">|</div>
                    <div class="calc-item" title="评审指令排查出的无缺陷理想区宽度">
                      <span class="calc-label">有效宽度</span>
                      <span class="calc-val font-mono" style="color: var(--primary-color);">{{ effectiveWidth }}</span>
                      <span class="calc-unit">mm</span>
                    </div>
                    <div class="calc-sep">|</div>
                    <div class="calc-item">
                      <span class="calc-label">已分配(边丝+订单)</span>
                      <span class="calc-val font-mono">{{ totalAllocated }}</span>
                      <span class="calc-unit">mm</span>
                    </div>
                    <div class="calc-sep">|</div>
                    <div class="calc-item">
                      <span class="calc-label">剩余(余料产生)</span>
                      <span class="calc-val font-mono"
                        :class="{ 'text-error': remaining < 0, 'text-muted': remaining >= 0 }">
                        {{ remaining }}
                      </span>
                      <span class="calc-unit">mm</span>
                    </div>
                    <div class="calc-sep">|</div>
                    <div class="calc-item">
                      <span class="calc-label">预计废料率</span>
                      <span class="waste-rate-badge" :class="wasteRateClass">{{ wasteRate }}{{ wasteRate !== '超宽' ? '%'
                        : '' }}</span>
                    </div>
                  </div>

                  <!-- 错误 / 警告提示 -->
                  <div v-if="hasSingleOrderOverEffectiveWidth" class="alert-msg error">
                    <AlertCircle :size="14" />
                    <span>有单个订单卡的宽度超出了子卷的可用【有效宽度】({{ effectiveWidth }}mm)，无法切出合格品，请更换订单。</span>
                  </div>
                  <div v-else-if="isOverTotal" class="alert-msg warn">
                    <AlertTriangle :size="14" />
                    <span>当前订单段组合总宽（+双边丝）超出子卷物理总宽，将自动采用【多订单长度顺序切模式】，会产生较高废料。</span>
                  </div>
                  <div v-if="hasEdgeWarning" class="alert-msg warn">
                    <AlertTriangle :size="14" />
                    <span>边丝宽度建议 5-20mm，当前值超出合理范围。</span>
                  </div>
                  <div v-if="hasAvoidConflict" class="alert-msg warn">
                    <AlertTriangle :size="14" />
                    <span>订单段边界与避留白位置冲突（±5mm容差），请调整切刀方案。</span>
                  </div>
                </template>
              </div>

              <!-- ❹ 顺序说明（多订单时显示） -->
              <Transition name="fade-in">
                <div class="section-block" v-if="selectedMaterial && orderSegCount > 1">
                  <div class="section-label text-warning">
                    <span class="section-num warning-bg">④</span> 多订单切割顺序说明 <span class="optional">（必填）</span>
                  </div>
                  <textarea v-model="seqReason" class="form-textarea border-warning"
                    placeholder="如：底部有5800米缺陷，先切短单（弘力）消化缺陷，后再切源元..." rows="2"></textarea>
                </div>
              </Transition>

              <!-- ❺ 计划备注 -->
              <div class="section-block" v-if="selectedMaterial">
                <div class="section-label">
                  <span class="section-num">{{ orderSegCount > 1 ? '⑤' : '④' }}</span> 计划备注 <span
                    class="optional">（选填）</span>
                </div>
                <textarea v-model="planNote" class="form-textarea" placeholder="其他执行说明..." rows="2"></textarea>
              </div>

            </div><!-- /modal-body -->

            <!-- 底部按钮 -->
            <div class="modal-footer">
              <div class="footer-hint" v-if="!canSubmit && selectedMaterial">
                <span v-if="!selectedMachineId">请选择机台</span>
                <span v-else-if="orderSegCount === 0">请至少添加一个精切段</span>
                <span v-else-if="hasSingleOrderOverEffectiveWidth">存在单个订单超宽错误</span>
                <span v-else-if="orderSegCount > 1 && !seqReason.trim()">请填写切割顺序说明</span>
              </div>
              <div class="footer-actions">
                <button class="btn secondary" @click="closeModal">取消</button>
                <button class="btn primary" :disabled="!canSubmit" @click="submitForm">
                  确认添加
                </button>
              </div>
            </div>

          </div>
        </Transition>

        <!-- 订单推荐二级弹窗 -->
        <OrderMatchModal :visible="orderMatchVisible" :alloy="selectedMaterial?.alloy || ''"
          :effectiveWidth="effectiveWidth" :thickness="selectedMaterial?.thickness || 0" :grade="materialGrade"
          :usedOrderNos="usedOrderNos" :currentOrderNo="currentMatchSeg?.orderInfo?.orderNo || ''"
          @close="orderMatchVisible = false" @select="onOrderMatchSelect" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import {
  X, Plus, Trash2, AlertCircle, AlertTriangle, ArrowRight, ArrowLeftRight, Ruler,
  CheckCircle, Info, Microscope
} from 'lucide-vue-next'
import CustomSelect from './CustomSelect.vue'
import CuttingDiagram from './CuttingDiagram.vue'
import OrderMatchModal from './OrderMatchModal.vue'
import { precisionMaterialPool } from '../data/precision-material-pool.js'
import { orderPool } from '../data/order-pool.js'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'submit'])

// ─── 状态 ───────────────────────────────────────────────
const selectedSubCoilNo = ref('')
const selectedMachineId = ref('')
const seqReason = ref('')
const planNote = ref('')

// 订单推荐弹窗状态
const orderMatchVisible = ref(false)
const currentMatchSeg = ref(null)

// 机台写死 1-49
const machineOptions = Array.from({ length: 49 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1}# 精切机`
}))

// 动态段列表（首尾固定两边丝，中间加无数订单段）
const segments = reactive([
  { id: 1, type: 'edge', label: '左边', width: 8, orderId: null, orderInfo: null },
  { id: 2, type: 'edge', label: '右边', width: 8, orderId: null, orderInfo: null }
])

// ─── 子卷选项 ────────────────────────────────────────────
const subCoilOptions = computed(() =>
  precisionMaterialPool.map(m => ({
    value: m.subCoilNo,
    label: `${m.subCoilNo}  （${m.alloy} · ${m.width}mm · ${m.frameNo}框）`
  }))
)

// 选中的子卷完整信息
const selectedMaterial = computed(() =>
  precisionMaterialPool.find(m => m.subCoilNo === selectedSubCoilNo.value) || null
)

// ─── 质量评审 ────────────────────────────────────────
const effectiveWidth = computed(() => {
  if (!selectedMaterial.value) return 0
  return selectedMaterial.value.review?.effectiveWidth ?? selectedMaterial.value.width
})

// 母卷质量等级
const materialGrade = computed(() =>
  selectedMaterial.value?.review?.grade || '一级品'
)

// 边丝超范围警告
const hasEdgeWarning = computed(() =>
  segments.some(s =>
    s.type === 'edge' && (Number(s.width) < 5 || Number(s.width) > 20)
  )
)

// 避留白冲突检测（±5mm 容差）
const hasAvoidConflict = computed(() => {
  if (!selectedMaterial.value?.review?.instructions) return false
  const avoidPositions = selectedMaterial.value.review.instructions
    .filter(i => i.action === '避留白' && i.locationType === 'width')
    .map(i => i.position)
  if (avoidPositions.length === 0) return false

  // 计算每个订单段的边界位置
  let cursor = 0
  for (const seg of segments) {
    cursor += Number(seg.width) || 0
    if (seg.type === 'order') {
      for (const ap of avoidPositions) {
        if (Math.abs(cursor - ap) <= 5 || Math.abs(cursor - (Number(seg.width) || 0) - ap) <= 5) {
          return true
        }
      }
    }
  }
  return false
})

function reviewStatusLabel(status) {
  if (status === 'reviewed') return '✅ 已评审'
  if (status === 'pending') return '⚠️ 待评审'
  return '❌ 未提交'
}

function productClass(type) {
  if (type === '电池箔') return 'badge-battery'
  if (type === '双零箔') return 'badge-double'
  return ''
}

function gradeClass(grade) {
  if (grade === '二级品') return 'text-warning'
  return 'text-success'
}

// ─── 订单处理 ─────────────────────────────────────────
// 已用订单号
const usedOrderNos = computed(() =>
  segments.filter(s => s.orderInfo).map(s => s.orderInfo.orderNo)
)

// 打开订单推荐弹窗
function openOrderMatch(seg) {
  currentMatchSeg.value = seg
  orderMatchVisible.value = true
}

// 订单推荐弹窗选中回调
function onOrderMatchSelect(order) {
  const seg = currentMatchSeg.value
  if (!seg) return
  seg.orderId = order.orderNo
  seg.orderInfo = order
  seg.width = order.width
  if (!seg.orderReq) {
    seg.orderReq = order.coreSpec || ''
  }
  orderMatchVisible.value = false
}

// 自动匹配最优订单：找合金+厚度匹配、宽度最大且≤有效宽度的订单
function findBestOrder(excludeOrderNos = []) {
  if (!selectedMaterial.value) return null
  const alloy = selectedMaterial.value.alloy
  const thickness = selectedMaterial.value.thickness
  const ew = effectiveWidth.value

  const availableList = orderPool.filter(o =>
    o.alloy === alloy &&
    o.thickness === thickness &&
    o.width <= ew &&
    !excludeOrderNos.includes(o.orderNo)
  )

  return availableList
    .sort((a, b) => {
      // 急单优先，再按宽度降序
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1
      return b.width - a.width
    })[0] || null
}

// ─── 段辅助 ─────────────────────────────────────────────────────────────────
function segTypeLabel(type) {
  const map = { edge: '边丝', order: '订单', defect_cut: '切除' }
  return map[type] || type
}

let _segId = 2 // 1,2 初始给边丝了
function makeId() { return ++_segId }

// 获取订单是第几个顺序 ①②
function getOrderDisplayIndex(id) {
  const orders = segments.filter(s => s.type === 'order')
  const idx = orders.findIndex(o => o.id === id)
  return idx + 1
}

function addOrderSegment() {
  // 尝试自动匹配下一个未使用的最优订单
  const usedNos = segments.filter(s => s.orderInfo).map(s => s.orderInfo.orderNo)
  const bestOrder = findBestOrder(usedNos)
  const rightEdgeIdx = segments.findLastIndex(s => s.type === 'edge')
  const insertAt = rightEdgeIdx > 0 ? rightEdgeIdx : segments.length
  segments.splice(insertAt, 0, {
    id: makeId(),
    type: 'order',
    width: bestOrder?.width ?? null,
    orderId: bestOrder?.orderNo ?? null,
    orderInfo: bestOrder ?? null,
    orderReq: bestOrder?.coreSpec ?? '',
    planCoils: 1,
    planLengthMin: bestOrder ? Math.round((bestOrder.lengthMin + bestOrder.lengthMax) / 2) : null,
    coronaNote: '',
    note: ''
  })
}

function removeSegment(idx) {
  segments.splice(idx, 1)
}

// 选子卷时重置环境，并自动匹配最优订单预填
watch(selectedSubCoilNo, (val) => {
  if (!val) {
    segments.splice(0, segments.length)
    return
  }

  // Q 侧切除 → 铝卷最左侧（缺陷切除）
  const qSideCuts = []
  // C 侧切除 → 铝卷最右侧（缺陷切除）
  const cSideCuts = []

  const material = precisionMaterialPool.find(m => m.subCoilNo === val)
  if (material) {
    // 扫描评审指令，按 Q/C 侧分别生成切除段
    const instructions = material.review?.instructions ?? []
    for (const inst of instructions) {
      if (inst.locationType === 'width' && inst.action === '切除' && inst.position > 0) {
        const cutSeg = {
          id: makeId(),
          type: 'defect_cut',
          width: inst.position,
          orderId: null,
          orderInfo: null,
          note: `${inst.side} ${inst.defectType}切除${inst.position}mm`,
          autoGen: true
        }
        if (inst.side === 'Q侧') {
          qSideCuts.push(cutSeg)
        } else {
          cSideCuts.push(cutSeg)
        }
      }
    }

    // 自动匹配最优订单（合金+厚度匹配，急单优先，再按宽度降序）
    const ew = material.review?.effectiveWidth ?? material.width
    const bestOrder = orderPool
      .filter(o => o.alloy === material.alloy && o.thickness === material.thickness && o.width <= ew)
      .sort((a, b) => {
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
        if (b.priority === 'urgent' && a.priority !== 'urgent') return 1
        return b.width - a.width
      })[0] || null

    // 物理横截面段顺序：Q侧切除 → 左边丝 → 订单 → 右边丝 → C侧切除
    // 边丝是订单成品的修边余量，紧贴订单两侧
    const leftEdge = { id: makeId(), type: 'edge', label: '左边', width: 8, orderId: null, orderInfo: null, note: '左边丝' }
    const rightEdge = { id: makeId(), type: 'edge', label: '右边', width: 8, orderId: null, orderInfo: null, note: '右边丝' }

    const initial = [...qSideCuts, leftEdge]

    if (bestOrder) {
      initial.push({
        id: makeId(),
        type: 'order',
        width: bestOrder.width,
        orderId: bestOrder.orderNo,
        orderInfo: bestOrder,
        orderReq: bestOrder.coreSpec || '',
        planCoils: 1,
        planLengthMin: Math.round((bestOrder.lengthMin + bestOrder.lengthMax) / 2),
        coronaNote: '',
        note: ''
      })
    }

    initial.push(rightEdge, ...cSideCuts)
    segments.splice(0, segments.length, ...initial)
  } else {
    const leftEdge = { id: makeId(), type: 'edge', label: '左边', width: 8, orderId: null, orderInfo: null, note: '左边丝' }
    const rightEdge = { id: makeId(), type: 'edge', label: '右边', width: 8, orderId: null, orderInfo: null, note: '右边丝' }
    segments.splice(0, segments.length, leftEdge, rightEdge)
  }

  seqReason.value = ''
  planNote.value = ''
})


// ─── 核心算法与校验 ────────────────────────────────────────────
// 总占用宽度 (边丝 + 订单宽之和)
const totalAllocated = computed(() =>
  segments.reduce((sum, s) => sum + (Number(s.width) || 0), 0)
)

const orderTotalWidth = computed(() =>
  segments.filter(s => s.type === 'order').reduce((sum, s) => sum + (Number(s.width) || 0), 0)
)

const remaining = computed(() =>
  (selectedMaterial.value?.width || 0) - totalAllocated.value
)

// 单个订单宽是否超过有效宽度？(非常关键的死卡点, 会直接导致无法生产)
const hasSingleOrderOverEffectiveWidth = computed(() => {
  if (!selectedMaterial.value) return false
  const ew = effectiveWidth.value
  return segments.some(s => s.type === 'order' && s.width > ew)
})

const isOverTotal = computed(() => remaining.value < 0)
const isOverEffective = computed(() => hasSingleOrderOverEffectiveWidth.value)
const orderSegCount = computed(() => segments.filter(s => s.type === 'order').length)

// 废料率计算 = 剩余(废料) / 子卷总宽
// 当已超宽(remaining < 0)时显示"超宽"
const wasteRate = computed(() => {
  const mw = selectedMaterial.value?.width || 0
  if (mw === 0) return '0.0'
  if (isOverTotal.value) return '超宽'
  return ((remaining.value / mw) * 100).toFixed(1)
})

const wasteRateClass = computed(() => {
  if (isOverTotal.value) return 'red'
  const r = parseFloat(wasteRate.value)
  if (r <= 5) return 'green'
  if (r > 15) return 'red'
  return 'orange'
})

// ─── 提交控制 ────────────────────────────────────────────
const canSubmit = computed(() => {
  if (!selectedSubCoilNo.value) return false
  if (!selectedMachineId.value) return false
  if (orderSegCount.value === 0) return false
  if (hasSingleOrderOverEffectiveWidth.value) return false // 死卡点
  if (orderSegCount.value > 1 && !seqReason.value.trim()) return false // 多个必须写理由
  return true
})

function closeModal() {
  emit('close')
}

function submitForm() {
  if (!canSubmit.value) return

  const orderList = segments.filter(s => s.type === 'order' && s.orderInfo).map((s, index) => ({
    seq: index + 1,
    type: 'order',
    orderNo: s.orderId,
    customer: s.orderInfo.customer,
    orderWidth: s.width,
    lengthMin: s.orderInfo.lengthMin,
    lengthMax: s.orderInfo.lengthMax,
    // 本次计划数据
    planCoils: Number(s.planCoils) || 1,
    planLengthMin: Number(s.planLengthMin) || null,
    orderReq: s.orderReq || '',
    coronaNote: s.coronaNote || '',
    note: s.note || '',
    grade: s.orderInfo.grade || '一级品',
  }))

  const submitData = {
    machineId: selectedMachineId.value,
    subCoilNo: selectedSubCoilNo.value,
    motherCoilNo: selectedMaterial.value.motherCoilNo,
    frameNo: selectedMaterial.value.frameNo,
    alloy: selectedMaterial.value.alloy,
    productType: selectedMaterial.value.productType,
    thickness: selectedMaterial.value.thickness,
    width: selectedMaterial.value.width,
    length: selectedMaterial.value.length,
    plan: orderList,
    edgeTrimLeft: Number(segments[0].width) || 0,
    edgeTrimRight: Number(segments[segments.length - 1].width) || 0,
    seqReason: seqReason.value,
    note: planNote.value,
    reviewStatus: selectedMaterial.value.reviewStatus,
    review: selectedMaterial.value.review,
    status: selectedMaterial.value.reviewStatus === 'reviewed' ? 'planned' : 'pending_review',
    wasteRate: parseFloat(wasteRate.value)
  }
  emit('submit', submitData)
}
</script>

<style scoped>
/* ─── 遮罩 & 动画 ─────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

.fade-in-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-in-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

/* ─── 弹窗主体 ───────────────────────────────────────── */
.modal-content {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 1280px;
  /* 最宽设定，容纳订单要求+说明列 */
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-main);
  flex-shrink: 0;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: var(--primary-color);
}

.modal-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-main);
  font-weight: 600;
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
  background: var(--border-light);
  color: var(--text-main);
}

/* ─── 面板滚动区 ─────────────────────────────────────── */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background-color: var(--bg-surface);
}

/* 区块公用样式 */
.section-block {
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 1rem;
}

.section-num {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-right: 2px;
}

.warning-bg {
  background-color: #fef3c7;
  color: #d97706;
}

.text-warning {
  color: #d97706;
}

.optional {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--text-muted);
}

/* ─── ❶ 表单区 ───────────────────────────────────────── */
.select-row {
  display: flex;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.flex-1 {
  flex: 1;
}

.flex-2 {
  flex: 1.8;
}

label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
}

.required {
  color: var(--status-error);
}

.material-info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  margin-top: 1rem;
  border: 1px solid var(--border-light);
}

.info-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
}

.chip-label {
  color: var(--text-muted);
}

.chip-val {
  font-weight: 600;
  color: var(--text-main);
}

.chip-unit {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-left: 1px;
  font-weight: 400;
}

.badge-battery {
  background: #fee2e2;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.badge-double {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.font-bold {
  font-weight: 700;
  color: var(--primary-color);
}

.text-primary {
  color: var(--primary-color);
}

/* ─── ❷ 质量评审 ───────────────────────────────────── */
.review-block {
  background: var(--bg-main);
  border: 1px solid #bfdbfe;
  border-left: 3px solid var(--primary-color);
  border-radius: var(--radius-md);
  padding: 1rem 1.1rem;
}

.review-status-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: auto;
}

.review-status-tag.reviewed {
  background: var(--status-success-bg);
  color: var(--status-success);
}

.review-status-tag.pending {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.review-status-tag.none {
  background: var(--bg-hover);
  color: var(--text-muted);
}

.review-warning {
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
}

.review-warning.none {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);
}

.review-content-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.75rem;
}

.review-left {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.review-info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-key {
  font-size: 0.78rem;
  color: var(--text-muted);
  min-width: 52px;
  flex-shrink: 0;
}

.review-val {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.review-val.conclusion {
  color: var(--primary-color);
}

.text-success {
  color: var(--status-success);
}

.text-warning {
  color: #d97706;
}

.review-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.instructions-area {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.instruction-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 2px;
}

.inst-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.inst-badge {
  width: 16px;
  height: 16px;
  background: var(--bg-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  flex-shrink: 0;
}

.inst-side {
  font-weight: 600;
  background: var(--bg-hover);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.75rem;
}

.inst-range {
  color: var(--text-secondary);
}

.inst-defect {
  color: #dc2626;
  font-size: 0.78rem;
}

.inst-arrow {
  color: var(--text-muted);
}

.inst-action {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 0.78rem;
}

.no-defect-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--status-success);
}

/* 有效宽度块 */
.effective-width-block {
  display: flex;
  align-items: baseline;
  gap: 5px;
  padding: 0.55rem 0.85rem;
  background: #eff6ff;
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
  white-space: nowrap;
}

.ew-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.ew-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary-color);
}

.ew-unit {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.ew-diff {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: 4px;
}

.error-zone {
  color: var(--status-error);
  font-style: italic;
}


/* ─── ❸ 段设计区 ─────────────────────────────────────── */
.no-material-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 1.5rem;
  background: var(--bg-surface);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.85rem;
  justify-content: center;
}

/* 电晕设置已废弃，相关信息移至段列表的「破卷备注」列，此处保留注释备用 */
/* .corona-setting-row {} .corona-textarea {} */

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.add-seg-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-hover);
  border: 1px solid var(--border-medium);
  color: var(--text-main);
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.add-seg-btn:hover:not(:disabled) {
  background: white;
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.add-seg-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.segments-header {
  display: flex;
  padding: 0.6rem 0.5rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.segment-row {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.5rem;
  border: 1px solid var(--border-light);
  border-top: none;
  background: white;
  transition: background-color 0.2s;
}

.segment-row:last-child {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.seg-row-edge {
  background: #fafafa;
}

.seg-row-order {
  background: white;
}

.seg-row-defect_cut {
  background: #fff7f7;
}

/* 列宽分配控制 */
.col-tag {
  width: 36px;
  text-align: center;
  flex-shrink: 0;
}

.col-type {
  width: 52px;
  text-align: center;
  flex-shrink: 0;
}

.col-order {
  width: 188px;
  flex-shrink: 0;
  margin: 0 0.5rem;
}

.col-width {
  width: 72px;
  flex-shrink: 0;
  text-align: right;
}

.col-customer {
  width: 80px;
  flex-shrink: 0;
  margin: 0 0.4rem;
}

.col-length {
  width: 120px;
  flex-shrink: 0;
  margin: 0 0.4rem;
}

.col-plan {
  width: 160px;
  flex-shrink: 0;
  margin: 0 0.4rem;
}

.col-core {
  width: 120px;
  flex-shrink: 0;
  margin: 0 0.4rem;
}

.col-corona {
  width: 130px;
  flex-shrink: 0;
  margin: 0 0.4rem;
}

.col-note {
  flex: 1;
  min-width: 80px;
  margin: 0 0.4rem;
}

.col-action {
  width: 30px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.text-right {
  text-align: right;
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

.seg-type-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.seg-type-tag.order {
  background: #e0f2fe;
  color: #0284c7;
}

.seg-type-tag.edge {
  background: #f1f5f9;
  color: #475569;
}

.seg-type-tag.defect_cut {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.form-input {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.full-w {
  width: 100%;
}

.readonly-val {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--primary-color);
  padding: 0 0.2rem;
}

.text-xs {
  font-size: 0.7rem;
}

.text-sm {
  font-size: 0.8rem;
}

.ml-1 {
  margin-left: 0.25rem;
}

.order-customer {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-main);
}

.seg-note-text {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.seg-req-input {
  width: 100%;
  font-size: 0.78rem;
  padding: 0.3rem 0.45rem;
}

/* 破卷备注输入框：紫色边框文字，与表格列中的破卷标识一致 */
.seg-corona-input {
  width: 100%;
  font-size: 0.78rem;
  padding: 0.3rem 0.45rem;
  border-color: #ddd6fe;
  color: #5b21b6;
  font-family: var(--font-mono);
}

.seg-corona-input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
}

.plan-inputs {
  display: flex;
  align-items: center;
  gap: 3px;
}

.plan-inputs .seg-input {
  width: 52px;
  flex-shrink: 0;
  font-size: 0.78rem;
  padding: 0.3rem 0.35rem;
}

.plan-sep {
  font-size: 0.75rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.col-dash {
  color: var(--text-muted);
  opacity: 0.5;
}

.icon-btn.delete {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.icon-btn.delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* 实时计算区 */
.calc-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
}

.calc-summary.has-error {
  background: #fff1f2;
  border-color: #fecdd3;
}

.calc-summary.has-warn {
  background: #fffbeb;
  border-color: #fde68a;
}

.calc-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.calc-label {
  color: var(--text-muted);
}

.calc-val {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
}

.calc-unit {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.calc-sep {
  color: #cbd5e1;
}

.text-error {
  color: var(--status-error);
}

.text-muted {
  color: var(--text-muted);
}

.waste-rate-badge {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.1rem;
}

.waste-rate-badge.green {
  color: var(--status-success);
}

.waste-rate-badge.orange {
  color: #d97706;
}

.waste-rate-badge.red {
  color: var(--status-error);
}


/* 面板提示与说明区 */
.alert-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  margin-top: 0.75rem;
  font-weight: 500;
}

.alert-msg.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.alert-msg.warn {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  line-height: 1.5;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.border-warning {
  border-color: #fbbf24;
}

.border-warning:focus {
  border-color: #d97706;
  box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.1);
}

/* ─── 底部操作 ─────────────────────────────────────── */
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-light);
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.footer-hint {
  font-size: 0.85rem;
  color: var(--status-error);
  font-weight: 500;
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  outline: none;
}

.btn.primary {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
}

.btn.primary:not(:disabled):hover {
  background: var(--primary-hover);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
}

.btn.primary:disabled {
  background: var(--border-medium);
  color: var(--text-muted);
  cursor: not-allowed;
  box-shadow: none;
}

.btn.secondary {
  background: white;
  color: var(--text-secondary);
  border: 1px solid var(--border-medium);
}

.btn.secondary:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* ─── 订单选择按钮 ─────────────────────────────────── */
.order-pick-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  font-size: 0.78rem;
  border: 1px dashed var(--primary-color);
  border-radius: var(--radius-sm);
  color: var(--primary-color);
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
}

.order-pick-btn:hover {
  background: var(--primary-light);
  border-style: solid;
}

.order-pick-btn.has-order {
  border-style: solid;
  border-color: var(--border-medium);
  color: var(--text-main);
}

.order-pick-btn.has-order:hover {
  border-color: var(--primary-color);
}

.picked-no {
  font-weight: 600;
  font-size: 0.75rem;
}

.picked-cust {
  color: var(--text-muted);
  font-size: 0.7rem;
}

/* ─── 降级品提示 ──────────────────────────────────── */
.grade-warn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--status-warning-bg);
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  color: #92400e;
  font-weight: 500;
  margin-bottom: 8px;
}

/* ─── 边丝超范围输入 ─────────────────────────────── */
.input-warn {
  border-color: var(--status-warning) !important;
  background: #fffbeb !important;
}
</style>
