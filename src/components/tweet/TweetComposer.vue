<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import Avatar from 'primevue/avatar'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import type { TweetComposerProps, UploadedImage, TweetImage } from '@/types/tweet'
import { uploadImage } from '@/services/upload'
import service from '@/utils/request'

const props = withDefaults(defineProps<TweetComposerProps>(), {
  placeholder: '有什么新鲜事？',
  submitLabel: '发布',
  maxLength: 280,
  maxImages: 4,
  allowedImageTypes: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxImageSize: 5,
})

const emit = defineEmits<{
  submit: [content: string, images: TweetImage[]]
}>()

const content = ref<string>('')
const isSubmitting = ref<boolean>(false)
const images = ref<UploadedImage[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

const charCount = computed<number>(() => content.value.length)
const isOverLimit = computed<boolean>(() => charCount.value > props.maxLength)
const canSubmit = computed<boolean>(
  () =>
    content.value.trim().length > 0 &&
    charCount.value <= props.maxLength &&
    !isSubmitting.value &&
    images.value.every((img) => !img.uploading && !img.error),
)

const canAddMoreImages = computed<boolean>(() => images.value.length < props.maxImages)

const generateId = (): string => `img-${Date.now()}-${Math.random().toString(36).slice(2)}`

const validateImage = (file: File): string | null => {
  if (!props.allowedImageTypes.includes(file.type)) {
    return '不支持的图片格式'
  }

  const maxSizeBytes = props.maxImageSize * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return `图片大小不能超过 ${props.maxImageSize}MB`
  }

  return null
}

const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file)
}

const handleFileSelect = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  const remainingSlots = props.maxImages - images.value.length
  const filesToProcess = Array.from(files).slice(0, remainingSlots)

  filesToProcess.forEach((file: File) => {
    const error = validateImage(file)

    const uploadedImage: UploadedImage = {
      id: generateId(),
      file,
      previewUrl: createPreviewUrl(file),
      uploading: false,
      progress: 0,
      error: error || undefined,
    }

    images.value.push(uploadedImage)
  })

  target.value = ''
}

const triggerFileSelect = (): void => {
  fileInputRef.value?.click()
}

const removeImage = (imageId: string): void => {
  const image = images.value.find((img) => img.id === imageId)
  if (image) {
    URL.revokeObjectURL(image.previewUrl)
  }
  images.value = images.value.filter((img) => img.id !== imageId)
}

// 真实上传逻辑
const uploadImageToServer = async (image: UploadedImage): Promise<void> => {
  image.uploading = true
  image.progress = 0

  try {
    const response = await uploadImage(image.file, {
      onProgress: (progress) => {
        image.progress = progress.percentage
      },
    })

    image.uploading = false
    image.progress = 100
    image.id = response.id // 保存服务器返回的 ID
    image.uploadedUrl = response.url // 保存服务器返回的 URL
  } catch (error) {
    image.uploading = false
    image.error = '上传失败，请重试'
    console.error('上传错误:', error)
  }
}

const uploadAllImages = async (): Promise<boolean> => {
  const pendingImages = images.value.filter((img) => !img.uploading && !img.error)

  if (pendingImages.length === 0) return true

  const uploadPromises = pendingImages.map((img) => uploadImageToServer(img))
  await Promise.all(uploadPromises)

  return images.value.every((img) => !img.error)
}

const handleSubmit = async (): Promise<void> => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  try {
    const uploadSuccess = await uploadAllImages()
    if (!uploadSuccess) {
      return
    }
    // ✅ 转换为 TweetImage 格式
    const tweetImages: TweetImage[] = images.value.map((img) => ({
      id: img.id,
      url: img.uploadedUrl || img.previewUrl,
    }))

    const imageIds = tweetImages.map(img => img.id)
    const tweet = {
      content: content.value.trim(),
      image_ids: imageIds,
    }
    console.log('提交内容:', tweet)
    const response = await service.post('/tweet/create', tweet)
    console.log('提交成功:', response)

    emit('submit', content.value.trim(), tweetImages)

    // 清理资源
    images.value.forEach((img) => {
      URL.revokeObjectURL(img.previewUrl)
    })

    content.value = ''
    images.value = []
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    handleSubmit()
  }
}

