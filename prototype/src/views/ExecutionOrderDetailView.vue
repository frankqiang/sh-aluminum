<template>
  <div class="detail-view">

    <!-- 未找到订单 -->
    <div v-if="!order" class="not-found">
      <PhClipboardText :size="48" class="not-found-icon" />
      <p>找不到该订单，请返回列表重新选择</p>
      <router-link to="/execution/orders" class="btn-back-link">← 返回订单列表</router-link>
    </div>

    <template v-else>
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-main">
          <router-link to="/execution/orders" class="btn-back">
            <PhArrowLeft :size="15" weight="bold" /> 订单跟踪
          </router-link>
          <div class="order-title-wrap">
            <div class="title-row">
              <h1 class="order-no">{{ order.orderNo }}</h1>
              <span :class="['status-badge', `status-${order.status}`]">{{ statusLabel(order.status) }}</span>
              <span v-if="order.isOverdue" class="overdue-tag">
                <PhWarning :size="12" weight="fill" /> 已逾期 {{ Math.abs(order.daysUntilDelivery) }} 天
              </span>
            </div>
            <div class="subtitle-row">
              <span class="mono">{{ order.contractNo }}</span>
              <span class="sep">·</span>
              <span class="customer">{{ order.customer }}</span>
              <span class="sep">·</span>
              <span>{{ order.product }}</span>
            </div>
          </div>
        </div>
        <!-- 交期展示块 -->
        <div :class="['delivery-block', deliveryClass]">
          <div class="db-date">{{ order.deliveryDate }}</div>
          <div class="db-days">{{ daysLabel(order) }}</div>
        </div>
      </div>

      <!-- 摘要信息条 -->
      <div class="summary-strip">
        <div class="ss-item">
          <span class="ss-label">产品规格</span>
          <span class="ss-value">{{ order.thickness }}μm × {{ order.width }}mm</span>
          <span class="ss-sub">{{ order.alloy }}{{ order.coreSpec ? ' · ' + order.coreSpec : '' }}</span>
        </div>
        <div class="ss-divider"></div>
        <div class="ss-item">
          <span class="ss-label">需求总量</span>
          <span class="ss-value">{{ order.totalCoils }} 卷</span>
          <span class="ss-sub">≈ {{ ((order.totalWeight || 0) / 1000).toFixed(1) }} 吨{{ order.lengthMin ? ' · ' +
            order.lengthMin + '~' + order.lengthMax + 'm' : '' }}</span>
        </div>
        <div class="ss-divider"></div>
        <div class="ss-item ss-prog">
          <span class="ss-label">完成进度</span>
          <div class="prog-row">
            <div class="prog-track">
              <div class="prog-fill" :style="{ width: progressPct + '%', background: progressColor }"></div>
            </div>
            <span class="prog-pct">{{ progressPct }}%</span>
          </div>
          <span class="ss-sub">{{ order.completedCoils }} / {{ order.totalCoils }} 卷{{ estimatedCompletion ? ' · 预计 ' +
            estimatedCompletion : '' }}</span>
        </div>
        <div class="ss-divider"></div>
        <div class="ss-item">
          <span class="ss-label">质量情况</span>
          <span class="ss-value" :class="qualityStatusClass">{{ qualityStatusLabel }}</span>
          <span class="ss-sub">{{ qualityNotes.length > 0 ? `${qualityNotes.length} 卷有备注` : '无异常' }}</span>
        </div>
      </div>


      <!-- 主内容：料卷列表 + 时间线 -->
      <div class="main-area">

        <!-- 左：关联料卷 -->
        <div class="panel coils-panel">
          <div class="panel-head">
            <span class="panel-title">关联料卷</span>
            <span class="panel-badge">{{ order.linkedCoils.length }} 卷</span>
          </div>

          <div v-if="order.linkedCoils.length === 0" class="empty-state">
            <PhClipboardText :size="32" class="empty-icon" />
            <span>暂无关联料卷记录</span>
          </div>

          <div v-else class="coils-wrap">
            <table class="coils-table">
              <thead>
                <tr>
                  <th>子卷号 / 母卷号</th>
                  <th>工序状态</th>
                  <th>质量状态</th>
                  <th>重量(kg)</th>
                  <th>机台</th>
                  <th>完成时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="coil in order.linkedCoils" :key="coil.coilNo"
                  :class="[coilRowClass(coil), { 'row-selected': selectedCoilData?.coilNo === coil.coilNo }]"
                  class="coil-row-clickable" @click="openCoilQuality(coil)">
                  <td>
                    <div class="coil-no">
                      {{ coil.coilNo }}
                      <span class="coil-quality-hint" v-if="order.traceability">🔍</span>
                    </div>
                    <div class="mother-no">母卷 {{ coil.motherCoilNo }}</div>
                  </td>
                  <td>
                    <span :class="['stage-chip', stageClass(coil.stage)]">{{ coil.stageLabel }}</span>
                  </td>
                  <!-- 质量状态（简版）-->
                  <td>
                    <span :class="['quality-chip', qualityChipClass(coil)]">
                      {{ qualityChipLabel(coil) }}
                    </span>
                  </td>
                  <td class="td-num">{{ coil.weight ? coil.weight.toLocaleString() : '—' }}</td>
                  <td class="td-machine">{{ coil.machine || '—' }}</td>
                  <td class="td-time">{{ coil.completedAt ? formatTime(coil.completedAt) : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 右：生产时间线 -->
        <div class="panel timeline-panel">
          <div class="panel-head">
            <span class="panel-title">生产时间线</span>
          </div>

          <div v-if="order.timeline.length === 0" class="empty-state">
            <PhTimer :size="32" class="empty-icon" />
            <span>暂无时间线记录</span>
          </div>

          <div v-else class="timeline">
            <div v-for="(ev, idx) in order.timeline" :key="idx" class="tl-item">
              <div class="tl-left">
                <div :class="['tl-dot', `tl-${ev.type}`]">
                  <component :is="tlIcon(ev.type)" :size="11" weight="fill" />
                </div>
                <div v-if="idx < order.timeline.length - 1" class="tl-line"></div>
              </div>
              <div class="tl-body">
                <div class="tl-meta">
                  <span class="tl-title">{{ ev.title }}</span>
                  <span class="tl-time">{{ formatTime(ev.time) }}</span>
                </div>
                <div class="tl-desc">{{ ev.desc }}</div>
                <div v-if="ev.coilNo" class="tl-coil">{{ ev.coilNo }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- ── 质量详情浮窗 ─────────────────────────────── -->

    <Teleport to="body">
      <Transition name="qd-slide">
        <div v-if="coilQualityVisible" class="qd-overlay" @click.self="closeCoilQuality">
          <div class="qd-panel">
            <!-- 头部 -->
            <div class="qd-head">
              <div class="qd-head-left">
                <span class="qd-label">子卷质检</span>
                <span class="qd-coil-no">{{ selectedCoilData?.coilNo }}</span>
              </div>
              <button class="qd-close" @click="closeCoilQuality">✕</button>
            </div>

            <div class="qd-body">
              <!-- 母卷轧制质检摘要 -->
              <div v-if="order.traceability" class="qd-rolling-block">
                <div class="qd-rolling-head">
                  <span class="qd-rolling-label">母卷轧制</span>
                  <span class="qd-rolling-coil">{{ order.traceability.motherCoil }}</span>
                  <span class="trace-sep">·</span>
                  <span class="qd-rolling-detail">{{ order.traceability.rollingMachine }}</span>
                  <span class="trace-sep">·</span>
                  <span class="qd-rolling-detail">{{ order.traceability.rollingDate }}</span>
                </div>
                <div v-if="order.traceability.rollingQuality" class="qd-rolling-body">
                  <div class="qd-kv-grid">
                    <div class="qd-kv">
                      <span class="qd-k">判定</span>
                      <span
                        :class="['trace-chip', order.traceability.rollingQuality.judgment === '合格' ? 'tc-ok' : 'tc-fail']">
                        {{ order.traceability.rollingQuality.judgment }}
                      </span>
                    </div>
                    <div class="qd-kv">
                      <span class="qd-k">厚度</span>
                      <span class="qd-v">{{ order.traceability.rollingQuality.thickness }}</span>
                    </div>
                    <div class="qd-kv" v-if="order.traceability.rollingQuality.pinholeInfo">
                      <span class="qd-k">针孔</span>
                      <span class="qd-v font-mono">{{ order.traceability.rollingQuality.pinholeInfo }}</span>
                    </div>
                    <div class="qd-kv" v-if="order.traceability.rollingQuality.description">
                      <span class="qd-k">描述</span>
                      <span class="qd-v">{{ order.traceability.rollingQuality.description }}</span>
                    </div>
                  </div>
                  <div class="trace-reviewer">
                    评审人：{{ order.traceability.rollingQuality.reviewer }}
                    <span class="trace-sep">·</span>
                    {{ formatTime(order.traceability.rollingQuality.reviewTime) }}
                  </div>
                </div>
              </div>
              <div class="qd-divider"></div>

              <!-- 无溯源数据 -->
              <div v-if="!selectedCoilTrace" class="qd-empty">
                <span style="font-size:2rem;">🔍</span>
                <p>该卷暂无质检溯源记录</p>
              </div>

              <template v-else>
                <!-- 分切质检 -->
                <div class="qd-section" v-if="selectedCoilTrace.slittingQuality">
                  <div class="qd-section-head">
                    <span class="trace-section-dot dot-slitting"></span>
                    <span class="qd-section-title">分切质检</span>
                    <span :class="['trace-chip', slittingChipClass(selectedCoilTrace.slittingQuality)]">
                      {{ selectedCoilTrace.slittingQuality.conclusion }}
                    </span>
                  </div>
                  <div class="qd-kv-grid">
                    <div class="qd-kv">
                      <span class="qd-k">判定</span>
                      <span
                        :class="['trace-chip', selectedCoilTrace.slittingQuality.judgment === '合格' ? 'tc-ok' : 'tc-fail']">
                        {{ selectedCoilTrace.slittingQuality.judgment }}
                      </span>
                    </div>
                    <div class="qd-kv">
                      <span class="qd-k">等级</span>
                      <span class="qd-v">{{ selectedCoilTrace.slittingQuality.grade }}</span>
                    </div>
                    <div class="qd-kv" v-if="selectedCoilTrace.slittingQuality.pinholeAB">
                      <span class="qd-k">针孔 A/B</span>
                      <span class="qd-v font-mono">{{ selectedCoilTrace.slittingQuality.pinholeAB }}</span>
                    </div>
                    <div class="qd-kv" v-if="selectedCoilTrace.slittingQuality.pinholeCD">
                      <span class="qd-k">针孔 C/D</span>
                      <span class="qd-v font-mono">{{ selectedCoilTrace.slittingQuality.pinholeCD }}</span>
                    </div>
                    <div class="qd-kv" v-if="selectedCoilTrace.slittingQuality.effectiveWidth">
                      <span class="qd-k">有效宽度</span>
                      <span class="qd-v font-mono">{{ selectedCoilTrace.slittingQuality.effectiveWidth }}mm</span>
                    </div>
                    <div class="qd-kv" v-if="selectedCoilTrace.slittingQuality.surfaceDefect">
                      <span class="qd-k">表面缺陷</span>
                      <span class="qd-v">{{ selectedCoilTrace.slittingQuality.surfaceDefect }}</span>
                    </div>
                    <div class="qd-kv" v-if="selectedCoilTrace.slittingQuality.downgradeReason">
                      <span class="qd-k">降级原因</span>
                      <span class="qd-v trace-warn">{{ selectedCoilTrace.slittingQuality.downgradeReason }}</span>
                    </div>
                  </div>
                  <!-- 评审信息区块 -->
                  <div class="qd-review-block">
                    <div class="qd-review-label">评审信息</div>
                    <!-- 处理指令 -->
                    <div v-if="selectedCoilTrace.slittingQuality.instructions?.length" class="trace-instructions">
                      <div class="trace-inst-title">处理指令：</div>
                      <div v-for="(inst, idx) in selectedCoilTrace.slittingQuality.instructions" :key="idx"
                        class="trace-inst-row">
                        <span class="trace-inst-num">{{ idx + 1 }}</span>
                        <span class="trace-inst-tag">{{ inst.defectType }}</span>
                        <span class="trace-inst-side">{{ inst.side }}</span>
                        <span class="trace-inst-range font-mono">{{ inst.startMm }}-{{ inst.endMm }}mm</span>
                        <span class="trace-inst-arrow">→</span>
                        <span class="trace-inst-action">{{ inst.treatment }}</span>
                      </div>
                    </div>
                    <!-- 备注 -->
                    <div v-if="selectedCoilTrace.slittingQuality.note" class="trace-note">
                      💬 {{ selectedCoilTrace.slittingQuality.note }}
                    </div>
                    <!-- 评审人 -->
                    <div class="trace-reviewer">
                      评审人：{{ selectedCoilTrace.slittingQuality.reviewer }}
                      <span class="trace-sep">·</span>
                      {{ formatTime(selectedCoilTrace.slittingQuality.reviewTime) }}
                    </div>
                  </div>
                </div>
                <!-- 分切未评审 -->
                <div v-else class="qd-section qd-pending-section">
                  <div class="qd-section-head">
                    <span class="trace-section-dot dot-slitting"></span>
                    <span class="qd-section-title">分切质检</span>
                    <span class="trace-chip tc-pending">待评审</span>
                  </div>
                  <div class="qd-pending-msg">⏳ 尚未开始分切或质检</div>
                </div>

                <!-- 分隔线 -->
                <div class="qd-divider"></div>

                <!-- 精切质检 -->
                <div class="qd-section" v-if="selectedCoilTrace.finishingQuality">
                  <div class="qd-section-head">
                    <span class="trace-section-dot dot-finishing"></span>
                    <span class="qd-section-title">精切质检</span>
                    <span :class="['trace-chip', finishingChipClass(selectedCoilTrace.finishingQuality)]">
                      {{ selectedCoilTrace.finishingQuality.conclusion }}
                    </span>
                  </div>
                  <div class="qd-kv-grid">
                    <div class="qd-kv">
                      <span class="qd-k">判定</span>
                      <span
                        :class="['trace-chip', selectedCoilTrace.finishingQuality.judgment === '合格' ? 'tc-ok' : 'tc-fail']">
                        {{ selectedCoilTrace.finishingQuality.judgment }}
                      </span>
                    </div>
                    <div class="qd-kv">
                      <span class="qd-k">等级</span>
                      <span class="qd-v">{{ selectedCoilTrace.finishingQuality.grade }}</span>
                    </div>
                    <div class="qd-kv" v-if="selectedCoilTrace.finishingQuality.pinhole">
                      <span class="qd-k">针孔</span>
                      <span class="qd-v font-mono">{{ selectedCoilTrace.finishingQuality.pinhole }}</span>
                    </div>
                    <div class="qd-kv" v-if="selectedCoilTrace.finishingQuality.burrHeight != null">
                      <span class="qd-k">毛刺量</span>
                      <span class="qd-v font-mono">{{ selectedCoilTrace.finishingQuality.burrHeight }}μm</span>
                    </div>
                    <div class="qd-kv" v-if="selectedCoilTrace.finishingQuality.alPowder != null">
                      <span class="qd-k">铝粉量</span>
                      <span class="qd-v font-mono">{{ selectedCoilTrace.finishingQuality.alPowder }}个/10cm²</span>
                    </div>
                    <div class="qd-kv" v-if="selectedCoilTrace.finishingQuality.tensileStrength">
                      <span class="qd-k">抗拉强度</span>
                      <span class="qd-v font-mono">{{ selectedCoilTrace.finishingQuality.tensileStrength }}MPa</span>
                    </div>
                    <div class="qd-kv" v-if="selectedCoilTrace.finishingQuality.elongation">
                      <span class="qd-k">延伸率</span>
                      <span class="qd-v font-mono">{{ selectedCoilTrace.finishingQuality.elongation }}%</span>
                    </div>
                  </div>
                  <!-- 评审信息区块 -->
                  <div class="qd-review-block">
                    <div class="qd-review-label">评审信息</div>
                    <!-- 备注 -->
                    <div v-if="selectedCoilTrace.finishingQuality.note" class="trace-note">
                      💬 {{ selectedCoilTrace.finishingQuality.note }}
                    </div>
                    <!-- 评审人 -->
                    <div class="trace-reviewer">
                      评审人：{{ selectedCoilTrace.finishingQuality.reviewer }}
                      <span class="trace-sep">·</span>
                      {{ formatTime(selectedCoilTrace.finishingQuality.reviewTime) }}
                    </div>
                  </div>
                </div>
                <!-- 精切未完成 -->
                <div v-else class="qd-section qd-pending-section">
                  <div class="qd-section-head">
                    <span class="trace-section-dot dot-finishing"></span>
                    <span class="qd-section-title">精切质检</span>
                    <span class="trace-chip tc-pending">进行中</span>
                  </div>
                  <div class="qd-pending-msg">⏳ 精切尚未完成质检</div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  PhArrowLeft, PhWarning, PhClipboardText, PhTimer,
  PhGear, PhCheckCircle, PhScissors, PhWrench, PhPackage,
} from '@phosphor-icons/vue'
import { fullOrders } from '../data/execution/index.js'

const route = useRoute()
const order = computed(() => fullOrders.find(o => o.id === route.params.id) ?? null)
const traceOpen = ref(false)

// ── 质量详情浮窗 ────────────────────────────────────────────────
const coilQualityVisible = ref(false)
const selectedCoilData = ref(null)

// 在溯源链 children 中找到对应子卷
const selectedCoilTrace = computed(() => {
  if (!selectedCoilData.value || !order.value?.traceability) return null
  return order.value.traceability.children?.find(
    c => c.coilNo === selectedCoilData.value.coilNo
  ) ?? null
})

function openCoilQuality(coil) {
  if (!order.value?.traceability) return  // 无溯源数据不响应
  selectedCoilData.value = coil
  coilQualityVisible.value = true
}
function closeCoilQuality() {
  coilQualityVisible.value = false
  selectedCoilData.value = null
}
// ESC 关闭
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCoilQuality() })
}

