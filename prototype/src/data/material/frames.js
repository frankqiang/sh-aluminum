// 料框 mock 数据
// 位置模型：区域（zone）→ 库位（row + col，地面喷涂标记） → 料框（frameNo，框上喷涂编号） → 层（stackLevel）
// 同一库位的多个料框叠放成一垛（共享相同的 row/col/stackId）
// stackLevel: 1=底层（最难取），越大越容易取；stackTotal: 该垛总层数

export const warehouseFrames = [

    // ════════════════════════════════════════════════════════
    // 分切区 (slitting)  4行(A-D) × 10列  = 40个库位
    // ════════════════════════════════════════════════════════

    // 库位 A-1（3层垛）
    { frameId: 'F3191', frameNo: '3191', zone: 'slitting', row: 'A', col: 1, stackId: 'STK-S01', stackLevel: 1, stackTotal: 3 },
    { frameId: 'F3192', frameNo: '3192', zone: 'slitting', row: 'A', col: 1, stackId: 'STK-S01', stackLevel: 2, stackTotal: 3 },
    { frameId: 'F3193', frameNo: '3193', zone: 'slitting', row: 'A', col: 1, stackId: 'STK-S01', stackLevel: 3, stackTotal: 3 },

    // 库位 A-2（2层垛）
    { frameId: 'F3194', frameNo: '3194', zone: 'slitting', row: 'A', col: 2, stackId: 'STK-S02', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F3195', frameNo: '3195', zone: 'slitting', row: 'A', col: 2, stackId: 'STK-S02', stackLevel: 2, stackTotal: 2 },

    // 库位 A-3（2层垛）
    { frameId: 'F3196', frameNo: '3196', zone: 'slitting', row: 'A', col: 3, stackId: 'STK-S03', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F3197', frameNo: '3197', zone: 'slitting', row: 'A', col: 3, stackId: 'STK-S03', stackLevel: 2, stackTotal: 2 },

    // 库位 A-4：空位（无料框）

    // 库位 A-5（3层垛）
    { frameId: 'F3198', frameNo: '3198', zone: 'slitting', row: 'A', col: 5, stackId: 'STK-S04', stackLevel: 1, stackTotal: 3 },
    { frameId: 'F3199', frameNo: '3199', zone: 'slitting', row: 'A', col: 5, stackId: 'STK-S04', stackLevel: 2, stackTotal: 3 },
    { frameId: 'F3200', frameNo: '3200', zone: 'slitting', row: 'A', col: 5, stackId: 'STK-S04', stackLevel: 3, stackTotal: 3 },

    // 库位 A-6（2层垛）
    { frameId: 'F3201', frameNo: '3201', zone: 'slitting', row: 'A', col: 6, stackId: 'STK-S05', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F3202', frameNo: '3202', zone: 'slitting', row: 'A', col: 6, stackId: 'STK-S05', stackLevel: 2, stackTotal: 2 },

    // 库位 A-7（2层垛）
    { frameId: 'F3203', frameNo: '3203', zone: 'slitting', row: 'A', col: 7, stackId: 'STK-S06', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F3204', frameNo: '3204', zone: 'slitting', row: 'A', col: 7, stackId: 'STK-S06', stackLevel: 2, stackTotal: 2 },

    // 库位 A-8：空位

    // 库位 A-9（1层，空框演示）
    { frameId: 'F3205', frameNo: '3205', zone: 'slitting', row: 'A', col: 9, stackId: 'STK-S07', stackLevel: 1, stackTotal: 1 },

    // 库位 A-10（2层垛）
    { frameId: 'F3206', frameNo: '3206', zone: 'slitting', row: 'A', col: 10, stackId: 'STK-S08', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F3207', frameNo: '3207', zone: 'slitting', row: 'A', col: 10, stackId: 'STK-S08', stackLevel: 2, stackTotal: 2 },

    // 库位 B-1（1层，空框演示）
    { frameId: 'F3208', frameNo: '3208', zone: 'slitting', row: 'B', col: 1, stackId: 'STK-S09', stackLevel: 1, stackTotal: 1 },

    // 库位 B-2（2层垛）
    { frameId: 'F3209', frameNo: '3209', zone: 'slitting', row: 'B', col: 2, stackId: 'STK-S10', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F3210', frameNo: '3210', zone: 'slitting', row: 'B', col: 2, stackId: 'STK-S10', stackLevel: 2, stackTotal: 2 },

    // B-3 ~ D-10：空位（无料框，模拟现场部分区域有料部分空置）

    // ════════════════════════════════════════════════════════
    // 轧机区 (rolling)  3行(A-C) × 8列  = 24个库位
    // ════════════════════════════════════════════════════════

    // 库位 A-1（2层垛）
    { frameId: 'F2001', frameNo: '2001', zone: 'rolling', row: 'A', col: 1, stackId: 'STK-R01', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F2002', frameNo: '2002', zone: 'rolling', row: 'A', col: 1, stackId: 'STK-R01', stackLevel: 2, stackTotal: 2 },

    // 库位 A-2（2层垛）
    { frameId: 'F2003', frameNo: '2003', zone: 'rolling', row: 'A', col: 2, stackId: 'STK-R02', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F2004', frameNo: '2004', zone: 'rolling', row: 'A', col: 2, stackId: 'STK-R02', stackLevel: 2, stackTotal: 2 },

    // 库位 A-3：空位

    // 库位 A-4（1层）
    { frameId: 'F2005', frameNo: '2005', zone: 'rolling', row: 'A', col: 4, stackId: 'STK-R03', stackLevel: 1, stackTotal: 1 },

    // 库位 A-5：空位

    // 库位 A-6（2层垛）
    { frameId: 'F2006', frameNo: '2006', zone: 'rolling', row: 'A', col: 6, stackId: 'STK-R04', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F2007', frameNo: '2007', zone: 'rolling', row: 'A', col: 6, stackId: 'STK-R04', stackLevel: 2, stackTotal: 2 },

    // 库位 A-7：空位

    // 库位 A-8（1层，空框演示）
    { frameId: 'F2008', frameNo: '2008', zone: 'rolling', row: 'A', col: 8, stackId: 'STK-R05', stackLevel: 1, stackTotal: 1 },

    // B-1 ~ C-8：空位

    // ════════════════════════════════════════════════════════
    // 精切区 (finishing)  3行(A-C) × 10列  = 30个库位
    // ════════════════════════════════════════════════════════

    // 库位 A-1（2层垛）
    { frameId: 'F4001', frameNo: '4001', zone: 'finishing', row: 'A', col: 1, stackId: 'STK-F01', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F4002', frameNo: '4002', zone: 'finishing', row: 'A', col: 1, stackId: 'STK-F01', stackLevel: 2, stackTotal: 2 },

    // 库位 A-2（2层垛）
    { frameId: 'F4003', frameNo: '4003', zone: 'finishing', row: 'A', col: 2, stackId: 'STK-F02', stackLevel: 1, stackTotal: 2 },
    { frameId: 'F4004', frameNo: '4004', zone: 'finishing', row: 'A', col: 2, stackId: 'STK-F02', stackLevel: 2, stackTotal: 2 },

    // 库位 A-3（1层）
    { frameId: 'F4005', frameNo: '4005', zone: 'finishing', row: 'A', col: 3, stackId: 'STK-F03', stackLevel: 1, stackTotal: 1 },

    // 库位 A-4（1层，空框演示）
    { frameId: 'F4006', frameNo: '4006', zone: 'finishing', row: 'A', col: 4, stackId: 'STK-F04', stackLevel: 1, stackTotal: 1 },

    // A-5 ~ C-10：空位
]
