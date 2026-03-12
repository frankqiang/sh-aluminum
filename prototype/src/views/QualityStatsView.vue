<template>
    <div class="stats-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-left">
                <BarChart3 :size="18" class="header-icon" />
                <div>
                    <h1 class="page-title">质量统计</h1>
                    <p class="page-subtitle">质量趋势分析 · 缺陷归因 · 客户放行追踪</p>
                </div>
            </div>
            <!-- 筛选条 -->
            <div class="filter-row">
                <div class="filter-item">
                    <span class="filter-label">起</span>
                    <input type="date" v-model="filters.dateFrom" class="date-input" />
                </div>
                <div class="filter-item">
                    <span class="filter-label">止</span>
                    <input type="date" v-model="filters.dateTo" class="date-input" />
                </div>
                <div class="filter-divider"></div>
                <div class="filter-item">
                    <select v-model="filters.workshop" class="select-input">
                        <option value="">全部车间</option>
                        <option value="一期">一期</option>
                        <option value="二期">二期</option>
                    </select>
                </div>
                <div class="filter-item">
                    <select v-model="filters.machine" class="select-input">
                        <option value="">全部机台</option>
                        <option v-for="m in ['1#', '2#', '4#', '5#']" :key="m" :value="m">{{ m }}</option>
                    </select>
                </div>
                <div class="filter-item">
                    <select v-model="filters.customer" class="select-input">
                        <option value="">全部客户</option>
                        <option v-for="c in customerOptions" :key="c" :value="c">{{ c }}</option>
                    </select>
                </div>
                <button v-if="hasActiveFilter" class="btn-reset" @click="resetFilters">
                    <X :size="12" /> 重置
                </button>
            </div>
        </div>

        <!-- 区块一：KPI 卡片 -->
        <div class="kpi-row">
            <div class="kpi-card">
                <div class="kpi-icon-wrap blue-bg">
                    <Scale :size="16" />
                </div>
                <div class="kpi-body">
                    <div class="kpi-value-row">
                        <span class="kpi-value">{{ totalWeight.toLocaleString() }}<small>kg</small></span>
                    </div>
                    <span class="kpi-label">总产量</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-wrap green-bg">
                    <ShieldCheck :size="16" />
                </div>
                <div class="kpi-body">
                    <div class="kpi-value-row">
                        <span class="kpi-value">{{ firstPassYield }}<small>%</small></span>
                        <span :class="['kpi-trend', fpyTrend >= 0 ? 'trend-up-good' : 'trend-down-bad']"
                            v-if="fpyTrend !== null">
                            <TrendingUp v-if="fpyTrend >= 0" :size="10" />
                            <TrendingDown v-else :size="10" />
                            {{ Math.abs(fpyTrend) }}%
                        </span>
                    </div>
                    <span class="kpi-label">一次合格率</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-wrap orange-bg">
                    <AlertTriangle :size="16" />
                </div>
                <div class="kpi-body">
                    <div class="kpi-value-row">
                        <span class="kpi-value">{{ concessionRate }}<small>%</small></span>
                        <span :class="['kpi-trend', concessionTrend <= 0 ? 'trend-up-good' : 'trend-down-bad']"
                            v-if="concessionTrend !== null">
                            <TrendingDown v-if="concessionTrend <= 0" :size="10" />
                            <TrendingUp v-else :size="10" />
                            {{ Math.abs(concessionTrend) }}%
                        </span>
                    </div>
                    <span class="kpi-label">让步放行率</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-wrap red-bg">
                    <TrendingDown :size="16" />
                </div>
                <div class="kpi-body">
                    <div class="kpi-value-row">
                        <span class="kpi-value">{{ downgradeRate }}<small>%</small></span>
                        <span :class="['kpi-trend', downgradeTrend <= 0 ? 'trend-up-good' : 'trend-down-bad']"
                            v-if="downgradeTrend !== null">
                            <TrendingDown v-if="downgradeTrend <= 0" :size="10" />
                            <TrendingUp v-else :size="10" />
                            {{ Math.abs(downgradeTrend) }}%
                        </span>
                    </div>
                    <span class="kpi-label">二级品率</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-wrap red-bg">
                    <PackageX :size="16" />
                </div>
                <div class="kpi-body">
                    <div class="kpi-value-row">
                        <span class="kpi-value">{{ nonconformWeight.toLocaleString() }}<small>kg</small></span>
                    </div>
                    <span class="kpi-label">不合格量</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon-wrap blue-bg">
                    <Database :size="16" />
                </div>
                <div class="kpi-body">
                    <div class="kpi-value-row">
                        <span class="kpi-value">{{ filteredList.length }}</span>
                    </div>
                    <span class="kpi-label">评审总数</span>
                </div>
            </div>
        </div>

        <!-- 区块二：趋势折线图（两图等宽） -->
        <div class="charts-row two-col">
            <div class="chart-card">
                <div class="chart-header">
                    <TrendingUp :size="14" class="chart-icon" />
                    <span class="chart-title">一次合格率趋势（按日）</span>
                </div>
                <div class="chart-wrap">
                    <Line :data="trendChartData" :options="trendChartOptions" />
                </div>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <Users :size="14" class="chart-icon" />
                    <span class="chart-title">客户放行率趋势（按日）</span>
                    <!-- 客户多选组件 -->
                    <CustomerMultiSelect v-model="selectedChartCustomers" :options="chartCustomerOptions" />
                </div>
                <div class="chart-wrap">
                    <Line :data="customerTrendData" :options="customerTrendOptions" />
                </div>
            </div>
        </div>

        <!-- 区块三：分析图表（两图等宽） -->
        <div class="charts-row two-col">
            <div class="chart-card">
                <div class="chart-header">
                    <BarChart3 :size="14" class="chart-icon" />
                    <span class="chart-title">机台合格率对比</span>
                </div>
                <div class="chart-wrap">
                    <Bar :data="machineChartData" :options="machineChartOptions" />
                </div>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <Activity :size="14" class="chart-icon" />
                    <span class="chart-title">降级原因帕累托图</span>
                    <span class="chart-subtitle">重点解决前几项可降低大部分降级率</span>
                </div>
                <div class="chart-wrap">
                    <Bar :data="paretoChartData" :options="paretoChartOptions" />
                </div>
            </div>
        </div>

        <!-- 区块四a：质量总览表格 -->
        <div class="section-card">
            <div class="section-header">
                <ClipboardList :size="15" class="section-icon" />
                <span class="section-title">质量总览</span>
                <span class="section-desc">各工序 × 车间产量与合格率汇总</span>
            </div>
            <table class="overview-table">
                <thead>
                    <tr>
                        <th>种类</th>
                        <th>车间</th>
                        <th>总产量 (kg)</th>
                        <th>不合格量 (kg)</th>
                        <th>合格率</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in overviewTableData" :key="row.key">
                        <td class="type-cell">{{ row.type }}</td>
                        <td>{{ row.workshop }}</td>
                        <td class="num-cell">{{ row.totalWeight.toLocaleString() }}</td>
                        <td class="num-cell nonconform-val">{{ row.nonconformWeight.toLocaleString() }}</td>
                        <td>
                            <div class="rate-cell">
                                <span
                                    :class="['rate-val', row.rate >= 80 ? 'rate-good' : row.rate >= 60 ? 'rate-warn' : 'rate-bad']">
                                    {{ row.rate }}%
                                </span>
                                <div class="rate-bar-wrap">
                                    <div class="rate-bar"
                                        :style="{ width: row.rate + '%', background: row.rate >= 80 ? '#10b981' : row.rate >= 60 ? '#f59e0b' : '#ef4444' }">
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2">合计</td>
                        <td class="num-cell">{{ overviewTotal.totalWeight.toLocaleString() }}</td>
                        <td class="num-cell nonconform-val">{{ overviewTotal.nonconformWeight.toLocaleString() }}</td>
                        <td class="rate-val"
                            :class="overviewTotal.rate >= 80 ? 'rate-good' : overviewTotal.rate >= 60 ? 'rate-warn' : 'rate-bad'">
                            {{ overviewTotal.rate }}%
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- 区块四b：降级原因分类明细 -->
        <div class="section-card">
            <div class="section-header">
                <Layers :size="15" class="section-icon" />
                <span class="section-title">降级原因分类明细</span>
                <span class="section-desc">按坯料原因 / 铝箔原因分组，一期 vs 二期对比</span>
            </div>
            <div class="defect-breakdown-row">
                <!-- 一期 -->
                <div class="defect-breakdown-col">
                    <div class="breakdown-period-label">一期</div>
                    <table class="breakdown-table">
                        <thead>
                            <tr>
                                <th>降级原因</th>
                                <th>次数</th>
                                <th>占比</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(group, gIdx) in breakdownData['一期']" :key="gIdx">
                                <tr class="group-header-row">
                                    <td colspan="3">
                                        <span
                                            :class="['group-badge', group.category === '坯料原因' ? 'badge-raw' : 'badge-foil']">
                                            {{ group.category }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-for="item in group.items" :key="item.name" class="breakdown-item-row">
                                    <td class="defect-name">{{ item.name }}</td>
                                    <td class="num-cell">{{ item.count }}</td>
                                    <td>
                                        <div class="breakdown-rate-wrap">
                                            <div class="breakdown-bar" :style="{ width: (item.pct * 2) + 'px' }"></div>
                                            <span class="breakdown-pct">{{ item.pct }}%</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr class="subtotal-row">
                                    <td>小计</td>
                                    <td class="num-cell">{{group.items.reduce((s, i) => s + i.count, 0)}}</td>
                                    <td class="subtotal-pct">{{group.items.reduce((s, i) => s + i.pct, 0).toFixed(1)
                                        }}%</td>
                                </tr>
                            </template>
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td>总计</td>
                                <td class="num-cell">{{ breakdownTotals['一期'] }}</td>
                                <td>100%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <!-- 二期 -->
                <div class="defect-breakdown-col">
                    <div class="breakdown-period-label">二期</div>
                    <table class="breakdown-table">
                        <thead>
                            <tr>
                                <th>降级原因</th>
                                <th>次数</th>
                                <th>占比</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(group, gIdx) in breakdownData['二期']" :key="gIdx">
                                <tr class="group-header-row">
                                    <td colspan="3">
                                        <span
                                            :class="['group-badge', group.category === '坯料原因' ? 'badge-raw' : 'badge-foil']">
                                            {{ group.category }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-for="item in group.items" :key="item.name" class="breakdown-item-row">
                                    <td class="defect-name">{{ item.name }}</td>
                                    <td class="num-cell">{{ item.count }}</td>
                                    <td>
                                        <div class="breakdown-rate-wrap">
                                            <div class="breakdown-bar" :style="{ width: (item.pct * 2) + 'px' }"></div>
                                            <span class="breakdown-pct">{{ item.pct }}%</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr class="subtotal-row">
                                    <td>小计</td>
                                    <td class="num-cell">{{group.items.reduce((s, i) => s + i.count, 0)}}</td>
                                    <td class="subtotal-pct">{{group.items.reduce((s, i) => s + i.pct, 0).toFixed(1)
                                        }}%</td>
                                </tr>
                            </template>
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td>总计</td>
                                <td class="num-cell">{{ breakdownTotals['二期'] }}</td>
                                <td>100%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    BarChart3, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle,
    Database, X, PackageX, Scale, Users, Activity,
    ClipboardList, Layers,
} from 'lucide-vue-next'
import { Line, Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    LineElement, BarElement, PointElement,
    CategoryScale, LinearScale, Tooltip, Legend, Filler,
} from 'chart.js'

// 模块化引入：composable + 子组件
import { useQualityStats } from '../composables/useQualityStats'
import CustomerMultiSelect from '../components/quality/CustomerMultiSelect.vue'

// 注册 Chart.js 组件
ChartJS.register(LineElement, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

// 全部逻辑由 Composable 提供
const {
    filters, hasActiveFilter, resetFilters,
    customerOptions, filteredList,
    totalWeight, nonconformWeight, firstPassYield,
    concessionRate, downgradeRate,
    fpyTrend, concessionTrend, downgradeTrend,
    selectedChartCustomers, chartCustomerOptions,
    trendChartData, trendChartOptions,
    customerTrendData, customerTrendOptions,

    machineChartData, machineChartOptions,
    paretoChartData, paretoChartOptions,
    overviewTableData, overviewTotal,
    breakdownData, breakdownTotals,
} = useQualityStats()
</script>

<style scoped>
/* ─── 页面容器 ─────────────────────────────────────────── */
.stats-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* padding: 1.1rem 1.25rem; */
    /* height: 100%; */
    /* overflow-y: auto; */
    background: var(--bg-main);
}

/* ─── 页面头部 ─────────────────────────────────────────── */
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    background: var(--bg-surface);
    border-radius: var(--radius-lg);
    padding: 0.85rem 1.1rem;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
}

