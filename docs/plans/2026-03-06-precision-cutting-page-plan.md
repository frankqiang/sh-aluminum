# 精切排产页面 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现精切排产（PrecisionCutting）页面，包含计划列表、右侧详情面板、新增弹窗，功能与分切排产页面对称。

**Architecture:** 新建 4 个独立组件（PrecisionCuttingView / PrecisionPlanTable / PrecisionDetailPanel / AddPrecisionPlanModal），新建精切料池数据文件，复用现有 order-pool.js / CustomSelect / ToastNotification 组件，接入 Vue Router 和 SideBar 导航。

**Tech Stack:** Vite + Vue 3 (Composition API), Vue Router, CSS Variables (style.css)

**Design Doc:** `docs/plans/2026-03-06-precision-cutting-page-design.md`

**Reference Components:**

- `src/views/SlittingView.vue` — 页面结构参考
- `src/components/SlittingPlanTable.vue` — 表格渲染参考
- `src/components/SlittingDetailPanel.vue` — 详情面板参考
- `src/components/AddSlittingPlanModal.vue` — 新增弹窗参考
- `src/data/slitting-material-pool.js` — 料池数据结构参考
- `src/data/order-pool.js` — 复用（无需修改）

---

## Task 1: 创建精切料池 Mock 数据

**Files:**

- Create: `prototype/src/data/precision-material-pool.js`

**Step 1: 查看分切料池结构作为参考**

阅读 `src/data/slitting-material-pool.js`，了解字段结构，然后按精切料池字段设计新建文件。

**Step 2: 创建精切料池文件**

创建 `src/data/precision-material-pool.js`，包含 8 条数据，覆盖以下场景：

```javascript
// src/data/precision-material-pool.js
// 精切料池：分切完成后等待精切的子卷列表

export const precisionMaterialPool = [
  // 场景1：已评审 + 多订单（长度顺序切）— 有底部缺陷，先切短单
  {
    subCoilNo: "Y2412380/1-1",
    motherCoilNo: "Y2412380",
    frameNo: "3195",
    alloy: "1100",
    productType: "电池箔",
    thickness: 13,
    width: 1200,
    length: 23000,
    weight: 850,
    reviewStatus: "reviewed",
    review: {
      conclusion: "让步放行",
      grade: "一级品",
      instructions: [
        {
          locationType: "length",
          locationDesc: "底部5800米",
          defectType: "针孔",
          action: "切二级品",
        },
        {
          locationType: "width",
          side: "Q侧",
          position: 100,
          defectType: "针孔",
          action: "切除",
        },
        {
          locationType: "width",
          side: "C侧",
          position: 25,
          defectType: "针孔",
          action: "切除",
        },
        {
          locationType: "width",
          side: "Q侧",
          position: 620,
          defectType: "孔洞",
          action: "避留白",
        },
      ],
      effectiveWidth: 1075,
    },
  },
  // 场景2：已评审 + 多订单（长度顺序切）— 外圈缺陷，先切外圈
  {
    subCoilNo: "Y2412465/3-1",
    motherCoilNo: "Y2412465",
    frameNo: "6122",
    alloy: "1060",
    productType: "电池箔",
    thickness: 15,
    width: 990,
    length: 33000,
    weight: 920,
    reviewStatus: "reviewed",
    review: {
      conclusion: "让步放行",
      grade: "一级品",
      instructions: [
        {
          locationType: "length",
          locationDesc: "外圈2000米",
          defectType: "板形",
          action: "下料观察",
        },
        {
          locationType: "width",
          side: "Q侧",
          position: 80,
          defectType: "针孔",
          action: "切除",
        },
      ],
      effectiveWidth: 910,
    },
  },
  // 场景3：已评审 + 多订单（宽度同时切）— 两个宽度合计可拼
  {
    subCoilNo: "Y2412528/3-1",
    motherCoilNo: "Y2412528",
    frameNo: "5847",
    alloy: "1060",
    productType: "电池箔",
    thickness: 15,
    width: 1350,
    length: 33000,
    weight: 1100,
    reviewStatus: "reviewed",
    review: {
      conclusion: "正常处理",
      grade: "一级品",
      instructions: [],
      effectiveWidth: 1350,
    },
  },
  // 场景4：已评审 + 多订单（宽度同时切）
  {
    subCoilNo: "Y2412624/1-1",
    motherCoilNo: "Y2412624",
    frameNo: "3847",
    alloy: "1235",
    productType: "电池箔",
    thickness: 13,
    width: 1560,
    length: 34000,
    weight: 1350,
    reviewStatus: "reviewed",
    review: {
      conclusion: "正常处理",
      grade: "一级品",
      instructions: [
        {
          locationType: "width",
          side: "C侧",
          position: 50,
          defectType: "白条",
          action: "避留白",
        },
      ],
      effectiveWidth: 1510,
    },
  },
  // 场景5：已评审 + 单订单（简单场景）
  {
    subCoilNo: "Y2412868/2-1",
    motherCoilNo: "Y2412868",
    frameNo: "4021",
    alloy: "1100",
    productType: "电池箔",
    thickness: 13,
    width: 990,
    length: 32000,
    weight: 870,
    reviewStatus: "reviewed",
    review: {
      conclusion: "正常处理",
      grade: "一级品",
      instructions: [],
      effectiveWidth: 990,
    },
  },
  // 场景6：已评审 + 单订单（简单场景）
  {
    subCoilNo: "Y2412422/8-1",
    motherCoilNo: "Y2412422",
    frameNo: "3580",
    alloy: "1070",
    productType: "电池箔",
    thickness: 13,
    width: 1560,
    length: 34000,
    weight: 1280,
    reviewStatus: "reviewed",
    review: {
      conclusion: "让步放行",
      grade: "一级品",
      instructions: [
        {
          locationType: "width",
          side: "C侧",
          position: 190,
          defectType: "压坑",
          action: "避留白",
        },
      ],
      effectiveWidth: 1370,
    },
  },
  // 场景7：待评审（演示评审卡点）
  {
    subCoilNo: "Y2412695/8-1",
    motherCoilNo: "Y2412695",
    frameNo: "B052",
    alloy: "1100",
    productType: "电池箔",
    thickness: 13,
    width: 1610,
    length: 33500,
    weight: 1290,
    reviewStatus: "pending",
    review: null,
  },
  // 场景8：未提交评审
  {
    subCoilNo: "Y2412776/2-1",
    motherCoilNo: "Y2412776",
    frameNo: "3305",
    alloy: "1060",
    productType: "电池箔",
    thickness: 13,
    width: 1730,
    length: 24000,
    weight: 1100,
    reviewStatus: "none",
    review: null,
  },
];
```

