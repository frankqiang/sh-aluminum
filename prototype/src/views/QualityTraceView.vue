<template>
    <div class="trace-view">
        <!-- 顶部：标题 + 统计卡片 -->
        <div class="page-header">
            <h1 class="page-title">
                <FileSearch :size="20" class="title-icon" />
                追溯查询
            </h1>
            <div class="stat-cards">
                <div class="stat-card fpy">
                    <div class="stat-icon-wrap fpy-bg">
                        <ShieldCheck :size="16" />
                    </div>
                    <div class="stat-body">
                        <div class="stat-value-row">
                            <span class="stat-value">{{ firstPassYield }}<small>%</small></span>
                            <span :class="['stat-trend', fpyTrend >= 0 ? 'trend-up' : 'trend-down']"
                                v-if="fpyTrend !== null">
                                <TrendingUp v-if="fpyTrend >= 0" :size="11" />
                                <TrendingDown v-else :size="11" />
                                {{ Math.abs(fpyTrend) }}%
                            </span>
                        </div>
                        <span class="stat-label">一次合格率</span>
                    </div>
                </div>
                <div class="stat-card total">
                    <div class="stat-icon-wrap total-bg">
                        <Database :size="16" />
                    </div>
                    <div class="stat-body">
                        <span class="stat-value">{{ completedList.length }}</span>
                        <span class="stat-label">评审总数</span>
                    </div>
                </div>
                <div class="stat-card concession">
                    <div class="stat-icon-wrap concession-bg">
                        <AlertTriangle :size="16" />
                    </div>
                    <div class="stat-body">
                        <div class="stat-value-row">
                            <span class="stat-value">{{ concessionRate }}<small>%</small></span>
                            <span :class="['stat-trend', concessionTrend <= 0 ? 'trend-up' : 'trend-down']"
                                v-if="concessionTrend !== null">
                                <TrendingDown v-if="concessionTrend <= 0" :size="11" />
                                <TrendingUp v-else :size="11" />
                                {{ Math.abs(concessionTrend) }}%
                            </span>
                        </div>
                        <span class="stat-label">让步放行率</span>
                    </div>
                </div>
                <div class="stat-card downgrade">
                    <div class="stat-icon-wrap downgrade-bg">
                        <TrendingDown :size="16" />
                    </div>
                    <div class="stat-body">
                        <div class="stat-value-row">
                            <span class="stat-value">{{ downgradeRate }}<small>%</small></span>
                            <span :class="['stat-trend', downgradeTrend <= 0 ? 'trend-up' : 'trend-down']"
                                v-if="downgradeTrend !== null">
                                <TrendingDown v-if="downgradeTrend <= 0" :size="11" />
                                <TrendingUp v-else :size="11" />
                                {{ Math.abs(downgradeTrend) }}%
                            </span>
                        </div>
                        <span class="stat-label">二级品率</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 筛选栏 -->
        <div class="filter-bar">
            <div class="filter-group">
                <div class="filter-item search-wrapper">
                    <Search :size="14" class="search-icon" />
                    <input type="text" v-model="filters.search" placeholder="搜索卷号..." class="text-input" />
                </div>
                <div class="filter-divider"></div>
                <div class="filter-item">
                    <span class="filter-label">起</span>
                    <input type="date" v-model="filters.dateFrom" class="date-input" />
                </div>
                <div class="filter-item">
                    <span class="filter-label">止</span>
                    <input type="date" v-model="filters.dateTo" class="date-input" />
                </div>
                <div class="filter-divider"></div>
                <div class="filter-item">
                    <select v-model="filters.defectType" class="select-input">
                        <option value="">缺陷类型</option>
                        <option v-for="opt in topDefectOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="filter-item">
                    <select v-model="filters.conclusion" class="select-input">
                        <option value="">评审结论</option>
                        <option v-for="opt in topConclusionOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="filter-item">
                    <select v-model="filters.grade" class="select-input">
                        <option value="">等级</option>
                        <option value="A">一级品</option>
                        <option value="B">二级品</option>
                    </select>
                </div>
                <div class="filter-item">
                    <select v-model="filters.machine" class="select-input">
                        <option value="">机台</option>
                        <option v-for="m in ['1#', '2#', '4#', '5#']" :key="m" :value="m">{{ m }}</option>
                    </select>
                </div>
                <button v-if="hasActiveFilter" class="btn-reset" @click="resetFilters">
                    <X :size="12" />
                    清除
                </button>
            </div>
            <div class="filter-result-hint" v-if="hasActiveFilter">
                <Filter :size="12" />
                筛选到 <b>{{ filteredList.length }}</b> 条记录
            </div>
        </div>

        <!-- 结果表格 -->
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th width="120">大卷号</th>
                        <th width="55">车次</th>
                        <th width="50">机台</th>
                        <th width="75">客户</th>
                        <th width="105">规格</th>
                        <th width="155">缺陷类型</th>
                        <th width="95">评审结论</th>
                        <th width="55">等级</th>
                        <th width="65">评审人</th>
                        <th width="95">评审时间</th>
                        <th width="55">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in filteredList" :key="item.id" class="data-row" @click="openDrawer(item)">
                        <td class="font-mono font-medium coil-cell">{{ item.coilNo }}</td>
                        <td class="text-dim">{{ item.tripNo }}</td>
                        <td><span class="machine-badge">{{ item.machine }}</span></td>
                        <td>{{ item.customer }}</td>
                        <td class="spec-cell">{{ item.thickness }}μm × {{ item.width }}mm</td>
                        <td>
                            <div class="defect-tags">
                                <span v-for="d in (item.entryData?.defectReasons || []).slice(0, 3)" :key="d"
                                    class="defect-tag">{{ d }}</span>
                                <span v-if="(item.entryData?.defectReasons?.length || 0) > 3" class="defect-more">+{{
                                    item.entryData.defectReasons.length - 3 }}</span>
                                <span v-if="!item.entryData?.defectReasons?.length" class="text-muted">—</span>
                            </div>
                        </td>
                        <td>
                            <span :class="['conclusion-badge', getConclusionClass(item.reviewData?.mainConclusion)]">
                                {{ item.reviewData?.mainConclusion || '—' }}
                            </span>
                        </td>
                        <td>
                            <span
                                :class="['grade-badge', item.reviewData?.productGrade === 'B' ? 'grade-b' : 'grade-a']">
                                {{ item.reviewData?.productGrade === 'B' ? '二级' : '一级' }}
                            </span>
                        </td>
                        <td class="text-dim">{{ item.reviewer || '—' }}</td>
                        <td class="text-dim time-cell">{{ formatTime(item.reviewTime) }}</td>
                        <td>
                            <button class="btn-action btn-view" @click.stop="openDrawer(item)">
                                <Eye :size="13" />
                            </button>
                        </td>
                    </tr>
                    <tr v-if="filteredList.length === 0">
                        <td colspan="11" class="empty-state">
                            <SearchX :size="32" class="empty-icon" />
                            <span>没有符合条件的记录</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 右侧抽屉 -->
        <Teleport to="body">
            <Transition name="drawer">
                <div v-if="drawerOpen" class="drawer-overlay" @click.self="closeDrawer">
                    <aside class="drawer-panel">
                        <!-- 抽屉头部 -->
                        <div class="drawer-header">
                            <div class="drawer-title-row">
                                <ClipboardCheck :size="18" class="drawer-title-icon" />
                                <span class="drawer-coil font-mono">{{ drawerItem?.coilNo }}</span>
                                <span class="drawer-trip">{{ drawerItem?.tripNo }}</span>
                                <span
                                    :class="['grade-badge', drawerItem?.reviewData?.productGrade === 'B' ? 'grade-b' : 'grade-a']"
                                    style="margin-left: 0.25rem">
                                    {{ drawerItem?.reviewData?.productGrade === 'B' ? '二级品' : '一级品' }}
                                </span>
                            </div>
                            <button class="btn-close" @click="closeDrawer" aria-label="关闭抽屉">
                                <X :size="16" />
                            </button>
                        </div>

                        <div class="drawer-body">
                            <!-- ① 料卷基础信息 -->
                            <section class="drawer-section">
                                <h4 class="drawer-section-title">
                                    <Package :size="13" class="section-icon" />
                                    料卷信息
                                </h4>
                                <div class="drawer-info-grid">
                                    <div class="di-row"><span class="di-label">大卷号</span><span
                                            class="di-val font-mono">{{ drawerItem?.coilNo }}</span></div>
                                    <div class="di-row"><span class="di-label">合金</span><span class="di-val">{{
                                        drawerItem?.alloy }}</span></div>
                                    <div class="di-row"><span class="di-label">规格</span><span class="di-val">{{
                                        drawerItem?.thickness }}μm × {{ drawerItem?.width }}mm</span></div>
                                    <div class="di-row"><span class="di-label">机台</span><span class="di-val">{{
                                        drawerItem?.machine }}</span></div>
                                    <div class="di-row"><span class="di-label">客户</span><span class="di-val">{{
                                        drawerItem?.customer }}</span></div>
                                    <div class="di-row"><span class="di-label">米数</span><span class="di-val">{{
                                        drawerItem?.entryData?.meters?.toLocaleString() || '—' }} m</span></div>
                                    <div class="di-row"><span class="di-label">重量</span><span class="di-val">{{
                                        drawerItem?.entryData?.weight || '—' }} kg</span></div>
                                    <div class="di-row"><span class="di-label">接头</span><span class="di-val">{{
                                        drawerItem?.entryData?.joints ?? '—' }} 个</span></div>
                                    <div class="di-row"><span class="di-label">下料时间</span><span class="di-val">{{
                                        formatTime(drawerItem?.downloadTime) }}</span></div>
                                </div>
                            </section>

                            <!-- ② 检测数据 -->
                            <section class="drawer-section" v-if="drawerItem?.entryData">
                                <h4 class="drawer-section-title">
                                    <Microscope :size="13" class="section-icon" />
                                    检测数据
                                </h4>
                                <!-- 针孔 -->
                                <div class="drawer-data-group">
                                    <span class="ddg-label">针孔：</span>
                                    <div class="pinhole-inline">
                                        <span class="ph-tag ab">AB <b>{{ drawerItem.entryData.pinholeA }}/{{
                                            drawerItem.entryData.pinholeB }}</b></span>
                                        <span class="ph-tag cd">CD <b>{{ drawerItem.entryData.pinholeC }}/{{
                                            drawerItem.entryData.pinholeD }}</b></span>
                                        <span class="ph-tag e">E <b>{{ drawerItem.entryData.pinholeE }}</b></span>
                                    </div>
                                </div>
                                <div v-if="drawerItem.entryData.densePinhole" class="drawer-alert">
                                    <AlertTriangle :size="13" class="alert-icon" />
                                    密集型针孔：{{ drawerItem.entryData.densePinholeNote || '有' }}
                                </div>
                                <div v-if="drawerItem.entryData.offlinePinhole" class="drawer-data-row">
                                    <span class="ddr-label">离线针孔：</span>
                                    <span class="ddr-val">{{ drawerItem.entryData.offlinePinhole }} 个</span>
                                </div>
                                <div v-if="drawerItem.entryData.longitudinalDensity" class="drawer-data-row">
                                    <span class="ddr-label">纵向密度：</span>
                                    <span class="ddr-val">{{ drawerItem.entryData.longitudinalDensity }} 个/m</span>
                                </div>
                                <!-- 表面 -->
                                <div v-if="drawerItem.entryData.surfaceInfo" class="drawer-data-row">
                                    <span class="ddr-label">表面：</span>
                                    <span class="ddr-val ddr-text">{{ drawerItem.entryData.surfaceInfo }}</span>
                                </div>
                                <div v-if="drawerItem.entryData.slittingQuality" class="drawer-data-row">
                                    <span class="ddr-label">分切质量：</span>
                                    <span class="ddr-val ddr-text">{{ drawerItem.entryData.slittingQuality }}</span>
                                </div>
                                <!-- 板型 / 其他 -->
                                <div v-if="drawerItem.entryData.flatness != null" class="drawer-data-row">
                                    <span class="ddr-label">下榻量：</span>
                                    <span class="ddr-val">{{ drawerItem.entryData.flatness }} mm</span>
                                </div>
                                <div v-if="drawerItem.entryData.dyneValue" class="drawer-data-row">
                                    <span class="ddr-label">达因值：</span>
                                    <span
                                        :class="['ddr-val', Number(String(drawerItem.entryData.dyneValue).split('/')[0]) < 33 ? 'val-warn' : '']">
                                        {{ drawerItem.entryData.dyneValue }} Dyne
                                    </span>
                                </div>
                                <!-- 面密度 -->
                                <div v-if="drawerItem.entryData.faceDensity?.some(v => v != null)" class="fd-section">
                                    <span class="ddr-label">面密度 g/㎡ (6点)：</span>
                                    <table class="fd-table">
                                        <thead>
                                            <tr>
                                                <th v-for="label in ['上左', '上右', '中左', '中右', '下左', '下右']" :key="label">
                                                    {{
                                                        label }}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td v-for="(v, i) in drawerItem.entryData.faceDensity" :key="i">{{ v ??
                                                    '—' }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <!-- 初判 -->
                                <div class="drawer-data-row" style="margin-top: 0.5rem;">
                                    <span class="ddr-label">质量初判：</span>
                                    <span
                                        :class="['ddr-val', drawerItem.entryData.qualityJudgment === 'nonconform' ? 'val-bad' : 'val-good']">
                                        {{ drawerItem.entryData.qualityJudgment === 'nonconform' ? '不合格' : '合格' }}
                                    </span>
                                </div>
                                <div v-if="drawerItem.entryData.defectReasons?.length" class="drawer-data-row">
                                    <span class="ddr-label">降级原因：</span>
                                    <span class="ddr-val">{{ drawerItem.entryData.defectReasons.join('、') }}</span>
                                </div>
                            </section>

                            <!-- ③ 评审结果 -->
                            <section class="drawer-section" v-if="drawerItem?.reviewData">
                                <h4 class="drawer-section-title">
                                    <ShieldCheck :size="13" class="section-icon" />
                                    评审结果
                                </h4>
                                <div class="drawer-data-row">
                                    <span class="ddr-label">评审结论：</span>
                                    <span
                                        :class="['conclusion-badge', getConclusionClass(drawerItem.reviewData.mainConclusion)]">
                                        {{ drawerItem.reviewData.mainConclusion }}
                                    </span>
                                </div>
                                <div class="drawer-data-row">
                                    <span class="ddr-label">产品等级：</span>
                                    <span
                                        :class="['grade-badge', drawerItem.reviewData.productGrade === 'B' ? 'grade-b' : 'grade-a']">
                                        {{ drawerItem.reviewData.productGrade === 'B' ? '二级品' : '一级品' }}
                                    </span>
                                </div>
                                <div v-if="drawerItem.reviewData.downgradeReason" class="drawer-data-row">
                                    <span class="ddr-label">降级原因：</span>
                                    <span class="ddr-val">{{ drawerItem.reviewData.downgradeReason }}</span>
                                </div>
                                <div v-if="drawerItem.reviewData.deliveryTarget" class="drawer-data-row">
                                    <span class="ddr-label">传递对象：</span>
                                    <span class="ddr-val">{{ drawerItem.reviewData.deliveryTarget }}</span>
                                </div>
                                <!-- 处理指令 -->
                                <div v-if="drawerItem.reviewData.instructions?.length" class="drawer-instructions">
                                    <div class="di-title">
                                        <ListChecks :size="13" class="section-icon" />
                                        处理指令（{{ drawerItem.reviewData.instructions.length }}条）
                                    </div>
                                    <div v-for="(inst, idx) in drawerItem.reviewData.instructions" :key="idx"
                                        class="di-inst-row">
                                        <span class="di-idx">{{ idx + 1 }}</span>
                                        <span class="di-loc">{{ inst.locationSide }}
                                            <template v-if="inst.startMm != null"> {{ inst.startMm }}–{{ inst.endMm
                                            }}mm</template>
                                            <template v-if="inst.lengthStartM != null"> · {{ inst.lengthStartM }}–{{
                                                inst.lengthEndM }}m</template>
                                        </span>
                                        <span class="di-defect">{{ inst.defectType }}</span>
                                        <span class="di-treat">{{ inst.treatment }}</span>
                                    </div>
                                </div>
                                <div v-if="drawerItem.reviewData.note" class="drawer-note">
                                    <StickyNote :size="13" class="note-icon" />
                                    {{ drawerItem.reviewData.note }}
                                </div>
                                <div class="drawer-meta">
                                    <span>
                                        <User :size="12" class="meta-icon" /> {{ drawerItem.reviewer }}
                                    </span>
                                    <span>
                                        <Clock :size="12" class="meta-icon" /> {{ formatTime(drawerItem.reviewTime) }}
                                    </span>
                                </div>
                            </section>
                        </div>

                        <!-- 抽屉底部 -->
                        <div class="drawer-footer">
                            <button class="btn-full-view" @click="goToReview(drawerItem?.id)">
                                查看完整评审页
                                <ArrowRight :size="14" />
                            </button>
                        </div>
                    </aside>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
    Search, FileSearch, Database, TrendingDown, TrendingUp,
    X, Filter, Eye, SearchX, ClipboardCheck, Package,
    Microscope, ShieldCheck, AlertTriangle, StickyNote, ListChecks,
    User, Clock, ArrowRight,
} from 'lucide-vue-next'
import {
    qualityCoilList,
    defectTypeOptions,
    mainConclusionOptions,
} from '../data/quality-review-data'