.header-icon {
    color: var(--primary-color);
}

.page-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-main);
    font-family: var(--font-display);
}

.page-subtitle {
    font-size: 0.72rem;
    color: var(--text-muted);
    margin-top: 0.1rem;
}

.filter-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
}

.filter-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.filter-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    white-space: nowrap;
}

.date-input,
.select-input {
    height: 30px;
    padding: 0 0.5rem;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    font-size: 0.78rem;
    font-family: inherit;
    color: var(--text-main);
    background: var(--bg-main);
    outline: none;
    cursor: pointer;
}

.date-input {
    width: 120px;
}

.select-input {
    min-width: 90px;
}

.date-input:focus,
.select-input:focus {
    border-color: var(--primary-color);
}

.filter-divider {
    width: 1px;
    height: 18px;
    background: var(--border-light);
    margin: 0 0.2rem;
}

.btn-reset {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    cursor: pointer;
    background: transparent;
    transition: all 0.15s;
}

.btn-reset:hover {
    border-color: var(--border-medium);
    color: var(--text-main);
}

/* ─── KPI 卡片 ─────────────────────────────────────────── */
.kpi-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.75rem;
}

.kpi-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 0.85rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s, transform 0.2s;
}

.kpi-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
}

.kpi-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.blue-bg {
    background: rgba(37, 99, 235, 0.1);
    color: #2563eb;
}

