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
            {
                path: 'quality',
                name: 'Quality',
                component: () => import('../views/QualityView.vue')
            },
            {
                path: 'quality/:id/review',
                name: 'QualityReview',
                component: () => import('../views/QualityReviewView.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