const router = useRouter()

// ─── 数据源 ──────────────────────────────────────────────────
const completedList = computed(() =>
    qualityCoilList.filter(c => c.status === 'completed')
)

// 精简筛选选项：只展示数据中实际使用的缺陷类型和评审结论
const topDefectOptions = computed(() => {
    const counts = {}
    completedList.value.forEach(c => {
        (c.entryData?.defectReasons || []).forEach(d => { counts[d] = (counts[d] || 0) + 1 })
    })
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])
})

const topConclusionOptions = computed(() => {
    const counts = {}
    completedList.value.forEach(c => {
        const mc = c.reviewData?.mainConclusion
        if (mc) counts[mc] = (counts[mc] || 0) + 1
    })
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])
})

// ─── 统计卡片（核心 KPI） ─────────────────────────────────────

// 一次合格率：质检初判为合格的比例
const firstPassYield = computed(() => {
    const total = completedList.value.length
    if (!total) return 0
    const conformCount = completedList.value.filter(c => c.entryData?.qualityJudgment === 'conform').length
    return Math.round(conformCount / total * 100)
})

// 让步放行率：评审结论包含"让步放行"或"沟通放行"的比例
const concessionRate = computed(() => {
    const total = completedList.value.length
    if (!total) return 0
    const concessionConclusions = ['让步放行', '沟通放行']
    const count = completedList.value.filter(c => concessionConclusions.includes(c.reviewData?.mainConclusion)).length
    return Math.round(count / total * 100)
})

