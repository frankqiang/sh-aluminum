<template>
  <div class="precision-table-wrapper">
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th width="42" class="text-center">#</th>
            <th width="120">子卷号</th>
            <th width="70">框号</th>
            <th width="65">合金</th>
            <th width="100">规格</th>
            <th width="75">评审</th>
            <th width="240">精切方案</th>
            <th width="70">废料率</th>
            <th width="60" class="text-center">机台</th>
            <th width="120">计划备注</th>
            <th width="90">状态</th>
            <th width="60" class="text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.length === 0">
            <td colspan="12">
              <div class="empty-state">
                <FileX :size="32" class="empty-icon" />
                <span>暂无精切计划</span>
              </div>
            </td>
          </tr>
          <tr v-for="(row, index) in data" :key="row.id" :class="['table-row', getRowClass(row)]">
            <!-- 序号 -->
            <td class="text-center text-muted text-sm">{{ index + 1 }}</td>
            <!-- 子卷号 -->
            <td>
              <div class="sub-coil-no">{{ row.subCoilNo }}</div>
            </td>
            <!-- 框号 -->
            <td class="font-mono text-sm">{{ row.frameNo }}</td>
            <!-- 合金 -->
            <td class="font-mono text-bold">{{ row.alloy }}</td>
            <!-- 规格 -->
            <td class="text-sm">
              <span class="number">{{ row.thickness }}</span><span class="unit">×</span><span class="number">{{
                row.width }}</span>
            </td>
            <!-- 评审 -->
            <td>
              <span class="review-badge" :class="row.reviewStatus">
                {{ reviewLabel(row.reviewStatus) }}
              </span>
            </td>
            <!-- 精切方案 (含破卷备注 + 订单行) -->
            <td>
              <div v-if="row.plan && row.plan.length > 0" class="plan-lines">
                <template v-for="(item, idx) in row.plan" :key="idx">
                  <!-- 有破卷备注时，在精切行前插入破卷行 -->
                  <div v-if="item.coronaNote" class="plan-line plan-line-corona">
                    <span class="corona-tag">
                      破卷<span v-if="item.seq > 1 || row.plan.length > 1" class="plan-seq"
                        style="color: inherit; margin: 0 0 0 2px;">{{ getSeqSymbol(item.seq) }}</span>
                    </span>
                    <span class="corona-note">{{ item.coronaNote }}</span>
                  </div>
                  <!-- 精切方案行 -->
                  <div class="plan-line">
                    <span class="plan-seq">{{ getSeqSymbol(item.seq) }}</span>
                    <span>{{ item.customer }} {{ item.orderWidth }}mm×{{ item.lengthMin }}-{{ item.lengthMax }}m</span>
                  </div>
                </template>
              </div>
              <span v-else class="text-muted text-sm">—</span>
            </td>
            <!-- 废料率 -->
            <td>
              <span v-if="row.wasteRate != null" class="waste-rate" :class="wasteRateClass(row.wasteRate)">
                {{ row.wasteRate }}%
              </span>
              <span v-else class="text-muted text-sm">—</span>
            </td>
            <!-- 机台 -->
            <td class="text-center font-mono text-bold text-sm">{{ row.machineId }}#</td>
            <!-- 计划备注 -->
            <td>
              <div class="note-text" :title="row.note">{{ row.note || '—' }}</div>
            </td>
            <!-- 状态 -->
            <td>
              <div class="status-cell" :class="getDisplayStatus(row)">
                <CheckCircle2 v-if="getDisplayStatus(row) === 'completed'" :size="14" />
                <PlayCircle v-else-if="getDisplayStatus(row) === 'running'" :size="14" />
                <AlertCircle v-else-if="getDisplayStatus(row) === 'pending_review'" :size="14" />
                <Clock v-else :size="14" />
                <span>{{ statusLabel(getDisplayStatus(row)) }}</span>
              </div>
            </td>
            <!-- 操作 -->
            <td class="text-center">
              <button class="action-btn" @click.stop="$emit('view', row)">查看</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { FileX, CheckCircle2, PlayCircle, Clock, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['view'])

function getDisplayStatus(row) {
  if (row.reviewStatus !== "reviewed") return "pending_review";
  return row.status;
}

