<template>
    <!-- 卷数维度 -->
    <div class="proc-stat-body">
        <!-- 主数字行：计划/完成卷数 -->
        <div class="count-row">
            <div class="count-main">
                <span class="count-num">{{ completed }}</span>
                <span class="count-sep">/</span>
                <span class="count-total">{{ planned }}</span>
                <span class="count-unit">{{ unit }}</span>
            </div>
            <span class="count-label">已完成 / 计划</span>
        </div>

        <!-- 卷数进度条 -->
        <div class="progress-bar">
            <div class="progress-fill completed" :style="{ width: completedPercent + '%' }"></div>
            <div class="progress-fill running" :style="{ width: runningPercent + '%' }"></div>
        </div>

        <!-- 卷数状态标签 -->
        <div class="progress-labels">
            <span class="pl-item">
                <i class="dot completed"></i>已完成 {{ completed }}
            </span>
            <span class="pl-item">
                <i class="dot running"></i>进行中 {{ running }}
            </span>
            <span class="pl-item">
                <i class="dot waiting"></i>等待中 {{ waiting }}
            </span>
        </div>

        <!-- 分割线 -->
        <div class="divider"></div>

        <!-- 吨位维度 -->
        <div class="ton-row">
            <div class="ton-block">
                <span class="ton-num completed-ton">{{ completedTons }}<em>吨</em></span>
                <span class="ton-label">已完成</span>
            </div>
            <div class="ton-separator">/</div>
            <div class="ton-block">
                <span class="ton-num">{{ plannedTons }}<em>吨</em></span>
                <span class="ton-label">计划总量</span>
            </div>
            <!-- 吨位完成率迷你进度 -->
            <div class="ton-rate">
                <div class="ton-rate-bar">
                    <div class="ton-rate-fill" :style="{ width: tonPercent + '%' }"></div>
                </div>
                <span class="ton-rate-pct">{{ tonPercent }}%</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    planned: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    running: { type: Number, default: 0 },
    waiting: { type: Number, default: 0 },
    plannedTons: { type: Number, default: 0 },
    completedTons: { type: Number, default: 0 },
    unit: { type: String, default: '卷' },
})

const completedPercent = computed(() =>
    props.planned ? (props.completed / props.planned) * 100 : 0
)
const runningPercent = computed(() =>
    props.planned ? (props.running / props.planned) * 100 : 0
)
const tonPercent = computed(() =>
    props.plannedTons ? Math.round(props.completedTons / props.plannedTons * 100) : 0
)
</script>

<style scoped>
.proc-stat-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* 卷数主行 */
.count-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.count-main {
    display: flex;
    align-items: baseline;
    gap: 0.15rem;
}

.count-num {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1;
}

.count-sep {
    font-size: 1.1rem;
    color: var(--text-muted);
    margin: 0 0.1rem;
}

.count-total {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-secondary);
}

.count-unit {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-left: 0.2rem;
}

.count-label {
    font-size: 0.7rem;
    color: var(--text-muted);
}

/* 进度条 */
.progress-bar {
    height: 7px;
    background: var(--border-light);
    border-radius: var(--radius-full);
    display: flex;
    overflow: hidden;
}

.progress-fill.completed {
    background: var(--status-success);
}

.progress-fill.running {
    background: var(--status-processing);
}

/* 状态标签 */
.progress-labels {
    display: flex;
    gap: 0.625rem;
    font-size: 0.7rem;
    color: var(--text-secondary);
    flex-wrap: wrap;
}

.pl-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.dot.completed {
    background: var(--status-success);
}

.dot.running {
    background: var(--status-processing);
}

.dot.waiting {
    background: var(--border-medium);
}

/* 分割线 */
.divider {
    height: 1px;
    background: var(--border-light);
    margin: 0.125rem 0;
}

/* 吨位行 */
.ton-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.ton-block {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.ton-num {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-secondary);
    line-height: 1;
}

.ton-num em {
    font-style: normal;
    font-size: 0.68rem;
    font-weight: 400;
    color: var(--text-muted);
    font-family: var(--font-body);
    margin-left: 0.1rem;
}

.ton-num.completed-ton {
    color: var(--text-main);
}

.ton-label {
    font-size: 0.62rem;
    color: var(--text-muted);
}

.ton-separator {
    font-size: 0.875rem;
    color: var(--text-muted);
    padding-bottom: 0.75rem;
}

/* 吨位迷你进度 */
.ton-rate {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-left: auto;
}

.ton-rate-bar {
    flex: 1;
    height: 4px;
    background: var(--border-light);
    border-radius: 2px;
    overflow: hidden;
}

.ton-rate-fill {
    height: 100%;
    background: var(--primary-color);
    border-radius: 2px;
    transition: width 0.4s ease;
}

.ton-rate-pct {
    font-size: 0.7rem;
    font-weight: 600;
    font-family: var(--font-mono);
    color: var(--primary-color);
    white-space: nowrap;
}
</style>