.green-bg {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.orange-bg {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
}

.red-bg {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.kpi-body {
    flex: 1;
    min-width: 0;
}

.kpi-value-row {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    flex-wrap: wrap;
}

.kpi-value {
    font-size: 1.35rem;
    font-weight: 700;
    font-family: var(--font-display);
    color: var(--text-main);
    line-height: 1;
}

.kpi-value small {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--text-muted);
    margin-left: 1px;
}

.kpi-trend {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: var(--radius-full);
}

.trend-up-good {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
}

.trend-down-bad {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
}

.kpi-label {
    font-size: 0.72rem;
    color: var(--text-muted);
    display: block;
    margin-top: 0.25rem;
}

/* ─── 图表区域 ─────────────────────────────────────────── */
.charts-row {
    display: grid;
    gap: 0.75rem;
}

.two-col {
    grid-template-columns: 1fr 1fr;
}

.three-col {
    grid-template-columns: 1fr 1fr 1fr;
}

.chart-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-sm);
}

.chart-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.65rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-light);
}

.chart-icon {
    color: var(--primary-color);
    flex-shrink: 0;
}

.chart-title {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-main);
}

.chart-subtitle {
    font-size: 0.68rem;
    color: var(--text-muted);
    margin-left: auto;
}

.chart-wrap {
    flex: 1;
    min-height: 180px;
    position: relative;
}