watch(content, (newValue: string): void => {
  if (newValue.length > props.maxLength + 10) {
    content.value = newValue.slice(0, props.maxLength)
  }
})

onBeforeUnmount((): void => {
  images.value.forEach((img) => {
    URL.revokeObjectURL(img.previewUrl)
  })
})
</script>

<template>
  <div class="tweet-composer">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden-input"
      @change="handleFileSelect"
    />

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

        <div v-if="images.length > 0" class="image-preview-container">
          <div
            v-for="image in images"
            :key="image.id"
            :class="['image-preview-item', { 'has-error': image.error }]"
          >
            <div class="image-wrapper">
              <img :src="image.previewUrl" alt="预览图片" class="preview-image" />

              <div v-if="image.uploading" class="upload-progress-overlay">
                <ProgressBar
                  :value="image.progress"
                  :show-value="true"
                  class="image-progress-bar"
                />
                <span class="progress-text">{{ image.progress }}%</span>
              </div>

              <div v-if="image.error" class="image-error-overlay">
                <i class="pi pi-exclamation-circle"></i>
                <span>{{ image.error }}</span>
              </div>

              <button
                type="button"
                class="remove-image-btn"
                @click="removeImage(image.id)"
                aria-label="删除图片"
                :disabled="image.uploading"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="composer-footer">
          <div class="composer-actions">
            <Button
              type="button"
              icon="pi pi-image"
              class="p-button-text p-button-secondary"
              :disabled="!canAddMoreImages"
              :aria-label="`添加图片（还可添加${maxImages - images.length}张）`"
              @click="triggerFileSelect"
            />
          </div>
          <div class="composer-submit">
            <span
              :class="[
                'char-count',
                {
                  warning: charCount > maxLength * 0.9,
                  error: isOverLimit,
                },
              ]"
            >
              {{ charCount }}/{{ maxLength }}
            </span>
            <Button
              :class="['submit-button-container', { success: false }]"
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

/* 隐藏文件输入 */
.hidden-input {
  display: none;
}

/* 图片预览容器 */
.image-preview-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: var(--surface-hover);
  border-radius: 0.5rem;
}

.submit-button-container {
  position: relative;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
  border-radius: 9999px;
  padding: 0.625rem 1.5rem;
  min-width: 5.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  color: white;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 15px rgba(56, 239, 125, 0.4),
    0 0 0 0 rgba(56, 239, 125, 0.4);
}

/* 悬停效果 */
.submit-button-container:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 20px rgba(56, 239, 125, 0.5),
    0 0 0 4px rgba(56, 239, 125, 0.1);
  background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%);
}

/* 点击效果 */
.submit-button-container:not(:disabled):active {
  transform: translateY(0);
  box-shadow:
    0 2px 10px rgba(102, 126, 234, 0.3),
    0 0 0 0 rgba(102, 126, 234, 0.1);
}

/* 禁用状态 */
.submit-button-container:disabled {
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.6;
}

/* 光泽效果 */
.submit-button-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.submit-button-container:not(:disabled):hover::before {
  left: 100%;
}

/* 脉冲动画（可提交时） */
.submit-button-container:not(:disabled):not(.p-disabled)::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
  animation: pulse 2s infinite;
  opacity: 0;
}

.submit-button-container:not(:disabled):hover::after {
  opacity: 0.5;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.05);
    opacity: 0;
  }
}

/* 加载状态覆盖 */
.submit-button-container.p-button-loading {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.submit-button-container.p-button-loading .p-button-label {
  opacity: 0;
}

/* 加载动画 */
.submit-button-container.p-button-loading::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
  background: transparent;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 成功状态（可选） */
.submit-button-container.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

/* 焦点状态 - 无障碍访问 */
.submit-button-container:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.image-preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
}

.image-preview-item.has-error {
  opacity: 0.7;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 上传进度覆盖层 */
.upload-progress-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.image-progress-bar {
  width: 80%;
  height: 0.5rem;
}

/* 错误覆盖层 */
.image-error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.image-error-overlay i {
  font-size: 1.5rem;
}

/* 删除按钮 */
.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background: rgba(239, 68, 68, 0.9);
}

.composer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
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

/* 响应式 */
@media (max-width: 640px) {
  .image-preview-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