**Step 3: 提交**

```bash
git add src/data/precision-material-pool.js
git commit -m "feat: 新增精切料池 mock 数据（8条，覆盖各评审场景）"
```

---

## Task 2: 创建精切计划 Mock 数据（precisionPlans）

**Files:**

- Modify: `prototype/src/data/mock.js`（在末尾追加 precisionPlans 导出）

**Step 1: 查看现有 mock.js 结构**

阅读 `src/data/mock.js`，了解 `slittingPlans` 的数据结构，然后参照设计文档 §3.2 新增 `precisionPlans`。

**Step 2: 在末尾追加精切计划数据**

在 `mock.js` 末尾追加：

```javascript
// 精切计划（25条，覆盖已完成/进行中/待评审/计划中状态）
export const precisionPlans = [
  // ===== 已完成 =====
  {
    id: "pc-001",
    date: "2026-03-05",
    subCoilNo: "Y2412380/1-1",
    motherCoilNo: "Y2412380",
    frameNo: "3195",
    machineId: "3",
    alloy: "1100",
    productType: "电池箔",
    thickness: 13,
    width: 1200,
    length: 23000,
    coronaPasses: 2,
    plan: [
      {
        seq: 1,
        type: "order",
        orderNo: "SZ25121602434",
        customer: "弘力科技",
        orderWidth: 654,
        lengthMin: 6500,
        lengthMax: 7000,
        grade: "二级品",
      },
      {
        seq: 2,
        type: "order",
        orderNo: "SZ25121602435",
        customer: "源元科技",
        orderWidth: 860,
        lengthMin: 14000,
        lengthMax: 16000,
        grade: "一级品",
      },
    ],
    edgeTrimLeft: 8,
    edgeTrimRight: 8,
    seqReason: "底部有5800米缺陷，先切短单消化缺陷",
    note: "过电晕，达因值≥33",
    reviewStatus: "reviewed",
    review: {
      conclusion: "让步放行",
      grade: "一级品",
      effectiveWidth: 1075,
      instructions: [],
    },
    status: "completed",
    wasteRate: 44.8,
    changeLog: [
      { time: "03-05 09:00", operator: "张计划", action: "新增计划" },
    ],
  },
  {
    id: "pc-002",
    date: "2026-03-05",
    subCoilNo: "Y2412465/3-1",
    motherCoilNo: "Y2412465",
    frameNo: "6122",
    machineId: "5",
    alloy: "1060",
    productType: "电池箔",
    thickness: 15,
    width: 990,
    length: 33000,
    coronaPasses: 1,
    plan: [
      {
        seq: 1,
        type: "order",
        orderNo: "SZ25121602440",
        customer: "河北兴恒",
        orderWidth: 875,
        lengthMin: 14000,
        lengthMax: 16000,
        grade: "一级品",
      },
    ],
    edgeTrimLeft: 8,
    edgeTrimRight: 8,
    seqReason: "",
    note: "",
    reviewStatus: "reviewed",
    review: {
      conclusion: "让步放行",
      grade: "一级品",
      effectiveWidth: 910,
      instructions: [],
    },
    status: "completed",
    wasteRate: 10.8,
    changeLog: [
      { time: "03-05 08:30", operator: "张计划", action: "新增计划" },
    ],
  },
  {
    id: "pc-003",
    date: "2026-03-05",
    subCoilNo: "Y2412528/3-1",
    motherCoilNo: "Y2412528",
    frameNo: "5847",
    machineId: "2",
    alloy: "1060",
    productType: "电池箔",
    thickness: 15,
    width: 1350,
    length: 33000,
    coronaPasses: 2,
    plan: [
      {
        seq: 1,
        type: "order",
        orderNo: "SZ25121602441",
        customer: "中航锂电",
        orderWidth: 640,
        lengthMin: 12000,
        lengthMax: 14000,
        grade: "一级品",
      },
      {
        seq: 2,
        type: "order",
        orderNo: "SZ25121602442",
        customer: "弘力科技",
        orderWidth: 640,
        lengthMin: 12000,
        lengthMax: 14000,
        grade: "一级品",
      },
    ],
    edgeTrimLeft: 8,
    edgeTrimRight: 8,
    seqReason: "两订单宽度相同，同时切割",
    note: "",
    reviewStatus: "reviewed",
    review: {
      conclusion: "正常处理",
      grade: "一级品",
      effectiveWidth: 1350,
      instructions: [],
    },
    status: "completed",
    wasteRate: 4.7,
    changeLog: [
      { time: "03-05 07:00", operator: "张计划", action: "新增计划" },
    ],
  },
  {
    id: "pc-004",
    date: "2026-03-05",
    subCoilNo: "Y2412868/2-1",
    motherCoilNo: "Y2412868",
    frameNo: "4021",
    machineId: "8",
    alloy: "1100",
    productType: "电池箔",
    thickness: 13,
    width: 990,
    length: 32000,
    coronaPasses: 1,
    plan: [
      {
        seq: 1,
        type: "order",
        orderNo: "SZ25121602450",
        customer: "源元科技",
        orderWidth: 870,
        lengthMin: 14000,
        lengthMax: 16000,
        grade: "一级品",
      },
    ],
    edgeTrimLeft: 8,
    edgeTrimRight: 8,
    seqReason: "",
    note: "",
    reviewStatus: "reviewed",
    review: {
      conclusion: "正常处理",
      grade: "一级品",
      effectiveWidth: 990,
      instructions: [],
    },
    status: "completed",
    wasteRate: 11.1,
    changeLog: [
      { time: "03-05 06:30", operator: "张计划", action: "新增计划" },
    ],
  },
  {
    id: "pc-005",
    date: "2026-03-05",
    subCoilNo: "Y2412422/8-1",
    motherCoilNo: "Y2412422",
    frameNo: "3580",
    machineId: "1",
    alloy: "1070",
    productType: "电池箔",
    thickness: 13,
    width: 1560,
    length: 34000,
    coronaPasses: 2,
    plan: [
      {
        seq: 1,
        type: "order",
        orderNo: "SZ25121602455",
        customer: "河北兴恒",
        orderWidth: 752,
        lengthMin: 13000,
        lengthMax: 16000,
        grade: "一级品",
      },
      {
        seq: 2,
        type: "order",
        orderNo: "SZ25121602456",
        customer: "河北兴恒",
        orderWidth: 752,
        lengthMin: 13000,
        lengthMax: 15000,
        grade: "一级品",
      },
    ],
    edgeTrimLeft: 8,
    edgeTrimRight: 8,
    seqReason: "两订单宽度一致，宽度方向同时切",
    note: "",
    reviewStatus: "reviewed",
    review: {
      conclusion: "让步放行",
      grade: "一级品",
      effectiveWidth: 1370,
      instructions: [],
    },
    status: "completed",
    wasteRate: 3.1,
    changeLog: [
      { time: "03-05 08:00", operator: "张计划", action: "新增计划" },
    ],
  },
  // ===== 进行中 =====
  {
    id: "pc-006",
    date: "2026-03-05",
    subCoilNo: "Y2412624/1-1",
    motherCoilNo: "Y2412624",
    frameNo: "3847",
    machineId: "3",
    alloy: "1235",
    productType: "电池箔",
    thickness: 13,
    width: 1560,
    length: 34000,
    coronaPasses: 1,
    plan: [
      {
        seq: 1,
        type: "order",
        orderNo: "SZ25121602460",
        customer: "弘力科技",
        orderWidth: 756,
        lengthMin: 13000,
        lengthMax: 16000,
        grade: "一级品",
      },
      {
        seq: 2,
        type: "order",
        orderNo: "SZ25121602461",
        customer: "源元科技",
        orderWidth: 648,
        lengthMin: 12000,
        lengthMax: 16000,
        grade: "一级品",
      },
    ],
    edgeTrimLeft: 8,
    edgeTrimRight: 8,
    seqReason: "宽度方向同时切，合计1412mm在有效宽度内",
    note: "",
    reviewStatus: "reviewed",
    review: {
      conclusion: "让步放行",
      grade: "一级品",
      effectiveWidth: 1510,
      instructions: [],
    },
    status: "running",
    wasteRate: 9.5,
    changeLog: [
      { time: "03-05 10:00", operator: "张计划", action: "新增计划" },
    ],
  },
  {
    id: "pc-007",
    date: "2026-03-05",
    subCoilNo: "Y2412380/2-1",
    motherCoilNo: "Y2412380",
    frameNo: "3196",
    machineId: "5",
    alloy: "1100",
    productType: "电池箔",
    thickness: 13,
    width: 1200,
    length: 23000,
    coronaPasses: 2,
    plan: [
      {
        seq: 1,
        type: "order",
        orderNo: "SZ25121602462",
        customer: "中航锂电",
        orderWidth: 872,
        lengthMin: 10000,
        lengthMax: 12000,
        grade: "一级品",
      },
    ],
    edgeTrimLeft: 8,
    edgeTrimRight: 8,
    seqReason: "",
    note: "Q180针孔切除，C25针孔切除",
    reviewStatus: "reviewed",
    review: {
      conclusion: "让步放行",
      grade: "一级品",
      effectiveWidth: 1100,
      instructions: [],
    },
    status: "running",
    wasteRate: 26.7,
    changeLog: [
      { time: "03-05 09:30", operator: "张计划", action: "新增计划" },
    ],
  },
  // ===== 待评审 =====
  {
    id: "pc-008",
    date: "2026-03-05",
    subCoilNo: "Y2412695/8-1",
    motherCoilNo: "Y2412695",
    frameNo: "B052",
    machineId: "7",
    alloy: "1100",
    productType: "电池箔",
    thickness: 13,
    width: 1610,
    length: 33500,
    coronaPasses: 2,
    plan: [
      {
        seq: 1,
        type: "order",
        orderNo: "SZ25121602470",
        customer: "弘力科技",
        orderWidth: 520,
        lengthMin: 12000,
        lengthMax: 15000,
        grade: "一级品",
      },
      {
        seq: 2,
        type: "order",
        orderNo: "SZ25121602471",
        customer: "河北兴恒",
        orderWidth: 864,
        lengthMin: 10000,
        lengthMax: 11000,
        grade: "一级品",
      },
    ],
    edgeTrimLeft: 8,
    edgeTrimRight: 8,
    seqReason: "",
    note: "",
    reviewStatus: "pending",
    review: null,
    status: "planned",
    wasteRate: 13.5,
    changeLog: [
      { time: "03-05 11:00", operator: "张计划", action: "新增计划" },
    ],
  },
  {
    id: "pc-009",
    date: "2026-03-05",
    subCoilNo: "Y2412776/2-1",
    motherCoilNo: "Y2412776",
    frameNo: "3305",
    machineId: "12",
    alloy: "1060",
    productType: "电池箔",
    thickness: 13,
    width: 1730,
    length: 24000,
    coronaPasses: 1,
    plan: [
      {
        seq: 1,
        type: "order",
        orderNo: "SZ25121602475",
        customer: "源元科技",
        orderWidth: 753,
        lengthMin: 13000,
        lengthMax: 16000,
        grade: "一级品",
      },
    ],
    edgeTrimLeft: 8,
    edgeTrimRight: 8,
    seqReason: "",
    note: "18042米后针孔切654",
    reviewStatus: "none",
    review: null,
    status: "planned",
    wasteRate: 56.5,
    changeLog: [
      { time: "03-05 11:30", operator: "张计划", action: "新增计划" },
    ],
  },
  // ===== 计划中 =====
  {
    id: "pc-010",
    date: "2026-03-05",
    subCoilNo: "Y2412814/1-1",
    motherCoilNo: "Y2412814",
    frameNo: "3347",
    machineId: "8",
    alloy: "1060",
    productType: "电池箔",
    thickness: 15,
    width: 1430,
    length: 25000,
    coronaPasses: 2,
    plan: [
      {
        seq: 1,
        type: "order",
        orderNo: "SZ25121602480",
        customer: "弘力科技",
        orderWidth: 337,
        lengthMin: 9000,
        lengthMax: 8200,
        grade: "二级品",
      },
      {
        seq: 2,
        type: "order",
        orderNo: "SZ25121602481",
        customer: "河北兴恒",
        orderWidth: 300,
        lengthMin: 2700,
        lengthMax: 2800,
        grade: "二级品",
      },
      {
        seq: 3,
        type: "order",
        orderNo: "SZ25121602482",
        customer: "源元科技",
        orderWidth: 337,
        lengthMin: 9000,
        lengthMax: 8200,
        grade: "一级品",
      },
    ],
    edgeTrimLeft: 8,
    edgeTrimRight: 8,
    seqReason: "底部11000米多处横向针孔，先切二级品消化缺陷",
    note: "Q800孔洞刨切除",
    reviewStatus: "reviewed",
    review: {
      conclusion: "让步放行",
      grade: "一级品",
      effectiveWidth: 1430,
      instructions: [],
    },
    status: "planned",
    wasteRate: 31.5,
    changeLog: [
      { time: "03-05 12:00", operator: "张计划", action: "新增计划" },
    ],
  },
  // 补充更多计划中的记录（pc-011 ~ pc-025 使用相似结构填充不同客户/机台/子卷号）
  ...Array.from({ length: 15 }, (_, i) => {
    const customers = ["弘力科技", "源元科技", "河北兴恒", "中航锂电"];
    const alloys = ["1060", "1100", "1235D", "1070"];
    const machines = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const idx = i;
    return {
      id: `pc-${String(idx + 11).padStart(3, "0")}`,
      date: "2026-03-05",
      subCoilNo: `Y24123${10 + idx}/1-1`,
      motherCoilNo: `Y24123${10 + idx}`,
      frameNo: `${3400 + idx * 10}`,
      machineId: machines[idx % machines.length],
      alloy: alloys[idx % alloys.length],
      productType: "电池箔",
      thickness: 13,
      width: 1200 + (idx % 4) * 100,
      length: 20000 + idx * 1000,
      coronaPasses: idx % 2 === 0 ? 2 : 1,
      plan: [
        {
          seq: 1,
          type: "order",
          orderNo: `SZ2601${28100 + idx}`,
          customer: customers[idx % customers.length],
          orderWidth: 650 + idx * 20,
          lengthMin: 10000,
          lengthMax: 12000,
          grade: "一级品",
        },
      ],
      edgeTrimLeft: 8,
      edgeTrimRight: 8,
      seqReason: "",
      note: "",
      reviewStatus: "reviewed",
      review: {
        conclusion: "正常处理",
        grade: "一级品",
        effectiveWidth: 1200 + (idx % 4) * 100,
        instructions: [],
      },
      status: "planned",
      wasteRate: parseFloat(((16 + idx * 1.5) % 30).toFixed(1)),
      changeLog: [
        {
          time: `03-05 ${String(12 + Math.floor(idx / 4)).padStart(2, "0")}:${String((idx % 4) * 15).padStart(2, "0")}`,
          operator: "张计划",
          action: "新增计划",
        },
      ],
    };
  }),
];
```

