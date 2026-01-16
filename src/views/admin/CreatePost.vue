<template>
  <n-layout style="padding: 20px">
    <div class="form-container">
      <h2 class="form-title">创建新博客：</h2>

      <n-form ref="formRef" :model="post" label-placement="left" label-width="140px">
        <n-form-item path="thumbnail" label="封面">
          <n-input v-model:value="post.thumbnail" placeholder="Thumbnail URL" />
        </n-form-item>

        <n-form-item path="content" label="内容">
          <MdEditor v-model="post.content" preview-theme="github" style="min-height: 300px" />
        </n-form-item>

        <n-form-item path="excerpt" label="摘要">
          <n-input
            type="textarea"
            v-model:value="post.excerpt"
            placeholder="Short summary for listing pages"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>

        <n-form-item path="status" label="状态">
          <n-select v-model:value="post.status" :options="statusOptions" />
        </n-form-item>

        <!-- 分类选择 -->
        <n-form-item path="category_id" label="分类">
          <n-select
            v-model:value="post.category_id"
            :options="categoryOptions"
            placeholder="Select a category"
            :loading="loadingCategories"
          />
        </n-form-item>

        <n-form-item path="tags" label="标签">
          <n-dynamic-tags v-model:value="post.tags" placeholder="Press Enter to add tags" />
        </n-form-item>

        <n-space justify="end" style="margin-top: 24px">
          <n-button type="primary" @click="submitForm">Submit Post</n-button>
        </n-space>
      </n-form>
    </div>
  </n-layout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { MdEditor } from 'md-editor-v3'
import router from '@/router/index'
import 'md-editor-v3/lib/style.css'
import axios from 'axios'

interface Category {
  id: number
  name: string
}

// 表单数据
const post = reactive({
  slug: '',
  content: '',
  excerpt: '',
  status: 'private',
  category_id: null as number | null, // 改为 number | null
  tags: [] as string[],
  meta_title: '',
  published_at: null,
  meta_description: '',
  thumbnail: '',
})

// 状态选项
const statusOptions = [
  { label: '公开', value: 'published' },
  { label: '私密', value: 'private' },
]

// 分类相关
const categoryOptions = ref<{ label: string; value: number }[]>([])
const loadingCategories = ref(false)

// 获取分类列表
async function fetchCategories() {
  loadingCategories.value = true
  try {
    const response = await axios.get('/api/category/getAll') // 假设返回 [{ id: 1, name: 'Tech' }, ...]
    categoryOptions.value = response.data.map((cat: Category) => ({
      label: cat.name,
      value: cat.id,
    }))
  } catch (error) {
    console.error('Failed to load categories:', error)
    // 可选：显示通知
  } finally {
    loadingCategories.value = false
  }
}

// 提交表单
async function submitForm() {
  try {
    // 如果 category_id 是 null，可以传 null 或忽略（根据后端要求）
    const response = await axios.post('/api/posts/create', post)
    if (response.status === 200) {
      router.push('/blog') // 重定向到文章列表页面
    } else {
      console.log(response.data)
    }
  } catch (error) {
    console.error('There was an error submitting your form!', error)
  }
}

// 组件挂载时加载分类
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: var(--n-text-color);
}
</style>
