import { defineStore } from 'pinia'

const STORAGE_KEY = 'tzn-auth'

const emptySession = {
  token: '',
  username: '',
  nickname: '',
  roles: [],
  expiresIn: 0,
  avatarUrl: ''
}

function readSession() {
  try {
    return { ...emptySession, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) }
  } catch {
    return { ...emptySession }
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => readSession(),
  getters: {
    isLoggedIn: (state) => Boolean(state.token)
  },
  actions: {
    setLogin(data) {
      const session = { ...emptySession, ...data }
      this.$patch(session)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    },
    updateAvatar(avatarUrl) {
      this.avatarUrl = avatarUrl || ''
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...this.$state }))
    },
    logout() {
      this.$reset()
      localStorage.removeItem(STORAGE_KEY)
    }
  }
})
