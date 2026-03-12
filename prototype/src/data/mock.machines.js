// 机台设备定义

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
