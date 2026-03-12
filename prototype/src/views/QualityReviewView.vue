<template>
  <div class="review-page">
    <!-- 顶部导航 -->
    <div class="review-header">
      <button class="btn-back" @click="router.push('/quality')">
        <ArrowLeft :size="16" />返回列表
      </button>
      <h1 class="page-title">
        {{ isReadOnly ? '评审详情' : '质量评审' }}
        <span class="coil-tag font-mono">{{ coil?.coilNo }}</span>
        <span class="trip-tag">{{ coil?.tripNo }}</span>
      </h1>
      <div class="header-actions" v-if="!isReadOnly">
        <button class="btn-secondary" @click="router.push('/quality')">取消</button>
        <button class="btn-primary" @click="submitReview">确认评审</button>
      </div>
      <div class="header-actions" v-else>
        <span class="reviewed-badge">✅ 已完成评审</span>
      </div>
    </div>

    <div class="review-body">
      <!-- 左栏：料卷信息 + 检测数据摘要（只读） -->
      <aside class="info-panel" v-if="coil">
        <!-- 料卷基本信息 -->
        <div class="panel-block">
          <div class="panel-title">料卷信息</div>
          <div class="info-list">
            <div class="info-row"><span class="info-label">大卷号</span><span class="info-val font-mono">{{ coil.coilNo }}</span></div>
            <div class="info-row"><span class="info-label">车次</span><span class="info-val">{{ coil.tripNo }}</span></div>
            <div class="info-row"><span class="info-label">机台</span><span class="info-val">{{ coil.machine }}</span></div>
            <div class="info-row"><span class="info-label">客户</span><span class="info-val">{{ coil.customer }}</span></div>
            <div class="info-row"><span class="info-label">合金</span><span class="info-val">{{ coil.alloy || '—' }}</span></div>
            <div class="info-row">
              <span class="info-label">规格</span>
              <span class="info-val">{{ coil.thickness ? `${coil.thickness}μm×${coil.width}mm` : '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">米数</span>
              <span class="info-val">{{ coil.entryData?.meters ? coil.entryData.meters.toLocaleString() + ' m' : '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">重量</span>
              <span class="info-val">{{ coil.entryData?.weight ? coil.entryData.weight + ' kg' : '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">接头</span>
              <span class="info-val">{{ coil.entryData?.joints ?? '—' }} 个</span>
            </div>
          </div>
        </div>

        <!-- 检测数据摘要（来自质检员录入） -->
        <div class="panel-block" v-if="coil.entryData">
          <div class="panel-title">检测数据（质检员录入）</div>

          <!-- 针孔数据 -->
          <div class="data-group">
            <div class="data-group-title">针孔</div>
            <div class="pinhole-display">
              <div class="ph-item">
                <span class="ph-level ab">AB</span>
                <span class="ph-nums">{{ coil.entryData.pinholeA }}/{{ coil.entryData.pinholeB }}</span>
              </div>
              <div class="ph-item">
                <span class="ph-level cd">CD</span>
                <span class="ph-nums">{{ coil.entryData.pinholeC }}/{{ coil.entryData.pinholeD }}</span>
              </div>
              <div class="ph-item">
                <span class="ph-level e">E</span>
                <span class="ph-nums">{{ coil.entryData.pinholeE }}</span>
              </div>
            </div>
            <div v-if="coil.entryData.offlinePinhole" class="data-kv">
              <span class="dk-label">离线针孔：</span>
              <span class="dk-val">{{ coil.entryData.offlinePinhole }} 个</span>
            </div>
            <div v-if="coil.entryData.longitudinalDensity" class="data-kv">
              <span class="dk-label">纵向密度：</span>
              <span class="dk-val">{{ coil.entryData.longitudinalDensity }} 个/m</span>
            </div>
            <div v-if="coil.entryData.densePinhole" class="dense-alert">
              ⚠️ 密集型：{{ coil.entryData.densePinholeNote || '有' }}
            </div>
          </div>

          <!-- 表面检测 -->
          <div class="data-group" v-if="coil.entryData.surfaceInfo || coil.entryData.slittingQuality">
            <div class="data-group-title">表面检测</div>
            <div v-if="coil.entryData.surfaceInfo" class="data-text-block">
              <span class="dk-label">表面：</span>
              <span class="dk-text">{{ coil.entryData.surfaceInfo }}</span>
            </div>
            <div v-if="coil.entryData.slittingQuality" class="data-text-block mt-xs">
              <span class="dk-label">分切质量情况：</span>
              <span class="dk-text">{{ coil.entryData.slittingQuality }}</span>
            </div>
          </div>

          <!-- 板型 + 其他 -->
          <div class="data-group">
            <div class="data-group-title">板型 / 其他</div>
            <div v-if="coil.entryData.flatness != null" class="data-kv">
              <span class="dk-label">下榻量：</span>
              <span class="dk-val">{{ coil.entryData.flatness }} mm</span>
            </div>
            <div v-if="coil.entryData.dyneValue != null" class="data-kv">
              <span class="dk-label">达因值：</span>
              <span :class="['dk-val', coil.entryData.dyneValue < 33 ? 'val-warn' : '']">
                {{ coil.entryData.dyneValue }} Dyne
                <span v-if="coil.entryData.dyneValue < 33" class="warn-mark">低于33</span>
              </span>
            </div>
            <div v-if="coil.entryData.faceDensity?.some(v => v != null)" class="data-group" style="margin-top: 0.25rem;">
              <span class="dk-label">面密度 g/㎡ (6点)：</span>
              <table class="fd-table">
                <thead>
                  <tr>
                    <th>上左</th><th>上右</th><th>中左</th><th>中右</th><th>下左</th><th>下右</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ coil.entryData.faceDensity[0] ?? '—' }}</td>
                    <td>{{ coil.entryData.faceDensity[1] ?? '—' }}</td>
                    <td>{{ coil.entryData.faceDensity[2] ?? '—' }}</td>
                    <td>{{ coil.entryData.faceDensity[3] ?? '—' }}</td>
                    <td>{{ coil.entryData.faceDensity[4] ?? '—' }}</td>
                    <td>{{ coil.entryData.faceDensity[5] ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 初判结论 -->
          <div class="data-group">
            <div class="data-group-title">初判</div>
            <div class="data-kv">
              <span class="dk-label">质量判定：</span>
              <span :class="['dk-val', coil.entryData.qualityJudgment === 'nonconform' ? 'val-bad' : 'val-good']">
                {{ coil.entryData.qualityJudgment === 'nonconform' ? '不合格' : '合格' }}
              </span>
            </div>
            <div v-if="coil.entryData.defectReasons?.length" class="data-kv">
              <span class="dk-label">降级原因：</span>
              <span class="dk-val">{{ coil.entryData.defectReasons.join('、') }}</span>
            </div>
          </div>
        </div>
        <!-- 客户质量红线辅助 -->
        <div class="panel-block ai-assist-panel" v-if="coil.entryData">
          <div class="ai-card">
            <div class="ai-card-header">
              <ShieldAlert :size="13" /> 该客户质量红线（{{ coil.customer || '通用标准' }}）
            </div>
            <ul class="ai-rule-list">
              <li>A级针孔 <span class="rule-val">&le; 1000个</span></li>
              <li v-if="coil.customer === '宁德时代' || coil.customer === '精切'">达因值 <span class="rule-val">&ge; 32 Dyne</span></li>
              <li>密集型针孔 <span class="rule-val fail">不允许</span></li>
            </ul>
          </div>
          
        </div>
      </aside>

      <!-- 右栏：评审表单 -->
      <main class="review-form">

        <!-- 区块一：最终判定 -->
        <section class="form-section">
          <h3 class="section-title">一、最终判定</h3>
          <div class="judgment-row">
            <div class="judgment-group">
              <label class="jg-label">质量判定 <span class="required">*</span></label>
              <div class="radio-group">
                <label class="radio-opt conform" :class="{active: form.finalJudgment==='conform'}">
                  <input type="radio" v-model="form.finalJudgment" value="conform" :disabled="isReadOnly">
                  <span>✓ 合格</span>
                </label>
                <label class="radio-opt nonconform" :class="{active: form.finalJudgment==='nonconform'}">
                  <input type="radio" v-model="form.finalJudgment" value="nonconform" :disabled="isReadOnly">
                  <span>✗ 不合格</span>
                </label>
              </div>
            </div>
            <div class="judgment-group">
              <label class="jg-label">产品等级 <span class="required">*</span></label>
              <div class="radio-group">
                <label class="radio-opt grade-a" :class="{active: form.productGrade==='A'}">
                  <input type="radio" v-model="form.productGrade" value="A" :disabled="isReadOnly">
                  <span>一级品</span>
                </label>
                <label class="radio-opt grade-b" :class="{active: form.productGrade==='B'}">
                  <input type="radio" v-model="form.productGrade" value="B" :disabled="isReadOnly">
                  <span>二级品</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <!-- 区块二：主评审结论 -->
        <section class="form-section">
          <h3 class="section-title">二、主评审结论</h3>
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
          <div class="form-group mt-sm">
            <label>降级原因</label>
            <input
              type="text"
              v-model="form.downgradeReason"
              class="form-control"
              placeholder="不合格时填写降级原因，如：针孔、气道"
              :disabled="isReadOnly"
            >
          </div>
        </section>

        <!-- 区块三：处理指令 -->
        <section class="form-section">
          <h3 class="section-title">三、处理指令</h3>
          <div class="instructions-table-wrap">
            <table class="instructions-table">
              <thead>
                <tr>
                  <th width="36">#</th>
                  <th width="100">缺陷类型</th>
                  <th width="80">位置侧</th>
                  <th width="80">宽度起始 mm</th>
                  <th width="80">宽度终止 mm</th>
                  <th width="80">长度起始 m</th>
                  <th width="80">长度终止 m</th>
                  <th width="100">处理方式</th>
                  <th width="48" v-if="!isReadOnly"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(inst, idx) in form.instructions" :key="idx">
                  <td class="text-center text-dim">{{ idx + 1 }}</td>
                  <td>
                    <select v-model="inst.defectType" class="form-control sm" :disabled="isReadOnly">
                      <option value="">选择...</option>
                      <option v-for="opt in defectTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="inst.locationSide" class="form-control sm" :disabled="isReadOnly">
                      <option v-for="opt in locationSideOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </td>
                  <td><input type="number" v-model.number="inst.startMm" class="form-control text-center" :disabled="isReadOnly" placeholder="—"></td>
                  <td><input type="number" v-model.number="inst.endMm"   class="form-control text-center" :disabled="isReadOnly" placeholder="—"></td>
                  <td><input type="number" v-model.number="inst.lengthStartM" class="form-control text-center" :disabled="isReadOnly" placeholder="—"></td>
                  <td><input type="number" v-model.number="inst.lengthEndM" class="form-control text-center" :disabled="isReadOnly" placeholder="—"></td>
                  <td>
                    <select v-model="inst.treatment" class="form-control sm" :disabled="isReadOnly">
                      <option value="">选择...</option>
                      <option v-for="opt in treatmentOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </td>
                  <td class="text-center" v-if="!isReadOnly">
                    <button class="btn-del-row" @click="removeInstruction(idx)" title="删除">✕</button>
                  </td>
                </tr>
                <tr v-if="form.instructions.length === 0">
                  <td :colspan="isReadOnly ? 8 : 9" class="empty-instructions">暂无处理指令</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button v-if="!isReadOnly" class="btn-add-row" @click="addInstruction">
            + 添加处理指令
          </button>
        </section>

        <!-- 区块四：评审备注 + 元信息 -->
        <section class="form-section">
          <h3 class="section-title">四、评审备注</h3>
          <textarea
            v-model="form.note"
            class="form-control textarea"
            rows="3"
            placeholder="可选备注..."
            :disabled="isReadOnly"
          ></textarea>
          <div class="review-meta">
            <div class="meta-item">
              <span class="meta-label">评审人：</span>
              <span class="meta-val">{{ isReadOnly ? coil?.reviewer : '郭飞翔' }}</span>
            </div>
            <div class="meta-item" v-if="isReadOnly && coil?.reviewTime">
              <span class="meta-label">评审时间：</span>
              <span class="meta-val">{{ formatTime(coil.reviewTime) }}</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Sparkles, ShieldAlert } from 'lucide-vue-next'
import {
  qualityCoilList,
  createEmptyReviewData,
  mainConclusionOptions,
  deliveryTargetOptions,
  defectTypeOptions,
  locationSideOptions,
  treatmentOptions,
} from '../data/quality-review-data'

const router = useRouter()
const route  = useRoute()

const coil = ref(null)
const form = ref(createEmptyReviewData())

onMounted(() => {
  const id = route.params.id
  const found = qualityCoilList.find(c => c.id === id)
  if (found) {
    coil.value = found
    if (found.reviewData) {
      form.value = JSON.parse(JSON.stringify(found.reviewData))
    }
    // 如果有初判数据，预填降级原因
    if (found.entryData?.defectReasons?.length && !found.reviewData) {
      form.value.downgradeReason = found.entryData.defectReasons.join('、')
      form.value.finalJudgment = found.entryData.qualityJudgment
    }
  }
})

// 只读模式：已完成的评审
const isReadOnly = computed(() => coil.value?.status === 'completed')

// 处理指令操作
function addInstruction() {
  form.value.instructions.push({
    defectType: '', locationSide: 'Q侧',
    startMm: null, endMm: null,
    lengthStartM: null, lengthEndM: null,
    treatment: ''
  })
}
function removeInstruction(idx) {
  form.value.instructions.splice(idx, 1)
}

// 提交评审
function submitReview() {
  if (!form.value.mainConclusion) {
    alert('请选择主评审结论')
    return
  }
  if (!coil.value) return
  coil.value.reviewData = JSON.parse(JSON.stringify(form.value))
  coil.value.reviewTime = new Date().toISOString()
  coil.value.reviewer = '郭飞翔' // 模拟当前登录用户
  coil.value.status = 'completed'
  router.push('/quality')
}

function formatTime(dateString) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
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

/* ── 顶部 ── */
.review-header {
  display: flex;
  align-items: center;
  padding: 0.85rem 1.5rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-light);
  gap: 1rem;
  z-index: 10;
}
.btn-back {
  display: flex; align-items: center; gap: 0.35rem;
  background: transparent; border: none;
  color: var(--text-secondary); font-size: 0.875rem;
  cursor: pointer; padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm); transition: all 0.15s;
  white-space: nowrap;
}
.btn-back:hover { background: var(--bg-hover); color: var(--text-main); }
.page-title {
  flex: 1; margin: 0; font-size: 1.1rem; font-weight: 600;
  color: var(--text-main); display: flex; align-items: center; gap: 0.75rem;
}
.coil-tag { font-size: 0.95rem; color: var(--primary-color); }
.trip-tag {
  font-size: 0.8rem; padding: 0.15rem 0.5rem;
  background: var(--bg-main); border: 1px solid var(--border-light);
  border-radius: 9999px; color: var(--text-secondary); font-weight: 500;
}
.header-actions { display: flex; gap: 0.65rem; align-items: center; }
.btn-secondary, .btn-primary {
  padding: 0.45rem 1rem; border-radius: var(--radius-sm);
  font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.15s;
}
.btn-secondary { background: var(--bg-main); border: 1px solid var(--border-light); color: var(--text-secondary); }
.btn-secondary:hover { background: var(--bg-hover); color: var(--text-main); }
.btn-primary { background: var(--primary-color); border: none; color: white; }
.btn-primary:hover { background: var(--primary-hover); }
.reviewed-badge {
  font-size: 0.85rem; color: #059669; font-weight: 500;
  background: rgba(16,185,129,0.1); padding: 0.35rem 0.85rem;
  border-radius: 9999px;
}

/* ── 主体 ── */
.review-body { flex: 1; display: flex; overflow: hidden; }

/* ── 左栏 ── */
.info-panel {
  width: 340px; flex-shrink: 0;
  background: var(--bg-surface); border-right: 1px solid var(--border-light);
  padding: 1.5rem 1.25rem; overflow-y: auto;
  display: flex; flex-direction: column; gap: 1.8rem;
}
.panel-block { display: flex; flex-direction: column; gap: 1rem; }
.panel-title {
  font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.05em;
  padding-bottom: 0.65rem; border-bottom: 1px solid var(--border-light);
}
.info-list { display: flex; flex-direction: column; gap: 0.85rem; }
.info-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 0.875rem; }
.info-label { color: var(--text-secondary); }
.info-val   { color: var(--text-main); font-weight: 500; max-width: 180px; text-align: right; line-height: 1.4; }

/* 检测数据展示 */
.data-group { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 0.25rem; }
.data-group-title {
  font-size: 0.75rem; font-weight: 700; color: #1e3a8a;
  background: rgba(37, 99, 235, 0.08); /* 浅蓝色微背景突出 */
  padding: 0.35rem 0.65rem; border-radius: var(--radius-sm);
  display: inline-block; align-self: flex-start;
  margin-bottom: 0.15rem;
}
.pinhole-display { display: flex; gap: 0.75rem; }
.ph-item { display: flex; align-items: baseline; gap: 0.3rem; }
.ph-level {
  font-size: 0.68rem; font-weight: 700; padding: 0.1rem 0.3rem;
  border-radius: var(--radius-sm);
}
.ph-level.ab { background: rgba(239,68,68,0.12); color: #dc2626; }
.ph-level.cd { background: rgba(245,158,11,0.12); color: #b45309; }
.ph-level.e  { background: rgba(99,102,241,0.12); color: #4f46e5; }
.ph-nums { font-size: 0.9rem; font-family: ui-monospace, monospace; color: var(--text-main); }

.data-kv { display: flex; align-items: flex-start; gap: 0.4rem; font-size: 0.85rem; line-height: 1.5; }
.dk-label { color: var(--text-secondary); flex-shrink: 0; }
.dk-val   { color: var(--text-main); font-weight: 500; }
.dk-text  { color: var(--text-main); line-height: 1.6; }
.data-text-block { display: flex; align-items: flex-start; gap: 0.4rem; font-size: 0.85rem; }

.val-warn { color: #d97706; }
.val-bad  { color: #dc2626; }
.val-good { color: #059669; }
.warn-mark {
  font-size: 0.7rem; background: rgba(245,158,11,0.12); color: #b45309;
  padding: 0.1rem 0.35rem; border-radius: var(--radius-sm); margin-left: 0.25rem;
}
.fd-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; font-family: ui-monospace, monospace; text-align: center; margin-top: 0.35rem; }
.fd-table th, .fd-table td { border: 1px solid var(--border-light); padding: 0.25rem 0; }
.fd-table th { background: rgba(37, 99, 235, 0.05); color: var(--text-secondary); font-weight: 600; }

.dense-alert {
  font-size: 0.8rem; color: #dc2626;
  background: rgba(239,68,68,0.08); padding: 0.35rem 0.6rem;
  border-radius: var(--radius-sm); border-left: 3px solid #dc2626;
}

/* ── 右栏 ── */
.review-form {
  flex: 1; overflow-y: auto;
  padding: 1.25rem 1.5rem;
  display: flex; flex-direction: column; gap: 1rem;
  background: var(--bg-main);
}

.form-section {
  background: var(--bg-surface); border: 1px solid var(--border-light);
  border-radius: var(--radius-md); padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
.section-title {
  margin: 0 0 1rem 0; font-size: 0.95rem; font-weight: 700;
  color: var(--text-main); padding-left: 0.65rem;
  border-left: 3px solid var(--primary-color);
}

/* 判定区 */
.judgment-row { display: flex; gap: 2.5rem; flex-wrap: wrap; }
.judgment-group { display: flex; flex-direction: column; gap: 0.5rem; }
.jg-label { font-size: 0.82rem; color: var(--text-secondary); font-weight: 500; }
.radio-group { display: flex; gap: 1rem; }
.radio-opt {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.875rem; color: var(--text-main); cursor: pointer;
  padding: 0.4rem 0.85rem; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); transition: all 0.15s; user-select: none;
}
.radio-opt input { display: none; }
.radio-opt:hover { border-color: var(--primary-color); }
.radio-opt.conform.active     { background: rgba(16,185,129,0.1); border-color: #059669; color: #059669; font-weight: 600; }
.radio-opt.nonconform.active  { background: rgba(239,68,68,0.1); border-color: #dc2626; color: #dc2626; font-weight: 600; }
.radio-opt.grade-a.active     { background: rgba(37,99,235,0.1); border-color: var(--primary-color); color: var(--primary-color); font-weight: 600; }
.radio-opt.grade-b.active     { background: rgba(245,158,11,0.1); border-color: #d97706; color: #d97706; font-weight: 600; }

/* 表单行 */
.form-row { display: flex; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.flex-1 { flex: 1; }
.flex-2 { flex: 2; }
.mt-sm { margin-top: 0.75rem; }

.form-group label {
  font-size: 0.82rem; color: var(--text-secondary); font-weight: 500;
}
.form-control {
  padding: 0.45rem 0.7rem; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); background: var(--bg-main);
  color: var(--text-main); font-size: 0.875rem; outline: none;
  transition: border-color 0.15s; width: 100%; box-sizing: border-box;
}
.form-control:focus { border-color: var(--primary-color); }
.form-control:disabled { background: var(--bg-hover); color: var(--text-muted); cursor: default; }
.form-control.sm { font-size: 0.82rem; padding: 0.35rem 0.55rem; }
.textarea { resize: vertical; min-height: 70px; }
.text-center { text-align: center !important; }
.required { color: #dc2626; }

/* 处理指令表格 */
.instructions-table-wrap { overflow-x: auto; margin-bottom: 0.85rem; }
.instructions-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
.instructions-table th, .instructions-table td {
  padding: 0.5rem 0.6rem; text-align: left;
  border-bottom: 1px solid var(--border-light);
}
.instructions-table th {
  background: var(--bg-main); color: var(--text-secondary);
  font-weight: 600; font-size: 0.78rem; white-space: nowrap;
}
.text-dim { color: var(--text-secondary); }
.empty-instructions { text-align: center !important; color: var(--text-muted); padding: 1.5rem !important; }

.btn-del-row {
  background: transparent; border: none; color: var(--text-muted);
  cursor: pointer; font-size: 0.85rem; padding: 0.2rem 0.4rem;
  border-radius: var(--radius-sm); transition: all 0.15s;
}
.btn-del-row:hover { background: rgba(239,68,68,0.1); color: #dc2626; }

.btn-add-row {
  display: inline-flex; align-items: center;
  padding: 0.4rem 0.85rem;
  background: transparent; border: 1px dashed var(--border-light);
  border-radius: var(--radius-sm); color: var(--text-secondary);
  font-size: 0.82rem; cursor: pointer; transition: all 0.15s;
}
.btn-add-row:hover { border-color: var(--primary-color); color: var(--primary-color); background: rgba(37,99,235,0.04); }

/* 评审元信息 */
.review-meta { display: flex; gap: 2rem; margin-top: 1rem; }
.meta-item { display: flex; gap: 0.4rem; font-size: 0.85rem; }
.meta-label { color: var(--text-secondary); }
.meta-val   { color: var(--text-main); font-weight: 500; }

/* 辅助 */
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.mt-xs { margin-top: 0.4rem; }

/* 智能决策辅助面板 */
.ai-assist-panel {
  margin-top: 0.5rem;
  padding: 0.85rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-md);
  gap: 0.85rem;
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #4f46e5;
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  padding-bottom: 0.5rem;
}

.ai-icon {
  fill: #4f46e5;
  color: #4f46e5;
}

.ai-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-card-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #4338ca;
}

.ai-rule-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ai-rule-list li {
  font-size: 0.78rem;
  color: var(--text-main);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.6);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.rule-val {
  font-family: ui-monospace, monospace;
  font-weight: 600;
  color: #059669;
}
.rule-val.fail { color: #dc2626; }
</style>
