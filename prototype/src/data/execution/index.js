/**
 * 生产执行模块 — 统一数据导出入口
 * 将订单基础数据与详情数据合并后导出完整订单对象
 */

import { executionOrders } from './orders.js'
import { orderCoils } from './coils.js'
import { orderTimelines } from './timelines.js'
import { orderTraceability } from './traceability.js'

/**
 * 完整订单列表：订单基础信息 + 关联料卷 + 时间线 + 追溯链
 */
export const fullOrders = executionOrders.map(order => ({
    ...order,
    linkedCoils: orderCoils[order.id] || [],
    timeline: orderTimelines[order.id] || [],
    traceability: orderTraceability[order.id] || null,
}))

// 重导出各子模块，方便按需引用
export { executionOrders } from './orders.js'
export { orderCoils } from './coils.js'
export { orderTimelines } from './timelines.js'
export { orderTraceability } from './traceability.js'
export {
    executionStats,
    statusDistribution,
    processDistribution,
    customerSummary,
    recentCompleted,
    deliveryWarnings,
} from './stats.js'
