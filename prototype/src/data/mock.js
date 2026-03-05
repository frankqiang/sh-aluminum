/**
 * 排产模块原型 — 模拟数据
 * 数据来源：神火新材调研文档中的真实数据
 * 包含：机台定义、轧机计划、分切计划、精切计划、订单、修改记录、产能平衡、Dashboard统计
 */

// ============================================================
// 1. 轧机设备定义（14台）
// ============================================================
export const rollingMachines = [
  // 粗轧机 (1-3号)：轧制1-3道次
  { id: 1, name: '1号粗轧机', type: '粗轧', group: '粗轧机 (1-3号)', passes: '1-3', status: 'running' },
  { id: 2, name: '2号粗轧机', type: '粗轧', group: '粗轧机 (1-3号)', passes: '1-3', status: 'running' },
  { id: 3, name: '3号粗轧机', type: '粗轧', group: '粗轧机 (1-3号)', passes: '1-3', status: 'fault' },
  // 中轧机 (4-6号)：轧制第4道次
  { id: 4, name: '4号中轧机', type: '中轧', group: '中轧机 (4-6号)', passes: '4', status: 'running' },
  { id: 5, name: '5号中轧机', type: '中轧', group: '中轧机 (4-6号)', passes: '4', status: 'running' },
  { id: 6, name: '6号中轧机', type: '中轧', group: '中轧机 (4-6号)', passes: '4', status: 'running' },
  // 中精轧机 (7号)：可轧4-5道次
  { id: 7, name: '7号中精轧机', type: '中精轧', group: '中精轧机 (7号)', passes: '4-5', status: 'waiting' },
  // 精轧机 (8-14号)：轧制第5道次
  { id: 8, name: '8号精轧机', type: '精轧', group: '精轧机 (8-14号)', passes: '5', status: 'running' },
  { id: 9, name: '9号精轧机', type: '精轧', group: '精轧机 (8-14号)', passes: '5', status: 'running' },
  { id: 10, name: '10号精轧机', type: '精轧', group: '精轧机 (8-14号)', passes: '5', status: 'running' },
  { id: 11, name: '11号精轧机', type: '精轧', group: '精轧机 (8-14号)', passes: '5', status: 'waiting' },
  { id: 12, name: '12号精轧机', type: '精轧', group: '精轧机 (8-14号)', passes: '5', status: 'running' },
  { id: 13, name: '13号精轧机', type: '精轧', group: '精轧机 (8-14号)', passes: '5', status: 'running' },
  { id: 14, name: '14号精轧机', type: '精轧', group: '精轧机 (8-14号)', passes: '5', status: 'running' },
]

// ============================================================
// 2. 分切设备定义（14台：一期6台 + 二期8台）
// ============================================================
export const slittingMachines = [
  // 一期6台
  { id: '1#', name: '1#分切机', period: '一期', hasDetection: true, detectionNote: '有针检/表检', canCut: '电池箔+双零箔', status: 'running' },
  { id: '2#', name: '2#分切机', period: '一期', hasDetection: true, detectionNote: '有针检/表检', canCut: '电池箔+双零箔', status: 'running' },
  { id: '3#', name: '3#分切机', period: '一期', hasDetection: false, detectionNote: '无检测设备', canCut: '仅双零箔', status: 'waiting' },
  { id: '4#', name: '4#分切机', period: '一期', hasDetection: true, detectionNote: '有针检/表检', canCut: '电池箔+双零箔', status: 'running' },
  { id: '5#', name: '5#分切机', period: '一期', hasDetection: false, detectionNote: '无检测设备', canCut: '仅双零箔', status: 'running' },
  { id: '6#', name: '6#分切机', period: '一期', hasDetection: true, detectionNote: '有针检/表检', canCut: '电池箔+双零箔', status: 'fault' },
  // 二期8台
  { id: '7#', name: '7#分切机', period: '二期', hasDetection: true, detectionNote: '有针检/表检', canCut: '电池箔+双零箔', status: 'running' },
  { id: '8#', name: '8#分切机', period: '二期', hasDetection: true, detectionNote: '有针检/表检', canCut: '电池箔+双零箔', status: 'running' },
  { id: '9#', name: '9#分切机', period: '二期', hasDetection: true, detectionNote: '有针检/表检', canCut: '电池箔+双零箔', status: 'running' },
  { id: '10#', name: '10#分切机', period: '二期', hasDetection: false, detectionNote: '无检测设备', canCut: '仅双零箔', status: 'running' },
  { id: '11#', name: '11#分切机', period: '二期', hasDetection: true, detectionNote: '有针检/表检', canCut: '电池箔+双零箔', status: 'running' },
  { id: '12#', name: '12#分切机', period: '二期', hasDetection: false, detectionNote: '无检测设备', canCut: '仅双零箔', status: 'waiting' },
  { id: '13#', name: '13#分切机', period: '二期', hasDetection: true, detectionNote: '有针检/表检', canCut: '电池箔+双零箔', status: 'running' },
  { id: '14#', name: '14#分切机', period: '二期', hasDetection: true, detectionNote: '有针检/表检', canCut: '电池箔+双零箔', status: 'running' },
]