// 二级品率
const downgradeRate = computed(() => {
    const total = completedList.value.length
    if (!total) return 0
    const bCount = completedList.value.filter(c => c.reviewData?.productGrade === 'B').length
    return Math.round(bCount / total * 100)
})

// ─── 环比趋势（前半 vs 后半数据，模拟周环比） ───────────────────
// 将已完成数据按时间排序后均分两段计算趋势变化
const trendData = computed(() => {
    const sorted = [...completedList.value].sort((a, b) => new Date(a.reviewTime) - new Date(b.reviewTime))
    const mid = Math.floor(sorted.length / 2)
    if (mid === 0) return { fpyPrev: null, fpyNow: null, concPrev: null, concNow: null, dgPrev: null, dgNow: null }
    const prev = sorted.slice(0, mid)
    const curr = sorted.slice(mid)
    const calcRate = (list, predicate) => {
        if (!list.length) return 0
        return Math.round(list.filter(predicate).length / list.length * 100)
    }
    return {
        fpyPrev: calcRate(prev, c => c.entryData?.qualityJudgment === 'conform'),
        fpyNow: calcRate(curr, c => c.entryData?.qualityJudgment === 'conform'),
        concPrev: calcRate(prev, c => ['让步放行', '沟通放行'].includes(c.reviewData?.mainConclusion)),
        concNow: calcRate(curr, c => ['让步放行', '沟通放行'].includes(c.reviewData?.mainConclusion)),
        dgPrev: calcRate(prev, c => c.reviewData?.productGrade === 'B'),
        dgNow: calcRate(curr, c => c.reviewData?.productGrade === 'B'),
    }
})

