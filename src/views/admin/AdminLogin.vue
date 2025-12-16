<template>
  <div class="login-container">
    <!-- 可选：添加一个极简 Logo 或标题图标 -->
    <div class="logo-placeholder">
      <img src="/favicon.ico" alt="Logo" class="logo" />
    </div>

    <n-card class="login-card" :bordered="false" size="large">
      <template #header>
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-subtitle">请登录以继续</p>
      </template>

      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        class="login-form"
      >
        <n-form-item path="username" label="用户名">
          <n-input
            v-model:value="formValue.username"
            placeholder="输入用户名或邮箱"
            clearable
            size="large"
          />
        </n-form-item>

        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="formValue.password"
            type="password"
            show-password-on="click"
            placeholder="至少6位字符"
            clearable
            size="large"
          />
        </n-form-item>

        <n-space vertical :size="16" style="width: 100%">
          <n-button
            type="primary"
            block
            size="large"
            :loading="loading"
            @click="handleSubmit"
            class="login-button"
          >
            登录
          </n-button>
          <n-button text @click="handleForgotPassword" class="forgot-link">
            忘记密码？
          </n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
// （你的 script 部分完全保留，无需修改）
import { ref } from 'vue'
import type { FormInst, FormRules } from 'naive-ui'
import { useMessage } from 'naive-ui'
import request from '@/utils/request'

interface LoginForm {
  username: string
  password: string
}

const formRef = ref<FormInst | null>(null)
const loading = ref<boolean>(false)
const message = useMessage()

const formValue = ref<LoginForm>({
  username: '',
  password: ''
})

interface LoginResponse {
  access_token: string
}

const rules: FormRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur',
    validator(rule, value) {
      if (value && value.length < 6) {
        return new Error('密码至少6位')
      }
      return true
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const res = await request.post<LoginResponse>('/login', formValue.value)
    const token = res.data.access_token
    if (token) {
      localStorage.setItem('access_token', token)
      message.success('登录成功')
    } else {
      message.error('登录失败，请检查用户名和密码')
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '登录失败，请检查用户名和密码'
    message.error(errorMessage)
  }
}

const handleForgotPassword = () => {
  message.info('请联系管理员重置密码')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  /* 未来感柔光背景 */
}

.logo-placeholder {
  position: absolute;
  top: 15vh;
  font-size: 28px;
  font-weight: bold;
  color: var(--n-primary-color);
  opacity: 0.8;
}


.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 32px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.12);
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin: 0 0 8px;
  color: var(--n-text-color);
}

.login-subtitle {
  font-size: 14px;
  color: var(--n-text-color-secondary);
  text-align: center;
  margin: 0 0 24px;
}

.login-form :deep(.n-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.n-form-item-label) {
  font-weight: 500;
  color: var(--n-text-color);
}

.login-form :deep(.n-input) {
  transition: all 0.25s ease;
}

.login-form :deep(.n-input:hover),
.login-form :deep(.n-input:focus) {
  border-color: var(--n-primary-color);
  box-shadow: 0 0 0 2px rgba(var(--n-primary-color-rgb), 0.15);
}

.login-button {
  height: 48px;
  font-weight: 500;
  border-radius: 12px;
}

.forgot-link {
  align-self: center;
  font-size: 14px;
  color: var(--n-text-color-secondary);
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--n-primary-color);
}

/* 响应式优化 */
@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }

  .login-title {
    font-size: 22px;
  }
}
</style>
