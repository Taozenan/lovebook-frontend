<script setup>
import { onMounted, reactive, ref } from 'vue'
import { showToast } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const submitting = ref(false)
const editingId = ref(route.query.id || '')
const form = reactive({ itemType: Number(route.query.type) || 1, title: '', subtitle: '', description: '', price: '', stock: 0, coverUrl: '', serviceDurationMin: '', serviceRule: '', imageUrls: [], status: 0 })
const typeTabs = [{ text: '餐品', value: 1 }, { text: '专属服务', value: 2 }, { text: '商品', value: 3 }]

async function loadItem() {
  if (!editingId.value) return
  const response = await fetch('/api/shop/manage/overview', { headers: { Authorization: `Bearer ${authStore.token}` } })
  const result = await response.json()
  const found = result.data?.items?.find((item) => String(item.id) === String(editingId.value))
  if (found) Object.assign(form, { ...found, imageUrls: [] })
}

async function uploadCover(fileItem) {
  const file = fileItem.file
  const formData = new FormData()
  formData.append('file', file)
  try {
    const response = await fetch('/api/shop/upload', { method: 'POST', headers: { Authorization: `Bearer ${authStore.token}` }, body: formData })
    const result = await response.json()
    if (!response.ok || result.code !== 0) throw new Error(result.message || '图片上传失败')
    form.coverUrl = result.data.url
    showToast('图片上传成功')
  } catch (error) {
    showToast(error.message || '图片上传失败')
  }
}
async function submit(status) {
  if (!form.title.trim() || form.price === '' || form.stock === '') return showToast('请填写名称、价格和库存')
  submitting.value = true
  try {
    const url = editingId.value ? `/api/shop/manage/items/${editingId.value}` : '/api/shop/manage/items'
    const response = await fetch(url, { method: editingId.value ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, status, price: Number(form.price), stock: Number(form.stock), serviceDurationMin: form.serviceDurationMin ? Number(form.serviceDurationMin) : null }) })
    const result = await response.json()
    if (!response.ok || result.code !== 0) throw new Error(result.message || '保存失败')
    if (status === 1) {
      router.replace({ path: '/shop/publish/success', query: { id: result.data?.id || editingId.value } })
    } else {
      showToast('草稿已保存')
      router.replace('/shop/manage')
    }
  } catch (error) {
    showToast(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadItem)
</script>

<template>
  <main class="publish-page">
    <van-nav-bar title="发布内容" left-arrow @click-left="router.back" />
    <section class="publish-form">
      <van-tabs v-model:active="form.itemType" class="publish-tabs">
        <van-tab v-for="tab in typeTabs" :key="tab.value" :title="tab.text" :name="tab.value" />
      </van-tabs>
      <div class="publish-upload"><van-uploader :after-read="uploadCover" :max-count="1" accept="image/*"><van-icon name="photograph" /><span>添加{{ typeTabs.find((tab) => tab.value === form.itemType)?.text || '商品' }}精美照片</span><small>图片可暂不上传，最大5MB</small></van-uploader><img v-if="form.coverUrl" class="publish-preview" :src="form.coverUrl" alt="已上传图片" /></div>
      <van-field v-model="form.coverUrl" label="图片地址" placeholder="可选，不填写也可以发布" />
      <van-field v-model="form.title" label="名称" placeholder="请输入名称" />
      <van-field v-model="form.description" label="说明" type="textarea" rows="3" maxlength="500" placeholder="输入甜蜜的制作心得，比如：深夜为你烤制的暖心小甜点……" />
      <div class="publish-row"><van-field v-model="form.price" label="价格" type="number" placeholder="0" /><van-field v-model="form.stock" label="每日库存" type="number" placeholder="0" /></div>
      <van-field v-if="form.itemType === 2" v-model="form.serviceDurationMin" label="服务时长" type="number" placeholder="分钟" />
      <van-field v-if="form.itemType === 2" v-model="form.serviceRule" label="预约规则" placeholder="例如：需要提前1天预约哦" />
    </section>
    <div class="publish-actions"><van-button round plain type="primary" :loading="submitting" @click="submit(0)">保存草稿</van-button><van-button round type="primary" color="#ff62aa" :loading="submitting" @click="submit(1)">立即上架</van-button></div>
  </main>
</template>