// ============================================================
// 3. 轧机排产计划数据（基于真实Excel重构）
// ============================================================
export const rollingPlans = [
  // ── 1号粗轧机 ──────────────────────
  { id: 'RP001', machineId: 1, seq: 1, batch: '0122', coilNo: '1022601710', blankCoilNo: 'C25120415A35-1', alloy: '1060', usage: '电', width: 1680, inThickness: 0.22, passes: [{ n: 1, t: 98 }, { n: 2, t: 40 }, { n: 3, t: 16 }, { n: 4, t: 10 }], currentPasses: [1, 2, 3], finalThickness: 10, remark: '提前通知何洪峰 试验料轧3吨10u 余料轧13u', customer: '', status: 'completed', planDate: '2026-03-05' },
  { id: 'RP002', machineId: 1, seq: 2, batch: '0116', coilNo: '1022601515', blankCoilNo: 'C25121210A142-1', alloy: '1060', usage: '电', width: 1660, inThickness: 0.22, passes: [{ n: 1, t: 102 }, { n: 2, t: 42 }, { n: 3, t: 19 }, { n: 4, t: 12 }], currentPasses: [1, 2, 3], finalThickness: 12, remark: '山线15 验证边部针孔', customer: '莱尔母卷', status: 'completed', planDate: '2026-03-05' },
  { id: 'RP003', machineId: 1, seq: 3, batch: '0116', coilNo: '1022601516', blankCoilNo: 'C25121110A130-5', alloy: '1060', usage: '电', width: 1660, inThickness: 0.22, passes: [{ n: 1, t: 102 }, { n: 2, t: 42 }, { n: 3, t: 19 }, { n: 4, t: 12 }], currentPasses: [1, 2, 3], finalThickness: 12, remark: '山线15 验证边部针孔', customer: '莱尔母卷', status: 'running', planDate: '2026-03-05' },
  { id: 'RP004', machineId: 1, seq: 4, batch: '0116', coilNo: '1022601517', blankCoilNo: 'YN25121503A09-2', alloy: '1060', usage: '电', width: 1360, inThickness: 0.22, passes: [{ n: 1, t: 108 }, { n: 2, t: 48 }, { n: 3, t: 21 }, { n: 4, t: 13 }], currentPasses: [1, 2, 3], finalThickness: 13, remark: '全部道次第一优先级', customer: '精切顶皓', status: 'planned', planDate: '2026-03-05' },
  { id: 'RP005', machineId: 1, seq: 5, batch: '0116', coilNo: '1022601518', blankCoilNo: 'YN25121303A07-1', alloy: '1060', usage: '电', width: 1360, inThickness: 0.22, passes: [{ n: 1, t: 108 }, { n: 2, t: 48 }, { n: 3, t: 21 }, { n: 4, t: 13 }], currentPasses: [1, 2, 3], finalThickness: 13, remark: '全部道次第一优先级', customer: '精切顶皓', status: 'planned', planDate: '2026-03-05' },
  // ── 2号粗轧机 ──────────────────────
  { id: 'RP006', machineId: 2, seq: 1, batch: '0122', coilNo: '1022601715', blankCoilNo: 'C25120416A35-2', alloy: '1060', usage: '电', width: 1680, inThickness: 0.22, passes: [{ n: 1, t: 98 }, { n: 2, t: 40 }, { n: 3, t: 16 }, { n: 4, t: 10 }], currentPasses: [1, 2, 3], finalThickness: 10, remark: '双零箔 板型控制', customer: '海达', status: 'completed', planDate: '2026-03-05' },
  { id: 'RP007', machineId: 2, seq: 2, batch: '0122', coilNo: '1022601716', blankCoilNo: 'C25120417A35-3', alloy: '1060', usage: '电', width: 1680, inThickness: 0.22, passes: [{ n: 1, t: 98 }, { n: 2, t: 40 }, { n: 3, t: 16 }, { n: 4, t: 10 }], currentPasses: [1, 2, 3], finalThickness: 10, remark: '双零箔', customer: '海达', status: 'running', planDate: '2026-03-05' },
  { id: 'RP008', machineId: 2, seq: 3, batch: '0122', coilNo: '1022601717', blankCoilNo: 'C25120418A35-4', alloy: '1235', usage: '电', width: 1520, inThickness: 0.22, passes: [{ n: 1, t: 100 }, { n: 2, t: 45 }, { n: 3, t: 18 }, { n: 4, t: 12 }], currentPasses: [1, 2, 3], finalThickness: 12, remark: '双零箔 注意板型', customer: '兴业', status: 'planned', planDate: '2026-03-05' },
  { id: 'RP009', machineId: 2, seq: 4, batch: '0122', coilNo: '1022601718', blankCoilNo: 'C25120419A35-5', alloy: '8079', usage: '电', width: 1350, inThickness: 0.22, passes: [{ n: 1, t: 98 }, { n: 2, t: 42 }, { n: 3, t: 16 }, { n: 4, t: 10 }], currentPasses: [1, 2, 3], finalThickness: 10, remark: '-', customer: '鑫航', status: 'planned', planDate: '2026-03-05' },

  // ── 3号粗轧机（故障停机）──────────────
  { id: 'RP010', machineId: 3, seq: 1, batch: '0123', coilNo: '1022601815', blankCoilNo: 'C25120520A88-1', alloy: '1060', usage: '电', width: 1350, inThickness: 0.22, passes: [{ n: 1, t: 102 }, { n: 2, t: 44 }, { n: 3, t: 18 }, { n: 4, t: 12 }], currentPasses: [1, 2, 3], finalThickness: 12, remark: '设备故障 已转1号', customer: '-', status: 'planned', planDate: '2026-03-05' },

  // ── 4号中轧机 ──────────────────────
  { id: 'RP011', machineId: 4, seq: 1, batch: '0121', coilNo: '1382601674', blankCoilNo: 'YN25120906S28-1', alloy: '8079', usage: '药', width: 1750, inThickness: 0.24, passes: [{ n: 1, t: 103 }, { n: 2, t: 44 }, { n: 3, t: 16.5 }, { n: 4, t: 7 }], currentPasses: [4], finalThickness: 7, remark: '一道次后及时退火无黑线，导辊及熨平辊擦净', customer: '吉丰', status: 'completed', planDate: '2026-03-05' },
  { id: 'RP012', machineId: 4, seq: 2, batch: '0121', coilNo: '1382601675', blankCoilNo: 'YN25120906S28-4', alloy: '8079', usage: '食', width: 1750, inThickness: 0.24, passes: [{ n: 1, t: 97 }, { n: 2, t: 38 }, { n: 3, t: 14 }, { n: 4, t: 5.3 }], currentPasses: [4], finalThickness: 5.3, remark: '三道次后及时安排退火', customer: '海燕', status: 'running', planDate: '2026-03-05' },
  { id: 'RP013', machineId: 4, seq: 3, batch: '0121', coilNo: '1382601676', blankCoilNo: 'YN25121206S37-3', alloy: '8079', usage: '食', width: 1750, inThickness: 0.24, passes: [{ n: 1, t: 97 }, { n: 2, t: 38 }, { n: 3, t: 14 }, { n: 4, t: 5.3 }], currentPasses: [4], finalThickness: 5.3, remark: '三道次后及时安排退火', customer: '海燕', status: 'planned', planDate: '2026-03-05' },
  { id: 'RP014', machineId: 4, seq: 4, batch: '0121', coilNo: '1382601679', blankCoilNo: 'YNT25111702S13-1-2', alloy: '8079', usage: '食', width: 1560, inThickness: 0.24, passes: [{ n: 1, t: 97 }, { n: 2, t: 38 }, { n: 3, t: 14 }, { n: 4, t: 5.3 }], currentPasses: [4], finalThickness: 5.3, remark: '三道次后及时安排退火', customer: '海燕', status: 'planned', planDate: '2026-03-05' },

  // ── 5号中轧机 ──────────────────────
  { id: 'RP015', machineId: 5, seq: 1, batch: '0119', coilNo: '1382601682', blankCoilNo: 'YNT25120305S11-2', alloy: '8079', usage: '药', width: 1380, inThickness: 0.26, passes: [{ n: 1, t: 103 }, { n: 2, t: 44 }, { n: 3, t: 16.5 }, { n: 4, t: 7 }], currentPasses: [4], finalThickness: 7, remark: '针孔≤50', customer: '吉丰', status: 'completed', planDate: '2026-03-05' },
  { id: 'RP016', machineId: 5, seq: 2, batch: '0119', coilNo: '1382601683', blankCoilNo: 'YNT25120405S16-2', alloy: '8079', usage: '药', width: 1380, inThickness: 0.24, passes: [{ n: 1, t: 103 }, { n: 2, t: 44 }, { n: 3, t: 16.5 }, { n: 4, t: 7 }], currentPasses: [4], finalThickness: 7, remark: '-', customer: '吉丰', status: 'running', planDate: '2026-03-05' },

  // ── 6号中轧机 ──────────────────────
  { id: 'RP018', machineId: 6, seq: 1, batch: '0117', coilNo: '1382601550', blankCoilNo: 'YNT25120505A11-1', alloy: '1235', usage: '无', width: 1520, inThickness: 0.26, passes: [{ n: 1, t: 100 }, { n: 2, t: 45 }, { n: 3, t: 16 }, { n: 4, t: 6.5 }], currentPasses: [4], finalThickness: 6.5, remark: '双零箔', customer: '华中', status: 'planned', planDate: '2026-03-05' },

  // ── 7号中精轧机（待料）──────────────
  { id: 'RP021', machineId: 7, seq: 1, batch: '0125', coilNo: '1382601990', blankCoilNo: 'YNT25120505A12-2', alloy: '1060', usage: '电', width: 1350, inThickness: 0.22, passes: [{ n: 1, t: 108 }, { n: 2, t: 48 }, { n: 3, t: 21 }, { n: 4, t: 13 }, { n: 5, t: 6.5 }], currentPasses: [4, 5], finalThickness: 6.5, remark: '跳道次 38→6.5', customer: '南光', status: 'completed', planDate: '2026-03-05' },
  { id: 'RP022', machineId: 7, seq: 2, batch: '0125', coilNo: '1382601991', blankCoilNo: 'YNT25120505A13-3', alloy: '1060', usage: '电', width: 1350, inThickness: 0.22, passes: [{ n: 1, t: 108 }, { n: 2, t: 48 }, { n: 3, t: 21 }, { n: 4, t: 13 }, { n: 5, t: 6.5 }], currentPasses: [5], finalThickness: 6.5, remark: '中精连轧', customer: '南光', status: 'planned', planDate: '2026-03-05' },

  // ── 8号精轧机 ──────────────────────
  { id: 'RP023', machineId: 8, seq: 1, batch: '0122', coilNo: '1022601712', blankCoilNo: 'C25121518A182-5', alloy: '1060', usage: '电', width: 1400, inThickness: 0.22, passes: [{ n: 1, t: 98 }, { n: 2, t: 40 }, { n: 3, t: 16 }, { n: 4, t: 10 }], currentPasses: [4], finalThickness: 10, remark: '轧前通知何洪峰 18437955261', customer: '精切ATL', status: 'completed', planDate: '2026-03-05' },
  { id: 'RP024', machineId: 8, seq: 2, batch: '0122', coilNo: '1022601713', blankCoilNo: '25111006A106-8', alloy: '1060', usage: '电', width: 1050, inThickness: 0.24, passes: [{ n: 1, t: 98 }, { n: 2, t: 40 }, { n: 3, t: 16 }, { n: 4, t: 10 }], currentPasses: [4], finalThickness: 10, remark: '轧前通知何洪峰 18437955261', customer: '精切ATL', status: 'running', planDate: '2026-03-05' },
  { id: 'RP025', machineId: 8, seq: 3, batch: '0122', coilNo: '1022601714', blankCoilNo: '25122618A288-1', alloy: '1060', usage: '电', width: 1000, inThickness: 0.24, passes: [{ n: 1, t: 98 }, { n: 2, t: 40 }, { n: 3, t: 16 }, { n: 4, t: 10 }], currentPasses: [4], finalThickness: 10, remark: '轧前通知何洪峰 18437955261', customer: '精切ATL', status: 'planned', planDate: '2026-03-05' },

  // ── 9号精轧机 ──────────────────────
  { id: 'RP026', machineId: 9, seq: 1, batch: '0115', coilNo: '1022601450', blankCoilNo: 'C25120302A11-1', alloy: '1060', usage: '电', width: 1350, inThickness: 0.22, passes: [{ n: 1, t: 102 }, { n: 2, t: 45 }, { n: 3, t: 18 }, { n: 4, t: 13 }, { n: 5, t: 4.5 }], currentPasses: [5], finalThickness: 4.5, remark: '24000M/车', customer: '南光', status: 'running', planDate: '2026-03-05' },

  // ── 10号精轧机 ─────────────────────
  { id: 'RP029', machineId: 10, seq: 1, batch: '0118', coilNo: '1022601610', blankCoilNo: 'C25121301A18-2', alloy: '1100', usage: '电', width: 1350, inThickness: 0.22, passes: [{ n: 1, t: 108 }, { n: 2, t: 48 }, { n: 3, t: 21 }, { n: 4, t: 13 }, { n: 5, t: 4.5 }], currentPasses: [5], finalThickness: 4.5, remark: '厚度不超5', customer: '莱尔母卷', status: 'completed', planDate: '2026-03-05' },
  { id: 'RP030', machineId: 10, seq: 2, batch: '0118', coilNo: '1022601611', blankCoilNo: 'C25121302A19-3', alloy: '1100', usage: '电', width: 1350, inThickness: 0.22, passes: [{ n: 1, t: 108 }, { n: 2, t: 48 }, { n: 3, t: 21 }, { n: 4, t: 13 }, { n: 5, t: 4.5 }], currentPasses: [5], finalThickness: 4.5, remark: '厚度不超5', customer: '莱尔母卷', status: 'running', planDate: '2026-03-05' },

  // ── 12号精轧机 ─────────────────────
  { id: 'RP034', machineId: 12, seq: 1, batch: '0120', coilNo: '1382601720', blankCoilNo: 'YN25121008S31-1', alloy: '8079', usage: '双零', width: 1520, inThickness: 0.24, passes: [{ n: 1, t: 100 }, { n: 2, t: 42 }, { n: 3, t: 14 }, { n: 4, t: 6.5 }], currentPasses: [4], finalThickness: 6.5, remark: '双零箔', customer: '华中', status: 'completed', planDate: '2026-03-05' },
  { id: 'RP035', machineId: 12, seq: 2, batch: '0120', coilNo: '1382601721', blankCoilNo: 'YN25121008S32-2', alloy: '8079', usage: '双零', width: 1520, inThickness: 0.24, passes: [{ n: 1, t: 100 }, { n: 2, t: 42 }, { n: 3, t: 14 }, { n: 4, t: 6.5 }], currentPasses: [4], finalThickness: 6.5, remark: '双零箔', customer: '华中', status: 'running', planDate: '2026-03-05' },

  // ── 13号精轧机 ─────────────────────
  { id: 'RP037', machineId: 13, seq: 1, batch: '0110', coilNo: '1022601120', blankCoilNo: 'C25120101A01-1', alloy: '1060', usage: '电', width: 1350, inThickness: 0.22, passes: [{ n: 1, t: 102 }, { n: 2, t: 42 }, { n: 3, t: 19 }, { n: 4, t: 13 }, { n: 5, t: 4.5 }], currentPasses: [5], finalThickness: 4.5, remark: '针孔≤800', customer: '长盈', status: 'running', planDate: '2026-03-05' },

  // ── 14号精轧机 ─────────────────────
  { id: 'RP040', machineId: 14, seq: 1, batch: '0111', coilNo: '1022601180', blankCoilNo: 'C25120205A08-4', alloy: '1060', usage: '电', width: 1350, inThickness: 0.22, passes: [{ n: 1, t: 102 }, { n: 2, t: 42 }, { n: 3, t: 19 }, { n: 4, t: 13 }, { n: 5, t: 4.5 }], currentPasses: [5], finalThickness: 4.5, remark: '-', customer: '长盈', status: 'planned', planDate: '2026-03-05' },
]

