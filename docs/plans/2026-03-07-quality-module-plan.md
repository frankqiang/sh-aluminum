# 质量模块原型 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 开发质量评审模块原型，包含待评审列表页和全屏评审录入页，解决评审信息不规范和传递断链问题。

**Architecture:** 新增两个 Vue 视图（QualityView、QualityReviewView），通过 Vue Router 路由跳转连接。数据层使用 mock JS 文件，与现有排产模块的架构保持一致。

**Tech Stack:** Vue 3 Composition API, Vue Router 4, Lucide Vue Next 图标库

**设计文档:** `docs/plans/2026-03-07-quality-module-design.md`

---

### Task 1: 创建 Mock 数据文件

**Files:**

- Create: `prototype/src/data/quality-review-data.js`

**Step 1: 创建数据文件**

```js
// 待评审料卷列表
export const qualityCoilList = [
  {
    id: "qr-001",
    coilNo: "Y2601380",
    parentCoilNo: "Y2601301",
    alloy: "1060",
    thickness: 13,
    width: 1350,
    estimatedLength: 24000,
    weight: 856,
    process: "分切",
    machine: "2# 分切机",
    downloadTime: "2026-03-07T06:05:00",
    status: "pending",
  },
  {
    id: "qr-002",
    coilNo: "Y2601392",
    parentCoilNo: "Y2601302",
    alloy: "1235D",
    thickness: 15,
    width: 1200,
    estimatedLength: 20000,
    weight: 730,
    process: "分切",
    machine: "4# 分切机",
    downloadTime: "2026-03-07T08:30:00",
    status: "pending",
  },
  {
    id: "qr-003",
    coilNo: "Y2601351",
    parentCoilNo: "Y2601289",
    alloy: "1060",
    thickness: 13,
    width: 1350,
    estimatedLength: 22000,
    weight: 800,
    process: "轧机",
    machine: "8# 精轧机",
    downloadTime: "2026-03-06T16:00:00",
    status: "reviewed",
  },
  {
    id: "qr-004",
    coilNo: "Y2601355",
    parentCoilNo: "Y2601290",
    alloy: "1100",
    thickness: 13,
    width: 1340,
    estimatedLength: 23000,
    weight: 820,
    process: "分切",
    machine: "1# 分切机",
    downloadTime: "2026-03-06T20:00:00",
    status: "revising",
  },
];

// 主评审结论选项（16种，基于2315条评审信息分析）
export const mainConclusionOptions = [
  "让步放行",
  "正常处理",
  "改切",
  "转精切",
  "沟通放行",
  "直接降级处理",
  "改切二级品",
  "扒废",
  "建议扒废",
  "退火后处理",
  "包装扒至",
  "薄剪处理",
  "评审可切",
  "工艺导卷",
  "转入优箔",
  "其他",
];

// 传递对象选项
export const deliveryTargetOptions = ["包装备注", "分切备注", "精切备注"];

// 缺陷类型选项（27种）
export const defectTypeOptions = [
  "针孔",
  "气道",
  "孔洞",
  "辊印",
  "白条",
  "下榻",
  "条纹",
  "压坑",
  "油泥",
  "油斑",
  "板形",
  "闪筋",
  "亮线",
  "直棱",
  "横折",
  "划伤",
  "厚度",
  "擦划",
  "带油",
  "棱印",
  "起皱",
  "黑线",
  "串层",
  "米数",
  "油线",
  "麻点",
  "斜纹",
];

// 位置侧选项
export const locationSideOptions = ["Q侧", "C侧", "整幅"];

// 处理方式选项（23种）
export const treatmentOptions = [
  "切除",
  "避留白",
  "改切",
  "反开",
  "切二级品",
  "电晕",
  "扒至",
  "下料观察",
  "反开卷",
  "吸边",
  "扒除",
  "复查",
  "降速",
  "切等外",
  "验证",
  "扒废",
  "复测",
  "导卷",
  "薄剪",
  "改制",
  "在线观察",
  "复检",
  "工艺导卷",
];

// 已有的评审记录（qr-003已评审示例）
export const qualityReviews = {
  "qr-003": {
    mainConclusion: "让步放行",
    deliveryTarget: "包装备注",
    productGrade: "A",
    pinholeA: 94,
    pinholeB: 13,
    pinholeC: 42,
    pinholeD: 8,
    pinholeE: 3,
    densePinhole: false,
    densePinholeNote: "",
    offlinePinhole: 0,
    longitudinalDensity: null,
    surfaceInfo: "Q860辊印，L985周期",
    slittingQuality: "",
    flatness: 1.8,
    faceDensity: null,
    dyneValue: null,
    tubeCore: "63/60",
    frameNo: "3195",
    instructions: [
      {
        defectType: "针孔",
        locationSide: "Q侧",
        startMm: 0,
        endMm: 80,
        lengthPosM: null,
        treatment: "切除",
      },
      {
        defectType: "辊印",
        locationSide: "C侧",
        startMm: 0,
        endMm: 40,
        lengthPosM: null,
        treatment: "避留白",
      },
    ],
    note: "已与客户沟通，同意让步放行",
    reviewer: "张三",
    reviewTime: "2026-03-06T17:30:00",
  },
};

// 空评审模板（新建评审时使用）
export function createEmptyReview() {
  return {
    mainConclusion: "",
    deliveryTarget: "",
    productGrade: "A",
    pinholeA: null,
    pinholeB: null,
    pinholeC: null,
    pinholeD: null,
    pinholeE: null,
    densePinhole: false,
    densePinholeNote: "",
    offlinePinhole: null,
    longitudinalDensity: null,
    surfaceInfo: "",
    slittingQuality: "",
    flatness: null,
    faceDensity: null,
    dyneValue: null,
    tubeCore: "",
    frameNo: "",
    instructions: [],
    note: "",
    reviewer: "张三",
    reviewTime: null,
  };
}
```

