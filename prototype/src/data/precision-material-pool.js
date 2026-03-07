// src/data/precision-material-pool.js
// 精切料池：分切完成后等待精切的子卷列表

export const precisionMaterialPool = [
    // 场景1：已评审 + 多订单（长度顺序切）— 有底部缺陷，先切短单
    {
        subCoilNo: 'Y2412380/1-1',
        motherCoilNo: 'Y2412380',
        frameNo: '3195',
        alloy: '1100',
        productType: '电池箔',
        thickness: 13,
        width: 1200,
        length: 23000,
        weight: 850,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '让步放行',
            grade: '一级品',
            instructions: [
                { locationType: 'length', locationDesc: '底部5800米', defectType: '针孔', action: '切二级品' },
                { locationType: 'width', side: 'Q侧', position: 100, defectType: '针孔', action: '切除' },
                { locationType: 'width', side: 'C侧', position: 25, defectType: '针孔', action: '切除' },
                { locationType: 'width', side: 'Q侧', position: 620, defectType: '孔洞', action: '避留白' },
            ],
            effectiveWidth: 1075,
        }
    },
    // 场景2：已评审 + 多订单（长度顺序切）— 外圈缺陷，先切外圈
    {
        subCoilNo: 'Y2412465/3-1',
        motherCoilNo: 'Y2412465',
        frameNo: '6122',
        alloy: '1060',
        productType: '电池箔',
        thickness: 15,
        width: 990,
        length: 33000,
        weight: 920,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '让步放行',
            grade: '一级品',
            instructions: [
                { locationType: 'length', locationDesc: '外圈2000米', defectType: '板形', action: '下料观察' },
                { locationType: 'width', side: 'Q侧', position: 80, defectType: '针孔', action: '切除' },
            ],
            effectiveWidth: 910,
        }
    },
    // 场景3：已评审 + 多订单（宽度同时切）— 两个宽度合计可拼
    {
        subCoilNo: 'Y2412528/3-1',
        motherCoilNo: 'Y2412528',
        frameNo: '5847',
        alloy: '1060',
        productType: '电池箔',
        thickness: 15,
        width: 1350,
        length: 33000,
        weight: 1100,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '正常处理',
            grade: '一级品',
            instructions: [],
            effectiveWidth: 1350,
        }
    },
    // 场景4：已评审 + 多订单（宽度同时切）
    {
        subCoilNo: 'Y2412624/1-1',
        motherCoilNo: 'Y2412624',
        frameNo: '3847',
        alloy: '1235',
        productType: '电池箔',
        thickness: 13,
        width: 1560,
        length: 34000,
        weight: 1350,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '正常处理',
            grade: '一级品',
            instructions: [
                { locationType: 'width', side: 'C侧', position: 50, defectType: '白条', action: '避留白' },
            ],
            effectiveWidth: 1510,
        }
    },
    // 场景5：已评审 + 单订单（简单场景）
    {
        subCoilNo: 'Y2412868/2-1',
        motherCoilNo: 'Y2412868',
        frameNo: '4021',
        alloy: '1100',
        productType: '电池箔',
        thickness: 13,
        width: 990,
        length: 32000,
        weight: 870,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '正常处理',
            grade: '一级品',
            instructions: [],
            effectiveWidth: 990,
        }
    },
    // 场景6：已评审 + 单订单（简单场景）
    {
        subCoilNo: 'Y2412422/8-1',
        motherCoilNo: 'Y2412422',
        frameNo: '3580',
        alloy: '1070',
        productType: '电池箔',
        thickness: 13,
        width: 1560,
        length: 34000,
        weight: 1280,
        reviewStatus: 'reviewed',
        review: {
            conclusion: '让步放行',
            grade: '一级品',
            instructions: [
                { locationType: 'width', side: 'C侧', position: 190, defectType: '压坑', action: '避留白' },
            ],
            effectiveWidth: 1370,
        }
    },
    // 场景7：待评审（演示评审卡点）
    {
        subCoilNo: 'Y2412695/8-1',
        motherCoilNo: 'Y2412695',
        frameNo: 'B052',
        alloy: '1100',
        productType: '电池箔',
        thickness: 13,
        width: 1610,
        length: 33500,
        weight: 1290,
        reviewStatus: 'pending',
        review: null,
    },
    // 场景8：未提交评审
    {
        subCoilNo: 'Y2412776/2-1',
        motherCoilNo: 'Y2412776',
        frameNo: '3305',
        alloy: '1060',
        productType: '电池箔',
        thickness: 13,
        width: 1730,
        length: 24000,
        weight: 1100,
        reviewStatus: 'none',
        review: null,
    },
]
