/**
 * MES系统项目方案演示PPT生成脚本
 * 将HTML幻灯片转换为PowerPoint演示文稿
 */

const pptxgen = require('pptxgenjs');
const path = require('path');

// 获取html2pptx库路径 - 使用全局skills路径
const html2pptxPath = path.join(process.env.USERPROFILE || process.env.HOME, '.gemini/antigravity/global_skills/pptx/scripts/html2pptx.js');
const html2pptx = require(html2pptxPath);

async function createPresentation() {
    console.log('开始创建MES系统项目方案演示PPT...\n');
    
    // 创建PPT实例
    const pptx = new pptxgen();
    
    // 设置PPT属性
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = 'MES系统项目方案 - 痛点分析与解决方案';
    pptx.author = '项目团队';
    pptx.company = '铝箔制造MES项目';
    pptx.subject = 'MES系统项目方案演示';
    
    // 幻灯片列表
    const slides = [
        'slide01_cover.html',
        'slide02_background.html',
        'slide03_pain_overview.html',
        'slide04_pain1.html',
        'slide05_pain2.html',
        'slide06_pain3.html',
        'slide07_pain4.html',
        'slide08_solution_overview.html',
        'slide09_module_scheduling.html',
        'slide10_module_quality.html',
        'slide11_module_material.html',
        'slide12_module_execution.html',
        'slide13_value_summary.html'
    ];
    
    const slidesDir = __dirname;
    
    // 逐个处理幻灯片
    for (let i = 0; i < slides.length; i++) {
        const slideFile = slides[i];
        const slidePath = path.join(slidesDir, slideFile);
        
        console.log(`处理幻灯片 ${i + 1}/${slides.length}: ${slideFile}`);
        
        try {
            await html2pptx(slidePath, pptx);
            console.log(`  ✓ 完成`);
        } catch (error) {
            console.error(`  ✗ 错误: ${error.message}`);
            throw error;
        }
    }
    
    // 保存PPT文件
    const outputPath = path.join(slidesDir, '..', 'MES系统项目方案_痛点分析与解决方案.pptx');
    await pptx.writeFile({ fileName: outputPath });
    
    console.log(`\n✓ PPT创建完成!`);
    console.log(`  输出文件: ${outputPath}`);
    console.log(`  幻灯片数量: ${slides.length}`);
}

// 运行
createPresentation().catch(error => {
    console.error('\n创建PPT失败:', error.message);
    process.exit(1);
});
