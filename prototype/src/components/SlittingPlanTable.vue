<template>
  <div class="slitting-table-wrapper">
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th width="42" class="text-center">#</th>
            <th width="60">机台</th>
            <th width="120">母卷号</th>
            <th width="65">合金</th>
            <th width="100">规格</th>
            <th width="130">执行单号</th>
            <th width="90">客户</th>
            <th width="75">产品</th>
            <th width="75">评审</th>
            <th width="190">切刀规格</th>
            <th width="70">废料率</th>
            <th width="90">状态</th>
            <th width="60" class="text-center">操作</th>
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
          <tr v-for="(row, index) in data" :key="row.id"
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
              <span class="number">{{ row.width }}</span><span class="unit">×</span><span class="number">{{ row.thickness }}</span><span class="unit">μm</span>
            </td>
            <!-- 执行单号 -->
            <td>
              <div class="order-no font-mono text-sm" v-if="row.orderNo">{{ row.orderNo }}</div>
              <div class="text-muted text-sm" v-else>—</div>
            </td>
            <!-- 客户 -->
            <td>
              <span v-if="row.customer" class="text-sm font-medium">{{ row.customer }}</span>
              <span v-else class="unmatched">(未匹配)</span>
            </td>
            <!-- 产品类型 -->
            <td>
              <span class="product-badge" :class="productClass(row.productType)">{{ row.productType }}</span>
            </td>
            <!-- 评审状态 -->
            <td>
              <span class="review-badge" :class="row.reviewStatus">
                {{ reviewLabel(row.reviewStatus) }}
              </span>
            </td>
            <!-- 切刀规格 -->
            <td>
              <template v-if="row.cuttingPlan">
                <!-- 循环展示每个独立规格，多订单则换行 -->
                <div class="cutting-specs-wrapper">
                  <div
                    v-for="(spec, i) in getCuttingSpecs(row)"
                    :key="i"
                    class="text-sm font-mono cutting-spec"
                  >
                    {{ spec }}
                  </div>
                </div>
              </template>
              <span v-else class="text-muted text-sm">—</span>
            </td>
            <!-- 废料率 -->
            <td>
              <span v-if="row.cuttingPlan" class="waste-rate" :class="wasteRateClass(row.cuttingPlan.wasteRate, row.productType)">
                {{ row.cuttingPlan.wasteRate }}%
              </span>
              <span v-else class="text-muted text-sm">—</span>
            </td>
            <!-- 状态 -->
            <td>
              <div class="status-cell" :class="row.status">
                <CheckCircle2 v-if="row.status === 'completed'" :size="14" />
                <PlayCircle v-else-if="row.status === 'running'" :size="14" />
                <AlertCircle v-else-if="row.status === 'pending_review'" :size="14" />
                <Clock v-else :size="14" />
                <span>{{ statusLabel(row.status) }}</span>
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

function rowClass(row) {
  if (row.status === 'running') return 'row-running'
  if (row.status === 'pending_review') return 'row-pending-review'
  return ''
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

// 获取切刀规格数组（多订单换行显示）
function getCuttingSpecs(row) {
  const plan = row.cuttingPlan
  if (!plan) return []
  if (plan.segments) {
    const orderSegs = plan.segments.filter(s => s.type === 'order' && s.width)
    if (orderSegs.length > 1) {
      // 提取独立规格：如 13x750电池箔x23000-24000
      return orderSegs.map(s => {
        let lengthPart = ''
        if (s.planLengthMin) {
          lengthPart = `×${s.planLengthMin}`
        } else if (s.lengthMin && s.lengthMax) {
          lengthPart = `×${s.lengthMin}-${s.lengthMax}`
        }
        return `${row.thickness}×${s.width}${row.productType}${lengthPart}`
      })
    }
  }
  return [plan.spec || '—']
}

// 废料率阈值按产品类型区分
function wasteRateClass(rate, productType) {
  const r = parseFloat(rate)
  if (isNaN(r)) return ''
  // 电池箔要求更严：≤ 5% 绿色，> 10% 红色
  const good = productType === '电池箔' ? 5 : 8
  const warn = productType === '电池箔' ? 10 : 15
  if (r <= good) return 'green'
  if (r > warn) return 'red'
  return 'orange'
}

function productClass(type) {
  if (type === '电池箔') return 'battery'
  if (type === '双零箔') return 'double-zero'
  return ''
}
</script>

<style scoped>
.slitting-table-wrapper {
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

/* 文本和通用样式 */
.text-center { text-align: center; }
.text-muted { color: var(--text-muted); }
.text-sm { font-size: 0.85rem; }
.font-mono { font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.02em; }
.font-medium { font-weight: 500; }
.text-bold { font-weight: 600; color: var(--text-main); }

.coil-no {
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

.unmatched {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-style: italic;
}

/* 产品类型标签 */
.product-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}
.product-badge.battery {
  background-color: #fee2e2;
  color: #ef4444;
  border: 1px solid #fca5a5;
}
.product-badge.double-zero {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

/* 评审状态标签 */
.review-badge {
  font-size: 0.8rem;
  font-weight: 500;
}
.review-badge.reviewed { color: var(--status-success); }
.review-badge.pending { color: #d97706; }
.review-badge.none { color: var(--text-muted); }

/* 切刀规格 */
.cutting-specs-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cutting-spec {
  color: var(--text-secondary);
}

/* 废料率颜色 */
.waste-rate {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.85rem;
}
.waste-rate.green { color: var(--status-success); }
.waste-rate.orange { color: #d97706; }
.waste-rate.red { color: var(--status-error); }

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

.status-cell.completed { color: var(--status-success); background-color: var(--status-success-bg);}
.status-cell.running { color: var(--primary-color); background-color: #dbeafe;}
.status-cell.planned { color: var(--text-secondary); background-color: var(--bg-hover);}
.status-cell.pending_review { color: #d97706; background-color: #fef3c7;}

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
</style>
