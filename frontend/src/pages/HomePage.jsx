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
      <section className="page-container pt-6 sm:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="hero-gradient rounded-3xl sm:rounded-4xl p-8 sm:p-12 md:p-16 relative overflow-hidden"
        >
          {/* Decorative orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          </div>

          <div className="relative max-w-xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider"
            >
              <HiOutlineLightningBolt className="w-3.5 h-3.5" />
              Exclusive Campus Deals
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
            >
              Elevate your{' '}
              <br className="hidden sm:block" />
              academic life.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-white/80 text-base sm:text-lg mb-8 max-w-md leading-relaxed"
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
                className="btn-white inline-flex items-center gap-2 text-base"
              >
                Start Browsing
                <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="page-container py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="card p-4 sm:p-5 text-center border-none shadow-card"
            >
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-950/50 rounded-2xl flex items-center justify-center mx-auto mb-2.5">
                <stat.icon className="w-5 h-5 text-brand-500" />
              </div>
              <p className="font-bold text-lg text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</p>
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