**Step 3: 提交**

```bash
git add src/data/mock.js
git commit -m "feat: 新增精切计划 mock 数据（25条，覆盖各状态）"
```

---

## Task 3: 更新路由和侧边栏导航

**Files:**

- Modify: `prototype/src/router/index.js`（新增精切路由）
- Modify: `prototype/src/components/SideBar.vue`（激活精切菜单项）

**Step 1: 查看现有路由配置**

阅读 `src/router/index.js`，找到分切排产的路由形式，然后按相同模式新增精切排产路由。

**Step 2: 新增路由**

在路由配置中（与分切路由相邻）新增：

```javascript
{
  path: '/scheduling/precision-cutting',
  name: 'PrecisionCutting',
  component: () => import('../views/PrecisionCuttingView.vue'),
}
```

**Step 3: 查看侧边栏配置**

阅读 `src/components/SideBar.vue`，找到「分切排产」菜单项的数据结构，然后新增「精切排产」菜单项。

**Step 4: 新增侧边栏菜单项**

在「分切排产」菜单项之后，新增：

```javascript
{ label: '🔬 精切排产', path: '/scheduling/precision-cutting' }
```

**Step 5: 提交**

```bash
git add src/router/index.js src/components/SideBar.vue
git commit -m "feat: 新增精切排产路由和侧边栏导航"
```

