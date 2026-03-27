import { create } from 'zustand'
import api from '../lib/api'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, isLoading: false })
      return { success: true, message: data.message }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, message: error.response?.data?.message || 'Login failed' }
    }
  },

  register: async (formData) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/register', formData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, isLoading: false })
      return { success: true, message: data.message }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, message: error.response?.data?.message || 'Registration failed' }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  updateUser: (userData) => {
    const updated = { ...get().user, ...userData }
    localStorage.setItem('user', JSON.stringify(updated))
    set({ user: updated })
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me')
      const updated = data.user
      localStorage.setItem('user', JSON.stringify(updated))
      set({ user: updated })
    } catch (_) {}
  },
}))

export default useAuthStore