// ============================================================
// 4. 分切排产计划数据（~45条）
// ============================================================
export const slittingPlans = [
  // ── 1#分切机（有针检/表检 | 电池箔+双零箔）──────
  {
    id: 'SP001', machineId: '1#', seq: 1,
    motherCoilNo: 'Y2601301', alloy: '1060', width: 1350, thickness: 13, length: 48000, weight: 2500,
    orderNo: 'SZ2601280123', customer: '河北兴恒', productType: '电池箔',
    reviewStatus: 'reviewed',
    review: {
      conclusion: '让步放行', grade: '一级品',
      instructions: [
        { side: 'Q侧', start: 0, end: 80, defectType: '针孔', action: '切除' },
        { side: 'C侧', start: 0, end: 40, defectType: '针孔', action: '切除' },
      ],
      effectiveWidth: 1230, reviewer: '李工', reviewTime: '2026-03-04 16:30',
    },
    cuttingPlan: {
      spec: '13×1200电池箔×23000-24000', coreSpec: '152.4mm/壁厚4mm 长度1605mm',
      segments: [
        { type: 'defect_cut', width: 40, label: 'C侧切除', note: '质量缺陷' },
        { type: 'order', width: 1200, label: '河北兴恒', note: 'SZ2601280123' },
        { type: 'edge', width: 10, label: '边丝', note: '' },
        { type: 'defect_cut', width: 80, label: 'Q侧切除', note: '质量缺陷' },
        { type: 'waste', width: 20, label: '余料', note: '废料' },
      ],
      wasteRate: 11.1,
    },
    planNote: '合理计算米数尽量不废料\n装框单备注管芯壁厚',
    status: 'completed', completedWeight: 1250, planDate: '2026-03-05',
  },
  {
    id: 'SP002', machineId: '1#', seq: 2,
    motherCoilNo: 'Y2601302', alloy: '1100', width: 1350, thickness: 13, length: 46000, weight: 2400,
    orderNo: 'SZ2601280156', customer: '弘力科技', productType: '电池箔',
    reviewStatus: 'reviewed',
    review: {
      conclusion: '正常处理', grade: '一级品', instructions: [],
      effectiveWidth: 1350, reviewer: '王工', reviewTime: '2026-03-04 17:00',
    },
    cuttingPlan: {
      spec: '13×1340电池箔×23000-24000', coreSpec: '76mm管芯',
      segments: [
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'order', width: 1340, label: '弘力科技', note: 'SZ2601280156' },
        { type: 'edge', width: 5, label: '边丝', note: '' },
      ],
      wasteRate: 0.7,
    },
    planNote: '',
    status: 'completed', completedWeight: 2400, planDate: '2026-03-05',
  },
  {
    id: 'SP003', machineId: '1#', seq: 3,
    motherCoilNo: 'Y2601305', alloy: '1060', width: 1350, thickness: 13, length: 49000, weight: 2600,
    orderNo: 'SZ2601280178', customer: '源元科技', productType: '电池箔',
    reviewStatus: 'reviewed',
    review: {
      conclusion: '改切', grade: '一级品',
      instructions: [{ side: 'Q侧', start: 840, end: 990, defectType: '针孔', action: '切除' }],
      effectiveWidth: 1200, reviewer: '李工', reviewTime: '2026-03-05 08:30',
    },
    cuttingPlan: {
      spec: '13×860电池箔×14000-16000', coreSpec: '152.4mm管芯',
      segments: [
        { type: 'edge', width: 10, label: '边丝', note: '' },
        { type: 'order', width: 860, label: '源元科技', note: 'SZ2601280178' },
        { type: 'waste', width: 330, label: '余料', note: '废料' },
        { type: 'defect_cut', width: 150, label: 'Q侧切除', note: '针孔' },
      ],
      wasteRate: 36.3,
    },
    planNote: '',
    status: 'running', completedWeight: null, planDate: '2026-03-05',
  },
  {
    id: 'SP004', machineId: '1#', seq: 4,
    motherCoilNo: 'Y2601307', alloy: '1235D', width: 1350, thickness: 13, length: 45000, weight: 2300,
    orderNo: 'SZ2601280190', customer: '中航锂电', productType: '电池箔',
    reviewStatus: 'pending',
    review: null,
    cuttingPlan: null,
    planNote: '',
    status: 'pending_review', completedWeight: null, planDate: '2026-03-05',
  },
  {
    id: 'SP005', machineId: '1#', seq: 5,
    motherCoilNo: 'Y2601310', alloy: '1060', width: 1350, thickness: 13, length: 47000, weight: 2450,
    orderNo: 'SZ2601280201', customer: '河北兴恒', productType: '电池箔',
    reviewStatus: 'none',
    review: null,
    cuttingPlan: {
      spec: '13×1300电池箔×23000-24000', coreSpec: '76mm管芯',
      segments: [
        { type: 'edge', width: 10, label: '边丝', note: '' },
        { type: 'order', width: 1300, label: '河北兴恒', note: 'SZ2601280201' },
        { type: 'edge', width: 10, label: '边丝', note: '' },
        { type: 'waste', width: 30, label: '余料', note: '废料' },
      ],
      wasteRate: 3.7,
    },
    planNote: '',
    status: 'planned', completedWeight: null, planDate: '2026-03-05',
  },
  {
    id: 'SP006', machineId: '1#', seq: 6,
    motherCoilNo: 'Y2601312', alloy: '1100', width: 1350, thickness: 13, length: 44000, weight: 2200,
    orderNo: '', customer: '', productType: '电池箔',
    reviewStatus: 'none', review: null, cuttingPlan: null,
    planNote: '',
    status: 'planned', completedWeight: null, planDate: '2026-03-05',
  },

  // ── 2#分切机 ──────────────────────
  {
    id: 'SP007', machineId: '2#', seq: 1,
    motherCoilNo: 'Y2601315', alloy: '8079', width: 1350, thickness: 6.5, length: 52000, weight: 2800,
    orderNo: 'SZ2601280210', customer: '海达铝业', productType: '双零箔',
    reviewStatus: 'reviewed',
    review: {
      conclusion: '正常处理', grade: '一级品', instructions: [],
      effectiveWidth: 1350, reviewer: '王工', reviewTime: '2026-03-04 15:00',
    },
    cuttingPlan: {
      spec: '6.5×660双零箔×28000-30000', coreSpec: '76mm管芯',
      segments: [
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'order', width: 660, label: '海达铝业①', note: 'SZ2601280210' },
        { type: 'edge', width: 10, label: '边丝', note: '' },
        { type: 'order', width: 660, label: '海达铝业②', note: 'SZ2601280210' },
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'waste', width: 10, label: '余料', note: '' },
      ],
      wasteRate: 2.2,
    },
    planNote: '双开切 注意对称',
    status: 'completed', completedWeight: 2780, planDate: '2026-03-05',
  },
  {
    id: 'SP008', machineId: '2#', seq: 2,
    motherCoilNo: 'Y2601318', alloy: '8079', width: 1350, thickness: 6.5, length: 50000, weight: 2700,
    orderNo: 'SZ2601280225', customer: '鑫航铝箔', productType: '双零箔',
    reviewStatus: 'reviewed',
    review: {
      conclusion: '让步放行', grade: '二级品',
      instructions: [{ side: 'Q侧', start: 0, end: 50, defectType: '起皮', action: '切除' }],
      effectiveWidth: 1300, reviewer: '李工', reviewTime: '2026-03-05 09:00',
    },
    cuttingPlan: {
      spec: '6.5×620双零箔×26000-28000', coreSpec: '76mm管芯',
      segments: [
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'order', width: 620, label: '鑫航铝箔①', note: 'SZ2601280225' },
        { type: 'edge', width: 10, label: '边丝', note: '' },
        { type: 'order', width: 620, label: '鑫航铝箔②', note: 'SZ2601280225' },
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'defect_cut', width: 50, label: 'Q侧切除', note: '起皮' },
        { type: 'waste', width: 40, label: '余料', note: '' },
      ],
      wasteRate: 8.1,
    },
    planNote: '',
    status: 'running', completedWeight: null, planDate: '2026-03-05',
  },
  {
    id: 'SP009', machineId: '2#', seq: 3,
    motherCoilNo: 'Y2601320', alloy: '1235', width: 1520, thickness: 6.5, length: 48000, weight: 2900,
    orderNo: 'SZ2601280240', customer: '兴业铝箔', productType: '双零箔',
    reviewStatus: 'pending',
    review: null, cuttingPlan: null,
    planNote: '',
    status: 'pending_review', completedWeight: null, planDate: '2026-03-05',
  },

  // ── 4#分切机 ──────────────────────
  {
    id: 'SP010', machineId: '4#', seq: 1,
    motherCoilNo: 'Y2601280', alloy: '1060', width: 1350, thickness: 13, length: 46000, weight: 2400,
    orderNo: 'SZ2601280260', customer: '弘力科技', productType: '电池箔',
    reviewStatus: 'reviewed',
    review: {
      conclusion: '正常处理', grade: '一级品', instructions: [],
      effectiveWidth: 1350, reviewer: '王工', reviewTime: '2026-03-04 16:00',
    },
    cuttingPlan: {
      spec: '13×654电池箔×6500-7000', coreSpec: '76mm管芯',
      segments: [
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'order', width: 654, label: '弘力科技①', note: 'SZ2601280260' },
        { type: 'edge', width: 10, label: '边丝', note: '' },
        { type: 'order', width: 654, label: '弘力科技②', note: 'SZ2601280260' },
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'waste', width: 22, label: '余料', note: '' },
      ],
      wasteRate: 3.1,
    },
    planNote: '双开切',
    status: 'completed', completedWeight: 2380, planDate: '2026-03-05',
  },
  {
    id: 'SP011', machineId: '4#', seq: 2,
    motherCoilNo: 'Y2601282', alloy: '1100', width: 1350, thickness: 13, length: 47000, weight: 2500,
    orderNo: 'SZ2601280275', customer: '源元科技', productType: '电池箔',
    reviewStatus: 'reviewed',
    review: {
      conclusion: '正常处理', grade: '一级品', instructions: [],
      effectiveWidth: 1350, reviewer: '王工', reviewTime: '2026-03-05 08:00',
    },
    cuttingPlan: {
      spec: '13×860电池箔×14000-16000', coreSpec: '152.4mm管芯',
      segments: [
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'order', width: 860, label: '源元科技', note: 'SZ2601280275' },
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'waste', width: 480, label: '余料', note: '可配其他订单' },
      ],
      wasteRate: 36.3,
    },
    planNote: '余料待配单',
    status: 'running', completedWeight: null, planDate: '2026-03-05',
  },
  {
    id: 'SP012', machineId: '4#', seq: 3,
    motherCoilNo: 'Y2601284', alloy: '1060', width: 1350, thickness: 13, length: 45000, weight: 2350,
    orderNo: 'SZ2601280290', customer: '中航锂电', productType: '电池箔',
    reviewStatus: 'reviewed',
    review: {
      conclusion: '正常处理', grade: '一级品', instructions: [],
      effectiveWidth: 1350, reviewer: '李工', reviewTime: '2026-03-05 09:30',
    },
    cuttingPlan: {
      spec: '13×600电池箔×12000-14000', coreSpec: '76mm管芯',
      segments: [
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'order', width: 600, label: '中航锂电①', note: 'SZ2601280290' },
        { type: 'edge', width: 10, label: '边丝', note: '' },
        { type: 'order', width: 600, label: '中航锂电②', note: 'SZ2601280290' },
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'waste', width: 130, label: '余料', note: '' },
      ],
      wasteRate: 11.1,
    },
    planNote: '',
    status: 'planned', completedWeight: null, planDate: '2026-03-05',
  },

  // ── 7#分切机 ──────────────────────
  {
    id: 'SP013', machineId: '7#', seq: 1,
    motherCoilNo: 'Y2601250', alloy: '1060', width: 1350, thickness: 4.5, length: 96000, weight: 2600,
    orderNo: 'SZ2601280300', customer: '河北兴恒', productType: '电池箔',
    reviewStatus: 'reviewed',
    review: {
      conclusion: '正常处理', grade: '一级品', instructions: [],
      effectiveWidth: 1350, reviewer: '王工', reviewTime: '2026-03-05 07:30',
    },
    cuttingPlan: {
      spec: '4.5×872电池箔×46000-48000', coreSpec: '152.4mm管芯',
      segments: [
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'order', width: 872, label: '河北兴恒', note: 'SZ2601280300' },
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'waste', width: 468, label: '余料', note: '可配其他订单' },
      ],
      wasteRate: 35.4,
    },
    planNote: '余料待配单',
    status: 'completed', completedWeight: 2550, planDate: '2026-03-05',
  },
  {
    id: 'SP014', machineId: '7#', seq: 2,
    motherCoilNo: 'Y2601252', alloy: '1060', width: 1350, thickness: 4.5, length: 94000, weight: 2550,
    orderNo: 'SZ2601280315', customer: '弘力科技', productType: '电池箔',
    reviewStatus: 'reviewed',
    review: {
      conclusion: '让步放行', grade: '一级品',
      instructions: [{ side: 'C侧', start: 0, end: 30, defectType: '白条', action: '切除' }],
      effectiveWidth: 1320, reviewer: '李工', reviewTime: '2026-03-05 08:00',
    },
    cuttingPlan: {
      spec: '4.5×654电池箔×44000-46000', coreSpec: '76mm管芯',
      segments: [
        { type: 'defect_cut', width: 30, label: 'C侧切除', note: '白条' },
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'order', width: 654, label: '弘力科技①', note: 'SZ2601280315' },
        { type: 'edge', width: 5, label: '边丝', note: '' },
        { type: 'order', width: 654, label: '弘力科技②', note: 'SZ2601280315' },
        { type: 'edge', width: 2, label: '边丝', note: '' },
      ],
      wasteRate: 3.1,
    },
    planNote: '',
    status: 'running', completedWeight: null, planDate: '2026-03-05',
  },
]

