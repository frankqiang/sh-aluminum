# 生产执行模块 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为铝箔MES原型系统构建「生产执行模块」，包含订单看板和订单跟踪两个页面，解决订单进度不透明的痛点。

**Architecture:** 采用 Vue 3 + Vue Router 的 SPA 架构，新增两个页面视图和一个详情面板组件。使用 Chart.js + vue-chartjs 实现环形图和柱状图。Mock 数据独立存放在 `src/data/execution/` 目录下，不与现有 `order-pool.js` 耦合。

**Tech Stack:** Vue 3 (Composition API), Vue Router, Chart.js, vue-chartjs, Lucide Icons, 现有 CSS 设计系统

**设计文档:** [生产执行模块设计方案](./2026-03-09-production-execution-design.md)

---

## Task 1: 安装图表库依赖

**Files:**

- Modify: `prototype/package.json`

**Step 1: 安装 chart.js 和 vue-chartjs**

```bash
cd c:\Users\tyq\Desktop\aluminum\prototype
npm install chart.js vue-chartjs
```

**Step 2: 验证安装**

```bash
npm ls chart.js vue-chartjs
```

Expected: 显示 chart.js 和 vue-chartjs 的版本号，无 ERR

**Step 3: 验证开发服务器正常运行**

确认 `npm run dev` 仍正常运行，无构建错误。

---

## Task 2: 创建 Mock 数据文件

**Files:**

- Create: `prototype/src/data/execution/execution-orders.js`
- Create: `prototype/src/data/execution/execution-stats.js`

**Step 1: 创建订单 mock 数据**

Create `prototype/src/data/execution/execution-orders.js`

包含 15-20 条订单数据，覆盖以下场景：

- 各种状态：pending（待排产）、producing（生产中）、packing（待包装）、completed（已完成）
- 各种紧急程度：已逾期、3天内到期、正常
- 各种产品类型：电池箔（1060/1100/1235D）、双零箔（8079/1235）
- 各种客户：河北兴恒、宁德时代、比亚迪、标兵母卷、优箔母卷等
- 订单进度从0%到100%

每条订单数据结构：

```js
{
    id: 'ORD-001',
    orderNo: 'SZ2601280123',        // NC执行单号
    contractNo: 'HT2026-0201',      // 合同号
    customer: '河北兴恒',
    product: '电池箔成品',           // 电池箔成品 / 双零箔成品
    alloy: '1100',
    thickness: 13,                   // μm
    width: 872,                      // mm
    lengthMin: 12000,                // 米数范围
    lengthMax: 13000,
    coreSpec: '152.4管芯/壁厚4',

    // 执行跟踪
    status: 'producing',             // pending/producing/packing/completed
    deliveryDate: '2026-03-12',
    totalCoils: 10,
    totalWeight: 50000,              // kg
    completedCoils: 6,
    completedWeight: 30000,          // kg
    priority: 'urgent',              // normal/urgent
    isOverdue: false,
    daysUntilDelivery: 3,

    // 关联料卷（2-5个）
    linkedCoils: [
        {
            coilNo: 'Y2601301/1-1',
            motherCoilNo: 'Y2601301',
            stage: 'completed',          // rolling/slitting/finishing/packing/completed
            stageLabel: '已完成',
            status: 'completed',         // waiting/processing/completed
            statusLabel: '已完成',
            weight: 10000,               // kg
            machine: '精切12#',
            qualityResult: '合格',
            qualityDetail: null,
            completedAt: '2026-03-03 12:00',
        },
    ],

    // 生产时间线（3-8个节点）
    timeline: [
        {
            time: '2026-03-01 08:30',
            type: 'plan',               // plan/rolling/quality/slitting/finishing/packing
            title: '排产关联',
            desc: '计划员张三关联到订单',
            coilNo: 'Y2601301',
        },
    ],

    // 质量追溯链
    traceability: {
        motherCoil: 'Y2601301',
        rollingMachine: '轧机8#',
        rollingDate: '2026-03-01',
        rollingQuality: '合格，压延质量正常',
        children: [
            {
                coilNo: 'Y2601301/1-1',
                slittingQuality: '针孔A=52, B=8, 让步放行',
                finishingQuality: '合格',
            },
        ],
    },
}
```

**数据场景覆盖要求：**