const fpyTrend = computed(() => {
    const t = trendData.value
    return t.fpyPrev !== null ? t.fpyNow - t.fpyPrev : null
})
const concessionTrend = computed(() => {
    const t = trendData.value
    return t.concPrev !== null ? t.concNow - t.concPrev : null
})
const downgradeTrend = computed(() => {
    const t = trendData.value
    return t.dgPrev !== null ? t.dgNow - t.dgPrev : null
})

// ─── 筛选 ─────────────────────────────────────────────────────
const filters = ref({
    search: '',
    dateFrom: '',
    dateTo: '',
    defectType: '',
    conclusion: '',
    grade: '',
    machine: '',
})

const hasActiveFilter = computed(() =>
    Object.values(filters.value).some(v => v !== '')
)

function resetFilters() {
    filters.value = { search: '', dateFrom: '', dateTo: '', defectType: '', conclusion: '', grade: '', machine: '' }
}

const filteredList = computed(() => {
    let result = completedList.value

    if (filters.value.search) {
        const term = filters.value.search.toLowerCase()
        result = result.filter(c => c.coilNo.toLowerCase().includes(term))
    }
    if (filters.value.dateFrom) {
        const from = new Date(filters.value.dateFrom)
        from.setHours(0, 0, 0, 0)
        result = result.filter(c => new Date(c.reviewTime) >= from)
    }
    if (filters.value.dateTo) {
        const to = new Date(filters.value.dateTo)
        to.setHours(23, 59, 59, 999)
        result = result.filter(c => new Date(c.reviewTime) <= to)
    }
    if (filters.value.defectType) {
        result = result.filter(c => c.entryData?.defectReasons?.includes(filters.value.defectType))
    }
    if (filters.value.conclusion) {
        result = result.filter(c => c.reviewData?.mainConclusion === filters.value.conclusion)
    }
    if (filters.value.grade) {
        result = result.filter(c => c.reviewData?.productGrade === filters.value.grade)
    }
    if (filters.value.machine) {
        result = result.filter(c => c.machine === filters.value.machine)
    }

    return [...result].sort((a, b) => new Date(b.reviewTime) - new Date(a.reviewTime))
})

