<template>
  <div class="custom-select" ref="selectRef">
    <!-- 触发区 -->
    <div 
      class="select-trigger" 
      :class="{ 'is-active': isOpen, 'is-disabled': disabled }"
      @click="toggleDropdown"
    >
      <span class="selected-text" :class="{ 'placeholder': !displayValue }">
        {{ displayValue || placeholder }}
      </span>
      <ChevronDown :size="16" class="select-icon" :class="{ 'is-open': isOpen }" />
    </div>

    <!-- 下拉菜单 -->
    <Transition name="dropdown-fade">
      <div v-show="isOpen" class="dropdown-menu">
        <ul class="options-list">
          <!-- 简单选项列表 -->
          <template v-if="!grouped">
            <li 
              v-for="option in normalizedOptions" 
              :key="option.value"
              class="option-item"
              :class="{ 'is-selected': option.value === modelValue }"
              @click="selectOption(option)"
            >
              {{ option.label }}
              <Check v-if="option.value === modelValue" :size="14" class="check-icon" />
            </li>
          </template>

          <!-- 分组选项列表 -->
          <template v-else>
            <template v-for="(group, gIdx) in options" :key="gIdx">
              <li class="group-title">{{ group.label }}</li>
              <li 
                v-for="option in group.options" 
                :key="option.value"
                class="option-item grouped-item"
                :class="{ 'is-selected': option.value === modelValue }"
                @click="selectOption(option)"
              >
                {{ option.label }}
                <Check v-if="option.value === modelValue" :size="14" class="check-icon" />
              </li>
              <div v-if="gIdx < options.length - 1" class="group-divider"></div>
            </template>
          </template>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    // [ { label: 'A', value: 'a' } ] 或者简单数组 ['A', 'B']
    // 如果是 grouped=true，则为 [ { label: '组1', options: [{label, value}] } ]
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  grouped: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const selectRef = ref(null)

// 规范化简单数组选项
const normalizedOptions = computed(() => {
  if (props.grouped) return []
  return props.options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return { label: opt.label, value: opt.value }
    }
    return { label: String(opt), value: opt }
  })
})

// 获取当前选中项的显示文本
const displayValue = computed(() => {
  if (props.modelValue === '') return ''
  
  if (props.grouped) {
    for (const group of props.options) {
      const found = group.options.find(opt => opt.value === props.modelValue)
      if (found) return found.label
    }
  } else {
    const found = normalizedOptions.value.find(opt => opt.value === props.modelValue)
    if (found) return found.label
  }
  return props.modelValue
})

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function selectOption(option) {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

// 点击外部关闭下拉框
function handleClickOutside(event) {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: var(--bg-main);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 38px;
}

.select-trigger:hover:not(.is-disabled) {
  border-color: var(--border-dark);
}

.select-trigger.is-active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.select-trigger.is-disabled {
  background-color: var(--bg-hover);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.7;
}

.selected-text {
  font-size: 0.9rem;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

.selected-text.placeholder {
  color: var(--text-muted);
}

.select-icon {
  color: var(--text-secondary);
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.select-icon.is-open {
  transform: rotate(180deg);
  color: var(--primary-color);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  max-height: 260px;
  overflow-y: auto;
}

/* 自定义滚动条 */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}
.dropdown-menu::-webkit-scrollbar-track {
  background: transparent;
}
.dropdown-menu::-webkit-scrollbar-thumb {
  background: var(--border-medium);
  border-radius: 4px;
}
.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: var(--border-dark);
}

.options-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 0.875rem;
  color: var(--text-main);
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
}

.option-item:hover {
  background-color: var(--bg-hover);
}

.option-item.is-selected {
  background-color: var(--primary-light);
  color: var(--primary-color);
  font-weight: 500;
}

.check-icon {
  color: var(--primary-color);
}

.group-title {
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--bg-main);
  user-select: none;
}

.grouped-item {
  padding-left: 20px;
}

.group-divider {
  height: 1px;
  background-color: var(--border-light);
  margin: 4px 0;
}

/* 过渡动画 */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: top center;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: scaleY(0.95);
}
</style>