---

## Task 4: 创建 PrecisionPlanTable.vue（列表表格组件）

**Files:**

- Create: `prototype/src/components/PrecisionPlanTable.vue`

**Step 1: 查看分切表格组件作为参考**

阅读 `src/components/SlittingPlanTable.vue`，理解整体结构：Props、表格列渲染、多行展示逻辑、行状态样式。

**Step 2: 创建精切表格组件**

组件 Props：`data`（精切计划数组）

组件 Events：`@view(row)`

```vue
<script setup>
// 列定义：序号 | 子卷号 | 框号 | 合金 | 规格 | 评审 | 精切方案 | 机台 | 电晕 | 状态 | 操作
// getDisplayStatus 逻辑：reviewStatus !== 'reviewed' → 'pending_review'
// 精切方案列：plan 数组多行展示，每行格式：①弘力 654mm×6500-7000m
</script>
```

关键实现细节：

```javascript
// 状态映射
function getDisplayStatus(row) {
  if (row.reviewStatus !== "reviewed") return "pending_review";
  return row.status;
}

// 精切方案格式化（每行格式）
function formatPlanLine(item) {
  const seqMap = ["①", "②", "③", "④", "⑤"];
  const seq = seqMap[item.seq - 1] || `${item.seq}`;
  return `${seq}${item.customer} ${item.orderWidth}mm×${item.lengthMin}-${item.lengthMax}m`;
}

// 行 CSS 类映射
function getRowClass(row) {
  const status = getDisplayStatus(row);
  return {
    "row-completed": status === "completed",
    "row-running": status === "running",
    "row-pending-review": status === "pending_review",
    "row-planned": status === "planned",
  };
}
```

