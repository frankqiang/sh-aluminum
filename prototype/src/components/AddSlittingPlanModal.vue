<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="closeModal">
        <Transition name="modal-scale">
          <div v-if="visible" class="modal-content" role="dialog" aria-modal="true">

            <!-- 弹窗头部 -->
            <div class="modal-header">
              <div class="modal-title-row">
                <Scissors :size="18" class="title-icon" />
                <h3 class="modal-title">新增分切计划</h3>
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
                    <label>母卷号 <span class="required">*</span></label>
                    <CustomSelect
                      v-model="selectedCoilNo"
                      :options="coilOptions"
                      placeholder="选择待分切母卷"
                    />
                  </div>
                  <div class="form-group flex-1">
                    <label>机台设备 <span class="required">*</span></label>
                    <CustomSelect
                      v-model="selectedMachineId"
                      :options="filteredMachineOptions"
                      placeholder="选择分切机"
                    />
                  </div>
                </div>

                <!-- 母卷自动带出信息（只读） -->
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
                      <span class="chip-val font-mono">{{ selectedMaterial.width }}<span class="chip-unit">mm</span></span>
                    </div>
                    <div class="info-chip">
                      <span class="chip-label">厚度</span>
                      <span class="chip-val font-mono">{{ selectedMaterial.thickness }}<span class="chip-unit">μm</span></span>
                    </div>
                    <div class="info-chip">
                      <span class="chip-label">长度</span>
                      <span class="chip-val font-mono">{{ selectedMaterial.length }}<span class="chip-unit">m</span></span>
                    </div>
                    <div class="info-chip">
                      <span class="chip-label">重量</span>
                      <span class="chip-val font-mono">{{ selectedMaterial.weight }}<span class="chip-unit">kg</span></span>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- ❷ 质量评审区（只读参考） -->
              <Transition name="fade-in">
                <div v-if="selectedMaterial" class="section-block review-block">
                  <div class="section-label">
                    <span class="section-num">②</span> 质量评审
                    <span class="review-status-tag" :class="selectedMaterial.reviewStatus">
                      {{ reviewStatusLabel(selectedMaterial.reviewStatus) }}
                    </span>
                  </div>

                  <!-- 待评审警告 -->
                  <div v-if="selectedMaterial.reviewStatus === 'pending'" class="review-warning">
                    <AlertTriangle :size="15" />
                    <span>该母卷尚未完成质量评审，排定计划后需等待评审通过才能执行生产</span>
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
                          <div
                            v-for="(inst, idx) in selectedMaterial.review.instructions"
                            :key="idx"
                            class="inst-item"
                          >
                            <span class="inst-badge">{{ idx + 1 }}</span>
                            <span class="inst-side">{{ inst.side }}</span>
                            <span class="inst-range font-mono">
                              {{ inst.start === inst.end ? inst.start : `${inst.start}-${inst.end}` }}mm
                            </span>
                            <span class="inst-defect">{{ inst.defectType }}</span>
                            <ArrowRight :size="11" class="inst-arrow" />
                            <span class="inst-action">{{ inst.action }}</span>
                          </div>
                        </div>
                      </div>
                      <div v-else class="no-defect-tip">
                        <CheckCircle :size="14" />
                        <span>无缺陷处理指令，可全宽分切</span>
                      </div>
                    </div>
                    <!-- 有效宽度 -->
                    <div class="effective-width-block">
                      <span class="ew-label">有效宽度</span>
                      <span class="ew-value font-mono">{{ effectiveWidth }}</span>
                      <span class="ew-unit">mm</span>
                      <span v-if="effectiveWidth < selectedMaterial.width" class="ew-diff">
                        (原始 {{ selectedMaterial.width }}mm，减少 {{ selectedMaterial.width - effectiveWidth }}mm)
                      </span>
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- ❸ 切刀方案设计区 -->
              <div class="section-block">
                <div class="section-label">
                  <span class="section-num">③</span> 切刀方案设计
                  <button class="add-seg-btn" :disabled="!selectedMaterial" @click="addOrderSegment">
                    <Plus :size="13" />
                    <span>添加订单段</span>
                  </button>
                </div>

                <div v-if="!selectedMaterial" class="no-material-tip">
                  <Info :size="14" />
                  <span>请先选择母卷，系统将根据评审信息自动生成切刀布局</span>
                </div>

                <template v-else>
                  <!-- 段列表表头 -->
                  <div class="segments-header">
                    <div class="col-tag">类型</div>
                    <div class="col-order">绑定订单</div>
                    <div class="col-width">宽度(mm)</div>
                    <div class="col-customer">客户</div>
                    <div class="col-length">米数范围</div>
                    <div class="col-core">订单要求</div>
                    <div class="col-note">说明</div>
                    <div class="col-action"></div>
                  </div>

                  <!-- 段列表 -->
                  <div
                    v-for="(seg, idx) in segments"
                    :key="seg.id"
                    class="segment-row"
                    :class="`seg-row-${seg.type}`"
                  >
                    <!-- 类型标签（只读） -->
                    <div class="col-tag">
                      <span class="seg-type-tag" :class="seg.type">
                        {{ segTypeLabel(seg.type) }}
                      </span>
                    </div>

                    <!-- 绑定订单（仅订单类型） -->
                    <div class="col-order">
                      <template v-if="seg.type === 'order'">
                        <CustomSelect
                          v-model="seg.orderId"
                          :options="getAvailableOrderOptions(seg)"
                          placeholder="选择订单"
                          class="order-select"
                          @update:modelValue="(val) => onOrderSelected(seg, val)"
                        />
                      </template>
                      <span v-else class="col-dash">—</span>
                    </div>

                    <!-- 宽度 -->
                    <div class="col-width">
                      <!-- 边丝：可调整 -->
                      <input
                        v-if="seg.type === 'edge'"
                        type="number"
                        v-model="seg.width"
                        class="form-input seg-input text-right font-mono"
                        min="0"
                        max="30"
                      />
                      <!-- 订单/切除：只读 -->
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

                    <!-- 订单要求（可编辑，选订单后预填） -->
                    <div class="col-core">
                      <template v-if="seg.type === 'order'">
                        <input
                          type="text"
                          v-model="seg.orderReq"
                          class="form-input seg-input seg-req-input"
                          placeholder="如管芯规格、装框要求…"
                        />
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
                      <button class="icon-btn delete" @click="removeSegment(idx)" title="删除此段">
                        <Trash2 :size="15" />
                      </button>
                    </div>
                  </div>

                  <!-- 实时计算区 -->
                  <div class="calc-summary" :class="{ 'has-error': isOverWidth, 'has-warn': isOverEffective && !isOverWidth }">
                    <div class="calc-item">
                      <span class="calc-label">母卷总宽</span>
                      <span class="calc-val font-mono">{{ selectedMaterial.width }}</span>
                      <span class="calc-unit">mm</span>
                    </div>
                    <div class="calc-sep">|</div>
                    <div class="calc-item">
                      <span class="calc-label">有效宽度</span>
                      <span class="calc-val font-mono text-primary">{{ effectiveWidth }}</span>
                      <span class="calc-unit">mm</span>
                    </div>
                    <div class="calc-sep">|</div>
                    <div class="calc-item">
                      <span class="calc-label">已分配</span>
                      <span class="calc-val font-mono">{{ totalAllocated }}</span>
                      <span class="calc-unit">mm</span>
                    </div>
                    <div class="calc-sep">|</div>
                    <div class="calc-item">
                      <span class="calc-label">剩余(废料)</span>
                      <span class="calc-val font-mono" :class="{ 'text-error': isOverWidth, 'text-muted': remaining > 0 }">
                        {{ remaining }}
                      </span>
                      <span class="calc-unit">mm</span>
                    </div>
                    <div class="calc-sep">|</div>
                    <div class="calc-item">
                      <span class="calc-label">废料率</span>
                      <span class="waste-rate-badge" :class="wasteRateClass">{{ wasteRate }}%</span>
                    </div>
                  </div>

                  <!-- 错误 / 警告提示 -->
                  <div v-if="isOverWidth" class="alert-msg error">
                    <AlertCircle :size="14" />
                    <span>已分配宽度超出母卷总宽！请调整边丝或删除订单段。</span>
                  </div>
                  <div v-else-if="isOverEffective" class="alert-msg warn">
                    <AlertTriangle :size="14" />
                    <span>订单段总宽超出有效宽度（{{ effectiveWidth }}mm），可能与缺陷区重叠。</span>
                  </div>
                </template>
              </div>

              <!-- ❹ 计划说明 -->
              <div class="section-block">
                <div class="section-label">
                  <span class="section-num">④</span> 计划说明 <span class="optional">（选填）</span>
                </div>
                <textarea
                  v-model="planNote"
                  class="form-textarea"
                  placeholder="如：合理计算米数尽量不废料，装框单备注管芯壁厚…"
                  rows="2"
                ></textarea>
              </div>

            </div><!-- /modal-body -->

            <!-- 底部按钮 -->
            <div class="modal-footer">
              <div class="footer-hint" v-if="!canSubmit && selectedMaterial">
                <span v-if="!selectedMachineId">请选择机台</span>
                <span v-else-if="orderSegCount === 0">请至少添加一个订单切刀段</span>
                <span v-else-if="isOverWidth">宽度超出母卷</span>
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
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import {
  X, Plus, Trash2, AlertCircle, AlertTriangle, ArrowRight,
  CheckCircle, Info, Scissors
} from 'lucide-vue-next'
import CustomSelect from './CustomSelect.vue'
import { materialPool } from '../data/slitting-material-pool.js'
import { orderPool } from '../data/order-pool.js'

