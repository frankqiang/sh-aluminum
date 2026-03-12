# 物料管理模块实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为铝箔MES原型系统新增物料管理模块（3个子页面：在制品看板、库位地图、料卷查询），展示完整的在制品追踪功能。

**Architecture:** 在现有Vue 3 + Vite项目中新增物料管理模块。数据层通过独立的 `material-data.js` 提供mock数据。侧边栏新增"物料管理"菜单组（含3个子菜单项）。3个视图页面分别对应在制品看板、库位地图、料卷查询。

**Tech Stack:** Vue 3 (Composition API) + Vite + Vue Router + Lucide Icons

---

## Task 1: 创建物料管理Mock数据文件

**Files:**

- Create: `prototype/src/data/material-data.js`

**Step 1: 创建数据文件**

创建 `prototype/src/data/material-data.js`，包含以下数据：

1. **库位区域定义** (`warehouseZones`) — 4个区域（分切区/轧机区/精切区/退火区），每个区域含排数和每排库位数
2. **料卷状态枚举** (`coilStatuses`) — 18种状态的code、label、color映射
3. **在制品料卷数据** (`materialCoils`) — 约63条料卷mock数据，包含：
   - `id`, `coilNo` (卷号), `motherCoilNo` (母卷号), `childCoilNo` (车次号)
   - `alloy`, `thickness`, `width`, `length`, `weight`, `customer`
   - `status` (18种状态之一), `productType` (电池箔/双零箔)
   - `location` (zone/row/col 三级定位)
   - `entryTime` (入库时间), `daysStayed` (停放天数)
   - `reviewInfo` (质量评审信息: conclusion + instructions)
   - `history` (流转历史数组: [{time, status, location, operator}])
4. **呆滞预警配置** (`staleThresholds`) — 正常<3天, 注意3-7天, 超期7-14天, 呆滞>14天
5. **流转记录** (`recentMovements`) — 约20条最近流转记录
6. **统计摘要** (`materialStats`) — 在制品总数、今日流转、各环节库存、超期数、呆滞数

数据设计要点：

- 分切区料卷最多（约28个），体现"约1000个子卷堆在分切区"的痛点
- 分散设置5-8个呆滞料（>14天）和10-15个超期料（7-14天）
- 使用调研文档中的真实卷号格式（如 Y2601301/1-1）
- 每条料卷包含3-8条流转历史记录

**Step 2: 验证数据文件无语法错误**

在浏览器控制台中确认无import错误。

---

## Task 2: 更新路由配置

**Files:**

- Modify: `prototype/src/router/index.js`

**Step 1: 添加物料管理页面的路由**

在 `children` 数组的质量模块路由之后，添加3条物料管理路由：

```javascript
// 物料管理模块
{
    path: 'material/dashboard',
    name: 'MaterialDashboard',
    component: () => import('../views/MaterialDashboardView.vue')
},
{
    path: 'material/location',
    name: 'MaterialLocation',
    component: () => import('../views/MaterialLocationView.vue')
},
{
    path: 'material/coils',
    name: 'MaterialCoils',
    component: () => import('../views/MaterialCoilsView.vue')
},
```

---

## Task 3: 更新侧边栏导航

**Files:**

- Modify: `prototype/src/layout/SideBar.vue`

**Step 1: 将"物料管理"从disabled改为active菜单组**

将第48-54行的 `disabled` 菜单组替换为带子菜单的 `open` 菜单组：

```html
<div class="menu-group open">
  <div class="menu-header">
    <Package :size="18" class="icon" />
    <span class="title" v-if="!isCollapsed">物料管理</span>
    <ChevronDown :size="14" class="arrow" v-if="!isCollapsed" />
  </div>
  <div class="menu-items">
    <router-link
      to="/material/dashboard"
      class="menu-item"
      active-class="active"
    >
      <BarChart3 :size="18" class="icon" />
      <span class="title" v-if="!isCollapsed">在制品看板</span>
    </router-link>
    <router-link
      to="/material/location"
      class="menu-item"
      active-class="active"
    >
      <map :size="18" class="icon" />
      <span class="title" v-if="!isCollapsed">库位地图</span>
    </router-link>
    <router-link to="/material/coils" class="menu-item" active-class="active">
      <search :size="18" class="icon" />
      <span class="title" v-if="!isCollapsed">料卷查询</span>
    </router-link>
  </div>
</div>
```

**Step 2: 在 script setup 中新增图标导入**

在现有的lucide-vue-next导入中添加 `BarChart3`, `Map`, `Search` 三个图标。

---

## Task 4: 创建在制品看板页面

**Files:**

- Create: `prototype/src/views/MaterialDashboardView.vue`

