// 分切排产计划数据

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