评审列渲染：

- `reviewed` → `✅ 已评审`（绿色）
- `pending` → `⚠️ 待评审`（橙色）
- `none` → `❌ 未提交`（红色）

电晕列：

- `1` → badge `1遍`（灰色）
- `2` → badge `2遍`（蓝色）

**Step 3: 提交**

```bash
git add src/components/PrecisionPlanTable.vue
git commit -m "feat: 新增 PrecisionPlanTable 精切计划列表组件"
```

---

## Task 5: 创建 PrecisionDetailPanel.vue（右侧详情面板）

**Files:**

- Create: `prototype/src/components/PrecisionDetailPanel.vue`

**Step 1: 查看分切详情面板作为参考**

阅读 `src/components/SlittingDetailPanel.vue`，理解面板整体结构（遮罩 + 滑入动画 + 分区内容）。

**Step 2: 创建精切详情面板**

Props：`visible`（Boolean），`row`（Object）

Events：`@close`

面板内容分区（按顺序）：

**① 来料信息区**

```html
<!-- 子卷号 | 母卷号 | 框号（同行）-->
<!-- 合金 | 厚度 | 宽度 | 长度 -->
```

**② 分切评审信息区**

```html
<!-- 评审状态 badge -->
<!-- 主结论 + 产品等级 -->
<!-- 处理指令列表：
     locationType === 'length' → 📏 图标
     locationType === 'width'  → ↔️ 图标 -->
<!-- 有效宽度 -->
<!-- 若 reviewStatus !== 'reviewed'：黄色警告框 -->
```

