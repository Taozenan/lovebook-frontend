<script setup>
import { computed, onMounted, ref } from 'vue'
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const targetAccount = ref('')
const status = ref({ state: 'UNBOUND', sent: [], received: [] })
const loading = ref(false)

const isBound = computed(() => status.value.state === 'BOUND')

async function request(path, options = {}) {
  if (!authStore.token) {
    authStore.logout()
    router.replace('/login')
    throw new Error('登录信息缺失，请重新登录')
  }
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authStore.token}`,
      ...options.headers
    }
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.code !== 0) {
    throw new Error(result.message || '操作失败，请稍后重试')
  }
  return result.data
}

async function loadStatus() {
  loading.value = true
  try {
    status.value = await request('/api/auth/bindings/status', { method: 'GET' })
  } catch (error) {
    showFailToast(error.message)
  } finally {
    loading.value = false
  }
}

async function sendInvite() {
  try {
    await request('/api/auth/bindings/invitations', {
      method: 'POST',
      body: JSON.stringify({ targetPhone: targetAccount.value.trim() })
    })
    targetAccount.value = ''
    showSuccessToast('邀请已发送，等待对方确认')
    await loadStatus()
  } catch (error) {
    showFailToast(error.message)
  }
}

async function acceptInvite(invitation) {
  try {
    await request(`/api/auth/bindings/invitations/${invitation.id}/accept`, { method: 'PUT' })
    showSuccessToast('绑定成功')
    await loadStatus()
  } catch (error) {
    showFailToast(error.message)
  }
}

async function rejectInvite(invitation) {
  try {
    await showConfirmDialog({ title: '拒绝绑定邀请？', message: '拒绝后对方需要重新发送邀请', confirmButtonText: '确认拒绝' })
    await request(`/api/auth/bindings/invitations/${invitation.id}/reject`, { method: 'PUT' })
    showSuccessToast('已拒绝邀请')
    await loadStatus()
  } catch (error) {
    if (error?.message) {
      showFailToast(error.message)
    }
  }
}

async function unbind() {
  try {
    await showConfirmDialog({
      title: '确认解除绑定？',
      message: '解除绑定后将无法浏览对方的小店',
      confirmButtonText: '确认解除',
      confirmButtonColor: '#ff3d3d'
    })
    await request('/api/auth/bindings', { method: 'DELETE' })
    showSuccessToast('已解除绑定')
    await loadStatus()
  } catch (error) {
    if (error?.message) {
      showFailToast(error.message)
    }
  }
}

onMounted(loadStatus)
</script>

<template>
  <main class="binding-page">
    <van-nav-bar title="绑定对象" left-arrow @click-left="router.back()" />

    <section v-if="isBound" class="binding-card">
      <h2><i class="blue-dot" />已绑定状态</h2>
      <div class="partner-row">
        <div class="partner-avatar">我</div>
        <van-icon name="like-o" class="heart-icon" />
        <div class="partner-avatar partner-avatar-pink">TA</div>
      </div>
      <div class="binding-detail">
        <span>当前状态</span><strong>已成功绑定</strong>
        <span>绑定对象</span><b>{{ status.binding?.partnerName || status.binding?.partnerPhone }}</b>
        <span>绑定时间</span><b>{{ status.binding?.bindingTime }}</b>
      </div>
      <van-button block round plain class="unbind-button" @click="unbind">解除绑定</van-button>
    </section>

    <template v-else>
      <section class="binding-card">
        <h2><i class="pink-dot" />未绑定状态</h2>
        <p class="binding-description">还没有绑定对象哦，快邀请 TA 加入吧！</p>
        <van-form @submit="sendInvite">
          <label class="field-label" for="target-account">对方手机号</label>
          <van-field
            id="target-account"
            v-model="targetAccount"
            class="lover-field"
            name="targetAccount"
            placeholder="请输入对方注册的手机号"
            :rules="[{ required: true, message: '请输入对方手机号' }]"
          />
          <van-button block round native-type="submit" class="lover-login-button">发送绑定邀请</van-button>
        </van-form>
      </section>

      <section v-if="status.sent?.length" class="binding-card pending-card">
        <h2><i class="pink-dot" />等待对方确认</h2>
        <p v-for="invitation in status.sent" :key="invitation.id" class="pending-message">
          已向 <strong>{{ invitation.targetName || invitation.targetPhone }}</strong> 发送邀请，等待 TA 确认。
        </p>
      </section>

      <section v-if="status.received?.length" class="binding-card pending-card">
        <h2><i class="blue-dot" />收到绑定邀请</h2>
        <div v-for="invitation in status.received" :key="invitation.id" class="received-invite">
          <p><strong>{{ invitation.requesterName || invitation.requesterPhone }}</strong> 想与你绑定为对象</p>
          <div>
            <van-button size="small" plain @click="rejectInvite(invitation)">拒绝</van-button>
            <van-button size="small" type="primary" @click="acceptInvite(invitation)">接受邀请</van-button>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>
