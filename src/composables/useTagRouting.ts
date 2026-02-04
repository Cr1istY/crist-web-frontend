import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Ref } from 'vue'

export function useTagRouting(selectedTag: Ref<string | undefined>) {
  const route = useRoute()
  const router = useRouter()

  // 初始化：从路由读取tag
  if (route.query.tag) {
    const tag = route.query.tag
    selectedTag.value = Array.isArray(tag)
      ? (tag[0] ?? undefined)
      : (tag ?? undefined)
  }

  // 监听selectedTag变化，同步到路由
  watch(selectedTag, (newTag) => {
    const newQuery = { ...route.query }
    if (newTag) {
      newQuery.tag = newTag
    } else {
      delete newQuery.tag
    }
    router.push({ query: newQuery })
  }, { immediate: false })

  // 监听路由变化（前进/后退）
  watch(() => route.query.tag, (newVal) => {
    if (newVal === selectedTag.value) return
    selectedTag.value = Array.isArray(newVal) ? (newVal[0] ?? undefined) : (newVal || undefined)
  })

  return { route, router }
}
