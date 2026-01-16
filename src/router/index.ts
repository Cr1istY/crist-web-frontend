import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import HomeView from '@/views/blog/HomeViewPage.vue'
import NotFound from '@/views/NotFoundPage.vue'
import BlogList from '@/views/blog/BlogList.vue'
import AdminLogin from '@/views/admin/AdminLogin.vue'
import BlogDetailPage from '@/views/blog/BlogDetailPage.vue'
import CreatePost from '@/views/admin/CreatePost.vue'
import UpdatePost from '@/views/admin/UpdatePost.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Home' },
    },
    {
      path: '/blog',
      name: 'blog',
      component: BlogList,
      meta: { title: 'Blog' },
    },
    {
      path: '/admin',
      name: 'login',
      component: AdminLogin,
      meta: { title: 'Admin Login' },
    },
    {
      path: '/admin/create',
      name: 'create',
      component: CreatePost,
      meta: {
        title: 'Create Post',
        requiresAuth: true
       },
    },
    {
      path: '/admin/update/:id',
      name: 'update',
      component: UpdatePost,
      meta: {
        title: 'Update Post',
        requiresAuth: true
      }
    },
    {
      path: '/post/:id',
      name: 'PostDetail',
      component: BlogDetailPage,
    },

    // 404
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
      meta: { title: '页面走丢了' },
    },
  ],
})

router.beforeEach((to: RouteLocationNormalized, from, next) => {
  const token = localStorage.getItem('access_token')

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next({
        path: '/admin',
        query: { redirect: to.fullPath },
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