// ─── 抽屉 ────────────────────────────────────────────────────
const drawerOpen = ref(false)
const drawerItem = ref(null)

function openDrawer(item) {
    drawerItem.value = item
    drawerOpen.value = true
}
function closeDrawer() { drawerOpen.value = false }
function goToReview(id) { if (id) router.push(`/quality/${id}/review`) }

// ─── 工具函数 ────────────────────────────────────────────────
function formatTime(dateString) {
    if (!dateString) return '—'
    const d = new Date(dateString)
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getConclusionClass(c) {
    if (!c) return ''
    if (['让步放行', '沟通放行', '正常处理', '评审可切'].includes(c)) return 'c-pass'
    if (['改切', '改切二级品', '直接降级处理', '转精切'].includes(c)) return 'c-recut'
    if (['扒废', '建议扒废'].includes(c)) return 'c-scrap'
    return 'c-other'
}
</script>

<style scoped>
.trace-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-main);
    gap: 0.75rem;
}

/* ── 顶部 ── */
.page-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.page-title {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-main);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.title-icon {
    color: var(--primary-color);
}

.stat-cards {
    display: flex;
    gap: 0.55rem;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 0.45rem 0.85rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.2s, transform 0.2s;
}

.stat-card:hover {
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.07);
    transform: translateY(-1px);
}

