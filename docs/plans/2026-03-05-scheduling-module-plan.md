# 排产模块原型 — 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 基于 Vite+Vue 构建排产模块高保真原型，包含 Dashboard、轧机、分切、精切四个页面，用于向客户演示。

**Architecture:** 单页应用（SPA），Vue 3 + Vue Router。左侧边栏+顶部栏的全局框架，内容区域根据路由切换页面。模拟数据使用 JS 文件，无后端。使用 frontend-design skill 的美学指导。

**Tech Stack:** Vite, Vue 3 (Composition API), Vue Router, Vanilla CSS

---

### Task 1: 初始化 Vite+Vue 项目

**Files:**

- Create: 项目根目录下的 Vite+Vue 脚手架

**Step 1: 查看 create-vite 帮助**

```bash
npx -y create-vite@latest --help
```

**Step 2: 初始化项目**

```bash
npx -y create-vite@latest ./prototype --template vue
```

在 `c:\Users\tyq\Desktop\aluminum\` 下创建 `prototype` 目录。

**Step 3: 安装依赖**

```bash
cd prototype && npm install
```

**Step 4: 安装 Vue Router**

```bash
cd prototype && npm install vue-router@4
```

**Step 5: 验证项目可运行**

```bash
cd prototype && npm run dev
```

Expected: Vite 开发服务器启动成功，浏览器可访问。

**Step 6: 清理脚手架默认内容**

删除 `src/components/HelloWorld.vue`，清空 `src/App.vue` 和 `src/style.css` 的默认内容。

---

### Task 2: 创建模拟数据

**Files:**

- Create: `prototype/src/data/mock.js`

模拟数据包含：

- 轧机计划数据（14台轧机，按粗轧/中轧/精轧分组）
- 分切计划数据（14台分切机，含评审状态和切刀方案）
- 精切计划数据（49台精切机抽样，含多订单切割顺序）
- 订单数据（含交期预警）
- 机台状态数据

数据使用真实卷号（Y2601301等）、真实客户名（河北兴恒、弘力科技等）、真实合金（1060、1100等）。

---

### Task 3: 搭建全局框架（顶部栏 + 左侧边栏 + 路由）

**Files:**

- Create: `prototype/src/router/index.js`
- Create: `prototype/src/layout/AppLayout.vue`
- Create: `prototype/src/layout/TopBar.vue`
- Create: `prototype/src/layout/SideBar.vue`
- Modify: `prototype/src/App.vue`
- Modify: `prototype/src/style.css`

**Step 1: 创建路由配置**

4个路由：

- `/` → Dashboard 总览
- `/rolling` → 轧机排产
- `/slitting` → 分切排产
- `/finishing` → 精切排产

**Step 2: 创建 TopBar 组件**

```
┌──────────────────────────────────────────────────────────┐
│  🏭 神火新材 · 智能生产管理系统     🔔 通知(3)  👤 张计划 │
└──────────────────────────────────────────────────────────┘
```

- 左侧：系统名称
- 右侧：通知图标（badge 显示数量）+ 用户信息
- 高度约 56px，浅色背景

**Step 3: 创建 SideBar 组件**

```
┌────────────────┐
│ 📋 排产管理  ▼ │
│   📊 总览     │
│   🔧 轧机排产 │
│   ✂️ 分切排产 │
│   🔬 精切排产 │
│                │
│ 🔍 质量管理  ▸ │（置灰）
│ 📦 物料管理  ▸ │（置灰）
│ ⚙️ 生产执行  ▸ │（置灰）
│                │
│  ◀ 收起       │
└────────────────┘
```

- 一级菜单：4个模块，排产可展开，其余置灰
- 二级菜单：总览/轧机/分切/精切，绑定路由
- 当前页面高亮（左侧色条+背景色）
- 支持收起为图标模式（宽度 220px → 64px）

**Step 4: 创建 AppLayout 组件**

将 TopBar + SideBar + `<router-view>` 组合为整体布局。

**Step 5: 创建全局样式**

`style.css` 中定义：

- CSS 变量（颜色、字体、间距、圆角）
- 重置样式
- 浅色主题配色方案
- 状态颜色：绿=完成, 蓝=进行中, 黄=待料, 红=停机/逾期

---

### Task 4: Dashboard 总览页面

**Files:**

- Create: `prototype/src/views/Dashboard.vue`
- Create: `prototype/src/components/StatCard.vue`
- Create: `prototype/src/components/MachineStatusBar.vue`

**Step 1: 创建 StatCard 组件**

可复用的统计卡片组件，接收 props：标题、图标、计划数、完成数、进行数、完成率。内部渲染进度条。

**Step 2: 创建 MachineStatusBar 组件**

展示机台运行状态的色块条。每台机台一个圆角色块（🟢运行/🟡待料/🔴停机），hover 显示 tooltip。

**Step 3: 创建 Dashboard 页面**

布局分为 4 个区域：

1. **顶部**：页面标题 + 日期切换器（< 昨天 | 今天 | 明天 >）
2. **统计卡片行**：轧机、分切、精切、在制品 4 个 StatCard
3. **机台状态区**：轧机和分切的 MachineStatusBar
4. **底部双列**：左侧「逾期预警」表格 + 右侧「今日修改记录」表格

---

### Task 5: 轧机排产页面

**Files:**

- Create: `prototype/src/views/RollingPlan.vue`
- Create: `prototype/src/components/PlanTable.vue`
- Create: `prototype/src/components/CapacityBalanceBar.vue`

**Step 1: 创建 CapacityBalanceBar 组件**

产能平衡条组件，展示各道次间缓冲库存：

- 粗轧→中轧: 🟢5卷
- 中轧→精轧: 🟡2卷
- 精轧→分切: 🟢8卷

**Step 2: 创建 PlanTable 组件**

可复用的计划表格组件，功能：

- 表头列自定义（通过 props）
- 行状态标识（✅完成 / 🔄进行中 / ⏳计划中）
- 行点击事件
- 底部警告提示条（如缓冲不足警告）

**Step 3: 创建轧机排产页面**

布局：

1. **筛选栏**：日期选择、机台类型筛选、状态筛选、新增按钮、打印按钮
2. **产能平衡条**：CapacityBalanceBar 组件
3. **机台分组**：按「粗轧机 (1-3号)」「中轧机 (4-6号)」「中精轧 (7号)」「精轧机 (8-14号)」分组
4. 每组内一个 PlanTable，显示该组所有机台的计划
5. 每个机台卡片头显示：机台号 + 今日计划总数 + 已完成数

表格列：序号、批次、新神火卷号/坯料卷号、合金/用途、原材规格、道次流转、出料/终厚、工艺说明、客户、状态

**Step 4: 创建行点击详情面板（RollingDetailPanel）**

点击操作列 **[查看]** 按钮 → 右侧滑出详情面板（SlidePanel），显示内容：

- **来料信息**：坯料卷号、新神火卷号、合金、用途、原材规格（厚度×宽度）
- **道次流转详情**：完整的多道次目标厚度列表，标注当前机台负责的道次，以及每道次的设备分配
- **工艺说明**：完整显示工艺指标要求、质量控制指令、操作注意事项等（不截断）
- **修改记录**：该条计划的修改历史（时间、操作人、变更内容）
- **操作按钮**：[编辑计划] [删除]

> 注：该面板为可复用组件（SlidePanel），分切和精切页面也会共用。

---

### Task 6: 分切排产页面

**Files:**

- Create: `prototype/src/views/SlittingPlan.vue`
- Create: `prototype/src/components/DetailPanel.vue`

这是最复杂的页面，包含列表 + 右侧详情面板。

**Step 1: 创建 DetailPanel 组件**

右侧滑出的详情面板（width: 420px），包含：

- 关闭按钮
- 标题区：计划详情标识
- 可滚动内容区域，分为多个 section：
  - 来料信息：卷号、合金、厚度、宽度、长度、重量
  - 质量评审：主结论、产品等级、处理指令列表、有效宽度
  - 切刀方案：订单信息、分配明细表格（各段宽度分配）、废料率
  - 计划说明：文本
  - 修改记录：事件列表
- 底部操作按钮：编辑、删除

**Step 2: 创建分切排产页面**

列表部分 — 与轧机类似，按机台分组：

- 机台头部额外标注：「有针检/表检 | 可切电池箔+双零箔」或「无检测设备 | 仅切双零箔」
- 表格列：序号、母卷号、合金、宽度、执行单号、客户、评审状态、状态
- 评审列用图标标识：✅已评审、⚠️待评审、❌未提交
- 待评审行背景高亮（浅黄色）
- 未匹配订单的行标记"(未匹配)"

详情面板 — 点击行后右侧滑出 DetailPanel。

---

### Task 7: 精切排产页面

**Files:**

- Create: `prototype/src/views/FinishingPlan.vue`

**Step 1: 创建精切排产页面**

与分切不同点：

- **不按机台分组**，使用统一表格（49台太多）
- 增加客户筛选器
- 增加电晕列
- 表格列：序号、子卷号、客户、精切方案、机台、电晕、状态
- 分页：每页25条
- 顶部统计条：今日计划/完成/进行/待料

**Step 2: 精切详情面板**

复用 DetailPanel 组件，但内容不同：

- 来料信息增加：母卷号、框号
- 分切评审信息
- 精切方案：多订单切割顺序表格（①②顺序+原因）
- 电晕要求

---

### Task 8: 视觉优化与交互完善

**Files:**

- Modify: 所有组件和页面的样式

**Step 1: 统一状态颜色和图标**

确保所有页面的状态颜色一致：

- 完成: `#10b981` (绿)
- 进行中: `#3b82f6` (蓝)
- 计划中/待料: `#f59e0b` (黄)
- 停机/逾期: `#ef4444` (红)
- 待评审: `#f59e0b` (黄) 背景高亮

**Step 2: 动画和过渡效果**

- 侧边栏展开/收起过渡动画
- 详情面板右侧滑入/滑出动画
- 页面切换渐变过渡
- 卡片 hover 微动画（轻微抬起+阴影）

**Step 3: 响应式微调**

确保在 1440px 和 1920px 宽度下都有良好的显示效果。

**Step 4: 最终检查**

- 验证所有页面路由正常切换
- 验证所有模拟数据展示正确
- 验证详情面板交互正常
- 验证日期切换功能

---

## 实施顺序总结

```
Task 1: 初始化项目 ──→ Task 2: 模拟数据 ──→ Task 3: 全局框架
                                                    │
              ┌────────────────────┬────────────────┤
              ↓                    ↓                ↓
        Task 4: Dashboard   Task 5: 轧机    Task 6: 分切
                                                    │
                                              Task 7: 精切
                                                    │
                                           Task 8: 视觉优化
```
