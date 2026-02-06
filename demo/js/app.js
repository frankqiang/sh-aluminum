/**
 * 排产辅助功能Demo - 主逻辑模块
 * 方案B：用户先筛选候选订单，再计算组合
 */

// 当前状态
const appState = {
    currentRoll: null,
    effectiveWidth: 1600,
    effectiveLength: 950,
    selectedOrderIds: new Set(), // 用户勾选的订单ID
    currentCombinations: [],     // 当前计算出的组合方案
    selectedCombinationIndex: 0
};

/**
 * 查询料卷信息
 */
function queryRoll() {
    const rollNo = document.getElementById('rollNo').value || 'FC20250122001';

    document.getElementById('infoRollNo').textContent = rollNo;
    document.getElementById('rollInfoCard').classList.remove('hidden');

    appState.currentRoll = { ...mockRollData, rollNo };

    // 渲染评审信息
    renderReviewInfo(appState.currentRoll.defects);

    // 重置并计算有效尺寸
    document.getElementById('cutWidth').value = appState.currentRoll.defects[0].suggestCut;
    document.getElementById('cutLength').value = appState.currentRoll.defects[1].suggestCut;
    calcEffective();

    updateStepIndicator(1, 'completed');
    updateStepIndicator(2, 'active');
}

/**
 * 渲染评审信息
 */
function renderReviewInfo(defects) {
    const list = document.querySelector('.defect-list');
    if (!list) return;
    list.innerHTML = defects.map(d => {
        const badgeClass = d.position.includes('边缘') ? 'edge' : 'head';
        return `
            <li>
                <div class="defect-header">
                    <span class="defect-type">${d.type}</span>
                    <span class="defect-badge ${badgeClass}">${d.position}</span>
                </div>
                <div class="defect-detail">
                    位置：${d.range}，建议切除 <span class="highlight-text">${d.suggestCut}${d.direction === 'width' ? 'mm' : '米'}</span>
                </div>
            </li>
        `;
    }).join('');
}

/**
 * 计算有效尺寸
 */
function calcEffective() {
    const srcWidth = 1700;
    const srcLength = 1000;
    const cutWidth = parseInt(document.getElementById('cutWidth').value) || 0;
    const cutLength = parseInt(document.getElementById('cutLength').value) || 0;

    appState.effectiveWidth = srcWidth - cutWidth;
    appState.effectiveLength = srcLength - cutLength;

    document.getElementById('effectiveWidth').value = appState.effectiveWidth;
    document.getElementById('effectiveLength').value = appState.effectiveLength;
}

/**
 * 显示订单池，让用户勾选
 * 筛选条件：宽度 ≤ 有效宽度 AND 厚度匹配 AND 合金牌号匹配
 */
function showOrderPool() {
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('orderPoolSection').classList.remove('hidden');
    document.getElementById('resultSection').classList.add('hidden');

    // 筛选符合条件的订单
    const roll = appState.currentRoll;
    const eligibleOrders = mockOrders.filter(o =>
        o.width <= appState.effectiveWidth &&    // 宽度 ≤ 有效宽度
        o.thickness === roll.thickness &&        // 厚度必须一致
        o.alloy === roll.alloy                   // 合金牌号必须一致
    );

    // 显示匹配条件信息
    const matchInfo = document.getElementById('matchInfo');
    if (matchInfo) {
        matchInfo.innerHTML = `
            <span class="match-tag">厚度: ${roll.thickness}mm</span>
            <span class="match-tag">合金: ${roll.alloy}</span>
            <span class="match-tag">可用宽度: ≤${appState.effectiveWidth}mm</span>
        `;
    }

    // 显示筛选结果
    const totalCount = mockOrders.length;
    const matchCount = eligibleOrders.length;
    const filterInfo = document.getElementById('filterInfo');
    if (filterInfo) {
        filterInfo.textContent = `共 ${totalCount} 个待排订单，符合条件 ${matchCount} 个`;
    }

    renderOrderPool(eligibleOrders);

    updateStepIndicator(2, 'completed');
    updateStepIndicator(3, 'active');
}