function getRowClass(row) {
  const status = getDisplayStatus(row);
  return {
    "row-completed": status === "completed",
    "row-running": status === "running",
    "row-pending-review": status === "pending_review",
    "row-planned": status === "planned",
  };
}

function getSeqSymbol(seq) {
  const seqMap = ["①", "②", "③", "④", "⑤"];
  return seqMap[seq - 1] || `${seq}`;
}

function reviewLabel(status) {
  switch (status) {
    case 'reviewed': return '✅已评审'
    case 'pending': return '⚠️待评审'
    case 'none': return '❌未提交'
    default: return status || '—'
  }
}

function statusLabel(status) {
  const map = {
    'completed': '已完成',
    'running': '进行中',
    'pending_review': '待评审',
    'planned': '计划中'
  }
  return map[status] || status
}

// 废料率阈值颜色
function wasteRateClass(rate) {
  const r = parseFloat(rate)
  if (isNaN(r)) return ''
  if (r <= 8) return 'green'
  if (r > 15) return 'red'
  return 'orange'
}
</script>

<style scoped>
.precision-table-wrapper {
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 2px solid var(--border-light);
  background-color: var(--bg-main);
  white-space: nowrap;
}

.data-table td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-main);
}

.table-row {
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: var(--bg-hover);
}

.table-row:last-child td {
  border-bottom: none;
}

/* 状态行高亮 */
.row-running {
  background-color: var(--primary-light);
}

.row-running td {
  border-bottom-color: #dbeafe;
}

.row-running:hover {
  background-color: #e0edff;
}

.row-pending-review {
  background-color: #fffbeb;
}

.row-pending-review td {
  border-bottom-color: #fde68a;
}

.row-pending-review:hover {
  background-color: #fef3c7;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: var(--text-muted);
}

.text-sm {
  font-size: 0.85rem;
}

.font-mono {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.02em;
}

.text-bold {
  font-weight: 600;
  color: var(--text-main);
}

.sub-coil-no {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--primary-color);
  font-size: 0.9rem;
}

.number {
  font-family: var(--font-mono);
  font-weight: 500;
}

.unit {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0 1px;
}

/* 产品类型标签 */
.review-badge {
  font-size: 0.8rem;
  font-weight: 500;
}

.review-badge.reviewed {
  color: var(--status-success);
}

.review-badge.pending {
  color: #d97706;
}

.review-badge.none {
  color: var(--text-muted);
}

/* 电晕已移入精切方案列，此处不再需要 corona-badge */

.plan-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plan-line {
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.plan-seq {
  font-size: 1.05rem;
  margin-right: 2px;
  color: var(--text-main);
}

/* 破卷行样式 */
.plan-line-corona {
  color: var(--text-muted);
  font-size: 0.78rem;
  gap: 3px;
  padding: 0 0 1px 0;
  border-bottom: 1px dashed var(--border-light);
  margin-bottom: 2px;
}

.corona-tag {
  font-size: 0.85rem;
  font-weight: 600;
  color: #7c3aed;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  border-radius: 4px;
  padding: 1px 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.corona-note {
  color: #6d28d9;
  font-family: var(--font-mono);
  font-size: 0.78rem;
}

/* 状态单元格 */
.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-cell.completed {
  color: var(--status-success);
  background-color: var(--status-success-bg);
}

.status-cell.running {
  color: var(--primary-color);
  background-color: #dbeafe;
}

.status-cell.planned {
  color: var(--text-secondary);
  background-color: var(--bg-hover);
}

.status-cell.pending_review {
  color: #d97706;
  background-color: #fef3c7;
}

/* 操作按钮 */
.action-btn {
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  background: none;
  border: none;
  padding: 0;
}

.action-btn:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.note-text {
  font-size: 0.82rem;
  color: var(--text-secondary);
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-text[title="—"] {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: var(--text-muted);
  gap: 0.5rem;
}

.empty-icon {
  opacity: 0.5;
}

/* 废料率颜色 */
.waste-rate {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.85rem;
}

.waste-rate.green {
  color: var(--status-success);
}

.waste-rate.orange {
  color: #d97706;
}

.waste-rate.red {
  color: var(--status-error);
}
</style>
