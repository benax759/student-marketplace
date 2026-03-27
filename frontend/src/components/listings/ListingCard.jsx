import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineHeart, HiHeart, HiOutlineLocationMarker, HiStar } from 'react-icons/hi'
import { formatPrice, formatDate, getConditionColor, getCategoryIcon } from '../../utils/helpers'
import useAuthStore from '../../store/authStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function ListingCard({ listing, compact = false }) {
  const { user, updateUser } = useAuthStore()
  const isWishlisted = user?.wishlist?.includes(listing._id)
  const [wishlisted, setWishlisted] = useState(isWishlisted)
  const [loadingWishlist, setLoadingWishlist] = useState(false)

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Sign in to save items'); return }
    setLoadingWishlist(true)
    try {
      const { data } = await api.post(`/users/wishlist/${listing._id}`)
      setWishlisted(!wishlisted)
      updateUser({ wishlist: data.wishlist })
      toast.success(data.message)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoadingWishlist(false)
    }
  }

  const thumbnail = listing.images?.[0]?.url || `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(listing.title)}`

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`glass-card glass-card-hover group relative overflow-hidden border-none ${compact ? '' : ''}`}
    >
      <Link to={`/listing/${listing._id}`} className="block">
        {/* Image */}
        <div className="img-zoom-container relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-t-2xl overflow-hidden">
          <img
            src={thumbnail}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Badges overlay */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
            {listing.isFeatured && (
              <span className="badge bg-brand-500 text-white text-[10px]">⭐ Featured</span>
            )}
            {listing.status === 'sold' && (
              <span className="badge bg-slate-700 text-white text-[10px]">Sold</span>
            )}
            {listing.status === 'reserved' && (
              <span className="badge bg-yellow-500 text-white text-[10px]">Reserved</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            disabled={loadingWishlist}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center 
              bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-md
              transition-all duration-200 hover:scale-110 active:scale-95
              opacity-0 group-hover:opacity-100`}
          >
            {wishlisted
              ? <HiHeart className="w-4 h-4 text-red-500" />
              : <HiOutlineHeart className="w-4 h-4 text-slate-500" />
            }
          </button>

          {/* Category chip */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="badge bg-black/50 backdrop-blur-sm text-white text-[10px]">
              {getCategoryIcon(listing.category)} {listing.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug line-clamp-2 flex-1">
              {listing.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-brand-500">{formatPrice(listing.price)}</span>
            <span className={`badge text-[10px] ${getConditionColor(listing.condition)}`}>
              {listing.condition}
            </span>
          </div>

          {/* Seller + location row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {listing.seller?.avatar ? (
                <img src={listing.seller.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-[9px] text-white font-bold">
                  {listing.seller?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-xs text-[var(--text-muted)] font-medium truncate max-w-[80px]">
                {listing.seller?.name}
              </span>
              {listing.seller?.averageRating > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-semibold">
                  <HiStar className="w-3 h-3" />
                  {listing.seller.averageRating}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
              {listing.city && (
                <>
                  <HiOutlineLocationMarker className="w-3 h-3" />
                  <span className="truncate max-w-[60px]">{listing.city}</span>
                </>
              )}
            </div>
          </div>

          <p className="text-[10px] text-[var(--text-muted)] mt-2">{formatDate(listing.createdAt)}</p>
        </div>
      </Link>
    </motion.div>
  )
}
