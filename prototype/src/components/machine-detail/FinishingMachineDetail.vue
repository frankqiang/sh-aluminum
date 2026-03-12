<template>
    <div class="detail-body">

        <!-- 今日计划进度 -->
        <section class="detail-section">
            <div class="section-title">今日计划进度</div>
            <div class="plan-progress-row">
                <div class="prog-stat">
                    <span class="prog-num completed">{{ counts.completed }}</span>
                    <span class="prog-label">已完成</span>
                </div>
                <div class="prog-stat">
                    <span class="prog-num running">{{ counts.running }}</span>
                    <span class="prog-label">进行中</span>
                </div>
                <div class="prog-stat">
                    <span class="prog-num waiting">{{ counts.planned }}</span>
                    <span class="prog-label">待精切</span>
                </div>
                <div class="prog-stat">
                    <span class="prog-num total">{{ plans.length }}</span>
                    <span class="prog-label">共计</span>
                </div>
            </div>
            <div class="mini-progress-bar" v-if="plans.length">
                <div class="mini-fill completed" :style="{ width: (counts.completed / plans.length * 100) + '%' }">
                </div>
                <div class="mini-fill running" :style="{ width: (counts.running / plans.length * 100) + '%' }"></div>
            </div>
        </section>

        <!-- 当前作业 -->
        <template v-if="runningPlan">

            <!-- 来料基本信息 -->
            <section class="detail-section">
                <div class="section-title">
                    <span class="section-dot running"></span>当前作业
                </div>
                <div class="info-grid">
                    <div class="info-row">
                        <span class="info-label">子卷号</span>
                        <span class="info-value coil-no">{{ runningPlan.childCoilNo }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">母卷号</span>
                        <span class="info-value font-mono">{{ runningPlan.motherCoilNo }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">合金</span>
                        <span class="info-value font-bold">{{ runningPlan.alloy }}</span>
                        <span class="info-label ml-auto">电晕</span>
                        <span class="corona-tag" :class="runningPlan.corona === '无' ? 'off' : 'on'">
                            {{ runningPlan.corona === '无' ? '无需电晕' : runningPlan.corona }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">分切规格</span>
                        <span class="info-value">
                            <span class="number">{{ runningPlan.width }}</span>
                            <span class="unit">mm宽</span>
                            × <span class="number">{{ runningPlan.thickness }}</span>
                            <span class="unit">μm厚</span>
                        </span>
                    </div>
                    <div class="info-row" v-if="runningPlan.finishingSpec">
                        <span class="info-label">精切方案</span>
                        <span class="info-value font-mono text-sm">{{ runningPlan.finishingSpec }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">客户</span>
                        <span class="info-value font-medium">{{ runningPlan.customer || '—' }}</span>
                    </div>
                </div>
            </section>

            <div class="divider"></div>

            <!-- 分切质量评审（参考 PrecisionDetailPanel）-->
            <section class="detail-section">
                <div class="section-title">
                    <span class="section-icon">✓</span> 分切质量评审
                    <span class="review-status-label" :class="runningPlan.reviewStatus || 'none'">
                        {{ reviewLabel(runningPlan.reviewStatus) }}
                    </span>
                </div>

                <div v-if="runningPlan.slittingReview" class="review-content">
                    <div class="info-grid mb-3">
                        <div class="info-row">
                            <span class="info-label">主结论</span>
                            <span class="info-value conclusion-text"
                                :class="conclusionClass(runningPlan.slittingReview.conclusion)">
                                {{ runningPlan.slittingReview.conclusion }}
                            </span>
                        </div>
                        <div class="info-row" v-if="runningPlan.slittingReview.grade">
                            <span class="info-label">产品等级</span>
                            <span class="info-value">{{ runningPlan.slittingReview.grade }}</span>
                        </div>
                    </div>

                    <!-- 处理指令列表 -->
                    <div class="instructions-wrapper" v-if="runningPlan.slittingReview.instructions?.length">
                        <div class="sub-title">处理指令:</div>
                        <ul class="instruction-list">
                            <li v-for="(inst, idx) in runningPlan.slittingReview.instructions" :key="idx">
                                <!-- 宽度方向 -->
                                <template v-if="inst.locationType === 'width'">
                                    <span class="inst-icon width-icon">↔</span>
                                    <span class="inst-side">{{ inst.side }}</span>
                                    <span class="inst-pos font-mono">{{ inst.position }}mm</span>
                                </template>
                                <!-- 长度方向 -->
                                <template v-else-if="inst.locationType === 'length'">
                                    <span class="inst-icon length-icon">↕</span>
                                    <span class="inst-side">{{ inst.locationDesc }}</span>
                                </template>
                                <!-- 旧格式兼容（position 字符串） -->
                                <template v-else-if="inst.position">
                                    <span class="inst-side">{{ inst.position }}</span>
                                </template>
                                <span class="inst-defect">{{ inst.defectType }}</span>
                                <span class="inst-arrow">→</span>
                                <span class="inst-action">{{ inst.action }}</span>
                            </li>
                        </ul>
                    </div>

                    <!-- 有效宽度 -->
                    <div class="effective-width" v-if="runningPlan.slittingReview.effectiveWidth">
                        <span class="info-label">有效宽度:</span>
                        <span class="final-val">
                            <span class="number">{{ runningPlan.slittingReview.effectiveWidth }}</span>
                            <span class="unit">mm</span>
                        </span>
                    </div>
                </div>

                <!-- 无评审数据时 -->
                <div v-else class="empty-box">
                    <span class="text-muted">暂无评审信息</span>
                </div>
            </section>

            <div class="divider"></div>

            <!-- 精切方案（参考 PrecisionDetailPanel 订单段表格）-->
            <section class="detail-section">
                <div class="section-title">✂ 精切方案</div>

                <!-- 多订单顺序说明 -->
                <div v-if="runningPlan.plan?.length > 1 && runningPlan.seqReason" class="seq-reason-box">
                    <div class="seq-reason-title">⚠ 多订单切割顺序说明</div>
                    <div class="seq-reason-text">{{ runningPlan.seqReason }}</div>
                </div>

                <div v-if="runningPlan.plan?.length > 0">
                    <!-- 宽度分配可视化 -->
                    <div class="segment-bar-section" v-if="finishingSegments.length">
                        <div class="sub-title">宽度分配示意:</div>
                        <div class="segment-bar">
                            <div v-for="(seg, i) in finishingSegments" :key="i" class="segment-block"
                                :class="'seg-' + seg.type" :style="{ flex: seg.width }"
                                :title="`${seg.label} ${seg.width}mm`">
                                <span class="seg-label" v-if="seg.width >= 30">
                                    {{ seg.width }}<span class="seg-unit">mm</span>
                                </span>
                            </div>
                        </div>
                        <!-- 图例 -->
                        <div class="segment-legend">
                            <span class="legend-item"><span class="legend-dot seg-order"></span>订单</span>
                            <span class="legend-item"><span class="legend-dot seg-edge"></span>边丝</span>
                            <span class="legend-item"><span class="legend-dot seg-waste"></span>余料</span>
                        </div>
                        <!-- 分段文字列表 -->
                        <div class="segment-list">
                            <div class="segment-list-item" v-for="(seg, i) in finishingSegments" :key="i">
                                <span class="seg-type-dot" :class="'seg-' + seg.type"></span>
                                <span class="seg-list-label">{{ seg.label }}</span>
                                <span class="seg-list-width font-mono">{{ seg.width }}mm</span>
                                <span class="seg-list-note text-muted" v-if="seg.note">{{ seg.note }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="sub-title">订单段列表:</div>

                    <table class="segments-table">
                        <thead>
                            <tr>
                                <th class="text-center" style="width:28px">序</th>
                                <th style="min-width:70px">客户</th>
                                <th class="text-right" style="width:60px">宽度</th>
                                <th style="width:110px">米数</th>
                                <th style="width:48px">等级</th>
                                <th style="min-width:60px; white-space:normal">破卷备注</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, idx) in runningPlan.plan" :key="idx" class="order-row">
                                <td class="text-center">
                                    <span class="seq-badge">{{ item.seq }}</span>
                                </td>
                                <td class="font-medium text-main">{{ item.customer }}</td>
                                <td class="text-right font-mono">
                                    {{ item.orderWidth }}<span class="text-xs text-muted">mm</span>
                                </td>
                                <td class="font-mono text-sm">{{ item.lengthMin }}-{{ item.lengthMax }}m</td>
                                <td>
                                    <span class="grade-badge">{{ item.grade }}</span>
                                </td>
                                <td>
                                    <span v-if="item.coronaNote" class="corona-note-badge">
                                        {{ item.coronaNote }}
                                    </span>
                                    <span v-else class="text-muted text-xs">—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- 废料率 & 边丝 -->
                    <div class="waste-calc" v-if="runningPlan.wasteRate != null">
                        <span class="info-label">废料率:</span>
                        <span class="waste-rate" :class="wasteRateClass(runningPlan.wasteRate)">
                            {{ runningPlan.wasteRate }}%
                        </span>
                        <div class="edge-info text-muted" v-if="runningPlan.edgeTrimLeft != null">
                            (左边丝 {{ runningPlan.edgeTrimLeft }}mm, 右边丝 {{ runningPlan.edgeTrimRight }}mm)
                        </div>
                    </div>
                </div>

                <!-- 无方案时降级显示 finishingSpec -->
                <div v-else class="empty-box">
                    <span class="text-muted" v-if="runningPlan.finishingSpec">
                        精切规格: {{ runningPlan.finishingSpec }}
                    </span>
                    <span v-else class="text-muted">暂无预排方案</span>
                </div>
            </section>

            <!-- 计划备注 -->
            <div class="divider" v-if="runningPlan.planNote"></div>
            <section class="detail-section" v-if="runningPlan.planNote">
                <div class="section-title">📝 计划备注</div>
                <div class="remark-block">{{ runningPlan.planNote }}</div>
            </section>
        </template>

        <!-- 待料状态 -->
        <section class="detail-section" v-else-if="machine.status === 'waiting'">
            <div class="empty-state warning">
                <span>⏳ 当前待料中</span>
                <span class="empty-sub" v-if="nextPlan">下一卷：{{ nextPlan.childCoilNo }}</span>
            </div>
        </section>

        <!-- 故障状态 -->
        <section class="detail-section" v-else-if="machine.status === 'fault'">
            <div class="empty-state fault">
                <span>⚠️ 设备停机 / 异常</span>
            </div>
        </section>

        <!-- 下一待精切（简略） -->
        <section class="detail-section" v-if="nextPlan && machine.status === 'running'">
            <div class="section-title">
                <span class="section-dot planned"></span>下一待精切
            </div>
            <div class="coil-card next-card">
                <div class="info-row">
                    <span class="info-label">子卷号</span>
                    <span class="info-value font-mono">{{ nextPlan.childCoilNo }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">客户</span>
                    <span class="info-value">{{ nextPlan.customer || '—' }}</span>
                </div>
                <div class="info-row" v-if="nextPlan.finishingSpec">
                    <span class="info-label">精切方案</span>
                    <span class="info-value font-mono text-sm">{{ nextPlan.finishingSpec }}</span>
                </div>
                <div class="info-row" v-if="nextPlan.slittingReview?.conclusion === '让步放行'">
                    <span></span>
                    <span class="notice-inline">⚠️ 让步放行，注意处理说明</span>
                </div>
            </div>
        </section>

    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    machine: Object,
    plans: { type: Array, default: () => [] },
})

const counts = computed(() => ({
    completed: props.plans.filter(p => p.status === 'completed').length,
    running: props.plans.filter(p => p.status === 'running').length,
    planned: props.plans.filter(p => p.status === 'planned').length,
}))

const runningPlan = computed(() => props.plans.find(p => p.status === 'running') || null)
const nextPlan = computed(() => props.plans.find(p => p.status === 'planned') || null)

// 精切宽度分配庌段（宽度方向）
const finishingSegments = computed(() => {
    const plan = runningPlan.value
    if (!plan?.plan?.length || !plan.width) return []

    const totalWidth = plan.width
    const leftTrim = plan.edgeTrimLeft || 0
    const rightTrim = plan.edgeTrimRight || 0
    const segs = []

    if (leftTrim > 0) {
        segs.push({ type: 'edge', width: leftTrim, label: '左边丝', note: '' })
    }

    // 宽度方向只有一切，多订单是长度方向分切
    const orderWidth = plan.plan[0].orderWidth
    const seqLabels = ['①', '②', '③', '④', '⑤']
    if (plan.plan.length === 1) {
        segs.push({ type: 'order', width: orderWidth, label: plan.plan[0].customer })
    } else {
        // 多订单共用同一宽度，仅展示一段订单宽度 + 标注订单数
        segs.push({ type: 'order', width: orderWidth, label: `${plan.plan.length}个订单 × ${orderWidth}mm`, note: '长度方向分次切割' })
    }

    const usedWidth = leftTrim + orderWidth + rightTrim
    const wasteWidth = totalWidth - usedWidth
    if (wasteWidth > 0) {
        segs.push({ type: 'waste', width: wasteWidth, label: '余料', note: '废料' })
    }

    if (rightTrim > 0) {
        segs.push({ type: 'edge', width: rightTrim, label: '右边丝', note: '' })
    }

    return segs
})

function reviewLabel(status) {
    return { reviewed: '✅ 已评审', pending: '⚠️ 待评审', none: '❌ 未提交' }[status] || '—'
}

function conclusionClass(c) {
    if (!c) return ''
    if (c.includes('正常')) return 'conclusion-normal'
    if (c.includes('让步')) return 'conclusion-concession'
    if (c.includes('改切')) return 'conclusion-recut'
    return ''
}

function wasteRateClass(rate) {
    const r = parseFloat(rate)
    if (isNaN(r) || r === 0) return 'green'
    if (r <= 5) return 'green'
    if (r > 15) return 'red'
    return 'orange'
}

function getSeqSymbol(seq) {
    return ['①', '②', '③', '④', '⑤'][seq - 1] || `${seq}`
}
</script>

<style scoped>
/* ── 布局基础 ── */
.detail-body {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0 0 1.5rem;
    overflow-y: auto;
}

.detail-section {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-light);
}

.detail-section:last-child {
    border-bottom: none;
}

.divider {
    height: 1px;
    background: var(--border-light);
    margin: 0 1.25rem;
}

.section-title {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
}

.section-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}

.section-dot.running {
    background: var(--status-success);
}

.section-dot.planned {
    background: var(--status-processing);
}

.section-icon {
    color: var(--primary-color);
    font-style: normal;
}

/* ── 今日进度 ── */
.plan-progress-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.625rem;
}

