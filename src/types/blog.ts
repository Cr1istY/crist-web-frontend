interface BlogPost {
  id: number
  slug: string
  title: string
  category: string
  tags: string[]
  date: string
  excerpt: string
  views: number
  likes: number
  thumbnail?: string
  is_pinned: boolean
  pinned_order: number
}

interface ApiPost {
  id: number
  slug: string
  title: string
  category: string
  tags: string[]
  date?: string
  published_at?: string
  excerpt?: string
  views?: number
  likes?: number
  thumbnail?: string
  is_pinned?: boolean
  pinned_order?: number
}

export type {BlogPost, ApiPost}
