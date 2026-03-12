<template>
    <div class="detail-body">

        <!-- 机台能力标签 -->
        <section class="detail-section cap-section">
            <div class="cap-tags">
                <span class="cap-tag machine-type">{{ machineTypeLabel }}</span>
                <span class="cap-tag thickness-range" v-if="machine.thicknessRange">
                    {{ machine.thicknessRange }}
                </span>
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
                    <span class="prog-label">待轧</span>
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
                        <span class="info-label">新神火卷号</span>
                        <span class="info-value coil-no">{{ runningPlan.coilNo }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">坯料卷号</span>
                        <span class="info-value font-mono text-sm">{{ runningPlan.blankCoilNo }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">合金</span>
                        <span class="info-value font-bold">{{ runningPlan.alloy }}</span>
                        <span class="info-label ml-auto">用途</span>
                        <span class="usage-badge" :class="'usage-' + runningPlan.usage">
                            {{ usageLabel(runningPlan.usage) }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">来料规格</span>
                        <span class="info-value">
                            <span class="number">{{ runningPlan.inThickness }}</span><span class="unit">mm厚</span>
                            × <span class="number">{{ runningPlan.width }}</span><span class="unit">mm宽</span>
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
                    <div class="info-row" v-if="runningPlan.execOrderNo">
                        <span class="info-label">执行单号</span>
                        <span class="info-value font-mono text-sm" style="color:var(--primary-color);font-weight:600;">
                            {{ runningPlan.execOrderNo }}
                        </span>
                    </div>
                </div>
            </section>

            <div class="divider"></div>

            <!-- 质量评审 -->
            <section class="detail-section">
                <div class="section-title">
                    <span class="section-icon">✓</span> 质量评审
                    <span class="review-status-label" :class="qualityClass(runningPlan)">
                        {{ qualityLabel(runningPlan) }}
                    </span>
                </div>

                <div v-if="runningPlan.qualityInfo" class="review-content">
                    <div class="info-grid mb-3">
                        <div class="info-row">
                            <span class="info-label">质量判定</span>
                            <span class="info-value conclusion-text"
                                :class="runningPlan.qualityInfo.judgment === '合格' ? 'conclusion-normal' : 'conclusion-recut'">
                                {{ runningPlan.qualityInfo.judgment }}
                            </span>
                        </div>
                    </div>
                    <div class="instructions-wrapper" v-if="runningPlan.qualityInfo.reviewInfo">
                        <div class="sub-title">评审信息:</div>
                        <div class="review-info-text">{{ runningPlan.qualityInfo.reviewInfo }}</div>
                    </div>
                </div>

                <div v-else class="pending-warning-box">
                    ⚠️ 轧制完成后将送检，评审结果影响后续分切安排
                </div>
            </section>

            <div class="divider"></div>

            <!-- 轧制方案 -->
            <section class="detail-section">
                <div class="section-title">⚙ 轧制方案</div>

                <div v-if="runningPlan.rollingPlan">
                    <!-- 订单规格 -->
                    <div class="info-grid mb-2" v-if="runningPlan.rollingPlan.spec">
                        <div class="info-row">
                            <span class="info-label">订单规格</span>
                            <span class="info-value font-mono text-sm">{{ runningPlan.rollingPlan.spec }}</span>
                        </div>
                        <div class="info-row" v-if="runningPlan.rollingPlan.orderReq">
                            <span class="info-label">订单要求</span>
                            <span class="info-value text-sm">{{ runningPlan.rollingPlan.orderReq }}</span>
                        </div>
                    </div>

                    <!-- 道次进度可视化条图 -->
                    <div class="segment-bar-section">
                        <div class="sub-title">道次进度:</div>
                        <div class="pass-bar">
                            <div v-for="p in runningPlan.passes" :key="p.n" class="pass-block"
                                :class="passBlockClass(p.n, runningPlan)" :title="`P${p.n} → ${p.t}μm`">
                                <span class="pass-block-label">P{{ p.n }}</span>
                                <span class="pass-block-val">{{ p.t }}</span>
                            </div>
                            <div class="pass-final-arrow">→ {{ runningPlan.finalThickness }}μm</div>
                        </div>
                    </div>

                    <!-- 计划要求 -->
                    <div class="plan-note-box" v-if="runningPlan.rollingPlan.planNote">
                        <div class="sub-title">计划要求:</div>
                        <div class="remark-block">{{ runningPlan.rollingPlan.planNote }}</div>
                    </div>
                </div>

                <div v-else class="empty-box">
                    <span class="text-muted">暂无轧制方案</span>
                </div>
            </section>

            <!-- 工艺备注 -->
            <template v-if="runningPlan.remark && runningPlan.remark !== '-'">
                <div class="divider"></div>
                <section class="detail-section">
                    <div class="section-title">📝 工艺备注</div>
                    <div class="remark-block">{{ runningPlan.remark }}</div>
                </section>
            </template>

        </template>

        <!-- 待料状态 -->
        <section class="detail-section" v-else-if="machine.status === 'waiting'">
            <div class="empty-state warning">
                <span>⏳ 当前待料中</span>
                <span class="empty-sub" v-if="nextPlan">下一卷：{{ nextPlan.coilNo }}</span>
            </div>
        </section>

        <!-- 故障状态 -->
        <section class="detail-section" v-else-if="machine.status === 'fault'">
            <div class="empty-state fault">
                <span>⚠️ 设备停机 / 异常</span>
                <span class="empty-sub" v-if="plans.length">{{ plans.length }} 卷计划暂停</span>
            </div>
        </section>

        <!-- 下一待轧 -->
        <section class="detail-section" v-if="nextPlan && machine.status === 'running'">
            <div class="section-title">
                <span class="section-dot planned"></span>下一待轧
            </div>
            <div class="coil-card next-card">
                <div class="info-row">
                    <span class="info-label">卷号</span>
                    <span class="info-value font-mono">{{ nextPlan.coilNo }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">规格</span>
                    <span class="info-value font-mono text-sm">
                        {{ nextPlan.inThickness }}mm × {{ nextPlan.width }}mm
                    </span>
                </div>
                <div class="info-row" v-if="nextPlan.customer">
                    <span class="info-label">客户</span>
                    <span class="info-value">{{ nextPlan.customer }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">目标终厚</span>
                    <span class="info-value font-mono">{{ nextPlan.finalThickness }} μm</span>
                </div>
                <div class="info-row" v-if="nextPlan.rollingPlan?.spec">
                    <span class="info-label">订单规格</span>
                    <span class="info-value font-mono text-sm">{{ nextPlan.rollingPlan.spec }}</span>
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

// 机台类型标签
const machineTypeLabel = computed(() => {
    const id = props.machine?.id
    if (id <= 3) return '粗轧机'
    if (id <= 6) return '中轧机'
    if (id === 7) return '中精轧机'
    return '精轧机'
})

// 今日计划统计
const counts = computed(() => ({
    completed: props.plans.filter(p => p.status === 'completed').length,
    running: props.plans.filter(p => p.status === 'running').length,
    planned: props.plans.filter(p => p.status === 'planned').length,
}))

const runningPlan = computed(() => props.plans.find(p => p.status === 'running') || null)
const nextPlan = computed(() => props.plans.find(p => p.status === 'planned') || null)

// 质量状态
function qualityClass(plan) {
    if (!plan.qualityInfo) return 'none'
    return plan.qualityInfo.judgment === '合格' ? 'reviewed' : 'failed'
}
function qualityLabel(plan) {
    if (!plan.qualityInfo) return '⏳ 待检验'
    return plan.qualityInfo.judgment === '合格' ? '✅ 合格' : '❌ 不合格'
}

// 道次块状态
function passBlockClass(passNo, plan) {
    if (plan.currentPasses?.includes(passNo)) return 'active'
    const currentMin = Math.min(...(plan.currentPasses || [passNo + 1]))
    if (passNo < currentMin) return 'done'
    return 'todo'
}

// 用途标签
const usageLabel = (u) => ({
    '电': '电池箔', '食': '食品箔', '药': '药品箔', '双零': '双零箔',
}[u] || u || '—')
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

.cap-tag.machine-type {
    background: #eff6ff;
    color: #2563eb;
    border-color: #bfdbfe;
}

.cap-tag.thickness-range {
    background: #f0fdf4;
    color: #16a34a;
    border-color: #a7f3d0;
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

/* ── 信息网格（与分切面板统一） ── */
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
    min-width: 60px;
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

/* 用途标签 */
.usage-badge {
    display: inline-block;
    padding: 1px 7px;
    border-radius: 4px;
    font-size: 0.72rem;
    font-weight: 500;
}

.usage-电 {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fca5a5;
}

.usage-药 {
    background: #f0fdf4;
    color: #16a34a;
    border: 1px solid #86efac;
}

.usage-食 {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #93c5fd;
}

.usage-双零 {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
}

.usage-无 {
    background: var(--bg-main);
    color: var(--text-muted);
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

.review-status-label.failed {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fca5a5;
}

.review-status-label.none {
    background: #fef3c7;
    color: #d97706;
    border: 1px solid #fde68a;
}

.conclusion-text {
    font-weight: 700;
}

.conclusion-normal {
    color: var(--status-success);
}

.conclusion-recut {
    color: #dc2626;
}

.instructions-wrapper {
    background: var(--bg-base);
    border: 1px dashed var(--border-medium);
    border-radius: var(--radius-md);
    padding: 0.625rem 0.875rem;
    margin-top: 0.5rem;
}

.review-info-text {
    font-size: 0.82rem;
    color: var(--text-secondary);
    line-height: 1.6;
}

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

/* ── 道次进度可视化条 ── */
.segment-bar-section {
    margin-top: 0.5rem;
    margin-bottom: 0.75rem;
}

.pass-bar {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.pass-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 36px;
    padding: 0.2rem 0.4rem;
    border-radius: var(--radius-sm);
    font-size: 0.7rem;
    font-weight: 600;
    transition: opacity 0.2s;
}

.pass-block.done {
    background: var(--status-success);
    color: white;
}

.pass-block.active {
    background: var(--status-processing);
    color: white;
    box-shadow: 0 0 0 2px #93c5fd;
}

.pass-block.todo {
    background: var(--border-light);
    color: var(--text-muted);
}

.pass-block-label {
    font-size: 0.65rem;
    opacity: 0.85;
}

.pass-block-val {
    font-family: var(--font-mono);
    font-size: 0.72rem;
}

.pass-final-arrow {
    font-size: 0.78rem;
    font-family: var(--font-mono);
    color: var(--primary-color);
    font-weight: 600;
    margin-left: 0.25rem;
}

/* ── 计划备注 ── */
.plan-note-box {
    margin-top: 0.75rem;
}

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

/* ── 下一待轧卡片 ── */
.coil-card {
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    padding: 0.625rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.next-card {
    background: var(--bg-surface);
}

/* ── 空/故障状态 ── */
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