/* ─── 区块 section ─────────────────────────────────────── */
.section-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 0.85rem 1rem;
    box-shadow: var(--shadow-sm);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.55rem;
    border-bottom: 1px solid var(--border-light);
}

.section-icon {
    color: var(--primary-color);
    flex-shrink: 0;
}

.section-title {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--text-main);
}

.section-desc {
    font-size: 0.72rem;
    color: var(--text-muted);
    margin-left: auto;
}

/* ─── 质量总览表格 ─────────────────────────────────────── */
.overview-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
}

.overview-table th {
    background: var(--bg-main);
    color: var(--text-muted);
    font-weight: 500;
    font-size: 0.75rem;
    text-align: left;
    padding: 0.45rem 0.75rem;
    border-bottom: 1px solid var(--border-light);
}

.overview-table td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--border-light);
    color: var(--text-main);
}

.overview-table tr:last-child td {
    border-bottom: none;
}

.overview-table tr:hover td {
    background: var(--bg-hover);
}

.type-cell {
    font-weight: 500;
}

.num-cell {
    font-family: var(--font-mono);
    font-size: 0.8rem;
}

.nonconform-val {
    color: #ef4444;
}

.rate-cell {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.rate-val {
    font-weight: 600;
    font-size: 0.8rem;
    min-width: 38px;
}

.rate-good {
    color: #10b981;
}

.rate-warn {
    color: #f59e0b;
}

.rate-bad {
    color: #ef4444;
}

.rate-bar-wrap {
    flex: 1;
    height: 5px;
    background: var(--border-light);
    border-radius: 99px;
    overflow: hidden;
}

.rate-bar {
    height: 100%;
    border-radius: 99px;
    transition: width 0.4s ease;
}

tfoot .total-row td {
    font-weight: 600;
    background: var(--bg-main);
    border-top: 1px solid var(--border-medium);
    border-bottom: none;
}

/* ─── 降级原因明细 ─────────────────────────────────────── */
.defect-breakdown-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
}

