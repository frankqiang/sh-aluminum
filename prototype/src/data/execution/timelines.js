/**
 * 生产执行模块 — 生产时间线 Mock 数据
 * 以订单ID为键，每个订单对应其生产时间线事件列表
 * type 取值：plan / rolling / quality / slitting / finishing / packing
 * 统一中粒度：每个关键工序有开始+质检+完成节点，质量问题单独标注
 */

export const orderTimelines = {

    // ── ORD-001：标兵母卷，生产中，1060，10μm×1200mm ────────────────
    'ORD-001': [
        { time: '2026-02-28 09:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26010800751' },
        { time: '2026-02-28 14:00', type: 'plan', title: '排产关联', desc: '计划员李明关联3条母卷（Y2601201~Y2601203）', coilNo: 'Y2601201' },
        { time: '2026-03-01 08:00', type: 'rolling', title: '轧机2# 开始', desc: 'Y2601201 投入轧机2# 第5道次，目标厚度10μm', coilNo: 'Y2601201' },
        { time: '2026-03-01 16:00', type: 'rolling', title: '轧机2# 完成', desc: 'Y2601201 第5道次完成，成品厚度10μm，下料', coilNo: 'Y2601201' },
        { time: '2026-03-01 17:30', type: 'quality', title: '轧机质检', desc: 'Y2601201 厚度/针孔检测通过，压延质量正常', coilNo: 'Y2601201' },
        { time: '2026-03-02 08:30', type: 'slitting', title: '分切4# 开始', desc: 'Y2601201 进入分切4#，切刀规格1200mm', coilNo: 'Y2601201' },
        { time: '2026-03-02 13:00', type: 'slitting', title: '分切完成', desc: 'Y2601201 分切完成，产出子卷 Y2601201/1-1、Y2601201/2-1', coilNo: 'Y2601201' },
        { time: '2026-03-02 15:00', type: 'quality', title: '分切质检', desc: 'Y2601201/2-1 针孔A=62，B=10，超出标准，申请让步', coilNo: 'Y2601201/2-1' },
        { time: '2026-03-02 16:30', type: 'quality', title: '质量评审', desc: 'Y2601201/2-1 与客户沟通确认接受，批准让步放行', coilNo: 'Y2601201/2-1' },
        { time: '2026-03-03 09:00', type: 'finishing', title: '精切8# 开始', desc: 'Y2601201/1-1 投入精切8#', coilNo: 'Y2601201/1-1' },
        { time: '2026-03-04 14:00', type: 'finishing', title: '精切完成', desc: 'Y2601201/1-1 精切完成，待后续母卷完成后入库', coilNo: 'Y2601201/1-1' },
        { time: '2026-03-09 08:00', type: 'finishing', title: '精切10# 进行中', desc: 'Y2601203/2-1 正在精切中，预计今日完成', coilNo: 'Y2601203/2-1' },
    ],

    // ── ORD-002：宁德时代，待包装，1060，13μm×600mm ──────────────────
    'ORD-002': [
        { time: '2026-02-26 10:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ25121602434' },
        { time: '2026-02-26 15:00', type: 'plan', title: '排产关联', desc: '计划员张三关联5条母卷（Y2601101~Y2601105）', coilNo: 'Y2601101' },
        { time: '2026-02-27 08:00', type: 'rolling', title: '轧机8# 开始', desc: 'Y2601101 批次投入轧机8#，目标厚度13μm', coilNo: 'Y2601101' },
        { time: '2026-02-28 15:00', type: 'rolling', title: '轧机8# 完成', desc: '5条母卷全部完成轧制，成品厚度13μm', coilNo: 'Y2601105' },
        { time: '2026-02-28 16:00', type: 'quality', title: '轧机质检', desc: '5条母卷厚度、针孔全部检测通过', coilNo: 'Y2601101' },
        { time: '2026-03-01 08:00', type: 'slitting', title: '分切开始', desc: 'Y2601101 进入分切6#，切刀规格600mm', coilNo: 'Y2601101' },
        { time: '2026-03-02 14:00', type: 'slitting', title: '分切完成', desc: '5条母卷全部分切完成', coilNo: 'Y2601105' },
        { time: '2026-03-03 09:00', type: 'finishing', title: '精切开始', desc: 'Y2601101/1-1 进入精切5#', coilNo: 'Y2601101/1-1' },
        { time: '2026-03-07 15:00', type: 'finishing', title: '精切完成', desc: '4条子卷精切完成，1条待包装', coilNo: 'Y2601104/1-1' },
        { time: '2026-03-07 17:00', type: 'quality', title: '质量评审', desc: 'Y2601104/1-1 Q0-80针孔切除后让步放行，针孔A=48，B=7', coilNo: 'Y2601104/1-1' },
    ],

    // ── ORD-003：优箔母卷，精切中，1060，12μm×800mm ──────────────────
    'ORD-003': [
        { time: '2026-03-01 10:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ25122200335' },
        { time: '2026-03-01 14:00', type: 'plan', title: '排产关联', desc: '计划员李明关联4条母卷（Y2601301~Y2601304）', coilNo: 'Y2601301' },
        { time: '2026-03-02 08:00', type: 'rolling', title: '轧机12# 开始', desc: 'Y2601301 批次投入轧机12#，目标厚度12μm', coilNo: 'Y2601301' },
        { time: '2026-03-03 16:00', type: 'rolling', title: '轧机12# 完成', desc: '前2条母卷完成轧制，后2条轧制中', coilNo: 'Y2601302' },
        { time: '2026-03-04 09:00', type: 'quality', title: '轧机质检', desc: 'Y2601301 检测通过，厚度12μm，压延质量合格', coilNo: 'Y2601301' },
        { time: '2026-03-04 14:00', type: 'slitting', title: '分切3# 开始', desc: 'Y2601301 进入分切3#', coilNo: 'Y2601301' },
        { time: '2026-03-05 10:00', type: 'slitting', title: '分切完成', desc: 'Y2601301 分切完成', coilNo: 'Y2601301' },
        { time: '2026-03-06 09:00', type: 'finishing', title: '精切12# 开始', desc: 'Y2601301/1-1 投入精切12#', coilNo: 'Y2601301/1-1' },
        { time: '2026-03-07 11:00', type: 'finishing', title: '精切完成', desc: 'Y2601301/1-1 精切完成', coilNo: 'Y2601301/1-1' },
        { time: '2026-03-08 09:00', type: 'finishing', title: '精切13# 进行中', desc: 'Y2601302/1-1 正在精切中', coilNo: 'Y2601302/1-1' },
    ],

    // ── ORD-004：标兵母卷，生产中，1060，13μm×1340mm ─────────────────
    'ORD-004': [
        { time: '2026-03-02 10:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ25121602435' },
        { time: '2026-03-02 15:00', type: 'plan', title: '排产关联', desc: '计划员张三关联7条母卷（Y2601401~Y2601407）', coilNo: 'Y2601401' },
        { time: '2026-03-03 08:00', type: 'rolling', title: '轧机3# 开始', desc: 'Y2601401 批次投入轧机3#，目标厚度13μm', coilNo: 'Y2601401' },
        { time: '2026-03-04 16:00', type: 'rolling', title: '轧机3# 完成', desc: '前4条母卷完成轧制，剩余3条排程中', coilNo: 'Y2601404' },
        { time: '2026-03-05 09:00', type: 'quality', title: '轧机质检', desc: 'Y2601401~Y2601404 厚度13μm，全部检测通过', coilNo: 'Y2601401' },
        { time: '2026-03-05 14:00', type: 'slitting', title: '分切3# 开始', desc: 'Y2601401 进入分切3#', coilNo: 'Y2601401' },
        { time: '2026-03-06 15:00', type: 'slitting', title: '分切完成', desc: 'Y2601401/Y2601402 分切完成，产出多条子卷', coilNo: 'Y2601402' },
        { time: '2026-03-07 08:00', type: 'finishing', title: '精切3# 开始', desc: 'Y2601401/1-1 投入精切3#', coilNo: 'Y2601401/1-1' },
        { time: '2026-03-08 10:00', type: 'finishing', title: '精切完成', desc: 'Y2601401/1-1（2-1）精切完成，Y2601402/2-1 完成', coilNo: 'Y2601402/2-1' },
        { time: '2026-03-08 11:30', type: 'quality', title: '质量评审', desc: 'Y2601402/1-1 针孔A=55，B=8，已与客户沟通，批准让步放行', coilNo: 'Y2601402/1-1' },
        { time: '2026-03-09 08:00', type: 'finishing', title: '精切5# 进行中', desc: 'Y2601403/1-1 正在精切中，后续4条排队中', coilNo: 'Y2601403/1-1' },
    ],

    // ── ORD-005：优箔双零，生产中，8079，6μm×1530mm ──────────────────
    'ORD-005': [
        { time: '2026-03-02 14:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26020100881' },
        { time: '2026-03-02 16:00', type: 'plan', title: '排产关联', desc: '计划员王五关联6条母卷（Y2603001~Y2603006），双零箔', coilNo: 'Y2603001' },
        { time: '2026-03-04 08:00', type: 'rolling', title: '轧机开始', desc: 'Y2603001 批次投入轧机，8μm→6μm 多道次轧制', coilNo: 'Y2603001' },
        { time: '2026-03-06 14:00', type: 'rolling', title: '轧机完成', desc: '前3条母卷完成轧制，厚度6μm', coilNo: 'Y2603003' },
        { time: '2026-03-06 16:00', type: 'quality', title: '轧机质检', desc: 'Y2603001~Y2603003 厚度6μm，全数合格', coilNo: 'Y2603001' },
        { time: '2026-03-07 08:00', type: 'slitting', title: '分切开始', desc: 'Y2603001 进入分切，切刀规格1530mm', coilNo: 'Y2603001' },
        { time: '2026-03-07 12:00', type: 'slitting', title: '分切完成', desc: 'Y2603001/Y2603002 分切完成', coilNo: 'Y2603002' },
        { time: '2026-03-07 15:00', type: 'finishing', title: '精切20# 完成', desc: 'Y2603001/1-1 精切完成，入库', coilNo: 'Y2603001/1-1' },
        { time: '2026-03-08 09:00', type: 'finishing', title: '精切完成', desc: 'Y2603002/1-1、Y2603003/1-1 精切完成', coilNo: 'Y2603003/1-1' },
        { time: '2026-03-09 08:00', type: 'finishing', title: '精切22# 进行中', desc: 'Y2603004/1-1 正在精切中', coilNo: 'Y2603004/1-1' },
    ],

    // ── ORD-006：优箔母卷，待包装，1060，13μm×1200mm ─────────────────
    'ORD-006': [
        { time: '2026-03-01 10:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ25121602436' },
        { time: '2026-03-01 15:00', type: 'plan', title: '排产关联', desc: '计划员李明关联5条母卷（Y2603101~Y2603105）', coilNo: 'Y2603101' },
        { time: '2026-03-02 08:00', type: 'rolling', title: '轧机开始', desc: 'Y2603101 批次投入轧机，目标厚度13μm', coilNo: 'Y2603101' },
        { time: '2026-03-04 14:00', type: 'rolling', title: '轧机完成', desc: '5条母卷全部完成轧制', coilNo: 'Y2603105' },
        { time: '2026-03-04 16:00', type: 'quality', title: '轧机质检', desc: '5条母卷全部轧制合格，厚度13μm', coilNo: 'Y2603101' },
        { time: '2026-03-05 08:00', type: 'slitting', title: '分切开始', desc: 'Y2603101 进入分切，切刀规格1200mm', coilNo: 'Y2603101' },
        { time: '2026-03-06 16:00', type: 'slitting', title: '分切完成', desc: '5条母卷全部分切完成，共产出8条子卷', coilNo: 'Y2603105' },
        { time: '2026-03-06 10:00', type: 'finishing', title: '精切7# 开始', desc: 'Y2603101/1-1 投入精切7#', coilNo: 'Y2603101/1-1' },
        { time: '2026-03-08 10:00', type: 'quality', title: '质量评审', desc: 'Y2603104/1-1 边裂轻微，已与客户沟通确认可用，让步放行', coilNo: 'Y2603104/1-1' },
        { time: '2026-03-08 16:00', type: 'finishing', title: '精切完成', desc: '6条子卷精切完成，2条（Y2603105/1-1、2-1）待包装', coilNo: 'Y2603104/2-1' },
    ],

    // ── ORD-007：优箔双零，生产中，8079，6.5μm×760mm ─────────────────
    'ORD-007': [
        { time: '2026-03-02 09:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26020100882' },
        { time: '2026-03-02 14:00', type: 'plan', title: '排产关联', desc: '计划员王五关联10条母卷（Y2603201~Y2603210），双零箔', coilNo: 'Y2603201' },
        { time: '2026-03-04 08:00', type: 'rolling', title: '轧机开始', desc: 'Y2603201 批次投入轧机，多道次轧制至6.5μm', coilNo: 'Y2603201' },
        { time: '2026-03-06 12:00', type: 'rolling', title: '轧机完成', desc: '前4条母卷完成轧制，后6条轧制中/排程中', coilNo: 'Y2603204' },
        { time: '2026-03-06 14:00', type: 'quality', title: '轧机质检', desc: 'Y2603201~Y2603204 厚度6.5μm，全部检测通过', coilNo: 'Y2603201' },
        { time: '2026-03-07 08:00', type: 'slitting', title: '分切开始', desc: 'Y2603201 进入分切，切刀规格760mm', coilNo: 'Y2603201' },
        { time: '2026-03-07 16:00', type: 'slitting', title: '分切完成', desc: 'Y2603201~Y2603204 分切完成', coilNo: 'Y2603204' },
        { time: '2026-03-07 11:00', type: 'finishing', title: '精切18# 开始', desc: 'Y2603201/1-1 投入精切18#', coilNo: 'Y2603201/1-1' },
        { time: '2026-03-09 10:00', type: 'finishing', title: '精切完成', desc: 'Y2603201~Y2603204/1-1 精切完成', coilNo: 'Y2603204/1-1' },
        { time: '2026-03-09 11:00', type: 'finishing', title: '精切20# 进行中', desc: 'Y2603205/1-1 正在精切中，后5条待排程', coilNo: 'Y2603205/1-1' },
    ],

    // ── ORD-008：宁德时代，生产中，1060，13μm×780mm ──────────────────
    'ORD-008': [
        { time: '2026-03-03 09:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ25121602437' },
        { time: '2026-03-03 14:00', type: 'plan', title: '排产关联', desc: '计划员张三关联12条母卷（Y2601501~Y2601512）', coilNo: 'Y2601501' },
        { time: '2026-03-04 08:00', type: 'rolling', title: '轧机2# 开始', desc: 'Y2601501 批次投入轧机2#，目标厚度13μm', coilNo: 'Y2601501' },
        { time: '2026-03-07 14:00', type: 'rolling', title: '轧机完成', desc: '前3条母卷完成轧制，剩余9条轧制/排程中', coilNo: 'Y2601503' },
        { time: '2026-03-07 16:00', type: 'quality', title: '轧机质检', desc: 'Y2601501~Y2601503 检测全部合格，厚度13μm', coilNo: 'Y2601501' },
        { time: '2026-03-08 08:00', type: 'slitting', title: '分切开始', desc: 'Y2601501 进入分切，切刀规格780mm', coilNo: 'Y2601501' },
        { time: '2026-03-08 16:00', type: 'slitting', title: '分切完成', desc: 'Y2601501~Y2601503 分切完成，Y2601504 分切中', coilNo: 'Y2601503' },
        { time: '2026-03-08 10:00', type: 'finishing', title: '精切2# 完成', desc: 'Y2601501/1-1 精切完成', coilNo: 'Y2601501/1-1' },
        { time: '2026-03-09 09:00', type: 'finishing', title: '精切完成', desc: 'Y2601503/1-1 精切完成，Y2601504/1-1 分切中待精切', coilNo: 'Y2601503/1-1' },
    ],

    // ── ORD-009：精切标兵，生产中，1235D，12μm×750mm ─────────────────
    'ORD-009': [
        { time: '2026-03-04 10:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ25122200336' },
        { time: '2026-03-04 15:00', type: 'plan', title: '排产关联', desc: '计划员李明关联8条母卷（Y2603301~Y2603308）', coilNo: 'Y2603301' },
        { time: '2026-03-05 08:00', type: 'rolling', title: '轧机13# 开始', desc: 'Y2603301 批次投入轧机13#，目标厚度12μm', coilNo: 'Y2603301' },
        { time: '2026-03-07 14:00', type: 'rolling', title: '轧机完成', desc: '前6条母卷完成轧制，后2条排程中', coilNo: 'Y2603306' },
        { time: '2026-03-07 16:00', type: 'quality', title: '轧机质检', desc: 'Y2603301~Y2603306 全部合格，厚度12μm', coilNo: 'Y2603301' },
        { time: '2026-03-08 08:00', type: 'slitting', title: '分切开始', desc: 'Y2603301 进入分切，切刀规格750mm', coilNo: 'Y2603301' },
        { time: '2026-03-08 16:00', type: 'slitting', title: '分切完成', desc: 'Y2603301~Y2603303 分切完成，Y2603304 分切中', coilNo: 'Y2603303' },
        { time: '2026-03-08 11:00', type: 'finishing', title: '精切13# 完成', desc: 'Y2603301/1-1 精切完成', coilNo: 'Y2603301/1-1' },
        { time: '2026-03-09 10:00', type: 'quality', title: '质量评审', desc: 'Y2603303/1-1 针孔超标，A区切废后让步放行', coilNo: 'Y2603303/1-1' },
        { time: '2026-03-09 10:30', type: 'finishing', title: '精切15# 进行中', desc: 'Y2603304/1-1 正在精切中', coilNo: 'Y2603304/1-1' },
    ],

    // ── ORD-010：河北兴恒，生产中，1100，12μm×960mm ──────────────────
    'ORD-010': [
        { time: '2026-03-05 10:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26010800752' },
        { time: '2026-03-05 16:00', type: 'plan', title: '排产关联', desc: '计划员李明关联6条母卷（Y2603401~Y2603406）', coilNo: 'Y2603401' },
        { time: '2026-03-07 08:00', type: 'rolling', title: '轧机开始', desc: 'Y2603401/Y2603402 先行投入轧机，目标厚度12μm', coilNo: 'Y2603401' },
        { time: '2026-03-08 16:00', type: 'rolling', title: '轧机完成', desc: 'Y2603401 完成轧制，Y2603402 轧制中，其余排程中', coilNo: 'Y2603401' },
        { time: '2026-03-09 08:00', type: 'quality', title: '轧机质检', desc: 'Y2603401 检测通过，厚度12μm', coilNo: 'Y2603401' },
        { time: '2026-03-09 09:00', type: 'slitting', title: '分切开始', desc: 'Y2603401 进入分切工序，Y2603402 轧制中', coilNo: 'Y2603401' },
    ],

    // ── ORD-011：比亚迪，待排产 ──────────────────────────────────────
    'ORD-011': [
        { time: '2026-03-06 14:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ25121602438' },
        { time: '2026-03-06 16:00', type: 'plan', title: '等待排产', desc: '订单已录入，等待计划员分配母卷，原料备货中' },
    ],

    // ── ORD-012：优箔双零，待排产 ────────────────────────────────────
    'ORD-012': [
        { time: '2026-03-07 10:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26020500123' },
        { time: '2026-03-07 11:00', type: 'plan', title: '等待排产', desc: '双零箔订单，等待原料入库后排产，预计3月11日开始' },
    ],

    // ── ORD-013：河北兴恒，已完成，1060，13μm×1340mm ─────────────────
    'ORD-013': [
        { time: '2026-02-20 09:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26010800753' },
        { time: '2026-02-20 14:30', type: 'plan', title: '排产关联', desc: '计划员王五关联3条母卷（Y2601601~Y2601603）', coilNo: 'Y2601601' },
        { time: '2026-02-22 08:00', type: 'rolling', title: '轧机开始', desc: 'Y2601601 批次投入轧机，目标厚度13μm', coilNo: 'Y2601601' },
        { time: '2026-02-25 15:00', type: 'rolling', title: '轧机完成', desc: '3条母卷全部完成轧制，成品厚度13μm', coilNo: 'Y2601603' },
        { time: '2026-02-25 17:00', type: 'quality', title: '轧机质检', desc: '3条母卷全部检测通过', coilNo: 'Y2601601' },
        { time: '2026-02-26 08:00', type: 'slitting', title: '分切开始', desc: 'Y2601601 进入分切11#，切刀规格1340mm', coilNo: 'Y2601601' },
        { time: '2026-03-02 16:00', type: 'slitting', title: '分切完成', desc: '3条母卷全部分切完成', coilNo: 'Y2601603' },
        { time: '2026-03-03 08:00', type: 'finishing', title: '精切11# 开始', desc: 'Y2601601/1-1 投入精切11#', coilNo: 'Y2601601/1-1' },
        { time: '2026-03-05 14:00', type: 'finishing', title: '精切完成', desc: '3条子卷全部精切完成，质量全部合格', coilNo: 'Y2601603/1-1' },
        { time: '2026-03-06 09:00', type: 'quality', title: '质量终验', desc: '批次质量全部合格，正常入库' },
        { time: '2026-03-07 10:00', type: 'packing', title: '入库完成', desc: '订单全部完成，已汇报用友ERP，按期交付' },
    ],

    // ── ORD-014：优箔双零，已完成，8079，6.5μm×600mm ─────────────────
    'ORD-014': [
        { time: '2026-02-22 10:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26010800754' },
        { time: '2026-02-22 15:00', type: 'plan', title: '排产关联', desc: '计划员张三关联3条母卷（Y2601701~Y2601703）', coilNo: 'Y2601701' },
        { time: '2026-02-24 08:00', type: 'rolling', title: '轧机开始', desc: 'Y2601701 批次投入轧机，多道次轧制至6.5μm', coilNo: 'Y2601701' },
        { time: '2026-02-28 15:00', type: 'rolling', title: '轧机完成', desc: '3条母卷全部完成轧制，厚度6.5μm', coilNo: 'Y2601703' },
        { time: '2026-02-28 16:30', type: 'quality', title: '轧机质检', desc: '3条母卷全部检测通过，双零箔质量达标', coilNo: 'Y2601701' },
        { time: '2026-03-01 08:00', type: 'slitting', title: '分切14# 开始', desc: 'Y2601701 进入分切14#，切刀规格600mm', coilNo: 'Y2601701' },
        { time: '2026-03-03 16:00', type: 'slitting', title: '分切完成', desc: '3条母卷全部分切完成', coilNo: 'Y2601703' },
        { time: '2026-03-04 08:00', type: 'finishing', title: '精切14# 开始', desc: 'Y2601701/1-1 投入精切14#', coilNo: 'Y2601701/1-1' },
        { time: '2026-03-06 14:00', type: 'finishing', title: '精切完成', desc: '3条子卷全部精切完成', coilNo: 'Y2601703/1-1' },
        { time: '2026-03-07 09:00', type: 'quality', title: '质量终验', desc: '批次质量全部合格，正常入库' },
        { time: '2026-03-07 18:30', type: 'packing', title: '入库完成', desc: '订单全部完成，提前1天交付' },
    ],

    // ── ORD-015：精切标兵，已完成，1235D，13μm×560mm ─────────────────
    'ORD-015': [
        { time: '2026-03-01 09:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26020500124' },
        { time: '2026-03-01 14:00', type: 'plan', title: '排产关联', desc: '计划员李明关联5条母卷（Y2602501~Y2602504）', coilNo: 'Y2602501' },
        { time: '2026-03-03 08:00', type: 'rolling', title: '轧机开始', desc: 'Y2602501 批次投入轧机，目标厚度13μm', coilNo: 'Y2602501' },
        { time: '2026-03-05 14:00', type: 'rolling', title: '轧机完成', desc: '5条母卷全部完成轧制，成品厚度13μm', coilNo: 'Y2602504' },
        { time: '2026-03-05 16:00', type: 'quality', title: '轧机质检', desc: '5条母卷全部检测通过', coilNo: 'Y2602501' },
        { time: '2026-03-06 08:00', type: 'slitting', title: '分切25# 开始', desc: 'Y2602501 进入分切25#，切刀规格560mm', coilNo: 'Y2602501' },
        { time: '2026-03-06 14:00', type: 'slitting', title: '分切完成', desc: '5条母卷全部分切完成，共产出6条子卷', coilNo: 'Y2602504' },
        { time: '2026-03-07 08:00', type: 'finishing', title: '精切25# 开始', desc: 'Y2602501/1-1 投入精切25#', coilNo: 'Y2602501/1-1' },
        { time: '2026-03-09 08:00', type: 'quality', title: '质量评审', desc: 'Y2602504/1-1 边裂0.5mm，与客户沟通确认可用，让步放行', coilNo: 'Y2602504/1-1' },
        { time: '2026-03-09 09:20', type: 'finishing', title: '精切完成', desc: '6条子卷全部精切完成', coilNo: 'Y2602504/1-1' },
        { time: '2026-03-09 10:00', type: 'packing', title: '入库完成', desc: '订单全部完成，准时交付' },
    ],

    // ── ORD-016：河北兴恒，已完成（逾期），1100，10μm×1100mm ──────────
    'ORD-016': [
        { time: '2026-02-22 09:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26010800755' },
        { time: '2026-02-22 14:00', type: 'plan', title: '排产关联', desc: '计划员李明关联14条母卷（Y2601901~Y2601914）', coilNo: 'Y2601901' },
        { time: '2026-02-24 08:00', type: 'rolling', title: '轧机1# 开始', desc: 'Y2601901 批次投入轧机1#，目标厚度10μm', coilNo: 'Y2601901' },
        { time: '2026-02-28 16:00', type: 'rolling', title: '轧机完成', desc: '14条母卷全部完成轧制，成品厚度10μm', coilNo: 'Y2601914' },
        { time: '2026-02-28 17:30', type: 'quality', title: '轧机质检', desc: '14条母卷全部检测通过', coilNo: 'Y2601901' },
        { time: '2026-03-01 08:00', type: 'slitting', title: '分切1# 开始', desc: 'Y2601901 批次进入分切1#/3#', coilNo: 'Y2601901' },
        { time: '2026-03-01 16:00', type: 'slitting', title: '分切完成', desc: '14条母卷全部分切完成，共产出14条子卷', coilNo: 'Y2601914' },
        { time: '2026-03-03 09:00', type: 'finishing', title: '精切1# 开始', desc: 'Y2601901/1-1 投入精切1#', coilNo: 'Y2601901/1-1' },
        { time: '2026-03-05 16:00', type: 'quality', title: '质量评审', desc: 'Y2601906/1-1 针孔A=60，B=9，已与客户沟通确认，让步放行', coilNo: 'Y2601906/1-1' },
        { time: '2026-03-06 14:00', type: 'finishing', title: '精切完成', desc: '14条子卷全部精切完成', coilNo: 'Y2601914/1-1' },
        { time: '2026-03-06 15:20', type: 'packing', title: '入库完成', desc: '订单全部完成，逾期2天交付，已知会客户' },
    ],

    // ── ORD-017：标兵母卷，已完成，1060，12μm×1400mm ─────────────────
    'ORD-017': [
        { time: '2026-02-25 09:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ25121602439' },
        { time: '2026-02-25 15:00', type: 'plan', title: '排产关联', desc: '计划员张三关联8条母卷（Y2602001~Y2602008）', coilNo: 'Y2602001' },
        { time: '2026-02-27 08:00', type: 'rolling', title: '轧机5# 开始', desc: 'Y2602001 批次投入轧机5#，目标厚度12μm', coilNo: 'Y2602001' },
        { time: '2026-03-01 15:00', type: 'rolling', title: '轧机完成', desc: '8条母卷全部完成轧制，成品厚度12μm', coilNo: 'Y2602008' },
        { time: '2026-03-01 16:30', type: 'quality', title: '轧机质检', desc: '8条母卷全部检测通过', coilNo: 'Y2602001' },
        { time: '2026-03-02 08:00', type: 'slitting', title: '分切开始', desc: 'Y2602001 批次进入分切，切刀规格1400mm', coilNo: 'Y2602001' },
        { time: '2026-03-02 16:00', type: 'slitting', title: '分切完成', desc: '8条母卷全部分切完成', coilNo: 'Y2602008' },
        { time: '2026-03-04 08:00', type: 'finishing', title: '精切5# 开始', desc: 'Y2602001/1-1 投入精切5#', coilNo: 'Y2602001/1-1' },
        { time: '2026-03-06 10:00', type: 'quality', title: '质量评审', desc: 'Y2602006/1-1 边裂2mm，已与客户沟通确认接受，让步放行', coilNo: 'Y2602006/1-1' },
        { time: '2026-03-06 10:00', type: 'finishing', title: '精切完成', desc: '8条子卷全部精切完成', coilNo: 'Y2602008/1-1' },
        { time: '2026-03-06 11:00', type: 'packing', title: '入库完成', desc: '订单全部完成，按期交付' },
    ],

    // ── ORD-018：宁德时代，已完成，1100，13μm×900mm ──────────────────
    'ORD-018': [
        { time: '2026-02-20 09:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26010800756' },
        { time: '2026-02-20 14:00', type: 'plan', title: '排产关联', desc: '计划员王五关联10条母卷（Y2602101~Y2602110）', coilNo: 'Y2602101' },
        { time: '2026-02-22 08:00', type: 'rolling', title: '轧机10# 开始', desc: 'Y2602101 批次投入轧机10#，目标厚度13μm', coilNo: 'Y2602101' },
        { time: '2026-02-26 15:00', type: 'rolling', title: '轧机完成', desc: '10条母卷全部完成轧制，成品厚度13μm', coilNo: 'Y2602110' },
        { time: '2026-02-26 16:30', type: 'quality', title: '轧机质检', desc: '10条母卷全部检测通过，压延质量正常', coilNo: 'Y2602101' },
        { time: '2026-02-27 08:00', type: 'slitting', title: '分切10# 开始', desc: 'Y2602101 批次进入分切，切刀规格900mm', coilNo: 'Y2602101' },
        { time: '2026-02-28 16:00', type: 'slitting', title: '分切完成', desc: '10条母卷全部分切完成', coilNo: 'Y2602110' },
        { time: '2026-03-02 09:00', type: 'finishing', title: '精切10# 开始', desc: 'Y2602101/1-1 投入精切10#', coilNo: 'Y2602101/1-1' },
        { time: '2026-03-05 14:00', type: 'finishing', title: '精切完成', desc: '10条子卷全部精切完成，质量全部合格', coilNo: 'Y2602110/1-1' },
        { time: '2026-03-05 14:30', type: 'quality', title: '质量终验', desc: '批次10条子卷全部正常入库，无异常' },
        { time: '2026-03-05 14:45', type: 'packing', title: '入库完成', desc: '订单全部完成，按期交付' },
    ],

    // ── ORD-019：精切标兵，已完成，1235D，12μm×810mm ─────────────────
    'ORD-019': [
        { time: '2026-02-18 10:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ25122200337' },
        { time: '2026-02-18 15:00', type: 'plan', title: '排产关联', desc: '计划员李明关联6条母卷（Y2602401~Y2602406）', coilNo: 'Y2602401' },
        { time: '2026-02-20 08:00', type: 'rolling', title: '轧机16# 开始', desc: 'Y2602401 批次投入轧机16#，目标厚度12μm', coilNo: 'Y2602401' },
        { time: '2026-02-24 15:00', type: 'rolling', title: '轧机完成', desc: '6条母卷全部完成轧制，成品厚度12μm', coilNo: 'Y2602406' },
        { time: '2026-02-24 16:30', type: 'quality', title: '轧机质检', desc: '6条母卷全部检测通过', coilNo: 'Y2602401' },
        { time: '2026-02-25 08:00', type: 'slitting', title: '分切16# 开始', desc: 'Y2602401 进入分切16#，切刀规格810mm', coilNo: 'Y2602401' },
        { time: '2026-02-26 14:00', type: 'slitting', title: '分切完成', desc: '6条母卷全部分切完成', coilNo: 'Y2602406' },
        { time: '2026-02-28 09:00', type: 'finishing', title: '精切16# 开始', desc: 'Y2602401/1-1 投入精切16#', coilNo: 'Y2602401/1-1' },
        { time: '2026-03-04 15:00', type: 'finishing', title: '精切完成', desc: '6条子卷全部精切完成，质量全部合格', coilNo: 'Y2602406/1-1' },
        { time: '2026-03-04 15:30', type: 'quality', title: '质量终验', desc: '批次质量全部合格，正常入库' },
        { time: '2026-03-04 16:30', type: 'packing', title: '入库完成', desc: '订单全部完成，提前完成' },
    ],

    // ── ORD-020：比亚迪，已完成，1100，12μm×820mm ────────────────────
    'ORD-020': [
        { time: '2026-02-15 09:00', type: 'plan', title: '订单下达', desc: '用友ERP同步订单 SZ26010800757' },
        { time: '2026-02-15 14:00', type: 'plan', title: '排产关联', desc: '计划员张三关联12条母卷（Y2602301~Y2602312）', coilNo: 'Y2602301' },
        { time: '2026-02-16 08:00', type: 'rolling', title: '轧机4# 开始', desc: 'Y2602301 批次投入轧机4#，目标厚度12μm', coilNo: 'Y2602301' },
        { time: '2026-02-20 15:00', type: 'rolling', title: '轧机完成', desc: '12条母卷全部完成轧制，成品厚度12μm', coilNo: 'Y2602312' },
        { time: '2026-02-20 16:30', type: 'quality', title: '轧机质检', desc: '12条母卷全部检测通过，压延质量正常', coilNo: 'Y2602301' },
        { time: '2026-02-21 08:00', type: 'slitting', title: '分切4# 开始', desc: 'Y2602301 批次进入分切4#，切刀规格820mm', coilNo: 'Y2602301' },
        { time: '2026-02-22 16:00', type: 'slitting', title: '分切完成', desc: '12条母卷全部分切完成，共产出12条子卷', coilNo: 'Y2602312' },
        { time: '2026-02-25 09:00', type: 'finishing', title: '精切4# 开始', desc: 'Y2602301/1-1 投入精切4#', coilNo: 'Y2602301/1-1' },
        { time: '2026-03-01 16:00', type: 'quality', title: '质量评审', desc: 'Y2602305/1-1 针孔A=55，B=8，已与客户沟通确认，让步放行', coilNo: 'Y2602305/1-1' },
        { time: '2026-03-02 10:00', type: 'finishing', title: '精切完成', desc: '12条子卷全部精切完成', coilNo: 'Y2602312/1-1' },
        { time: '2026-03-02 11:15', type: 'packing', title: '入库完成', desc: '订单全部完成，提前1天交付' },
    ],
}
