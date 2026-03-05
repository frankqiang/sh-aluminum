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

          <!-- Step 1: 基础信息 -->
          <div class="modal-body" v-if="step === 1">
            
            <!-- 区域 1: 目标机台 -->
            <div class="v-section">
              <div class="v-section-title">目标机台</div>
              <div class="form-row">
                <CustomSelect 
                  v-model="form.machineId" 
                  :options="machineGroupsOptions" 
                  placeholder="请选择机台" 
                  :grouped="true" 
                  style="min-width: 200px; width: fit-content;"
                />
              </div>
            </div>

            <!-- 区域 2: 卷料信息 -->
            <div class="v-section">
              <div class="v-section-title">卷料信息</div>
              <div class="form-grid">
                <div class="form-item span-full">
                  <span class="label">新神火卷号 <span class="req">*</span></span>
                  <input type="text" class="form-input mono" placeholder="如 1022601710" v-model="form.coilNo">
                </div>
                <div class="form-item">
                  <span class="label">坯料卷号 <span class="req">*</span></span>
                  <input type="text" class="form-input mono" placeholder="输入来料原卷号" v-model="form.blankCoilNo">
                </div>
                <div class="form-item">
                  <span class="label">批次 <span class="req">*</span></span>
                  <input type="text" class="form-input mono" placeholder="如 0122" v-model="form.batch">
                </div>
              </div>
            </div>

            <!-- 区域 3: 物料属性 -->
            <div class="v-section">
              <div class="v-section-title">物料属性</div>
              <div class="form-grid">
                <div class="form-item">
                  <span class="label">合金 <span class="req">*</span></span>
                  <CustomSelect 
                    v-model="form.alloy" 
                    :options="['1060', '1100', '1235D', '1070', '8079', '1235']" 
                    placeholder="选择合金" 
                  />
                </div>
                <div class="form-item">
                  <span class="label">用途 <span class="req">*</span></span>
                  <CustomSelect 
                    v-model="form.usage" 
                    :options="usageOptions" 
                    placeholder="选择用途" 
                  />
                </div>
                <div class="form-item">
                  <span class="label">来料厚度 (mm) <span class="req">*</span></span>
                  <input type="number" step="0.01" class="form-input number" v-model="form.inThickness">
                </div>
                <div class="form-item">
                  <span class="label">宽度 (mm) <span class="req">*</span></span>
                  <input type="number" class="form-input number" v-model="form.width">
                </div>
                <div class="form-item">
                  <span class="label">成品终厚 (μm) <span class="req">*</span></span>
                  <input type="number" class="form-input number" v-model="form.finalThickness">
                </div>
                <div class="form-item">
                  <span class="label">客户</span>
                  <input type="text" class="form-input" placeholder="选填" v-model="form.customer">
                </div>
              </div>
            </div>

          </div>

          <!-- Step 2: 道次配置 -->
          <div class="modal-body" v-else>
            
            <div class="v-section">
              <div class="v-section-title">道次配置</div>
              
              <div class="machine-hint">
                <Info :size="14" class="hint-icon"/>
                <span>当前机台: <strong>{{ selectedMachineName }}</strong> ({{ selectedMachineCapability }})</span>
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
              <div class="v-section-title">工艺说明</div>
              <textarea 
                class="form-input textarea" 
                placeholder="在此输入工艺指标要求、质量指控指令或操作注意事项等..." 
                v-model="form.remark"
              ></textarea>
            </div>

          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <template v-if="step === 1">
              <button class="footer-btn secondary" @click="handleClose">取消</button>
              <button class="footer-btn primary" @click="nextStep" :disabled="!canGoNext">下一步 <ArrowRight :size="16"/></button>
            </template>
            <template v-else>
              <button class="footer-btn secondary" @click="step = 1"><ArrowLeft :size="16"/> 上一步</button>
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

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'submit'])

const step = ref(1)

// 表单数据初始状态
const initialForm = {
  machineId: '',
  coilNo: '',
  blankCoilNo: '',
  batch: '',
  alloy: '',
  usage: '',
  inThickness: '',
  width: '',
  finalThickness: '',
  customer: '',
  passes: [],
  remark: ''
}

const form = reactive({ ...initialForm })

// 每次打开弹窗时重置状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    step.value = 1
    Object.assign(form, initialForm)
    // 默认加一个空道次
    form.passes = [{ n: 1, t: '' }]
  }
})

function handleClose() {
  emit('close')
}

// ----------------- Step 1 逻辑 -----------------

// 将 mock 机器数据转换为 CustomSelect 分组选项结构
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

const usageOptions = [
  { label: '电池箔 (电)', value: '电' },
  { label: '药箔 (药)', value: '药' },
  { label: '食品箔 (食)', value: '食' },
  { label: '双零箔 (双零)', value: '双零' },
]

const canGoNext = computed(() => {
  return form.machineId !== '' &&
         form.coilNo.trim() !== '' &&
         form.blankCoilNo.trim() !== '' &&
         form.batch.trim() !== '' &&
         form.alloy !== '' &&
         form.usage !== '' &&
         form.inThickness !== '' &&
         form.width !== '' &&
         form.finalThickness !== ''
})

function nextStep() {
  if (canGoNext.value) {
    step.value = 2
  }
}

// ----------------- Step 2 逻辑 -----------------

const selectedMachine = computed(() => {
  return rollingMachines.find(m => m.id === form.machineId)
})

const selectedMachineName = computed(() => {
  return selectedMachine.value ? selectedMachine.value.name : ''
})

const selectedMachineCapability = computed(() => {
  const m = selectedMachine.value
  if (!m) return ''
  return `可轧 ${m.passes.join(', ')} 道次`
})

function addPass() {
  const nextN = form.passes.length > 0 ? form.passes[form.passes.length - 1].n + 1 : 1
  form.passes.push({ n: nextN, t: '' })
}

function removePass(index) {
  form.passes.splice(index, 1)
  // 重新编号
  form.passes.forEach((p, idx) => {
    p.n = idx + 1
  })
}

const canSubmit = computed(() => {
  return form.passes.length > 0 && form.passes.every(p => p.t !== '')
})

function submit() {
  if (canSubmit.value) {
    // 拷贝一份数据传出去
    emit('submit', JSON.parse(JSON.stringify(form)))
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
  0% { transform: scale(0.95) translateY(10px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

/* 容器 */
.modal-container {
  width: 580px;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  width: 150px; /* 固定宽度保证居中元素不偏 */
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
  max-height: 70vh;
  overflow-y: auto;
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
}
.v-section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 12px;
  background: var(--primary-color);
  border-radius: 2px;
  margin-right: 6px;
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

.form-input.auto-width {
  width: auto;
  min-width: 200px;
}

.mono { font-family: var(--font-mono); font-weight: 500; font-size: 0.85rem;}
.number { font-family: var(--font-mono); }

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
  margin-bottom: 1rem;
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
