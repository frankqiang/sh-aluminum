<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <!-- 头部 -->
          <div class="modal-header">
            <div class="modal-title">
              <Plus :size="18" class="title-icon" />
              <span>新增轧机计划</span>
            </div>

            <!-- 步骤指示器 -->
            <div class="step-indicator">
              <div class="step-circle" :class="{ active: step >= 1 }">1</div>
              <div class="step-line" :class="{ active: step === 2 }"></div>
              <div class="step-circle" :class="{ active: step === 2 }">2</div>
            </div>

            <button class="close-btn" @click="handleClose">
              <X :size="20" />
            </button>
          </div>

          <!-- Step 1: 来料选择 + 基础信息 -->
          <div class="modal-body" v-if="step === 1">

            <!-- 区域 1: 来料选择（与分切弹窗统一） -->
            <div class="v-section">
              <div class="v-section-title">
                <span class="section-num">①</span> 来料选择
              </div>
              <div class="form-grid">
                <div class="form-item span-full">
                  <span class="label">新神火卷号 <span class="req">*</span></span>
                  <CustomSelect v-model="selectedCoilNo" :options="coilOptions" placeholder="选择新神火卷号" />
                </div>
              </div>

              <!-- 坯料自动带出信息（只读） -->
              <Transition name="fade-in">
                <div v-if="selectedMaterial" class="material-info-bar">
                  <div class="info-chip">
                    <span class="chip-label">坯料卷号</span>
                    <span class="chip-val font-mono">{{ selectedMaterial.blankCoilNo }}</span>
                  </div>
                  <div class="info-chip">
                    <span class="chip-label">合金</span>
                    <span class="chip-val font-mono">{{ selectedMaterial.alloy }}</span>
                  </div>
                  <div class="info-chip">
                    <span class="chip-label">用途</span>
                    <span class="chip-val" :class="'usage-' + selectedMaterial.usage">
                      {{ usageLabelMap[selectedMaterial.usage] || selectedMaterial.usage }}
                    </span>
                  </div>
                  <div class="info-chip">
                    <span class="chip-label">宽度</span>
                    <span class="chip-val font-mono">{{ selectedMaterial.width }}<span
                        class="chip-unit">mm</span></span>
                  </div>
                  <div class="info-chip">
                    <span class="chip-label">厚度</span>
                    <span class="chip-val font-mono">{{ selectedMaterial.inThickness }}<span
                        class="chip-unit">mm</span></span>
                  </div>
                  <div class="info-chip">
                    <span class="chip-label">重量</span>
                    <span class="chip-val font-mono">{{ selectedMaterial.weight?.toLocaleString() }}<span
                        class="chip-unit">kg</span></span>
                  </div>
                  <div class="info-chip">
                    <span class="chip-label">批次</span>
                    <span class="chip-val font-mono">{{ selectedMaterial.batch }}</span>
                  </div>
                  <div class="info-chip" v-if="selectedMaterial.customer">
                    <span class="chip-label">客户</span>
                    <span class="chip-val">{{ selectedMaterial.customer }}</span>
                  </div>
                  <div class="info-chip" v-if="selectedMaterial.execOrderNo">
                    <span class="chip-label">执行单号</span>
                    <span class="chip-val font-mono" style="color:var(--primary-color);font-weight:600;">{{
                      selectedMaterial.execOrderNo }}</span>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- 区域 2: 目标机台 + 卷号 -->
            <Transition name="fade-in">
              <div class="v-section" v-if="selectedMaterial">
                <div class="v-section-title">
                  <span class="section-num">②</span> 排产配置
                </div>
                <div class="form-grid">
                  <div class="form-item">
                    <span class="label">目标机台 <span class="req">*</span></span>
                    <CustomSelect v-model="form.machineId" :options="machineGroupsOptions" placeholder="选择机台"
                      :grouped="true" />
                  </div>
                  <div class="form-item">
                    <span class="label">成品终厚 (μm) <span class="req">*</span></span>
                    <input type="number" class="form-input number" placeholder="目标最终厚度" v-model="form.finalThickness">
                  </div>
                  <div class="form-item span-full">
                    <span class="label">客户</span>
                    <input type="text" class="form-input" placeholder="选填，可覆盖来料客户" v-model="form.customer">
                  </div>
                </div>
              </div>
            </Transition>

          </div>

          <!-- Step 2: 道次配置 -->
          <div class="modal-body" v-else>

            <div class="v-section">
              <div class="v-section-title">
                <span class="section-num">③</span> 道次配置
              </div>

              <div class="machine-hint">
                <Info :size="14" class="hint-icon" />
                <span>当前机台: <strong>{{ selectedMachineName }}</strong> ({{ selectedMachineCapability }})</span>
              </div>

              <!-- 来料概要（只读） -->
              <div class="material-summary-bar">
                <span class="summary-item">
                  <span class="summary-label">卷号</span>
                  <span class="summary-val font-mono">{{ selectedCoilNo }}</span>
                </span>
                <span class="summary-sep">|</span>
                <span class="summary-item">
                  <span class="summary-label">来料厚</span>
                  <span class="summary-val font-mono">{{ selectedMaterial?.inThickness }}mm</span>
                </span>
                <span class="summary-sep">|</span>
                <span class="summary-item">
                  <span class="summary-label">宽度</span>
                  <span class="summary-val font-mono">{{ selectedMaterial?.width }}mm</span>
                </span>
                <span class="summary-sep">|</span>
                <span class="summary-item">
                  <span class="summary-label">终厚</span>
                  <span class="summary-val font-mono" style="color:var(--primary-color);font-weight:700;">{{
                    form.finalThickness }}μm</span>
                </span>
              </div>

              <table class="pass-form-table">
                <thead>
                  <tr>
                    <th width="80">道次</th>
                    <th>目标厚度 (μm)</th>
                    <th width="40"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, index) in form.passes" :key="index">
                    <td class="pass-num">P{{ p.n }}</td>
                    <td>
                      <input type="number" class="form-input number pass-input" placeholder="输入厚度" v-model="p.t">
                    </td>
                    <td class="action-cell">
                      <button class="del-btn" @click="removePass(index)" title="删除该道次">
                        <Trash2 :size="14" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button class="add-pass-btn" @click="addPass">
                <Plus :size="14" /> 添加道次
              </button>
            </div>

            <div class="v-section">
              <div class="v-section-title">
                <span class="section-num">④</span> 工艺说明
              </div>
              <textarea class="form-input textarea" placeholder="在此输入工艺指标要求、质量指控指令或操作注意事项等..."
                v-model="form.remark"></textarea>
            </div>

          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <template v-if="step === 1">
              <button class="footer-btn secondary" @click="handleClose">取消</button>
              <button class="footer-btn primary" @click="nextStep" :disabled="!canGoNext">下一步
                <ArrowRight :size="16" />
              </button>
            </template>
            <template v-else>
              <button class="footer-btn secondary" @click="step = 1">
                <ArrowLeft :size="16" /> 上一步
              </button>
              <button class="footer-btn primary" @click="submit" :disabled="!canSubmit">确认提交</button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Plus, X, ArrowRight, ArrowLeft, Info, Trash2 } from 'lucide-vue-next'
