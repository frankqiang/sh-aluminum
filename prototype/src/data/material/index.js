// 物料管理模块 mock 数据统一入口
// 用法：import { materialCoils, warehouseZones, ... } from '@/data/material/index.js'
//      或：import { materialCoils } from '@/data/material'

export { warehouseZones, staleThresholds } from './zones.js'
export { warehouseFrames } from './frames.js'
export { coilStatuses } from './statuses.js'
export { coilsSlitting } from './coils-slitting.js'
export { coilsRolling } from './coils-rolling.js'
export { coilsFinishing } from './coils-finishing.js'
export { recentMovements } from './movements.js'
export { materialStats } from './stats.js'

// 合并所有区域的料卷，提供统一的料卷列表
import { coilsSlitting } from './coils-slitting.js'
import { coilsRolling } from './coils-rolling.js'
import { coilsFinishing } from './coils-finishing.js'

export const materialCoils = [
    ...coilsSlitting,
    ...coilsRolling,
    ...coilsFinishing,
]
