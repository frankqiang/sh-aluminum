<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="visible" class="omm-overlay" @click.self="$emit('close')">
                <Transition name="modal-scale">
                    <div v-if="visible" class="omm-content" role="dialog" aria-modal="true">
                        <!-- 头部 -->
                        <div class="omm-header">
                            <div class="omm-title-row">
                                <ClipboardList :size="18" class="title-icon" />
                                <h3 class="omm-title">订单匹配推荐</h3>
                            </div>
                            <button class="close-btn" @click="$emit('close')" title="关闭">
                                <X :size="20" />
                            </button>
                        </div>

                        <!-- 筛选条件区 -->
                        <div class="omm-filter-bar">
                            <div class="filter-chips">
                                <span class="filter-chip">合金 <b>{{ alloy }}</b></span>
                                <span class="filter-chip">宽度 ≤ <b>{{ effectiveWidth }}mm</b></span>
                                <span class="filter-chip" v-if="grade">等级 <b>{{ grade }}</b></span>
                            </div>
                            <div class="sort-control">
                                <span class="sort-label">排序</span>
                                <select v-model="sortMode" class="sort-select">
                                    <option value="recommend">匹配度推荐</option>
                                    <option value="delivery">交期优先</option>
                                    <option value="width">宽度优先</option>
                                </select>
                            </div>
                        </div>

                        <!-- 降级品提示 -->
                        <div v-if="grade === '二级品'" class="grade-warning">
                            <AlertTriangle :size="14" />
                            <span>此卷已降为二级品，已自动排除仅接受一级品的订单</span>
                        </div>

                        <!-- 卡片列表 -->
                        <div class="omm-body">
                            <div v-if="sortedOrders.length === 0" class="omm-empty">
                                <PackageX :size="32" />
                                <span>暂无匹配的订单</span>
                            </div>
                            <div v-for="(order, idx) in sortedOrders" :key="order.orderNo" class="order-card"
                                :class="{ 'is-selected': selectedOrderNo === order.orderNo }">
                                <!-- 卡片头部 -->
                                <div class="card-top">
                                    <div class="card-left">
                                        <span v-if="order.priority === 'urgent'" class="urgent-dot" title="急单">🔴</span>
                                        <span class="order-no font-mono">{{ order.orderNo }}</span>
                                        <span class="customer-name">{{ order.customer }}</span>
                                    </div>
                                    <div class="match-score">
                                        <span class="score-label">匹配度</span>
                                        <span class="score-stars">{{ getStars(order._score) }}</span>
                                    </div>
                                </div>

                                <!-- 卡片主体 -->
                                <div class="card-body">
                                    <div class="card-specs">
                                        <div class="spec-item">
                                            <span class="spec-key">宽度</span>
                                            <span class="spec-val font-mono">{{ order.width }}<span
                                                    class="spec-unit">mm</span></span>
                                        </div>
                                        <div class="spec-item">
                                            <span class="spec-key">厚度</span>
                                            <span class="spec-val font-mono">{{ order.thickness }}<span
                                                    class="spec-unit">μm</span></span>
                                        </div>
                                        <div class="spec-item">
                                            <span class="spec-key">米数</span>
                                            <span class="spec-val font-mono">{{ order.lengthMin }}~{{ order.lengthMax
                                            }}<span class="spec-unit">m</span></span>
                                        </div>
                                        <div class="spec-item">
                                            <span class="spec-key">管芯</span>
                                            <span class="spec-val">{{ order.coreSpec }}</span>
                                        </div>
                                    </div>
                                    <div class="card-meta">
                                        <div class="meta-item" :class="deliveryUrgencyClass(order)">
                                            <Calendar :size="13" />
                                            <span>{{ order.deliveryDate }}</span>
                                            <span class="days-badge">({{ daysRemaining(order) }})</span>
                                        </div>
                                        <div class="meta-item">
                                            <Package :size="13" />
                                            <span>欠单 <b class="font-mono">{{ order.remainingCoils }}</b>/{{
                                                order.totalCoils }}卷</span>
                                        </div>
                                        <div class="meta-item" v-if="grade === '二级品'">
                                            <CheckCircle :size="13" class="grade-ok-icon" />
                                            <span>此客户接受二级品</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- 选择按钮 -->
                                <div class="card-action">
                                    <button class="select-btn" :class="{ selected: selectedOrderNo === order.orderNo }"
                                        @click="handleSelect(order)">
                                        {{ selectedOrderNo === order.orderNo ? '✓ 已选择' : '选择' }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 底部 -->
                        <div class="omm-footer">
                            <span class="footer-info">共 {{ sortedOrders.length }} 个匹配订单</span>
                            <button class="btn secondary" @click="$emit('close')">关闭</button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
    X, ClipboardList, AlertTriangle, Calendar,
    Package, PackageX, CheckCircle
} from 'lucide-vue-next'
import { orderPool } from '../data/order-pool.js'

