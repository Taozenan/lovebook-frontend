<script setup>
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const activeType = ref(Number(route.query.type) || 1)
const recommended = ref(route.query.recommended === '1' ? '1' : '0')
const keyword = ref('')
const loading = ref(false)
const items = ref([])
const tabs = [{ name: '餐品', value: 1 }, { name: '专属服务', value: 2 }, { name: '商品', value: 3 }]

async function loadItems() {
  loading.value = true
  try {
    const params = new URLSearchParams({ type: String(activeType.value) })
    if (keyword.value.trim()) params.set('keyword', keyword.value.trim())
    if (recommended.value === '1') params.set('recommended', 'true')
    const response = await fetch(`/api/shop/items?${params}`, { headers: { Authorization: `Bearer ${authStore.token}` } })
    const result = await response.json()
    if (!response.ok || result.code !== 0) throw new Error(result.message || '加载失败')
    items.value = result.data?.items || []
  } catch (error) {
    showToast(error.message || '商品加载失败')
  } finally {
    loading.value = false
  }
}

function selectType(type) { activeType.value = type; loadItems() }
function selectRecommended() { loadItems() }
function openDetail(item) { router.push(`/shop/items/${item.id}`) }
onMounted(loadItems)
</script>

<template>
  <main class="shop-category-page">
    <van-nav-bar title="分类页" />
    <van-tabs v-model:active="activeType" class="category-tabs" @change="selectType">
      <van-tab v-for="tab in tabs" :key="tab.value" :title="tab.name" :name="tab.value" />
    </van-tabs>
    <section class="category-content">
      <van-search v-model="keyword" shape="round" placeholder="搜索专属礼物、宝贝..." @search="loadItems" />
      <div class="category-sort"><span>排序：最新⌄</span><van-dropdown-menu><van-dropdown-item v-model="recommended" :options="[{ text: '全部', value: '0' }, { text: '仅推荐', value: '1' }]" @change="selectRecommended" /></van-dropdown-menu></div>
      <van-loading v-if="loading" class="shop-loading" />
      <div v-else class="category-grid">
        <button v-for="item in items" :key="item.id" type="button" class="category-item-card" @click="openDetail(item)">
          <div class="category-item-cover" :style="item.coverUrl ? { backgroundImage: `url(${item.coverUrl})` } : {}"><span v-if="!item.coverUrl">♡</span></div>
          <div class="category-item-info"><small>♡ {{ item.sellerName || '小甜甜' }}</small><b>{{ item.title }}</b><p>{{ item.subtitle || item.description || '专属心意，认真准备' }}</p><strong>¥{{ Number(item.price || 0).toFixed(0) }}</strong></div>
        </button>
      </div>
      <van-empty v-if="!loading && !items.length" description="暂无相关内容" />
    </section>
    <nav class="shop-tabbar"><button type="button" @click="router.push('/home')"><van-icon name="wap-home-o" /><span>首页</span></button><button type="button" @click="router.push('/shop/manage')"><van-icon name="shop-o" /><span>上架</span></button><button type="button" @click="router.push('/shop/orders')"><van-icon name="orders-o" /><span>订单</span></button><button type="button" @click="router.push('/profile')"><van-icon name="contact-o" /><span>我的</span></button></nav>
  </main>
</template>
