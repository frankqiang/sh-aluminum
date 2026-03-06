/**
 * 待分切料池 — 模拟数据
 * 来源：轧机完成后等待分切的母卷列表（含质量评审信息）
 * 字段设计参考：排产模块调研总结 §4.2.3、质量模块调研总结 §6.1-6.4
 */

export const materialPool = [
    // ----------------------------------------------------------------
    // 1. 已评审 + 无缺陷 + 电池箔（正常分切，宽度全部可用）
    // ----------------------------------------------------------------
    {
        coilNo: 'Y2601475',
        alloy: '1060',
        productType: '电池箔',
        width: 1596,
        thickness: 13,
        length: 24000,
        weight: 852,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '正常分切',
            grade: '一级品',
            instructions: [],
            effectiveWidth: 1596, // 无缺陷，有效宽度 = 原始宽度
        },
    },

    // ----------------------------------------------------------------
    // 2. 已评审 + Q侧有针孔切除 + 电池箔（有效宽度 < 原始宽度）
    // ----------------------------------------------------------------
    {
        coilNo: 'Y2601384',
        alloy: '1100',
        productType: '电池箔',
        width: 1700,
        thickness: 13,
        length: 30000,
        weight: 1100,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '让步放行',
            grade: '一级品',
            instructions: [
                { side: 'Q侧', start: 0, end: 80, defectType: '针孔', action: '切除' },
            ],
            effectiveWidth: 1620, // 1700 - 80(Q侧切除)
        },
    },

    // ----------------------------------------------------------------
    // 3. 已评审 + Q侧+C侧双侧切除 + 电池箔（两侧都有缺陷）
    // ----------------------------------------------------------------
    {
        coilNo: 'Y2601464',
        alloy: '1235D',
        productType: '电池箔',
        width: 1210,
        thickness: 12,
        length: 21800,
        weight: 620,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '让步放行',
            grade: '一级品',
            instructions: [
                { side: 'Q侧', start: 840, end: 990, defectType: '针孔', action: '切除' },
                { side: 'C侧', start: 0, end: 30, defectType: '针孔', action: '切除' },
            ],
            effectiveWidth: 1030, // 1210 - 150(Q侧) - 30(C侧)
        },
    },

    // ----------------------------------------------------------------
    // 4. 已评审 + 边部气道避留白 + 电池箔（避留白不切除，有效宽度不变）
    // ----------------------------------------------------------------
    {
        coilNo: 'Y2601254',
        alloy: '1060',
        productType: '电池箔',
        width: 1350,
        thickness: 13,
        length: 28000,
        weight: 890,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '让步放行',
            grade: '一级品',
            instructions: [
                { side: 'Q侧', start: 670, end: 670, defectType: '气道', action: '避留白' },
            ],
            effectiveWidth: 1350, // 避留白不切实物，有效宽度不变，但切刀要避开
        },
    },

    // ----------------------------------------------------------------
    // 5. 已评审 + 降级使用 + 电池箔（整卷降为二级品）
    // ----------------------------------------------------------------
    {
        coilNo: 'Y2601462',
        alloy: '1100',
        productType: '电池箔',
        width: 1280,
        thickness: 12,
        length: 23500,
        weight: 700,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '切二级品',
            grade: '二级品',
            instructions: [
                { side: '整卷', start: 0, end: 0, defectType: '针孔密集', action: '切二级品' },
            ],
            effectiveWidth: 1280,
        },
    },

    // ----------------------------------------------------------------
    // 6. 已评审 + 外圈切除 + 电池箔（外圈有缺陷，切掉后剩余正常）
    // ----------------------------------------------------------------
    {
        coilNo: 'Y2601438',
        alloy: '1060',
        productType: '电池箔',
        width: 1020,
        thickness: 13,
        length: 30000,
        weight: 720,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '改切',
            grade: '一级品',
            instructions: [
                { side: 'Q侧', start: 0, end: 260, defectType: '板形差', action: '切除' },
            ],
            effectiveWidth: 760, // 1020 - 260
        },
    },

    // ----------------------------------------------------------------
    // 7. 待评审 + 电池箔（质量评审尚未完成）
    // ----------------------------------------------------------------
    {
        coilNo: 'Y2601521',
        alloy: '1235D',
        productType: '电池箔',
        width: 1580,
        thickness: 12,
        length: 22000,
        weight: 820,
        reviewStatus: 'pending',
        review: null, // 评审未完成，无评审信息
    },

    // ----------------------------------------------------------------
    // 8. 待评审 + 双零箔（来自白条反映需评审）
    // ----------------------------------------------------------------
    {
        coilNo: 'Y2601503',
        alloy: '8079',
        productType: '双零箔',
        width: 1600,
        thickness: 6,
        length: 45000,
        weight: 1350,
        reviewStatus: 'pending',
        review: null,
    },

    // ----------------------------------------------------------------
    // 9. 已评审 + 无缺陷 + 双零箔（正常分切）
    // ----------------------------------------------------------------
    {
        coilNo: 'Y2601390',
        alloy: '8079',
        productType: '双零箔',
        width: 1560,
        thickness: 6.5,
        length: 42000,
        weight: 1280,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '正常分切',
            grade: '一级品',
            instructions: [],
            effectiveWidth: 1560,
        },
    },

    // ----------------------------------------------------------------
    // 10. 已评审 + 有辊印 + 双零箔（辊印避留白）
    // ----------------------------------------------------------------
    {
        coilNo: 'Y2601412',
        alloy: '1235',
        productType: '双零箔',
        width: 1480,
        thickness: 7,
        length: 38000,
        weight: 1100,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '让步放行',
            grade: '一级品',
            instructions: [
                { side: 'C侧', start: 200, end: 250, defectType: '辊印', action: '避留白' },
            ],
            effectiveWidth: 1480, // 避留白不影响有效宽度
        },
    },
]
