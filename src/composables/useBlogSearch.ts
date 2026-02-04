import type { BlogPost } from '@/types/blog'

export function useBlogSearch() {
  const invertedIndex = ref<Record<string, number[]>>({})

  const buildIndex = (posts: BlogPost[]) => {
    const index: Record<string, number[]> = {}
    posts.forEach(post => {
      const terms = new Set<string>()
      post.title.toLowerCase().split(/\s+/).forEach(t => terms.add(t))
      post.tags.forEach(tag => terms.add(tag.toLowerCase()))

      terms.forEach(term => {
        if (!index[term]) index[term] = []
        if (!index[term].includes(post.id)) index[term].push(post.id)
      })
    })
    invertedIndex.value = index
  }

  const search = (query: string): number[] => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(t => t)
    if (terms.length === 0) return []

    let result = new Set<number>()
    terms.forEach(term => {
      const matches = Object.keys(invertedIndex.value)
        .filter(key => key.includes(term))
        .flatMap(key => invertedIndex.value[key] || [])

      if (result.size === 0) {
        matches.forEach(id => result.add(id))
      } else {
        const temp = new Set(matches.filter(id => result.has(id)))
        result = temp
      }
    })
    return Array.from(result)
  }

  return { invertedIndex, buildIndex, search }
}
