# 分切排产页面 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现分切排产页面，包含统一表格展示、右侧详情面板、新增计划弹窗（含切刀方案分段录入和废料率自动计算）。

**Architecture:** 采用方案A（独立组件），新建 3 个组件：`SlittingPlanTable.vue`（表格）、`SlittingDetailPanel.vue`（详情面板）、`AddSlittingPlanModal.vue`（新增弹窗）。主页面 `SlittingView.vue` 负责筛选/分页/状态管理。复用现有的 `ToastNotification`、`CustomSelect` 组件和 CSS 变量体系。

**Tech Stack:** Vue 3 (Composition API + `<script setup>`)、lucide-vue-next 图标、Vanilla CSS + CSS 变量

**设计文档:** `docs/plans/2026-03-05-slitting-page-design.md`

---

### Task 1: SlittingPlanTable 组件 — 分切计划表格

**Files:**

- Create: `prototype/src/components/SlittingPlanTable.vue`

**Step 1: 创建分切计划表格组件**

创建 `SlittingPlanTable.vue`，接收 `data` (Array) 属性，渲染分切计划的完整表格。

```vue
<template>
  <div class="slitting-table-wrapper">
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th width="42" class="text-center">#</th>
            <th width="55">机台</th>
            <th width="115">母卷号</th>
            <th width="65">合金</th>
            <th width="95">规格</th>
            <th width="125">执行单号</th>
            <th width="85">客户</th>
            <th width="65">产品</th>
            <th width="60">评审</th>
            <th width="175">切刀规格</th>
            <th width="65">废料率</th>
            <th width="80">状态</th>
            <th width="55" class="text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.length === 0">
            <td colspan="13">
              <div class="empty-state">
                <FileX :size="32" class="empty-icon" />
                <span>暂无分切计划</span>
              </div>
            </td>
          </tr>
          <tr
            v-for="(row, index) in data"
            :key="row.id"
            :class="['table-row', rowClass(row)]"
          >
            <!-- 序号 -->
            <td class="text-center text-muted text-sm">{{ index + 1 }}</td>
            <!-- 机台 -->
            <td class="font-mono text-bold text-sm">{{ row.machineId }}</td>
            <!-- 母卷号 -->
            <td>
              <div class="coil-no">{{ row.motherCoilNo }}</div>
            </td>
            <!-- 合金 -->
            <td class="font-mono text-bold">{{ row.alloy }}</td>
            <!-- 规格 -->
            <td class="text-sm">
              <span class="number">{{ row.width }}</span
              ><span class="unit">×</span
              ><span class="number">{{ row.thickness }}</span
              ><span class="unit">μm</span>
            </td>
            <!-- 执行单号 -->
            <td>
              <div class="order-no" v-if="row.orderNo">{{ row.orderNo }}</div>
              <div class="text-muted text-sm" v-else>—</div>
            </td>
            <!-- 客户 -->
            <td>
              <span v-if="row.customer" class="text-sm font-medium">{{
                row.customer
              }}</span>
              <span v-else class="unmatched">(未匹配)</span>
            </td>
            <!-- 产品类型 -->
            <td>
              <span
                class="product-badge"
                :class="productClass(row.productType)"
                >{{ row.productType }}</span
              >
            </td>
            <!-- 评审状态 -->
            <td>
              <span class="review-badge" :class="row.reviewStatus">
                {{ reviewLabel(row.reviewStatus) }}
              </span>
            </td>
            <!-- 切刀规格 -->
            <td>
              <span v-if="row.cuttingPlan" class="text-sm font-mono">{{
                row.cuttingPlan.spec
              }}</span>
              <span v-else class="text-muted text-sm">—</span>
            </td>
            <!-- 废料率 -->
            <td>
              <span
                v-if="row.cuttingPlan"
                class="waste-rate"
                :class="wasteRateClass(row.cuttingPlan.wasteRate)"
              >
                {{ row.cuttingPlan.wasteRate }}%
              </span>
              <span v-else class="text-muted text-sm">—</span>
            </td>
            <!-- 状态 -->
            <td>
              <div class="status-cell" :class="row.status">
                <CheckCircle2 v-if="row.status === 'completed'" :size="14" />
                <PlayCircle v-else-if="row.status === 'running'" :size="14" />
                <AlertCircle
                  v-else-if="row.status === 'pending_review'"
                  :size="14"
                />
                <Clock v-else :size="14" />
                <span>{{ statusLabel(row.status) }}</span>
              </div>
            </td>
            <!-- 操作 -->
            <td class="text-center">
              <button class="action-btn" @click.stop="$emit('view', row)">
                查看
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

关键逻辑函数（`<script setup>`部分）：

- `rowClass(row)`: 返回行样式类（`row-running` / `row-pending-review` / 默认）
- `reviewLabel(status)`: reviewed→✅ / pending→⚠️ / none→❌
- `statusLabel(status)`: completed→已完成 / running→进行中 / pending_review→待评审 / planned→计划中
- `wasteRateClass(rate)`: ≤5%→green / 5-15%→orange / >15%→red
- `productClass(type)`: 电池箔→红色badge / 双零箔→灰色badge

样式要点：

- `.row-pending-review` 背景色 `#fffbeb`（浅黄），边框色 `#fde68a`
- `.row-running` 背景色 `var(--primary-light)`（浅蓝），与轧机一致
- `.coil-no` 使用 `var(--primary-color)` 高亮
- `.waste-rate.green` 绿色 / `.orange` 橙色 / `.red` 红色
- `.review-badge.reviewed` 绿色 / `.pending` 黄色 / `.none` 灰色
- 表格样式与 `PlanTable.vue` 保持一致的视觉风格