**③ 精切方案区**

```html
<!-- 电晕要求：{coronaPasses}遍电晕（达因值≥33） -->
<!-- 若 plan.length > 1：顺序说明文本 -->
<!-- 订单顺序表格：顺序 | 客户 | 宽度 | 米数范围 | 等级 -->
<!-- 废料率 -->
```

**④ 修改记录区 + 操作按钮**

**Step 3: 提交**

```bash
git add src/components/PrecisionDetailPanel.vue
git commit -m "feat: 新增 PrecisionDetailPanel 精切计划详情面板"
```

---

## Task 6: 创建 AddPrecisionPlanModal.vue（新增弹窗）

**Files:**

- Create: `prototype/src/components/AddPrecisionPlanModal.vue`

**Step 1: 查看分切新增弹窗作为参考**

阅读 `src/components/AddSlittingPlanModal.vue`，理解整体结构：区块布局、CustomSelect 使用、实时计算区。

**Step 2: 创建精切新增弹窗**

Props：`visible`（Boolean）

Events：`@close`，`@submit(data)`

弹窗宽度：900px

内容分区：

**❶ 来料选择区**

```javascript
// 子卷号下拉（CustomSelect，数据来自 precisionMaterialPool）
// 机台下拉（CustomSelect，1#~49#）
// 子卷自动带出：合金 | 产品类型 | 厚度 | 宽度 | 长度 | 框号（只读展示）
```

