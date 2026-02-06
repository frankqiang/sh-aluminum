# -*- coding: utf-8 -*-
"""
评审信息全面分析脚本 - 使用pandas读取Excel
"""

import pandas as pd
import re
from collections import Counter, defaultdict

# 读取所有评审信息
all_reviews = []

# 1. 轧机质量报表
df1 = pd.read_excel(r'c:\Users\tyq\Desktop\aluminum\调研\排产讲解\排产相关Excel表格\1月份轧机质量报表.xlsx', header=1)
reviews1 = df1['评审信息'].dropna().tolist()
for r in reviews1:
    all_reviews.append({'来源': '轧机', '评审信息': str(r)})

# 2-4. 分切不合格品报表的三个Sheet
for sheet, source in [('双零箔', '分切-双零箔'), ('电池箔', '分切-电池箔'), ('精切车间', '精切')]:
    df = pd.read_excel(r'c:\Users\tyq\Desktop\aluminum\调研\排产讲解\排产相关Excel表格\1月份分切不合格品报表及评审信息.xlsx', sheet_name=sheet, header=1)
    for r in df['评审信息'].dropna().tolist():
        all_reviews.append({'来源': source, '评审信息': str(r)})

# 创建输出报告
output = []
output.append('# 评审信息全面分类分析报告\n')
output.append(f'> 分析时间: 2026-02-02\n')
output.append(f'> 总样本数: {len(all_reviews)} 条评审信息\n\n')

# 按来源统计
source_counts = Counter([r['来源'] for r in all_reviews])
output.append('## 数据来源分布\n')
output.append('| 来源 | 数量 |\n|------|------|\n')
for source, count in source_counts.most_common():
    output.append(f'| {source} | {count} |\n')
output.append('\n---\n\n')

# =====================================================================
# 一、主评审结论分类
# =====================================================================
output.append('## 一、主评审结论分类\n\n')

# 定义主评审结论的识别规则
def classify_main_conclusion(info):
    info = str(info).strip()
    if info.startswith('让步放行'):
        return '让步放行'
    elif info.startswith('沟通放行'):
        return '沟通放行'
    elif info.startswith('改切二级品') or (info.startswith('改切') and '二级品' in info[:15]):
        return '改切二级品'
    elif info.startswith('改切'):
        return '改切'
    elif info.startswith('转精切'):
        return '转精切'
    elif info.startswith('转入优箔'):
        return '转入优箔'
    elif info.startswith('扒废') or info.startswith('建议扒废'):
        return '扒废/建议扒废'
    elif info.startswith('退火后'):
        return '退火后处理'
    elif info.startswith('正常分切') or info.startswith('正常轧制'):
        return '正常处理'
    elif info.startswith('评审可切'):
        return '评审可切'
    elif info.startswith('工艺导卷'):
        return '工艺导卷'
    elif info.startswith('包装扒至'):
        return '包装扒至'
    elif info.startswith('薄剪'):
        return '薄剪处理'
    elif info.startswith('针检') or info.startswith('巡边'):
        return '设备/检验问题'
    elif re.match(r'^[QC]?\d+[-至]?\d*[米mM]?', info) or re.match(r'^\d+[-至]', info):
        return '直接处理指令'
    elif '切二级品' in info[:20] or '切等外' in info[:20]:
        return '直接降级处理'
    else:
        return '其他'

# 统计主评审结论
conclusion_stats = defaultdict(lambda: defaultdict(int))
for r in all_reviews:
    conclusion = classify_main_conclusion(r['评审信息'])
    conclusion_stats[r['来源']][conclusion] += 1

output.append('### 1.1 按来源统计\n\n')
for source in ['轧机', '分切-双零箔', '分切-电池箔', '精切']:
    if source in conclusion_stats:
        output.append(f'**【{source}】**\n\n')
        output.append('| 主评审结论 | 数量 |\n|------------|------|\n')
        for conclusion, count in sorted(conclusion_stats[source].items(), key=lambda x: -x[1]):
            output.append(f'| {conclusion} | {count} |\n')
        output.append('\n')

# 汇总
output.append('### 1.2 主评审结论汇总\n\n')
all_conclusions = Counter()
for source_data in conclusion_stats.values():
    for conclusion, count in source_data.items():
        all_conclusions[conclusion] += count

