<template>
  <header class="top-bar">
    <div class="top-bar-left">
      <div class="logo-icon">
        <Factory :size="24" :strokeWidth="2.5" />
      </div>
      <h1 class="system-title">神火新材 · 智能生产管理系统</h1>
    </div>
    <div class="top-bar-right">
      <div class="action-item notification">
        <Bell :size="20" class="icon" />
        <span class="badge">3</span>
      </div>
      <div class="action-item user-profile">
        <div class="avatar">
          <User :size="18" :strokeWidth="2.5" />
        </div>
        <span class="username">张计划</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Factory, Bell, User } from 'lucide-vue-next'
</script>

<style scoped>
.top-bar {
  height: 56px;
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  z-index: 10;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 0.4rem;
  border-radius: 8px;
}

.system-title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: -0.01em;
  margin: 0;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-item:hover {
  background-color: var(--bg-hover);
}

.notification {
  position: relative;
}

.icon {
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.action-item:hover .icon {
  color: var(--text-main);
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--status-error);
  color: white;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  height: 16px;
  min-width: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  transform: translate(25%, -25%);
  box-shadow: 0 0 0 2px var(--bg-surface); /* White border offset effect */
}

.user-profile {
  gap: 0.75rem;
}

.avatar {
  width: 32px;
  height: 32px;
  background-color: var(--primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  transition: all 0.2s ease;
}

.action-item:hover .avatar {
  background-color: var(--primary-color);
  color: white;
}

.username {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
}
</style>
