<template>
    <div class="detail-body">

        <!-- 机台能力标签 -->
        <section class="detail-section cap-section">
            <div class="cap-tags">
                <span class="cap-tag" :class="machine.hasDetection ? 'has-detection' : 'no-detection'">
                    {{ machine.hasDetection ? '✓ 有针检/表检' : '✗ 无检测设备' }}
                </span>
                <span class="cap-tag can-cut">{{ machine.canCut }}</span>
                <span v-if="machine.period" class="cap-tag period">{{ machine.period }}</span>
            </div>
        </section>

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
                    <span class="prog-label">待切</span>
                </div>
                <div class="prog-stat" v-if="counts.pendingReview > 0">
                    <span class="prog-num review">{{ counts.pendingReview }}</span>
                    <span class="prog-label">待评审</span>
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
                        <span class="info-label">母卷号</span>
                        <span class="info-value coil-no">{{ runningPlan.motherCoilNo }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">合金</span>
                        <span class="info-value font-bold">{{ runningPlan.alloy }}</span>
                        <span class="info-label ml-auto">产品</span>
                        <span class="product-badge" :class="productClass(runningPlan.productType)">
                            {{ runningPlan.productType }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">规格</span>
                        <span class="info-value">
                            <span class="number">{{ runningPlan.thickness }}</span>
                            <span class="unit">μm</span>
                            × <span class="number">{{ runningPlan.width }}</span>
                            <span class="unit">mm</span>
                            × <span class="number">{{ runningPlan.length?.toLocaleString() }}</span>
                            <span class="unit">m</span>
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">重量</span>
                        <span class="info-value font-mono">{{ runningPlan.weight?.toLocaleString() }} kg</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">客户</span>
                        <span class="info-value font-medium">{{ runningPlan.customer || '—' }}</span>
                    </div>
                    <div class="info-row" v-if="runningPlan.orderNo">
                        <span class="info-label">订单号</span>
                        <span class="info-value font-mono text-sm">{{ runningPlan.orderNo }}</span>
                    </div>
                </div>
            </section>

            <div class="divider"></div>

            <!-- 质量评审 -->
            <section class="detail-section">
                <div class="section-title">
                    <span class="section-icon">✓</span> 质量评审
                    <span class="review-status-label" :class="runningPlan.reviewStatus || 'none'">
                        {{ reviewLabel(runningPlan.reviewStatus) }}
                    </span>
                </div>

                <div v-if="runningPlan.review" class="review-content">
                    <div class="info-grid mb-3">
                        <div class="info-row">
                            <span class="info-label">主结论</span>
                            <span class="info-value conclusion-text"
                                :class="conclusionClass(runningPlan.review.conclusion)">
                                {{ runningPlan.review.conclusion }}
                            </span>
                        </div>
                        <div class="info-row" v-if="runningPlan.review.grade">
                            <span class="info-label">产品等级</span>
                            <span class="info-value">{{ runningPlan.review.grade }}</span>
                        </div>
                        <div class="info-row" v-if="runningPlan.review.reviewer">
                            <span class="info-label">评审人</span>
                            <span class="info-value text-muted">
                                {{ runningPlan.review.reviewer }} · {{ runningPlan.review.reviewTime }}
                            </span>
                        </div>
                    </div>

                    <!-- 处理指令列表 -->
                    <div class="instructions-wrapper" v-if="runningPlan.review.instructions?.length">
                        <div class="sub-title">处理指令:</div>
                        <ul class="instruction-list">
                            <li v-for="(ins, i) in runningPlan.review.instructions" :key="i">
                                <span class="inst-icon width-icon">↔</span>
                                <span class="inst-side">{{ ins.side }}</span>
                                <span class="inst-pos font-mono">{{ ins.start }}-{{ ins.end }}mm</span>
                                <span class="inst-defect">{{ ins.defectType }}</span>
                                <span class="inst-arrow">→</span>
                                <span class="inst-action">{{ ins.action }}</span>
                            </li>
                        </ul>
                    </div>

                    <!-- 有效宽度 -->
                    <div class="effective-width" v-if="runningPlan.review.effectiveWidth">
                        <span class="info-label">有效宽度:</span>
                        <span class="final-val">
                            <span class="number">{{ runningPlan.review.effectiveWidth }}</span>
                            <span class="unit">mm</span>
                        </span>
                    </div>
                </div>

                <!-- 待评审提示 -->
                <div v-if="runningPlan.reviewStatus === 'pending'" class="pending-warning-box">
                    ⚠️ 尚未完成质量评审，请确认后再切
                </div>
                <div v-else-if="!runningPlan.review" class="empty-box">
                    <span class="text-muted">暂无评审信息</span>
                </div>
            </section>

            <div class="divider"></div>

            <!-- 分切方案 -->
            <section class="detail-section">
                <div class="section-title">✂ 分切方案</div>

                <div v-if="runningPlan.cuttingPlan">
                    <!-- 切割规格 -->
                    <div class="info-grid mb-2" v-if="runningPlan.cuttingPlan.spec">
                        <div class="info-row">
                            <span class="info-label">切割规格</span>
                            <span class="info-value font-mono text-sm">{{ runningPlan.cuttingPlan.spec }}</span>
                        </div>
                        <div class="info-row" v-if="runningPlan.cuttingPlan.coreSpec">
                            <span class="info-label">管芯规格</span>
                            <span class="info-value text-sm">{{ runningPlan.cuttingPlan.coreSpec }}</span>
                        </div>
                    </div>

                    <!-- 分切段可视化条图 -->
                    <div v-if="runningPlan.cuttingPlan.segments?.length" class="segment-bar-section">
                        <div class="sub-title">切割分段示意:</div>
                        <div class="segment-bar">
                            <div v-for="(seg, i) in runningPlan.cuttingPlan.segments" :key="i" class="segment-block"
                                :class="'seg-' + seg.type" :style="{ flex: seg.width }"
                                :title="`${seg.label} ${seg.width}mm${seg.note ? ' · ' + seg.note : ''}`">
                                <span class="seg-label" v-if="seg.width >= 40">
                                    {{ seg.width }}<span class="seg-unit">mm</span>
                                </span>
                            </div>
                        </div>
                        <!-- 图例 -->
                        <div class="segment-legend">
                            <span class="legend-item"><span class="legend-dot seg-order"></span>订单</span>
                            <span class="legend-item"><span class="legend-dot seg-edge"></span>边丝</span>
                            <span class="legend-item"><span class="legend-dot seg-defect_cut"></span>缺陷切除</span>
                            <span class="legend-item"><span class="legend-dot seg-waste"></span>余料</span>
                        </div>
                        <!-- 分段文字列表 -->
                        <div class="segment-list">
                            <div class="segment-list-item" v-for="(seg, i) in runningPlan.cuttingPlan.segments"
                                :key="i">
                                <span class="seg-type-dot" :class="'seg-' + seg.type"></span>
                                <span class="seg-list-label">{{ seg.label }}</span>
                                <span class="seg-list-width font-mono">{{ seg.width }}mm</span>
                                <span class="seg-list-note text-muted" v-if="seg.note">{{ seg.note }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 废料率 -->
                    <div class="waste-calc" v-if="runningPlan.cuttingPlan.wasteRate != null">
                        <span class="info-label">废料率:</span>
                        <span class="waste-rate" :class="wasteRateClass(runningPlan.cuttingPlan.wasteRate)">
                            {{ runningPlan.cuttingPlan.wasteRate }}%
                        </span>
                    </div>
                </div>

                <div v-else class="empty-box">
                    <span class="text-muted">暂无分切方案</span>
                </div>
            </section>

            <!-- 计划备注 -->
            <template v-if="runningPlan.planNote">
                <div class="divider"></div>
                <section class="detail-section">
                    <div class="section-title">📝 计划备注</div>
                    <div class="remark-block">{{ runningPlan.planNote }}</div>
                </section>
            </template>

        </template>

        <!-- 待料状态 -->
        <section class="detail-section" v-else-if="machine.status === 'waiting'">
            <div class="empty-state warning">
                <span>⏳ 当前待料中</span>
                <span class="empty-sub" v-if="nextPlan">下一卷：{{ nextPlan.motherCoilNo }}</span>
            </div>
        </section>

        <!-- 故障状态 -->
        <section class="detail-section" v-else-if="machine.status === 'fault'">
            <div class="empty-state fault">
                <span>⚠️ 设备停机 / 异常</span>
            </div>
        </section>

        <!-- 下一卷待评审提示 -->
        <section class="detail-section" v-if="pendingReviewPlan">
            <div class="notice-box pending-review">
                ⏸ 下一卷 <strong>{{ pendingReviewPlan.motherCoilNo }}</strong>
                正在等待质量评审，评审完成后方可分切
            </div>
        </section>

        <!-- 下一待切 -->
        <section class="detail-section"
            v-if="nextPlan && machine.status === 'running' && nextPlan.reviewStatus !== 'pending'">
            <div class="section-title">
                <span class="section-dot planned"></span>下一待切
            </div>
            <div class="coil-card next-card">
                <div class="info-row">
                    <span class="info-label">母卷号</span>
                    <span class="info-value font-mono">{{ nextPlan.motherCoilNo }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">规格</span>
                    <span class="info-value font-mono text-sm">
                        {{ nextPlan.thickness }}μm × {{ nextPlan.width }}mm
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">客户</span>
                    <span class="info-value">{{ nextPlan.customer || '—' }}</span>
                </div>
                <div class="info-row" v-if="nextPlan.reviewStatus === 'reviewed' && nextPlan.review?.conclusion">
                    <span class="info-label">评审</span>
                    <span class="info-value" :class="conclusionClass(nextPlan.review.conclusion)">
                        {{ nextPlan.review.conclusion }}
                    </span>
                </div>
                <div class="notice-inline" v-if="nextPlan.review?.conclusion === '让步放行'">
                    ⚠️ 让步放行，注意处理指令
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
    pendingReview: props.plans.filter(p => p.reviewStatus === 'pending').length,
}))

const runningPlan = computed(() => props.plans.find(p => p.status === 'running') || null)
const nextPlan = computed(() => props.plans.find(p => p.status === 'planned') || null)
const pendingReviewPlan = computed(() =>
    props.plans.find(p => p.status === 'planned' && p.reviewStatus === 'pending') || null
)

function reviewLabel(s) {
    return { reviewed: '✅ 已评审', pending: '⚠️ 待评审', none: '❌ 未提交' }[s] || '—'
}

function conclusionClass(c) {
    if (!c) return ''
    if (c.includes('正常')) return 'conclusion-normal'
    if (c.includes('让步')) return 'conclusion-concession'
    if (c.includes('改切')) return 'conclusion-recut'
    return ''
}

function productClass(type) {
    if (type === '电池箔') return 'battery'
    if (type === '双零箔') return 'double-zero'
    return ''
}

function wasteRateClass(rate) {
    const r = parseFloat(rate)
    if (isNaN(r) || r === 0) return 'green'
    if (r <= 5) return 'green'
    if (r > 15) return 'red'
    return 'orange'
}
</script>

<style scoped>
/* ── 布局 ── */
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

.cap-section {
    padding: 0.75rem 1.25rem;
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

/* ── 机台能力标签 ── */
.cap-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.cap-tag {
    font-size: 0.72rem;
    font-weight: 500;
    padding: 0.2rem 0.625rem;
    border-radius: 999px;
    border: 1px solid var(--border-light);
}

.cap-tag.has-detection {
    background: #f0fdf4;
    color: #16a34a;
    border-color: #a7f3d0;
}

.cap-tag.no-detection {
    background: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
}

.cap-tag.can-cut {
    background: #eff6ff;
    color: #2563eb;
    border-color: #bfdbfe;
}

.cap-tag.period {
    background: var(--bg-base);
    color: var(--text-muted);
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

.prog-num.review {
    color: #9333ea;
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

/* ── 信息网格 ── */
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
    min-width: 52px;
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

.text-muted {
    color: var(--text-muted);
    font-size: 0.78rem;
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

.mb-2 {
    margin-bottom: 0.5rem;
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

/* 产品标签 */
.product-badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 0.72rem;
    font-weight: 500;
}

.product-badge.battery {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fca5a5;
}

.product-badge.double-zero {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
}

/* ── 评审状态 ── */
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

/* 处理指令 */
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

.inst-icon.width-icon {
    color: #0369a1;
    font-style: normal;
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

/* 有效宽度 */
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

/* 待评审警告 */
.pending-warning-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.625rem 0.875rem;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: var(--radius-md);
    color: #b45309;
    font-size: 0.82rem;
    font-weight: 500;
}

/* ── 分切段可视化 ── */
.segment-bar-section {
    margin-top: 0.5rem;
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

/* 分段颜色 */
.segment-block.seg-order {
    background: #3b82f6;
}

.segment-block.seg-edge {
    background: #94a3b8;
}

.segment-block.seg-defect_cut {
    background: #ef4444;
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

/* 图例 */
.segment-legend {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
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

.legend-dot.seg-defect_cut {
    background: #ef4444;
}

.legend-dot.seg-waste {
    background: #f59e0b;
}

/* 分段列表 */
.segment-list {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin-bottom: 0.5rem;
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

.seg-type-dot.seg-defect_cut {
    background: #ef4444;
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
}

/* 废料率 */
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
    margin-top: 0.25rem;
}

/* 待评审通知 */
.notice-box.pending-review {
    font-size: 0.8rem;
    color: #b45309;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: var(--radius-md);
    padding: 0.625rem 0.875rem;
}

/* 空状态 */
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
</style>
