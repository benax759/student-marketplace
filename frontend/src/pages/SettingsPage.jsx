import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineCamera, HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const fileRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    college: user?.college || '',
    city: user?.city || '',
    phone: user?.phone || '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (avatarFile) formData.append('avatar', avatarFile)
      const { data } = await api.put('/users/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser(data.user)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  return (
    <div className="page-container py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title mb-1">Account Settings</h1>
        <p className="text-[var(--text-muted)] text-sm mb-8">Keep your profile up to date so buyers and sellers can trust you.</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar */}
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5 text-brand-500" /> Profile Picture
            </h3>
            <div className="flex items-center gap-5">
              <div className="relative group">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-24 h-24 rounded-2xl object-cover ring-4 ring-brand-500/20" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <HiOutlineCamera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div>
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-sm py-2">
                  Change Photo
                </button>
                <p className="text-xs text-[var(--text-muted)] mt-2">JPG, PNG • Max 2MB</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
          </div>

          {/* Personal info */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5 text-brand-500" /> Personal Info
            </h3>

            <div>
              <label className="label-base">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-base" placeholder="Your name" required />
            </div>

            <div>
              <label className="label-base">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="input-base resize-none" rows={3} placeholder="Tell buyers a bit about yourself…" maxLength={200} />
              <p className="text-xs text-[var(--text-muted)] mt-1">{form.bio.length}/200</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">College / University</label>
                <input type="text" value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} className="input-base" placeholder="IIT Delhi" />
              </div>
              <div>
                <label className="label-base">City</label>
                <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input-base" placeholder="Mumbai" />
              </div>
            </div>

            <div>
              <label className="label-base">WhatsApp Number</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-base" placeholder="91XXXXXXXXXX (with country code)" />
              <p className="text-xs text-[var(--text-muted)] mt-1">Used for WhatsApp contact button on your listings</p>
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <HiOutlineLockClosed className="w-5 h-5 text-brand-500" /> Account
            </h3>
            <div>
              <label className="label-base">Email Address</label>
              <input type="email" value={user?.email || ''} disabled className="input-base opacity-60 cursor-not-allowed" />
              <p className="text-xs text-[var(--text-muted)] mt-1">Email cannot be changed at this time.</p>
            </div>
          </div>

          <div className="flex gap-4 pb-8">
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
