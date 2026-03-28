import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineHeart, HiHeart, HiOutlineChatAlt2,
  HiOutlineShare, HiOutlineFlag, HiOutlineTrash, HiOutlinePencil,
  HiArrowLeft, HiOutlineCheckCircle
} from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import ListingCard from '../components/listings/ListingCard'
import { DetailSkeleton } from '../components/common/Skeletons'
import StarRating from '../components/common/StarRating'
import {
  formatPrice, formatDate, getConditionColor,
  getCategoryIcon, getCategoryColor, getWhatsAppLink
} from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [listing, setListing] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)
  const [reportModal, setReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [imgZoom, setImgZoom] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/listings/${id}`)
        setListing(data.listing)
        setRelated(data.related)
        setWishlisted(user?.wishlist?.includes(data.listing._id))
        // Track recently viewed
        if (user) api.post(`/users/recently-viewed/${id}`).catch(() => {})
      } catch {
        toast.error('Listing not found')
        navigate('/browse')
      } finally { setLoading(false) }
    }
    fetchListing()
    window.scrollTo(0, 0)
  }, [id])

  const handleWishlist = async () => {
    if (!user) { toast.error('Sign in to save items'); return }
    try {
      const { data } = await api.post(`/users/wishlist/${listing._id}`)
      setWishlisted(!wishlisted)
      updateUser({ wishlist: data.wishlist })
      toast.success(data.message)
    } catch { toast.error('Something went wrong') }
  }

  const handleDelete = async () => {
    if (!window.confirm('Remove this listing? This cannot be undone.')) return
    setDeleting(true)
    try {
      await api.delete(`/listings/${listing._id}`)
      toast.success('Listing removed')
      navigate('/profile/' + user._id)
    } catch { toast.error('Failed to delete') } finally { setDeleting(false) }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) { toast.error('Please provide a reason'); return }
    try {
      const { data } = await api.post(`/listings/${listing._id}/report`, { reason: reportReason })
      toast.success(data.message)
      setReportModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to report') }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: listing.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleStartChat = async () => {
    if (!user) { toast.error('Sign in to chat'); return }
    try {
      const { data } = await api.post('/chat/start', { recipientId: listing.seller._id, listingId: listing._id })
      navigate(`/chat/${data.chat._id}`)
    } catch { toast.error('Could not start chat') }
  }

  if (loading) return <div className="page-container py-10"><DetailSkeleton /></div>
  if (!listing) return null

  const isOwner = user?._id === listing.seller?._id
  const images = listing.images?.length > 0 ? listing.images : [{ url: `https://placehold.co/600x450/e2e8f0/94a3b8?text=${encodeURIComponent(listing.title)}` }]

  return (
    <div className="page-container py-6 sm:py-10">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors">
        <HiArrowLeft className="w-4 h-4" /> Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Left: Images ── */}
        <div className="lg:col-span-3 space-y-3">
          {/* Main image */}
          <div
            className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-zoom-in aspect-[4/3]"
            onClick={() => setImgZoom(true)}
          >
            <motion.img
              key={activeImg}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={images[activeImg]?.url}
              alt={listing.title}
              className="w-full h-full object-contain"
            />
            {listing.status !== 'available' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white/90 text-slate-900 font-bold text-xl px-6 py-2 rounded-full uppercase tracking-wide">
                  {listing.status}
                </span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
              {activeImg + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === i ? 'border-brand-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Info ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${getCategoryColor(listing.category)}`}>
              {getCategoryIcon(listing.category)} {listing.category}
            </span>
            <span className={`badge ${getConditionColor(listing.condition)}`}>
              {listing.condition}
            </span>
            {listing.isFeatured && (
              <span className="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Title + Price */}
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] leading-tight mb-2">{listing.title}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-brand-500">{formatPrice(listing.price)}</span>
              {listing.price === 0 && <span className="text-sm text-emerald-500 font-semibold">Free</span>}
            </div>
          </div>

          {/* Actions */}
          {!isOwner && (
            <div className="space-y-3">
              <button
                onClick={handleStartChat}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
              >
                <HiOutlineChatAlt2 className="w-5 h-5" />
                Chat with Seller
              </button>

              {listing.seller?.phone && (
                <a
                  href={getWhatsAppLink(listing.seller.phone, listing.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-all"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  WhatsApp Seller
                </a>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleWishlist}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-bold transition-all text-[15px]
                    ${wishlisted
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-red-50 hover:text-red-500 hover:scale-[1.02]'
                    }`}
                >
                  {wishlisted ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                  {wishlisted ? 'Saved' : 'Save'}
                </button>
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 text-[15px] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] hover:shadow-sm py-3.5 rounded-full font-bold transition-all hover:scale-[1.02]">
                  <HiOutlineShare className="w-5 h-5" /> Share
                </button>
              </div>
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="flex gap-3">
              <Link to={`/listing/${listing._id}/edit`} className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3.5 text-[15px]">
                <HiOutlinePencil className="w-5 h-5" /> Edit
              </Link>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 font-bold py-3.5 rounded-full transition-all hover:scale-[1.02] text-[15px] flex items-center justify-center gap-2">
                <HiOutlineTrash className="w-5 h-5" /> Delete
              </button>
            </div>
          )}

          {/* Description */}
          <div className="card p-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2 text-sm">About this item</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Details */}
          <div className="card p-4 space-y-2.5">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-3">Details</h3>
            {[
              { label: 'Category', value: listing.category },
              { label: 'Condition', value: listing.condition },
              { label: 'College', value: listing.college },
              { label: 'City', value: listing.city },
              { label: 'Status', value: listing.status },
              { label: 'Views', value: `${listing.views} views` },
              { label: 'Listed', value: formatDate(listing.createdAt) },
            ].filter(d => d.value).map(d => (
              <div key={d.label} className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">{d.label}</span>
                <span className="font-medium text-[var(--text-primary)] capitalize">{d.value}</span>
              </div>
            ))}
          </div>

          {/* Seller card */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Seller</h3>
            <Link to={`/profile/${listing.seller?._id}`} className="flex items-center gap-3 group">
              {listing.seller?.avatar ? (
                <img src={listing.seller.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/20" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                  {listing.seller?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text-primary)] group-hover:text-brand-500 transition-colors truncate">
                  {listing.seller?.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <StarRating rating={listing.seller?.averageRating || 0} size="sm" />
                  <span>({listing.seller?.totalRatings || 0})</span>
                </div>
                {listing.seller?.college && <p className="text-xs text-[var(--text-muted)] truncate">{listing.seller.college}</p>}
              </div>
              <HiOutlineCheckCircle className="w-5 h-5 text-brand-500" />
            </Link>
          </div>

          {/* Report */}
          {!isOwner && user && (
            <button onClick={() => setReportModal(true)} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors">
              <HiOutlineFlag className="w-3.5 h-3.5" /> Report this listing
            </button>
          )}
        </div>
      </div>

      {/* Related listings */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">Similar Listings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map(r => <ListingCard key={r._id} listing={r} />)}
          </div>
        </section>
      )}

      {/* Report Modal */}
      <AnimatePresence>
        {reportModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 max-w-md w-full"
            >
              <h3 className="font-bold text-lg mb-1 text-[var(--text-primary)]">Report Listing</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">Tell us what's wrong with this listing.</p>
              <textarea
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                placeholder="Describe the issue (spam, fake, inappropriate, etc.)"
                rows={4}
                className="input-base resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setReportModal(false)} className="flex-1 btn-ghost border border-[var(--border-color)]">Cancel</button>
                <button onClick={handleReport} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors">
                  Submit Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image zoom lightbox */}
      <AnimatePresence>
        {imgZoom && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center cursor-zoom-out p-4"
            onClick={() => setImgZoom(false)}
          >
            <img src={images[activeImg]?.url} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
