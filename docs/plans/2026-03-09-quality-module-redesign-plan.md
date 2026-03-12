# 质量模块重构 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构质量评审模块，使其字段结构与真实 Excel 报表完全对齐，并确保数据结构支持排产模块的有效宽度/长度计算。

**Architecture:** 基于现有 3 页面架构（列表页/录入页/评审页），删除冗余的新建弹窗，补充缺失字段（操作员信息、长度起止），修正错误字段类型（达因值），完善评审页的数据展示。

**Tech Stack:** Vue 3 (Composition API) + Vite + vue-router + lucide-vue-next

---

### Task 1: 更新数据模型

**Files:**

- Modify: `prototype/src/data/quality-review-data.js`

**Step 1: 更新 `createEmptyEntryData()` 函数**

新增操作员元数据字段，将 `dyneValue` 类型改为字符串：

```javascript
export function createEmptyEntryData() {
  return {
    meters: null,
    weight: null,
    joints: null,
    // 针孔检测
    pinholeA: null,
    pinholeB: null,
    pinholeC: null,
    pinholeD: null,
    pinholeE: null,
    offlinePinhole: null,
    longitudinalDensity: null,
    densePinhole: false,
    densePinholeNote: "",
    // 表面检测
    surfaceInfo: "",
    slittingQuality: "",
    // 板型检测
    flatnessData: "",
    flatness: null,
    // 其他
    faceDensity: [null, null, null, null, null, null],
    dyneValue: "", // ← 改为字符串，支持 '30/30缩' 格式
    tubeCore: "",
    frameNo: "",
    // 质量初判
    qualityJudgment: "nonconform",
    defectReasons: [],
    // 操作员信息（新增）
    operator: "", // 主操手
    inspector: "", // 质检员
    shift: "", // 班组：甲/乙/丙
    entryDate: null, // 录入日期，默认当天
  };
}
```

**Step 2: 更新 `createEmptyReviewData()` 函数**

处理指令模板中 `lengthPosM` 拆为 `lengthStartM` + `lengthEndM`：

```javascript
export function createEmptyReviewData() {
  return {
    finalJudgment: "nonconform",
    productGrade: "A",
    mainConclusion: "",
    deliveryTarget: "",
    downgradeReason: "",
    instructions: [], // 每条指令：{ defectType, locationSide, startMm, endMm, lengthStartM, lengthEndM, treatment }
    note: "",
  };
}
```

**Step 3: 新增班组选项常量**

```javascript
export const shiftOptions = ["甲", "乙", "丙"];
```

**Step 4: 更新 Mock 数据**

- 所有 `pending_entry` 记录保持 `entryData: null`（卷号等基本信息已有）
- 删除 Mock 数据中不需要的 `dyneValue: 31` 数字值，改为 `dyneValue: '31'` 字符串
- 已完成记录的 `instructions` 中 `lengthPosM` 改为 `lengthStartM` + `lengthEndM`
- 已完成记录的 `entryData` 补充 `operator`/`inspector`/`shift`/`entryDate`

**Step 5: 验证**

Run: `npm run dev`
Expected: 页面正常加载，无控制台错误

**Step 6: Commit**

```bash
git add prototype/src/data/quality-review-data.js
git commit -m "refactor(quality): 更新数据模型 — 达因值改字符串、新增操作员字段、长度起止拆分"
```

---

### Task 2: 重构列表页（QualityView.vue）

**Files:**

- Modify: `prototype/src/views/QualityView.vue`

**Step 1: 删除新建弹窗相关代码**

- 删除 template 中的 `dialog-overlay` 整个节点（新建记录弹窗）
- 删除 template 中的 `btn-new` 按钮（"+ 新建记录"）
- 删除 script 中的 `showNewDialog`、`newForm`、`createRecord` 相关逻辑
- 删除 style 中的 `.dialog-*`、`.btn-new`、`.form-row`、`.form-group`、`.form-control`（弹窗相关样式）

**Step 2: 更新 Popover 中处理指令的长度字段展示**

将 popover 中的 `inst.lengthPosM` 引用改为 `inst.lengthStartM` / `inst.lengthEndM`：

```html
<template v-if="inst.lengthStartM != null">
  · {{ inst.lengthStartM }}-{{ inst.lengthEndM }}m
</template>
```

**Step 3: 验证**

Run: `npm run dev` → 访问 `/quality`
Expected:

- 无"+ 新建记录"按钮
- 无新建弹窗
- 3 个统计卡片正常显示
- Popover 长度字段正确显示

**Step 4: Commit**

```bash
git add prototype/src/views/QualityView.vue
git commit -m "refactor(quality): 删除新建弹窗，更新 Popover 长度字段"
```

---

### Task 3: 重构录入页（QualityEntryView.vue）

**Files:**

- Modify: `prototype/src/views/QualityEntryView.vue`

**Step 1: 达因值改为文本框**

将区块五中的达因值输入：

```html
<!-- 改前 -->
<input type="number" v-model.number="form.dyneValue" ... />
<!-- 改后 -->
<input
  type="text"
  v-model="form.dyneValue"
  class="form-control"
  placeholder="如 30/30缩"
/>
```

**Step 2: 新增"操作员信息"区块（区块七）**

在"质量初判"区块后新增：

