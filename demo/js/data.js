/**
 * 排产辅助功能Demo - 数据模块
 * 包含模拟数据和数据结构定义
 * 
 * 更新：增加厚度、合金牌号等关键匹配属性
 */

// 模拟料卷数据
const mockRollData = {
    rollNo: 'FC20250122001',
    width: 1700,         // 来料宽度 mm
    length: 1000,        // 来料米数 m
    thickness: 0.012,    // 厚度 mm ★ 关键匹配属性
    alloy: '8011',       // 合金牌号 ★ 关键匹配属性
    weight: 285,         // 重量 kg
    productionDate: '2025-01-22',
    motherRollNo: 'MJ20250120001',
    defects: [
        {
            type: '边缘缺陷',
            position: '左边缘',
            range: '0-100mm',
            suggestCut: 100,
            direction: 'width'
        },
        {
            type: '针孔超标',
            position: '头部',
            range: '0-50米',
            suggestCut: 50,
            direction: 'length'
        }
    ]
};

// 模拟订单池 - 所有待排产订单
// 注意：每个订单都有厚度和合金要求
const mockOrders = [
    // 厚度0.012mm，合金8011的订单（与料卷匹配）
    { id: 1, orderNo: 'CO20250120001', customer: '华润包装', width: 500, length: 800, thickness: 0.012, alloy: '8011', deadline: '1月25日', deadlineDays: 2, urgent: true },
    { id: 2, orderNo: 'CO20250118002', customer: '康美药业', width: 800, length: 600, thickness: 0.012, alloy: '8011', deadline: '1月28日', deadlineDays: 5, urgent: false },
    { id: 3, orderNo: 'CO20250119003', customer: '蒙牛乳业', width: 300, length: 950, thickness: 0.012, alloy: '8011', deadline: '1月30日', deadlineDays: 7, urgent: false },
    { id: 4, orderNo: 'CO20250121004', customer: '伊利集团', width: 600, length: 700, thickness: 0.012, alloy: '8011', deadline: '1月27日', deadlineDays: 4, urgent: false },
    { id: 5, orderNo: 'CO20250121005', customer: '农夫山泉', width: 400, length: 500, thickness: 0.012, alloy: '8011', deadline: '1月29日', deadlineDays: 6, urgent: false },
    { id: 6, orderNo: 'CO20250122006', customer: '青岛啤酒', width: 700, length: 800, thickness: 0.012, alloy: '8011', deadline: '2月1日', deadlineDays: 9, urgent: false },
    { id: 7, orderNo: 'CO20250122007', customer: '娃哈哈', width: 450, length: 600, thickness: 0.012, alloy: '8011', deadline: '1月26日', deadlineDays: 3, urgent: true },

    // 厚度或合金不匹配的订单（用于演示筛选效果）
    { id: 8, orderNo: 'CO20250122008', customer: '统一企业', width: 550, length: 700, thickness: 0.015, alloy: '8011', deadline: '2月2日', deadlineDays: 10, urgent: false },  // 厚度不匹配
    { id: 9, orderNo: 'CO20250123009', customer: '达利园', width: 350, length: 450, thickness: 0.012, alloy: '8079', deadline: '1月31日', deadlineDays: 8, urgent: false },    // 合金不匹配
    { id: 10, orderNo: 'CO20250123010', customer: '旺旺集团', width: 650, length: 550, thickness: 0.009, alloy: '1235', deadline: '2月3日', deadlineDays: 11, urgent: false }  // 都不匹配
];

// 颜色配置
const segmentColors = ['#165dff', '#00b42a', '#722ed1', '#ff7d00', '#14c9c9', '#f53f3f'];