// ============================================================
// 5. 精切排产计划数据（抽样~30条，实际120条用生成函数补充）
// ============================================================
const _finishingBase = [
  {
    id: 'FP001', childCoilNo: 'Y2601301/1-1', motherCoilNo: 'Y2601301', alloy: '1060', thickness: 13, width: 1200, length: 23000,
    customer: '弘力科技', machineId: '3#', finishingSpec: '13×654×6500-7000', corona: '2遍', frameNo: '3195',
    slittingReview: {
      conclusion: '让步放行',
      instructions: [
        { position: '底部5800米', defectType: '针孔', action: '切二级品' },
        { position: 'Q620', defectType: '孔洞', action: '避留白' },
      ]
    },
    multiOrderPlan: {
      note: '底部有5800米缺陷，先切短单消化缺陷',
      orders: [
        { seq: 1, customer: '弘力科技', width: 654, lengthRange: '6500-7000m', note: '消化缺陷' },
        { seq: 2, customer: '源元科技', width: 860, lengthRange: '14000-16000m', note: '用好料' },
      ]
    },
    status: 'completed', planDate: '2026-03-05', seq: 1,
  },
  {
    id: 'FP002', childCoilNo: 'Y2601301/1-2', motherCoilNo: 'Y2601301', alloy: '1060', thickness: 13, width: 1200, length: 23000,
    customer: '源元科技', machineId: '3#', finishingSpec: '13×860×14000-16000', corona: '1遍', frameNo: '3195',
    slittingReview: null, multiOrderPlan: null,
    status: 'completed', planDate: '2026-03-05', seq: 2,
  },
  {
    id: 'FP003', childCoilNo: 'Y2601302/1-1', motherCoilNo: 'Y2601302', alloy: '1100', thickness: 13, width: 1340, length: 24000,
    customer: '河北兴恒', machineId: '5#', finishingSpec: '13×872×12000-14000', corona: '1遍', frameNo: '3201',
    slittingReview: { conclusion: '正常处理', instructions: [] }, multiOrderPlan: null,
    status: 'running', planDate: '2026-03-05', seq: 3,
  },
  {
    id: 'FP004', childCoilNo: 'Y2601305/2-1', motherCoilNo: 'Y2601305', alloy: '1060', thickness: 13, width: 860, length: 16000,
    customer: '中航锂电', machineId: '8#', finishingSpec: '13×600×12000-14000', corona: '2遍', frameNo: '3210',
    slittingReview: {
      conclusion: '让步放行',
      instructions: [{ position: 'Q侧0-100mm', defectType: '白条', action: '避留白' }],
    },
    multiOrderPlan: null,
    status: 'planned', planDate: '2026-03-05', seq: 4,
  },
  {
    id: 'FP005', childCoilNo: 'Y2601305/3-1', motherCoilNo: 'Y2601305', alloy: '1060', thickness: 13, width: 860, length: 15000,
    customer: '弘力科技', machineId: '12#', finishingSpec: '13×654×6500-7000', corona: '1遍', frameNo: '3211',
    slittingReview: null, multiOrderPlan: null,
    status: 'planned', planDate: '2026-03-05', seq: 5,
  },
  {
    id: 'FP006', childCoilNo: 'Y2601280/1-1', motherCoilNo: 'Y2601280', alloy: '1060', thickness: 13, width: 654, length: 7000,
    customer: '弘力科技', machineId: '15#', finishingSpec: '13×654×6500-7000', corona: '2遍', frameNo: '3215',
    slittingReview: { conclusion: '正常处理', instructions: [] }, multiOrderPlan: null,
    status: 'completed', planDate: '2026-03-05', seq: 6,
  },
  {
    id: 'FP007', childCoilNo: 'Y2601280/1-2', motherCoilNo: 'Y2601280', alloy: '1060', thickness: 13, width: 654, length: 7000,
    customer: '弘力科技', machineId: '16#', finishingSpec: '13×654×6500-7000', corona: '1遍', frameNo: '3215',
    slittingReview: null, multiOrderPlan: null,
    status: 'completed', planDate: '2026-03-05', seq: 7,
  },
  {
    id: 'FP008', childCoilNo: 'Y2601282/1-1', motherCoilNo: 'Y2601282', alloy: '1100', thickness: 13, width: 860, length: 16000,
    customer: '源元科技', machineId: '20#', finishingSpec: '13×860×14000-16000', corona: '1遍', frameNo: '3220',
    slittingReview: { conclusion: '正常处理', instructions: [] }, multiOrderPlan: null,
    status: 'running', planDate: '2026-03-05', seq: 8,
  },
  {
    id: 'FP009', childCoilNo: 'Y2601315/1-1', motherCoilNo: 'Y2601315', alloy: '8079', thickness: 6.5, width: 660, length: 30000,
    customer: '海达铝业', machineId: '25#', finishingSpec: '6.5×660×28000-30000', corona: '无', frameNo: '3225',
    slittingReview: { conclusion: '正常处理', instructions: [] }, multiOrderPlan: null,
    status: 'completed', planDate: '2026-03-05', seq: 9,
  },
  {
    id: 'FP010', childCoilNo: 'Y2601315/1-2', motherCoilNo: 'Y2601315', alloy: '8079', thickness: 6.5, width: 660, length: 30000,
    customer: '海达铝业', machineId: '26#', finishingSpec: '6.5×660×28000-30000', corona: '无', frameNo: '3225',
    slittingReview: null, multiOrderPlan: null,
    status: 'completed', planDate: '2026-03-05', seq: 10,
  },
]

