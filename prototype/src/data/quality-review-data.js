// 待评审料卷列表
export const qualityCoilList = [
    {
        id: 'qr-001',
        coilNo: 'Y2601380',
        parentCoilNo: 'Y2601301',
        alloy: '1060',
        thickness: 13,
        width: 1350,
        estimatedLength: 24000,
        weight: 856,
        process: '分切',
        machine: '2# 分切机',
        downloadTime: '2026-03-07T06:05:00',
        status: 'pending',
    },
    {
        id: 'qr-002',
        coilNo: 'Y2601392',
        parentCoilNo: 'Y2601302',
        alloy: '1235D',
        thickness: 15,
        width: 1200,
        estimatedLength: 20000,
        weight: 730,
        process: '分切',
        machine: '4# 分切机',
        downloadTime: '2026-03-07T08:30:00',
        status: 'pending',
    },
    {
        id: 'qr-003',
        coilNo: 'Y2601351',
        parentCoilNo: 'Y2601289',
        alloy: '1060',
        thickness: 13,
        width: 1350,
        estimatedLength: 22000,
        weight: 800,
        process: '轧机',
        machine: '8# 精轧机',
        downloadTime: '2026-03-06T16:00:00',
        status: 'reviewed',
    },
    {
        id: 'qr-004',
        coilNo: 'Y2601355',
        parentCoilNo: 'Y2601290',
        alloy: '1100',
        thickness: 13,
        width: 1340,
        estimatedLength: 23000,
        weight: 820,
        process: '分切',
        machine: '1# 分切机',
        downloadTime: '2026-03-06T20:00:00',
        status: 'revising',
    },
]

// 主评审结论选项（16种，基于2315条评审信息分析）
export const mainConclusionOptions = [
    '让步放行', '正常处理', '改切', '转精切', '沟通放行',
    '直接降级处理', '改切二级品', '扒废', '建议扒废',
    '退火后处理', '包装扒至', '薄剪处理', '评审可切',
    '工艺导卷', '转入优箔', '其他',
]

// 传递对象选项
export const deliveryTargetOptions = ['包装备注', '分切备注', '精切备注']

// 缺陷类型选项（27种）
export const defectTypeOptions = [
    '针孔', '气道', '孔洞', '辊印', '白条', '下榻', '条纹',
    '压坑', '油泥', '油斑', '板形', '闪筋', '亮线', '直棱',
    '横折', '划伤', '厚度', '擦划', '带油', '棱印', '起皱',
    '黑线', '串层', '米数', '油线', '麻点', '斜纹',
]

// 位置侧选项
export const locationSideOptions = ['Q侧', 'C侧', '整幅']

// 处理方式选项（23种）
export const treatmentOptions = [
    '切除', '避留白', '改切', '反开', '切二级品', '电晕',
    '扒至', '下料观察', '反开卷', '吸边', '扒除', '复查',
    '降速', '切等外', '验证', '扒废', '复测', '导卷',
    '薄剪', '改制', '在线观察', '复检', '工艺导卷',
]

// 已有的评审记录（qr-003已评审示例）
export const qualityReviews = {
    'qr-003': {
        mainConclusion: '让步放行',
        deliveryTarget: '包装备注',
        productGrade: 'A',
        pinholeA: 94, pinholeB: 13,
        pinholeC: 42, pinholeD: 8,
        pinholeE: 3,
        densePinhole: false, densePinholeNote: '',
        offlinePinhole: 0,
        longitudinalDensity: null,
        surfaceInfo: 'Q860辊印，L985周期',
        slittingQuality: '',
        flatness: 1.8,
        faceDensity: null,
        dyneValue: null,
        tubeCore: '63/60',
        frameNo: '3195',
        instructions: [
            { defectType: '针孔', locationSide: 'Q侧', startMm: 0, endMm: 80, lengthPosM: null, treatment: '切除' },
            { defectType: '辊印', locationSide: 'C侧', startMm: 0, endMm: 40, lengthPosM: null, treatment: '避留白' },
        ],
        note: '已与客户沟通，同意让步放行',
        reviewer: '张三',
        reviewTime: '2026-03-06T17:30:00',
    }
}

// 空评审模板（新建评审时使用）
export function createEmptyReview() {
    return {
        mainConclusion: '',
        deliveryTarget: '',
        productGrade: 'A',
        pinholeA: null, pinholeB: null,
        pinholeC: null, pinholeD: null,
        pinholeE: null,
        densePinhole: false, densePinholeNote: '',
        offlinePinhole: null,
        longitudinalDensity: null,
        surfaceInfo: '',
        slittingQuality: '',
        flatness: null,
        faceDensity: null,
        dyneValue: null,
        tubeCore: '',
        frameNo: '',
        instructions: [],
        note: '',
        reviewer: '张三',
        reviewTime: null,
    }
}
