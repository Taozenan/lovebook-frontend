<script setup>
import { ref } from 'vue'
import { showFailToast, showSuccessToast } from 'vant'
import { useRouter } from 'vue-router'

const router = useRouter()
const phone = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function register() {
  if (password.value !== confirmPassword.value) {
    showFailToast('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.value.trim(), nickname: nickname.value.trim(), password: password.value })
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || result.code !== 0) {
      throw new Error(result.message || '注册失败')
    }
    showSuccessToast('注册成功，请登录')
    router.replace('/login')
  } catch (error) {
    showFailToast(error.message || '网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="lover-login-page register-page">
    <van-nav-bar title="注册恋人小店" left-arrow @click-left="router.back()" />
    <section class="lover-brand register-brand">
      <div class="lover-avatar" aria-hidden="true"><span>♡</span><i>♡</i></div>
      <h1>创建账号</h1>
      <p>和 TA 一起开启专属甜蜜市集</p>
    </section>
    <van-form class="lover-login-form" @submit="register">
      <label class="field-label" for="register-phone">手机号</label>
      <van-field id="register-phone" v-model="phone" class="lover-field" name="phone" type="tel" placeholder="请输入手机号" :rules="[{ required: true, message: '请输入手机号' }]" />
      <label class="field-label" for="register-nickname">昵称</label>
      <van-field id="register-nickname" v-model="nickname" class="lover-field" name="nickname" placeholder="请输入昵称" :rules="[{ required: true, message: '请输入昵称' }]" />
      <label class="field-label" for="register-password">设置密码</label>
      <van-field id="register-password" v-model="password" class="lover-field" name="password" :type="showPassword ? 'text' : 'password'" placeholder="请输入 6 至 64 位密码" :rules="[{ required: true, message: '请输入密码' }]">
        <template #right-icon><van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" class="password-toggle" @click="showPassword = !showPassword" /></template>
      </van-field>
      <label class="field-label" for="register-password-confirm">确认密码</label>
      <van-field id="register-password-confirm" v-model="confirmPassword" class="lover-field" name="confirmPassword" :type="showPassword ? 'text' : 'password'" placeholder="请再次输入密码" :rules="[{ required: true, message: '请再次输入密码' }]" />
      <van-button class="lover-login-button" block round native-type="submit" :loading="loading">立即注册</van-button>
    </van-form>
    <p class="register-tip">已有账号？<button type="button" @click="router.replace('/login')">去登录</button></p>
  </main>
</template>
