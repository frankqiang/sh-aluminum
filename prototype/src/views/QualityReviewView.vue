<template>
  <div class="review-page">
    <!-- 顶部导航栏 -->
    <div class="review-header">
      <button class="btn-back" @click="router.push('/quality')">
        <ArrowLeft :size="16" class="icon" /> 返回列表
      </button>
      <h1 class="page-title">质量评审录入：<span class="font-mono">{{ coil?.coilNo }}</span></h1>
      <div class="actions">
        <button class="btn-secondary" :disabled="isReadOnly">保存草稿</button>
        <button class="btn-primary" :disabled="isReadOnly" @click="submitReview">提交评审</button>
      </div>
    </div>

    <!-- 左右两栏主体 -->
    <div class="review-body">
      <!-- 左栏：料卷信息（只读） -->
      <aside class="coil-info-panel" v-if="coil">
        <div class="panel-section">
          <h3 class="section-title">料卷基本信息</h3>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="label">卷号</span>
              <span class="value font-mono font-medium">{{ coil.coilNo }}</span>
            </div>
            <div class="info-item">
              <span class="label">来料卷号</span>
              <span class="value font-mono">{{ coil.parentCoilNo }}</span>
            </div>
            <div class="info-item">
              <span class="label">合金</span>
              <span class="value">{{ coil.alloy }}</span>
            </div>
            <div class="info-item">
              <span class="label">规格</span>
              <span class="value">{{ coil.thickness }}μm × {{ coil.width }}mm</span>
            </div>
            <div class="info-item">
              <span class="label">预计长度</span>
              <span class="value">~{{ coil.estimatedLength }}m</span>
            </div>
            <div class="info-item">
              <span class="label">重量</span>
              <span class="value">{{ coil.weight }}kg</span>
            </div>
            <div class="info-item">
              <span class="label">工序</span>
              <span class="value">{{ coil.process }}</span>
            </div>
            <div class="info-item">
              <span class="label">机台</span>
              <span class="value">{{ coil.machine }}</span>
            </div>
          </div>
          
          <div class="time-info">
            <div class="info-item full">
              <span class="label">下料时间</span>
              <span class="value">{{ formatTime(coil.downloadTime) }}</span>
            </div>
            <div class="info-item full alert-item" :class="{ 'is-overdue': isOverdue(coil) }">
              <span class="label">下料已过</span>
              <span class="value">
                <span v-if="isOverdue(coil)">⚠️ </span>
                {{ getPassedTime(coil.downloadTime) }}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div class="coil-info-panel empty-panel" v-else>
        未找到对应的料卷信息
      </div>
      
      <!-- 右栏：评审录入区 -->
      <main class="review-form">
        <template v-if="coil">
          <!-- 一、主评审结论 -->
          <section class="form-section">
            <h3 class="section-title with-border">一、主评审结论</h3>
            <div class="form-row">
              <div class="form-group flex-2">
                <label>主评审结论 <span class="required">*</span></label>
                <select v-model="form.mainConclusion" class="form-control" :disabled="isReadOnly">
                  <option value="">请选择...</option>
                  <option v-for="opt in mainConclusionOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>传递对象备注</label>
                <select v-model="form.deliveryTarget" class="form-control" :disabled="isReadOnly">
                  <option value="">不指定</option>
                  <option v-for="opt in deliveryTargetOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>产品等级 <span class="required">*</span></label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="form.productGrade" value="A" :disabled="isReadOnly"> 
                    <span class="radio-text">一级品</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.productGrade" value="B" :disabled="isReadOnly"> 
                    <span class="radio-text">二级品</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <!-- 二、检测数据（电池箔） -->
          <section class="form-section multi-blocks">
            <h3 class="section-title with-border">二、检测数据（电池箔）</h3>
            
            <div class="blocks-container">
              <!-- 针孔检测 -->
              <div class="data-block">
                <h4 class="block-title">【针孔检测】</h4>
                <div class="form-row">
                  <div class="form-group inline-group">
                    <label>A/B级针孔:</label>
                    <input type="number" v-model.number="form.pinholeA" class="form-control short" placeholder="A级" :disabled="isReadOnly">
                    <span class="separator">/</span>
                    <input type="number" v-model.number="form.pinholeB" class="form-control short" placeholder="B级" :disabled="isReadOnly">
                    <span class="unit">个</span>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group inline-group">
                    <label>C/D级针孔:</label>
                    <input type="number" v-model.number="form.pinholeC" class="form-control short" placeholder="C级" :disabled="isReadOnly">
                    <span class="separator">/</span>
                    <input type="number" v-model.number="form.pinholeD" class="form-control short" placeholder="D级" :disabled="isReadOnly">
                    <span class="unit">个</span>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group inline-group">
                    <label>E级针孔:</label>
                    <input type="number" v-model.number="form.pinholeE" class="form-control short" :disabled="isReadOnly">
                    <span class="unit">个</span>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>密集型针孔:</label>
                    <div class="radio-group mb-xs" style="margin-left: 90px; margin-bottom: 8px;">
                      <label class="radio-label">
                        <input type="radio" v-model="form.densePinhole" :value="false" :disabled="isReadOnly"> 
                        <span class="radio-text">无</span>
                      </label>
                      <label class="radio-label">
                        <input type="radio" v-model="form.densePinhole" :value="true" :disabled="isReadOnly"> 
                        <span class="radio-text">有</span>
                      </label>
                    </div>
                    <div style="margin-left: 90px;">
                      <input v-if="form.densePinhole" type="text" v-model="form.densePinholeNote" class="form-control full-width" placeholder="备注位置/情况" :disabled="isReadOnly">
                    </div>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group inline-group">
                    <label>离线针孔:</label>
                    <input type="number" v-model.number="form.offlinePinhole" class="form-control short" :disabled="isReadOnly">
                    <span class="unit">个</span>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group inline-group">
                    <label>纵向针孔密度:</label>
                    <input type="number" v-model.number="form.longitudinalDensity" class="form-control short" :disabled="isReadOnly">
                    <span class="unit">个/m</span>
                  </div>
                </div>
              </div>

              <div class="right-blocks">
                <!-- 表面检测 -->
                <div class="data-block">
                  <h4 class="block-title">【表面检测】</h4>
                  <div class="form-group gap-sm">
                    <label>表面检测信息:</label>
                    <textarea v-model="form.surfaceInfo" class="form-control textarea" rows="2" placeholder="人工总结关键缺陷" :disabled="isReadOnly"></textarea>
                  </div>
                  <div class="form-group gap-sm mt-md">
                    <label>分切质量情况:</label>
                    <textarea v-model="form.slittingQuality" class="form-control textarea" rows="2" placeholder="目检情况" :disabled="isReadOnly"></textarea>
                  </div>
                </div>

                <!-- 板型检测 -->
                <div class="data-block mt-md">
                  <h4 class="block-title">【板型检测】</h4>
                  <div class="form-row">
                    <div class="form-group inline-group">
                      <label>下榻量:</label>
                      <input type="number" v-model.number="form.flatness" class="form-control short" step="0.1" :disabled="isReadOnly">
                      <span class="unit">mm</span>
                    </div>
                  </div>
                </div>

                <!-- 其他/物料 -->
                <div style="display: flex; gap: 1rem;" class="mt-md">
                  <div class="data-block" style="flex: 1">
                    <h4 class="block-title">【其他检测】</h4>
                    <div class="form-row" style="margin-bottom: 0.5rem">
                      <div class="form-group inline-group">
                        <label>面密度:</label>
                        <input type="number" v-model.number="form.faceDensity" class="form-control short" step="0.01" :disabled="isReadOnly">
                        <span class="unit">g/㎡</span>
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group inline-group">
                        <label>达因值:</label>
                        <input type="number" v-model.number="form.dyneValue" class="form-control short" :disabled="isReadOnly">
                        <span class="unit">Dyne</span>
                      </div>
                    </div>
                  </div>

                  <div class="data-block" style="flex: 1">
                    <h4 class="block-title">【物料信息】</h4>
                    <div class="form-row" style="margin-bottom: 0.5rem">
                      <div class="form-group inline-group">
                        <label>管芯规格:</label>
                        <input type="text" v-model="form.tubeCore" class="form-control short" placeholder="如 63/60" :disabled="isReadOnly">
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group inline-group">
                        <label>框号:</label>
                        <input type="text" v-model="form.frameNo" class="form-control short" placeholder="料框号" :disabled="isReadOnly">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 三、处理指令 -->
          <section class="form-section">
            <h3 class="section-title with-border">三、处理指令</h3>
            <div class="table-responsive">
              <table class="instructions-table">
                <thead>
                  <tr>
                    <th width="40" class="text-center">#</th>
                    <th width="120">缺陷类型</th>
                    <th width="90">位置侧</th>
                    <th width="100">起始(mm)</th>
                    <th width="100">终止(mm)</th>
                    <th width="100">长位(m)</th>
                    <th width="120">处理方式</th>
                    <th width="60" class="text-center" v-if="!isReadOnly">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(inst, idx) in form.instructions" :key="idx">
                    <td class="text-center">{{ idx + 1 }}</td>
                    <td>
                      <select v-model="inst.defectType" class="form-control" :disabled="isReadOnly">
                        <option value="">请选择...</option>
                        <option v-for="opt in defectTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                    </td>
                    <td>
                      <select v-model="inst.locationSide" class="form-control" :disabled="isReadOnly">
                        <option v-for="opt in locationSideOptions" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                    </td>
                    <td><input type="number" v-model.number="inst.startMm" class="form-control" :disabled="isReadOnly"></td>
                    <td><input type="number" v-model.number="inst.endMm" class="form-control" :disabled="isReadOnly"></td>
                    <td><input type="number" v-model.number="inst.lengthPosM" class="form-control" placeholder="可选" :disabled="isReadOnly"></td>
                    <td>
                      <select v-model="inst.treatment" class="form-control" :disabled="isReadOnly">
                        <option value="">请选择...</option>
                        <option v-for="opt in treatmentOptions" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                    </td>
                    <td class="text-center" v-if="!isReadOnly">
                      <button class="btn-icon danger" @click="removeInstruction(idx)" title="删除">✕</button>
                    </td>
                  </tr>
                  <tr v-if="form.instructions.length === 0">
                    <td :colspan="isReadOnly ? 7 : 8" class="text-center empty-instructions">暂无处理指令</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button v-if="!isReadOnly" class="btn-outline mt-md" @click="addInstruction">+ 添加处理指令</button>
          </section>

          <!-- 四、评审备注 -->
          <section class="form-section">
            <h3 class="section-title with-border">四、评审备注</h3>
            <textarea v-model="form.note" class="form-control textarea mb-md" rows="3" placeholder="可选备注..." :disabled="isReadOnly"></textarea>
            
            <div class="review-meta">
              <div class="meta-item">
                <span class="label">评审人:</span>
                <span class="value">{{ form.reviewer }}</span>
              </div>
              <div class="meta-item">
                <span class="label">评审时间:</span>
                <span class="value">{{ form.reviewTime ? formatTime(form.reviewTime) : '提交后自动更新' }}</span>
              </div>
            </div>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { 
  qualityCoilList, 
  createEmptyReview,
  mainConclusionOptions,
  deliveryTargetOptions,
  qualityReviews,
  defectTypeOptions,
  locationSideOptions,
  treatmentOptions
} from '../data/quality-review-data'