- 至少 3 条已逾期订单（deliveryDate 早于 2026-03-09，status ≠ completed）
- 至少 4 条 3天内到期订单
- 至少 5 条生产中订单（有关联料卷，部分完成）
- 至少 3 条已完成订单
- 至少 2 条待排产订单
- 至少 2 条待包装订单
- 每条 producing/packing/completed 订单有 2-5 个关联料卷
- 时间线数据体现各工序流转过程
- 追溯链数据能展示 母卷→分切→精切 的完整链路

**Step 2: 创建看板统计 mock 数据**

Create `prototype/src/data/execution/execution-stats.js`

此文件从 `execution-orders.js` 导入订单数据，**动态计算**统计指标（不硬编码，保持数据一致性）：

```js
import { executionOrders } from './execution-orders.js'

// 基于当前日期(2026-03-09)计算
const TODAY = '2026-03-09'

// 动态计算各统计值
export const executionStats = {
    activeOrders:      // producing 状态的数量
    overdueOrders:     // isOverdue === true 的数量
    dueSoon:           // daysUntilDelivery <= 3 且 > 0 且 status !== 'completed'
    onTimeRate:        // 已完成中按时完成的比例 (%)
    completedThisMonth: // 本月 completed 的数量
    producingOrders:   // producing 状态的数量
}

// 状态分布（用于环形图）
export const statusDistribution = {
    pending:   // pending 数量
    producing: // producing 数量
    packing:   // packing 数量
    completed: // completed 数量
}

// 工序分布（用于柱状图）- 统计关联料卷在各工序的分布
export const processDistribution = {
    rolling:   { active: N, completed: N },
    slitting:  { active: N, completed: N },
    finishing: { active: N, completed: N },
}

// 客户维度汇总
export const customerSummary = [
    { customer: '河北兴恒', total: 8, producing: 5, completed: 2, overdue: 1 },
    // ...
]

// 近期完成订单
export const recentCompleted = [
    { orderNo: '...', customer: '...', completedAt: '2026-03-08', spec: '13×872' },
    // ...
]

// 交期预警列表 - 逾期 + 3天内到期，按紧急程度排序
export const deliveryWarnings = [
    // 从 executionOrders 中筛选 isOverdue || daysUntilDelivery <= 3
    // 按 daysUntilDelivery 升序排列
]
```

**Step 3: 验证数据可导入**

在浏览器控制台或临时引用中确认两个文件可正常导入，无语法错误。

---

## Task 3: 更新路由和侧边栏导航

**Files:**

- Modify: `prototype/src/router/index.js` (追加2个路由)
- Modify: `prototype/src/layout/SideBar.vue` (替换disabled分组为open分组)

**Step 1: 添加路由**

在 `prototype/src/router/index.js` 的 `children` 数组中，在物料管理路由之后追加：

```js
// 生产执行模块 - 订单看板
{
    path: 'execution/dashboard',
    name: 'ExecutionDashboard',
    component: () => import('../views/ExecutionDashboardView.vue')
},
// 生产执行模块 - 订单跟踪
{
    path: 'execution/orders',
    name: 'ExecutionOrders',
    component: () => import('../views/ExecutionOrdersView.vue')
},
```

**Step 2: 更新侧边栏**

在 `prototype/src/layout/SideBar.vue` 中：

将第70-76行的 disabled 生产执行分组：

```html
<div class="menu-group disabled">
  <div class="menu-header">
    <Settings :size="18" class="icon" />
    <span class="title" v-if="!isCollapsed">生产执行</span>
    <ChevronRight :size="14" class="arrow" v-if="!isCollapsed" />
  </div>
</div>
```

替换为 open 分组：

```html
<div class="menu-group open">
  <div class="menu-header">
    <ClipboardList :size="18" class="icon" />
    <span class="title" v-if="!isCollapsed">生产执行</span>
    <ChevronDown :size="14" class="arrow" v-if="!isCollapsed" />
  </div>
  <div class="menu-items">
    <router-link
      to="/execution/dashboard"
      class="menu-item"
      active-class="active"
    >
      <BarChart3 :size="18" class="icon" />
      <span class="title" v-if="!isCollapsed">订单看板</span>
    </router-link>
    <router-link to="/execution/orders" class="menu-item" active-class="active">
      <ListOrdered :size="18" class="icon" />
      <span class="title" v-if="!isCollapsed">订单跟踪</span>
    </router-link>
  </div>
</div>
```