// ── 进度 ────────────────────────────────────────────────────────
const progressPct = computed(() => {
  const o = order.value
  if (!o || !o.totalCoils) return 0
  return Math.round(o.completedCoils / o.totalCoils * 100)
})
const progressColor = computed(() => {
  const o = order.value
  if (!o) return 'var(--status-processing)'
  if (o.isOverdue) return 'var(--status-error)'
  if (o.status === 'completed') return 'var(--status-success)'
  if (o.daysUntilDelivery <= 3) return '#f59e0b'
  return 'var(--status-processing)'
})

// ── 预计完成日（线性外推）──────────────────────────────────────
const estimatedCompletion = computed(() => {
  const o = order.value
  if (!o || o.status === 'completed' || o.status === 'pending') return ''
  if (o.completedCoils >= o.totalCoils) return ''
  // 找到最早和最晚完成的卷时间
  const coils = o.linkedCoils || []
  const completedTimes = coils
    .filter(c => c.completedAt)
    .map(c => new Date(c.completedAt).getTime())
    .sort((a, b) => a - b)
  if (completedTimes.length < 1) return ''
  const earliest = completedTimes[0]
  const latest = completedTimes[completedTimes.length - 1]
  const elapsed = latest - earliest
  if (elapsed <= 0 || o.completedCoils <= 1) {
    // 无法推算，给一个模糊提示
    return ''
  }
  // 日均产出
  const daysElapsed = elapsed / (1000 * 60 * 60 * 24)
  const dailyRate = (o.completedCoils - 1) / daysElapsed // 减1因为首卷不计间隔
  const remaining = o.totalCoils - o.completedCoils
  const daysNeeded = remaining / dailyRate
  const estDate = new Date(latest + daysNeeded * 86400000)
  const m = estDate.getMonth() + 1
  const d = estDate.getDate()
  return `${m}月${d}日`
})

