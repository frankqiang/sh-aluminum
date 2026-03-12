// 在制品统计摘要（基于 coils-*.js 中的 mock 数据计算）
// 用于在制品看板的统计卡片区域

export const materialStats = {
    // 合计
    total: 47,          // 在制品料卷总数（25+12+10）
    todayFlow: 9,       // 今日（2026-03-09）已发生流转的料卷数

    // 等待流转数量
    waitSlitting: 8,    // 轧机区中 rolling_reviewed 状态（待分切排产）
    waitFinishing: 9,   // 分切区中 finishing_planned/slitting_reviewed 状态（待精切）
    waitReview: 10,     // 处于 rolled/rolling_qc/slitting_qc/finishing_qc 状态（质检中/待评审）

    // 预警数量
    overdueCount: 7,    // 7~14 天未处理（橙色超期）
    staleCount: 5,      // 超过 14 天未处理（红色呆滞）

    // 各区在制品数量（用于工序流转管道图）
    byZone: {
        rolling: 12,      // 轧机区
        slitting: 25,     // 分切区（最多，体现痛点）
        finishing: 10,    // 精切区
    },

    // 各工序流转节点数量（包含退火节点）
    pipeline: [
        { id: 'billet', name: '胚料', count: 0 },
        { id: 'rolling', name: '轧机', count: 12 },
        { id: 'slitting', name: '分切', count: 25 },
        { id: 'annealing', name: '退火', count: 0 },
        { id: 'finishing', name: '精切', count: 10 },
        { id: 'packaging', name: '包装', count: 0 },
    ],
}