// 生成更多精切数据以达到约120条
const _customers = ['弘力科技', '源元科技', '河北兴恒', '中航锂电', '海达铝业', '鑫航铝箔', '兴业铝箔']
const _specs = ['13×654×6500-7000', '13×860×14000-16000', '13×872×12000-14000', '13×600×12000-14000', '6.5×660×28000-30000', '4.5×872×46000-48000']
const _coronas = ['1遍', '2遍', '无']
const _statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'running', 'running', 'planned', 'planned', 'planned']

function generateMoreFinishing() {
  const result = [..._finishingBase]
  for (let i = 11; i <= 120; i++) {
    const custIdx = i % _customers.length
    const specIdx = i % _specs.length
    const machineNum = ((i - 1) % 49) + 1
    result.push({
      id: `FP${String(i).padStart(3, '0')}`,
      childCoilNo: `Y26012${String(50 + Math.floor(i / 3)).padStart(2, '0')}/${(i % 3) + 1}-1`,
      motherCoilNo: `Y26012${String(50 + Math.floor(i / 3)).padStart(2, '0')}`,
      alloy: i % 5 === 0 ? '8079' : i % 3 === 0 ? '1100' : '1060',
      thickness: i % 5 === 0 ? 6.5 : 13,
      width: parseInt(_specs[specIdx].split('×')[1]),
      length: parseInt(_specs[specIdx].split('×')[2].split('-')[0]) || 7000,
      customer: _customers[custIdx],
      machineId: `${machineNum}#`,
      finishingSpec: _specs[specIdx],
      corona: _coronas[i % 3],
      frameNo: String(3200 + i),
      slittingReview: i % 4 === 0 ? { conclusion: '让步放行', instructions: [{ position: '底部3000米', defectType: '针孔', action: '切二级品' }] } : null,
      multiOrderPlan: null,
      status: _statuses[i % _statuses.length],
      planDate: '2026-03-05',
      seq: i,
    })
  }
  return result
}
export const finishingPlans = generateMoreFinishing()

