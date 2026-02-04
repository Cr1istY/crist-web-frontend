
<template>
  <div class="blog-layout">
    <BlogSidebar
      :posts="allPosts"
      :total-posts="totalPosts"
      v-model:date="selectedDate"
      v-model:tag="selectedTag"
      v-model:search="searchKeyword"
      @clear-filters="clearFilters"
    />

    <main class="main-content">
      <BlogPostItem
        v-for="post in paginatedPosts"
        :key="post.id"
        :post="post"
        :show-pin="showPinBadge(post)"
        @tag-click="handleTagClick"
      />

      <PaginationControls
        v-if="totalPages > 1"
        v-model:page="currentPage"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        @update:page-size="handlePageSizeChange"
      />

      <n-empty v-if="!loading && filteredPosts.length === 0" description="暂无匹配文章" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import BlogSidebar from '@/components/blog/BlogSideabar.vue'
import BlogPostItem from '@/components/blog/BlogPostItem.vue'
import PaginationControls from '@/components/blog/PaginationControls.vue'
import { useBlogSearch } from '@/composables/useBlogSearch'
import { usePostFiltering } from '@/composables/usePostFiltering'
import { useTagRouting } from '@/composables/useTagRouting'
import type { BlogPost, ApiPost } from '@/types/blog'

const message = useMessage()
const allPosts = ref<BlogPost[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(12)
const selectedDate = ref<string>()
const selectedTag = ref<string>()
const searchKeyword = ref('')

// 路由同步
useTagRouting(selectedTag)

// 搜索索引
const { invertedIndex, buildIndex } = useBlogSearch()
const { filteredPosts } = usePostFiltering(allPosts, {
  selectedDate,
  selectedTag,
  searchKeyword,
  invertedIndex,
})

// 置顶排序逻辑
const hasActiveFilter = computed(
  () => searchKeyword.value.trim() || selectedDate.value || selectedTag.value,
)

const sortedPosts = computed(() => {
  if (hasActiveFilter.value) {
    return [...filteredPosts.value].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }
  return [...filteredPosts.value].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
    if (a.is_pinned && b.is_pinned) return a.pinned_order - b.pinned_order
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedPosts.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => Math.ceil(sortedPosts.value.length / pageSize.value))
const totalPosts = computed(() => sortedPosts.value.length)

// 事件处理
const showPinBadge = (post: BlogPost) => !hasActiveFilter.value && post.is_pinned
const handleTagClick = (tag: string) => {
  selectedTag.value = tag
  currentPage.value = 1
}
const clearFilters = () => {
  selectedDate.value = selectedTag.value = searchKeyword.value = ''
  currentPage.value = 1
}
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

// 数据加载
onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch('/api/posts/getAllPosts')
    if (!res.ok) throw new Error('API error')

    const apiPosts: ApiPost[] = await res.json()
    allPosts.value = apiPosts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      tags: Array.isArray(p.tags) ? p.tags : [],
      date: p.date || p.published_at?.split('T')[0] || '',
      excerpt: p.excerpt || '',
      views: p.views || 0,
      likes: p.likes || 0,
      thumbnail: p.thumbnail,
      is_pinned: p.is_pinned ?? false,
      pinned_order: p.pinned_order ?? 0,
    }))

    buildIndex(allPosts.value)
  } catch {
    message.error('加载文章失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.blog-layout {
  display: flex;
  gap: 64px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 48px;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  margin-left: 288px;
  margin-top: 24px;
}
@media (max-width: 640px) {
  .blog-layout {
    flex-direction: column;
    padding: 0 16px 32px;
  }
  .main-content {
    margin-left: 0;
    margin-top: 0;
  }
}
</style>
