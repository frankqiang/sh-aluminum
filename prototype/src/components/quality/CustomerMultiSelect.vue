<template>
    <!-- 客户多选下拉 -->
    <div class="cms-wrap" ref="wrapRef">
        <button class="cms-trigger" @click="toggleDropdown">
            <span class="cms-label">{{ displayLabel }}</span>
            <span class="cms-arrow" :class="{ open: isOpen }">▾</span>
        </button>
        <Transition name="cms-fade">
            <div v-if="isOpen" class="cms-dropdown" @click.stop>
                <!-- 全部客户 -->
                <label class="cms-item cms-all" @click.prevent="selectAll">
                    <span class="cms-checkbox" :class="{ checked: modelValue.length === 0 }">
                        <span v-if="modelValue.length === 0" class="cms-checkmark">✓</span>
                    </span>
                    <span class="cms-text">全部客户</span>
                </label>
                <div class="cms-divider"></div>
                <!-- 各客户选项 -->
                <label v-for="(c, i) in options" :key="c" class="cms-item" @click.prevent="toggle(c)">
                    <span class="cms-checkbox" :class="{ checked: modelValue.includes(c) }">
                        <span v-if="modelValue.includes(c)" class="cms-checkmark">✓</span>
                    </span>
                    <span class="cms-dot" :style="{ background: getColor(c, i) }"></span>
                    <span class="cms-text">{{ c }}</span>
                </label>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getCustomerColor } from '../../composables/useQualityStats'

// Props / Emits
const props = defineProps({
    modelValue: { type: Array, default: () => [] }, // 已选客户数组，空 = 全部
    options: { type: Array, default: () => [] },  // 所有可选客户
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const wrapRef = ref(null)

// 触发按钮显示文字
const displayLabel = computed(() =>
    props.modelValue.length ? props.modelValue.join('、') : '全部客户'
)

function getColor(cust, idx) {
    return getCustomerColor(cust, idx)
}

function toggleDropdown() {
    isOpen.value = !isOpen.value
}

// 选择全部 = 清空 modelValue
function selectAll() {
    emit('update:modelValue', [])
    isOpen.value = false
}

// 勾选 / 取消勾选某客户
function toggle(cust) {
    const cur = [...props.modelValue]
    const idx = cur.indexOf(cust)
    if (idx === -1) cur.push(cust)
    else cur.splice(idx, 1)
    emit('update:modelValue', cur)
}

// 点击外部关闭
function onClickOutside(e) {
    if (wrapRef.value && !wrapRef.value.contains(e.target)) {
        isOpen.value = false
    }
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.cms-wrap {
    position: relative;
    margin-left: auto;
}

.cms-trigger {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    height: 26px;
    padding: 0 0.55rem;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-family: inherit;
    color: var(--text-secondary);
    background: var(--bg-main);
    cursor: pointer;
    transition: border-color 0.15s;
    max-width: 200px;
}

.cms-trigger:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.cms-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 160px;
    display: block;
}

.cms-arrow {
    font-size: 0.6rem;
    color: var(--text-muted);
    flex-shrink: 0;
    transition: transform 0.2s;
}

.cms-arrow.open {
    transform: rotate(180deg);
}

/* 下拉面板 */
.cms-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 150px;
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    z-index: 300;
    padding: 0.3rem 0;
    max-height: 240px;
    overflow-y: auto;
}

/* 过渡动画 */
.cms-fade-enter-active,
.cms-fade-leave-active {
    transition: opacity 0.15s, transform 0.15s;
}

.cms-fade-enter-from,
.cms-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.cms-divider {
    height: 1px;
    background: var(--border-light);
    margin: 0.25rem 0;
}

/* 选项行 */
.cms-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.65rem;
    font-size: 0.78rem;
    color: var(--text-main);
    cursor: pointer;
    transition: background 0.1s;
    user-select: none;
}

.cms-item:hover {
    background: var(--bg-hover);
}

.cms-all {
    font-weight: 500;
}

/* 自定义复选框 */
.cms-checkbox {
    width: 14px;
    height: 14px;
    border: 1.5px solid var(--border-medium);
    border-radius: 3px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, background 0.15s;
}

.cms-checkbox.checked {
    background: var(--primary-color);
    border-color: var(--primary-color);
}

.cms-checkmark {
    font-size: 0.6rem;
    color: white;
    line-height: 1;
}

/* 客户颜色小点 */
.cms-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.cms-text {
    flex: 1;
    white-space: nowrap;
}
</style>
