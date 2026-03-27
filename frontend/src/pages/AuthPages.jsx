import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

function InputField({ label, type = 'text', value, onChange, placeholder, icon: Icon, error, ...props }) {
  const [showPass, setShowPass] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <label className="label-base">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />}
        <input
          type={isPassword ? (showPass ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-base ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${error ? 'border-red-400' : ''}`}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            {showPass ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success(result.message)
      navigate('/')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-brand-700/20 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <span className="font-bold text-sm">CC</span>
            </div>
            <span className="font-display text-xl font-bold">CampusCart</span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold mb-4">Welcome back! 👋</h2>
          <p className="text-brand-200 text-lg leading-relaxed">
            Your campus community is waiting. Dive back into deals.
          </p>
          <div className="mt-8 space-y-3">
            {['📚 Browse thousands of listings', '💬 Chat directly with sellers', '❤️ Save your favourites'].map(t => (
              <div key={t} className="flex items-center gap-3 text-brand-100">
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-brand-400 text-sm">© 2024 CampusCart</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">CC</span>
            </div>
            <span className="font-display font-bold text-lg text-[var(--text-primary)]">CampusCart</span>
          </div>

          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">Sign in</h1>
          <p className="text-[var(--text-muted)] mb-8">
            Don't have an account? <Link to="/register" className="text-brand-500 font-semibold hover:underline">Register free</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Email address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@college.edu" icon={HiOutlineMail} required />
            <InputField label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" icon={HiOutlineLockClosed} required />

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base mt-2">
              {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</span> : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-950/30 rounded-2xl text-xs text-[var(--text-muted)] border border-brand-100 dark:border-brand-900/30">
            <p className="font-semibold text-[var(--text-secondary)] mb-1">Demo credentials</p>
            <p>Email: <span className="font-mono">student@demo.com</span></p>
            <p>Password: <span className="font-mono">password123</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', city: '' })
  const [agree, setAgree] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agree) { toast.error('Please agree to the terms'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    const result = await register(form)
    if (result.success) {
      toast.success(result.message)
      navigate('/')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-brand-700/20 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <span className="font-bold text-sm">CC</span>
            </div>
            <span className="font-display text-xl font-bold">CampusCart</span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold mb-4">Join your campus market 🚀</h2>
          <p className="text-brand-200 text-lg leading-relaxed">
            Thousands of students already trading on CampusCart. Get started for free in 30 seconds.
          </p>
        </div>
        <p className="relative text-brand-400 text-sm">© 2024 CampusCart</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">CC</span>
            </div>
            <span className="font-display font-bold text-lg text-[var(--text-primary)]">CampusCart</span>
          </div>

          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">Create account</h1>
          <p className="text-[var(--text-muted)] mb-8">
            Already a member? <Link to="/login" className="text-brand-500 font-semibold hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" icon={HiOutlineUser} required />
            <InputField label="Email address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@college.edu" icon={HiOutlineMail} required />
            <InputField label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" icon={HiOutlineLockClosed} required />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">College (optional)</label>
                <input type="text" value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} placeholder="IIT Delhi" className="input-base" />
              </div>
              <div>
                <label className="label-base">City (optional)</label>
                <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Mumbai" className="input-base" />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500" />
              <span className="text-sm text-[var(--text-muted)]">
                I agree to the <Link to="/terms" className="text-brand-500 hover:underline">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="text-brand-500 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
              {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</span> : 'Create free account'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