更新 `<script setup>` 的图标导入：添加 `ClipboardList`、`ListOrdered`，移除不需要的 `Settings`。
注意：`BarChart3` 已在物料管理模块的导入中存在，无需重复导入。

**Step 3: 创建占位视图文件**

Create `prototype/src/views/ExecutionDashboardView.vue`

```vue
<template>
  <div class="page-container">
    <h1 class="page-title">订单看板</h1>
    <p class="page-subtitle">开发中...</p>
  </div>
</template>
```

Create `prototype/src/views/ExecutionOrdersView.vue`

```vue
<template>
  <div class="page-container">
    <h1 class="page-title">订单跟踪</h1>
    <p class="page-subtitle">开发中...</p>
  </div>
</template>
```

**Step 4: 验证**

在浏览器中：

1. 侧边栏「生产执行」分组展开，显示「订单看板」和「订单跟踪」
2. 点击各链接路由正确，占位页面正常显示
3. 其他模块导航不受影响

---

## Task 4: 实现订单看板页面

**Files:**

- Modify: `prototype/src/views/ExecutionDashboardView.vue`（从占位替换为完整实现）

**Step 1: 实现页面头部 + 统计卡片区**

页面布局：

```
┌─ 页面头部（标题 + 日期切换器）────────────────────────┐
├─ 统计卡片区（6张，grid 3列×2行）─────────────────────┤
│  [今日活跃📊] [逾期订单⚠️] [3天内到期⏰]             │
│  [准时完成率✅] [本月已完成📦] [生产中🔄]             │
└──────────────────────────────────────────────────────┘
```

复用现有 `StatCard` 组件，`grid-template-columns: repeat(3, 1fr)`。

6张卡片配置：

| 序号 | 卡片标题     | theme  | 主数值                            | hasProgress | 图标(Lucide)  |
| ---- | ------------ | ------ | --------------------------------- | ----------- | ------------- |
| 1    | 今日活跃订单 | blue   | executionStats.activeOrders       | false       | Activity      |
| 2    | 逾期订单     | red\*  | executionStats.overdueOrders      | false       | AlertTriangle |
| 3    | 3天内到期    | orange | executionStats.dueSoon            | false       | Clock         |
| 4    | 订单准时率   | green  | executionStats.onTimeRate + '%'   | false       | CheckCircle   |
| 5    | 本月已完成   | teal\* | executionStats.completedThisMonth | false       | PackageCheck  |
| 6    | 生产中订单   | purple | executionStats.producingOrders    | false       | Loader        |

\*注：如果 StatCard 不支持 red/teal theme，使用 `#body` slot 自定义样式或扩展 StatCard 的 CSS。

**Step 2: 实现图表区（双列）**

两列布局 `grid-template-columns: 1fr 1fr`，每列一个 `.panel`。

左侧 — **订单状态分布**（Doughnut 环形图）：

```js
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);
```

- 4个段：待排产(灰) / 生产中(蓝) / 待包装(紫) / 已完成(绿)
- `cutout: '65%'` 形成环形
- Chart.js 配置禁用默认 legend，自己在右侧渲染自定义图例
- 环形中央用绝对定位显示总订单数

右侧 — **工序维度分布**（Bar 柱状图）：

```js
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
```

- 水平柱状图 `indexAxis: 'y'`
- 3个类别：轧机 / 分切 / 精切
- 2组数据：进行中(蓝) + 已完成(绿)
- 堆叠模式 `stacked: true`

**Step 3: 实现交期预警列表（全宽面板）**

面板标题：「⚠️ 交期预警」+ 右侧「查看全部」按钮（router-link 到 /execution/orders）。

表格列：
| 列 | 内容 | 样式说明 |
|----|------|---------|
| 订单号/合同号 | 主行+副行 | td-main + td-sub |
| 客户 | customer | — |
| 产品规格 | thickness×width product | — |
| 交期 | deliveryDate | — |
| 距交期 | daysUntilDelivery | 颜色：≤0红, 1-3橙, >3绿 |
| 进度 | 进度条+百分比 | progress-simple 样式 |
| 紧急等级 | badge | critical/warning/normal |

数据：`deliveryWarnings`，最多显示前 8 条。
逾期行左边框 `border-left: 3px solid var(--status-error)`。
3天内到期行左边框 `border-left: 3px solid #d97706`。

**Step 4: 实现底部双列区**

两列：`grid-template-columns: 1fr 1fr`

左侧 — **按客户维度汇总**：

