/**
 * 生产执行模块 — 关联料卷 Mock 数据
 * 以订单ID为键，每个订单对应其关联料卷列表
 */

export const orderCoils = {

    'ORD-001': [
        { coilNo: 'Y2601201/1-1', motherCoilNo: 'Y2601201', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5200, machine: '精切8#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 14:00' },
        { coilNo: 'Y2601201/2-1', motherCoilNo: 'Y2601201', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切9#', finalJudgment: 'nonconform', qualityGrade: 'B', mainConclusion: '让步放行', downgradeReason: '针孔', qualityDetail: '针孔A=62，B=10，已与客户沟通确认接受', completedAt: '2026-03-04 16:20' },
        { coilNo: 'Y2601202/1-1', motherCoilNo: 'Y2601202', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5300, machine: '精切8#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 10:00' },
        { coilNo: 'Y2601203/1-1', motherCoilNo: 'Y2601203', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切10#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 15:30' },
        { coilNo: 'Y2601203/2-1', motherCoilNo: 'Y2601203', stage: 'finishing', stageLabel: '精切中', status: 'processing', statusLabel: '精切中', weight: null, machine: '精切10#', finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601204/1-1', motherCoilNo: 'Y2601204', stage: 'slitting', stageLabel: '分切中', status: 'waiting', statusLabel: '待精切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601205/1-1', motherCoilNo: 'Y2601205', stage: 'rolling', stageLabel: '轧制中', status: 'waiting', statusLabel: '待分切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
    ],

    'ORD-002': [
        { coilNo: 'Y2601101/1-1', motherCoilNo: 'Y2601101', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 10:00' },
        { coilNo: 'Y2601102/1-1', motherCoilNo: 'Y2601102', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切6#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 14:00' },
        { coilNo: 'Y2601103/1-1', motherCoilNo: 'Y2601103', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-07 09:00' },
        { coilNo: 'Y2601104/1-1', motherCoilNo: 'Y2601104', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切6#', finalJudgment: 'nonconform', qualityGrade: 'B', mainConclusion: '让步放行', downgradeReason: '针孔', qualityDetail: 'Q0-80针孔切除后让步，针孔A=48，B=7', completedAt: '2026-03-07 15:00' },
        { coilNo: 'Y2601105/1-1', motherCoilNo: 'Y2601105', stage: 'packing', stageLabel: '待包装', status: 'waiting', statusLabel: '待包装', weight: 4900, machine: null, finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: null },
    ],

    'ORD-003': [
        { coilNo: 'Y2601301/1-1', motherCoilNo: 'Y2601301', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切12#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-07 11:00' },
        { coilNo: 'Y2601302/1-1', motherCoilNo: 'Y2601302', stage: 'finishing', stageLabel: '精切中', status: 'processing', statusLabel: '精切中', weight: null, machine: '精切13#', finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601303/1-1', motherCoilNo: 'Y2601303', stage: 'slitting', stageLabel: '分切中', status: 'waiting', statusLabel: '待精切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601304/1-1', motherCoilNo: 'Y2601304', stage: 'rolling', stageLabel: '轧制中', status: 'waiting', statusLabel: '待分切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
    ],

    'ORD-004': [
        { coilNo: 'Y2601401/1-1', motherCoilNo: 'Y2601401', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切3#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-07 14:00' },
        { coilNo: 'Y2601401/2-1', motherCoilNo: 'Y2601401', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切4#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-07 16:00' },
        { coilNo: 'Y2601402/1-1', motherCoilNo: 'Y2601402', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切3#', finalJudgment: 'nonconform', qualityGrade: 'B', mainConclusion: '让步放行', downgradeReason: '针孔', qualityDetail: '针孔A=55，B=8，在允许范围边缘', completedAt: '2026-03-08 10:00' },
        { coilNo: 'Y2601402/2-1', motherCoilNo: 'Y2601402', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切4#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 11:00' },
        { coilNo: 'Y2601403/1-1', motherCoilNo: 'Y2601403', stage: 'finishing', stageLabel: '精切中', status: 'processing', statusLabel: '精切中', weight: null, machine: '精切5#', finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601404/1-1', motherCoilNo: 'Y2601404', stage: 'slitting', stageLabel: '分切中', status: 'waiting', statusLabel: '待精切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601405/1-1', motherCoilNo: 'Y2601405', stage: 'rolling', stageLabel: '轧制中', status: 'waiting', statusLabel: '待分切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
    ],

    'ORD-005': [
        { coilNo: 'Y2602101/1-1', motherCoilNo: 'Y2602101', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5200, machine: '精切20#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-07 15:00' },
        { coilNo: 'Y2602102/1-1', motherCoilNo: 'Y2602102', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切21#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 09:00' },
        { coilNo: 'Y2602103/1-1', motherCoilNo: 'Y2602103', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切20#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 14:00' },
        { coilNo: 'Y2602104/1-1', motherCoilNo: 'Y2602104', stage: 'finishing', stageLabel: '精切中', status: 'processing', statusLabel: '精切中', weight: null, machine: '精切22#', finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2602105/1-1', motherCoilNo: 'Y2602105', stage: 'slitting', stageLabel: '分切中', status: 'waiting', statusLabel: '待精切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2602106/1-1', motherCoilNo: 'Y2602106', stage: 'rolling', stageLabel: '轧制中', status: 'waiting', statusLabel: '待分切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
    ],

    'ORD-006': [
        { coilNo: 'Y2602201/1-1', motherCoilNo: 'Y2602201', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切7#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 10:00' },
        { coilNo: 'Y2602201/2-1', motherCoilNo: 'Y2602201', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切8#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 12:00' },
        { coilNo: 'Y2602202/1-1', motherCoilNo: 'Y2602202', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切7#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-07 09:00' },
        { coilNo: 'Y2602203/1-1', motherCoilNo: 'Y2602203', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切9#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-07 15:00' },
        { coilNo: 'Y2602204/1-1', motherCoilNo: 'Y2602204', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5200, machine: '精切8#', finalJudgment: 'nonconform', qualityGrade: 'B', mainConclusion: '让步放行', qualityDetail: '边裂轻微，Q侧0-30mm，客户沟通确认接受', completedAt: '2026-03-08 10:00' },
        { coilNo: 'Y2602205/1-1', motherCoilNo: 'Y2602205', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4800, machine: '精切9#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 16:00' },
        { coilNo: 'Y2602206/1-1', motherCoilNo: 'Y2602206', stage: 'packing', stageLabel: '待包装', status: 'waiting', statusLabel: '待包装', weight: 5000, machine: null, finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: null },
        { coilNo: 'Y2602207/1-1', motherCoilNo: 'Y2602207', stage: 'packing', stageLabel: '待包装', status: 'waiting', statusLabel: '待包装', weight: 5000, machine: null, finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: null },
    ],

    'ORD-007': [
        { coilNo: 'Y2602301/1-1', motherCoilNo: 'Y2602301', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4200, machine: '精切18#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-07 11:00' },
        { coilNo: 'Y2602302/1-1', motherCoilNo: 'Y2602302', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4100, machine: '精切19#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 09:00' },
        { coilNo: 'Y2602303/1-1', motherCoilNo: 'Y2602303', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4300, machine: '精切18#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 15:00' },
        { coilNo: 'Y2602304/1-1', motherCoilNo: 'Y2602304', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4200, machine: '精切19#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-09 10:00' },
        { coilNo: 'Y2602305/1-1', motherCoilNo: 'Y2602305', stage: 'finishing', stageLabel: '精切中', status: 'processing', statusLabel: '精切中', weight: null, machine: '精切20#', finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2602306/1-1', motherCoilNo: 'Y2602306', stage: 'slitting', stageLabel: '分切中', status: 'waiting', statusLabel: '待精切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2602307/1-1', motherCoilNo: 'Y2602307', stage: 'rolling', stageLabel: '轧制中', status: 'waiting', statusLabel: '待分切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2602308/1-1', motherCoilNo: 'Y2602308', stage: 'rolling', stageLabel: '轧制中', status: 'waiting', statusLabel: '待分切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2602309/1-1', motherCoilNo: 'Y2602309', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2602310/1-1', motherCoilNo: 'Y2602310', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
    ],

    'ORD-008': [
        { coilNo: 'Y2601501/1-1', motherCoilNo: 'Y2601501', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4800, machine: '精切2#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 10:00' },
        { coilNo: 'Y2601502/1-1', motherCoilNo: 'Y2601502', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切3#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 14:00' },
        { coilNo: 'Y2601503/1-1', motherCoilNo: 'Y2601503', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切2#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-09 09:00' },
        { coilNo: 'Y2601504/1-1', motherCoilNo: 'Y2601504', stage: 'slitting', stageLabel: '分切中', status: 'waiting', statusLabel: '待精切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601505/1-1', motherCoilNo: 'Y2601505', stage: 'rolling', stageLabel: '轧制中', status: 'waiting', statusLabel: '待分切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601506/1-1', motherCoilNo: 'Y2601506', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601507/1-1', motherCoilNo: 'Y2601507', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601508/1-1', motherCoilNo: 'Y2601508', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601509/1-1', motherCoilNo: 'Y2601509', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601510/1-1', motherCoilNo: 'Y2601510', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601511/1-1', motherCoilNo: 'Y2601511', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2601512/1-1', motherCoilNo: 'Y2601512', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
    ],

    'ORD-009': [
        { coilNo: 'Y2603301/1-1', motherCoilNo: 'Y2603301', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切13#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 11:00' },
        { coilNo: 'Y2603302/1-1', motherCoilNo: 'Y2603302', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4800, machine: '精切14#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 16:00' },
        { coilNo: 'Y2603303/1-1', motherCoilNo: 'Y2603303', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切13#', finalJudgment: 'nonconform', qualityGrade: 'B', mainConclusion: '让步放行', qualityDetail: '针孔超标，A区Q0-80mm切废，其余沟通放行', completedAt: '2026-03-09 10:00' },
        { coilNo: 'Y2603304/1-1', motherCoilNo: 'Y2603304', stage: 'finishing', stageLabel: '精切中', status: 'processing', statusLabel: '精切中', weight: null, machine: '精切15#', finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2603305/1-1', motherCoilNo: 'Y2603305', stage: 'slitting', stageLabel: '分切中', status: 'waiting', statusLabel: '待精切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2603306/1-1', motherCoilNo: 'Y2603306', stage: 'rolling', stageLabel: '轧制中', status: 'waiting', statusLabel: '待分切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2603307/1-1', motherCoilNo: 'Y2603307', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2603308/1-1', motherCoilNo: 'Y2603308', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
    ],

    'ORD-010': [
        { coilNo: 'Y2603401/1-1', motherCoilNo: 'Y2603401', stage: 'slitting', stageLabel: '分切中', status: 'waiting', statusLabel: '待精切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2603402/1-1', motherCoilNo: 'Y2603402', stage: 'rolling', stageLabel: '轧制中', status: 'waiting', statusLabel: '待分切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2603403/1-1', motherCoilNo: 'Y2603403', stage: 'rolling', stageLabel: '轧制中', status: 'waiting', statusLabel: '待分切', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2603404/1-1', motherCoilNo: 'Y2603404', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2603405/1-1', motherCoilNo: 'Y2603405', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
        { coilNo: 'Y2603406/1-1', motherCoilNo: 'Y2603406', stage: 'rolling', stageLabel: '轧制待排', status: 'waiting', statusLabel: '待轧制', weight: null, machine: null, finalJudgment: null, qualityGrade: null, mainConclusion: null, qualityDetail: null, completedAt: null },
    ],

    // ── ORD-011：比亚迪，待排产 ──────────────────────────────────
    'ORD-011': [],

    // ── ORD-012：优箔双零，待排产 ────────────────────────────────
    'ORD-012': [],

    'ORD-014': [
        { coilNo: 'Y2601701/1-1', motherCoilNo: 'Y2601701', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切14#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 15:00' },
        { coilNo: 'Y2601702/1-1', motherCoilNo: 'Y2601702', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切15#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-07 09:00' },
        { coilNo: 'Y2601703/1-1', motherCoilNo: 'Y2601703', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切14#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-07 14:00' },
    ],

    'ORD-015': [
        { coilNo: 'Y2602501/1-1', motherCoilNo: 'Y2602501', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4300, machine: '精切25#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 11:00' },
        { coilNo: 'Y2602502/1-1', motherCoilNo: 'Y2602502', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4400, machine: '精切26#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-08 15:00' },
        { coilNo: 'Y2602503/1-1', motherCoilNo: 'Y2602503', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4400, machine: '精切25#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-09 09:00' },
        { coilNo: 'Y2602503/2-1', motherCoilNo: 'Y2602503', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4100, machine: '精切26#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-09 10:30' },
        { coilNo: 'Y2602504/1-1', motherCoilNo: 'Y2602504', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4200, machine: '精切25#', finalJudgment: 'nonconform', qualityGrade: 'B', mainConclusion: '让步放行', qualityDetail: '边裂0.5mm，Q侧来料白线，客户确认可用', completedAt: '2026-03-09 09:20' },
    ],

    // ── ORD-016：河北兴恒，已完成（逾期），1100，10μm×1100mm ────────
    'ORD-016': [
        { coilNo: 'Y2601901/1-1', motherCoilNo: 'Y2601901', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切1#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 10:00' },
        { coilNo: 'Y2601902/1-1', motherCoilNo: 'Y2601902', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切2#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 14:00' },
        { coilNo: 'Y2601903/1-1', motherCoilNo: 'Y2601903', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切1#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 18:00' },
        { coilNo: 'Y2601904/1-1', motherCoilNo: 'Y2601904', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4800, machine: '精切2#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 09:00' },
        { coilNo: 'Y2601905/1-1', motherCoilNo: 'Y2601905', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切1#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 14:00' },
        { coilNo: 'Y2601906/1-1', motherCoilNo: 'Y2601906', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切3#', finalJudgment: 'nonconform', qualityGrade: 'B', mainConclusion: '让步放行', qualityDetail: '针孔A=60，B=9，经质量工程师评审后客户确认接受', completedAt: '2026-03-05 16:00' },
        { coilNo: 'Y2601907/1-1', motherCoilNo: 'Y2601907', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切2#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 09:00' },
        { coilNo: 'Y2601908/1-1', motherCoilNo: 'Y2601908', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切1#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 14:00' },
        { coilNo: 'Y2601909/1-1', motherCoilNo: 'Y2601909', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4800, machine: '精切3#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 15:00' },
        { coilNo: 'Y2601910/1-1', motherCoilNo: 'Y2601910', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切2#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 15:20' },
        { coilNo: 'Y2601911/1-1', motherCoilNo: 'Y2601911', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切1#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 15:00' },
        { coilNo: 'Y2601912/1-1', motherCoilNo: 'Y2601912', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切3#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 14:30' },
        { coilNo: 'Y2601913/1-1', motherCoilNo: 'Y2601913', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切2#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 15:10' },
        { coilNo: 'Y2601914/1-1', motherCoilNo: 'Y2601914', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切1#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 15:20' },
    ],

    // ── ORD-017：标兵母卷，已完成，1060，12μm×1400mm ────────────────
    'ORD-017': [
        { coilNo: 'Y2602001/1-1', motherCoilNo: 'Y2602001', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 10:00' },
        { coilNo: 'Y2602002/1-1', motherCoilNo: 'Y2602002', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切6#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 14:00' },
        { coilNo: 'Y2602003/1-1', motherCoilNo: 'Y2602003', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 09:00' },
        { coilNo: 'Y2602004/1-1', motherCoilNo: 'Y2602004', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切6#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 14:00' },
        { coilNo: 'Y2602005/1-1', motherCoilNo: 'Y2602005', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 16:00' },
        { coilNo: 'Y2602006/1-1', motherCoilNo: 'Y2602006', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5100, machine: '精切7#', finalJudgment: 'nonconform', qualityGrade: 'B', mainConclusion: '让步放行', qualityDetail: '边裂2mm，Q侧来料白线，沟通放行', completedAt: '2026-03-06 10:00' },
        { coilNo: 'Y2602007/1-1', motherCoilNo: 'Y2602007', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切6#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 10:00' },
        { coilNo: 'Y2602008/1-1', motherCoilNo: 'Y2602008', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-06 10:00' },
    ],

    // ── ORD-018：宁德时代，已完成，1100，13μm×900mm ─────────────────
    'ORD-018': [
        { coilNo: 'Y2602101/1-1', motherCoilNo: 'Y2602101', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切10#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-03 14:00' },
        { coilNo: 'Y2602102/1-1', motherCoilNo: 'Y2602102', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4800, machine: '精切11#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-03 16:00' },
        { coilNo: 'Y2602103/1-1', motherCoilNo: 'Y2602103', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切10#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 09:00' },
        { coilNo: 'Y2602104/1-1', motherCoilNo: 'Y2602104', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4800, machine: '精切11#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 14:00' },
        { coilNo: 'Y2602105/1-1', motherCoilNo: 'Y2602105', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 5000, machine: '精切10#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 16:00' },
        { coilNo: 'Y2602106/1-1', motherCoilNo: 'Y2602106', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切12#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 10:00' },
        { coilNo: 'Y2602107/1-1', motherCoilNo: 'Y2602107', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4800, machine: '精切11#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 14:00' },
        { coilNo: 'Y2602108/1-1', motherCoilNo: 'Y2602108', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切10#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 14:45' },
        { coilNo: 'Y2602109/1-1', motherCoilNo: 'Y2602109', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4900, machine: '精切12#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 14:40' },
        { coilNo: 'Y2602110/1-1', motherCoilNo: 'Y2602110', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4800, machine: '精切11#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-05 14:45' },
    ],

    // ── ORD-019：精切标兵，已完成，1235D，12μm×810mm ────────────────
    'ORD-019': [
        { coilNo: 'Y2602401/1-1', motherCoilNo: 'Y2602401', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切16#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-02 14:00' },
        { coilNo: 'Y2602402/1-1', motherCoilNo: 'Y2602402', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切17#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-03 09:00' },
        { coilNo: 'Y2602403/1-1', motherCoilNo: 'Y2602403', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切16#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-03 15:00' },
        { coilNo: 'Y2602404/1-1', motherCoilNo: 'Y2602404', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切17#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 10:00' },
        { coilNo: 'Y2602405/1-1', motherCoilNo: 'Y2602405', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切16#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 16:30' },
        { coilNo: 'Y2602406/1-1', motherCoilNo: 'Y2602406', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切17#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-04 16:20' },
    ],

    // ── ORD-020：比亚迪，已完成，1100，12μm×820mm ──────────────────
    'ORD-020': [
        { coilNo: 'Y2602301/1-1', motherCoilNo: 'Y2602301', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切4#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-02-28 14:00' },
        { coilNo: 'Y2602302/1-1', motherCoilNo: 'Y2602302', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-02-28 16:00' },
        { coilNo: 'Y2602303/1-1', motherCoilNo: 'Y2602303', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切4#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-01 09:00' },
        { coilNo: 'Y2602304/1-1', motherCoilNo: 'Y2602304', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4800, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-01 14:00' },
        { coilNo: 'Y2602305/1-1', motherCoilNo: 'Y2602305', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切4#', finalJudgment: 'nonconform', qualityGrade: 'B', mainConclusion: '让步放行', qualityDetail: '针孔A=55，B=8，Q侧轻微辊印，客户确认接受', completedAt: '2026-03-01 16:00' },
        { coilNo: 'Y2602306/1-1', motherCoilNo: 'Y2602306', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-02 09:00' },
        { coilNo: 'Y2602307/1-1', motherCoilNo: 'Y2602307', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切4#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-02 11:00' },
        { coilNo: 'Y2602308/1-1', motherCoilNo: 'Y2602308', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-02 11:15' },
        { coilNo: 'Y2602309/1-1', motherCoilNo: 'Y2602309', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切4#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-02 10:50' },
        { coilNo: 'Y2602310/1-1', motherCoilNo: 'Y2602310', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-02 11:15' },
        { coilNo: 'Y2602311/1-1', motherCoilNo: 'Y2602311', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4700, machine: '精切4#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-02 11:10' },
        { coilNo: 'Y2602312/1-1', motherCoilNo: 'Y2602312', stage: 'completed', stageLabel: '已完成', status: 'completed', statusLabel: '已完成', weight: 4600, machine: '精切5#', finalJudgment: 'conform', qualityGrade: 'A', mainConclusion: '正常入库', qualityDetail: null, completedAt: '2026-03-02 11:15' },
    ],
}