const router = useRouter()
const route = useRoute()

// Initialize with null
const coil = ref(null)
const form = ref(createEmptyReview())

onMounted(() => {
  const id = route.params.id
  // Find the coil from mock data
  const found = qualityCoilList.find(c => c.id === id)
  if (found) {
    coil.value = found
    
    // If it's reviewed, load existing data
    if (found.status === 'reviewed' && qualityReviews[id]) {
      form.value = JSON.parse(JSON.stringify(qualityReviews[id]))
    }
  } else {
    console.error('Coil not found:', id)
  }
})

const isReadOnly = computed(() => coil.value?.status === 'reviewed')


// Form Handlers
function addInstruction() {
  form.value.instructions.push({
    defectType: '', 
    locationSide: 'Q侧',
    startMm: null, 
    endMm: null, 
    lengthPosM: null, 
    treatment: ''
  })
}

function removeInstruction(idx) {
  form.value.instructions.splice(idx, 1)
}

function submitReview() {
  if (!form.value.mainConclusion) {
    alert('请填写主评审结论！')
    return
  }
  
  if (coil.value) {
    // 模拟提交时间
    form.value.reviewTime = new Date().toISOString()
    
    // 更新状态
    coil.value.status = 'reviewed'
    qualityReviews[coil.value.id] = JSON.parse(JSON.stringify(form.value))
    
    router.push('/quality')
  }
}