.prog-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
}

.prog-num {
    font-family: var(--font-display);
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1;
}

.prog-num.completed {
    color: var(--status-success);
}

.prog-num.running {
    color: var(--status-processing);
}

.prog-num.waiting {
    color: #d97706;
}

.prog-num.total {
    color: var(--text-main);
}

.prog-label {
    font-size: 0.65rem;
    color: var(--text-muted);
}

.mini-progress-bar {
    height: 5px;
    background: var(--border-light);
    border-radius: 3px;
    display: flex;
    overflow: hidden;
}

.mini-fill.completed {
    background: var(--status-success);
}

.mini-fill.running {
    background: var(--status-processing);
}

/* ── 信息网格（对应 PrecisionDetailPanel 的 .info-grid） ── */
.info-grid {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.info-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.info-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    min-width: 56px;
    flex-shrink: 0;
}

.ml-auto {
    margin-left: auto;
    min-width: auto;
}

.info-value {
    font-size: 0.85rem;
    color: var(--text-main);
    font-weight: 500;
}

.info-value.coil-no {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--primary-color);
    font-size: 0.9rem;
}

.font-bold {
    font-weight: 700;
}

.font-mono {
    font-family: var(--font-mono);
    letter-spacing: 0.02em;
}

.font-medium {
    font-weight: 500;
}

