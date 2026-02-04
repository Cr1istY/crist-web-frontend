<template>
  <aside class="sidebar">
    <n-h3 class="sidebar-title">📝 所有文章</n-h3>
    <n-text type="secondary">共 {{ totalPosts }} 篇文章 · 按发布时间倒序排列</n-text>

    <div class="search-box">
      <n-input
        v-model:value="localSearch"
        placeholder="find the thoughts..."
        clearable
        size="small"
        @update:value="debouncedSearch"
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
      />
      <div v-if="showSuggestions && suggestions.length" class="search-suggestions">
        <div
          v-for="(s, i) in suggestions"
          :key="i"
          class="suggestion-item"
          @click="selectSuggestion(s)"
        >
          {{ s }}
        </div>
      </div>
    </div>

    <div class="calendar-heatmap">
      <n-h3 class="sidebar-title">📆 发文日历</n-h3>
      <HeatmapCalendar
        :posts="posts"
        :selected-date="modelDate"
        @date-click="$emit('update:date', $event === modelDate ? undefined : $event)"
      />
    </div>

    <div class="tag-cloud">
      <n-h3 class="sidebar-title">🔖 所有标签</n-h3>
      <n-space wrap>
        <n-tag
          v-for="tag in topTags"
          :key="tag.name"
          size="small"
          round
          :bordered="true"
          :color="getTagColor(tag.name)"
          style="cursor: pointer"
          @click="$emit('update:tag', tag.name === modelTag ? undefined : tag.name)"
        >
          {{ tag.name }} ({{ tag.count }})
        </n-tag>
      </n-space>
    </div>

    <div class="footer-links">
      <n-h3 class="sidebar-title">😊 更多信息</n-h3>
      <n-space vertical>
        <n-button text @click="$router.push('/')">🏠 foreveryang</n-button>
        <n-button text href="https://github.com/Cr1istY/foreveryangDot-frontend" target="_blank">💻 source code</n-button>
        <n-button text href="https://beian.miit.gov.cn/" target="_blank">渝ICP备2025056615号</n-button>
      </n-space>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import HeatmapCalendar from '../HeatmapCalendarComponent.vue'
import type { BlogPost } from '@/types/blog'

const props = defineProps<{
  posts: BlogPost[]
  totalPosts: number
  modelValue?: string // 兼容旧API
  date?: string
  tag?: string
  search?: string
}>()

const emit = defineEmits<{
  'update:date': [date?: string]
  'update:tag': [tag?: string]
  'update:search': [keyword: string]
  'clear-filters': []
}>()

// 双向绑定代理
const modelDate = computed({
  get: () => props.date ?? '',
  set: (val) => emit('update:date', val || undefined)
})
const modelTag = computed({
  get: () => props.tag ?? '',
  set: (val) => emit('update:tag', val || undefined)
})
const localSearch = ref(props.search || '')
const showSuggestions = ref(false)
const suggestions = ref<string[]>([])

// 搜索建议
const getAllKeywords = () => {
  const set = new Set<string>()
  props.posts.forEach(p => {
    set.add(p.title)
    p.tags.forEach(t => set.add(t))
  })
  return Array.from(set)
}

const computeSuggestions = (query: string) => {
  if (!query.trim()) return suggestions.value = []
  const lower = query.toLowerCase()
  suggestions.value = getAllKeywords()
    .filter(kw => kw.toLowerCase().includes(lower))
    .slice(0, 5)
}

type DebounceFunction<T extends unknown[]> = (...args: T) => void

const debounce = <T extends unknown[]>(fn: DebounceFunction<T>, delay: number): DebounceFunction<T> => {
  let timer: number | null = null
  return (...args: T) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const debouncedSearch = debounce((val: string) => {
  emit('update:search', val)
  computeSuggestions(val)
}, 250)

const hideSuggestions = () => setTimeout(() => { showSuggestions.value = false }, 200)
const selectSuggestion = (text: string) => {
  localSearch.value = text
  emit('update:search', text)
  showSuggestions.value = false
}

// 标签统计
const topTags = computed(() => {
  const map = new Map<string, number>()
  props.posts.forEach(p => p.tags.forEach(t => map.set(t, (map.get(t) || 0) + 1)))
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
})

const getTagColor = (tag: string) =>
  modelTag.value === tag
    ? { color: '#e6f7ff', textColor: '#1890ff' }
    : { color: '#f0f9ff', textColor: '#007bff' }

// 监听外部变化
watch(() => props.search, (val) => { localSearch.value = val || '' })
</script>

<style scoped>
.sidebar { width: 250px; position: fixed; top: 24px; height: calc(100vh - 88px); overflow-y: auto; padding-right: 16px }
.sidebar-title { font-size: 16px; font-weight: 600; margin: 18px 0 12px; color: #333 }
.search-box { position: relative; margin: 16px 0 }
.search-suggestions { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #d1d5db; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; margin-top: 4px; z-index: 1000 }
.suggestion-item { padding: 8px 12px; cursor: pointer; font-size: 14px; color: #374151 }
.suggestion-item:hover { background-color: #f9fafb }
.tag-cloud, .footer-links { margin-top: 24px }
@media (max-width: 640px) {
  .sidebar { width: 100%; position: static; height: auto; margin-bottom: 24px }
}
</style>