// ── 交期块样式 ───────────────────────────────────────────────────
const deliveryClass = computed(() => {
  const o = order.value
  if (!o) return ''
  if (o.isOverdue) return 'dc-critical'
  if (o.status === 'completed') return 'dc-done'
  if (o.daysUntilDelivery <= 3) return 'dc-warning'
  return 'dc-normal'
})

// ── 质量摘要 ─────────────────────────────────────────────────────
const qualityNotes = computed(() => (order.value?.linkedCoils || []).filter(c => c.qualityDetail))
const qualityStatusLabel = computed(() => {
  const coils = order.value?.linkedCoils || []
  if (!coils.length) return '—'
  const hasNonconform = coils.some(c => c.finalJudgment === 'nonconform')
  const hasWaiver = coils.some(c => c.mainConclusion === '让步放行')
  if (hasNonconform && hasWaiver) return '有让步放行'
  if (hasNonconform) return '有不合格'
  return '全部合格'
})
const qualityStatusClass = computed(() => {
  const label = qualityStatusLabel.value
  if (label === '有不合格') return 'val-error'
  if (label === '有让步放行') return 'val-warn'
  return 'val-ok'
})

// ── 辅助函数 ─────────────────────────────────────────────────────
function statusLabel(s) {
  return { pending: '待排产', producing: '生产中', packing: '待包装', completed: '已完成' }[s] ?? s
}
function daysLabel(o) {
  if (!o) return ''
  if (o.status === 'completed') return '已完成交付'
  if (o.isOverdue) return `逾期 ${Math.abs(o.daysUntilDelivery)} 天`
  if (o.daysUntilDelivery === 0) return '今日截止'
  return `还剩 ${o.daysUntilDelivery} 天`
}
function formatTime(dt) {
  if (!dt) return '—'
  const d = new Date(dt.replace(' ', 'T'))
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${min}`
}
function coilRowClass(coil) {
  if (coil.status === 'processing') return 'row-active'
  if (coil.stage === 'completed') return 'row-done'
  return ''
}
function stageClass(stage) {
  if (stage === 'completed') return 'sc-done'
  if (['finishing', 'slitting', 'rolling'].includes(stage)) return 'sc-active'
  if (stage === 'packing') return 'sc-packing'
  return 'sc-waiting'
}
function qualityChipClass(coil) {
  if (!coil.finalJudgment) return 'q-pending'
  if (coil.mainConclusion === '让步放行' || coil.mainConclusion === '沟通放行') return 'q-waiver'
  if (coil.finalJudgment === 'nonconform') return 'q-fail'
  return 'q-ok'
}
function qualityChipLabel(coil) {
  if (!coil.finalJudgment) return '待评审'
  if (coil.mainConclusion === '让步放行') return '让步放行'
  if (coil.mainConclusion === '沟通放行') return '沟通放行'
  if (coil.finalJudgment === 'nonconform') return '不合格'
  return '合格'
}
// 溯源链 — 工序评审结论 chip 样式
function slittingChipClass(q) {
  if (!q) return 'tc-pending'
  const c = q.conclusion
  if (c === '让步放行' || c === '沟通放行') return 'tc-waiver'
  if (c === '改切' || c === '改切二级品' || c === '转精切') return 'tc-rework'
  if (q.judgment === '不合格') return 'tc-fail'
  return 'tc-ok'
}
function finishingChipClass(q) {
  if (!q) return 'tc-pending'
  const c = q.conclusion
  if (c === '让步放行' || c === '沟通放行') return 'tc-waiver'
  if (q.judgment === '不合格') return 'tc-fail'
  return 'tc-ok'
}
function tlIcon(type) {
  return {
    plan: PhClipboardText, rolling: PhGear, quality: PhCheckCircle,
    slitting: PhScissors, finishing: PhWrench, packing: PhPackage
  }[type] ?? PhTimer
}
</script>

<style scoped>
/* ── 整体布局 ─────────────────────────────────────────────────── */
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-height: 100%;
  width: 100%;
  overflow-y: auto;
  padding-bottom: 1.5rem;
}

/* ── 未找到 ───────────────────────────────────────────────────── */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  color: var(--text-muted);
}

.not-found-icon {
  opacity: 0.3;
}

.btn-back-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
}

/* ── 页面头部 ─────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
}

.header-main {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  margin-top: 0.25rem;
  transition: all 0.15s;
}

.btn-back:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.35rem;
}

.order-no {
  font-size: 1.35rem;
  font-weight: 700;
  font-family: var(--font-mono);
  letter-spacing: -0.02em;
}

.subtitle-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.subtitle-row .mono {
  font-family: var(--font-mono);
}

.subtitle-row .customer {
  font-weight: 500;
  color: var(--text-main);
}

.sep {
  color: var(--border-medium);
}

.status-badge {
  display: inline-block;
  padding: 0.18rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 500;
}

.status-pending {
  background: var(--bg-main);
  color: var(--text-muted);
}

.status-producing {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-packing {
  background: #faf5ff;
  color: #7c3aed;
}

.status-completed {
  background: var(--status-success-bg);
  color: var(--status-success);
}

.overdue-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.18rem 0.55rem;
  background: var(--status-error-bg);
  color: var(--status-error);
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
}

/* 交期展示块 */
.delivery-block {
  text-align: center;
  padding: 0.7rem 1.2rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  flex-shrink: 0;
}

.db-date {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.db-days {
  font-size: 0.78rem;
  font-weight: 600;
}

.dc-critical {
  background: var(--status-error-bg);
  border-color: var(--status-error);

  .db-date,
  .db-days {
    color: var(--status-error);
  }
}

.dc-warning {
  background: var(--status-warning-bg);
  border-color: #f59e0b;

  .db-date,
  .db-days {
    color: #b45309;
  }
}

.dc-done {
  background: var(--status-success-bg);
  border-color: var(--status-success);

  .db-date,
  .db-days {
    color: var(--status-success);
  }
}

.dc-normal {
  background: var(--bg-surface);

  .db-date {
    color: var(--text-main);
  }

  .db-days {
    color: var(--text-secondary);
  }
}

/* ── 摘要条 ───────────────────────────────────────────────────── */
.summary-strip {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 0.85rem 1.25rem;
  gap: 0;
  flex-shrink: 0;
}

.ss-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.ss-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
}

.ss-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
}

.ss-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.val-ok {
  color: var(--status-success);
}

.val-warn {
  color: #b45309;
}

.val-error {
  color: var(--status-error);
}

.ss-divider {
  width: 1px;
  height: 40px;
  background: var(--border-light);
  margin: 0 1.25rem;
  flex-shrink: 0;
}

.ss-prog {
  flex: 1.5;
}

.prog-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.1rem 0;
}

.prog-track {
  flex: 1;
  height: 6px;
  background: var(--border-light);
  border-radius: 3px;
  overflow: hidden;
}

.prog-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.prog-pct {
  font-size: 0.82rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-main);
  white-space: nowrap;
}

/* ── 主内容区 ─────────────────────────────────────────────────── */
.main-area {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 0.85rem;
}

.panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* 溯源链面板不裁切 — 需要随展开内容自然增高 */
.trace-panel {
  overflow: visible;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-main);
  flex-shrink: 0;
}

.panel-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
}

.panel-badge {
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  background: var(--primary-light);
  color: var(--primary-color);
  font-size: 0.72rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex: 1;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.empty-icon {
  opacity: 0.3;
}

/* ── 料卷表格 ─────────────────────────────────────────────────── */
.coils-wrap {
  overflow: auto;
  flex: 1;
}

.coils-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 580px;
}

.coils-table th {
  text-align: left;
  padding: 0.6rem 0.875rem;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-main);
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
}

.coils-table td {
  padding: 0.65rem 0.875rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.82rem;
  vertical-align: top;
}

.coils-table tbody tr:last-child td {
  border-bottom: none;
}

.row-done {
  opacity: 0.75;
}

.row-active {
  background: rgba(59, 130, 246, 0.04);
}

.coil-no {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
}

.mother-no {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

/* 工序 chip */
.stage-chip {
  display: inline-block;
  padding: 0.18rem 0.5rem;
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
}

.sc-done {
  background: var(--status-success-bg);
  color: var(--status-success);
}

.sc-active {
  background: #dbeafe;
  color: #1d4ed8;
}

.sc-packing {
  background: #faf5ff;
  color: #7c3aed;
}

.sc-waiting {
  background: var(--bg-main);
  color: var(--text-muted);
}

/* 质量 chip */
.quality-chip {
  display: inline-block;
  padding: 0.18rem 0.5rem;
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 500;
}

.q-ok {
  background: var(--status-success-bg);
  color: var(--status-success);
}

.q-waiver {
  background: var(--status-warning-bg);
  color: #b45309;
}

.q-fail {
  background: var(--status-error-bg);
  color: var(--status-error);
}

.q-other {
  background: var(--bg-main);
  color: var(--text-secondary);
}

.q-pending {
  color: var(--text-muted);
  font-size: 0.72rem;
}

/* 产品等级标签 */
.grade-tag {
  display: inline-block;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  margin-left: 0.3rem;
  vertical-align: middle;
}

.grade-a {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}

.grade-b {
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
}

.quality-note {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
  line-height: 1.4;
}


.td-num,
.td-time {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  white-space: nowrap;
}

.td-machine {
  font-size: 0.78rem;
  white-space: nowrap;
}

/* ── 时间线 ───────────────────────────────────────────────────── */
.timeline-panel {
  overflow: hidden;
}

.timeline {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tl-item {
  display: flex;
  gap: 0.75rem;
}

.tl-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.tl-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  font-size: 11px;
}

.tl-plan {
  background: #94a3b8;
}

.tl-rolling {
  background: #3b82f6;
}

.tl-quality {
  background: #22c55e;
}

.tl-slitting {
  background: #f59e0b;
}

.tl-finishing {
  background: #8b5cf6;
}

.tl-packing {
  background: #06b6d4;
}

.tl-line {
  width: 2px;
  flex: 1;
  min-height: 12px;
  background: var(--border-light);
  margin: 3px 0;
}

.tl-body {
  padding-bottom: 1rem;
  flex: 1;
  min-width: 0;
}

.tl-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.tl-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
}

.tl-time {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  white-space: nowrap;
}

.tl-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tl-coil {
  display: inline-block;
  margin-top: 0.3rem;
  padding: 0.1rem 0.4rem;
  background: var(--bg-main);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-muted);
}

/* ── 质量溯源链面板 ──────────────────────────────── */
.trace-panel {
  grid-column: 1 / -1;
}

.trace-toggle {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 400;
}

.trace-body {
  padding: 0.75rem 1rem 1.25rem;
}

/* 母卷区域 */
.trace-mother {
  background: var(--bg-main);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.75rem;
}

.trace-mother-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  margin-bottom: 0.4rem;
}

.trace-label {
  font-weight: 600;
  font-size: 0.72rem;
  background: var(--primary-light);
  color: var(--primary-color);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.trace-coil-no {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--text-main);
}

.trace-sep {
  color: var(--text-muted);
}

.trace-detail {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.trace-rolling-info {
  margin-top: 0.25rem;
}

/* 通用：键值对网格 */
.trace-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.25rem 0.75rem;
  font-size: 0.78rem;
  margin-top: 0.3rem;
}

.trace-kv {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.trace-k {
  color: var(--text-muted);
  font-size: 0.72rem;
  white-space: nowrap;
  min-width: 52px;
}

.trace-v {
  color: var(--text-main);
}

/* 通用：结论 chip */
.trace-chip {
  display: inline-block;
  padding: 0.08rem 0.4rem;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 500;
  white-space: nowrap;
}

.tc-ok {
  background: var(--status-success-bg);
  color: var(--status-success);
}

.tc-fail {
  background: var(--status-error-bg);
  color: var(--status-error);
}

.tc-waiver {
  background: var(--status-warning-bg);
  color: #b45309;
}

.tc-rework {
  background: #ede9fe;
  color: #6d28d9;
}

.tc-pending {
  background: var(--bg-main);
  color: var(--text-muted);
}

/* 评审人行 */
.trace-reviewer {
  margin-top: 0.35rem;
  font-size: 0.7rem;
  color: var(--text-muted);
}

/* 子卷卡片 — 单列，内部横向排列 */
.trace-children {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.trace-child {
  background: var(--bg-main);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.8rem 1rem;
  border-left: 3px solid var(--primary-color);
  display: flex;
  flex-wrap: wrap;
  gap: 0 0;
}

.trace-child-header {
  width: 100%;
  margin-bottom: 0.5rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--border-light);
}

.trace-child-no {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-main);
}

/* 工序分区 — 左右并列 */
.trace-section {
  flex: 1;
  min-width: 280px;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: none;
}

.trace-section+.trace-section {
  border-left: 1px dashed var(--border-light);
  padding-left: 1.5rem;
  margin-left: 0.5rem;
}

.trace-section-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.25rem;
}

.trace-section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.dot-slitting {
  background: #f59e0b;
}

.dot-finishing {
  background: #8b5cf6;
}

/* 处理指令 */
.trace-instructions {
  margin-top: 0.35rem;
  padding: 0.3rem 0.5rem;
  background: rgba(245, 158, 11, 0.06);
  border-radius: 4px;
  border-left: 2px solid #f59e0b;
}

.trace-inst-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.2rem;
}

.trace-inst-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  margin-bottom: 0.15rem;
}

.trace-inst-num {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fef3c7;
  color: #b45309;
  font-size: 0.62rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.trace-inst-tag {
  padding: 0.05rem 0.3rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 3px;
  font-size: 0.68rem;
  font-weight: 500;
}

.trace-inst-side {
  color: var(--text-secondary);
  font-size: 0.72rem;
}

.trace-inst-range {
  color: var(--text-main);
  font-size: 0.72rem;
}

.trace-inst-arrow {
  color: var(--text-muted);
  font-size: 0.72rem;
}

.trace-inst-action {
  color: #b45309;
  font-weight: 500;
  font-size: 0.72rem;
}

/* 评审备注 */
.trace-note {
  margin-top: 0.3rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
  background: rgba(59, 130, 246, 0.04);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  line-height: 1.5;
}

/* 进行中状态 */
.trace-pending {
  opacity: 0.65;
}

.trace-pending-msg {
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: 0.3rem 0;
}

/* 补充 */
.trace-warn {
  color: #b45309;
  font-weight: 500;
}

.font-mono {
  font-family: var(--font-mono);
}

/* ── 关联料卷：行点击交互 ─────────────────────────────────────── */
.coil-row-clickable {
  cursor: pointer;
  transition: background 0.12s;
}

.coil-row-clickable:hover td {
  background: rgba(59, 130, 246, 0.05) !important;
}

.coil-row-clickable.row-selected td {
  background: rgba(59, 130, 246, 0.08) !important;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.coil-quality-hint {
  font-size: 0.65rem;
  opacity: 0.5;
  margin-left: 0.25rem;
  transition: opacity 0.15s;
}

.coil-row-clickable:hover .coil-quality-hint {
  opacity: 1;
}

/* ── 质量详情弹窗 ─────────────────────────────────────────────── */
.qd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 9999;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

.qd-panel {
  width: 420px;
  max-width: 90vw;
  background: var(--bg-surface);
  border-left: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 弹窗头部 */
.qd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-main);
  flex-shrink: 0;
}

.qd-head-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qd-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.qd-coil-no {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-main);
}

.qd-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--bg-surface);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.qd-close:hover {
  background: var(--status-error-bg);
  color: var(--status-error);
}

/* 弹窗内容区 */
.qd-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem 2rem;
}

/* 各工序区块 */
.qd-section {
  margin-bottom: 0.5rem;
}

.qd-pending-section {
  opacity: 0.7;
}

.qd-section-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
}

.qd-section-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
}

.qd-pending-msg {
  font-size: 0.78rem;
  color: var(--text-muted);
  padding: 0.5rem 0.5rem;
  background: var(--bg-main);
  border-radius: var(--radius-md);
}

/* 键值对网格 */
.qd-kv-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem 1rem;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.qd-kv {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.qd-k {
  color: var(--text-muted);
  font-size: 0.73rem;
  white-space: nowrap;
  min-width: 54px;
}

.qd-v {
  color: var(--text-main);
}

/* 分隔线 */
.qd-divider {
  height: 1px;
  background: var(--border-light);
  margin: 1rem 0;
}

/* 空态 */
.qd-empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.qd-empty p {
  margin-top: 0.5rem;
}

/* ── 滑入动画 ─────────────────────────────────────────────────── */
.qd-slide-enter-active,
.qd-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
}

.qd-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.qd-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}


/* 评审信息区块 */
.qd-review-block {
  margin-top: 0.75rem;
  padding-top: 0.6rem;
  border-top: 1px dashed var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.qd-review-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.1rem;
}
</style>