.text-xs {
    font-size: 0.7rem;
}

.text-sm {
    font-size: 0.82rem;
}

.text-main {
    color: var(--text-main);
}

.text-muted {
    color: var(--text-muted);
}

.number {
    font-family: var(--font-mono);
    font-weight: 500;
}

.unit {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin: 0 2px;
}

/* 电晕标签 */
.corona-tag {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
}

.corona-tag.on {
    background: #eff6ff;
    color: #2563eb;
}

.corona-tag.off {
    background: var(--bg-base);
    color: var(--text-muted);
    border: 1px solid var(--border-light);
}

/* ── 评审状态标签 ── */
.review-status-label {
    margin-left: auto;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 4px;
}

.review-status-label.reviewed {
    background: var(--status-success-bg);
    color: var(--status-success);
}

.review-status-label.pending {
    background: #fef3c7;
    color: #d97706;
    border: 1px solid #fde68a;
}

.review-status-label.none {
    background: var(--border-light);
    color: var(--text-muted);
}

/* 评审结论文本样式 */
.conclusion-text {
    font-weight: 700;
}

.conclusion-normal {
    color: var(--status-success);
}

.conclusion-concession {
    color: #d97706;
}

.conclusion-recut {
    color: var(--status-error);
}

.mb-3 {
    margin-bottom: 0.75rem;
}