**❷ 质量评审区（只读）**

```javascript
// 评审状态 badge
// 主结论 + 产品等级
// 处理指令列表（📏 长度方向 / ↔️ 宽度方向）
// 有效宽度
// 若未评审：黄色警告条
```

**❸ 精切方案设计区**

电晕遍数：radio（1遍 / 2遍）

段列表（动态，可添加删除）：

```javascript
// 初始：左边丝(8mm) + 右边丝(8mm)
// 点击「+添加订单段」追加 {type:'order'} 段
// 订单段：[选择订单]按钮 → 筛选（合金 + 宽度 ≤ effectiveWidth）→ 选中自动带出
// 余料：自动计算（= 子卷宽度 - 边丝 - Σ订单宽度）

// 实时计算区：
const totalOrderWidth = computed(() =>
  segments
    .filter((s) => s.type === "order")
    .reduce((sum, s) => sum + s.width, 0),
);
const totalEdge = computed(() => edgeLeft + edgeRight);
const remainder = computed(
  () => selectedSubCoil.value.width - totalOrderWidth.value - totalEdge.value,
);
const wasteWidth = computed(
  () => totalEdge.value + Math.max(0, remainder.value),
);
const wasteRate = computed(() =>
  ((wasteWidth.value / selectedSubCoil.value.width) * 100).toFixed(1),
);

// 校验：
// 单个订单宽度 > effectiveWidth → ❌ 红色报错
// 总宽超出子卷宽度 → ⚠️ 橙色警告（允许提交，长度顺序切模式）
```

**❹ 顺序说明**（仅当订单段 > 1时显示）：textarea

**❺ 计划备注**：textarea

**❻ 按钮 + 校验**

校验规则：

1. 必须选择子卷号
2. 必须选择机台
3. 至少 1 个订单段
4. 单个订单宽度 ≤ 有效宽度

通过校验 → `emit('submit', formData)` → `emit('close')`

**Step 3: 提交**

```bash
git add src/components/AddPrecisionPlanModal.vue
git commit -m "feat: 新增 AddPrecisionPlanModal 精切计划新增弹窗"
```

---

## Task 7: 创建 PrecisionCuttingView.vue（主页面）

**Files:**

- Create: `prototype/src/views/PrecisionCuttingView.vue`

**Step 1: 查看分切主页面作为参考**

阅读 `src/views/SlittingView.vue`，理解整体结构：筛选 state、computed 过滤、分页逻辑、弹窗控制。

**Step 2: 创建精切主页面**

```vue
<script setup>
import { ref, computed } from "vue";
import { precisionPlans } from "@/data/mock.js";
import { precisionMaterialPool } from "@/data/precision-material-pool.js";
import PrecisionPlanTable from "@/components/PrecisionPlanTable.vue";
import PrecisionDetailPanel from "@/components/PrecisionDetailPanel.vue";
import AddPrecisionPlanModal from "@/components/AddPrecisionPlanModal.vue";
import ToastNotification from "@/components/ToastNotification.vue";

// 筛选状态
const filterDate = ref("2026-03-05");
const filterMachine = ref("全部");
const filterStatus = ref("全部");
const filterCustomer = ref("全部");
const searchText = ref("");

// 分页
const pageSize = 25;
const currentPage = ref(1);

// 弹窗/面板
const showAddModal = ref(false);
const showDetailPanel = ref(false);
const selectedRow = ref(null);

// 本地计划列表（支持新增后追加）
const localPlans = ref([...precisionPlans]);

// 统计条
const stats = computed(() => ({
  total: filteredPlans.value.length,
  completed: filteredPlans.value.filter(
    (p) => getDisplayStatus(p) === "completed",
  ).length,
  running: filteredPlans.value.filter((p) => getDisplayStatus(p) === "running")
    .length,
  pendingReview: filteredPlans.value.filter(
    (p) => getDisplayStatus(p) === "pending_review",
  ).length,
  planned: filteredPlans.value.filter((p) => getDisplayStatus(p) === "planned")
    .length,
}));

// 客户筛选下拉选项（从数据中动态提取）
const customerOptions = computed(() => {
  const customers = new Set();
  localPlans.value.forEach((p) =>
    p.plan.forEach((o) => customers.add(o.customer)),
  );
  return ["全部", ...Array.from(customers).sort()];
});

// filtered & paginated
const filteredPlans = computed(() => {
  return localPlans.value.filter((p) => {
    if (filterDate.value && p.date !== filterDate.value) return false;
    if (
      filterMachine.value !== "全部" &&
      p.machineId + "#" !== filterMachine.value &&
      p.machineId.toString() !== filterMachine.value.replace("#", "")
    )
      return false;
    if (filterStatus.value !== "全部") {
      const display = getDisplayStatus(p);
      const statusMap = {
        已完成: "completed",
        进行中: "running",
        待评审: "pending_review",
        计划中: "planned",
      };
      if (display !== statusMap[filterStatus.value]) return false;
    }
    if (
      filterCustomer.value !== "全部" &&
      !p.plan.some((o) => o.customer === filterCustomer.value)
    )
      return false;
    if (searchText.value) {
      const s = searchText.value.toLowerCase();
      const match =
        p.subCoilNo.toLowerCase().includes(s) ||
        p.plan.some((o) => o.customer.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  });
});

function getDisplayStatus(p) {
  if (p.reviewStatus !== "reviewed") return "pending_review";
  return p.status;
}

// 分页
const totalPages = computed(() =>
  Math.ceil(filteredPlans.value.length / pageSize),
);
const pagedPlans = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredPlans.value.slice(start, start + pageSize);
});

// 事件处理
function handleView(row) {
  selectedRow.value = row;
  showDetailPanel.value = true;
}

function handleSubmit(data) {
  localPlans.value.unshift({
    ...data,
    id: `pc-${Date.now()}`,
    date: filterDate.value,
    changeLog: [
      {
        time: new Date().toLocaleString(),
        operator: "张计划",
        action: "新增计划",
      },
    ],
  });
  showAddModal.value = false;
}
</script>
```