import CustomSelect from './CustomSelect.vue'
import { rollingMachines } from '../data/mock.js'
import { rollingMaterialPool } from '../data/rolling-material-pool.js'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'submit'])

const step = ref(1)

// 来料选择状态（按新神火卷号选择）
const selectedCoilNo = ref('')

// 表单数据
const form = reactive({
  machineId: '',
  finalThickness: '',
  customer: '',
  passes: [],
  remark: ''
})

// 每次打开弹窗时重置状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    step.value = 1
    selectedCoilNo.value = ''
    Object.assign(form, {
      machineId: '',
      finalThickness: '',
      customer: '',
      passes: [{ n: 1, t: '' }],
      remark: ''
    })
  }
})

function handleClose() {
  emit('close')
}

// ─── 来料池选项（按新神火卷号展示） ─────────────────
const coilOptions = computed(() =>
  rollingMaterialPool.map(m => ({
    value: m.coilNo,
    label: `${m.coilNo}  （${m.alloy} · ${usageLabelMap[m.usage] || m.usage} · ${m.width}mm）`
  }))
)

// 选中的来料完整信息
const selectedMaterial = computed(() =>
  rollingMaterialPool.find(m => m.coilNo === selectedCoilNo.value) || null
)

// 选卷号后自动填充客户
watch(selectedCoilNo, (val) => {
  const mat = rollingMaterialPool.find(m => m.coilNo === val)
  if (mat) {
    form.customer = mat.customer || ''
  }
})

const usageLabelMap = {
  '电': '电池箔',
  '食': '食品箔',
  '药': '药品箔',
  '双零': '双零箔',
}

// ─── Step 1 逻辑 ─────────────────────────────────────
const machineGroupsOptions = computed(() => {
  return [
    {
      label: '粗轧机 (1-3号)',
      options: rollingMachines.filter(m => m.id <= 3).map(m => ({ label: m.name, value: m.id }))
    },
    {
      label: '中轧机 (4-6号)',
      options: rollingMachines.filter(m => m.id >= 4 && m.id <= 6).map(m => ({ label: m.name, value: m.id }))
    },
    {
      label: '中精轧 (7号)',
      options: rollingMachines.filter(m => m.id === 7).map(m => ({ label: m.name, value: m.id }))
    },
    {
      label: '精轧机 (8-14号)',
      options: rollingMachines.filter(m => m.id >= 8).map(m => ({ label: m.name, value: m.id }))
    },
  ]
})

const canGoNext = computed(() => {
  return selectedCoilNo.value !== '' &&
    form.machineId !== '' &&
    form.finalThickness !== ''
})

function nextStep() {
  if (canGoNext.value) {
    step.value = 2
  }
}

// ─── Step 2 逻辑 ─────────────────────────────────────
const selectedMachine = computed(() => {
  return rollingMachines.find(m => m.id === form.machineId)
})

