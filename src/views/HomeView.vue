<script setup>
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const shop = ref({ banners: [], categories: [], recommendedFoods: [], hotServices: [] })

async function loadHome() {
  loading.value = true
  try {
    const response = await fetch('/api/shop/home', { headers: { Authorization: `Bearer ${authStore.token}` } })
    const result = await response.json()
    if (!response.ok || result.code !== 0) throw new Error(result.message || '加载失败')
    shop.value = { ...shop.value, ...result.data }
  } catch (error) {
    showToast(error.message || '商城加载失败')
  } finally {
    loading.value = false
  }
}

function openDetail(item) { router.push(`/shop/items/${item.id}`) }
function openProfile() { router.push('/profile') }
function openBinding() { router.push('/binding') }
function openRecommended(type) { router.push({ path: '/shop/category', query: { type, recommended: '1' } }) }
onMounted(loadHome)
</script>

<template>
  <main class="shop-home-page">
    <van-nav-bar title="恋人小店" />
    <section class="shop-user-bar">
      <div class="shop-user-avatar">♡</div>
      <div class="shop-user-copy"><div><strong>{{ shop.partner?.nickname || '未绑定对象' }}</strong><em v-if="shop.partner?.bound">已绑定</em></div><span>为你准备的专属小店</span></div>
      <van-icon name="bell" class="shop-bell" @click="openBinding" />
    </section>
    <van-pull-refresh v-model="loading" @refresh="loadHome">
      <section class="shop-content">
        <div v-if="shop.banners.length" class="shop-banner"><img :src="shop.banners[0].imageUrl" :alt="shop.banners[0].title"><div class="shop-banner-mask"><strong>{{ shop.banners[0].title }}</strong><span>每一份心意，都值得被认真准备</span></div></div>
        <div v-else class="shop-banner shop-banner-empty"><strong>本周甜蜜推荐</strong><span>为你准备的专属惊喜</span></div>
        <div class="shop-category-grid"><button v-for="category in shop.categories" :key="category.id" type="button" @click="router.push({ path: '/shop/category', query: { type: category.categoryType } })"><span class="shop-category-icon">{{ category.categoryType === 1 ? '☕' : category.categoryType === 2 ? '♡' : '🎁' }}</span><b>{{ category.name }}</b></button></div>

        <section v-if="shop.recommendedFoods.length" class="shop-section"><div class="shop-section-title"><h2>推荐餐品 🔍</h2><span @click="openRecommended(1)">查看全部</span></div><div class="shop-card-grid"><button v-for="item in shop.recommendedFoods" :key="item.id" type="button" class="shop-item-card" @click="openDetail(item)"><div class="shop-item-cover" :style="item.coverUrl ? { backgroundImage: `url(${item.coverUrl})` } : {}"><span v-if="!item.coverUrl">♡</span></div><div class="shop-item-body"><b>{{ item.title }}</b><small>{{ item.subtitle || item.description || '专属心意，认真准备' }}</small><strong>¥{{ Number(item.price || 0).toFixed(0) }}</strong></div></button></div></section>

        <section v-if="shop.hotServices.length" class="shop-section"><div class="shop-section-title"><h2>热门服务 🐱</h2><span @click="openRecommended(2)">查看全部</span></div><div class="shop-card-grid"><button v-for="item in shop.hotServices" :key="item.id" type="button" class="shop-item-card" @click="openDetail(item)"><div class="shop-item-cover" :style="item.coverUrl ? { backgroundImage: `url(${item.coverUrl})` } : {}"><span v-if="!item.coverUrl">♡</span></div><div class="shop-item-body"><b>{{ item.title }}</b><small>{{ item.subtitle || item.description || '专属心意，认真准备' }}</small><strong>¥{{ Number(item.price || 0).toFixed(0) }}</strong></div></button></div></section>

        <van-empty v-if="!shop.recommendedFoods.length && !shop.hotServices.length" description="暂时还没有上架内容" />
      </section>
    </van-pull-refresh>
    <nav class="shop-tabbar"><button class="active" type="button"><van-icon name="wap-home-o" /><span>首页</span></button><button type="button" @click="router.push('/shop/category')"><van-icon name="apps-o" /><span>分类</span></button><button type="button" @click="router.push('/shop/orders')"><van-icon name="orders-o" /><span>订单</span></button><button type="button" @click="openProfile"><van-icon name="contact-o" /><span>我的</span></button></nav>
  </main>
</template>