.stat-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 7px;
    flex-shrink: 0;
}

.fpy-bg {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.total-bg {
    background: rgba(37, 99, 235, 0.1);
    color: #2563eb;
}

.concession-bg {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
}

.downgrade-bg {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

.stat-body {
    display: flex;
    flex-direction: column;
}

.stat-value-row {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
}

.stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.1;
    color: var(--text-main);
}

.stat-value small {
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0.7;
}

.stat-trend {
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    white-space: nowrap;
}

.trend-up {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.trend-down {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

.stat-label {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 0.08rem;
}

/* ── 图表区 ── */
.charts-row {
    display: grid;
    grid-template-columns: 1fr 1.3fr 1fr;
    gap: 0.75rem;
}

.chart-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 0.75rem 0.85rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.chart-header {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.4rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid var(--border-light);
}

.chart-icon {
    color: var(--text-muted);
}

.chart-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-secondary);
}

.chart-wrap {
    height: 170px;
    position: relative;
}

/* ── 筛选栏 ── */
.filter-bar {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 0.55rem 0.85rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
}

.filter-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.filter-label {
    font-size: 0.72rem;
    color: var(--text-muted);
    white-space: nowrap;
    font-weight: 500;
}

.filter-divider {
    width: 1px;
    height: 20px;
    background: var(--border-light);
}

.select-input,
.text-input,
.date-input {
    padding: 0.3rem 0.55rem;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    background-color: var(--bg-main);
    color: var(--text-main);
    font-size: 0.8rem;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.select-input:focus,
.text-input:focus,
.date-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.search-wrapper {
    position: relative;
}

.search-icon {
    position: absolute;
    left: 0.45rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
}

.search-wrapper .text-input {
    padding-left: 1.6rem;
    width: 145px;
}

.date-input {
    width: 120px;
}

.btn-reset {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.28rem 0.6rem;
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: var(--radius-sm);
    background: rgba(239, 68, 68, 0.06);
    color: #dc2626;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
}

.btn-reset:hover {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.4);
}

.filter-result-hint {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: var(--primary-color);
    white-space: nowrap;
}

.filter-result-hint b {
    font-weight: 700;
}

/* ── 表格 ── */
.table-container {
    flex: 1;
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    overflow: auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.84rem;
}

.data-table th,
.data-table td {
    padding: 0.6rem 0.7rem;
    text-align: center;
    border-bottom: 1px solid var(--border-light);
}

.data-table th {
    background-color: var(--bg-main);
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.76rem;
    position: sticky;
    top: 0;
    z-index: 10;
    white-space: nowrap;
}

.data-table td {
    color: var(--text-main);
}

.data-row {
    cursor: pointer;
    transition: background-color 0.12s;
}

.data-row:hover {
    background-color: rgba(37, 99, 235, 0.04);
}

.data-row:active {
    background-color: rgba(37, 99, 235, 0.08);
}

.font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.font-medium {
    font-weight: 500;
}

.text-dim {
    color: var(--text-secondary);
    font-size: 0.82rem;
}

.text-muted {
    color: var(--text-muted);
}

.spec-cell {
    white-space: nowrap;
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.coil-cell {
    color: var(--primary-color);
}

.time-cell {
    font-size: 0.78rem;
    white-space: nowrap;
}

.machine-badge {
    display: inline-block;
    padding: 0.12rem 0.4rem;
    background: var(--bg-main);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--text-secondary);
}

.defect-tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    justify-content: center;
}