**Step 2: 确认文件已创建**

在浏览器中访问 `http://localhost:5173`，确认应用正常运行（此步无前端变化）。

**Step 3: Commit**

```bash
git add prototype/src/data/quality-review-data.js
git commit -m "feat(quality): 添加质量评审模块 mock 数据"
```

---

### Task 2: 添加路由 + 激活侧边栏导航

**Files:**

- Modify: `prototype/src/router/index.js`
- Modify: `prototype/src/layout/SideBar.vue`

**Step 1: 修改路由文件，新增两条路由**

在 `router/index.js` 的 children 数组中追加：

```js
{
  path: 'quality',
  name: 'Quality',
  component: () => import('../views/QualityView.vue')
},
{
  path: 'quality/:id/review',
  name: 'QualityReview',
  component: () => import('../views/QualityReviewView.vue')
}
```

**Step 2: 修改 SideBar.vue**

将质量管理的 `disabled` 分组替换为可展开的带子菜单分组（参考排产管理分组的写法）：

- 引入 `ClipboardCheck` 图标（from lucide-vue-next）
- 添加子菜单项：`质量评审` → `/quality`
- 移除 `disabled` class

**Step 3: 临时创建占位文件（防止路由报错）**

创建空壳 `prototype/src/views/QualityView.vue`：

```vue
<template>
  <div>质量评审（开发中）</div>
</template>
```

创建空壳 `prototype/src/views/QualityReviewView.vue`：

```vue
<template>
  <div>评审录入（开发中）</div>
</template>
```

**Step 4: 验证导航**

访问 `http://localhost:5173`，点击侧边栏"质量管理 > 质量评审"，确认路由跳转到 `/quality` 且无报错。

**Step 5: Commit**

```bash
git add prototype/src/router/index.js prototype/src/layout/SideBar.vue prototype/src/views/QualityView.vue prototype/src/views/QualityReviewView.vue
git commit -m "feat(quality): 添加路由配置并激活侧边栏质量管理导航"
```

---

### Task 3: 开发待评审列表页（QualityView.vue）

**Files:**

- Modify: `prototype/src/views/QualityView.vue`

**Step 1: 实现列表页完整内容**

页面结构（从上到下）：

1. **页面顶部统计区**：`待评审 N 条` / `今日已完成 N 条`（从 qualityCoilList 计算）
2. **筛选栏**：工序下拉（全部/轧机/分切）、状态下拉（全部/待评审/已评审/修改中）、卷号搜索框
3. **数据表格**：列定义见设计文档第三节

关键实现要点：

- 使用 `computed` 实现过滤逻辑
- **下料已过时长**：`(now - downloadTime)` 实时计算，超过24小时显示红色 `⚠️`
- **状态标签颜色**：`pending`=橙色、`reviewed`=绿色、`revising`=蓝色
- 操作列：`pending`/`revising` 状态显示「进入评审」按钮（`router.push('/quality/:id/review')`），`reviewed` 显示「查看」按钮

**Step 2: 验证列表页**

访问 `/quality`，确认：

- [ ] 显示4条mock数据
- [ ] 筛选功能正常
- [ ] 超过24小时的 `qr-003`（昨天16:00）显示红色时间警告
- [ ] 状态标签颜色正确
- [ ] 「进入评审」按钮点击后跳转路由（此时跳转到占位页面）

