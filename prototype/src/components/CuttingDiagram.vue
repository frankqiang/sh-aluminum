<template>
    <!-- 切刀横截面可视化 -->
    <div class="cutting-diagram">
        <div class="diagram-label">
            <span class="label-text">切刀布局示意</span>
            <span class="label-total font-mono">母卷总宽 {{ totalWidth }}mm</span>
        </div>

        <!-- 主条形图区域 -->
        <div class="diagram-bar" v-if="segments.length > 0">
            <!-- 段条 -->
            <div v-for="(seg, idx) in segments" :key="idx" class="bar-segment" :class="segClass(seg)"
                :style="segStyle(seg)" @mouseenter="hoveredIdx = idx" @mouseleave="hoveredIdx = -1">
                <span class="seg-label" v-if="showLabel(seg)">
                    {{ segLabelText(seg) }}
                </span>
                <span class="seg-width-label font-mono" v-if="Number(seg.width) > 0">
                    {{ seg.width }}
                </span>

                <!-- 悬浮详情 tooltip -->
                <Transition name="tip-fade">
                    <div v-if="hoveredIdx === idx" class="seg-tooltip">
                        <div class="tip-type">{{ segTypeName(seg) }}</div>
                        <div class="tip-row" v-if="seg.type === 'order' && seg.orderInfo">
                            <span class="tip-key">订单</span>
                            <span class="tip-val">{{ seg.orderInfo.orderNo }}</span>
                        </div>
                        <div class="tip-row" v-if="seg.type === 'order' && seg.orderInfo">
                            <span class="tip-key">客户</span>
                            <span class="tip-val">{{ seg.orderInfo.customer }}</span>
                        </div>
                        <div class="tip-row">
                            <span class="tip-key">宽度</span>
                            <span class="tip-val font-mono">{{ seg.width ?? 0 }}mm</span>
                        </div>
                        <div class="tip-row" v-if="seg.note">
                            <span class="tip-key">说明</span>
                            <span class="tip-val">{{ seg.note }}</span>
                        </div>
                    </div>
                </Transition>
            </div>

            <!-- 余料段（如果有剩余宽度） -->
            <div v-if="remainingWidth > 0" class="bar-segment seg-waste" :style="{ flex: `${remainingWidth} 0 0` }"
                @mouseenter="hoveredIdx = 999" @mouseleave="hoveredIdx = -1">
                <span class="seg-label">余料</span>
                <span class="seg-width-label font-mono">{{ remainingWidth }}</span>
                <Transition name="tip-fade">
                    <div v-if="hoveredIdx === 999" class="seg-tooltip">
                        <div class="tip-type">余料</div>
                        <div class="tip-row">
                            <span class="tip-key">宽度</span>
                            <span class="tip-val font-mono">{{ remainingWidth }}mm</span>
                        </div>
                        <div class="tip-row" v-if="remainingWidth >= 100">
                            <span class="tip-val tip-hint">💡 可尝试搭配窄幅订单</span>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- 无数据提示 -->
        <div v-else class="diagram-empty">
            请先添加切刀段
        </div>

        <!-- 缺陷/避留白标记层 -->
        <div class="defect-markers" v-if="instructions.length > 0 && totalWidth > 0">
            <div v-for="(inst, idx) in instructions" :key="'d' + idx" class="defect-marker" :class="markerClass(inst)"
                :style="markerStyle(inst)" :title="markerTitle(inst)">
                <span class="marker-icon">{{ inst.action === '避留白' ? '⚡' : '✂' }}</span>
            </div>
        </div>

        <!-- 图例 -->
        <div class="diagram-legend">
            <span class="legend-item"><span class="legend-dot edge"></span>边丝</span>
            <span class="legend-item"><span class="legend-dot order"></span>订单</span>
            <span class="legend-item"><span class="legend-dot defect"></span>切除</span>
            <span class="legend-item"><span class="legend-dot waste"></span>余料</span>
            <span class="legend-item" v-if="hasAvoidMarks"><span class="legend-dot avoid"></span>避留白</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    // 段列表（与 AddSlittingPlanModal 的 segments 相同结构）
    segments: { type: Array, default: () => [] },
    // 母卷总宽 mm
    totalWidth: { type: Number, default: 0 },
    // 质量评审处理指令（用于标注缺陷/避留白位置）
    instructions: { type: Array, default: () => [] },
})

const hoveredIdx = ref(-1)

// 已分配总宽
const allocatedWidth = computed(() =>
    props.segments.reduce((sum, s) => sum + (Number(s.width) || 0), 0)
)

// 剩余宽度
const remainingWidth = computed(() =>
    Math.max(0, props.totalWidth - allocatedWidth.value)
)

// 是否有避留白标记
const hasAvoidMarks = computed(() =>
    props.instructions.some(i => i.action === '避留白')
)

