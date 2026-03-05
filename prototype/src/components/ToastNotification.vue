<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div v-if="visible" class="toast" :class="type">
        <CheckCircle2 v-if="type === 'success'" :size="18" />
        <AlertTriangle v-if="type === 'warning'" :size="18" />
        <span class="toast-msg">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'
import { CheckCircle2, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  visible: Boolean,
  message: String,
  type: {
    type: String,
    default: 'success'
  }
})

const emit = defineEmits(['close'])

let timeoutId = null

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      emit('close')
    }, 3000)
  }
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
}

.toast.success {
  background-color: var(--status-success-bg);
  color: var(--status-success);
  border: 1px solid #a7f3d0;
}

.toast.warning {
  background-color: var(--status-warning-bg);
  color: var(--status-warning);
  border: 1px solid #fde68a;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%);
}
</style>