// ============================================================
// 6. 订单数据（含逾期预警）
// ============================================================
export const orders = [
  { orderNo: 'SZ2601280123', contractNo: 'HT2026-0123', customer: '河北兴恒', product: '电池箔成品', alloy: '1060', thickness: 13, width: 872, quantity: 50, completedQuantity: 30, dueDate: '2026-03-07', daysLeft: 2, urgency: 'critical' },
  { orderNo: 'SZ2601280156', contractNo: 'HT2026-0156', customer: '弘力科技', product: '电池箔成品', alloy: '1060', thickness: 13, width: 654, quantity: 30, completedQuantity: 18, dueDate: '2026-03-08', daysLeft: 3, urgency: 'warning' },
  { orderNo: 'SZ2601280178', contractNo: 'HT2026-0178', customer: '源元科技', product: '电池箔成品', alloy: '1060', thickness: 13, width: 860, quantity: 40, completedQuantity: 25, dueDate: '2026-03-08', daysLeft: 3, urgency: 'warning' },
  { orderNo: 'SZ2601280190', contractNo: 'HT2026-0190', customer: '中航锂电', product: '电池箔成品', alloy: '1060', thickness: 13, width: 600, quantity: 60, completedQuantity: 45, dueDate: '2026-03-10', daysLeft: 5, urgency: 'normal' },
  { orderNo: 'SZ2601280210', contractNo: 'HT2026-0210', customer: '海达铝业', product: '双零箔成品', alloy: '8079', thickness: 6.5, width: 660, quantity: 35, completedQuantity: 28, dueDate: '2026-03-12', daysLeft: 7, urgency: 'normal' },
  { orderNo: 'SZ2601280225', contractNo: 'HT2026-0225', customer: '鑫航铝箔', product: '双零箔成品', alloy: '8079', thickness: 6.5, width: 620, quantity: 25, completedQuantity: 10, dueDate: '2026-03-09', daysLeft: 4, urgency: 'normal' },
  { orderNo: 'SZ2601280240', contractNo: 'HT2026-0240', customer: '兴业铝箔', product: '双零箔成品', alloy: '1235', thickness: 6.5, width: 700, quantity: 20, completedQuantity: 5, dueDate: '2026-03-11', daysLeft: 6, urgency: 'normal' },
  { orderNo: 'SZ2601280260', contractNo: 'HT2026-0260', customer: '弘力科技', product: '电池箔成品', alloy: '1060', thickness: 13, width: 654, quantity: 45, completedQuantity: 38, dueDate: '2026-03-06', daysLeft: 1, urgency: 'critical' },
  { orderNo: 'SZ2601280275', contractNo: 'HT2026-0275', customer: '源元科技', product: '电池箔成品', alloy: '1100', thickness: 13, width: 860, quantity: 30, completedQuantity: 20, dueDate: '2026-03-09', daysLeft: 4, urgency: 'normal' },
  { orderNo: 'SZ2601280290', contractNo: 'HT2026-0290', customer: '中航锂电', product: '电池箔成品', alloy: '1060', thickness: 13, width: 600, quantity: 55, completedQuantity: 40, dueDate: '2026-03-10', daysLeft: 5, urgency: 'normal' },
]

