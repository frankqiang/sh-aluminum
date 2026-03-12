import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layout/AppLayout.vue'

const routes = [
    {
        path: '/',
        component: AppLayout,
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('../views/DashboardView.vue')
            },
            {
                path: 'rolling',
                name: 'Rolling',
                component: () => import('../views/RollingView.vue')
            },
            {
                path: 'slitting',
                name: 'Slitting',
                component: () => import('../views/SlittingView.vue')
            },
            {
                path: 'finishing',
                name: 'Finishing',
                component: () => import('../views/FinishingView.vue')
            },
            {
                path: 'precision-cutting',
                name: 'PrecisionCutting',
                component: () => import('../views/PrecisionCuttingView.vue')
            },
            // 质量模块 - 列表页
            {
                path: 'quality',
                name: 'Quality',
                component: () => import('../views/QualityView.vue')
            },
            // 质量模块 - 追溯查询页
            {
                path: 'quality/trace',
                name: 'QualityTrace',
                component: () => import('../views/QualityTraceView.vue')
            },
            // 质量模块 - 质量统计页
            {
                path: 'quality/stats',
                name: 'QualityStats',
                component: () => import('../views/QualityStatsView.vue')
            },
            // 质量模块 - 检测数据录入页（质检员）
            {
                path: 'quality/:id/entry',
                name: 'QualityEntry',
                component: () => import('../views/QualityEntryView.vue')
            },
            // 质量模块 - 评审页（质量工程师）
            {
                path: 'quality/:id/review',
                name: 'QualityReview',
                component: () => import('../views/QualityReviewView.vue')
            },

            // 物料管理模块 - 在制品看板
            {
                path: 'material/dashboard',
                name: 'MaterialDashboard',
                component: () => import('../views/MaterialDashboardView.vue')
            },
            // 物料管理模块 - 库位地图
            {
                path: 'material/location',
                name: 'MaterialLocation',
                component: () => import('../views/MaterialLocationView.vue')
            },
            // 物料管理模块 - 料卷查询
            {
                path: 'material/coils',
                name: 'MaterialCoils',
                component: () => import('../views/MaterialCoilsView.vue')
            },
            // 生产执行模块 - 订单看板
            {
                path: 'execution/dashboard',
                name: 'ExecutionDashboard',
                component: () => import('../views/ExecutionDashboardView.vue')
            },
            // 生产执行模块 - 订单跟踪列表
            {
                path: 'execution/orders',
                name: 'ExecutionOrders',
                component: () => import('../views/ExecutionOrdersView.vue')
            },
            // 生产执行模块 - 单张订单详情
            {
                path: 'execution/orders/:id',
                name: 'ExecutionOrderDetail',
                component: () => import('../views/ExecutionOrderDetailView.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