.sub-title {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 0.5rem;
}

/* ── 处理指令区块（对应 PrecisionDetailPanel 的 .instructions-wrapper） ── */
.instructions-wrapper {
    background: var(--bg-base);
    border: 1px dashed var(--border-medium);
    border-radius: var(--radius-md);
    padding: 0.625rem 0.875rem;
    margin-bottom: 0.75rem;
}

.instruction-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.instruction-list li {
    font-size: 0.82rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-main);
    flex-wrap: wrap;
}

.inst-icon {
    font-style: normal;
    opacity: 0.7;
}

.width-icon {
    color: #0369a1;
}

.length-icon {
    color: #d97706;
}

.inst-side {
    font-weight: 600;
    background: var(--bg-hover);
    padding: 1px 4px;
    border-radius: 3px;
}

.inst-pos {
    font-family: var(--font-mono);
    font-size: 0.78rem;
}

.inst-defect {
    color: var(--status-error);
}

.inst-arrow {
    color: var(--text-muted);
}

.inst-action {
    font-weight: 600;
    color: var(--primary-color);
}

/* ── 有效宽度 ── */
.effective-width {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0.75rem;
    background: var(--bg-base);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--primary-color);
    margin-top: 0.5rem;
}

.effective-width .info-label {
    margin: 0;
    min-width: auto;
}

