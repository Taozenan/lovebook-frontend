<script setup>
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const item = ref({ title: '', price: 0, stock: 0, coverUrl: '' })

async function loadItem() {
  const id = route.query.id
  if (!id) return
  try {
    const response = await fetch('/api/shop/manage/overview', { headers: { Authorization: `Bearer ${authStore.token}` } })
    const result = await response.json()
    if (!response.ok || result.code !== 0) throw new Error(result.message || '加载失败')
    item.value = result.data?.items?.find((value) => String(value.id) === String(id)) || item.value
  } catch (error) {
    showToast(error.message || '加载发布内容失败')
  }
}

onMounted(loadItem)
</script>

<template>
  <main class="publish-success-page">
    <van-nav-bar title="发布成功" />
    <section class="success-content">
      <div class="success-icon"><van-icon name="success" /></div>
      <h1>发布成功！</h1>
      <p>商品已成功上架至您的甜蜜小店</p>
      <article class="success-card"><div class="success-cover" :style="item.coverUrl ? { backgroundImage: `url(${item.coverUrl})` } : {}"><van-icon v-if="!item.coverUrl" name="photograph" /></div><div class="success-info"><strong>{{ item.title || '未命名内容' }}</strong><div><b>¥{{ Number(item.price || 0).toFixed(0) }}</b><span>初始库存: {{ item.stock ?? 0 }}</span></div></div></article>
    </section>
    <div class="success-actions"><van-button round color="#ff62aa" block @click="router.replace('/shop/publish')">继续发布</van-button><van-button round plain type="primary" block @click="router.replace('/shop/manage')">返回管理</van-button></div>
  </main>
</template>