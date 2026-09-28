<script setup>
import { onMounted, ref } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const invitationCount = ref(0)
const balance = ref(0)

async function loadBindingNotice() {
  if (!authStore.token) return
  try {
    const response = await fetch('/api/auth/bindings/status', { headers: { Authorization: `Bearer ${authStore.token}` } })
    const result = await response.json()
    if (response.ok && result.code === 0) invitationCount.value = result.data.received?.length || 0
  } catch { invitationCount.value = 0 }
}

async function loadBalance() {
  if (!authStore.token) return
  try {
    const response = await fetch('/api/shop/orders/account', { headers: { Authorization: 'Bearer ' + authStore.token } })
    const result = await response.json()
    if (response.ok && result.code === 0) balance.value = Number(result.data?.balance || 0)
  } catch { balance.value = 0 }
}

async function uploadAvatar(fileItem) {
  const formData = new FormData()
  formData.append('file', fileItem.file)
  try {
    const uploadResponse = await fetch('/api/shop/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + authStore.token }, body: formData })
    const uploadResult = await uploadResponse.json()
    if (!uploadResponse.ok || uploadResult.code !== 0) throw new Error(uploadResult.message || '头像上传失败')
    const avatarUrl = uploadResult.data.url
    const saveResponse = await fetch('/api/auth/profile/avatar', { method: 'PUT', headers: { Authorization: 'Bearer ' + authStore.token, 'Content-Type': 'application/json' }, body: JSON.stringify({ avatarUrl }) })
    const saveResult = await saveResponse.json()
    if (!saveResponse.ok || saveResult.code !== 0) throw new Error(saveResult.message || '头像保存失败')
    authStore.$patch({ avatarUrl })
    localStorage.setItem('tzn-auth', JSON.stringify({ ...authStore.$state }))
    showToast('头像更新成功')
  } catch (error) { showToast(error.message || '头像更新失败') }
}

async function logout() {
  try {
    await showConfirmDialog({ title: '确认退出登录？', message: '退出后需要重新登录', confirmButtonText: '确认退出', cancelButtonText: '取消', confirmButtonColor: '#ff3d3d' })
    authStore.logout()
    router.replace('/login')
  } catch { }
}

function openBinding() { router.push('/binding') }
onMounted(() => { loadBindingNotice(); loadBalance() })
</script>

<template>
  <main class="lover-home-page">
    <van-nav-bar title="恋人小店" />
    <section class="lover-profile-card">
      <van-uploader :after-read="uploadAvatar" :max-count="1" accept="image/*"><div class="profile-avatar"><img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" alt="头像" /><span v-else>♡</span></div></van-uploader>
      <div><strong>{{ authStore.nickname || authStore.username }}</strong><p>{{ (authStore.roles || []).join('、') || '恋人小店用户' }}</p></div>
    </section>
    <van-cell-group inset title="我的">
      <van-cell title="账号" :value="authStore.username" />
      <van-cell title="绑定对象" is-link @click="openBinding"><template #value><span class="binding-entry"><span class="binding-entry-value">{{ invitationCount ? '收到绑定邀请' : '管理绑定关系' }}</span><span v-if="invitationCount" class="binding-invite-badge">{{ invitationCount > 99 ? '99+' : invitationCount }}</span></span></template></van-cell>
      <van-cell title="余额" :value="`¥ ${balance.toFixed(2)}`" is-link />
      <van-cell title="上架管理" is-link @click="router.push('/shop/manage')" />
    </van-cell-group>
    <div class="logout-action"><van-button block round plain @click="logout">退出登录</van-button></div>
    <nav class="shop-tabbar"><button type="button" @click="router.push('/home')"><van-icon name="wap-home-o" /><span>首页</span></button><button type="button" @click="router.push('/shop/category')"><van-icon name="apps-o" /><span>分类</span></button><button type="button" @click="router.push('/shop/orders')"><van-icon name="orders-o" /><span>订单</span></button><button class="active" type="button"><van-icon name="contact-o" /><span>我的</span></button></nav>
  </main>
</template>