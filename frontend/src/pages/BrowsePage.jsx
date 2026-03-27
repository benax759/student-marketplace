import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineFilter, HiOutlineAdjustments, HiOutlineX,
  HiOutlineChevronDown, HiOutlineSearch
} from 'react-icons/hi'
import api from '../lib/api'
import ListingCard from '../components/listings/ListingCard'
import { GridSkeleton } from '../components/common/Skeletons'
import EmptyState from '../components/common/EmptyState'
import { CATEGORIES, CONDITIONS } from '../utils/helpers'

const SORT_OPTIONS = [
  { value: 'latest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Viewed' },
]

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [condition, setCondition] = useState(searchParams.get('condition') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest')
  const [page, setPage] = useState(1)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (condition) params.set('condition', condition)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (location) params.set('location', location)
    params.set('sort', sort)
    params.set('page', page)
    params.set('limit', 12)

    try {
      const { data } = await api.get(`/listings?${params}`)
      setListings(data.listings)
      setPagination(data.pagination)
    } catch { /* graceful */ } finally { setLoading(false) }
  }, [search, category, condition, minPrice, maxPrice, location, sort, page])

  useEffect(() => { fetchListings() }, [fetchListings])

  // Sync URL params
  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (category) params.category = category
    if (condition) params.condition = condition
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    if (location) params.location = location
    if (sort !== 'latest') params.sort = sort
    setSearchParams(params)
  }, [search, category, condition, minPrice, maxPrice, location, sort])

  const clearFilters = () => {
    setSearch(''); setCategory(''); setCondition('')
    setMinPrice(''); setMaxPrice(''); setLocation('')
    setSort('latest'); setPage(1)
  }

  const activeFilterCount = [category, condition, minPrice, maxPrice, location].filter(Boolean).length

  return (
    <div className="page-container py-8">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar Filters (desktop) ── */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterPanel
            category={category} setCategory={setCategory}
            condition={condition} setCondition={setCondition}
            minPrice={minPrice} setMinPrice={setMinPrice}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            location={location} setLocation={setLocation}
            onClear={clearFilters}
            activeCount={activeFilterCount}
          />
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {/* Search */}
            <form onSubmit={e => { e.preventDefault(); setPage(1) }} className="flex-1 min-w-[200px]">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search listings…"
                  className="input-base pl-10 py-2.5 h-10 text-sm"
                />
              </div>
            </form>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1) }}
                className="input-base py-2 pr-8 text-sm h-10 appearance-none cursor-pointer min-w-[160px]"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <HiOutlineChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden btn-secondary py-2 px-4 text-sm flex items-center gap-1.5 h-10"
            >
              <HiOutlineAdjustments className="w-4 h-4" />
              Filters {activeFilterCount > 0 && <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
            </button>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="btn-ghost text-sm flex items-center gap-1 text-red-500 h-10">
                <HiOutlineX className="w-4 h-4" /> Clear
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => { setCategory(''); setPage(1) }}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !category ? 'bg-brand-500 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-brand-50 dark:hover:bg-brand-950'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1) }}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === cat ? 'bg-brand-500 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-brand-50 dark:hover:bg-brand-950'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results info */}
          {!loading && (
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {pagination.total ? `${pagination.total} listing${pagination.total !== 1 ? 's' : ''} found` : 'No listings found'}
              {category && ` in ${category}`}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <GridSkeleton count={12} />
          ) : listings.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No listings found"
              message="Try adjusting your search or filters. New items get listed every day!"
              action="/sell"
              actionLabel="Be the first to list something"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {listings.map((listing, i) => (
                <motion.div
                  key={listing._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const p = i + Math.max(1, page - 2)
                  if (p > pagination.pages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page ? 'bg-brand-500 text-white' : 'btn-ghost'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-80 bg-[var(--bg-primary)] z-50 lg:hidden overflow-y-auto p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg text-[var(--text-primary)]">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="btn-ghost p-2">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              <FilterPanel
                category={category} setCategory={v => { setCategory(v); setPage(1) }}
                condition={condition} setCondition={v => { setCondition(v); setPage(1) }}
                minPrice={minPrice} setMinPrice={setMinPrice}
                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                location={location} setLocation={setLocation}
                onClear={clearFilters}
                activeCount={activeFilterCount}
                onApply={() => setFiltersOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterPanel({ category, setCategory, condition, setCondition, minPrice, setMinPrice, maxPrice, setMaxPrice, location, setLocation, onClear, activeCount, onApply }) {
  return (
    <div className="card p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
          <HiOutlineFilter className="w-4 h-4" /> Filters
          {activeCount > 0 && <span className="bg-brand-500 text-white text-xs rounded-full px-2 py-0.5">{activeCount}</span>}
        </h3>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-xs text-red-500 hover:text-red-600 font-medium">Clear all</button>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="label-base">Category</label>
        <div className="space-y-1">
          {['', ...CATEGORIES].map(cat => (
            <button
              key={cat || 'all'}
              onClick={() => setCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                  : 'text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat || 'All Categories'}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="label-base">Condition</label>
        <div className="space-y-1">
          {['', ...CONDITIONS].map(cond => (
            <button
              key={cond || 'any'}
              onClick={() => setCondition(cond)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                condition === cond
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                  : 'text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cond || 'Any Condition'}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="label-base">Price Range (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="Min"
            className="input-base py-2 text-sm"
          />
          <span className="text-[var(--text-muted)] text-sm">–</span>
          <input
            type="number"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="input-base py-2 text-sm"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="label-base">Location</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="City or college name"
          className="input-base py-2 text-sm"
        />
      </div>

      {onApply && (
        <button onClick={onApply} className="btn-primary w-full">Apply Filters</button>
      )}
    </div>
  )
}
