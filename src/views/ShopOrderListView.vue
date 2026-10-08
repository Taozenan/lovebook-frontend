<script setup>
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
const router = useRouter(); const authStore = useAuthStore(); const activeStatus = ref('all'); const loading = ref(false); const orders = ref([]); const tabs = [{ text: '全部', value: 'all' }, { text: '待接单', value: 1 }, { text: '已接待', value: 2 }, { text: '已完成', value: 3 }]
async function loadOrders() { loading.value = true; try { const body = { pageNum: 1, pageSize: 50 }; if (activeStatus.value !== 'all') body.status = Number(activeStatus.value); const headers = { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'application/json' }; const load = async (url, role) => { const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }); const result = await response.json(); if (!response.ok || result.code !== 0) throw new Error(result.message || '订单加载失败'); return (result.data?.items || []).map((item) => ({ ...item, orderRole: role })) }; const [buyerItems, sellerItems] = await Promise.all([load('/api/shop/orders/query', 'buyer'), load('/api/shop/manage/orders/query', 'seller')]); const merged = new Map(); [...buyerItems, ...sellerItems].forEach((item) => { const old = merged.get(item.id); merged.set(item.id, old ? { ...old, ...item, orderRole: old.orderRole === 'buyer' ? 'buyer' : item.orderRole } : item) }); orders.value = [...merged.values()].sort((a, b) => String(b.createTime || '').localeCompare(String(a.createTime || ''))) } catch (error) { showToast(error.message || '订单加载失败') } finally { loading.value = false } }
function statusText(status) { return tabs.find((tab) => tab.value === status)?.text || '未知状态' }
function reviewed(order) { return order.isReviewed === true || order.reviewed === true || Number(order.isReviewed) === 1 || Number(order.reviewed) === 1 }
function openReview(order) { router.push({ path: `/shop/orders/${order.id}`, query: { review: '1' } }) }
onMounted(loadOrders)
</script>
<template>
  <main class="order-page"><van-nav-bar title="我的订单" left-arrow @click-left="router.back" /><van-tabs v-model:active="activeStatus" @change="loadOrders"><van-tab v-for="tab in tabs" :key="String(tab.value)" :title="tab.text" :name="tab.value" /></van-tabs><van-loading v-if="loading" class="shop-loading" /><section v-else class="order-list"><article v-for="order in orders" :key="order.id" class="order-card" @click="router.push(`/shop/orders/${order.id}`)"><div class="order-thumb-wrap"><div class="order-thumb" :style="order.coverUrl ? { backgroundImage: `url(${order.coverUrl})` } : {}">♡</div><div class="order-buyer"><span>购买方：</span><span class="order-buyer-avatar"><img v-if="order.buyerAvatarUrl" :src="order.buyerAvatarUrl" alt="购买方头像" /><span v-else>{{ (order.buyerName || '购').slice(0, 1) }}</span></span></div></div><div class="order-main"><div class="order-title"><b>{{ order.itemTitle }}</b><van-tag :type="order.status === 3 ? 'success' : order.status === 2 ? 'primary' : 'warning'">{{ statusText(order.status) }}</van-tag></div><small>创建时间：{{ order.createTime || '-' }}</small><strong>¥{{ Number(order.totalAmount || 0).toFixed(2) }}</strong><van-button v-if="order.status === 3 && !reviewed(order) && (order.canReview === true || Number(order.canReview) === 1)" class="order-review-button" size="small" plain type="primary" @click.stop="openReview(order)">去评价</van-button></div></article><van-empty v-if="!orders.length" description="暂无订单" /></section><nav class="shop-tabbar"><button type="button" @click="router.push('/home')"><van-icon name="wap-home-o" /><span>首页</span></button><button type="button" @click="router.push('/shop/manage')"><van-icon name="shop-o" /><span>上架</span></button><button class="active" type="button"><van-icon name="orders-o" /><span>订单</span></button><button type="button" @click="router.push('/profile')"><van-icon name="contact-o" /><span>我的</span></button></nav></main>
</template>