.effective-width .final-val .number {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--primary-color);
}

/* ── 精切方案表格（对齐 PrecisionDetailPanel .segments-table） ── */
.seq-reason-box {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: var(--radius-md);
    padding: 0.625rem 0.75rem;
    margin-bottom: 0.625rem;
}

.seq-reason-title {
    color: #b45309;
    font-weight: 600;
    font-size: 0.78rem;
    margin-bottom: 0.25rem;
}

.seq-reason-text {
    color: #92400e;
    font-size: 0.82rem;
    line-height: 1.4;
}

.segments-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
    background: var(--bg-base);
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--border-light);
    margin-bottom: 0.625rem;
}

.segments-table th {
    padding: 0.5rem 0.4rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-align: left;
    border-bottom: 1px solid var(--border-medium);
    background: var(--bg-hover);
    white-space: nowrap;
}

.segments-table th.text-right {
    text-align: right;
}

.segments-table th.text-center {
    text-align: center;
}

.segments-table td {
    padding: 0.5rem 0.4rem;
    border-bottom: 1px solid var(--border-light);
    vertical-align: middle;
    white-space: nowrap;
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
    background: #eff6ff;
    color: var(--primary-color);
    border-radius: 50%;
    font-size: 0.68rem;
    font-weight: 700;
}