/**
 * 渲染订单池列表
 */
function renderOrderPool(orders) {
    const tbody = document.getElementById('orderPoolBody');
    tbody.innerHTML = orders.map(o => `
        <tr class="${o.urgent ? 'urgent-row' : ''}">
            <td>
                <input type="checkbox" class="order-checkbox" data-id="${o.id}" 
                       ${appState.selectedOrderIds.has(o.id) ? 'checked' : ''}
                       onchange="toggleOrderSelection(${o.id})">
            </td>
            <td class="order-no">${o.orderNo}</td>
            <td>${o.customer}</td>
            <td class="specs">${o.width} mm</td>
            <td class="specs">${o.length} m</td>
            <td class="${o.urgent ? 'deadline urgent' : 'deadline'}">${o.deadline} ${o.urgent ? '🔥' : ''}</td>
        </tr>
    `).join('');

    updateSelectedCount();
}

/**
 * 切换订单选择状态
 */
function toggleOrderSelection(orderId) {
    if (appState.selectedOrderIds.has(orderId)) {
        appState.selectedOrderIds.delete(orderId);
    } else {
        appState.selectedOrderIds.add(orderId);
    }
    updateSelectedCount();
}

/**
 * 全选/取消全选
 */
function toggleSelectAll(checkbox) {
    const allCheckboxes = document.querySelectorAll('.order-checkbox');
    allCheckboxes.forEach(cb => {
        const id = parseInt(cb.dataset.id);
        cb.checked = checkbox.checked;
        if (checkbox.checked) {
            appState.selectedOrderIds.add(id);
        } else {
            appState.selectedOrderIds.delete(id);
        }
    });
    updateSelectedCount();
}

/**
 * 更新已选数量显示
 */
function updateSelectedCount() {
    const countEl = document.getElementById('selectedCount');
    if (countEl) {
        countEl.textContent = appState.selectedOrderIds.size;
    }

    // 控制"计算组合"按钮状态
    const calcBtn = document.getElementById('calcCombinationBtn');
    if (calcBtn) {
        calcBtn.disabled = appState.selectedOrderIds.size < 1;
    }
}

/**
 * 从勾选的订单中计算最优组合
 */
function calcCombinations() {
    const selectedOrders = mockOrders.filter(o => appState.selectedOrderIds.has(o.id));

    if (selectedOrders.length === 0) {
        alert('请至少选择一个订单');
        return;
    }

    // 计算所有可能的组合
    const combinations = findCombinations(selectedOrders, appState.effectiveWidth);

    if (combinations.length === 0) {
        alert('无法找到合适的组合，请调整选择的订单');
        return;
    }

    // 按利用率排序
    combinations.sort((a, b) => b.utilization - a.utilization);

    // 只取前5个最优组合
    appState.currentCombinations = combinations.slice(0, 5);

    // 显示结果
    document.getElementById('orderPoolSection').classList.add('hidden');
    document.getElementById('resultSection').classList.remove('hidden');

    renderCombinationTabs();
    selectCombination(0);

    updateStepIndicator(3, 'completed');
    updateStepIndicator(4, 'active');
}

/**
 * 查找所有可能的组合（简化版动态规划）
 */
function findCombinations(orders, maxWidth) {
    const results = [];
    const n = orders.length;

    // 枚举所有子集（2^n）
    for (let mask = 1; mask < (1 << n); mask++) {
        let totalWidth = 0;
        const subset = [];

        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                totalWidth += orders[i].width;
                subset.push(orders[i]);
            }
        }

        // 宽度不超过有效宽度
        if (totalWidth <= maxWidth) {
            const utilization = Math.round((totalWidth / maxWidth) * 100);
            results.push({
                orders: subset,
                totalWidth: totalWidth,
                waste: maxWidth - totalWidth,
                utilization: utilization
            });
        }
    }

    return results;
}

/**
 * 渲染组合选项卡
 */
function renderCombinationTabs() {
    const tabsContainer = document.getElementById('combinationTabs');
    tabsContainer.innerHTML = appState.currentCombinations.map((comb, idx) => `
        <div class="order-tab ${idx === 0 ? 'active' : ''}" onclick="selectCombination(${idx})">
            方案${idx + 1} (${comb.utilization}%)
        </div>
    `).join('');
}

