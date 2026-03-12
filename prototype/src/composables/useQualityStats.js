import { ref, computed } from 'vue'
import {
    qualityCoilList,
    defectCategoryMap,
    machineWorkshopMap,
    internalWorkflows,
} from '../data/quality-review-data'

// ─── 调色盘 ───────────────────────────────────────────────────
export const chartColors = [
    '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
    '#84cc16', '#e11d48',
]

// 客户颜色：固定映射 + 调色盘兜底
export const CUSTOMER_PALETTE = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ef4444', '#ec4899', '#06b6d4', '#f97316',
]
export const customerColorMap = {
    '宁德时代': '#3b82f6',
    '河北兴恒': '#10b981',
    '弘力': '#f59e0b',
    '标兵': '#8b5cf6',
    '冠业': '#ef4444',
    '优箔': '#ec4899',
    '莱尔': '#06b6d4',
}
export function getCustomerColor(cust, idx) {
    return customerColorMap[cust] || CUSTOMER_PALETTE[idx % CUSTOMER_PALETTE.length]
}

// ─── 核心 Composable ──────────────────────────────────────────
export function useQualityStats() {

    // ── 数据源（已完成评审）────────────────────────────────────
    const completedList = computed(() =>
        qualityCoilList
            .filter(c => c.status === 'completed')
            .map(c => ({ ...c, workshop: machineWorkshopMap[c.machine] || '未知' }))
    )

    // ── 全局筛选 ──────────────────────────────────────────────
    const filters = ref({ dateFrom: '', dateTo: '', workshop: '', machine: '', customer: '' })
    const hasActiveFilter = computed(() => Object.values(filters.value).some(v => v !== ''))
    function resetFilters() {
        filters.value = { dateFrom: '', dateTo: '', workshop: '', machine: '', customer: '' }
    }

    // 客户选项（筛选栏用，排除内部工序）
    const customerOptions = computed(() => {
        const set = new Set(
            completedList.value
                .filter(c => !internalWorkflows.includes(c.customer))
                .map(c => c.customer)
        )
        return [...set].sort()
    })

    // 过滤后的主数据
    const filteredList = computed(() => {
        let result = completedList.value
        if (filters.value.dateFrom) {
            const from = new Date(filters.value.dateFrom)
            from.setHours(0, 0, 0, 0)
            result = result.filter(c => new Date(c.reviewTime) >= from)
        }
        if (filters.value.dateTo) {
            const to = new Date(filters.value.dateTo)
            to.setHours(23, 59, 59, 999)
            result = result.filter(c => new Date(c.reviewTime) <= to)
        }
        if (filters.value.workshop) result = result.filter(c => c.workshop === filters.value.workshop)
        if (filters.value.machine) result = result.filter(c => c.machine === filters.value.machine)
        if (filters.value.customer) result = result.filter(c => c.customer === filters.value.customer)
        return result
    })

    // ── KPI ───────────────────────────────────────────────────
    const totalWeight = computed(() =>
        Math.round(filteredList.value.reduce((s, c) => s + (c.entryData?.weight || 0), 0))
    )
    const nonconformWeight = computed(() =>
        Math.round(filteredList.value
            .filter(c => c.reviewData?.productGrade === 'B')
            .reduce((s, c) => s + (c.entryData?.weight || 0), 0))
    )
    const firstPassYield = computed(() => {
        const total = filteredList.value.length
        return total ? Math.round(filteredList.value.filter(c => c.entryData?.qualityJudgment === 'conform').length / total * 100) : 0
    })
    const concessionRate = computed(() => {
        const total = filteredList.value.length
        return total ? Math.round(filteredList.value.filter(c => ['让步放行', '沟通放行'].includes(c.reviewData?.mainConclusion)).length / total * 100) : 0
    })
    const downgradeRate = computed(() => {
        const total = filteredList.value.length
        return total ? Math.round(filteredList.value.filter(c => c.reviewData?.productGrade === 'B').length / total * 100) : 0
    })

    // 环比趋势（前半段 vs 后半段）
    const trendStats = computed(() => {
        const sorted = [...filteredList.value].sort((a, b) => new Date(a.reviewTime) - new Date(b.reviewTime))
        const mid = Math.floor(sorted.length / 2)
        if (!mid) return {}
        const prev = sorted.slice(0, mid)
        const curr = sorted.slice(mid)
        const rate = (list, fn) => list.length ? Math.round(list.filter(fn).length / list.length * 100) : 0
        return {
            fpyPrev: rate(prev, c => c.entryData?.qualityJudgment === 'conform'),
            fpyNow: rate(curr, c => c.entryData?.qualityJudgment === 'conform'),
            concPrev: rate(prev, c => ['让步放行', '沟通放行'].includes(c.reviewData?.mainConclusion)),
            concNow: rate(curr, c => ['让步放行', '沟通放行'].includes(c.reviewData?.mainConclusion)),
            dgPrev: rate(prev, c => c.reviewData?.productGrade === 'B'),
            dgNow: rate(curr, c => c.reviewData?.productGrade === 'B'),
        }
    })
    const fpyTrend = computed(() => trendStats.value.fpyPrev != null ? trendStats.value.fpyNow - trendStats.value.fpyPrev : null)
    const concessionTrend = computed(() => trendStats.value.concPrev != null ? trendStats.value.concNow - trendStats.value.concPrev : null)
    const downgradeTrend = computed(() => trendStats.value.dgPrev != null ? trendStats.value.dgNow - trendStats.value.dgPrev : null)

    // ── 图表数据：合格率趋势 ──────────────────────────────────
    const trendChartData = computed(() => {
        const dateMap = {}
        filteredList.value.forEach(c => {
            const d = c.reviewTime.slice(0, 10)
            if (!dateMap[d]) dateMap[d] = { total: 0, conform: 0, concession: 0 }
            dateMap[d].total++
            if (c.entryData?.qualityJudgment === 'conform') dateMap[d].conform++
            if (['让步放行', '沟通放行'].includes(c.reviewData?.mainConclusion)) dateMap[d].concession++
        })
        const dates = Object.keys(dateMap).sort()
        return {
            labels: dates.map(d => d.slice(5)),
            datasets: [
                {
                    label: '一次合格率',
                    data: dates.map(d => dateMap[d].total ? Math.round(dateMap[d].conform / dateMap[d].total * 100) : 0),
                    borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.07)',
                    fill: true, tension: 0.35, pointRadius: 4, pointHoverRadius: 6,
                    pointBackgroundColor: '#10b981', borderWidth: 2, clip: false,
                },
                {
                    label: '让步放行率',
                    data: dates.map(d => dateMap[d].total ? Math.round(dateMap[d].concession / dateMap[d].total * 100) : 0),
                    borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.06)',
                    fill: true, tension: 0.35, pointRadius: 4, pointHoverRadius: 6,
                    pointBackgroundColor: '#f59e0b', borderWidth: 2, borderDash: [4, 3], clip: false,
                },
            ]
        }
    })
    const trendChartOptions = {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { bottom: 6 } },
        plugins: {
            legend: { position: 'top', align: 'end', labels: { font: { size: 10, family: 'inherit' }, usePointStyle: true, padding: 10 } },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 8, cornerRadius: 6, callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}%` } },
        },
        scales: {
            y: { min: 0, max: 100, grace: '8%', ticks: { stepSize: 25, font: { size: 10 }, callback: v => v + '%' }, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } },
            x: { ticks: { font: { size: 10 } }, grid: { display: false }, border: { display: false } },
        },
    }

    // ── 图表数据：客户放行率趋势（支持多选） ──────────────────
    // 客户多选状态（外部传入，通过 prop/emit 或直接在 composable 中管理）
    const selectedChartCustomers = ref([])
    const showCustomerDropdown = ref(false)

    const chartCustomerOptions = computed(() => {
        const set = new Set(
            completedList.value
                .filter(c => !internalWorkflows.includes(c.customer))
                .map(c => c.customer)
        )
        return [...set].sort()
    })

    const customerTrendData = computed(() => {
        const terminalList = completedList.value.filter(c => !internalWorkflows.includes(c.customer))
        const allCustomers = [...new Set(terminalList.map(c => c.customer))].sort()
        const displayCustomers = selectedChartCustomers.value.length > 0
            ? [...selectedChartCustomers.value]
            : allCustomers

        const dateMap = {}
        terminalList.forEach(c => {
            if (!displayCustomers.includes(c.customer)) return
            const d = c.reviewTime.slice(0, 10)
            if (!dateMap[d]) dateMap[d] = {}
            if (!dateMap[d][c.customer]) dateMap[d][c.customer] = { total: 0, release: 0 }
            dateMap[d][c.customer].total++
            if (['正常处理', '让步放行', '沟通放行'].includes(c.reviewData?.mainConclusion)) {
                dateMap[d][c.customer].release++
            }
        })
        const dates = Object.keys(dateMap).sort()
        const isSingle = displayCustomers.length === 1
        return {
            labels: dates.map(d => d.slice(5)),
            datasets: displayCustomers.map((cust, idx) => {
                const color = getCustomerColor(cust, idx)
                return {
                    label: cust,
                    data: dates.map(d => {
                        const s = dateMap[d]?.[cust]
                        return s?.total ? Math.round(s.release / s.total * 100) : null
                    }),
                    borderColor: color,
                    backgroundColor: isSingle ? `${color}18` : 'transparent',
                    fill: isSingle,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: color,
                    borderWidth: 2,
                    spanGaps: true,
                    clip: false,
                }
            })
        }
    })

    const customerTrendOptions = {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 8, bottom: 4 } },
        plugins: {
            legend: { position: 'bottom', align: 'center', labels: { font: { size: 10, family: 'inherit' }, usePointStyle: true, pointStyleWidth: 14, padding: 10 } },
            tooltip: {
                backgroundColor: 'rgba(15,23,42,0.9)', padding: 8, cornerRadius: 6,
                callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y != null ? ctx.parsed.y + '%' : '无数据'}` },
            },
        },
        scales: {
            y: { min: 0, max: 100, grace: '8%', ticks: { stepSize: 25, font: { size: 10 }, callback: v => v + '%' }, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } },
            x: { ticks: { font: { size: 10 } }, grid: { display: false }, border: { display: false } },
        },
    }

    // ── 图表数据：缺陷分布环形图 ──────────────────────────────
    const defectChartData = computed(() => {
        const counts = {}
        filteredList.value.forEach(c => {
            (c.entryData?.defectReasons || []).forEach(d => { counts[d] = (counts[d] || 0) + 1 })
        })
        const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
        return {
            labels,
            datasets: [{ data: labels.map(l => counts[l]), backgroundColor: labels.map((_, i) => chartColors[i % chartColors.length]), borderWidth: 0, hoverOffset: 6 }]
        }
    })
    const defectChartOptions = {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 10, family: 'inherit' }, padding: 8, usePointStyle: true } },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 8, cornerRadius: 6, callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed} 次 (${Math.round(ctx.parsed / ctx.dataset.data.reduce((a, b) => a + b, 0) * 100)}%)` } },
        },
    }

    // ── 图表数据：机台合格率对比 ──────────────────────────────
    const machineChartData = computed(() => {
        const machines = ['1#', '2#', '4#', '5#']
        const rates = machines.map(m => {
            const list = filteredList.value.filter(c => c.machine === m)
            return list.length ? Math.round(list.filter(c => c.entryData?.qualityJudgment === 'conform').length / list.length * 100) : 0
        })
        return {
            labels: machines,
            datasets: [{
                label: '一次合格率', data: rates,
                backgroundColor: rates.map(r => r >= 60 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.18)'),
                borderColor: rates.map(r => r >= 60 ? '#10b981' : '#ef4444'),
                borderWidth: 1.5, borderRadius: 4,
            }]
        }
    })
    const machineChartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 8, cornerRadius: 6, callbacks: { label: ctx => `合格率: ${ctx.parsed.y}%` } },
        },
        scales: {
            y: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 10 }, callback: v => v + '%' }, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } },
            x: { ticks: { font: { size: 10 } }, grid: { display: false }, border: { display: false } },
        },
    }

    // ── 图表数据：帕累托图 ────────────────────────────────────
    const paretoChartData = computed(() => {
        const counts = {}
        filteredList.value.forEach(c => {
            (c.entryData?.defectReasons || []).forEach(d => { counts[d] = (counts[d] || 0) + 1 })
        })
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
        const total = sorted.reduce((s, [, v]) => s + v, 0)
        let cumulative = 0
        const cumulativePct = sorted.map(([, v]) => {
            cumulative += v
            return total ? Math.round(cumulative / total * 100) : 0
        })
        return {
            labels: sorted.map(([k]) => k),
            datasets: [
                { type: 'bar', label: '出现次数', data: sorted.map(([, v]) => v), backgroundColor: sorted.map((_, i) => chartColors[i % chartColors.length]), borderRadius: 3, yAxisID: 'y', order: 2 },
                { type: 'line', label: '累计占比', data: cumulativePct, borderColor: '#ef4444', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#ef4444', tension: 0, yAxisID: 'y2', order: 1, clip: false },
            ]
        }
    })
    const paretoChartOptions = {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { position: 'top', align: 'end', labels: { font: { size: 10, family: 'inherit' }, usePointStyle: true, padding: 8 } },
            tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 8, cornerRadius: 6 },
        },
        scales: {
            // grace 让 y 轴最大值上方留出 15% 的缓冲空间
            y: { beginAtZero: true, grace: '15%', ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, title: { display: true, text: '次数', font: { size: 10 } } },
            y2: { position: 'right', min: 0, max: 100, ticks: { font: { size: 10 }, callback: v => v + '%' }, grid: { display: false }, border: { display: false } },
            x: { ticks: { font: { size: 10 } }, grid: { display: false }, border: { display: false } },
        },
    }

    // ── 表格：质量总览 ────────────────────────────────────────
    const overviewTableData = computed(() => {
        const workshops = ['一期', '二期']
        const rows = []
        workshops.forEach(ws => {
            const list = filteredList.value.filter(c => c.workshop === ws)
            const totalW = Math.round(list.reduce((s, c) => s + (c.entryData?.weight || 0), 0))
            const ncW = Math.round(list.filter(c => c.reviewData?.productGrade === 'B').reduce((s, c) => s + (c.entryData?.weight || 0), 0))
            const rate = totalW ? Math.round((totalW - ncW) / totalW * 100) : 0
            rows.push({ key: ws, type: '电池箔母卷', workshop: ws, totalWeight: totalW, nonconformWeight: ncW, rate })
        })
        return rows
    })
    const overviewTotal = computed(() => {
        const tw = overviewTableData.value.reduce((s, r) => s + r.totalWeight, 0)
        const nw = overviewTableData.value.reduce((s, r) => s + r.nonconformWeight, 0)
        return { totalWeight: tw, nonconformWeight: nw, rate: tw ? Math.round((tw - nw) / tw * 100) : 0 }
    })

    // ── 表格：降级原因分类明细 ────────────────────────────────
    const breakdownData = computed(() => {
        const workshops = ['一期', '二期']
        const categories = ['坯料原因', '铝箔原因']
        const result = {}
        workshops.forEach(ws => {
            const list = filteredList.value.filter(c => c.workshop === ws && c.reviewData?.productGrade === 'B')
            const totalDefects = list.reduce((s, c) => s + (c.entryData?.defectReasons?.length || 0), 0)
            result[ws] = categories.map(cat => {
                const itemCounts = {}
                list.forEach(c => {
                    (c.entryData?.defectReasons || []).forEach(d => {
                        if ((defectCategoryMap[d] || '铝箔原因') === cat) {
                            itemCounts[d] = (itemCounts[d] || 0) + 1
                        }
                    })
                })
                const items = Object.entries(itemCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => ({ name, count, pct: totalDefects ? parseFloat((count / totalDefects * 100).toFixed(1)) : 0 }))
                return { category: cat, items }
            })
        })
        return result
    })
    const breakdownTotals = computed(() => {
        const result = {}
            ;['一期', '二期'].forEach(ws => {
                result[ws] = filteredList.value
                    .filter(c => c.workshop === ws && c.reviewData?.productGrade === 'B')
                    .reduce((s, c) => s + (c.entryData?.defectReasons?.length || 0), 0)
            })
        return result
    })

    return {
        // 筛选
        filters, hasActiveFilter, resetFilters,
        customerOptions, filteredList,
        // KPI
        totalWeight, nonconformWeight, firstPassYield,
        concessionRate, downgradeRate,
        fpyTrend, concessionTrend, downgradeTrend,
        // 客户趋势图状态
        selectedChartCustomers, showCustomerDropdown, chartCustomerOptions,
        // 图表数据 & 配置
        trendChartData, trendChartOptions,
        customerTrendData, customerTrendOptions,
        defectChartData, defectChartOptions,
        machineChartData, machineChartOptions,
        paretoChartData, paretoChartOptions,
        // 表格数据
        overviewTableData, overviewTotal,
        breakdownData, breakdownTotals,
    }
}