**Step 1: 创建页面组件**

布局结构：

1. **页面标题区**：标题"在制品看板" + 副标题 + 导出按钮
2. **统计卡片行**（6个卡片）：
   - 在制品总数(156, 青色图标)
   - 今日流转(42, 绿色图标)
   - 待分切(23, 蓝色图标)
   - 待精切(128, 紫色图标)
   - 超7天未动(12, 橙色图标)
   - 呆滞预警(5, 红色图标)
3. **左右分栏区域**：
   - 左侧(60%)：
     - **工序流转管道图**：用CSS实现 胚料→轧机→分切→精切→包装 的横向流程，每个节点用圆形+数字+标签，节点间用连接线。箭头连接，每个节点标注当前在制品数量。
     - **各区域在制品分布条形图**：轧机区/分切区/精切区/退火区的在制品数量横条
   - 右侧(40%)：
     - **呆滞预警列表**：卡片列表，红/橙左边框标识严重程度，显示卷号、停放天数、位置、状态
     - **最近流转记录**：时间线列表，显示最近操作的时间、卷号、从→到移动

设计风格与现有DashboardView保持一致：使用 `var(--bg-surface)`, `var(--border-light)`, `var(--shadow-sm)` 等设计token。

---

## Task 5: 创建库位地图页面

**Files:**

- Create: `prototype/src/views/MaterialLocationView.vue`

**Step 1: 创建页面组件**

布局结构：

1. **页面标题区**：标题"库位地图" + 搜索框（输入卷号快速定位）
2. **工序区域Tab切换**：分切区（默认）/ 轧机区 / 精切区 / 退火区
3. **图例栏**：空位(虚线) / 正常<3天(绿) / 注意3-7天(黄) / 超期7-14天(橙) / 呆滞>14天(红)
4. **网格地图区**：
   - 按当前Tab对应区域的排×列渲染库位格
   - 每排前面有排标签（A排、B排...）
   - 每个库位格显示：缩写卷号 + 停放天数
   - 空位显示虚线框
   - 有料位根据停放天数着色（绿/黄/橙/红）
   - 橙色和红色库位有脉冲动画（pulse animation）
   - hover 放大效果
5. **库位详情弹窗**：点击有料库位弹出浮窗
   - 完整卷号、规格、母卷号、客户、入库时间、停放天数
   - 质量评审状态和主结论
   - "查看详情"按钮（跳转到料卷查询页并选中该卷）
   - "关闭"按钮

搜索功能：输入卷号后匹配到的库位格高亮闪烁(CSS animation)，并自动切换到对应区域Tab。

---

## Task 6: 创建料卷查询页面

**Files:**

- Create: `prototype/src/views/MaterialCoilsView.vue`

**Step 1: 创建页面组件**

布局结构：

1. **页面标题区**：标题"料卷查询" + 导出按钮
2. **搜索筛选栏**：
   - 卷号搜索框
   - 状态筛选下拉（多选，选项来自18种状态）
   - 工序筛选下拉（轧机/分切/精切/退火/全部）
   - 区域筛选下拉（分切区/轧机区/精切区/退火区/全部）
3. **左右分栏**（列表+详情面板，类似排产模块的布局）：
   - 左侧列表(40%)：
     - 表格，列：卷号、规格（精简如"13μ×872"）、当前状态（带色标签）、位置
     - 选中行高亮
     - 点击行切换右侧详情
   - 右侧详情面板(60%)：
     - **基本信息区块**：卷号、母卷号、车次号、规格完整信息、客户、合金、产品类型、重量、当前位置
     - **质量评审区块**：主结论标签 + 产品等级 + 处理指令列表（侧、起止mm、缺陷类型、处理方式）
     - **流转历史时间线**：从最新到最老，每个节点：
       - 圆点(当前状态实心，历史空心)
       - 时间（日期+时间）
       - 状态变更描述
       - 操作人
       - 位置信息（如有变更）

---

## Task 7: 验证与联调

**Step 1: 验证页面渲染**

在浏览器中访问以下路由，确认页面正常渲染：

- `/material/dashboard` — 在制品看板
- `/material/location` — 库位地图
- `/material/coils` — 料卷查询

**Step 2: 验证交互功能**

- 侧边栏菜单展开/收起正常
- 库位地图Tab切换正常
- 库位地图搜索定位正常
- 库位详情弹窗正常
- 料卷查询列表选中+详情面板联动正常
- 筛选功能正常

**Step 3: 验证样式一致性**

- 与已有的排产模块、质量模块的视觉风格一致
- 主题颜色、字体、间距、圆角、阴影等使用统一的CSS变量
- 响应式布局在不同屏幕宽度下表现合理