.defect-tag {
    padding: 0.1rem 0.35rem;
    background: rgba(239, 68, 68, 0.07);
    color: #dc2626;
    border-radius: 3px;
    font-size: 0.7rem;
    font-weight: 500;
}

.defect-more {
    padding: 0.1rem 0.3rem;
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-muted);
    border-radius: 3px;
    font-size: 0.68rem;
}

.conclusion-badge {
    display: inline-block;
    padding: 0.15rem 0.45rem;
    border-radius: var(--radius-sm);
    font-size: 0.74rem;
    font-weight: 500;
    white-space: nowrap;
}

.c-pass {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.c-recut {
    background: rgba(245, 158, 11, 0.1);
    color: #b45309;
}

.c-scrap {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

.c-other {
    background: rgba(99, 102, 241, 0.1);
    color: #4f46e5;
}

.grade-badge {
    display: inline-block;
    padding: 0.12rem 0.4rem;
    border-radius: var(--radius-sm);
    font-size: 0.72rem;
    font-weight: 600;
}

.grade-a {
    background: rgba(37, 99, 235, 0.08);
    color: #1d4ed8;
}

.grade-b {
    background: rgba(245, 158, 11, 0.1);
    color: #b45309;
}

.btn-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    border: 1px solid var(--border-light);
    background: transparent;
    color: var(--text-secondary);
    transition: all 0.15s;
}

.btn-action:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.empty-state {
    text-align: center !important;
    padding: 3rem !important;
    color: var(--text-muted) !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.empty-icon {
    opacity: 0.3;
}

/* ── 抽屉 ── */
.drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: flex-end;
}

.drawer-panel {
    width: 440px;
    height: 100%;
    background: var(--bg-surface);
    box-shadow: -12px 0 40px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--border-light);
}

.drawer-enter-active,
.drawer-leave-active {
    transition: opacity 0.2s ease;
}

.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from {
    opacity: 0;
}

.drawer-enter-from .drawer-panel {
    transform: translateX(100%);
}

.drawer-leave-to {
    opacity: 0;
}

.drawer-leave-to .drawer-panel {
    transform: translateX(100%);
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.15rem;
    border-bottom: 1px solid var(--border-light);
    flex-shrink: 0;
    background: var(--bg-main);
}

.drawer-title-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
}

.drawer-title-icon {
    color: var(--primary-color);
}

.drawer-coil {
    font-size: 1rem;
    font-weight: 600;
    color: var(--primary-color);
}

.drawer-trip {
    font-size: 0.75rem;
    padding: 0.1rem 0.4rem;
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: 9999px;
    color: var(--text-secondary);
    font-weight: 500;
}

.btn-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: transparent;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
}

.btn-close:hover {
    background: var(--bg-hover);
    color: var(--text-main);
    border-color: var(--text-muted);
}

.drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.15rem;
    display: flex;
    flex-direction: column;
    gap: 1.35rem;
}

.drawer-section {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
}

.drawer-section-title {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.76rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding-bottom: 0.45rem;
    border-bottom: 1px solid var(--border-light);
    margin: 0;
}

.section-icon {
    color: var(--primary-color);
    opacity: 0.7;
}