const props = defineProps({
  visible: Boolean,
  machines: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'submit'])

// ─── 状态 ───────────────────────────────────────────────
const selectedCoilNo = ref('')
const selectedMachineId = ref('')
const planNote = ref('')

// 动态段列表
const segments = reactive([
  { type: 'edge', width: 10, orderId: null, orderInfo: null, note: '' }
])

// ─── 母卷选项 ────────────────────────────────────────────
const coilOptions = computed(() =>
  materialPool.map(m => ({
    value: m.coilNo,
    label: `${m.coilNo}  （${m.alloy} · ${m.productType} · ${m.width}mm）`
  }))
)

// 选中的母卷完整信息
const selectedMaterial = computed(() =>
  materialPool.find(m => m.coilNo === selectedCoilNo.value) || null
)

// ─── 机台选项（电池箔只显示有检测设备的机台）──────────────
const filteredMachineOptions = computed(() => {
  let list = props.machines
  // 若母卷是电池箔，过滤掉无检测设备的机台
  if (selectedMaterial.value?.productType === '电池箔') {
    list = list.filter(m => m.hasDetection)
  }
  return list.map(m => ({
    value: m.id,
    label: `${m.name}  (${m.detectionNote})`
  }))
})

// ─── 质量评审 ────────────────────────────────────────────
const effectiveWidth = computed(() => {
  if (!selectedMaterial.value) return 0
  return selectedMaterial.value.review?.effectiveWidth ?? selectedMaterial.value.width
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

// ─── 订单池 ─────────────────────────────────────────────
// 已选择的订单号（用于排除重复选择）
const usedOrderNos = computed(() =>
  segments
    .filter(s => s.orderInfo)
    .map(s => s.orderInfo.orderNo)
)

// 根据当前母卷过滤可用订单（合金匹配 + 宽度 ≤ 有效宽度）
const baseAvailableOrders = computed(() => {
  if (!selectedMaterial.value) return []
  const alloy = selectedMaterial.value.alloy
  return orderPool.filter(o =>
    o.alloy === alloy &&
    o.width <= effectiveWidth.value
  )
})

// 某一段的可用订单（排除其他段已选的）
function getAvailableOrderOptions(seg) {
  return baseAvailableOrders.value
    .filter(o => !usedOrderNos.value.includes(o.orderNo) || o.orderNo === seg.orderInfo?.orderNo)
    .map(o => ({
      value: o.orderNo,
      label: `${o.orderNo}  ${o.customer}  ${o.width}mm  (${o.lengthMin}~${o.lengthMax}m)`
    }))
}

// 选中订单时自动带出信息
// 选中订单：自动带出宽度，预带订单要求（不覆盖已填内容）
function onOrderSelected(seg, orderNo) {
  const order = orderPool.find(o => o.orderNo === orderNo)
  if (order) {
    seg.orderInfo = order
    seg.width = order.width
    // 仅在用户未手动填写订单要求时才预带
    if (!seg.orderReq) {
      seg.orderReq = order.coreSpec || ''
    }
  } else {
    seg.orderInfo = null
    seg.width = null
  }
}

// 段类型切换时清空订单信息
function onSegTypeChange(seg) {
  if (seg.type !== 'order') {
    seg.orderId = null
    seg.orderInfo = null
    seg.width = seg.type === 'edge' ? 10 : null
  } else {
    seg.width = null
  }
}

// ─── 辅助：段类型标签文字 ─────────────────────────────────
function segTypeLabel(type) {
  const map = { edge: '边丝', order: '订单', defect_cut: '切除', waste: '余料' }
  return map[type] || type
}

// ─── 自动生成初始段列表 ──────────────────────────────────
let _segId = 0
function makeId() { return ++_segId }

function buildInitialSegments(material) {
  const segs = []
  // 左边丝
  segs.push({ id: makeId(), type: 'edge', width: 10, orderId: null, orderInfo: null, note: '左边丝', autoGen: false })

  // 来自评审的切除指令 → 自动生成切除段
  const instructions = material.review?.instructions ?? []
  for (const inst of instructions) {
    if (['切除', '吸边'].includes(inst.action) && inst.end > inst.start) {
      segs.push({
        id: makeId(),
        type: 'defect_cut',
        width: inst.end - inst.start,
        orderId: null,
        orderInfo: null,
        note: `${inst.side} ${inst.start}-${inst.end}mm ${inst.defectType}`,
        autoGen: true
      })
    }
  }

  // 右边丝
  segs.push({ id: makeId(), type: 'edge', width: 10, orderId: null, orderInfo: null, note: '右边丝', autoGen: false })

  return segs
}

// 自动匹配最优订单：部向宽度最大且 ≤ 有效宽度
function findBestOrder(material, excludeOrderNos = []) {
  if (!material) return null
  const ew = material.review?.effectiveWidth ?? material.width
  return orderPool
    .filter(o =>
      o.alloy === material.alloy &&
      o.width <= ew &&
      !excludeOrderNos.includes(o.orderNo)
    )
    .sort((a, b) => b.width - a.width)[0] || null
}

// 选母卷时重置段列表，并自动匹配最优订单
watch(selectedCoilNo, (val) => {
  if (!val) {
    segments.splice(0, segments.length)
    return
  }
  const material = materialPool.find(m => m.coilNo === val)
  if (!material) return
  const initial = buildInitialSegments(material)

  // 自动匹配最优订单预带到订单段
  const bestOrder = findBestOrder(material)
  const orderSeg = {
    id: makeId(),
    type: 'order',
    width: bestOrder?.width ?? null,
    orderId: bestOrder?.orderNo ?? null,
    orderInfo: bestOrder ?? null,
    orderReq: bestOrder?.coreSpec ?? '',
    note: ''
  }
  // 将订单段插入右边丝前
  const rightEdgeIdx = initial.length - 1
  initial.splice(rightEdgeIdx, 0, orderSeg)
  segments.splice(0, segments.length, ...initial)
})

// ─── 段操作 ─────────────────────────────────────────────
function addOrderSegment() {
  // 尝试匹配尚未使用的最优订单
  const usedNos = segments.filter(s => s.orderInfo).map(s => s.orderInfo.orderNo)
  const bestOrder = findBestOrder(selectedMaterial.value, usedNos)
  const rightEdgeIdx = segments.findLastIndex(s => s.type === 'edge')
  const insertAt = rightEdgeIdx > 0 ? rightEdgeIdx : segments.length
  segments.splice(insertAt, 0, {
    id: makeId(),
    type: 'order',
    width: bestOrder?.width ?? null,
    orderId: bestOrder?.orderNo ?? null,
    orderInfo: bestOrder ?? null,
    orderReq: bestOrder?.coreSpec ?? '',
    note: ''
  })
}

function removeSegment(idx) {
  segments.splice(idx, 1)
}

// ─── 实时计算 ────────────────────────────────────────────
const totalAllocated = computed(() =>
  segments.reduce((sum, s) => sum + (Number(s.width) || 0), 0)
)

const remaining = computed(() =>
  (selectedMaterial.value?.width || 0) - totalAllocated.value
)

const isOverWidth = computed(() => remaining.value < 0)

// 订单段总宽
const orderTotalWidth = computed(() =>
  segments
    .filter(s => s.type === 'order')
    .reduce((sum, s) => sum + (Number(s.width) || 0), 0)
)

const isOverEffective = computed(() =>
  orderTotalWidth.value > effectiveWidth.value
)

// 废料率 = (总宽 - 订单总宽) / 总宽
// 废料 = 边丝 + 切除 + 剩余未分配
const wasteRate = computed(() => {
  const mw = selectedMaterial.value?.width || 0
  if (mw === 0) return '0.0'
  const orderWidth = orderTotalWidth.value
  return (((mw - orderWidth) / mw) * 100).toFixed(1)
})

const wasteRateClass = computed(() => {
  const r = parseFloat(wasteRate.value)
  if (r <= 5) return 'green'
  if (r > 15) return 'red'
  return 'orange'
})

const orderSegCount = computed(() =>
  segments.filter(s => s.type === 'order').length
)

// ─── 提交校验 ────────────────────────────────────────────
const canSubmit = computed(() => {
  if (!selectedCoilNo.value) return false
  if (!selectedMachineId.value) return false
  if (orderSegCount.value === 0) return false
  if (isOverWidth.value) return false
  return true
})

// ─── 弹窗打开时重置 ──────────────────────────────────────
watch(() => props.visible, (val) => {
  if (val) {
    selectedCoilNo.value = ''
    selectedMachineId.value = ''
    planNote.value = ''
    segments.splice(0, segments.length)
  }
})

// ─── 操作 ────────────────────────────────────────────────
function closeModal() {
  emit('close')
}

function submitForm() {
  if (!canSubmit.value) return
  const submitData = {
    coilNo: selectedCoilNo.value,
    machineId: selectedMachineId.value,
    material: selectedMaterial.value,
    segments: Array.from(segments),
    wasteRate: wasteRate.value,
    planNote: planNote.value
  }
  emit('submit', submitData)
}
</script>

<style scoped>
/* ─── 遮罩 & 动画 ─────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-scale-enter-from,
.modal-scale-leave-to { opacity: 0; transform: scale(0.96) translateY(8px); }

.fade-in-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-in-enter-from { opacity: 0; transform: translateY(-6px); }

/* ─── 弹窗主体 ───────────────────────────────────────── */
.modal-content {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 960px;
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

.title-icon { color: var(--primary-color); }

.modal-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  transition: all 0.2s;
}
.close-btn:hover { background: var(--bg-hover); color: var(--text-main); }

.modal-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

/* ─── 区块通用 ───────────────────────────────────────── */
.section-block {
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1rem 1.1rem;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.9rem;
}

.section-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.optional {
  font-weight: 400;
  color: var(--text-muted);
  text-transform: none;
  letter-spacing: 0;
}

/* ─── 来料选择区 ─────────────────────────────────────── */
.select-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.required { color: var(--status-error); margin-left: 2px; }

/* 母卷自动带出信息条 */
.material-info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0.7rem 0.85rem;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.info-chip {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 0.82rem;
}

.chip-label {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.chip-val {
  font-weight: 600;
  color: var(--text-main);
}

.chip-unit {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-left: 1px;
}

.badge-battery {
  background: #fee2e2;
  color: #dc2626;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.badge-double {
  background: #f1f5f9;
  color: #475569;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* ─── 质量评审区 ─────────────────────────────────────── */
.review-block {
  border-left: 3px solid var(--primary-color);
}

.review-status-tag {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 4px;
  text-transform: none;
  letter-spacing: 0;
}
.review-status-tag.reviewed { background: var(--status-success-bg); color: var(--status-success); }
.review-status-tag.pending { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.review-status-tag.none { background: var(--border-light); color: var(--text-muted); }

.review-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.65rem 0.9rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-md);
  color: #b45309;
  font-size: 0.83rem;
}

.review-content-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: start;
}

.review-left {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 130px;
}

.review-right { flex: 1; }

.review-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
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
.review-val.conclusion { color: var(--primary-color); }
.text-success { color: var(--status-success); }
.text-warning { color: #d97706; }

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

.inst-range { color: var(--text-secondary); }
.inst-defect { color: #dc2626; font-size: 0.78rem; }
.inst-arrow { color: var(--text-muted); }
.inst-action { font-weight: 600; color: var(--primary-color); font-size: 0.78rem; }

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

/* ─── 切刀方案区 ─────────────────────────────────────── */
.add-seg-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--primary-color);
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.18s;
  margin-left: auto;
  text-transform: none;
  letter-spacing: 0;
}
.add-seg-btn:hover:not(:disabled) { background: #dbeafe; }
.add-seg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.no-material-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.83rem;
  color: var(--text-muted);
  padding: 0.75rem;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-medium);
}

/* 表头 */
.segments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.4rem 0.5rem;
  font-size: 0.73rem;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 4px;
}