.defect-breakdown-col {
    min-width: 0;
}

.breakdown-period-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-secondary);
    padding: 0.3rem 0.5rem;
    background: var(--bg-main);
    border-radius: var(--radius-sm);
    display: inline-block;
    margin-bottom: 0.5rem;
}

.breakdown-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
}

.breakdown-table th {
    background: var(--bg-main);
    color: var(--text-muted);
    font-weight: 500;
    font-size: 0.72rem;
    padding: 0.35rem 0.6rem;
    text-align: left;
    border-bottom: 1px solid var(--border-light);
}

.breakdown-table td {
    padding: 0.35rem 0.6rem;
    border-bottom: 1px solid rgba(226, 232, 240, 0.5);
    color: var(--text-main);
}

.group-header-row td {
    padding: 0.4rem 0.6rem 0.3rem;
    background: transparent;
    border-bottom: none;
}

.group-badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius-full);
}

.badge-raw {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

.badge-foil {
    background: rgba(37, 99, 235, 0.1);
    color: #2563eb;
}

.breakdown-item-row td {
    padding: 0.3rem 0.6rem 0.3rem 1rem;
}

.defect-name {
    color: var(--text-secondary);
}

.breakdown-rate-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.breakdown-bar {
    height: 5px;
    background: #6366f1;
    border-radius: 99px;
    min-width: 2px;
    flex-shrink: 0;
}

.breakdown-pct {
    font-size: 0.75rem;
    color: var(--text-secondary);
    white-space: nowrap;
}

.subtotal-row td {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.78rem;
    border-top: 1px solid var(--border-light);
    background: var(--bg-main);
    padding: 0.35rem 0.6rem;
}

.subtotal-pct {
    font-weight: 700;
    color: var(--text-main);
}

.breakdown-table tfoot .total-row td {
    font-weight: 700;
    background: var(--bg-main);
    border-top: 1px solid var(--border-medium);
    border-bottom: none;
}


/* ─── 客户趋势图：多选下拉 ──────────────────────── */
.customer-multi-select {
    margin-left: auto;
    position: relative;
}

.cms-trigger {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    height: 26px;
    padding: 0 0.55rem;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-family: inherit;
    color: var(--text-secondary);
    background: var(--bg-main);
    cursor: pointer;
    transition: border-color 0.15s;
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
}

.cms-trigger:hover {
    border-color: var(--primary-color);
}

.cms-label {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
    display: block;
}

.cms-arrow {
    font-size: 0.6rem;
    color: var(--text-muted);
    flex-shrink: 0;
}

.cms-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 140px;
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    z-index: 200;
    padding: 0.35rem 0;
    max-height: 220px;
    overflow-y: auto;
}

.cms-item {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.35rem 0.65rem;
    font-size: 0.78rem;
    color: var(--text-main);
    cursor: pointer;
    transition: background 0.1s;
}

.cms-item:hover {
    background: var(--bg-hover);
}

.cms-item input[type='checkbox'] {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    cursor: pointer;
    accent-color: var(--primary-color);
}

.cms-all {
    font-weight: 500;
    border-bottom: 1px solid var(--border-light);
    margin-bottom: 0.2rem;
    padding-bottom: 0.45rem;
}

.cms-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
</style>