// ============================================================
// 7. 今日修改记录
// ============================================================
export const changeLogs = [
  { id: 1, time: '14:30', operator: '张计划', content: '分切1#: Y2601305 优先级 普通→加急（客户催单）', type: 'priority' },
  { id: 2, time: '10:15', operator: '张计划', content: '分切3#→1#: Y2601307 机台变更（3#故障）', type: 'machine' },
  { id: 3, time: '09:00', operator: '张计划', content: '轧机1号: 新增3条计划（Y2601307/Y2601310/Y2601312）', type: 'add' },
  { id: 4, time: '08:45', operator: '张计划', content: '精切8#: Y2601305/2-1 新增计划', type: 'add' },
  { id: 5, time: '08:30', operator: '张计划', content: '分切1#: Y2601305 评审完成，状态更新为可分切', type: 'status' },
]

// ============================================================
// 8. 产能平衡数据
// ============================================================
export const capacityBalance = {
  roughToMedium: { label: '粗轧→中轧', count: 5, status: 'sufficient' },
  mediumToFine: { label: '中轧→精轧', count: 2, status: 'tight' },
  fineToSlitting: { label: '精轧→分切', count: 8, status: 'sufficient' },
}

// ============================================================
// 9. Dashboard 统计数据
// ============================================================
export const dashboardStats = {
  rolling: { planned: 42, completed: 28, running: 6, waiting: 8 },
  slitting: { planned: 45, completed: 32, running: 5, waiting: 8 },
  finishing: { planned: 120, completed: 95, running: 12, waiting: 13 },
  wip: { waitSlitting: 23, waitFinishing: 156, pendingReview: 8 },
  overdueOrders: 3,
  staleCoils: 3,
}

// ============================================================
// 10. 精切设备定义（49台）
// ============================================================
export const finishingMachines = Array.from({ length: 49 }, (_, i) => {
  const num = i + 1;
  const machineId = `${num}#`;
  const hasRunningPlan = finishingPlans.some(p => p.machineId === machineId && p.status === 'running');

  let status = hasRunningPlan ? 'running' : 'waiting';

  if ([10, 30].includes(num)) {
    status = 'fault';
  }

  return {
    id: machineId,
    name: `${num}#精切机`,
    status
  };
});