const props = defineProps({
    visible: Boolean,
    // 母卷合金
    alloy: { type: String, default: '' },
    // 母卷有效宽度
    effectiveWidth: { type: Number, default: 0 },
    // 母卷厚度
    thickness: { type: Number, default: 0 },
    // 母卷质量等级（'一级品'/'二级品'）
    grade: { type: String, default: '' },
    // 已使用的订单号列表（排除重复选择）
    usedOrderNos: { type: Array, default: () => [] },
    // 当前段已选中的订单号（高亮）
    currentOrderNo: { type: String, default: '' },
})

const emit = defineEmits(['close', 'select'])

const sortMode = ref('recommend')
const selectedOrderNo = ref('')

// 今日日期（用于计算剩余天数）
const todayStr = '2026-03-11' // 原型固定日期
const today = new Date(todayStr)

// 计算剩余天数
function daysRemaining(order) {
    const d = new Date(order.deliveryDate)
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
    if (diff < 0) return `已逾期${-diff}天`
    if (diff === 0) return '今天交付'
    return `剩${diff}天`
}

// 交期紧迫度样式
function deliveryUrgencyClass(order) {
    const d = new Date(order.deliveryDate)
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return 'urgency-critical'
    if (diff <= 3) return 'urgency-high'
    if (diff <= 7) return 'urgency-medium'
    return 'urgency-low'
}

// 多维加权推荐评分
function calcScore(order) {
    const d = new Date(order.deliveryDate)
    const daysDiff = Math.ceil((d - today) / (1000 * 60 * 60 * 24))

    // 交期紧迫度：剩余天数越少分越高（40%权重）
    const deliveryScore = Math.max(0, 100 - daysDiff * 5) * 0.4

    // 急单加分（20%权重）
    const urgentScore = order.priority === 'urgent' ? 100 * 0.2 : 0

    // 宽度贴合度：越接近有效宽度越好（25%权重）
    const widthFit = props.effectiveWidth > 0
        ? (order.width / props.effectiveWidth) * 100
        : 0
    const widthScore = Math.min(100, widthFit) * 0.25

    // 欠单比例：欠得越多优先级越高（15%权重）
    const remainRatio = order.totalCoils > 0
        ? (order.remainingCoils / order.totalCoils) * 100
        : 0
    const remainScore = remainRatio * 0.15

    return deliveryScore + urgentScore + widthScore + remainScore
}

// 匹配度星级
function getStars(score) {
    if (score >= 80) return '★★★★★'
    if (score >= 60) return '★★★★☆'
    if (score >= 40) return '★★★☆☆'
    if (score >= 20) return '★★☆☆☆'
    return '★☆☆☆☆'
}

// 过滤+排序后的订单列表
const sortedOrders = computed(() => {
    let filtered = orderPool.filter(o => {
        // 合金匹配
        if (o.alloy !== props.alloy) return false
        // 厚度匹配（分切只改宽度，厚度必须一致）
        if (props.thickness > 0 && o.thickness !== props.thickness) return false
        // 宽度匹配
        if (o.width > props.effectiveWidth) return false
        // 已被其他段使用的排除（但当前段自己的订单保留）
        if (props.usedOrderNos.includes(o.orderNo) && o.orderNo !== props.currentOrderNo) return false
        // 质量等级匹配
        if (props.grade === '二级品') {
            if (!o.acceptGrade || !o.acceptGrade.includes('二级品')) return false
        }
        return true
    })

    // 添加评分
    filtered = filtered.map(o => ({ ...o, _score: calcScore(o) }))

    // 排序
    if (sortMode.value === 'recommend') {
        filtered.sort((a, b) => b._score - a._score)
    } else if (sortMode.value === 'delivery') {
        filtered.sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
    } else if (sortMode.value === 'width') {
        filtered.sort((a, b) => b.width - a.width)
    }

    return filtered
})

// 选择订单
function handleSelect(order) {
    selectedOrderNo.value = order.orderNo
    emit('select', order)
}
</script>