**Step 3: Commit**

```bash
git add prototype/src/views/QualityView.vue
git commit -m "feat(quality): 完成待评审列表页开发"
```

---

### Task 4: 开发评审录入页——框架与左栏（QualityReviewView.vue）

**Files:**

- Modify: `prototype/src/views/QualityReviewView.vue`

**Step 1: 搭建左右两栏框架**

```vue
<template>
  <div class="review-page">
    <!-- 顶部导航栏 -->
    <div class="review-header">
      <button @click="router.push('/quality')">← 返回列表</button>
      <h1>质量评审录入：{{ coil?.coilNo }}</h1>
      <div class="actions">
        <button class="btn-secondary">保存草稿</button>
        <button class="btn-primary">提交评审</button>
      </div>
    </div>

    <!-- 左右两栏主体 -->
    <div class="review-body">
      <!-- 左栏：料卷信息（只读） -->
      <aside class="coil-info-panel">...</aside>
      <!-- 右栏：评审录入区 -->
      <main class="review-form">...</main>
    </div>
  </div>
</template>
```

CSS 要点：

- `review-page` 占满视口高度，`overflow: hidden`
- `review-body` 使用 `display: flex`，左栏固定 320px，右栏 flex: 1 且 `overflow-y: auto`
- `review-header` 固定在顶部（`position: sticky; top: 0`）

**Step 2: 实现左栏内容**

从 `qualityCoilList` 中根据路由 `id` 参数找到对应料卷，显示只读字段：
卷号、来料卷号、合金、厚度、宽度、米数、重量、工序、机台、下料时间、下料已过时长（带红色警告样式）。

**Step 3: 验证左栏**

点击列表页「进入评审」后，确认左栏正确显示对应料卷信息。

**Step 4: Commit**

```bash
git add prototype/src/views/QualityReviewView.vue
git commit -m "feat(quality): 完成评审录入页框架和左栏料卷信息"
```

---

### Task 5: 开发评审录入页——右栏表单（区块一+二）

**Files:**

- Modify: `prototype/src/views/QualityReviewView.vue`

**Step 1: 区块一——主评审结论**

```vue
<section class="form-section">
  <h3>一、主评审结论</h3>
  <div class="form-row">
    <label>主评审结论 *</label>
    <select v-model="form.mainConclusion">
      <option v-for="opt in mainConclusionOptions" :key="opt">{{ opt }}</option>
    </select>
  </div>
  <div class="form-row">
    <label>传递对象备注</label>
    <select v-model="form.deliveryTarget">
      <option value="">不指定</option>
      <option v-for="opt in deliveryTargetOptions" :key="opt">{{ opt }}</option>
    </select>
  </div>
  <div class="form-row">
    <label>产品等级 *</label>
    <label><input type="radio" v-model="form.productGrade" value="A"> 一级品</label>
    <label><input type="radio" v-model="form.productGrade" value="B"> 二级品</label>
  </div>
</section>
```

**Step 2: 区块二——检测数据（5个子分组）**

为每个子分组（针孔检测/表面检测/板型检测/其他检测/物料信息）创建带边框标题的 section。
字段对应关系参考设计文档第四节 4.3 区块二。

密集型针孔特殊处理：

```vue
<div class="form-row">
  <label>密集型针孔</label>
  <label><input type="radio" v-model="form.densePinhole" :value="false"> 无</label>
  <label><input type="radio" v-model="form.densePinhole" :value="true"> 有</label>
  <input v-if="form.densePinhole" type="text" v-model="form.densePinholeNote" placeholder="备注位置/情况">
</div>
```

**Step 3: 验证区块一和二**

访问 `/quality/qr-001/review`，确认：

- [ ] 主评审结论下拉有16种选项
- [ ] 产品等级单选正常
- [ ] 针孔各级别数字正常输入
- [ ] 密集型针孔切换显示/隐藏备注框正常

**Step 4: Commit**

```bash
git add prototype/src/views/QualityReviewView.vue
git commit -m "feat(quality): 完成评审录入右栏区块一（主评审结论）和区块二（检测数据）"
```

---

### Task 6: 开发评审录入页——处理指令动态表格（区块三+四）

**Files:**

- Modify: `prototype/src/views/QualityReviewView.vue`

**Step 1: 区块三——处理指令动态行**

使用 `v-model` 绑定 `form.instructions` 数组，每一项对应一行：