// Time formatting utilities
function formatTime(dateString) {
  if (!dateString) return '-'
  const d = new Date(dateString)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const date = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${month}-${date} ${hours}:${minutes}`
}

function getPassedTime(dateString) {
  if (!dateString) return '-'
  const now = new Date('2026-03-07T13:30:00+08:00') // Updated with timezone as requested by code review
  const date = new Date(dateString)
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours < 0) return '刚刚'
  if (diffHours === 0) return `${diffMinutes}分钟`
  return `${diffHours}小时${diffMinutes}分钟`
}

function isOverdue(item) {
  const now = new Date('2026-03-07T13:30:00+08:00')
  const date = new Date(item.downloadTime)
  const diffHours = (now - date) / (1000 * 60 * 60)
  return diffHours >= 24
}
</script>

<style scoped>
.review-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main);
  overflow: hidden;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  z-index: 10;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-main);
  flex: 1;
  text-align: center;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  width: 120px;
}

.btn-back:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}

.actions {
  display: flex;
  gap: 0.75rem;
  width: 120px;
  justify-content: flex-end;
}

.btn-secondary, .btn-primary {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-secondary {
  background-color: var(--bg-main);
  border-color: var(--border-light);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.review-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左栏：料卷信息 */
.coil-info-panel {
  width: 320px;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-light);
  padding: 1.5rem;
  overflow-y: auto;
  flex-shrink: 0;
}

.empty-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-light);
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.9rem;
}

.info-item.full {
  flex-direction: column;
  gap: 0.25rem;
}

.time-info {
  margin-top: 0.5rem;
  padding-top: 1.25rem;
  border-top: 1px dashed var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.label {
  color: var(--text-secondary);
}

.value {
  color: var(--text-main);
  text-align: right;
}

.info-item.full .value {
  text-align: left;
  font-weight: 500;
  font-size: 0.95rem;
}

.alert-item {
  background-color: var(--bg-main);
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--border-light);
}

.alert-item.is-overdue {
  background-color: rgba(239, 68, 68, 0.05);
  border-left-color: var(--danger-color, #ef4444);
}

.alert-item.is-overdue .value {
  color: var(--danger-color, #ef4444);
  font-weight: 600;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.font-medium {
  font-weight: 500;
}

/* ================= 右栏：评审录入区 ================= */
.review-form {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  background-color: var(--bg-main);
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
  font-size: 1.1rem;
}

/* 表单基础样式 */
.form-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.section-title.with-border {
  margin: 0 0 1.5rem 0;
  padding-left: 0.75rem;
  border-left: 4px solid var(--primary-color);
  font-size: 1.1rem;
  border-bottom: none;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.inline-group {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.form-group.gap-sm {
  gap: 0.25rem;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }
.mt-md { margin-top: 1rem; }
.mb-xs { margin-bottom: 0.25rem; }

label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.inline-group label {
  width: 85px;
  text-align: right;
  margin-right: 0.25rem;
}

.required {
  color: var(--danger-color, #ef4444);
}

.form-control {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background-color: var(--bg-main);
  color: var(--text-main);
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  width: 100%;
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.form-control:disabled {
  background-color: var(--bg-hover);
  color: var(--text-muted);
  cursor: not-allowed;
}

.form-control.short { width: 70px; text-align: center; }
.form-control.medium { width: 140px; }
.full-width { width: 100%; }

.textarea {
  resize: vertical;
  min-height: 60px;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-main);
}

.radio-label input[type="radio"]:disabled {
  cursor: not-allowed;
}

.separator {
  color: var(--text-muted);
}

.unit {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-left: 0.25rem;
}

/* 复杂区块布局 */
.blocks-container {
  display: flex;
  gap: 1.5rem;
}

.data-block {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 1rem;
  background-color: var(--bg-main);
}

.blocks-container > .data-block {
  flex: 1;
}

.right-blocks {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.block-title {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  color: var(--text-main);
  font-weight: 600;
}

/* 动态操作表格和备注 */
.table-responsive {
  overflow-x: auto;
}

.instructions-table {
  width: 100%;
  border-collapse: collapse;
}

.instructions-table th, .instructions-table td {
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.9rem;
}

.instructions-table th {
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom-width: 2px;
}

.text-center { text-align: center !important; }

.btn-icon {
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.btn-icon.danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger-color, #ef4444);
}

.btn-outline {
  background: transparent;
  border: 1px dashed var(--border-light);
  color: var(--primary-color);
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-outline:hover {
  border-color: var(--primary-color);
  background-color: var(--primary-light);
}

.empty-instructions {
  color: var(--text-muted);
  padding: 2rem !important;
}

.mb-md { margin-bottom: 1rem; }

.review-meta {
  display: flex;
  gap: 2rem;
  background-color: var(--bg-hover);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
}

.meta-item {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  font-size: 0.85rem;
}

.meta-item .label {
  color: var(--text-secondary);
}

.meta-item .value {
  color: var(--text-main);
  font-weight: 500;
}

/* Review disabled fixes */
.radio-label input[type="radio"]:disabled + .radio-text {
  color: var(--text-muted);
}
</style>
