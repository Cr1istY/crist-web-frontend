<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { TweetComposerProps } from '@/types/tweet';

const props = withDefaults(defineProps<TweetComposerProps>(), {
  placeholder: '有什么新鲜事？',
  submitLabel: '发布',
  maxLength: 280
});

const emit = defineEmits<{
  submit: [content: string];
}>();

const content = ref<string>('');
const isSubmitting = ref<boolean>(false);

const charCount = computed<number>(() => content.value.length);
const isOverLimit = computed<boolean>(() => charCount.value > props.maxLength);
const canSubmit = computed<boolean>(() =>
  content.value.trim().length > 0 &&
  charCount.value <= props.maxLength &&
  !isSubmitting.value
);

const handleSubmit = async (): Promise<void> => {
  if (!canSubmit.value) return;

  isSubmitting.value = true;
  try {
    emit('submit', content.value.trim());
    content.value = '';
  } finally {
    isSubmitting.value = false;
  }
};

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    handleSubmit();
  }
};

watch(content, (newValue: string): void => {
  if (newValue.length > props.maxLength + 10) {
    content.value = newValue.slice(0, props.maxLength);
  }
});
</script>

<template>
  <div class="tweet-composer">
    <div class="composer-header">
      <Avatar
        image="https://i.pravatar.cc/150?img=12"
        size="large"
        shape="circle"
        aria-label="用户头像"
      />
      <div class="composer-input-container">
        <Textarea
          v-model="content"
          :placeholder="placeholder"
          :class="['composer-input', { 'over-limit': isOverLimit }]"
          :maxlength="maxLength + 10"
          rows="3"
          @keydown="handleKeydown"
        />

        <div class="composer-footer">
          <div class="composer-actions">
            <Button
              icon="pi pi-image"
              class="p-button-text p-button-secondary"
              aria-label="添加图片"
            />
            <Button
              icon="pi pi-video"
              class="p-button-text p-button-secondary"
              aria-label="添加视频"
            />
            <Button
              icon="pi pi-chart-bar"
              class="p-button-text p-button-secondary"
              aria-label="添加投票"
            />
          </div>

          <div class="composer-submit">
            <span
              :class="['char-count', {
                'warning': charCount > maxLength * 0.9,
                'error': isOverLimit
              }]"
            >
              {{ charCount }}/{{ maxLength }}
            </span>
            <Button
              :label="submitLabel"
              :disabled="!canSubmit"
              :loading="isSubmitting"
              @click="handleSubmit"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tweet-composer {
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.composer-header {
  display: flex;
  gap: 1rem;
}

.composer-input-container {
  flex: 1;
}

.composer-input {
  width: 100%;
  border: none;
  border-radius: 0;
  font-size: 1.125rem;
  resize: none;
  background: transparent;
}

.composer-input:focus {
  box-shadow: none;
  border-bottom: 2px solid var(--primary-color);
}

.composer-input.over-limit {
  color: var(--red-500);
}

.composer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--surface-border);
}

.composer-actions {
  display: flex;
  gap: 0.5rem;
}

.composer-submit {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.char-count {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.char-count.warning {
  color: var(--orange-500);
}

.char-count.error {
  color: var(--red-500);
}
</style>
