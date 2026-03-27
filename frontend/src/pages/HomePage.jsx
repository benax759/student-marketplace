import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineSearch, HiOutlineArrowRight, HiOutlineLightningBolt,
  HiOutlineShieldCheck, HiOutlineCurrencyRupee, HiOutlineUserGroup
} from 'react-icons/hi'
import api from '../lib/api'
import ListingCard from '../components/listings/ListingCard'
import { GridSkeleton } from '../components/common/Skeletons'
import { CATEGORIES, getCategoryIcon } from '../utils/helpers'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } })
}

const stats = [
  { icon: HiOutlineUserGroup, label: 'Students', value: '10,000+' },
  { icon: HiOutlineCurrencyRupee, label: 'Avg. Savings', value: '₹2,000+' },
  { icon: HiOutlineShieldCheck, label: 'Safe Trades', value: '50,000+' },
  { icon: HiOutlineLightningBolt, label: 'Listed Today', value: '200+' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [featured, setFeatured] = useState([])
  const [latest, setLatest] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [loadingLatest, setLoadingLatest] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/listings/featured')
        setFeatured(data.listings)
      } catch { /* graceful */ } finally { setLoadingFeatured(false) }
    }
    const fetchLatest = async () => {
      try {
        const { data } = await api.get('/listings?limit=8&sort=latest')
        setLatest(data.listings)
      } catch { /* graceful */ } finally { setLoadingLatest(false) }
    }
    fetchFeatured()
    fetchLatest()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 text-white">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-700/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-600/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="page-container relative py-20 md:py-28 text-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <HiOutlineLightningBolt className="w-4 h-4" />
              The #1 Campus Marketplace in India
            </span>
          </motion.div>

          <motion.h1
            custom={1} initial="hidden" animate="show" variants={fadeUp}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"
          >
            Buy & Sell on Campus
            <br />
            <span className="text-brand-400">Like a Pro.</span>
          </motion.h1>

          <motion.p
            custom={2} initial="hidden" animate="show" variants={fadeUp}
            className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-8"
          >
            Books, notes, gadgets, accessories — find everything you need from students just like you.
            No shipping hassle, just campus-to-campus.
          </motion.p>

          {/* Search bar */}
          <motion.form
            custom={3} initial="hidden" animate="show" variants={fadeUp}
            onSubmit={handleSearch}
            className="flex gap-2 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for books, notes, laptops…"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400
                           rounded-xl px-5 py-3.5 pl-12 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-3.5 text-base shrink-0 rounded-xl bg-brand-500 hover:bg-brand-400">
              Search
            </button>
          </motion.form>

          {/* Quick category links */}
          <motion.div
            custom={4} initial="hidden" animate="show" variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-2 mt-6"
          >
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                to={`/browse?category=${cat}`}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 
                           text-slate-200 text-sm px-3.5 py-1.5 rounded-full transition-all duration-200"
              >
                <span>{getCategoryIcon(cat)}</span>
                <span>{cat}</span>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full fill-[var(--bg-primary)]">
            <path d="M0,60 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,60 Z" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="page-container -mt-2 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-card p-4 text-center border-none"
            >
              <div className="w-9 h-9 bg-brand-50 dark:bg-brand-950/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <stat.icon className="w-5 h-5 text-brand-500" />
              </div>
              <p className="font-bold text-lg text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="page-container py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={`/browse?category=${cat}`}
                className="glass-card glass-card-hover flex flex-col items-center justify-center p-4 sm:p-6 gap-2 text-center group border-none"
              >
                <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-200">
                  {getCategoryIcon(cat)}
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{cat}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Listings ── */}
      {(loadingFeatured || featured.length > 0) && (
        <section className="page-container py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">⭐ Featured Listings</h2>
              <p className="text-[var(--text-muted)] text-sm mt-1">Handpicked deals just for you</p>
            </div>
            <Link to="/browse?featured=true" className="btn-ghost flex items-center gap-1 text-brand-500">
              View all <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loadingFeatured ? (
            <GridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map(listing => <ListingCard key={listing._id} listing={listing} />)}
            </div>
          )}
        </section>
      )}

      {/* ── Latest Listings ── */}
      <section className="page-container py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">🆕 Just Listed</h2>
            <p className="text-[var(--text-muted)] text-sm mt-1">Fresh from your campus community</p>
          </div>
          <Link to="/browse" className="btn-ghost flex items-center gap-1 text-brand-500">
            See all <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loadingLatest ? (
          <GridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {latest.map(listing => <ListingCard key={listing._id} listing={listing} />)}
          </div>
        )}
      </section>

      {/* ── CTA Banner ── */}
      <section className="page-container py-10">
        <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-8 sm:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Got something to sell?</h2>
            <p className="text-brand-100 text-base sm:text-lg mb-6 max-w-md mx-auto">
              Clear your dorm room and earn extra cash. Post a listing in under 2 minutes.
            </p>
            <Link to="/sell" className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
              Post a Listing — It's Free
              <HiOutlineArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