// 段样式类名
function segClass(seg) {
    const map = {
        edge: 'seg-edge',
        order: 'seg-order',
        defect_cut: 'seg-defect',
        waste: 'seg-waste',
    }
    return map[seg.type] || 'seg-order'
}

// 段宽度比例样式
function segStyle(seg) {
    const w = Number(seg.width) || 0
    return { flex: `${w} 0 0` }
}

// 是否显示段标签（太窄的不显示）
function showLabel(seg) {
    const w = Number(seg.width) || 0
    // 段宽度占比 > 3% 时显示
    return props.totalWidth > 0 && (w / props.totalWidth) > 0.03
}

// 段标签文字
function segLabelText(seg) {
    if (seg.type === 'edge') return '边丝'
    if (seg.type === 'defect_cut') return '切除'
    if (seg.type === 'waste') return '余料'
    if (seg.type === 'order' && seg.orderInfo) return seg.orderInfo.customer
    if (seg.type === 'order') return '订单'
    return ''
}

// 段类型名
function segTypeName(seg) {
    const map = { edge: '边丝', order: '订单段', defect_cut: '缺陷切除', waste: '余料' }
    return map[seg.type] || seg.type
}

// 缺陷标记样式类
function markerClass(inst) {
    return inst.action === '避留白' ? 'marker-avoid' : 'marker-cut'
}

// 缺陷标记位置（基于母卷横截面位置）
function markerStyle(inst) {
    if (props.totalWidth <= 0) return {}
    // 标记位置在缺陷中点
    const mid = (inst.start + inst.end) / 2
    const leftPercent = (mid / props.totalWidth) * 100
    const widthPercent = Math.max(0.5, ((inst.end - inst.start) / props.totalWidth) * 100)
    return {
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        transform: 'translateX(-50%)',
    }
}

// 缺陷标记 title
function markerTitle(inst) {
    return `${inst.side} ${inst.start}-${inst.end}mm ${inst.defectType} → ${inst.action}`
}
</script>

<style scoped>
.cutting-diagram {
    background: var(--bg-main);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 10px 12px;
    margin: 8px 0;
}

.diagram-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.label-text {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-secondary);
}

.label-total {
    font-size: 0.78rem;
    color: var(--text-muted);
}

/* 主条形图 */
.diagram-bar {
    display: flex;
    height: 42px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--border-medium);
    position: relative;
}

.bar-segment {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 2px;
    cursor: pointer;
    transition: filter 0.15s ease, flex 0.3s ease;
    overflow: hidden;
    border-right: 1px solid rgba(255, 255, 255, 0.5);
}

.bar-segment:last-child {
    border-right: none;
}

.bar-segment:hover {
    filter: brightness(1.08);
}

/* 段颜色 */
.seg-edge {
    background: linear-gradient(135deg, #94a3b8, #cbd5e1);
}

.seg-order {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.seg-defect {
    background: linear-gradient(135deg, #ef4444, #f87171);
}

.seg-waste {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

/* 段内标签 */
.seg-label {
    font-size: 0.65rem;
    font-weight: 500;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
    line-height: 1;
}

.seg-width-label {
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1;
    margin-top: 1px;
}

/* Tooltip */
.seg-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--text-main);
    color: white;
    padding: 8px 10px;
    border-radius: var(--radius-md);
    font-size: 0.75rem;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    pointer-events: none;
}

.seg-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--text-main);
}

.tip-type {
    font-weight: 600;
    margin-bottom: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tip-row {
    display: flex;
    gap: 8px;
    line-height: 1.5;
}

.tip-key {
    color: rgba(255, 255, 255, 0.6);
}

.tip-val {
    color: white;
}

.tip-hint {
    color: #fbbf24;
    font-size: 0.7rem;
}

.tip-fade-enter-active,
.tip-fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
}

/* 缺陷标记层 */
.defect-markers {
    position: relative;
    height: 14px;
    margin-top: 2px;
}

.defect-marker {
    position: absolute;
    top: 0;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: help;
}

.marker-icon {
    font-size: 0.65rem;
    line-height: 1;
}

.marker-cut {
    background: rgba(239, 68, 68, 0.15);
    border-radius: 2px;
}

.marker-avoid {
    background: rgba(245, 158, 11, 0.15);
    border-radius: 2px;
}

/* 图例 */
.diagram-legend {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    flex-wrap: wrap;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    color: var(--text-muted);
}

.legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
}

.legend-dot.edge {
    background: #94a3b8;
}

.legend-dot.order {
    background: #3b82f6;
}

.legend-dot.defect {
    background: #ef4444;
}

.legend-dot.waste {
    background: #f59e0b;
}

.legend-dot.avoid {
    background: #fbbf24;
    border: 1px dashed #f59e0b;
}

.diagram-empty {
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 0.8rem;
    border: 1px dashed var(--border-medium);
    border-radius: 6px;
}

.font-mono {
    font-family: var(--font-mono);
}
</style>