/**
 * 选择组合方案
 */
function selectCombination(index) {
    appState.selectedCombinationIndex = index;

    // 更新Tab样式
    document.querySelectorAll('.order-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });

    const comb = appState.currentCombinations[index];

    // 渲染切割图
    renderCuttingBar(comb);

    // 渲染订单表格
    renderResultTable(comb);
}

/**
 * 渲染切割示意图
 */
function renderCuttingBar(combination) {
    const bar = document.getElementById('cuttingBar');
    const legend = document.querySelector('.cutting-legend');

    let html = '';
    let legendHtml = '';

    combination.orders.forEach((order, idx) => {
        const pct = (order.width / appState.effectiveWidth) * 100;
        const color = segmentColors[idx % segmentColors.length];
        html += `
            <div class="cutting-segment" style="width: ${pct}%; background: ${color};">
                <div class="width">${order.width}mm</div>
                <div class="order">${order.customer}</div>
            </div>
        `;
        legendHtml += `
            <div class="legend-item">
                <div class="legend-color" style="background: ${color};"></div>
                <span>${order.orderNo} - ${order.customer}</span>
            </div>
        `;
    });

    // 如果有余料
    if (combination.waste > 0) {
        const wastePct = (combination.waste / appState.effectiveWidth) * 100;
        html += `
            <div class="cutting-segment waste" style="width: ${wastePct}%;">
                <div class="width">${combination.waste}mm</div>
                <div class="order">余料</div>
            </div>
        `;
    }

    bar.innerHTML = html;
    legend.innerHTML = legendHtml;

    // 更新利用率显示
    const rateEl = document.getElementById('utilizationRate');
    if (rateEl) rateEl.textContent = combination.utilization + '%';
}

/**
 * 渲染结果订单表格
 */
function renderResultTable(combination) {
    const tbody = document.getElementById('resultTableBody');
    tbody.innerHTML = combination.orders.map(o => `
        <tr>
            <td class="order-no">${o.orderNo}</td>
            <td>${o.customer}</td>
            <td class="specs">${o.width} mm</td>
            <td class="specs">${o.length} m</td>
            <td class="${o.urgent ? 'deadline urgent' : 'deadline'}">${o.deadline} ${o.urgent ? '🔥' : ''}</td>
        </tr>
    `).join('');

    // 更新汇总
    const summary = document.querySelector('.result-summary');
    if (summary) {
        summary.innerHTML = `
            已选 <span>${combination.orders.length}</span> 个订单，
            宽度合计 <span>${combination.totalWidth}mm</span>，
            利用率 <span>${combination.utilization}%</span>，
            余料 <span>${combination.waste}mm</span>
        `;
    }
}

/**
 * 返回订单池重新选择
 */
function backToOrderPool() {
    document.getElementById('resultSection').classList.add('hidden');
    document.getElementById('orderPoolSection').classList.remove('hidden');
}

/**
 * 确认排产
 */
function confirmSchedule() {
    const comb = appState.currentCombinations[appState.selectedCombinationIndex];
    const orderList = comb.orders.map(o => `- ${o.orderNo} (${o.customer}, ${o.width}mm)`).join('\n');

    alert(`🎉 排产指令已下达！\n\n料卷编号：${appState.currentRoll?.rollNo || 'FC20250122001'}\n有效宽度：${appState.effectiveWidth}mm\n利用率：${comb.utilization}%\n\n关联订单：\n${orderList}\n\n已生成精切工单，等待生产...`);

    updateStepIndicator(4, 'completed');
}

/**
 * 更新步骤指示器
 */
function updateStepIndicator(stepNum, status) {
    const step = document.getElementById(`step${stepNum}`);
    if (!step) return;
    step.classList.remove('active', 'completed');
    step.classList.add(status);
}

// 初始化
document.addEventListener('DOMContentLoaded', function () {
    appState.effectiveWidth = 1600;
    appState.effectiveLength = 950;
});
