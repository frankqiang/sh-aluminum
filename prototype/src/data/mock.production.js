// 精切+订单+产能+Dashboard 数据


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
    reviewStatus: 'reviewed',
    slittingReview: {
      conclusion: '正常处理', grade: '一级品', effectiveWidth: 1340,
      reviewer: '李工', reviewTime: '2026-03-05 07:45',
      instructions: []
    },
    plan: [
      { seq: 1, customer: '河北兴恒', orderWidth: 872, lengthMin: 12000, lengthMax: 14000, grade: '一级品', coronaNote: null },
    ],
    wasteRate: 33.4, edgeTrimLeft: 10, edgeTrimRight: 10, seqReason: null,
    multiOrderPlan: null, planNote: '',
    status: 'running', planDate: '2026-03-05', seq: 3,
  },
  {
    id: 'FP003B', childCoilNo: 'Y2601302/1-2', motherCoilNo: 'Y2601302', alloy: '1100', thickness: 13, width: 1340, length: 22000,
    customer: '河北兴恒', machineId: '5#', finishingSpec: '13×872×12000-14000', corona: '1遍', frameNo: '3201',
    reviewStatus: 'reviewed',
    slittingReview: {
      conclusion: '正常处理', grade: '一级品', effectiveWidth: 1340,
      reviewer: '李工', reviewTime: '2026-03-05 07:45',
      instructions: []
    },
    plan: [
      { seq: 1, customer: '河北兴恒', orderWidth: 872, lengthMin: 12000, lengthMax: 14000, grade: '一级品', coronaNote: null },
    ],
    wasteRate: 33.4, edgeTrimLeft: 10, edgeTrimRight: 10, seqReason: null,
    multiOrderPlan: null, planNote: '',
    status: 'planned', planDate: '2026-03-05', seq: 4,
  },
  {
    id: 'FP004', childCoilNo: 'Y2601305/2-1', motherCoilNo: 'Y2601305', alloy: '1060', thickness: 13, width: 860, length: 16000,
    customer: '中航锂电', machineId: '8#', finishingSpec: '13×600×12000-14000', corona: '2遍', frameNo: '3210',
    reviewStatus: 'reviewed',
    slittingReview: {
      conclusion: '让步放行', grade: '二级品', effectiveWidth: 760,
      reviewer: '王工', reviewTime: '2026-03-05 09:30',
      instructions: [
        { locationType: 'width', side: 'Q侧', position: '0-100', defectType: '白条', action: '避留白' },
        { locationType: 'length', locationDesc: '底部0-3000米', defectType: '针孔', action: '切二级品' },
      ],
    },
    plan: [
      { seq: 1, customer: '中航锂电·短单', orderWidth: 600, lengthMin: 3000, lengthMax: 4000, grade: '二级品', coronaNote: '消化底部缺陷区' },
      { seq: 2, customer: '中航锂电·正单', orderWidth: 600, lengthMin: 12000, lengthMax: 14000, grade: '一级品', coronaNote: null },
    ],
    wasteRate: 18.6, edgeTrimLeft: 30, edgeTrimRight: 70, seqReason: '底部3000米质量差，先切短单消化缺陷后再切正品长单',
    multiOrderPlan: null, planNote: '注意底部缺陷段，切换订单时及时破卷',
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
    reviewStatus: 'reviewed',
    slittingReview: {
      conclusion: '正常处理', grade: '一级品', effectiveWidth: 860,
      reviewer: '李工', reviewTime: '2026-03-05 08:30',
      instructions: []
    },
    plan: [
      { seq: 1, customer: '源元科技', orderWidth: 860, lengthMin: 14000, lengthMax: 16000, grade: '一级品', coronaNote: null },
    ],
    wasteRate: 0, edgeTrimLeft: 0, edgeTrimRight: 0, seqReason: null,
    multiOrderPlan: null, planNote: '',
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
  { id: 1, time: '14:30', operator: '张计划', content: '分切1#: Y2601305 优先级 普通→加急（客户催单）', type: 'priority', isUrgent: true },
  { id: 2, time: '10:15', operator: '张计划', content: '分切3#→1#: Y2601307 机台变更（3#故障）', type: 'machine', isUrgent: false },
  { id: 3, time: '09:00', operator: '张计划', content: '轧机1号: 新增3条计划（Y2601307/Y2601310/Y2601312）', type: 'add', isUrgent: false },
  { id: 4, time: '08:45', operator: '张计划', content: '精切8#: Y2601305/2-1 新增计划', type: 'add', isUrgent: false },
  { id: 5, time: '08:30', operator: '张计划', content: '分切1#: Y2601305 评审完成，状态更新为可分切', type: 'status', isUrgent: false },
  { id: 6, time: '06:00', operator: '李主管', content: '插单: 中航锂电加急 SZ2601280290 （大客户特殊订单）', type: 'urgent', isUrgent: true },
]