**Step 2: 浏览器验证**

Run: 打开浏览器 → 导航到分切排产页面（需 Task 4 完成后一起验证）
Expected: 表格正确渲染，评审高亮行、废料率颜色正确

---

### Task 2: SlittingDetailPanel 组件 — 右侧详情面板

**Files:**

- Create: `prototype/src/components/SlittingDetailPanel.vue`
- Reference: `prototype/src/components/RollingDetailPanel.vue`（参考其滑出动画和布局结构）

**Step 1: 创建详情面板组件**

创建 `SlittingDetailPanel.vue`，参考 `RollingDetailPanel.vue` 的遮罩+滑入结构。

Props:

- `visible` (Boolean) — 是否显示
- `row` (Object) — 当前选中的分切计划数据

内容区域按设计文档 §5.2 的 6 个区域垂直排列：

```
① 来料信息区 — 卷号/合金/产品类型/厚度/宽度/长度/重量
② 质量评审区 — 评审状态标签 + 主结论 + 产品等级 + 处理指令列表 + 有效宽度
              — 待评审时显示黄色提示
③ 切刀方案区 — 订单信息 + 规格 + 管芯 + 分配明细表格 + 废料率合计
              — 无方案时显示提示
④ 计划说明区 — 文本显示
⑤ 修改记录区 — 时间+操作人+内容（mock硬编码1~2条）
⑥ 操作按钮区 — [编辑计划] + [删除]（点击弹toast）
```

关键实现细节：

- **遮罩层**：`position: fixed` 覆盖全屏，`background: rgba(0,0,0,0.3)`，点击关闭
- **面板**：`position: fixed; right: 0; width: 420px; height: 100vh`，`transition: transform 0.3s ease`
- **切刀分配明细表格**：遍历 `row.cuttingPlan.segments` 数组，每段显示类型/宽度/说明，底部显示合计行
- **处理指令列表**：遍历 `row.review.instructions` 数组，每条显示 "①侧 起-止mm 缺陷 → 处理方式"
- **有效宽度计算**：`row.review.effectiveWidth` 直接从数据读取（已在 mock 中计算好）

**Step 2: 浏览器验证**

Expected: 点击「查看」后面板从右侧滑出，内容正确显示，点击遮罩或✕可关闭

---

### Task 3: Mock 数据文件 — 待分切料池 + 订单池

> **前置任务**：为新增弹窗的母卷选择和订单绑定提供数据支撑。

**Files:**

- Create: `prototype/src/data/slitting-material-pool.js`
- Create: `prototype/src/data/order-pool.js`

**Step 1: 创建待分切料池数据**

创建 `slitting-material-pool.js`，导出 `materialPool` 数组（8~10条），模拟轧机完成后等待分切的母卷列表。

每条数据包含：

- 母卷基础信息：coilNo, alloy, productType, width, thickness, length, weight
- 质量评审信息：reviewStatus, review（结论、等级、处理指令、有效宽度）

数据应覆盖以下场景：

- 已评审+无缺陷（正常分切）
- 已评审+有缺陷需切除（有效宽度 < 原始宽度）
- 已评审+降级使用
- 待评审（评审未完成）
- 电池箔和双零箔两种产品类型
- 不同宽度规格（1020~1700mm）

**Step 2: 创建订单池数据**

创建 `order-pool.js`，导出 `orderPool` 数组（10~15条），模拟 MES 系统中的可匹配订单列表。

每条数据包含：

- 订单标识：orderNo（NC执行单号）, contractNo（合同号）
- 客户信息：customer
- 产品规格：product, alloy, width, thickness
- 米数要求：lengthMin, lengthMax
- 管芯规格：coreSpec, coreLength, innerDiameter
- 交期追踪：deliveryDate, totalCoils, slittedCoils, remainingCoils
- 优先级：priority（urgent / normal）

数据应覆盖：

- 不同合金（1060, 1100, 1235D, 8079）
- 不同宽度（650~1585mm）
- 不同客户（参考Excel截图中的：标兵母卷、江苏兴恒、优箔母卷等）
- 有加急单和普通单
- 有已部分完成和未开始的订单

字段设计参考排产调研总结 §4.2.3（订单池核心字段）。

---

### Task 4: AddSlittingPlanModal 组件重构 — 新增分切计划弹窗

> **设计原则**：模拟计划员"看料→看评审→选订单→排刀"的实际决策流程。
> **调研依据**：排产模块调研总结 §4.2-4.4、质量模块调研总结 §4.5、MES项目方案 §3.2

**Files:**

