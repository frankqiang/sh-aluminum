/**
 * 排产模块原型 — 模拟数据统一入口
 * 数据来源：神火新材调研文档真实数据
 *
 * 模块拆分说明：
 *   mock.machines.js    - 轧机/分切机台设备定义
 *   mock.rolling.js     - 轧机排产计划（增强字段）
 *   mock.slitting.js    - 分切排产计划
 *   mock.production.js  - 精切计划、订单、在制品、产能平衡、Dashboard
 */

export { rollingMachines, slittingMachines } from './mock.machines.js'
export { rollingPlans } from './mock.rolling.js'
export { slittingPlans } from './mock.slitting.js'
export {
  finishingPlans,
  finishingMachines,
  precisionPlans,
  orders,
  changeLogs,
  capacityBalance,
  dashboardStats,
} from './mock.production.js'