output.append('| 主评审结论 | 总数量 | 说明 |\n|------------|--------|------|\n')
conclusion_desc = {
    '让步放行': '有条件放行，需参考后续处理指令',
    '改切': '需要调整切割方案',
    '转精切': '分切完成后转到精切工序继续处理',
    '改切二级品': '整卷降级为二级品',
    '扒废/建议扒废': '部分或全部废弃',
    '沟通放行': '需与客户沟通后放行',
    '正常处理': '正常分切/轧制，无需特殊处理',
    '评审可切': '评审通过可以切割',
    '退火后处理': '需要先退火再进行后续处理',
    '工艺导卷': '工艺性导卷处理',
    '包装扒至': '包装时扒除外圈至指定米数',
    '转入优箔': '转入优箔产品线',
    '薄剪处理': '使用薄剪设备处理',
    '直接处理指令': '直接给出位置+处理方式，无主结论',
    '直接降级处理': '直接指明切二级品或等外',
    '设备/检验问题': '设备异常或检验问题需处理',
    '其他': '无法归类的特殊情况',
}
for conclusion, count in all_conclusions.most_common():
    desc = conclusion_desc.get(conclusion, '')
    output.append(f'| {conclusion} | {count} | {desc} |\n')
output.append('\n---\n\n')

# =====================================================================
# 二、处理方式关键词
# =====================================================================
output.append('## 二、处理方式关键词统计\n\n')

process_keywords = ['切除', '避留白', '切二级品', '切等外', '反开', '反开卷', '导卷', 
                    '电晕', '降速', '复测', '复查', '复检', '下料观察', '在线观察',
                    '扒除', '扒废', '扒至', '工艺导卷', '薄剪', '吸边', '验证', '改切', '改制']

process_stats = Counter()
for r in all_reviews:
    for kw in process_keywords:
        if kw in r['评审信息']:
            process_stats[kw] += 1

output.append('| 处理方式 | 出现次数 | 说明 |\n|----------|----------|---------|\n')
process_desc = {
    '切除': '物理切掉指定区域',
    '避留白': '在指定位置预留空白区域，不切割但标记',
    '切二级品': '降级为二级品',
    '切等外': '严重降级，非订单使用',
    '反开': '反向开卷，改变缺陷位置',
    '反开卷': '反向开卷操作',
    '导卷': '导卷处理',
    '电晕': '电晕处理（提高达因值）',
    '降速': '降低生产速度',
    '复测': '重新测量',
    '复查': '重新检查',
    '复检': '重新检验',
    '下料观察': '下料后观察情况',
    '在线观察': '生产过程中观察',
    '扒除': '扒掉外层',
    '扒废': '扒掉作废',
    '扒至': '扒除至指定米数',
    '工艺导卷': '工艺性导卷',
    '薄剪': '使用薄剪设备切割',
    '吸边': '吸边处理',
    '验证': '验证处理效果',
    '改切': '调整切割方案',
    '改制': '改变规格/用途',
}
for kw, count in process_stats.most_common():
    desc = process_desc.get(kw, '')
    output.append(f'| {kw} | {count} | {desc} |\n')
output.append('\n---\n\n')

# =====================================================================
# 三、缺陷类型关键词
# =====================================================================
output.append('## 三、缺陷类型关键词统计\n\n')

defect_keywords = ['针孔', '气道', '孔洞', '辊印', '油斑', '油泥', '油线', '带油',
                   '下榻', '白条', '亮线', '条纹', '闪筋', '擦划', '起皱', '划伤',
                   '横折', '斜纹', '人字纹', '棱印', '直棱', '板形', '板型', '压坑',
                   '麻点', '串层', '厚度', '米数', '黑点', '黑线', '错层', '塔形']

defect_stats = Counter()
for r in all_reviews:
    for kw in defect_keywords:
        if kw in r['评审信息']:
            defect_stats[kw] += 1

output.append('| 缺陷类型 | 出现次数 | 说明 |\n|----------|----------|------|\n')
defect_desc = {
    '针孔': '铝箔上的微小孔洞',
    '气道': '铝箔内部的气体通道缺陷',
    '孔洞': '较大的孔洞',
    '辊印': '轧辊印记',
    '油斑': '油污斑点',
    '油泥': '油和污泥混合物',
    '油线': '线状油污',
    '带油': '表面带油',
    '下榻': '边部下榻（塌边）',
    '白条': '白色条纹',
    '亮线': '光亮的线条',
    '条纹': '表面条纹',
    '闪筋': '闪光的筋状缺陷',
    '擦划': '擦伤/划伤',
    '起皱': '起皱',
    '划伤': '划伤',
    '横折': '横向折痕',
    '斜纹': '斜向纹路',
    '人字纹': '人字形纹路',
    '棱印': '棱角印记',
    '直棱': '直线棱印',
    '板形': '板面形状问题',
    '板型': '板面型态问题',
    '压坑': '压凹的坑',
    '麻点': '密集小点',
    '串层': '层间串动',
    '厚度': '厚度问题',
    '米数': '米数/长度问题',
    '黑点': '黑色斑点',
    '黑线': '黑色线条',
    '错层': '层错位',
    '塔形': '塔形缺陷',
}
for kw, count in defect_stats.most_common():
    if count > 0:
        desc = defect_desc.get(kw, '')
        output.append(f'| {kw} | {count} | {desc} |\n')
