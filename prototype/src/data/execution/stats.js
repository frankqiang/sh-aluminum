/**
 * 生产执行模块 — 看板统计数据
 * 基于 orders.js 动态计算，保持数据一致性
 */

import { executionOrders } from './orders.js'
import { orderCoils } from './coils.js'

// ── 基础统计 ────────────────────────────────────────────────────

export const executionStats = {
    activeOrders: executionOrders.filter(o => o.status === 'producing').length,
    overdueOrders: executionOrders.filter(o => o.isOverdue).length,
    dueSoon: executionOrders.filter(o => !o.isOverdue && o.daysUntilDelivery >= 1 && o.daysUntilDelivery <= 3 && o.status !== 'completed').length,
    onTimeRate: (() => {
        const completed = executionOrders.filter(o => o.status === 'completed')
        const onTime = completed.filter(o => !o.isOverdue)
        return completed.length > 0 ? Math.round(onTime.length / completed.length * 100) : 0
    })(),
    completedThisMonth: executionOrders.filter(o => o.status === 'completed').length,
    producingOrders: executionOrders.filter(o => o.status === 'producing').length,
}

// ── 状态分布（用于环形图）───────────────────────────────────────
//
// 订单状态说明（对应铝箔生产实际业务流程）：
//   pending   → 【待排产】订单已从ERP进入系统，但尚未安排轧机生产计划
//               真实判断依据：订单池中"已分切卷数"为0，无关联料卷
//   producing → 【生产中】至少有一道工序（轧机/分切/精切）已开始执行
//               覆盖从"第一卷胚料上机"到"最后一卷精切完成"的整个在制周期
//   packing   → 【待包装】所有精切子卷已完成，正在包装/等待包装入库
//   completed → 【已完成】包装完成并已向ERP回报，订单关闭

export const statusDistribution = {
    pending: executionOrders.filter(o => o.status === 'pending').length,
    producing: executionOrders.filter(o => o.status === 'producing').length,
    packing: executionOrders.filter(o => o.status === 'packing').length,
    completed: executionOrders.filter(o => o.status === 'completed').length,
}

// ── 工序分布（用于堆叠柱状图）——从料卷数据动态计算 ─────────

const buildProcessDistribution = () => {
    const result = {
        rolling: { active: 0, completed: 0 },
        slitting: { active: 0, completed: 0 },
        finishing: { active: 0, completed: 0 },
    }
    // 遍历全订单的料卷，按 stage 归类
    Object.values(orderCoils).forEach(coils => {
        coils.forEach(c => {
            if (c.stage === 'rolling') result.rolling.active++
            if (c.stage === 'slitting') result.slitting.active++
            if (c.stage === 'finishing') result.finishing.active++
            // 已完成的卷，各工序都已经历过
            if (c.stage === 'completed' || c.stage === 'packing') {
                result.rolling.completed++
                result.slitting.completed++
                result.finishing.completed++
            }
        })
    })
    return result
}

export const processDistribution = buildProcessDistribution()

// ── 客户维度汇总 ────────────────────────────────────────────────

const buildCustomerSummary = () => {
    const map = {}
    executionOrders.forEach(o => {
        if (!map[o.customer]) {
            map[o.customer] = { customer: o.customer, total: 0, producing: 0, completed: 0, overdue: 0 }
        }
        map[o.customer].total++
        if (o.status === 'producing' || o.status === 'packing') map[o.customer].producing++
        if (o.status === 'completed') map[o.customer].completed++
        if (o.isOverdue) map[o.customer].overdue++
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
}

export const customerSummary = buildCustomerSummary()

// ── 近期完成订单 ────────────────────────────────────────────────
// 取最近完成的6条，展示在看板右下角
// 字段说明：
//   spec      → 厚度×宽度（μm × mm），如 "12×800"
//   alloy     → 合金牌号，如 1060、1100、1235D
//   totalCoils→ 订单总卷数（完成时100%等于completedCoils）

export const recentCompleted = executionOrders
    .filter(o => o.status === 'completed' && o.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 6)
    .map(o => ({
        orderNo: o.orderNo,
        customer: o.customer,
        spec: `${o.thickness}×${o.width}`,
        alloy: o.alloy,
        totalCoils: o.totalCoils,
        totalWeight: o.totalWeight,
        product: o.product,
        completedAt: o.completedAt,
    }))

// ── 交期预警列表 ────────────────────────────────────────────────
// 包含：已逾期 + 3天内到期，按紧急程度排序

export const deliveryWarnings = executionOrders
    .filter(o => o.status !== 'completed' && (o.isOverdue || o.daysUntilDelivery <= 3))
    .sort((a, b) => a.daysUntilDelivery - b.daysUntilDelivery)
    .map(o => ({
        ...o,
        urgencyLevel: o.isOverdue ? 'critical' : o.daysUntilDelivery <= 1 ? 'critical' : 'warning',
        progressPct: o.totalCoils > 0 ? Math.round(o.completedCoils / o.totalCoils * 100) : 0,
    }))