```html
<section class="form-section">
  <h3 class="section-title">七、操作员信息</h3>
  <div class="form-grid-4">
    <div class="form-group">
      <label>主操手</label>
      <input
        type="text"
        v-model="form.operator"
        class="form-control"
        placeholder="姓名"
      />
    </div>
    <div class="form-group">
      <label>质检员</label>
      <input
        type="text"
        v-model="form.inspector"
        class="form-control"
        placeholder="姓名"
      />
    </div>
    <div class="form-group">
      <label>班组</label>
      <select v-model="form.shift" class="form-control">
        <option value="">请选择</option>
        <option v-for="s in shiftOptions" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>日期</label>
      <input type="date" v-model="form.entryDate" class="form-control" />
    </div>
  </div>
</section>
```

**Step 3: 导入 `shiftOptions`**

```javascript
import {
  qualityCoilList,
  createEmptyEntryData,
  downgradeReasonOptions,
  shiftOptions,
} from "../data/quality-review-data";
```

**Step 4: 设置默认日期**

在 `onMounted` 中，如果是新录入，设置默认日期为今天：

```javascript
if (!found.entryData) {
  form.value.entryDate = new Date().toISOString().split("T")[0];
}
```

**Step 5: 添加 `.form-grid-4` 样式**

```css
.form-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.85rem;
}
```

**Step 6: 验证**

Run: `npm run dev` → 访问 `/quality/qr-001/entry`
Expected:

- 达因值是文本框，可输入 `30/30缩`
- 底部新增"操作员信息"区块，含主操手/质检员/班组/日期
- 日期默认为今天

**Step 7: Commit**

```bash
git add prototype/src/views/QualityEntryView.vue
git commit -m "refactor(quality): 达因值改文本框，新增操作员信息区块"
```

---

### Task 4: 重构评审页（QualityReviewView.vue）

**Files:**

- Modify: `prototype/src/views/QualityReviewView.vue`

**Step 1: 左栏补充米数/重量/接头**

在"料卷信息"区块的 `info-list` 中，在"规格"行后面新增：

```html
<div class="info-row">
  <span class="info-label">米数</span>
  <span class="info-val"
    >{{ coil.entryData?.meters ? coil.entryData.meters.toLocaleString() + ' m' :
    '—' }}</span
  >
</div>
<div class="info-row">
  <span class="info-label">重量</span>
  <span class="info-val"
    >{{ coil.entryData?.weight ? coil.entryData.weight + ' kg' : '—' }}</span
  >
</div>
<div class="info-row">
  <span class="info-label">接头</span>
  <span class="info-val">{{ coil.entryData?.joints ?? '—' }} 个</span>
</div>
```

**Step 2: 处理指令表增加长度起始/终止两列**

表头增加：

```html
<th width="90">长度起始 m</th>
<th width="90">长度终止 m</th>
```

替换原有的 `<th width="90">长度位置 m</th>`。

表体对应修改：

```html
<td>
  <input
    type="number"
    v-model.number="inst.lengthStartM"
    class="form-control text-center"
    :disabled="isReadOnly"
    placeholder="—"
  />
</td>
<td>
  <input
    type="number"
    v-model.number="inst.lengthEndM"
    class="form-control text-center"
    :disabled="isReadOnly"
    placeholder="—"
  />
</td>
```

替换原有的 `inst.lengthPosM` 行。

**Step 3: 更新 `addInstruction()` 函数**

```javascript
function addInstruction() {
  form.value.instructions.push({
    defectType: "",
    locationSide: "Q侧",
    startMm: null,
    endMm: null,
    lengthStartM: null,
    lengthEndM: null, // ← 替换 lengthPosM
    treatment: "",
  });
}
```

**Step 4: 更新空行 colspan**

指令表总列数从 8 变为 9（不含删除列），更新空行的 `colspan`：

```html
<td :colspan="isReadOnly ? 8 : 9" class="empty-instructions">暂无处理指令</td>
```

**Step 5: 验证**

Run: `npm run dev` → 访问 `/quality/qr-008/review`
Expected:

- 左栏显示米数 `25,000 m`、重量 `1286.23 kg`、接头 `0 个`
- 处理指令表有"长度起始"和"长度终止"两列
- 新增指令行有两个长度字段

**Step 6: Commit**

```bash
git add prototype/src/views/QualityReviewView.vue
git commit -m "refactor(quality): 左栏补充物理参数，处理指令增加长度起止字段"
```

---

### Task 5: 验收与最终提交

**Step 1: 全流程验证**

1. 访问 `/quality` — 确认列表无"新建"按钮，3 个卡片显示正确
2. 点击"待录入"行的"录入数据" → 进入录入页 → 检查达因值为文本框、底部有操作员区块
3. 填写数据并提交 → 回到列表 → 确认状态变为"待评审"
4. 点击"进入评审" → 左栏显示米数/重量/接头 + 完整检测数据
5. 添加处理指令 → 检查有长度起始/终止两个字段
6. 提交评审 → 回到列表 → 悬停 Popover 显示正确

**Step 2: 构建验证**

Run: `npm run build`
Expected: 无错误，无警告

**Step 3: 最终提交**

```bash
git add -A
git commit -m "refactor(quality): 质量模块重构完成 — 字段对齐、流程简化"
```
