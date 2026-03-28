import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineArrowRight, HiOutlineLightningBolt,
  HiOutlineShieldCheck, HiOutlineCurrencyRupee, HiOutlineUserGroup
} from 'react-icons/hi'
import api from '../lib/api'
import ListingCard from '../components/listings/ListingCard'
import { GridSkeleton } from '../components/common/Skeletons'
import { CATEGORIES, getCategoryIcon } from '../utils/helpers'



const stats = [
  { icon: HiOutlineUserGroup, label: 'Students', value: '10,000+' },
  { icon: HiOutlineCurrencyRupee, label: 'Avg. Savings', value: '₹2,000+' },
  { icon: HiOutlineShieldCheck, label: 'Safe Trades', value: '50,000+' },
  { icon: HiOutlineLightningBolt, label: 'Listed Today', value: '200+' },
]

export default function HomePage() {

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

  return (
    <div className="min-h-screen">

      {/* ── Hero Card ── */}
      <section className="page-container pt-8 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="hero-gradient rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-14 md:p-20 relative overflow-hidden shadow-xl"
        >
          {/* Decorative orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/20 rounded-full blur-[60px]" />
            <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-[40px]" />
          </div>

          <div className="relative max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wider shadow-sm"
            >
              <HiOutlineLightningBolt className="w-4 h-4" />
              EXCLUSIVE CAMPUS DEALS
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight"
            >
              Elevate your <br className="hidden sm:block" />
              academic life.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-white/90 text-lg sm:text-xl mb-10 max-w-lg leading-relaxed font-medium"
            >
              The premier boutique marketplace for students to curate, trade, and discover premium campus essentials.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link
                to="/browse"
                className="btn-white inline-flex items-center gap-2 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all"
              >
                Start Browsing
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="page-container py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="card glass-card p-6 sm:p-8 text-center"
            >
              <div className="w-12 h-12 bg-[var(--bg-secondary)] dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <stat.icon className="w-6 h-6 text-brand-500" />
              </div>
              <p className="font-extrabold text-2xl text-[var(--text-primary)] font-display">{stat.value}</p>
              <p className="text-sm font-semibold text-[var(--text-muted)] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Curated Collections (Categories) ── */}
      <section className="page-container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Curated Collections</h2>
          <Link to="/browse" className="text-brand-500 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
            >
              <Link
                to={`/browse?category=${cat}`}
                className="flex flex-col items-center gap-2 group min-w-[80px]"
              >
                <div className="category-circle group-hover:shadow-glow">
                  <span>{getCategoryIcon(cat)}</span>
                </div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] group-hover:text-brand-500 transition-colors whitespace-nowrap">
                  {cat}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Finds ── */}
      {(loadingFeatured || featured.length > 0) && (
        <section className="page-container py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">✨ Featured Finds</h2>
              <p className="text-[var(--text-muted)] text-sm mt-1">Handpicked deals just for you</p>
            </div>
            <Link to="/browse?featured=true" className="text-brand-500 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View All <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loadingFeatured ? (
            <GridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {featured.map(listing => <ListingCard key={listing._id} listing={listing} />)}
            </div>
          )}
        </section>
      )}

      {/* ── Just Listed ── */}
      <section className="page-container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">🆕 Just Listed</h2>
            <p className="text-[var(--text-muted)] text-sm mt-1">Fresh from your campus community</p>
          </div>
          <Link to="/browse" className="text-brand-500 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            See All <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loadingLatest ? (
          <GridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {latest.map(listing => <ListingCard key={listing._id} listing={listing} />)}
          </div>
        )}
      </section>

      {/* ── CTA Banner ── */}
      <section className="page-container py-8 pb-12">
        <div className="hero-gradient rounded-3xl sm:rounded-4xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Got something to sell?</h2>
            <p className="text-white/70 text-base sm:text-lg mb-6 max-w-md mx-auto">
              Clear your dorm room and earn extra cash. Post a listing in under 2 minutes.
            </p>
            <Link to="/sell" className="btn-white inline-flex items-center gap-2 text-base">
              Post a Listing — It&apos;s Free
              <HiOutlineArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
