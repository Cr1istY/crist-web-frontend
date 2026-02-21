<script setup lang="ts">
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import type { TweetListProps } from '@/types/tweet';

const props = withDefaults(defineProps<TweetListProps>(), {
  loading: false,
  tweets: () => []
});

const emit = defineEmits<{
  like: [tweetId: string];
  retweet: [tweetId: string];
  reply: [tweetId: string];
}>();

const formatTimestamp = (date: Date): string => {
  const now: Date = new Date();
  const diff: number = now.getTime() - new Date(date).getTime();
  const minutes: number = Math.floor(diff / 60000);
  const hours: number = Math.floor(diff / 3600000);
  const days: number = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const handleLike = (tweetId: string): void => {
  emit('like', tweetId);
};

const handleRetweet = (tweetId: string): void => {
  emit('retweet', tweetId);
};

const handleReply = (tweetId: string): void => {
  emit('reply', tweetId);
};
</script>

<template>
  <div class="tweet-list">
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <span>加载中...</span>
    </div>

    <div v-else-if="tweets.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <span>暂无推文</span>
    </div>

    <Card
      v-for="tweet in tweets"
      :key="tweet.id"
      class="tweet-card"
    >
      <template #header>
        <div class="tweet-header">
          <Avatar
            :image="tweet.user.avatar"
            shape="circle"
            size="large"
            :aria-label="`${tweet.user.displayName}的头像`"
          />
          <div class="tweet-user-info">
            <div class="user-name-row">
              <span class="display-name">{{ tweet.user.displayName }}</span>
              <i
                v-if="tweet.user.verified"
                class="pi pi-check-circle verified-badge"
                aria-label="已认证"
              ></i>
            </div>
            <span class="username">@{{ tweet.user.username }}</span>
          </div>
          <div class="tweet-timestamp">
            {{ formatTimestamp(tweet.timestamp) }}
          </div>
        </div>
      </template>

      <template #content>
        <p class="tweet-content">{{ tweet.content }}</p>

        <div v-if="tweet.images && tweet.images.length > 0" class="tweet-images">
          <img
            v-for="(image, index) in tweet.images"
            :key="index"
            :src="image"
            :alt="`推文图片${index + 1}`"
            class="tweet-image"
          />
        </div>

        <Divider />

        <div class="tweet-actions">
          <Button
            icon="pi pi-comment"
            class="p-button-text p-button-secondary"
            :label="formatNumber(tweet.replies)"
            @click="handleReply(tweet.id)"
            aria-label="回复"
          />
          <Button
            icon="pi pi-refresh"
            class="p-button-text"
            :class="{ 'p-button-success': tweet.retweeted }"
            :label="formatNumber(tweet.retweets)"
            @click="handleRetweet(tweet.id)"
            aria-label="转发"
          />
          <Button
            icon="pi pi-heart"
            class="p-button-text"
            :class="{ 'p-button-danger': tweet.liked }"
            :label="formatNumber(tweet.likes)"
            @click="handleLike(tweet.id)"
            aria-label="点赞"
          />
          <Button
            icon="pi pi-share-alt"
            class="p-button-text p-button-secondary"
            aria-label="分享"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.tweet-list {
  display: flex;
  flex-direction: column;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-color-secondary);
  gap: 1rem;
}

.loading-state i,
.empty-state i {
  font-size: 3rem;
}

.tweet-card {
  border: none;
  border-radius: 0;
  border-bottom: 1px solid var(--surface-border);
  box-shadow: none;
}

.tweet-card:hover {
  background-color: var(--surface-hover);
}

.tweet-header {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
}

.tweet-user-info {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.display-name {
  font-weight: 700;
  color: var(--text-color);
}

.verified-badge {
  color: var(--blue-500);
  font-size: 1rem;
}

.username {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.tweet-timestamp {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.tweet-content {
  padding: 0 1rem 1rem;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-color);
}

.tweet-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem;
  padding: 0 1rem 1rem;
}

.tweet-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
  cursor: pointer;
}

.tweet-actions {
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 1rem 1rem;
}

.tweet-actions .p-button {
  color: var(--text-color-secondary);
}

.tweet-actions .p-button:hover {
  background-color: transparent;
}

.tweet-actions .p-button.p-button-danger {
  color: var(--red-500);
}

.tweet-actions .p-button.p-button-success {
  color: var(--green-500);
}
</style>
