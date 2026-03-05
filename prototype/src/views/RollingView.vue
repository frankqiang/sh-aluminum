<template>
  <div class="rolling-view">
    <!-- 控制栏 -->
    <div class="view-header">
      <div class="header-content">
        <h2 class="view-title">轧机排产表</h2>
        
        <div class="controls-area">
          <div class="filter-group">
            <div class="filter-item">
              <CalendarDays :size="16" class="icon" />
              <input type="date" class="control-input" value="2026-03-05" />
            </div>
            
            <div class="filter-item">
              <span class="label">机台</span>
              <select class="control-select">
                <option>全部</option>
                <option>粗轧</option>
                <option>中轧</option>
                <option>精轧</option>
              </select>
            </div>
            
            <div class="filter-item">
              <span class="label">状态</span>
              <select class="control-select">
                <option>全部</option>
                <option>进行中</option>
                <option>未开始</option>
                <option>已完成</option>
              </select>
            </div>
          </div>
          
          <div class="search-box">
             <Search :size="16" class="search-icon" />
             <input type="text" placeholder="搜索卷号/合金..." />
          </div>
          
          <div class="actions">
            <button class="btn btn-outline">
              <Printer :size="16" />
              打印
            </button>
            <button class="btn btn-primary" @click="addModalVisible = true">
              <Plus :size="16" />
              新增计划
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 滚动内容区 -->
    <div class="view-content">
      <!-- 产能平衡条 -->
      <CapacityBalanceBar :data="capacityBalance" class="mb-6" />

      <!-- 机台分组列表 -->
      <div class="machine-groups">
        <div v-for="group in machineGroups" :key="group.name" class="machine-group">
          <div class="group-header">
            <Layers :size="18" class="group-icon" />
            <h3 class="group-name">{{ group.name }}</h3>
            <div class="group-line"></div>
          </div>
          
          <div class="group-cards">
            <PlanTable 
              v-for="machine in group.machines" 
              :key="machine.id"
              :machine="machine"
              :data="getPlansForMachine(machine.id)"
              :bufferCount="getBufferForMachine(machine.id)"
              @view="openDetail"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 详情面板 -->
    <RollingDetailPanel
      :visible="detailVisible"
      :row="selectedRow"
      @close="detailVisible = false"
    />

    <!-- 新增弹窗 -->
    <AddPlanModal
      :visible="addModalVisible"
      @close="addModalVisible = false"
      @submit="handleAddSubmit"
    />

    <!-- Toast 提示 -->
    <ToastNotification
      :visible="toastVisible"
      :message="toastMessage"
      @close="toastVisible = false"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CalendarDays, Search, Printer, Plus, Layers } from 'lucide-vue-next'
import CapacityBalanceBar from '../components/CapacityBalanceBar.vue'
import PlanTable from '../components/PlanTable.vue'
import RollingDetailPanel from '../components/RollingDetailPanel.vue'
import AddPlanModal from '../components/AddPlanModal.vue'
import ToastNotification from '../components/ToastNotification.vue'
import { rollingMachines, rollingPlans, capacityBalance } from '../data/mock.js'

// 新增相关状态
const addModalVisible = ref(false)
const toastVisible = ref(false)
const toastMessage = ref('')

function handleAddSubmit(formData) {
  addModalVisible.value = false
  toastMessage.value = '轧机计划添加成功！'
  toastVisible.value = true
}

// 详情面板状态
const detailVisible = ref(false)
const selectedRow = ref(null)

function openDetail(row) {
  selectedRow.value = row
  detailVisible.value = true
}

// 将机台按 group 分组
const machineGroups = computed(() => {
  const groupMap = new Map()
  
  rollingMachines.forEach(machine => {
    if (!groupMap.has(machine.group)) {
      groupMap.set(machine.group, {
        name: machine.group,
        machines: []
      })
    }
    groupMap.get(machine.group).machines.push(machine)
  })
  
  return Array.from(groupMap.values())
})

// 按机台筛选计划并排序
function getPlansForMachine(machineId) {
  return rollingPlans
    .filter(p => p.machineId === machineId)
    .sort((a, b) => a.seq - b.seq)
}

function getBufferForMachine(machineId) {
  // 模拟中轧机前的缓冲警告，比如4号中轧机因为粗轧缓冲少而报警
  if (machineId >= 4 && machineId <= 6) return 1
  return null
}
</script>

<style scoped>
.rolling-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.view-header {
  padding-bottom: var(--spacing-lg);
  position: sticky;
  top: 0;
  background-color: var(--bg-main);
  z-index: 5;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.view-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-main);
}

.controls-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 4px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-right: 1px solid var(--border-light);
}

.filter-item:last-child {
  border-right: none;
}

.icon {
  color: var(--text-secondary);
}

.label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.control-input, .control-select {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--text-main);
  outline: none;
  padding: 6px 0;
  cursor: pointer;
}

.search-box {
  position: relative;
  width: 240px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-box input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.875rem;
  background-color: var(--bg-surface);
  transition: all 0.2s;
  outline: none;
}

.search-box input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.15);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-outline {
  background-color: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-medium);
}

.btn-outline:hover {
  background-color: var(--bg-hover);
}

.mb-6 {
  margin-bottom: 24px;
}

.machine-groups {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-bottom: 3rem;
}

.machine-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.group-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.group-icon {
  color: var(--primary-color);
  background-color: var(--primary-light);
  padding: 4px;
  border-radius: 6px;
  width: 28px;
  height: 28px;
}

.group-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: 0.02em;
}

.group-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border-medium) 0%, transparent 100%);
  margin-left: var(--spacing-sm);
}

.group-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
</style>
