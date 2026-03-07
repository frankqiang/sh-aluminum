<template>
  <aside :class="['side-bar', { collapsed: isCollapsed }]">
    <nav class="nav-menu">
      <div class="menu-group open">
        <div class="menu-header">
          <CalendarClock :size="18" class="icon" />
          <span class="title" v-if="!isCollapsed">排产管理</span>
          <ChevronDown :size="14" class="arrow" v-if="!isCollapsed" />
        </div>
        <div class="menu-items">
          <router-link to="/" class="menu-item" exact-active-class="active">
            <LayoutDashboard :size="18" class="icon" />
            <span class="title" v-if="!isCollapsed">总览</span>
          </router-link>
          <router-link to="/rolling" class="menu-item" active-class="active">
            <Cpu :size="18" class="icon" />
            <span class="title" v-if="!isCollapsed">轧机排产</span>
          </router-link>
          <router-link to="/slitting" class="menu-item" active-class="active">
            <Scissors :size="18" class="icon" />
            <span class="title" v-if="!isCollapsed">分切排产</span>
          </router-link>
          <router-link to="/finishing" class="menu-item" active-class="active">
            <Crosshair :size="18" class="icon" />
            <span class="title" v-if="!isCollapsed">旧版精切(供参考)</span>
          </router-link>
          <router-link to="/precision-cutting" class="menu-item" active-class="active">
            <Microscope :size="18" class="icon" />
            <span class="title" v-if="!isCollapsed">精切排产</span>
          </router-link>
        </div>
      </div>

      <div class="menu-group disabled">
        <div class="menu-header">
          <ShieldCheck :size="18" class="icon" />
          <span class="title" v-if="!isCollapsed">质量管理</span>
          <ChevronRight :size="14" class="arrow" v-if="!isCollapsed" />
        </div>
      </div>

      <div class="menu-group disabled">
        <div class="menu-header">
          <Package :size="18" class="icon" />
          <span class="title" v-if="!isCollapsed">物料管理</span>
          <ChevronRight :size="14" class="arrow" v-if="!isCollapsed" />
        </div>
      </div>

      <div class="menu-group disabled">
        <div class="menu-header">
          <Settings :size="18" class="icon" />
          <span class="title" v-if="!isCollapsed">生产执行</span>
          <ChevronRight :size="14" class="arrow" v-if="!isCollapsed" />
        </div>
      </div>
    </nav>

    <div class="collapse-toggle" @click="toggleCollapse">
      <PanelLeftOpen :size="18" class="icon" v-if="isCollapsed" />
      <PanelLeftClose :size="18" class="icon" v-else />
      <span class="title" v-if="!isCollapsed">收起视图</span>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { 
  CalendarClock, 
  LayoutDashboard, 
  Cpu, 
  Scissors, 
  Crosshair, 
  ShieldCheck, 
  Package, 
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Microscope
} from 'lucide-vue-next'

const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.side-bar {
  width: 240px;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  height: 100%;
}

.side-bar.collapsed {
  width: 68px;
}

.nav-menu {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-menu::-webkit-scrollbar {
  width: 4px;
}
.nav-menu::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 4px;
}

.menu-group {
  margin-bottom: 0.5rem;
  padding: 0 0.75rem;
}

.menu-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 0.5rem;
  color: var(--text-main);
  font-weight: 600;
  font-size: 0.85rem;
  user-select: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
}

.menu-header:hover {
  background-color: var(--bg-hover);
}

.side-bar.collapsed .menu-header {
  justify-content: center;
}

.menu-header .icon {
  margin-right: 0.6rem;
  color: var(--text-secondary);
}

.side-bar.collapsed .menu-header .icon {
  margin-right: 0;
}

.menu-header .title {
  flex: 1;
  letter-spacing: 0.02em;
}

.menu-header .arrow {
  color: var(--text-muted);
}

.menu-group.disabled .menu-header {
  color: var(--text-disabled);
  cursor: not-allowed;
  pointer-events: none;
}

.menu-group.disabled .menu-header .icon {
  color: var(--text-disabled);
  opacity: 0.6;
}

.menu-items {
  display: flex;
  flex-direction: column;
  padding-bottom: 0.5rem;
  margin-top: 0.25rem;
  gap: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.5rem 0.6rem 2rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border-radius: var(--radius-md);
  position: relative;
}

.side-bar.collapsed .menu-item {
  justify-content: center;
  padding: 0.6rem 0;
  margin: 0 2px;
}

.menu-item:hover {
  background-color: var(--bg-hover);
  color: var(--primary-color);
}

.menu-item .icon {
  margin-right: 0.6rem;
  transition: transform 0.2s ease;
}

.side-bar.collapsed .menu-item .icon {
  margin-right: 0;
}

.menu-item:hover .icon {
  transform: scale(1.1);
}

.menu-item.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
  font-weight: 500;
}

.menu-item.active .icon {
  color: var(--primary-color);
}

.collapse-toggle {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-light);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background-color: var(--bg-surface);
}

.side-bar.collapsed .collapse-toggle {
  justify-content: center;
  padding: 1rem 0;
}

.collapse-toggle:hover {
  background-color: var(--bg-hover);
  color: var(--primary-color);
}

.collapse-toggle .icon {
  margin-right: 0.75rem;
}

.side-bar.collapsed .collapse-toggle .icon {
  margin-right: 0;
}
</style>
