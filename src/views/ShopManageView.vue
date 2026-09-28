<script setup>
import { onMounted, ref } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter(); const authStore = useAuthStore(); const loading = ref(false); const activeType = ref(null)
const data = ref({ items: [], publishedCount: 0, pendingOrderCount: 0, todayIncome: 0 })
const tabs = [{ label: '餐品管理', value: 1 }, { label: '服务管理', value: 2 }, { label: '商品管理', value: 3 }, { label: '订单管理', value: null }]
async function load() { loading.value = true; try { const query = activeType.value ? `?type=${activeType.value}` : ''; const r = await fetch(`/api/shop/manage/overview${query}`, { headers: { Authorization: `Bearer ${authStore.token}` } }); const result = await r.json(); if (!r.ok || result.code !== 0) throw new Error(result.message || '加载失败'); data.value = result.data } catch (e) { showToast(e.message || '加载失败') } finally { loading.value = false } }
function edit(item) { router.push({ path: '/shop/publish', query: { id: item.id } }) }
async function changeRecommend(item) {
  const recommended = item.isRecommended === 1 ? 0 : 1
  const response = await fetch(`/api/shop/manage/items/${item.id}/recommend`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ recommended })
  })
  const result = await response.json()
  if (!response.ok || result.code !== 0) {
    return showToast(result.message || '操作失败')
  }
  item.isRecommended = recommended
  showToast(recommended === 1 ? '已推荐' : '已取消推荐')
}
async function changeStatus(item, status) { const r = await fetch(`/api/shop/manage/items/${item.id}/status`, { method: 'PUT', headers: { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); const result = await r.json(); if (!r.ok || result.code !== 0) return showToast(result.message || '操作失败'); showToast(status === 1 ? '已上架' : '已下架'); load() }
async function remove(item) { try { await showConfirmDialog({ title: '删除商品', message: '删除后将不再展示，确定继续吗？' }); const r = await fetch(`/api/shop/manage/items/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${authStore.token}` } }); const result = await r.json(); if (!r.ok || result.code !== 0) throw new Error(result.message || '删除失败'); load() } catch (e) { if (e) showToast(e.message || '已取消') } }
function selectTab(value) { activeType.value = value; if (value !== null) load() }
onMounted(load)
</script>

<template>
  <main class="manage-page">
    <van-nav-bar title="上架管理" left-arrow @click-left="router.back" />
    <section class="manage-stats"><div><small>上架数量</small><strong>{{ data.publishedCount }}</strong><span>个</span></div><div><small>待处理订单</small><strong>{{ data.pendingOrderCount }}</strong><span>单</span></div><div><small>今日收入</small><strong>¥{{ Number(data.todayIncome || 0).toFixed(0) }}</strong></div></section>
    <van-tabs v-model:active="activeType" @change="selectTab"><van-tab v-for="tab in tabs" :key="tab.label" :title="tab.label" :name="tab.value" /></van-tabs>
    <van-loading v-if="loading" class="shop-loading" />
    <section v-else class="manage-list"><article v-for="item in data.items" :key="item.id" class="manage-item"><div class="manage-cover" :style="item.coverUrl ? { backgroundImage: `url(${item.coverUrl})` } : {}">♡</div><div class="manage-main"><div class="manage-item-title"><b>{{ item.title }}</b><van-tag :type="item.status === 1 ? 'success' : 'default'">{{ item.status === 1 ? '已上架' : item.status === 0 ? '草稿' : '已下架' }}</van-tag></div><strong>¥{{ Number(item.price || 0).toFixed(0) }}</strong><div class="manage-actions"><van-button size="mini" plain @click="edit(item)">编辑</van-button><van-button v-if="item.itemType !== 3" size="mini" plain :type="item.isRecommended === 1 ? 'primary' : 'default'" @click="changeRecommend(item)">{{ item.isRecommended === 1 ? '取消推荐' : '推荐' }}</van-button><van-button v-if="item.status === 1" size="mini" plain @click="changeStatus(item, 2)">下架</van-button><van-button v-else size="mini" plain type="primary" @click="changeStatus(item, 1)">上架</van-button><van-button size="mini" plain type="danger" @click="remove(item)">删除</van-button></div></div></article><van-empty v-if="!data.items.length" description="还没有发布内容" /></section>
    <van-button class="manage-add" round type="primary" color="#ff62aa" icon="plus" @click="router.push('/shop/publish')" />
    <nav class="shop-tabbar"><button type="button" @click="router.push('/home')"><van-icon name="wap-home-o" /><span>首页</span></button><button type="button"><van-icon name="apps-o" /><span>分类</span></button><button type="button" @click="router.push('/shop/orders')"><van-icon name="orders-o" /><span>订单</span></button><button class="active" type="button" @click="router.push('/profile')"><van-icon name="contact-o" /><span>我的</span></button></nav>
  </main>
</template>