页面模板布局：

```html
<!-- 页面标题 🔬 精切排产 -->
<!-- 筛选区：日期 | 机台 | 状态 | 客户 | 搜索 | 打印按钮 | 新增按钮 -->
<!-- 统计条 -->
<!-- PrecisionPlanTable :data="pagedPlans" @view="handleView" -->
<!-- 分页控件 -->
<!-- PrecisionDetailPanel :visible="showDetailPanel" :row="selectedRow" @close="showDetailPanel=false" -->
<!-- AddPrecisionPlanModal :visible="showAddModal" @close="showAddModal=false" @submit="handleSubmit" -->
<!-- ToastNotification -->
```

**Step 3: 启动开发服务器验证页面可访问**

```bash
# 服务器已在运行，直接访问：
# http://localhost:5173/scheduling/precision-cutting
```

预期结果：精切排产页面正常显示，列表有数据，统计条正确，侧边栏「精切排产」高亮。

**Step 4: 提交**

```bash
git add src/views/PrecisionCuttingView.vue
git commit -m "feat: 新增 PrecisionCuttingView 精切排产主页面"
```

---

## Task 8: 联调验证

**Step 1: 验证列表功能**

打开浏览器访问 `http://localhost:5173/scheduling/precision-cutting`，逐项验证：

- [ ] 列表数据正常展示（25条）
- [ ] 精切方案列多行展示（①②格式）
- [ ] 已完成行：白色背景
- [ ] 进行中行：浅蓝背景
- [ ] 待评审行：浅黄背景（reviewStatus !== 'reviewed'）
- [ ] 评审列：✅/⚠️/❌ 正确显示
- [ ] 电晕列：1遍/2遍 badge
- [ ] 筛选：机台/状态/客户/搜索均正常过滤
- [ ] 统计条数字与列表一致
- [ ] 分页正常

**Step 2: 验证详情面板**

点击任一行「查看」按钮：

- [ ] 面板从右侧滑入
- [ ] 子卷号 + 母卷号 + 框号同行展示
- [ ] 评审信息区：📏 长度缺陷 / ↔️ 宽度缺陷图标正确
- [ ] 精切方案区：电晕 + 多订单顺序表格（多订单才显示）
- [ ] 废料率显示
- [ ] 修改记录显示
- [ ] 点击遮罩或 ✕ 按钮关闭

**Step 3: 验证新增弹窗**

点击「+ 新增」按钮：

- [ ] 弹窗弹出
- [ ] 选择子卷后自动带出来料信息 + 评审信息
- [ ] 评审信息：缺陷方向图标（📏/↔️）显示正确
- [ ] 待评审子卷：黄色警告条
- [ ] 添加订单段：「选择订单」→ 筛选过滤 → 选中自动带出
- [ ] 实时计算区：已分配宽度/余料/废料率随输入实时变化
- [ ] 超出有效宽度：红色报错
- [ ] 超出子卷宽度：橙色警告
- [ ] 多订单时：顺序说明 textarea 显示
- [ ] 校验：缺必填项时不可提交
- [ ] 提交成功：弹出 toast 提示，计划追加到列表首行

**Step 4: 最终提交**

```bash
git add .
git commit -m "feat: 完成精切排产页面联调验证"
```
