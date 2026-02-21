import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import service from '@/utils/request'
import HomeView from '@/views/blog/HomePage.vue'
import NotFound from '@/views/NotFoundPage.vue'
import BlogListWithPinned from '@/views/blog/BlogListFinal.vue'
import AdminLogin from '@/views/admin/AdminLogin.vue'
import CreatePost from '@/views/post/AdminCreatePost.vue'
import UpdatePost from '@/views/post/AdminUpdatePost.vue'
import BlogDetailPageWithSlug from '@/views/blog/BlogDetailPageWithSlug.vue'
import CreateCategory from '@/views/category/CreateCategory.vue'
import AdminIndex from '@/views/admin/AdminIndexPage.vue'
import TweetIndex from '@/views/tweet/TweetIndexPage.vue'


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
      component: BlogListWithPinned,
      meta: { title: 'Blog' },
    },
    {
      path: '/thread',
      name: 'thread',
      component: TweetIndex,
      meta: { title: 'Thread' },
    },
    // {
    //   path: '/post/:id',
    //   name: 'PostDetail',
    //   component: BlogDetailPage,
    // },
    {
      path: '/blog/:slug',
      name: 'PostDetailBySlug',
      component: BlogDetailPageWithSlug,
    },
    // admin 管理路由配置
    {
      path: '/admin',
      name: 'login',
      component: AdminLogin,
      meta: { title: 'Admin Login' },
    },
    {
      path: '/admin/post/create',
      name: 'create',
      component: CreatePost,
      meta: {
        title: 'Create Post',
      },
    },
    {
      path: '/admin/update/:id',
      name: 'update',
      component: UpdatePost,
      meta: {
        title: 'Update Post',
      },
    },
    {
      path: '/admin/category/create',
      name: 'CreateCategory',
      component: CreateCategory,
      meta: {
        title: 'Create Category',
      },
    },
    {
      path: '/admin/dashboard',
      name: 'AdminIndex',
      component: AdminIndex,
      meta: { title: 'Admin Index' },
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

router.beforeEach(async (to: RouteLocationNormalized, from, next) => {
  const token = localStorage.getItem('access_token')

  const needAuth =
    to.matched.some((record) => record.meta.requiresAuth) ||
    (to.path.startsWith('/admin') && to.path !== '/admin')

  if (needAuth) {
    if (token) {
      if (from.path === '/admin') {
        next()
        return
      }
      // 先刷新token
      const newToken = await service.post('/auth/refresh')
      if (newToken) {
        localStorage.setItem('access_token', newToken.data.access_token)
        console.log('刷新token成功')
      }
      // 刷新token成功后，再进行路由跳转
      next()
    } else {
      // 未登录：跳转至登录页，并携带原始路径用于登录后重定向
      next({
        path: '/admin',
        query: { redirect: to.fullPath }, // fullPath 包含 query/hash，确保精准跳回
      })
    }
  } else {
    next()
  }
})

export default router