.drawer-info-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.di-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.84rem;
}

.di-label {
    color: var(--text-secondary);
}

.di-val {
    color: var(--text-main);
    font-weight: 500;
    text-align: right;
    max-width: 210px;
}

.drawer-data-group {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.84rem;
    flex-wrap: wrap;
}

.ddg-label {
    color: var(--text-secondary);
    flex-shrink: 0;
}

.pinhole-inline {
    display: flex;
    gap: 0.4rem;
}

.ph-tag {
    font-size: 0.73rem;
    padding: 0.12rem 0.35rem;
    border-radius: 3px;
    font-weight: 500;
}

.ph-tag b {
    font-family: ui-monospace, monospace;
    font-size: 0.8rem;
}

.ph-tag.ab {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
}

.ph-tag.cd {
    background: rgba(245, 158, 11, 0.08);
    color: #b45309;
}

.ph-tag.e {
    background: rgba(99, 102, 241, 0.08);
    color: #4f46e5;
}

.drawer-alert {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
    font-size: 0.8rem;
    color: #dc2626;
    background: rgba(239, 68, 68, 0.06);
    padding: 0.4rem 0.6rem;
    border-radius: var(--radius-sm);
    border-left: 3px solid #dc2626;
}

.alert-icon {
    flex-shrink: 0;
    margin-top: 1px;
}

.drawer-data-row {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
    font-size: 0.84rem;
    line-height: 1.5;
}

.ddr-label {
    color: var(--text-secondary);
    flex-shrink: 0;
}

.ddr-val {
    color: var(--text-main);
    font-weight: 500;
}

.ddr-text {
    line-height: 1.55;
}

.val-warn {
    color: #d97706;
}

.val-bad {
    color: #dc2626;
    font-weight: 600;
}

.val-good {
    color: #059669;
    font-weight: 600;
}

.fd-row {
    flex-direction: column;
}

.fd-vals {
    display: flex;
    gap: 0.5rem;
}

.fd-v {
    font-family: ui-monospace, monospace;
    font-size: 0.8rem;
    color: var(--text-main);
}

.drawer-instructions {
    margin-top: 0.25rem;
    padding: 0.6rem;
    background: var(--bg-main);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
}

.di-title {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.76rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.45rem;
}

.di-inst-row {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.76rem;
    padding: 0.3rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.di-inst-row:last-child {
    border-bottom: none;
}

.di-idx {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 17px;
    height: 17px;
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: 50%;
    font-size: 0.62rem;
    color: var(--text-secondary);
    flex-shrink: 0;
}

.di-loc {
    font-family: ui-monospace, monospace;
    font-size: 0.72rem;
    color: var(--text-secondary);
    flex-shrink: 0;
}

.di-defect {
    color: #dc2626;
    font-weight: 500;
    flex-shrink: 0;
}

.di-treat {
    color: #2563eb;
    font-weight: 500;
    margin-left: auto;
    flex-shrink: 0;
}

.drawer-note {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
    font-size: 0.82rem;
    color: var(--text-secondary);
    background: var(--bg-main);
    padding: 0.45rem 0.6rem;
    border-radius: var(--radius-sm);
    line-height: 1.5;
}

.note-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--text-muted);
}

.drawer-meta {
    display: flex;
    gap: 1.25rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
    padding-top: 0.45rem;
    border-top: 1px solid var(--border-light);
}

.drawer-meta span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.meta-icon {
    opacity: 0.5;
}

.drawer-footer {
    padding: 0.75rem 1.15rem;
    border-top: 1px solid var(--border-light);
    flex-shrink: 0;
}

.btn-full-view {
    width: 100%;
    padding: 0.55rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.84rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
}

.btn-full-view:hover {
    background: var(--primary-hover);
}

/* 面密度6点表格 */
.fd-section {
    margin-top: 0.35rem;
}

.fd-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.3rem;
    font-size: 0.78rem;
}

.fd-table th {
    background: var(--bg-main);
    color: var(--text-muted);
    font-weight: 500;
    padding: 0.25rem 0.3rem;
    text-align: center;
    border: 1px solid var(--border-light);
    font-size: 0.72rem;
}

.fd-table td {
    text-align: center;
    padding: 0.3rem 0.3rem;
    border: 1px solid var(--border-light);
    font-family: var(--font-mono, 'SF Mono', 'Cascadia Code', 'Consolas', monospace);
    font-weight: 500;
    color: var(--text-main);
}
</style>
