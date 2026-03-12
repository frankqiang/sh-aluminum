// 料卷状态枚举：覆盖从胚料出库到包装完成的全流程
// 字段说明：label=中文名称，color=显示色，phase=所属工序阶段
export const coilStatuses = {
    // 胚料阶段
    billet_out: { label: '胚料出库', color: '#94a3b8', phase: 'billet' },

    // 轧机阶段
    rolling_planned: { label: '轧机排产中', color: '#3b82f6', phase: 'rolling' },
    rolling: { label: '轧制中', color: '#06b6d4', phase: 'rolling' },
    rolled: { label: '已下料', color: '#67e8f9', phase: 'rolling' },
    rolling_qc: { label: '轧机质检中', color: '#f59e0b', phase: 'rolling' },
    rolling_reviewed: { label: '轧机已评审', color: '#10b981', phase: 'rolling' },

    // 分切阶段
    slitting_planned: { label: '分切排产中', color: '#3b82f6', phase: 'slitting' },
    slitting: { label: '分切中', color: '#06b6d4', phase: 'slitting' },
    slitted: { label: '已分切', color: '#67e8f9', phase: 'slitting' },
    slitting_qc: { label: '分切质检中', color: '#f59e0b', phase: 'slitting' },
    slitting_reviewed: { label: '分切已评审', color: '#10b981', phase: 'slitting' },

    // 退火阶段（双零箔专用，暂不纳入原型重点）
    annealing_planned: { label: '退火排产中', color: '#3b82f6', phase: 'annealing' },
    annealing: { label: '退火中', color: '#a855f7', phase: 'annealing' },
    annealed: { label: '已退火', color: '#c4b5fd', phase: 'annealing' },

    // 精切阶段
    finishing_planned: { label: '精切排产中', color: '#3b82f6', phase: 'finishing' },
    finishing: { label: '精切中', color: '#06b6d4', phase: 'finishing' },
    finished: { label: '已精切', color: '#67e8f9', phase: 'finishing' },
    finishing_qc: { label: '精切质检中', color: '#f59e0b', phase: 'finishing' },
    finishing_reviewed: { label: '精切已评审', color: '#10b981', phase: 'finishing' },

    // 包装阶段
    packaging: { label: '待包装', color: '#f97316', phase: 'packaging' },
    packed: { label: '已包装', color: '#10b981', phase: 'packaging' },
}
