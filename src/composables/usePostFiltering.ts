import { computed } from 'vue'
import type { BlogPost } from '@/types/blog'
import type { Ref } from 'vue'
import { useBlogSearch } from './useBlogSearch'

export function usePostFiltering(
  allPosts: Ref<BlogPost[]>,
  filters: {
    selectedDate: Ref<string | undefined>
    selectedTag: Ref<string | undefined>
    searchKeyword: Ref<string>
    invertedIndex: Ref<Record<string, number[]>>
  },
) {
  const { selectedDate, selectedTag, searchKeyword} = filters

  // 暴露搜索函数（供外部调用）
  const { search } = useBlogSearch()

  const filteredPosts = computed(() => {
    let candidates = [...allPosts.value]

    // 搜索筛选
    if (searchKeyword.value.trim()) {
      const ids = search(searchKeyword.value)
      const idSet = new Set(ids)
      candidates = candidates.filter((post) => idSet.has(post.id))
    }

    // 日期筛选
    if (selectedDate.value) {
      candidates = candidates.filter((post) => post.date === selectedDate.value)
    }

    // 标签筛选
    if (selectedTag.value) {
      candidates = candidates.filter((post) => post.tags.includes(selectedTag.value!))
    }

    return candidates
  })

  return { filteredPosts }
}