<style scoped>
/* 遮罩 & 动画 */
.omm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
    transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
}

/* 主体 */
.omm-content {
    background: var(--bg-surface);
    border-radius: var(--radius-lg);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 680px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 头部 */
.omm-header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-main);
    flex-shrink: 0;
}

.omm-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.title-icon {
    color: var(--primary-color);
}

.omm-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
}

.close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    color: var(--text-muted);
    transition: all 0.15s;
}

.close-btn:hover {
    background: var(--bg-hover);
    color: var(--text-main);
}

/* 筛选条 */
.omm-filter-bar {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-light);
    flex-shrink: 0;
}

.filter-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.filter-chip {
    font-size: 0.75rem;
    color: var(--text-secondary);
    background: var(--bg-main);
    border: 1px solid var(--border-light);
    padding: 2px 8px;
    border-radius: var(--radius-full);
}

.filter-chip b {
    color: var(--text-main);
    font-weight: 600;
}

.sort-control {
    display: flex;
    align-items: center;
    gap: 6px;
}

.sort-label {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.sort-select {
    font-size: 0.78rem;
    padding: 3px 8px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-main);
    cursor: pointer;
    font-family: inherit;
}

/* 降级品警告 */
.grade-warning {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    background: var(--status-warning-bg);
    color: #92400e;
    font-size: 0.78rem;
    font-weight: 500;
    flex-shrink: 0;
}

/* 卡片列表 */
.omm-body {
    padding: 12px 20px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.omm-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 40px 0;
    color: var(--text-muted);
    font-size: 0.85rem;
}

/* 订单卡片 */
.order-card {
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 12px 14px;
    transition: all 0.15s ease;
    background: var(--bg-surface);
}

.order-card:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
}

.order-card.is-selected {
    border-color: var(--primary-color);
    background: var(--primary-light);
}

.card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.card-left {
    display: flex;
    align-items: center;
    gap: 6px;
}

.urgent-dot {
    font-size: 0.7rem;
}

.order-no {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-main);
    letter-spacing: 0.02em;
}

.customer-name {
    font-size: 0.78rem;
    color: var(--text-secondary);
}

.match-score {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.score-label {
    font-size: 0.65rem;
    color: var(--text-muted);
}

.score-stars {
    font-size: 0.8rem;
    color: #f59e0b;
    letter-spacing: 1px;
}

.card-body {
    display: flex;
    gap: 16px;
}

.card-specs {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
}

.spec-item {
    display: flex;
    gap: 6px;
    align-items: baseline;
    font-size: 0.78rem;
}

.spec-key {
    color: var(--text-muted);
    flex-shrink: 0;
}

.spec-val {
    color: var(--text-main);
    font-weight: 500;
}

.spec-unit {
    color: var(--text-muted);
    font-size: 0.7rem;
    font-weight: 400;
}

.card-meta {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding-left: 16px;
    border-left: 1px solid var(--border-light);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.days-badge {
    font-weight: 600;
}

/* 交期紧迫度颜色 */
.urgency-critical {
    color: var(--status-error);
}

.urgency-critical .days-badge {
    background: var(--status-error-bg);
    color: var(--status-error);
    padding: 0 4px;
    border-radius: 3px;
}

.urgency-high {
    color: #ea580c;
}

.urgency-high .days-badge {
    background: #fff7ed;
    color: #ea580c;
    padding: 0 4px;
    border-radius: 3px;
}

.urgency-medium {
    color: var(--status-warning);
}

.urgency-low {
    color: var(--text-muted);
}

.grade-ok-icon {
    color: var(--status-success);
}

.card-action {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
}

.select-btn {
    padding: 4px 16px;
    font-size: 0.78rem;
    font-weight: 500;
    border-radius: var(--radius-md);
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    background: transparent;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
}

.select-btn:hover {
    background: var(--primary-color);
    color: white;
}

.select-btn.selected {
    background: var(--primary-color);
    color: white;
}

/* 底部 */
.omm-footer {
    padding: 10px 20px;
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.footer-info {
    font-size: 0.78rem;
    color: var(--text-muted);
}

.btn {
    padding: 6px 16px;
    font-size: 0.82rem;
    font-weight: 500;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
}

.btn.secondary {
    background: var(--bg-surface);
    border: 1px solid var(--border-medium);
    color: var(--text-secondary);
}

.btn.secondary:hover {
    background: var(--bg-hover);
}

.font-mono {
    font-family: var(--font-mono);
}
</style>