- 面板标题：「👥 客户订单分布」
- 表格列：客户 | 总订单 | 进行中 | 已完成 | 逾期
- 逾期列数值>0时红色粗体
- 数据：`customerSummary`

右侧 — **近期完成订单**：

- 面板标题：「✅ 近期完成」
- 表格列：订单号 | 客户 | 规格 | 完成时间
- 数据：`recentCompleted`，最多6行
- 完成时间格式化为 `MM-DD HH:mm`

**Step 5: 验证**

1. 6张统计卡片正确显示数值，布局3×2
2. 环形图4个颜色段正确，数值匹配
3. 柱状图3个工序堆叠显示正确
4. 交期预警表格逾期行红色标记
5. 客户汇总和近期完成数据正确
6. 页面整体滚动流畅

---

## Task 5: 实现订单跟踪页面 — 筛选栏和表格

**Files:**

- Modify: `prototype/src/views/ExecutionOrdersView.vue`（从占位替换为完整实现）

**Step 1: 实现页面头部和筛选栏**

```
┌─ 页面头部 ─────────────────────────────────────────┐
│  订单跟踪                                           │
│  全量订单列表与执行进度追踪                          │
├─ 筛选栏 ───────────────────────────────────────────┤
│  [状态▼] [客户▼] [产品类型▼] [交期范围▼] [仅逾期☐]  │
│  [🔍 搜索订单号/合同号/卷号...]                      │
└───────────────────────────────────────────────────┘
```

筛选逻辑（使用 `ref` + `computed`）：

```js
const filterStatus = ref("all"); // all/pending/producing/packing/completed
const filterCustomer = ref("all"); // all / 动态列表
const filterProduct = ref("all"); // all/电池箔/双零箔
const filterDelivery = ref("all"); // all/thisWeek/thisMonth/overdue
const filterOverdueOnly = ref(false); // toggle
const searchKeyword = ref(""); // 模糊搜索

const filteredOrders = computed(() => {
  return executionOrders.filter((order) => {
    // 逐条件过滤
    if (filterStatus.value !== "all" && order.status !== filterStatus.value)
      return false;
    if (
      filterCustomer.value !== "all" &&
      order.customer !== filterCustomer.value
    )
      return false;
    if (filterProduct.value !== "all") {
      const isMatch =
        filterProduct.value === "电池箔"
          ? order.product.includes("电池箔")
          : order.product.includes("双零箔");
      if (!isMatch) return false;
    }
    if (filterDelivery.value === "overdue" && !order.isOverdue) return false;
    if (filterDelivery.value === "thisWeek" && order.daysUntilDelivery > 7)
      return false;
    if (filterDelivery.value === "thisMonth" && order.daysUntilDelivery > 30)
      return false;
    if (filterOverdueOnly.value && !order.isOverdue) return false;
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase();
      const inOrder =
        order.orderNo.toLowerCase().includes(kw) ||
        order.contractNo.toLowerCase().includes(kw);
      const inCoils = order.linkedCoils?.some((c) =>
        c.coilNo.toLowerCase().includes(kw),
      );
      if (!inOrder && !inCoils) return false;
    }
    return true;
  });
});
```

下拉框使用原生 `<select>` 或复用 `CustomSelect`（检查 `prototype/src/components/` 是否有）。

**Step 2: 实现订单表格**

表格列定义：

| 列       | 字段                             | 宽度  | 可排序 | 渲染方式                   |
| -------- | -------------------------------- | ----- | ------ | -------------------------- |
| 订单号   | orderNo + contractNo             | 180px | ✅     | 主行+副行 (td-main/td-sub) |
| 客户     | customer                         | 120px | ✅     | 文本                       |
| 产品规格 | thickness×width + product        | 160px | ❌     | 如 "13×872 电池箔"         |
| 合金     | alloy                            | 70px  | ✅     | 文本                       |
| 需求     | totalCoils + totalWeight         | 100px | ✅     | "10卷 / 50吨"              |
| 进度     | completedCoils/totalCoils        | 140px | ✅     | 进度条+百分比              |
| 交期     | deliveryDate + daysUntilDelivery | 130px | ✅     | 日期+倒计时badge           |
| 状态     | status                           | 90px  | ✅     | 状态标签                   |

排序实现：

