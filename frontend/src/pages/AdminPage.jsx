import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineUsers, HiOutlineCollection, HiOutlineFlag,
  HiOutlineCheckCircle, HiOutlineBan, HiOutlineStar,
  HiOutlineTrash, HiOutlineSearch, HiShieldCheck
} from 'react-icons/hi'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import { formatDate, formatPrice } from '../utils/helpers'
import toast from 'react-hot-toast'

const TABS = ['Overview', 'Users', 'Listings', 'Reported']

export default function AdminPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [reported, setReported] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, listingsRes, reportedRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/listings'),
        api.get('/admin/listings?reported=true'),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data.users)
      setListings(listingsRes.data.listings)
      setReported(reportedRes.data.listings)
    } catch { toast.error('Failed to load admin data') }
    finally { setLoading(false) }
  }

  const toggleUser = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`)
      setUsers(prev => prev.map(u => u._id === id ? data.user : u))
      toast.success(data.message)
    } catch { toast.error('Failed') }
  }

  const toggleListing = async (id, type = 'listings') => {
    try {
      const { data } = await api.put(`/admin/listings/${id}/toggle`)
      const setter = type === 'reported' ? setReported : setListings
      setter(prev => prev.map(l => l._id === id ? { ...l, isActive: data.listing.isActive } : l))
      toast.success(data.message)
    } catch { toast.error('Failed') }
  }

  const featureListing = async (id) => {
    try {
      const { data } = await api.put(`/admin/listings/${id}/feature`)
      setListings(prev => prev.map(l => l._id === id ? { ...l, isFeatured: data.listing.isFeatured } : l))
      toast.success(data.message)
    } catch { toast.error('Failed') }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (!user || user.role !== 'admin') return null
  if (loading) return <div className="page-container py-20 text-center text-[var(--text-muted)]">Loading admin panel…</div>

  return (
    <div className="page-container py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <HiShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="section-title mb-0">Admin Panel</h1>
            <p className="text-[var(--text-muted)] text-sm">Manage users and listings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--border-color)] mb-8">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab ? 'text-brand-500' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}>
              {tab}
              {tab === 'Reported' && reported.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{reported.length}</span>
              )}
              {activeTab === tab && <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'Overview' && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: HiOutlineUsers, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
              { icon: HiOutlineCollection, label: 'Total Listings', value: stats.totalListings, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
              { icon: HiOutlineCheckCircle, label: 'Active Listings', value: stats.activeListings, color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/30' },
              { icon: HiOutlineFlag, label: 'Reported', value: stats.reportedListings, color: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
            ].map(s => (
              <div key={s.label} className="card p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{s.value}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {activeTab === 'Users' && (
          <div>
            <div className="relative mb-4 max-w-sm">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="input-base pl-10 py-2.5 text-sm" />
            </div>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                      {['User', 'Email', 'College', 'Joined', 'Role', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {u.avatar ? <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /> : (
                              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">{u.name?.[0]}</div>
                            )}
                            <span className="font-medium text-[var(--text-primary)] whitespace-nowrap">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{u.email}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{u.college || '—'}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {u.isActive ? 'Active' : 'Banned'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.role !== 'admin' && (
                            <button onClick={() => toggleUser(u._id)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30'
                            }`}>
                              {u.isActive ? 'Suspend' : 'Restore'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <p className="text-center py-8 text-[var(--text-muted)] text-sm">No users found</p>}
              </div>
            </div>
          </div>
        )}

        {/* Listings */}
        {(activeTab === 'Listings' || activeTab === 'Reported') && (
          <ListingsTable
            listings={activeTab === 'Reported' ? reported : listings}
            onToggle={(id) => toggleListing(id, activeTab === 'Reported' ? 'reported' : 'listings')}
            onFeature={featureListing}
          />
        )}
      </motion.div>
    </div>
  )
}

function ListingsTable({ listings, onToggle, onFeature }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              {['Listing', 'Seller', 'Price', 'Category', 'Status', 'Featured', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {listings.map(l => (
              <tr key={l._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 max-w-[200px]">
                    {l.images?.[0] && <img src={l.images[0].url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />}
                    <span className="font-medium text-[var(--text-primary)] truncate">{l.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{l.seller?.name || '—'}</td>
                <td className="px-4 py-3 font-semibold text-brand-500 whitespace-nowrap">{formatPrice(l.price)}</td>
                <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{l.category}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${l.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {l.isActive ? 'Active' : 'Removed'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${l.isFeatured ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {l.isFeatured ? '⭐ Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => onToggle(l._id)} className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                      l.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30'
                    }`}>
                      {l.isActive ? 'Remove' : 'Restore'}
                    </button>
                    <button onClick={() => onFeature(l._id)} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-950/30 transition-colors">
                      {l.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {listings.length === 0 && <p className="text-center py-8 text-[var(--text-muted)] text-sm">No listings here</p>}
      </div>
    </div>
  )
}
