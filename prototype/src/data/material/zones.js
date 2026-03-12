// 库位区域定义（按工序划分）
// rows/cols 对应现场地面实际喷涂的物理库位坐标
// 每个 (row, col) 组合 = 一个有编号的地面垛位，可放一垛料框（多层叠放）
export const warehouseZones = [
    {
        id: 'slitting',
        name: '分切区',
        rows: ['A', 'B', 'C', 'D'],
        cols: 10,
        description: '分切机旁存放区，待精切的子卷存放于此',
        color: '#3b82f6',
    },
    {
        id: 'rolling',
        name: '轧机区',
        rows: ['A', 'B', 'C'],
        cols: 8,
        description: '轧机旁备料架，待分切的轧制成品存放于此',
        color: '#8b5cf6',
    },
    {
        id: 'finishing',
        name: '精切区',
        rows: ['A', 'B', 'C'],
        cols: 10,
        description: '精切机旁存放区，待精切或精切完成等待包装的料卷',
        color: '#10b981',
    },
]

// 呆滞预警阈值（单位：天）
// daysStayed < normal              → 绿色（正常）
// normal  ≤ daysStayed < warning   → 黄色（注意）
// warning ≤ daysStayed < stale     → 橙色（超期）
// daysStayed ≥ stale               → 红色（呆滞）
export const staleThresholds = {
    normal: 3,
    warning: 7,
    stale: 14,
}