/* 段行 */
.segment-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0.5rem;
  border-bottom: 1px solid var(--border-light);
  transition: background 0.15s;
}

.segment-row:last-child { border-bottom: none; }

.seg-row-order { background: #f8faff; }
.seg-row-defect_cut { background: #fff7f7; }
.seg-row-edge { background: #f8fafc; }

/* 列宽 */
.col-tag    { width: 56px;  flex-shrink: 0; }
.col-order  { width: 200px; flex-shrink: 0; }
.col-width  { width: 80px;  flex-shrink: 0; }
.col-customer { flex: 1; min-width: 80px; }
.col-length { width: 130px; flex-shrink: 0; }
.col-core   { width: 140px; flex-shrink: 0; }
.col-note   { flex: 1; min-width: 100px; }
.col-action { width: 30px; flex-shrink: 0; display: flex; justify-content: center; }

/* 类型标签 */
.seg-type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}
.seg-type-tag.edge       { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
.seg-type-tag.order      { background: #eff6ff; color: var(--primary-color); border: 1px solid #bfdbfe; }
.seg-type-tag.defect_cut { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.seg-type-tag.waste      { background: #f9fafb; color: #9ca3af; border: 1px solid #e5e7eb; }

/* 说明文字 */
.seg-note-text {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

/* 订单要求输入框：列宽内全宽显示，字号稍小 */
.seg-req-input {
  width: 100%;
  font-size: 0.78rem;
  padding: 0.3rem 0.45rem;
}

/* CustomSelect 在段内的尺寸覆盖 */
.order-select :deep(.select-trigger) {
  min-height: unset;
  padding: 0.35rem 0.5rem;
  font-size: 0.8rem;
  border-radius: var(--radius-md);
}

.form-input {
  padding: 0.38rem 0.5rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-size: 0.83rem;
  color: var(--text-main);
  background: var(--bg-surface);
  transition: border-color 0.2s;
  font-family: inherit;
  width: 100%;
}
.form-input:focus { outline: none; border-color: var(--primary-color); }

.seg-input { padding: 0.35rem 0.45rem; font-size: 0.82rem; }
.text-right { text-align: right; }

.readonly-val {
  display: block;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--primary-color);
  text-align: center;
  padding: 0.4rem 0.3rem;
}

.order-customer {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-main);
}

.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.8rem; }
.text-secondary { color: var(--text-secondary); }

.icon-btn.delete {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  opacity: 0.65;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.18s;
}
.icon-btn.delete:hover { background: #fee2e2; opacity: 1; }

/* ─── 实时计算区 ─────────────────────────────────────── */
.calc-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  margin-top: 0.8rem;
  padding: 0.6rem 0.9rem;
  background: #f1f5f9;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all 0.2s;
}
.calc-summary.has-error { background: #fef2f2; border-color: #fecaca; }
.calc-summary.has-warn  { background: #fffbeb; border-color: #fde68a; }

.calc-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 0 0.75rem;
}

.calc-sep {
  color: var(--border-medium);
  font-size: 0.9rem;
  user-select: none;
}

.calc-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.calc-val {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
}

.calc-unit {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.text-primary { color: var(--primary-color); }
.text-error   { color: var(--status-error); }
.text-success { color: var(--status-success); }

.waste-rate-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}
.waste-rate-badge.green  { background: var(--status-success-bg); color: var(--status-success); }
.waste-rate-badge.orange { background: #fef3c7; color: #d97706; }
.waste-rate-badge.red    { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }

/* 警告/错误提示 */
.alert-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 500;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
}
.alert-msg.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; }
.alert-msg.warn  { color: #b45309; background: #fffbeb; border: 1px solid #fde68a; }

/* ─── 计划说明 ───────────────────────────────────────── */
.form-textarea {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-size: 0.87rem;
  color: var(--text-main);
  background: var(--bg-surface);
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
  margin-top: 2px;
}
.form-textarea:focus { outline: none; border-color: var(--primary-color); }

/* ─── 底部 ───────────────────────────────────────────── */
.modal-footer {
  padding: 0.9rem 1.5rem;
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-main);
  flex-shrink: 0;
}

.footer-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.48rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
}

.btn.secondary {
  background: var(--bg-surface);
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);
}
.btn.secondary:hover { background: var(--bg-hover); }

.btn.primary {
  background: var(--primary-color);
  color: white;
}
.btn.primary:hover:not(:disabled) { background: var(--primary-hover); }
.btn.primary:disabled { opacity: 0.45; cursor: not-allowed; }

/* ─── 工具类 ─────────────────────────────────────────── */
.font-mono { font-family: var(--font-mono); }
</style>
