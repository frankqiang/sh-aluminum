# 新增轧机计划功能 - 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在轧机排产页面实现"新增计划"分步弹窗交互（仅演示流程，不真实写入数据）

**Architecture:** 创建一个 AddPlanModal.vue 弹窗组件，内含两步表单。Step 1 收集基础信息，Step 2 收集道次配置和工艺说明。提交后弹出 Toast 通知。由 RollingView.vue 控制弹窗显隐。

**Tech Stack:** Vue 3 (Composition API), Lucide Icons, 现有 CSS 设计系统变量

---

### Task 1: 创建 Toast 通知组件

**Files:**

- Create: `prototype/src/components/ToastNotification.vue`

**Step 1: 创建组件文件**

创建一个轻量的全局 Toast 通知组件：

```vue
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
```

功能要求：

- Props: `visible` (Boolean), `message` (String), `type` (String, 默认 'success')
- 固定在页面顶部居中，从上方滑入
- 3秒后自动隐藏（通过 watch visible 触发 setTimeout emit close）
- 样式使用设计系统变量，成功为绿色，警告为黄色

**Step 2: 验证组件渲染**

在浏览器中确认 Toast 组件能正常显示和自动消失。

---

### Task 2: 创建 AddPlanModal 弹窗组件 - Step 1 基础信息

**Files:**

- Create: `prototype/src/components/AddPlanModal.vue`

**Step 1: 创建弹窗骨架**

创建弹窗组件，包含遮罩层、弹窗容器、头部（标题 + 步骤指示器 + 关闭按钮）、内容区、底部按钮区：

```vue
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
          <!-- 头部 -->
          <div class="modal-header">
            <div class="modal-title">
              <Plus :size="18" class="title-icon" />
              <span>新增轧机计划</span>
            </div>
            <div class="step-indicator">
              <span :class="{ active: step === 1 }">1</span>
              <span class="step-line"></span>
              <span :class="{ active: step === 2 }">2</span>
            </div>
            <button class="close-btn" @click="$emit('close')">
              <X :size="20" />
            </button>
          </div>

          <!-- Step 1 内容 -->
          <div class="modal-body" v-if="step === 1">
            <!-- 表单内容 -->
          </div>

          <!-- Step 2 内容 -->
          <div class="modal-body" v-else>
            <!-- 表单内容 -->
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <!-- 按钮 -->
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

Props: `visible` (Boolean)
Emits: `close`, `submit`
内部状态: `step` (ref, 1 或 2), `form` (reactive 对象)

**Step 2: 实现 Step 1 表单内容**

在 `step === 1` 的条件区块中实现三个分区：

**区域 1 - 目标机台：**

- 下拉选择框，选项从 mock.js 的 `rollingMachines` 按 `group` 分组
- 使用 `<optgroup>` 实现分组下拉

**区域 2 - 卷料信息：**

- 三个文本输入框：新神火卷号、坯料卷号、批次
- 两列布局（使用 CSS Grid）

**区域 3 - 物料属性：**

- 合金下拉（1060/1100/1235D/1070/8079/1235）
- 用途下拉（电/药/食/双零）
- 来料厚度、宽度、终厚 数字输入
- 客户输入（普通文本输入框）
- 两列网格布局

**Step 3: 实现底部按钮**

Step 1 底部显示：[取消] [下一步 →]

- 取消按钮 emit('close')
- 下一步按钮将 step 设为 2

**Step 4: 编写弹窗样式**

- 弹窗宽度 560px，居中显示
- 遮罩层半透明黑色
- 弹窗使用设计系统变量：bg-surface, border-light, radius-lg 等
- 表单标签统一左对齐，输入框统一样式
- 分区标题使用与 RollingDetailPanel 一致的 section-title 样式
- 步骤指示器：两个圆圈 + 连线，当前步骤高亮
- Modal 进入/退出动画：淡入 + 向上弹出

---

### Task 3: AddPlanModal Step 2 道次配置

**Files:**

- Modify: `prototype/src/components/AddPlanModal.vue`

**Step 1: 实现 Step 2 表单内容**

**区域 1 - 机台提示：**

- 根据 Step 1 选中的机台 ID，查找 rollingMachines 信息
- 显示: "当前机台: X号XX机（可轧 X-X 道次）"

**区域 2 - 道次配置表格：**

- 使用 `form.passes` 数组 (reactive)，初始为空
- 每行显示：道次编号（自动，P1/P2/P3...）、目标厚度输入（数字，单位 μm）、删除按钮
- [+ 添加道次] 按钮：`form.passes.push({ n: nextPassNum, t: '' })`
- [🗑] 按钮：移除该行

**区域 3 - 工艺说明：**

- 多行文本框 `<textarea>`，绑定 `form.remark`
- 最小高度 80px

**Step 2: 实现底部按钮**

Step 2 底部显示：[← 上一步] [确认提交]

- 上一步 → step = 1
- 确认提交 → emit('submit', form) + emit('close')

---

### Task 4: 接入 RollingView 页面

**Files:**

- Modify: `prototype/src/views/RollingView.vue`

**Step 1: 引入组件和状态**

```js
import AddPlanModal from "../components/AddPlanModal.vue";
import ToastNotification from "../components/ToastNotification.vue";

const addModalVisible = ref(false);
const toastVisible = ref(false);
const toastMessage = ref("");

function handleAddSubmit(formData) {
  addModalVisible.value = false;
  toastMessage.value = "轧机计划添加成功！";
  toastVisible.value = true;
}
```

**Step 2: 在模板中添加组件**

1. 将顶部 `[+ 新增计划]` 按钮绑定 `@click="addModalVisible = true"`
2. 在模板底部添加 `<AddPlanModal>` 和 `<ToastNotification>`：

```vue
<AddPlanModal
  :visible="addModalVisible"
  @close="addModalVisible = false"
  @submit="handleAddSubmit"
/>
<ToastNotification
  :visible="toastVisible"
  :message="toastMessage"
  @close="toastVisible = false"
/>
```

**Step 3: 浏览器验证完整流程**

1. 点击 [+ 新增计划] → 弹窗打开，Step 1 表单展示
2. 填写信息 → 点击 [下一步] → 切换到 Step 2
3. 添加道次、填写工艺说明 → 点击 [确认提交]
4. 弹窗关闭 → Toast "计划添加成功" 从顶部滑入
5. 3秒后 Toast 自动消失