output.append('\n---\n\n')

# =====================================================================
# 四、位置描述模式
# =====================================================================
output.append('## 四、位置描述模式统计\n\n')

position_stats = Counter()
for r in all_reviews:
    info = r['评审信息']
    if re.search(r'Q\d+', info):
        position_stats['Q侧位置 (Q+数字)'] += 1
    if re.search(r'C\d+', info):
        position_stats['C侧位置 (C+数字)'] += 1
    if re.search(r'\d+米', info):
        position_stats['长度位置 (xxx米)'] += 1
    if '边部' in info:
        position_stats['边部'] += 1
    if '底部' in info:
        position_stats['底部'] += 1
    if '外圈' in info:
        position_stats['外圈'] += 1
    if '整幅' in info or '整卷' in info:
        position_stats['整幅/整卷'] += 1
    if re.search(r'L\d+', info):
        position_stats['周期缺陷 (L+数字)'] += 1
    if '两边部' in info:
        position_stats['两边部'] += 1
    if '横向' in info:
        position_stats['横向'] += 1
    if '纵向' in info:
        position_stats['纵向'] += 1
    if '下表面' in info:
        position_stats['下表面'] += 1

output.append('| 位置模式 | 出现次数 | 说明 |\n|----------|----------|------|\n')
position_desc = {
    'Q侧位置 (Q+数字)': '驱动侧位置，如Q0-80表示Q侧0-80mm',
    'C侧位置 (C+数字)': '操作侧位置，如C0-40表示C侧0-40mm',
    '长度位置 (xxx米)': '长度方向位置，如5800米表示从底部5800米处',
    '边部': '料卷边缘',
    '底部': '料卷底部（内圈）',
    '外圈': '料卷外层',
    '整幅/整卷': '整个料卷宽度或全卷',
    '周期缺陷 (L+数字)': '周期性重复缺陷，如L985表示每985mm重复',
    '两边部': '两侧边部',
    '横向': '横跨宽度方向',
    '纵向': '沿长度方向',
    '下表面': '铝箔下表面',
}
for pattern, count in position_stats.most_common():
    desc = position_desc.get(pattern, '')
    output.append(f'| {pattern} | {count} | {desc} |\n')
output.append('\n---\n\n')

# =====================================================================
# 五、复杂评审信息样例
# =====================================================================
output.append('## 五、复杂评审信息样例（包含多个指令）\n\n')
output.append('> 这些样例展示了评审信息中多个处理指令的组合方式\n\n')

complex_samples = []
for r in all_reviews:
    info = r['评审信息']
    sep_count = info.count('，') + info.count(',') + info.count('/')
    if sep_count >= 2 and len(info) > 40:
        complex_samples.append((r['来源'], info, sep_count))

complex_samples.sort(key=lambda x: -x[2])
output.append('| 序号 | 来源 | 评审信息 |\n|------|------|----------|\n')
for i, (source, info, _) in enumerate(complex_samples[:30], 1):
    # 截断太长的信息
    info_display = info[:100] + '...' if len(info) > 100 else info
    output.append(f'| {i} | {source} | {info_display} |\n')
output.append('\n---\n\n')

# =====================================================================
# 六、各工序评审信息样例
# =====================================================================
output.append('## 六、各工序评审信息样例\n\n')

for source in ['轧机', '分切-双零箔', '分切-电池箔', '精切']:
    source_reviews = [r['评审信息'] for r in all_reviews if r['来源'] == source]
    unique_reviews = list(set(source_reviews))
    output.append(f'### 6.{["轧机", "分切-双零箔", "分切-电池箔", "精切"].index(source)+1} {source}工序 (共{len(unique_reviews)}种不同评审信息)\n\n')
    
    # 取前40个作为样例
    for i, info in enumerate(unique_reviews[:40], 1):
        output.append(f'{i}. {info}\n')
    if len(unique_reviews) > 40:
        output.append(f'\n...还有{len(unique_reviews)-40}种\n')
    output.append('\n')

# 保存报告
report_path = r'c:\Users\tyq\Desktop\aluminum\调研\排产讲解\评审信息分类分析报告.md'
with open(report_path, 'w', encoding='utf-8') as f:
    f.writelines(output)

print(f'分析报告已保存至: {report_path}')
print(f'总计分析了 {len(all_reviews)} 条评审信息')