const selectedMachineName = computed(() => {
  return selectedMachine.value ? selectedMachine.value.name : ''
})

const selectedMachineCapability = computed(() => {
  const m = selectedMachine.value
  if (!m) return ''
  const passText = Array.isArray(m.passes) ? m.passes.join(', ') : m.passes
  return `可轧 ${passText} 道次`
})

function addPass() {
  const nextN = form.passes.length > 0 ? form.passes[form.passes.length - 1].n + 1 : 1
  form.passes.push({ n: nextN, t: '' })
}

function removePass(index) {
  form.passes.splice(index, 1)
  form.passes.forEach((p, idx) => {
    p.n = idx + 1
  })
}

const canSubmit = computed(() => {
  return form.passes.length > 0 && form.passes.every(p => p.t !== '')
})

function submit() {
  if (canSubmit.value) {
    const mat = selectedMaterial.value
    // 合并来料信息 + 手填信息
    const submitData = {
      ...form,
      coilNo: mat?.coilNo || '',
      blankCoilNo: mat?.blankCoilNo || '',
      batch: mat?.batch || '',
      alloy: mat?.alloy || '',
      usage: mat?.usage || '',
      inThickness: mat?.inThickness || '',
      width: mat?.width || '',
      weight: mat?.weight || 0,
      execOrderNo: mat?.execOrderNo || '',
    }
    emit('submit', JSON.parse(JSON.stringify(submitData)))
  }
}
</script>

<style scoped>
/* 弹窗遮罩和动画 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-pop {
  0% {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }

  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* 淡入动画（带出信息条） */
.fade-in-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-in-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-in-leave-active {
  transition: opacity 0.15s ease;
}

.fade-in-leave-to {
  opacity: 0;
}

/* 容器 */
.modal-container {
  width: 620px;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: visible;
}

/* 头部 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--bg-main);
  border-bottom: 1px solid var(--border-light);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-main);
  width: 150px;
}

.title-icon {
  color: var(--primary-color);
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
}

.step-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 2px solid var(--border-medium);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.3s;
}

.step-circle.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.step-line {
  width: 40px;
  height: 2px;
  background: var(--border-medium);
  transition: all 0.3s;
}

.step-line.active {
  background: var(--primary-color);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  margin-left: auto;
  transition: background 0.2s;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* 内容区 */
.modal-body {
  padding: 1.25rem;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.v-section-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
}

/* ── 自动带出信息条（与分切弹窗统一风格） ── */
.material-info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.65rem 0.75rem;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
}

.info-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
}

.chip-label {
  color: var(--text-muted);
  font-size: 0.72rem;
}

.chip-val {
  font-weight: 600;
  color: var(--text-main);
}

.chip-unit {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-left: 1px;
}

/* 用途颜色 */
.usage-电 {
  color: #dc2626;
  font-weight: 600;
}

.usage-药 {
  color: #16a34a;
  font-weight: 600;
}

.usage-食 {
  color: #2563eb;
  font-weight: 600;
}

.usage-双零 {
  color: #475569;
  font-weight: 600;
}

/* ── Step 2 来料概要条 ── */
.material-summary-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.summary-label {
  color: var(--text-muted);
  font-size: 0.72rem;
}

.summary-val {
  font-weight: 500;
  color: var(--text-main);
}

.summary-sep {
  color: var(--border-medium);
  font-size: 0.7rem;
}

/* 基础表单样式 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.span-full {
  grid-column: 1 / -1;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.req {
  color: var(--status-error);
}

.form-input {
  padding: 8px 12px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--text-main);
  background: var(--bg-main);
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.form-input:disabled {
  background: var(--bg-hover);
  color: var(--text-muted);
  cursor: not-allowed;
}

.mono {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 0.85rem;
}

.number {
  font-family: var(--font-mono);
}

.font-mono {
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

/* Step 2 样式 */
.machine-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.pass-form-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 0.75rem;
}

.pass-form-table th {
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0 0 8px 0;
}

.pass-form-table td {
  padding: 4px 0;
}

.pass-num {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--text-main);
  font-size: 0.9rem;
}

.pass-input {
  width: 150px;
}

.action-cell {
  text-align: right;
  padding-right: 8px;
}

.del-btn {
  color: var(--text-muted);
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.del-btn:hover {
  background: var(--status-error-bg);
  color: var(--status-error);
}

.add-pass-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--primary-color);
  padding: 6px 10px;
  border-radius: var(--radius-md);
  transition: background 0.2s;
}

.add-pass-btn:hover {
  background: var(--primary-light);
}

.textarea {
  width: 100%;
  min-height: 80px;
  resize: vertical;
  line-height: 1.5;
}

/* 底部按钮 */
.modal-footer {
  padding: 1rem 1.25rem;
  background: var(--bg-main);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  position: relative;
  z-index: 10;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.footer-btn.secondary {
  background: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-medium);
}

.footer-btn.secondary:hover:not(:disabled) {
  background: var(--bg-hover);
}

.footer-btn.primary {
  background: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.15);
}

.footer-btn.primary:hover:not(:disabled) {
  background: var(--primary-hover);
}
</style>
