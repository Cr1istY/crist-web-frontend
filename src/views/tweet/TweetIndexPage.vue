<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import TweetComposer from '@/components/tweet/TweetComposer.vue'
import TweetList from '@/components/tweet/TweetList.vue'
import type { Tweet, User } from '@/types/tweet'

const toast = useToast()
const tweets = ref<Tweet[]>([])
const isLoading = ref<boolean>(true)

const currentUser: User = {
  id: '1',
  username: 'demo_user',
  displayName: '演示用户',
  avatar: 'https://i.pravatar.cc/150?img=12',
  verified: true,
}

const generateMockTweets = (): Tweet[] => {
  const mockUsers: User[] = [
    {
      id: '2',
      username: 'vue_master',
      displayName: 'Vue大师',
      avatar: 'https://i.pravatar.cc/150?img=1',
      verified: true,
    },
    {
      id: '3',
      username: 'ts_lover',
      displayName: 'TS爱好者',
      avatar: 'https://i.pravatar.cc/150?img=2',
      verified: false,
    },
    {
      id: '4',
      username: 'prime_fan',
      displayName: 'PrimeVue粉丝',
      avatar: 'https://i.pravatar.cc/150?img=3',
      verified: true,
    },
  ]

  const mockContents: string[] = [
    'Vue 3 + TypeScript + PrimeVue 真是太棒了！🚀',
    '今天学习了Composition API，代码复用变得如此简单！',
    'PrimeVue的组件设计真的很优雅，开发效率提升了不少～',
    'TypeScript的类型系统让bug无处遁形！💪',
    '刚刚完成了一个新项目，感觉收获满满！',
  ]

  return mockContents.map(
    (content, index): Tweet => ({
      id: `tweet-${index + 1}`,
      user: mockUsers[index % mockUsers.length]!,
      content,
      timestamp: new Date(Date.now() - index * 3600000),
      likes: Math.floor(Math.random() * 1000),
      retweets: Math.floor(Math.random() * 500),
      replies: Math.floor(Math.random() * 100),
      liked: false,
      retweeted: false,
    }),
  )
}

const loadTweets = (): void => {
  isLoading.value = true
  setTimeout((): void => {
    tweets.value = generateMockTweets()
    isLoading.value = false
  }, 1000)
}

const handleTweetSubmit = (content: string): void => {
  const newTweet: Tweet = {
    id: `tweet-${Date.now()}`,
    user: currentUser,
    content,
    timestamp: new Date(),
    likes: 0,
    retweets: 0,
    replies: 0,
    liked: false,
    retweeted: false,
  }

  tweets.value.unshift(newTweet)

  toast.add({
    severity: 'success',
    summary: '发布成功',
    detail: '您的推文已成功发布',
    life: 3000,
  })
}

const handleLike = (tweetId: string): void => {
  const tweet: Tweet | undefined = tweets.value.find((t: Tweet) => t.id === tweetId)
  if (tweet) {
    tweet.liked = !tweet.liked
    tweet.likes += tweet.liked ? 1 : -1
  }
}

const handleRetweet = (tweetId: string): void => {
  const tweet: Tweet | undefined = tweets.value.find((t: Tweet) => t.id === tweetId)
  if (tweet) {
    tweet.retweeted = !tweet.retweeted
    tweet.retweets += tweet.retweeted ? 1 : -1

    toast.add({
      severity: tweet.retweeted ? 'success' : 'info',
      summary: tweet.retweeted ? '已转发' : '已取消转发',
      life: 2000,
    })
  }
}

const handleReply = (tweetId: string): void => {
  toast.add({
    severity: 'info',
    summary: '回复功能',
    detail: '回复功能开发中...',
    life: 2000,
  })
  console.log(`回复推文 ${tweetId}`)
}

onMounted((): void => {
  loadTweets()
})
</script>

<template>
  <div class="app-container">
    <Toast />

    <header class="app-header">
      <div class="header-content">
        <i class="pi pi-twitter logo"></i>
        <h1>推文</h1>
      </div>
    </header>

    <main class="main-content">
      <div class="feed-container">
        <TweetComposer @submit="handleTweetSubmit" />

        <TweetList
          :tweets="tweets"
          :loading="isLoading"
          @like="handleLike"
          @retweet="handleRetweet"
          @reply="handleReply"
        />
      </div>

      <aside class="sidebar">
        <div class="sidebar-card">
          <h3>趋势</h3>
          <div class="trend-item">
            <span class="trend-category">科技 · 热门</span>
            <span class="trend-title">#Vue3</span>
            <span class="trend-count">12.5K 推文</span>
          </div>
          <div class="trend-item">
            <span class="trend-category">编程 · 热门</span>
            <span class="trend-title">#TypeScript</span>
            <span class="trend-count">8.3K 推文</span>
          </div>
          <div class="trend-item">
            <span class="trend-category">前端 · 热门</span>
            <span class="trend-title">#PrimeVue</span>
            <span class="trend-count">5.1K 推文</span>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style>
/* 全局样式 */
:root {
  --primary-color: #1d9bf0;
  --surface-border: #eff3f4;
  --surface-hover: #f7f9f9;
  --text-color: #0f1419;
  --text-color-secondary: #536471;
  --red-500: #f91880;
  --green-500: #00ba7c;
  --blue-500: #1d9bf0;
  --orange-500: #f7931a;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #ffffff;
  color: var(--text-color);
}
</style>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.app-header {
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--surface-border);
  z-index: 100;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  font-size: 2rem;
  color: var(--primary-color);
}

.header-content h1 {
  font-size: 1.25rem;
  font-weight: 700;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.feed-container {
  background-color: #ffffff;
  border-radius: 1rem;
  border: 1px solid var(--surface-border);
}

.sidebar {
  position: sticky;
  top: 5rem;
  height: fit-content;
}

.sidebar-card {
  background-color: var(--surface-hover);
  border-radius: 1rem;
  padding: 1rem;
}

.sidebar-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.trend-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 0;
  cursor: pointer;
  border-bottom: 1px solid var(--surface-border);
}

.trend-item:last-child {
  border-bottom: none;
}

.trend-category {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.trend-title {
  font-weight: 700;
  color: var(--text-color);
}

.trend-count {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }
}
</style>
