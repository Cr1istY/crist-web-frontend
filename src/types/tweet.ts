export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  verified: boolean
}

export interface Tweet {
  id: string
  user: User
  content: string
  timestamp: Date
  likes: number
  retweets: number
  replies: number
  liked: boolean
  retweeted: boolean
  images?: string[]
}

export interface TweetComposerProps {
  placeholder?: string
  submitLabel?: string
  maxLength?: number
}

export interface TweetListProps {
  tweets: Tweet[]
  loading?: boolean
}

export interface TweetEmits {
  (event: 'submit', content: string): void
  (event: 'like', tweetId: string): void
  (event: 'retweet', tweetId: string): void
  (event: 'reply', tweetId: string): void
}
