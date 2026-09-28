<script setup>
import { ref } from 'vue'
import { showFailToast, showSuccessToast } from 'vant'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function submitLogin() {
  loading.value = true
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value.trim(), password: password.value })
    })
    const result = await response.json()
    if (!response.ok || result.code !== 0) {
      throw new Error(result.message || '登录失败')
    }
    authStore.setLogin(result.data)
    showSuccessToast('登录成功')
    router.replace('/home')
  } catch (error) {
    showFailToast(error.message || '网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}

function showRegisterHint() {
  router.push('/register')
}
</script>

<template>
  <main class="lover-login-page">
    <section class="lover-brand" aria-label="恋人小店">
      <div class="lover-avatar" aria-hidden="true">
        <span>♡</span>
        <i>♡</i>
      </div>
      <h1>恋人小店</h1>
      <p>属于我们两人的专属甜蜜市集</p>
    </section>

    <van-form class="lover-login-form" @submit="submitLogin">
      <label class="field-label" for="login-account">手机号</label>
      <van-field
        id="login-account"
        v-model="username"
        class="lover-field"
        name="username"
        autocomplete="username"
        placeholder="请输入手机号"
        :rules="[{ required: true, message: '请输入手机号' }]"
      />

      <label class="field-label" for="login-password">密码</label>
      <van-field
        id="login-password"
        v-model="password"
        class="lover-field"
        name="password"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        placeholder="请输入密码"
        :rules="[{ required: true, message: '请输入密码' }]"
      >
        <template #right-icon>
          <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" class="password-toggle" @click="showPassword = !showPassword" />
        </template>
      </van-field>

      <van-button class="lover-login-button" block round native-type="submit" :loading="loading">
        登录
      </van-button>
    </van-form>

    <p class="register-tip">
      还没有账号？
      <button type="button" @click="showRegisterHint">立即注册</button>
    </p>
  </main>
</template>