.grade-badge {
    font-size: 0.68rem;
    padding: 1px 4px;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-secondary);
}

.corona-note-badge {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
    color: #5b21b6;
    background: #f5f3ff;
    border: 1px solid #ddd6fe;
    border-radius: 4px;
    padding: 1px 5px;
    white-space: nowrap;
}

.waste-calc {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.625rem;
    background: var(--bg-base);
    border-radius: var(--radius-md);
}

.waste-rate {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 1rem;
}

.waste-rate.green {
    color: var(--status-success);
}

.waste-rate.orange {
    color: #d97706;
}

.waste-rate.red {
    color: var(--status-error);
}

.edge-info {
    font-size: 0.72rem;
    margin-left: auto;
}

/* ── 计划备注 ── */
.remark-block {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.6;
    background: var(--bg-base);
    border: 1px dashed var(--border-medium);
    border-radius: var(--radius-md);
    padding: 0.625rem 0.875rem;
    white-space: pre-wrap;
}

/* ── 下一待切卡片 ── */
.coil-card {
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    padding: 0.625rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.notice-inline {
    font-size: 0.75rem;
    color: #b45309;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 4px;
    padding: 0.1rem 0.375rem;
}

/* ── 空状态 ── */
.empty-box {
    padding: 1.25rem;
    text-align: center;
    background: var(--bg-base);
    border: 1px dashed var(--border-medium);
    border-radius: var(--radius-md);
    font-size: 0.85rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1.25rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
}

.empty-state.warning {
    background: var(--status-warning-bg);
    color: #b45309;
}

.empty-state.fault {
    background: var(--status-error-bg);
    color: var(--status-error);
}

.empty-sub {
    font-size: 0.75rem;
    opacity: 0.8;
    font-family: var(--font-mono);
}

/* ── 宽度分配可视化色条（与分切组件一致） ── */
.segment-bar-section {
    margin-top: 0.375rem;
    margin-bottom: 0.75rem;
}

.segment-bar {
    display: flex;
    height: 32px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid var(--border-light);
    margin-bottom: 0.375rem;
}

.segment-block {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 4px;
    overflow: hidden;
    transition: opacity 0.2s ease;
}

.segment-block:hover {
    opacity: 0.85;
}

/* 精切：无缺陷切除段，保留订单/边丝/余料 */
.segment-block.seg-order {
    background: #3b82f6;
}

.segment-block.seg-edge {
    background: #94a3b8;
}

.segment-block.seg-waste {
    background: #f59e0b;
}

.seg-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: white;
    white-space: nowrap;
}

.seg-unit {
    font-size: 0.55rem;
    opacity: 0.85;
}

.segment-legend {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.375rem;
    flex-wrap: wrap;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    color: var(--text-muted);
}

.legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;
}

.legend-dot.seg-order {
    background: #3b82f6;
}

.legend-dot.seg-edge {
    background: #94a3b8;
}

.legend-dot.seg-waste {
    background: #f59e0b;
}

.segment-list {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin-bottom: 0.625rem;
}

.segment-list-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    padding: 0.2rem 0.25rem;
}

.seg-type-dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    flex-shrink: 0;
}

.seg-type-dot.seg-order {
    background: #3b82f6;
}

.seg-type-dot.seg-edge {
    background: #94a3b8;
}

.seg-type-dot.seg-waste {
    background: #f59e0b;
}

.seg-list-label {
    color: var(--text-main);
    flex: 1;
    font-weight: 500;
}

.seg-list-width {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.seg-list-note {
    font-size: 0.7rem;
    color: var(--text-muted);
}

/* ── 废料率行 ── */
.waste-calc {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.625rem;
    background: var(--bg-base);
    border-radius: var(--radius-md);
    margin-top: 0.375rem;
}

.waste-rate {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 1rem;
}

.waste-rate.green {
    color: var(--status-success);
}

.waste-rate.orange {
    color: #d97706;
}

.waste-rate.red {
    color: var(--status-error);
}

.edge-info {
    font-size: 0.72rem;
    margin-left: auto;
    color: var(--text-muted);
}
</style>