```vue
<section class="form-section">
  <h3>三、处理指令</h3>
  <table class="instructions-table">
    <thead>
      <tr>
        <th>#</th><th>缺陷类型</th><th>位置侧</th>
        <th>起始(mm)</th><th>终止(mm)</th><th>长度位置(m)</th>
        <th>处理方式</th><th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(inst, idx) in form.instructions" :key="idx">
        <td>{{ idx + 1 }}</td>
        <td><select v-model="inst.defectType">
          <option v-for="opt in defectTypeOptions" :key="opt">{{ opt }}</option>
        </select></td>
        <td><select v-model="inst.locationSide">
          <option v-for="opt in locationSideOptions" :key="opt">{{ opt }}</option>
        </select></td>
        <td><input type="number" v-model.number="inst.startMm"></td>
        <td><input type="number" v-model.number="inst.endMm"></td>
        <td><input type="number" v-model.number="inst.lengthPosM" placeholder="可选"></td>
        <td><select v-model="inst.treatment">
          <option v-for="opt in treatmentOptions" :key="opt">{{ opt }}</option>
        </select></td>
        <td><button @click="removeInstruction(idx)">✕</button></td>
      </tr>
    </tbody>
  </table>
  <button @click="addInstruction">+ 添加处理指令</button>
</section>
```

```js
function addInstruction() {
  form.value.instructions.push({
    defectType: "",
    locationSide: "Q侧",
    startMm: null,
    endMm: null,
    lengthPosM: null,
    treatment: "",
  });
}
function removeInstruction(idx) {
  form.value.instructions.splice(idx, 1);
}
```

**Step 2: 区块四——备注 + 提交逻辑**

```vue
<section class="form-section">
  <h3>四、评审备注</h3>
  <textarea v-model="form.note" placeholder="可选备注..."></textarea>
  <div class="review-meta">
    <span>评审人：{{ form.reviewer }}</span>
    <span>{{ form.reviewTime || '提交后自动填写' }}</span>
  </div>
</section>
```

提交逻辑：

```js
function submitReview() {
  if (!form.value.mainConclusion) {
    alert("请填写主评审结论");
    return;
  }
  form.value.reviewTime = new Date().toISOString();
  // 更新 qualityCoilList 中该卷的状态为 reviewed
  const coil = qualityCoilList.find((c) => c.id === route.params.id);
  if (coil) coil.status = "reviewed";
  qualityReviews[route.params.id] = { ...form.value };
  router.push("/quality");
}
```

**Step 3: 「查看」已评审记录**

当路由对应的料卷状态为 `reviewed` 时，从 `qualityReviews` 加载已有数据填充表单，所有字段设为 `disabled`，按钮区只显示「返回列表」。

**Step 4: 验证完整流程**

- [ ] 点击「进入评审」→ 录入页打开，左栏正确
- [ ] 填写主评审结论、检测数据
- [ ] 添加2条处理指令，可删除
- [ ] 点击「提交评审」→ 校验主评审结论必填
- [ ] 提交成功 → 跳回列表页，该料卷状态变为「已评审」✅
- [ ] 点击已评审料卷的「查看」→ 表单只读显示

**Step 5: Commit**

```bash
git add prototype/src/views/QualityReviewView.vue
git commit -m "feat(quality): 完成评审录入页处理指令动态表格和提交逻辑"
```

---

### Task 7: 样式打磨

**Files:**

- Modify: `prototype/src/views/QualityView.vue`
- Modify: `prototype/src/views/QualityReviewView.vue`

**Step 1: 列表页样式**

参考现有 `SlittingView.vue` / `DashboardView.vue` 的 CSS 变量系统（`var(--primary-color)`, `var(--bg-surface)` 等），使两个新页面视觉风格统一。

重点样式：

- 统计数字卡片（顶部小卡片）
- 状态标签 badge（orange/green/blue）
- 超时红色警告样式（`color: var(--danger-color)` 或 `#ef4444`）
- 表格行 hover 效果

**Step 2: 录入页样式**

- 左栏固定，右栏可滚动，顶部 header 固定吸顶
- 表单区块用卡片样式（`background: var(--bg-surface); border-radius; padding`）
- 分组标题用小号标签样式（带色块左边线）
- 处理指令表格：紧凑布局，下拉/输入框宽度合适，✕ 按钮淡红色

**Step 3: 验证整体视觉**

截图对比现有 SlittingView，确认整体视觉风格一致。

**Step 4: Commit**

```bash
git add prototype/src/views/QualityView.vue prototype/src/views/QualityReviewView.vue
git commit -m "style(quality): 完成质量评审模块样式打磨，与现有设计系统统一"
```
