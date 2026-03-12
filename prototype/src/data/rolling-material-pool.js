/**
 * 待轧料池 — 模拟数据
 * 来源：熔铸/退火完成后等待轧制排产的坯料列表
 * 
 * 选择逻辑：用户选择 新神火卷号(coilNo) → 系统自动带出 坯料卷号(blankCoilNo)
 * 及其它来料基本信息（合金、用途、宽度、厚度、重量、批次、客户等）
 * 
 * 字段说明：
 *   coilNo       - 新神火卷号（排产系统分配的唯一标识）
 *   blankCoilNo  - 坯料卷号（来料原始编号）
 *   alloy        - 合金牌号
 *   usage        - 用途标识（电/食/药/双零）
 *   width        - 坯料宽度 (mm)
 *   inThickness  - 来料厚度 (mm)
 *   weight       - 坯料重量 (kg)
 *   batch        - 所属批次号
 *   customer     - 关联客户（可为空）
 *   execOrderNo  - 关联执行单号（可为空）
 *   source       - 来源说明
 */

export const rollingMaterialPool = [
    // ── 电池箔坯料 ──────────────────────────
    {
        coilNo: '1022601801',
        blankCoilNo: 'C25120415A35-1',
        alloy: '1060', usage: '电', width: 1680, inThickness: 0.22,
        weight: 2150, batch: '0122',
        customer: '', execOrderNo: '',
        source: '熔铸车间 A线',
    },
    {
        coilNo: '1022601802',
        blankCoilNo: 'C25121210A142-1',
        alloy: '1060', usage: '电', width: 1660, inThickness: 0.22,
        weight: 2380, batch: '0116',
        customer: '莱尔母卷', execOrderNo: 'ZXD2601-0123',
        source: '熔铸车间 C线',
    },
    {
        coilNo: '1022601803',
        blankCoilNo: 'C25121110A130-5',
        alloy: '1060', usage: '电', width: 1660, inThickness: 0.22,
        weight: 2380, batch: '0116',
        customer: '莱尔母卷', execOrderNo: 'ZXD2601-0123',
        source: '熔铸车间 C线',
    },
    {
        coilNo: '1022601804',
        blankCoilNo: 'YN25121503A09-2',
        alloy: '1060', usage: '电', width: 1360, inThickness: 0.22,
        weight: 1920, batch: '0116',
        customer: '精切顶皓', execOrderNo: 'ZXD2601-0260',
        source: '熔铸车间 A线',
    },
    {
        coilNo: '1022601805',
        blankCoilNo: 'YN25121303A07-1',
        alloy: '1060', usage: '电', width: 1360, inThickness: 0.22,
        weight: 1920, batch: '0116',
        customer: '精切顶皓', execOrderNo: 'ZXD2601-0260',
        source: '熔铸车间 A线',
    },

    // ── 其他产品坯料 ──────────────────────
    {
        coilNo: '1022601806',
        blankCoilNo: 'C25120416A35-2',
        alloy: '1060', usage: '电', width: 1680, inThickness: 0.22,
        weight: 2150, batch: '0122',
        customer: '海达', execOrderNo: 'ZXD2601-0210',
        source: '熔铸车间 A线',
    },
    {
        coilNo: '1022601807',
        blankCoilNo: 'C25120418A35-4',
        alloy: '1235', usage: '电', width: 1520, inThickness: 0.22,
        weight: 1940, batch: '0122',
        customer: '兴业', execOrderNo: 'ZXD2601-0240',
        source: '熔铸车间 A线',
    },
    {
        coilNo: '1022601808',
        blankCoilNo: 'C25120419A35-5',
        alloy: '8079', usage: '电', width: 1350, inThickness: 0.22,
        weight: 1730, batch: '0122',
        customer: '鑫航', execOrderNo: 'ZXD2601-0225',
        source: '熔铸车间 A线',
    },

    // ── 中轧/精轧来料 ──────────────────────
    {
        coilNo: '1022601809',
        blankCoilNo: 'YN25120906S28-1',
        alloy: '8079', usage: '药', width: 1750, inThickness: 0.24,
        weight: 2800, batch: '0121',
        customer: '吉丰', execOrderNo: '',
        source: '退火车间',
    },
    {
        coilNo: '1022601810',
        blankCoilNo: 'YN25120906S28-4',
        alloy: '8079', usage: '食', width: 1750, inThickness: 0.24,
        weight: 2800, batch: '0121',
        customer: '海燕', execOrderNo: '',
        source: '退火车间',
    },
    {
        coilNo: '1022601811',
        blankCoilNo: 'YNT25120505A12-2',
        alloy: '1060', usage: '电', width: 1350, inThickness: 0.22,
        weight: 2180, batch: '0125',
        customer: '南光', execOrderNo: 'ZXD2601-0188',
        source: '熔铸车间 A线',
    },
    {
        coilNo: '1022601812',
        blankCoilNo: 'C25121518A182-5',
        alloy: '1060', usage: '电', width: 1400, inThickness: 0.22,
        weight: 1790, batch: '0122',
        customer: '精切ATL', execOrderNo: 'ZXD2601-0190',
        source: '熔铸车间 C线',
    },

    // ── 未分配坯料（可自由排产） ──────────────
    {
        coilNo: '1022601813',
        blankCoilNo: 'C25120520A88-3',
        alloy: '1060', usage: '电', width: 1350, inThickness: 0.22,
        weight: 1730, batch: '0123',
        customer: '', execOrderNo: '',
        source: '熔铸车间 A线',
    },
    {
        coilNo: '1022601814',
        blankCoilNo: 'YNT25120605A15-1',
        alloy: '1100', usage: '电', width: 1350, inThickness: 0.22,
        weight: 1730, batch: '0124',
        customer: '', execOrderNo: '',
        source: '熔铸车间 A线',
    },
    {
        coilNo: '1022601815',
        blankCoilNo: 'YNT25120705S19-3',
        alloy: '8079', usage: '食', width: 1560, inThickness: 0.24,
        weight: 2500, batch: '0121',
        customer: '', execOrderNo: '',
        source: '退火车间',
    },
    {
        coilNo: '1022601816',
        blankCoilNo: 'C25121901A200-1',
        alloy: '1235', usage: '双零', width: 1520, inThickness: 0.22,
        weight: 2350, batch: '0120',
        customer: '', execOrderNo: '',
        source: '熔铸车间 C线',
    },
]