- Rewrite: `prototype/src/components/AddSlittingPlanModal.vue`（完全重写）
- Import: `prototype/src/data/slitting-material-pool.js`（待分切料池）
- Import: `prototype/src/data/order-pool.js`（订单池）
- Reference: `prototype/src/components/CustomSelect.vue`（复用下拉组件）

**Step 1: 重构弹窗组件**

完全重写 `AddSlittingPlanModal.vue`，实现 5 个区块的交互流程。

Props:

- `visible` (Boolean)
- `machines` (Array) — 分切机列表（用于机台下拉）

Events:

- `@close` — 关闭弹窗
- `@submit(formData)` — 提交数据

**❶ 来料选择区：**

```javascript
import { materialPool } from "../data/slitting-material-pool.js";
import { orderPool } from "../data/order-pool.js";

// 选择的母卷
const selectedCoilNo = ref("");

// 选择母卷后，自动获取母卷完整信息（只读）
const selectedMaterial = computed(() => {
  return materialPool.find((m) => m.coilNo === selectedCoilNo.value) || null;
});

// 母卷选项列表（用于 CustomSelect）
const coilOptions = computed(() => {
  return materialPool.map((m) => ({
    value: m.coilNo,
    label: `${m.coilNo} (${m.alloy} ${m.productType} ${m.width}mm)`,
  }));
});

// 机台选择
const selectedMachineId = ref("");
```

选择母卷后自动展示：合金、产品类型、宽度、厚度、长度、重量（只读标签）。

**❷ 质量评审区（只读参考）：**

从 `selectedMaterial.review` 读取，只读展示：

- 评审状态标签（颜色）
- 评审结论
- 处理指令列表（侧+范围+缺陷+处理方式）
- **有效宽度**（关键基准值）
- 待评审时显示黄色警告

**❸ 切刀方案设计区：**

```javascript
// 动态段列表
const segments = reactive([
  { type: "edge", width: 10, orderId: null, orderInfo: null, note: "" },
]);

// 有效宽度（来自评审）
const effectiveWidth = computed(() => {
  return (
    selectedMaterial.value?.review?.effectiveWidth ||
    selectedMaterial.value?.width ||
    0
  );
});

// 可选订单列表（自动筛选：合金匹配 + 宽度 ≤ 有效宽度）
const availableOrders = computed(() => {
  if (!selectedMaterial.value) return [];
  const alloy = selectedMaterial.value.alloy;
  // 已选择的订单号排除
  const usedOrderNos = segments
    .filter((s) => s.orderInfo)
    .map((s) => s.orderInfo.orderNo);
  return orderPool.filter(
    (o) =>
      o.alloy === alloy &&
      o.width <= effectiveWidth.value &&
      !usedOrderNos.includes(o.orderNo),
  );
});
```

当段类型为"订单"时，出现订单选择器（CustomSelect），选中后自动带出：

- 执行单号、客户、宽度（只读）、米数范围、管芯规格
- 宽度字段变为只读

实时计算区自动重算：母卷总宽、有效宽度、已分配、剩余、废料率、校验状态。

**❹ 计划说明 + ❺ 操作按钮：**

- textarea 自由文本
- 校验规则：必须选母卷 + 必须选机台 + 至少1个订单段 + 不超宽

**弹窗布局要点：**

- 弹窗宽度 900px，`max-height: 90vh`
- 来料选择区使用行内布局（母卷+机台两个下拉并排）
- 来料信息用只读标签展示（合金/宽度/厚度等）
- 评审区紧凑展示（水平布局 or 卡片式）
- 切刀方案区的段列表使用表格样式
- 底部固定操作按钮栏

**Step 2: 浏览器验证**

Expected:

- 点击「新增计划」弹出弹窗
- 选择母卷后自动填充材料信息和评审信息
- 待评审的母卷显示黄色警告
- 添加"订单"段时可从订单池选择，自动带出订单信息
- 同一订单不可重复选择
- 废料率实时计算正确
- 超宽时显示红色警告
- 提交后弹 toast 提示

---

### Task 5: SlittingView 主页面 — 整合所有组件

> **说明**：此任务已在之前实现完毕，仅需更新 AddSlittingPlanModal 的 props 传入。

**Files:**

- Modify: `prototype/src/views/SlittingView.vue`（确认与重构后的弹窗组件兼容）

**Step 1: 确认 SlittingView 与重构后弹窗的兼容性**

需确认/调整：

- `AddSlittingPlanModal` 的 props 是否仍为 `visible` + `machines`
- import 路径是否需要调整（新增的 mock 数据文件由弹窗组件内部自行 import）
- `@submit` 事件的 formData 结构是否有变化

**Step 2: 浏览器验证完整功能**

Run: 浏览器打开 → 点击侧边栏「分切排产」
Expected:

1. 页面正确渲染，显示统计条和表格
2. 筛选器工作正常（机台/状态/搜索）
3. 待评审行黄色高亮
4. 点击「查看」→ 右侧面板滑出，内容正确
5. 点击「新增计划」→ 弹窗弹出，选母卷→看评审→选订单→排刀 流程完整
6. 废料率实时计算正确
7. 提交后弹 toast 提示
8. 分页正常工作
