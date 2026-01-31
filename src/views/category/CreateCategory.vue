<template>
  <n-layout style="padding: 20px">
    <div class="form-container">
      <h2 class="form-title">创建新分类：</h2>

      <n-form ref="formRef" :model="category" label-placement="left" label-width="140px">
        <n-form-item
          path="name"
          label="分类名称"
          required
          :rule="[{ required: true, message: '请输入分类名称', trigger: 'blur' }]"
        >
          <n-input v-model:value="category.name" placeholder="请输入分类名称" maxlength="50" />
        </n-form-item>

        <n-form-item path="description" label="描述">
          <n-input
            type="textarea"
            v-model:value="category.description"
            placeholder="分类的简要描述（可选）"
            :autosize="{ minRows: 2, maxRows: 4 }"
            maxlength="200"
          />
        </n-form-item>

        <!-- 父分类选择 -->
        <n-form-item path="parent_id" label="父分类">
          <n-select
            v-model:value="category.parent_id"
            :options="categoryOptions"
            placeholder="选择父分类（留空则为顶级分类）"
            :loading="loadingCategories"
            clearable
            filterable
          >
            <template #placeholder>
              <span style="color: var(--n-text-color-2)">选择父分类（留空则为顶级分类）</span>
            </template>
          </n-select>
        </n-form-item>

        <n-space justify="end" style="margin-top: 24px">
          <n-button @click="router.push('/categories')">取消</n-button>
          <n-button type="primary" @click="submitForm" :loading="submitting">
            {{ submitting ? '创建中...' : '创建分类' }}
          </n-button>
        </n-space>
      </n-form>
    </div>
  </n-layout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import router from '@/router/index'
import axios from 'axios'

interface Category {
  id: string
  name: string
  parent_id?: string | null
}

// 表单数据
const category = reactive({
  name: '',
  description: '',
  parent_id: null as string | null,
})

// 构建分类树相关
const UUID_NIL = '00000000-0000-0000-0000-000000000000'


// 分类相关
const categoryOptions = ref<{ label: string; value: string }[]>([])
const loadingCategories = ref(false)
const submitting = ref(false)
const message = useMessage()

// 获取分类列表（用于父分类选择）
async function fetchCategories() {
  loadingCategories.value = true
  try {
    const response = await axios.get('/api/category/getAll', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })

    const buildTreeOptions = (categories: Category[], parentId: string | null = null, depth = 0): { label: string; value: string }[] => {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .flatMap(cat => {
          const indent = '　'.repeat(depth) // 使用全角空格实现缩进
          const currentOption = [{
            label: depth > 0 ? `${indent}└─ ${cat.name}` : cat.name,
            value: cat.id
          }]
          const children = buildTreeOptions(categories, cat.id, depth + 1)
          return [...currentOption, ...children]
        })
    }
    response.data.forEach((cat: Category) => {
      if (cat.parent_id === UUID_NIL) {
        cat.parent_id = null
      }
    })
    categoryOptions.value = buildTreeOptions(response.data)

  } catch (error) {
    console.error('Failed to load categories:', error)
    message.error('加载分类列表失败')
  } finally {
    loadingCategories.value = false
  }
}

// 提交表单
async function submitForm() {
  if (!category.name.trim()) {
    message.warning('请输入分类名称')
    return
  }

  submitting.value = true
  try {
    // 构建请求数据：仅包含非空字段，避免发送 null 的 parent_id
    const requestData: Record<string, string> = {
      name: category.name.trim(),
    }

    if (category.description.trim()) {
      requestData.description = category.description.trim()
    }

    // 仅当选择了父分类时才添加 parent_id
    if (category.parent_id) {
      requestData.parent_id = category.parent_id
    }

    const response = await axios.post('/api/category/create', requestData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 200) {
      message.success(response.data.message || '分类创建成功')
      router.push('/categories')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || '创建分类失败，请重试'
    console.error('Category creation error:', error)
    message.error(errorMsg)
  } finally {
    submitting.value = false
  }
}

// 组件挂载时加载分类
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.form-container {
  max-width: 700px;
  margin: 0 auto;
  background: var(--n-color-bg);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.form-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: var(--n-text-color);
  border-bottom: 1px solid var(--n-border-color);
  padding-bottom: 12px;
}

:deep(.n-form-item) {
  margin-bottom: 18px;
}

:deep(.n-input__placeholder) {
  color: var(--n-text-color-3);
}
</style>