```js
const sortField = ref("deliveryDate");
const sortDirection = ref("asc"); // asc / desc

const toggleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
};

const sortedOrders = computed(() => {
  const list = [...filteredOrders.value];
  list.sort((a, b) => {
    let va = a[sortField.value];
    let vb = b[sortField.value];
    // 进度特殊处理
    if (sortField.value === "progress") {
      va = a.completedCoils / a.totalCoils;
      vb = b.completedCoils / b.totalCoils;
    }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDirection.value === "asc" ? cmp : -cmp;
  });
  return list;
});
```

行样式：

- 选中行：`background: var(--primary-light)`
- 逾期行：`border-left: 3px solid var(--status-error)`
- 3天内到期行：`border-left: 3px solid #d97706`
- hover 行：`background: var(--bg-hover)`

状态标签映射：

```js
const statusMap = {
  pending: { label: "待排产", class: "status-pending" },
  producing: { label: "生产中", class: "status-producing" },
  packing: { label: "待包装", class: "status-packing" },
  completed: { label: "已完成", class: "status-completed" },
};
```

**Step 3: 点击行选中逻辑**

```js
const selectedOrderId = ref(null);
const selectOrder = (order) => {
  selectedOrderId.value = selectedOrderId.value === order.id ? null : order.id;
};
const selectedOrder = computed(
  () => executionOrders.find((o) => o.id === selectedOrderId.value) || null,
);
```

为后续 Task 6 的详情面板预留右侧插槽空间。此步骤先只实现选中高亮，面板在 Task 6 添加。

**Step 4: 验证**

1. 各筛选条件正常工作
2. 组合筛选结果正确
3. 搜索框模糊匹配（订单号/合同号/卷号）正常
4. 点击表头排序正常（升序/降序切换）
5. 点击行高亮，再点取消选中
6. 逾期行和即将到期行左边框颜色正确

---

## Task 6: 实现订单详情面板组件

**Files:**

- Create: `prototype/src/components/ExecutionDetailPanel.vue`
- Modify: `prototype/src/views/ExecutionOrdersView.vue`（添加面板集成）

**Step 1: 创建详情面板组件**

Create `prototype/src/components/ExecutionDetailPanel.vue`

Props & Emits：

```js
const props = defineProps({
  order: { type: Object, required: true },
});
const emit = defineEmits(["close"]);
```

面板结构 — 5个区域垂直堆叠：

**区域1：订单基本信息**

- 标题行：`📋 订单信息` + 关闭按钮（X 图标，emit('close')）
- 2列 grid 布局，label + value 行对
- 字段：订单号、合同号、客户、产品、规格(厚度×宽度)、合金、米数要求、管芯、交期、状态标签

**区域2：生产进度**

- 标题：`📊 生产进度`
- 大进度条（高度12px），颜色：
  - 已完成100%：绿色
  - 逾期且<100%：红色
  - 3天内到期：橙色
  - 其他：蓝色
- 统计行：需求 / 已完成 / 剩余（卷数+吨数）
- 交期倒计时大字显示，颜色随天数变化

**区域3：关联料卷列表**

- 标题：`📦 关联料卷 (已完成数/总数)`
- 紧凑表格，列：卷号 | 工序 | 状态 | 重量 | 质量
- 状态图标：✅完成 / 🔄进行 / ⏳等待
- 如果关联料卷>5个，区域内滚动（max-height: 200px, overflow-y: auto）

**区域4：质量追溯链**

- 标题：`🔍 质量追溯`
- 树形展示，使用 CSS `::before` 连接线
- 结构：
  ```
  母卷 Y2601301 (轧机8#, 日期)
    ├── 轧机质检: 结果
    ├── 分切 → 子卷号
    │     ├── 分切质检: 结果
    │     └── 精切质检: 结果
    └── 分切 → 子卷号
          └── 分切质检: 结果
  ```
- 质量结果显示用颜色：合格=绿，让步放行=橙，不合格=红

**区域5：生产时间线**

- 标题：`⏱️ 生产时间线`
- 竖向时间轴，复用 DashboardView 的 `.log-item` 样式
- 时间线 type → Emoji 映射：
  ```js
  const typeEmoji = {
    plan: "📦",
    rolling: "🔧",
    quality: "✅",
    slitting: "✂️",
    finishing: "🔬",
    packing: "📤",
  };
  ```
- 时间格式化为 `MM-DD HH:mm`

CSS 样式要点：