// ============================================================
// 8. 产能平衡数据
// ============================================================
export const capacityBalance = {
  // 粗轧→中轧缓冲：当前道次间等待卷数
  roughToMedium: { label: '粗轧→中轧', count: 5, threshold: 2, status: 'sufficient' },
  // 中轧→精轧缓冲：仅2卷，接近告警阈值
  mediumToFine: { label: '中轧→精轧', count: 2, threshold: 2, status: 'tight' },
  // 精轧→分切缓冲
  fineToSlitting: { label: '精轧→分切', count: 8, threshold: 2, status: 'sufficient' },
}

// ============================================================
// 9. Dashboard 统计数据
// ============================================================
export const dashboardStats = {
  // 各工序计划执行情况（卷数）
  rolling: {
    planned: 42, completed: 28, running: 6, waiting: 8,
    plannedTons: 105.0, completedTons: 70.0,  // 吨位维度
  },
  slitting: {
    planned: 45, completed: 32, running: 5, waiting: 8,
    plannedTons: 112.5, completedTons: 80.0,
  },
  finishing: {
    planned: 120, completed: 95, running: 12, waiting: 13,
    plannedTons: 78.0, completedTons: 61.8,
  },

  // 在制品积压状态
  wip: {
    waitSlitting: 23,     // 待分切
    waitFinishing: 156,   // 待精切
    pendingReview: 8,     // 待评审（质量评审未完成，阻塞排产）
    qualityBlocked: 5,    // 质量阻塞（评审未通过/降级等待重排）
    stale3Days: 4,        // 呆滞料：超3天未处理
    stale7Days: 1,        // 呆滞料：超7天未处理（严重）
  },

  // 整体进度 KPI（方案3.2界面示意明确要求）
  overview: {
    orderCompletionRate: 87,   // 订单完成率（%）
    overdueOrders: 3,          // 当前逾期订单数
    urgentOrders: 2,           // 急单/插单数
    onTimeRate: 85,            // 订单准时率（%）
    schedulePlanRate: 91,      // 计划达成率（%）
    avgWasteRate: 8.6,         // 平均废料率（%）
  },
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

// 精切计划（25条，覆盖已完成/进行中/待评审/计划中状态）
export const precisionPlans = [
  // ===== 已完成 =====
  {
    id: 'pc-001', date: '2026-03-05',
    subCoilNo: 'Y2412380/1-1', motherCoilNo: 'Y2412380', frameNo: '3195',
    machineId: '3', alloy: '1100', productType: '电池箔',
    thickness: 13, width: 1200, length: 23000,
    plan: [
      // 破卷①对应精切①：底部有缺陷，破卷时需扒废
      { seq: 1, type: 'order', orderNo: 'SZ25121602434', customer: '弘力科技', orderWidth: 654, lengthMin: 6500, lengthMax: 7000, grade: '二级品', coronaNote: 'Q100+C25扒废' },
      { seq: 2, type: 'order', orderNo: 'SZ25121602435', customer: '源元科技', orderWidth: 860, lengthMin: 14000, lengthMax: 16000, grade: '一级品', coronaNote: '' },
    ],
    edgeTrimLeft: 8, edgeTrimRight: 8,
    seqReason: '底部有5800米缺陷，先切短单消化缺陷',
    note: '过电晕，达因值≥33',
    reviewStatus: 'reviewed',
    review: { conclusion: '让步放行', grade: '一级品', effectiveWidth: 1075, instructions: [] },
    status: 'completed', wasteRate: 44.8,
    changeLog: [{ time: '03-05 09:00', operator: '张计划', action: '新增计划' }],
  },
  {
    id: 'pc-002', date: '2026-03-05',
    subCoilNo: 'Y2412465/3-1', motherCoilNo: 'Y2412465', frameNo: '6122',
    machineId: '5', alloy: '1060', productType: '电池箔',
    thickness: 15, width: 990, length: 33000,
    plan: [
      { seq: 1, type: 'order', orderNo: 'SZ25121602440', customer: '河北兴恒', orderWidth: 875, lengthMin: 14000, lengthMax: 16000, grade: '一级品', coronaNote: 'Q80针孔切除' },
    ],
    edgeTrimLeft: 8, edgeTrimRight: 8,
    seqReason: '',
    note: '',
    reviewStatus: 'reviewed',
    review: { conclusion: '让步放行', grade: '一级品', effectiveWidth: 910, instructions: [] },
    status: 'completed', wasteRate: 10.8,
    changeLog: [{ time: '03-05 08:30', operator: '张计划', action: '新增计划' }],
  },
  {
    id: 'pc-003', date: '2026-03-05',
    subCoilNo: 'Y2412528/3-1', motherCoilNo: 'Y2412528', frameNo: '5847',
    machineId: '2', alloy: '1060', productType: '电池箔',
    thickness: 15, width: 1350, length: 33000,
    plan: [
      // 一次破卷涵盖全部精切段（段①有破卷备注，段②为空表示无需单独破卷）
      { seq: 1, type: 'order', orderNo: 'SZ25121602441', customer: '中航锂电', orderWidth: 640, lengthMin: 12000, lengthMax: 14000, grade: '一级品', coronaNote: 'Q1350' },
      { seq: 2, type: 'order', orderNo: 'SZ25121602442', customer: '弘力科技', orderWidth: 640, lengthMin: 12000, lengthMax: 14000, grade: '一级品', coronaNote: '' },
    ],
    edgeTrimLeft: 8, edgeTrimRight: 8,
    seqReason: '两订单宽度相同，同时切割',
    note: '',
    reviewStatus: 'reviewed',
    review: { conclusion: '正常处理', grade: '一级品', effectiveWidth: 1350, instructions: [] },
    status: 'completed', wasteRate: 4.7,
    changeLog: [{ time: '03-05 07:00', operator: '张计划', action: '新增计划' }],
  },
  {
    id: 'pc-004', date: '2026-03-05',
    subCoilNo: 'Y2412868/2-1', motherCoilNo: 'Y2412868', frameNo: '4021',
    machineId: '8', alloy: '1100', productType: '电池箔',
    thickness: 13, width: 990, length: 32000,
    plan: [
      { seq: 1, type: 'order', orderNo: 'SZ25121602450', customer: '源元科技', orderWidth: 870, lengthMin: 14000, lengthMax: 16000, grade: '一级品', coronaNote: '' },
    ],
    edgeTrimLeft: 8, edgeTrimRight: 8,
    seqReason: '',
    note: '',
    reviewStatus: 'reviewed',
    review: { conclusion: '正常处理', grade: '一级品', effectiveWidth: 990, instructions: [] },
    status: 'completed', wasteRate: 11.1,
    changeLog: [{ time: '03-05 06:30', operator: '张计划', action: '新增计划' }],
  },
  {
    id: 'pc-005', date: '2026-03-05',
    subCoilNo: 'Y2412422/8-1', motherCoilNo: 'Y2412422', frameNo: '3580',
    machineId: '1', alloy: '1070', productType: '电池箔',
    thickness: 13, width: 1560, length: 34000,
    plan: [
      { seq: 1, type: 'order', orderNo: 'SZ25121602455', customer: '河北兴恒', orderWidth: 752, lengthMin: 13000, lengthMax: 16000, grade: '一级品', coronaNote: 'C190压坑避留白' },
      { seq: 2, type: 'order', orderNo: 'SZ25121602456', customer: '河北兴恒', orderWidth: 752, lengthMin: 13000, lengthMax: 15000, grade: '一级品', coronaNote: '' },
    ],
    edgeTrimLeft: 8, edgeTrimRight: 8,
    seqReason: '两订单宽度一致，宽度方向同时切',
    note: '',
    reviewStatus: 'reviewed',
    review: { conclusion: '让步放行', grade: '一级品', effectiveWidth: 1370, instructions: [] },
    status: 'completed', wasteRate: 3.1,
    changeLog: [{ time: '03-05 08:00', operator: '张计划', action: '新增计划' }],
  },
  // ===== 进行中 =====
  {
    id: 'pc-006', date: '2026-03-05',
    subCoilNo: 'Y2412624/1-1', motherCoilNo: 'Y2412624', frameNo: '3847',
    machineId: '3', alloy: '1235', productType: '电池箔',
    thickness: 13, width: 1560, length: 34000,
    plan: [
      { seq: 1, type: 'order', orderNo: 'SZ25121602460', customer: '弘力科技', orderWidth: 756, lengthMin: 13000, lengthMax: 16000, grade: '一级品', coronaNote: 'Q1510' },
      { seq: 2, type: 'order', orderNo: 'SZ25121602461', customer: '源元科技', orderWidth: 648, lengthMin: 12000, lengthMax: 16000, grade: '一级品', coronaNote: '' },
    ],
    edgeTrimLeft: 8, edgeTrimRight: 8,
    seqReason: '宽度方向同时切，合计1412mm在有效宽度内',
    note: '',
    reviewStatus: 'reviewed',
    review: { conclusion: '让步放行', grade: '一级品', effectiveWidth: 1510, instructions: [] },
    status: 'running', wasteRate: 9.5,
    changeLog: [{ time: '03-05 10:00', operator: '张计划', action: '新增计划' }],
  },
  {
    id: 'pc-007', date: '2026-03-05',
    subCoilNo: 'Y2412380/2-1', motherCoilNo: 'Y2412380', frameNo: '3196',
    machineId: '5', alloy: '1100', productType: '电池箔',
    thickness: 13, width: 1200, length: 23000,
    plan: [
      { seq: 1, type: 'order', orderNo: 'SZ25121602462', customer: '中航锂电', orderWidth: 872, lengthMin: 10000, lengthMax: 12000, grade: '一级品', coronaNote: 'Q180+C25扒废' },
    ],
    edgeTrimLeft: 8, edgeTrimRight: 8,
    seqReason: '',
    note: 'Q180针孔切除，C25针孔切除',
    reviewStatus: 'reviewed',
    review: { conclusion: '让步放行', grade: '一级品', effectiveWidth: 1100, instructions: [] },
    status: 'running', wasteRate: 26.7,
    changeLog: [{ time: '03-05 09:30', operator: '张计划', action: '新增计划' }],
  },
  // ===== 待评审 =====
  {
    id: 'pc-008', date: '2026-03-05',
    subCoilNo: 'Y2412695/8-1', motherCoilNo: 'Y2412695', frameNo: 'B052',
    machineId: '7', alloy: '1100', productType: '电池箔',
    thickness: 13, width: 1610, length: 33500,
    plan: [
      { seq: 1, type: 'order', orderNo: 'SZ25121602470', customer: '弘力科技', orderWidth: 520, lengthMin: 12000, lengthMax: 15000, grade: '一级品', coronaNote: '' },
      { seq: 2, type: 'order', orderNo: 'SZ25121602471', customer: '河北兴恒', orderWidth: 864, lengthMin: 10000, lengthMax: 11000, grade: '一级品', coronaNote: '' },
    ],
    edgeTrimLeft: 8, edgeTrimRight: 8,
    seqReason: '',
    note: '',
    reviewStatus: 'pending',
    review: null,
    status: 'planned', wasteRate: 13.5,
    changeLog: [{ time: '03-05 11:00', operator: '张计划', action: '新增计划' }],
  },
  {
    id: 'pc-009', date: '2026-03-05',
    subCoilNo: 'Y2412776/2-1', motherCoilNo: 'Y2412776', frameNo: '3305',
    machineId: '12', alloy: '1060', productType: '电池箔',
    thickness: 13, width: 1730, length: 24000,
    plan: [
      { seq: 1, type: 'order', orderNo: 'SZ25121602475', customer: '源元科技', orderWidth: 753, lengthMin: 13000, lengthMax: 16000, grade: '一级品', coronaNote: '' },
    ],
    edgeTrimLeft: 8, edgeTrimRight: 8,
    seqReason: '',
    note: '18042米后针孔切654',
    reviewStatus: 'none',
    review: null,
    status: 'planned', wasteRate: 56.5,
    changeLog: [{ time: '03-05 11:30', operator: '张计划', action: '新增计划' }],
  },
  // ===== 计划中 =====
  {
    id: 'pc-010', date: '2026-03-05',
    subCoilNo: 'Y2412814/1-1', motherCoilNo: 'Y2412814', frameNo: '3347',
    machineId: '8', alloy: '1060', productType: '电池箔',
    thickness: 15, width: 1430, length: 25000,
    plan: [
      // 破卷①②③ 分段逐一扒废，对应各自精切段
      { seq: 1, type: 'order', orderNo: 'SZ25121602480', customer: '弘力科技', orderWidth: 337, lengthMin: 9000, lengthMax: 8200, grade: '二级品', coronaNote: 'Q800+330扒废' },
      { seq: 2, type: 'order', orderNo: 'SZ25121602481', customer: '河北兴恒', orderWidth: 300, lengthMin: 2700, lengthMax: 2800, grade: '二级品', coronaNote: 'Q800+330扒废' },
      { seq: 3, type: 'order', orderNo: 'SZ25121602482', customer: '源元科技', orderWidth: 337, lengthMin: 9000, lengthMax: 8200, grade: '一级品', coronaNote: '' },
    ],
    edgeTrimLeft: 8, edgeTrimRight: 8,
    seqReason: '底部11000米多处横向针孔，先切二级品消化缺陷',
    note: 'Q800孔洞刨切除',
    reviewStatus: 'reviewed',
    review: { conclusion: '让步放行', grade: '一级品', effectiveWidth: 1430, instructions: [] },
    status: 'planned', wasteRate: 31.5,
    changeLog: [{ time: '03-05 12:00', operator: '张计划', action: '新增计划' }],
  },
  // 补充更多计划中的记录（pc-011 ~ pc-025 使用相似结构填充不同客户/机台/子卷号）
  ...Array.from({ length: 15 }, (_, i) => {
    const customers = ['弘力科技', '源元科技', '河北兴恒', '中航锂电']
    const alloys = ['1060', '1100', '1235D', '1070']
    const machines = ['1', '2', '3', '4', '5', '6', '7', '8']
    const idx = i
    return {
      id: `pc-${String(idx + 11).padStart(3, '0')}`,
      date: '2026-03-05',
      subCoilNo: `Y24123${10 + idx}/1-1`,
      motherCoilNo: `Y24123${10 + idx}`,
      frameNo: `${3400 + idx * 10}`,
      machineId: machines[idx % machines.length],
      alloy: alloys[idx % alloys.length],
      productType: '电池箔',
      thickness: 13,
      width: 1200 + (idx % 4) * 100,
      length: 20000 + idx * 1000,
      plan: [
        {
          seq: 1, type: 'order',
          orderNo: `SZ2601${28100 + idx}`,
          customer: customers[idx % customers.length],
          orderWidth: 650 + idx * 20,
          lengthMin: 10000, lengthMax: 12000,
          grade: '一级品',
          coronaNote: '',
        },
      ],
      edgeTrimLeft: 8, edgeTrimRight: 8,
      seqReason: '',
      note: '',
      reviewStatus: 'reviewed',
      review: { conclusion: '正常处理', grade: '一级品', effectiveWidth: 1200 + (idx % 4) * 100, instructions: [] },
      status: 'planned',
      wasteRate: parseFloat(((16 + idx * 1.5) % 30).toFixed(1)),
      changeLog: [{ time: `03-05 ${String(12 + Math.floor(idx / 4)).padStart(2, '0')}:${String((idx % 4) * 15).padStart(2, '0')}`, operator: '张计划', action: '新增计划' }],
    }
  }),
]

