<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import Toast from 'primevue/toast';
import TweetComposer from '@/components/tweet/TweetComposer.vue';
import TweetList from '@/components/tweet/TweetList.vue';
import type { Tweet, User, TweetImage } from '@/types/tweet';

const tweets = ref<Tweet[]>([]);
const isLoading = ref<boolean>(true);
const instance = getCurrentInstance();

const currentUser: User = {
  id: '1',
  username: 'demo_user',
  displayName: '演示用户',
  avatar: 'https://i.pravatar.cc/150?img=12',
  verified: true
};

const showToast = (
  severity: 'success' | 'info' | 'warn' | 'error',
  summary: string,
  detail?: string,
  life: number = 3000
): void => {
  instance?.proxy?.$toast.add({
    severity,
    summary,
    detail,
    life
  });
};

const generateMockTweets = (): Tweet[] => {
  // ... 保持不变
  return [];
};

const loadTweets = (): void => {
  isLoading.value = true;
  setTimeout((): void => {
    tweets.value = generateMockTweets();
    isLoading.value = false;
  }, 1000);
};

// ✅ 更新：处理提交时接收图片
const handleTweetSubmit = async (content: string, images: TweetImage[]): Promise<void> => {
  // 提取图片 URL（实际项目中应该是上传后的 URL）
  const imageUrls: string[] = images.map((img) => img.url);

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
    images: imageUrls.length > 0 ? imageUrls : undefined
  };

  tweets.value.unshift(newTweet);

  const imageCount = images.length;
  showToast(
    'success',
    '发布成功',
    imageCount > 0 ? `已发布推文和 ${imageCount} 张图片` : '您的推文已成功发布'
  );
};

const handleLike = (tweetId: string): void => {
  const tweet: Tweet | undefined = tweets.value.find((t: Tweet) => t.id === tweetId);
  if (tweet) {
    tweet.liked = !tweet.liked;
    tweet.likes += tweet.liked ? 1 : -1;
  }
};

const handleRetweet = (tweetId: string): void => {
  const tweet: Tweet | undefined = tweets.value.find((t: Tweet) => t.id === tweetId);
  if (tweet) {
    tweet.retweeted = !tweet.retweeted;
    tweet.retweets += tweet.retweeted ? 1 : -1;
    showToast(tweet.retweeted ? 'success' : 'info', tweet.retweeted ? '已转发' : '已取消转发');
  }
};

const handleReply = (tweetId: string): void => {
  showToast('info', '回复功能', '回复功能开发中...');
  console.log(`Reply to tweet: ${tweetId}`);
};

onMounted((): void => {
  loadTweets();
});
</script>

<template>
  <div class="app-container">
    <Toast />

    <header class="app-header">
      <div class="header-content">
        <i class="pi pi-crown logo"></i>
        <h1>Threads</h1>
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
  color: var(--p-orange-600);
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