- 面板整体：`background: var(--bg-surface)`, `border-left: 1px solid var(--border-light)`
- 各区域之间 `border-bottom: 1px solid var(--border-light)` 分隔
- padding: 1.25rem
- 面板内可滚动：`overflow-y: auto`

**Step 2: 在订单跟踪页面集成面板**

Modify `prototype/src/views/ExecutionOrdersView.vue`

整体布局改为左右分列：

```html
<div class="orders-page">
  <div class="page-header">...</div>
  <div class="orders-layout">
    <div class="orders-main" :class="{ 'has-panel': selectedOrder }">
      <!-- 筛选栏 -->
      <!-- 表格 -->
    </div>
    <transition name="slide-panel">
      <ExecutionDetailPanel
        v-if="selectedOrder"
        :order="selectedOrder"
        @close="selectedOrderId = null"
      />
    </transition>
  </div>
</div>
```

CSS 布局：

```css
.orders-layout {
  display: flex;
  gap: 0;
  height: calc(100vh - 180px); /* 减去头部+筛选栏高度 */
  overflow: hidden;
}

.orders-main {
  flex: 1;
  overflow-y: auto;
  transition: flex 0.3s ease;
}

.orders-main.has-panel {
  flex: 0 0 58%;
}

/* 面板组件根元素样式 */
.execution-detail-panel {
  flex: 0 0 42%;
  border-left: 1px solid var(--border-light);
  overflow-y: auto;
}

/* 面板展开动画 */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
```

**Step 3: 验证**

1. 点击表格行 → 右侧面板从右滑入
2. 面板5个区域全部正确显示
3. 进度条颜色根据紧急程度变化
4. 关联料卷表格正确显示状态图标
5. 质量追溯链树形连接线正确
6. 时间线 Emoji 和时间正确
7. 点击关闭按钮 → 面板收起，表格恢复全宽
8. 切换选中不同订单 → 面板内容即时更新
9. 面板内容超出区域时可滚动

---

## Task 7: 样式打磨与最终验证

**Files:**

- Modify: `prototype/src/views/ExecutionDashboardView.vue`（样式微调）
- Modify: `prototype/src/views/ExecutionOrdersView.vue`（样式微调）
- Modify: `prototype/src/components/ExecutionDetailPanel.vue`（样式微调）

**Step 1: 视觉一致性检查**

打开浏览器，逐项对比检查：

- [ ] 卡片样式与排产总览的 StatCard 视觉效果一致
- [ ] 表格样式与其他模块（质量列表、物料查询）一致
- [ ] 面板交互与分切排产的详情面板交互感受一致
- [ ] Chart.js 图表配色与整体 CSS 变量体系协调
- [ ] 响应式：侧边栏收起时布局正常适配

**Step 2: 交互细节打磨**

- [ ] 统计卡片 hover 有轻微上浮效果 (`transform: translateY(-2px)`)
- [ ] 表格行 hover 背景变化自然
- [ ] 面板展开/收起动画流畅（0.3s ease）
- [ ] Chart.js tooltip 正常显示且样式统一
- [ ] 逾期订单卡片数值 > 0 时视觉强调（脉冲或红色背景）
- [ ] 筛选栏下拉框对齐整齐

**Step 3: 数据完整性验证**

- [ ] 看板页6张卡片数值与 mock 数据一致
- [ ] 环形图各段数值之和 = 总订单数
- [ ] 柱状图数值与关联料卷数据一致
- [ ] 筛选后表格行数正确
- [ ] 详情面板数据与表格行数据一致
- [ ] 进度百分比计算 = completedCoils / totalCoils \* 100

**Step 4: 全流程最终验证**

在浏览器中完成以下完整操作流程：

1. 打开侧边栏 → 「生产执行」分组下有「订单看板」和「订单跟踪」
2. 点击「订单看板」→ 6张卡片 + 2个图表 + 交期预警 + 客户汇总 + 近期完成 全部正常
3. 点击交期预警中的「查看全部」→ 跳转到订单跟踪页
4. 在订单跟踪页使用状态筛选 → 结果正确
5. 使用客户筛选 → 结果正确
6. 使用搜索框输入卷号 → 找到对应订单
7. 勾选「仅逾期」→ 只显示逾期订单
8. 点击某订单行 → 详情面板展开
9. 查看5个区域信息正确
10. 切换选中其他订单 → 面板更新
11. 关闭面板 → 恢复全宽
12. 收起侧边栏 → 布局正常适配
13. 切换回排产/质量/物料模块 → 功能正常
