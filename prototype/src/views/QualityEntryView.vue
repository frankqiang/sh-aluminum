<template>
  <div class="entry-page">
    <!-- 顶部导航 -->
    <div class="entry-header">
      <button class="btn-back" @click="router.push('/quality')">
        <ArrowLeft :size="16" />返回列表
      </button>
      <h1 class="page-title">
        检测数据录入
        <span class="coil-tag font-mono">{{ coil?.coilNo }}</span>
        <span class="trip-tag">{{ coil?.tripNo }}</span>
      </h1>
      <div class="header-actions">
        <button class="btn-secondary" @click="router.push('/quality')">取消</button>
        <button class="btn-primary" @click="submitEntry">提交数据</button>
      </div>
    </div>

    <div class="entry-body">
      <!-- 左栏：料卷信息（只读） -->
      <aside class="info-panel" v-if="coil">
        <div class="panel-title">料卷信息</div>
        <div class="info-list">
          <div class="info-row">
            <span class="info-label">大卷号</span>
            <span class="info-val font-mono">{{ coil.coilNo }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">车次</span>
            <span class="info-val">{{ coil.tripNo }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">机台</span>
            <span class="info-val">{{ coil.machine }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">客户</span>
            <span class="info-val">{{ coil.customer }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">合金</span>
            <span class="info-val">{{ coil.alloy || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">规格</span>
            <span class="info-val">{{ coil.thickness ? `${coil.thickness}μm × ${coil.width}mm` : '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">下料时间</span>
            <span class="info-val">{{ formatTime(coil.downloadTime) }}</span>
          </div>
        </div>

        <div class="panel-tips">
          <div class="tip-item">
            <span class="tip-icon">💡</span>
            <span>表面检测信息需从表检仪几百条缺陷中<strong>人工总结</strong>关键问题</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">💡</span>
            <span>针孔数据可直接抄针检仪PDF中的A/B/C/D/E级个数</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">💡</span>
            <span>密集型针孔需人工判断，设备暂无法检测</span>
          </div>
        </div>
      </aside>

      <!-- 右栏：录入表单 -->
      <main class="entry-form">

        <!-- 区块一：基本信息 -->
        <section class="form-section">
          <h3 class="section-title">一、基本信息</h3>
          <div class="form-grid-5">
            <div class="form-group">
              <label>米数 (M)</label>
              <input type="number" v-model.number="form.meters" class="form-control" placeholder="如 25000">
            </div>
            <div class="form-group">
              <label>重量 (kg)</label>
              <input type="number" v-model.number="form.weight" class="form-control" step="0.01" placeholder="如 1286.23">
            </div>
            <div class="form-group">
              <label>接头 (个)</label>
              <input type="number" v-model.number="form.joints" class="form-control" placeholder="0">
            </div>
            <div class="form-group">
              <label>管芯规格</label>
              <input type="text" v-model="form.tubeCore" class="form-control" placeholder="如 63/60">
            </div>
            <div class="form-group">
              <label>框号</label>
              <input type="text" v-model="form.frameNo" class="form-control" placeholder="料框号">
            </div>
          </div>
        </section>

        <!-- 区块二：针孔检测 -->
        <section class="form-section">
          <h3 class="section-title">二、针孔检测</h3>
          <div class="pinhole-grid">
            <!-- A/B级 -->
            <div class="pinhole-row">
              <span class="ph-grade-label">A/B 级：</span>
              <div class="ph-inputs">
                <input type="number" v-model.number="form.pinholeA" class="form-control ph-input" placeholder="A级">
                <span class="ph-sep">/</span>
                <input type="number" v-model.number="form.pinholeB" class="form-control ph-input" placeholder="B级">
                <span class="ph-unit">个</span>
              </div>
            </div>
            <!-- C/D级 -->
            <div class="pinhole-row">
              <span class="ph-grade-label">C/D 级：</span>
              <div class="ph-inputs">
                <input type="number" v-model.number="form.pinholeC" class="form-control ph-input" placeholder="C级">
                <span class="ph-sep">/</span>
                <input type="number" v-model.number="form.pinholeD" class="form-control ph-input" placeholder="D级">
                <span class="ph-unit">个</span>
              </div>
            </div>
            <!-- E级 -->
            <div class="pinhole-row">
              <span class="ph-grade-label">E 级：</span>
              <div class="ph-inputs">
                <input type="number" v-model.number="form.pinholeE" class="form-control ph-input" placeholder="—">
                <span class="ph-unit">个</span>
              </div>
            </div>
            <!-- 离线针孔 -->
            <div class="pinhole-row">
              <span class="ph-grade-label">离线针孔：</span>
              <div class="ph-inputs">
                <input type="number" v-model.number="form.offlinePinhole" class="form-control ph-input" placeholder="—">
                <span class="ph-unit">个</span>
              </div>
            </div>
            <!-- 纵向密度 -->
            <div class="pinhole-row">
              <span class="ph-grade-label">纵向密度：</span>
              <div class="ph-inputs">
                <input type="number" v-model.number="form.longitudinalDensity" class="form-control ph-input" step="0.001" placeholder="—">
                <span class="ph-unit">个/m</span>
              </div>
            </div>
          </div>

          <!-- 密集型针孔 -->
          <div class="dense-pinhole-block">
            <div class="dense-label">密集型针孔：</div>
            <div class="radio-group">
              <label class="radio-opt">
                <input type="radio" v-model="form.densePinhole" :value="false">
                <span>无</span>
              </label>
              <label class="radio-opt">
                <input type="radio" v-model="form.densePinhole" :value="true">
                <span>有（需人工判断）</span>
              </label>
            </div>
            <textarea
              v-if="form.densePinhole"
              v-model="form.densePinholeNote"
              class="form-control textarea mt-sm"
              rows="2"
              placeholder="备注位置/情况，如：0-5500米C侧0-170mm区域针孔偏密集"
            ></textarea>
          </div>
        </section>

        <!-- 区块三：表面检测 -->
        <section class="form-section">
          <h3 class="section-title">三、表面检测</h3>
          <div class="form-grid-2 mt-sm">
            <div class="form-group">
              <label>
                表面检测信息
                <span class="label-hint">（含密集型）</span>
              </label>
              <textarea
                v-model="form.surfaceInfo"
                class="form-control textarea"
                rows="2"
                placeholder="如：20262米Q584油块..."
              ></textarea>
            </div>
            <div class="form-group">
              <label>
                分切质量情况
                <span class="label-hint">（目检缺陷）</span>
              </label>
              <textarea
                v-model="form.slittingQuality"
                class="form-control textarea"
                rows="2"
                placeholder="如：C155来料辊印..."
              ></textarea>
            </div>
          </div>
        </section>

        <!-- 区块四：板型检测 -->
        <section class="form-section">
          <h3 class="section-title">四、板型检测</h3>
          <div class="form-grid-3">
            <div class="form-group" style="grid-column: span 2;">
              <label>离线版型数据</label>
              <input type="text" v-model="form.flatnessData" class="form-control" placeholder="离线板型仪输出数据（可填描述）">
            </div>
            <div class="form-group">
              <label>下榻量 (mm)</label>
              <input type="number" v-model.number="form.flatness" class="form-control" step="0.1" placeholder="如 2.1">
            </div>
          </div>
        </section>

        <!-- 区块五：其他检测与物料 -->
        <section class="form-section">
          <h3 class="section-title">五、其他检测</h3>
          <div class="form-grid-2" style="align-items: flex-start;">
            <div class="face-density-block" style="grid-column: 1 / -1;">
              <div class="fd-label">面密度 g/㎡（6点）：</div>
              <div class="fd-grid">
                <div class="fd-pos-label">上</div>
                <input type="number" v-model.number="form.faceDensity[0]" class="form-control fd-input" step="0.01" placeholder="上左">
                <input type="number" v-model.number="form.faceDensity[1]" class="form-control fd-input" step="0.01" placeholder="上右">
                <div class="fd-pos-label">中</div>
                <input type="number" v-model.number="form.faceDensity[2]" class="form-control fd-input" step="0.01" placeholder="中左">
                <input type="number" v-model.number="form.faceDensity[3]" class="form-control fd-input" step="0.01" placeholder="中右">
                <div class="fd-pos-label">下</div>
                <input type="number" v-model.number="form.faceDensity[4]" class="form-control fd-input" step="0.01" placeholder="下左">
                <input type="number" v-model.number="form.faceDensity[5]" class="form-control fd-input" step="0.01" placeholder="下右">
              </div>
            </div>
            <div class="form-group">
              <label>达因值 (Dyne)
                <span class="label-hint">（电池箔需检测）</span>
              </label>
              <input type="text" v-model="form.dyneValue" class="form-control" placeholder="如 30/30缩">
            </div>
          </div>
        </section>

        <!-- 区块六：质量初判 -->
        <section class="form-section judgment-section">
          <h3 class="section-title">六、质量初判</h3>
          <div class="judgment-row">
            <div class="judgment-label">质量判定：</div>
            <div class="radio-group">
              <label class="radio-opt conform">
                <input type="radio" v-model="form.qualityJudgment" value="conform">
                <span>✓ 合格</span>
              </label>
              <label class="radio-opt nonconform">
                <input type="radio" v-model="form.qualityJudgment" value="nonconform">
                <span>✗ 不合格</span>
              </label>
            </div>
          </div>
          <div v-if="form.qualityJudgment === 'nonconform'" class="defect-reasons">
            <label>降级原因 <span class="required">*</span></label>
            <div class="reason-tags">
              <label
                v-for="reason in downgradeReasonOptions"
                :key="reason"
                :class="['reason-tag', { active: form.defectReasons.includes(reason) }]"
              >
                <input
                  type="checkbox"
                  :value="reason"
                  v-model="form.defectReasons"
                  style="display:none"
                >
                {{ reason }}
              </label>
            </div>
          </div>
        </section>

        <!-- 区块七：操作员信息 -->
        <section class="form-section">
          <h3 class="section-title">七、操作员信息</h3>
          <div class="form-grid-4">
            <div class="form-group">
              <label>主操手</label>
              <input type="text" v-model="form.operator" class="form-control" placeholder="姓名">
            </div>
            <div class="form-group">
              <label>质检员</label>
              <input type="text" v-model="form.inspector" class="form-control" placeholder="姓名">
            </div>
            <div class="form-group">
              <label>班组</label>
              <select v-model="form.shift" class="form-control">
                <option value="">请选择</option>
                <option v-for="s in shiftOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>日期</label>
              <input type="date" v-model="form.entryDate" class="form-control">
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { qualityCoilList, createEmptyEntryData, downgradeReasonOptions, shiftOptions } from '../data/quality-review-data'

const router = useRouter()
const route  = useRoute()

const coil = ref(null)
const form = ref(createEmptyEntryData())

onMounted(() => {
  const id = route.params.id
  const found = qualityCoilList.find(c => c.id === id)
  if (found) {
    coil.value = found
    // 如果已有录入数据（编辑模式），加载已有数据
    if (found.entryData) {
      form.value = JSON.parse(JSON.stringify(found.entryData))
    } else {
      // 新录入，设置默认日期为今天
      form.value.entryDate = new Date().toISOString().split('T')[0]
    }
  }
})

function formatTime(dateString) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

function submitEntry() {
  if (!coil.value) return
  // 保存检测数据
  coil.value.entryData = JSON.parse(JSON.stringify(form.value))
  coil.value.entryTime = new Date().toISOString()
  coil.value.entryOperator = '王帅印' // 模拟当前登录用户
  // 状态流转：待录入 → 待评审
  coil.value.status = 'pending_review'
  router.push('/quality')
}
</script>

<style scoped>
.entry-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main);
  overflow: hidden;
}

/* ── 顶部 ── */
.entry-header {
  display: flex;
  align-items: center;
  padding: 0.85rem 1.5rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-light);
  gap: 1rem;
  z-index: 10;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-back:hover { background: var(--bg-hover); color: var(--text-main); }

.page-title {
  flex: 1;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.coil-tag {
  font-size: 0.95rem;
  color: var(--primary-color);
}
.trip-tag {
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  border-radius: 9999px;
  color: var(--text-secondary);
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.65rem;
}

.btn-secondary, .btn-primary {
  padding: 0.45rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-secondary { background: var(--bg-main); border: 1px solid var(--border-light); color: var(--text-secondary); }
.btn-secondary:hover { background: var(--bg-hover); color: var(--text-main); }
.btn-primary { background: var(--primary-color); border: none; color: white; }
.btn-primary:hover { background: var(--primary-hover); }

/* ── 主体布局 ── */
.entry-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ── 左栏 ── */
.info-panel {
  width: 260px;
  flex-shrink: 0;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-light);
  padding: 1.25rem 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.panel-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-list { display: flex; flex-direction: column; gap: 0.75rem; }

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.875rem;
}
.info-label { color: var(--text-secondary); }
.info-val   { color: var(--text-main); font-weight: 500; max-width: 140px; text-align: right; word-break: break-all; }

.panel-tips {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.85rem;
  background: var(--bg-main);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}
.tip-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
}
.tip-icon { flex-shrink: 0; }

/* ── 右栏表单 ── */
.entry-form {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  padding-left: 0.65rem;
  border-left: 3px solid var(--primary-color);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}
.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
}
.form-grid-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.82rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.label-hint {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.form-control {
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-main);
  color: var(--text-main);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.form-control:focus { border-color: var(--primary-color); box-shadow: 0 0 0 2px var(--primary-light, rgba(37,99,235,0.1)); }
.textarea { resize: vertical; min-height: 64px; }

/* 针孔输入区 */
.pinhole-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1.5rem;
}
.pinhole-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.ph-grade-label {
  width: 80px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: right;
  flex-shrink: 0;
}
.ph-inputs {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.ph-input { width: 80px; text-align: center; }
.ph-sep   { color: var(--text-muted); font-size: 1.1rem; }
.ph-unit  { font-size: 0.82rem; color: var(--text-muted); }

/* 密集型针孔 */
.dense-pinhole-block {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px dashed var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.dense-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }

/* 单选组 */
.radio-group { display: flex; gap: 1.25rem; align-items: center; }
.radio-opt {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: var(--text-main);
  cursor: pointer;
}

/* 面密度 */
.face-density-block { display: flex; flex-direction: column; gap: 0.6rem; }
.fd-label { font-size: 0.82rem; color: var(--text-secondary); font-weight: 500; }
.fd-grid {
  display: grid;
  grid-template-columns: repeat(3, auto 1fr 1fr);
  gap: 0.5rem 0.75rem;
  align-items: center;
}
.fd-pos-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: center;
  font-weight: 500;
}
.fd-input { text-align: center; }

/* 其他辅助 */
.inline-input { display: flex; align-items: center; gap: 0.5rem; }
.input-unit   { font-size: 0.82rem; color: var(--text-muted); }
.mt-sm  { margin-top: 0.6rem; }
.mt-md  { margin-top: 1rem; }
.required { color: #dc2626; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

.form-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.85rem;
}
.mt-md  { margin-top: 1rem; }
.required { color: #dc2626; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

/* 质量初判 */
.judgment-section {}
.judgment-row { display: flex; align-items: center; gap: 1rem; }
.judgment-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
.radio-opt.conform input:checked + span { color: #059669; font-weight: 600; }
.radio-opt.nonconform input:checked + span { color: #dc2626; font-weight: 600; }

.defect-reasons {
  margin-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.defect-reasons label {
  font-size: 0.82rem;
  color: var(--text-secondary);
  font-weight: 500;
}
.reason-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.reason-tag {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--border-light);
  border-radius: 9999px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.reason-tag:hover { border-color: var(--primary-color); color: var(--primary-color); }
.reason-tag.active {
  background: rgba(239, 68, 68, 0.1);
  border-color: #dc2626;
  color: #dc2626;
  font-weight: 500;
}
</style>
