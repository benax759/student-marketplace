import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineLocationMarker, HiOutlineAcademicCap, HiOutlinePencil,
  HiOutlineHeart, HiStar, HiOutlineChatAlt2, HiOutlineCalendar,
  HiOutlinePhone
} from 'react-icons/hi'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import ListingCard from '../components/listings/ListingCard'
import StarRating from '../components/common/StarRating'
import { ProfileSkeleton, GridSkeleton } from '../components/common/Skeletons'
import EmptyState from '../components/common/EmptyState'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const TABS = ['Listings', 'Reviews']

export default function ProfilePage() {
  const { id } = useParams()
  const { user: currentUser } = useAuthStore()
  const navigate = useNavigate()
  const isOwn = currentUser?._id === id

  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Listings')
  const [ratingModal, setRatingModal] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')

  const tabs = isOwn ? [...TABS, 'Wishlist', 'Recently Viewed'] : TABS

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const [profileRes, listingsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/listings/user/${id}`),
        ])
        setProfile(profileRes.data.user)
        setListings(listingsRes.data.listings)

        if (isOwn) {
          const [wishRes, recentRes] = await Promise.all([
            api.get('/users/wishlist/items'),
            api.get('/users/recently-viewed/items'),
          ])
          setWishlist(wishRes.data.wishlist)
          setRecentlyViewed(recentRes.data.recentlyViewed)
        }
      } catch {
        toast.error('Profile not found')
        navigate('/browse')
      } finally { setLoading(false) }
    }
    fetchProfile()
  }, [id])

  const handleRate = async () => {
    if (!myRating) { toast.error('Select a star rating'); return }
    try {
      await api.post(`/users/${id}/rate`, { rating: myRating, comment: myComment })
      toast.success('Rating submitted!')
      setRatingModal(false)
      const { data } = await api.get(`/users/${id}`)
      setProfile(data.user)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit rating') }
  }

  const handleStartChat = async () => {
    if (!currentUser) { toast.error('Sign in first'); return }
    try {
      const { data } = await api.post('/chat/start', { recipientId: id, listingId: null })
      navigate(`/chat/${data.chat._id}`)
    } catch { toast.error('Could not start chat') }
  }

  if (loading) return <div className="page-container py-10"><ProfileSkeleton /></div>
  if (!profile) return null

  return (
    <div className="page-container py-8">
      {/* Profile header card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-brand-500/20" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold">
                {profile.name?.[0]?.toUpperCase()}
              </div>
            )}
            {/* Online dot — decorative */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-[var(--bg-card)] rounded-full" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{profile.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={profile.averageRating || 0} size="sm" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{profile.averageRating || '0.0'}</span>
                    <span className="text-sm text-[var(--text-muted)]">({profile.totalRatings || 0} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                {isOwn ? (
                  <Link to="/profile/settings" className="btn-secondary text-sm flex items-center gap-1.5 py-2">
                    <HiOutlinePencil className="w-4 h-4" /> Edit Profile
                  </Link>
                ) : currentUser ? (
                  <>
                    <button onClick={handleStartChat} className="btn-primary text-sm flex items-center gap-1.5 py-2">
                      <HiOutlineChatAlt2 className="w-4 h-4" /> Message
                    </button>
                    <button onClick={() => setRatingModal(true)} className="btn-secondary text-sm flex items-center gap-1.5 py-2">
                      <HiStar className="w-4 h-4" /> Rate Seller
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {profile.bio && (
              <p className="text-[var(--text-secondary)] text-sm mt-3 leading-relaxed max-w-xl">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-[var(--text-muted)]">
              {profile.college && (
                <span className="flex items-center gap-1.5"><HiOutlineAcademicCap className="w-4 h-4 shrink-0" />{profile.college}</span>
              )}
              {profile.city && (
                <span className="flex items-center gap-1.5"><HiOutlineLocationMarker className="w-4 h-4 shrink-0" />{profile.city}</span>
              )}
              <span className="flex items-center gap-1.5">
                <HiOutlineCalendar className="w-4 h-4 shrink-0" />
                Joined {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border-color)]">
          {[
            { label: 'Listings', value: listings.length },
            { label: 'Reviews', value: profile.totalRatings || 0 },
            { label: 'Rating', value: `${profile.averageRating || '0.0'} ★` },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border-color)]">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'text-brand-500'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Listings' && (
        listings.length === 0 ? (
          <EmptyState icon="🛍️" title="No listings yet" message={isOwn ? "You haven't posted anything yet." : "This seller hasn't listed anything yet."} action={isOwn ? '/sell' : undefined} actionLabel="Post your first listing" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {listings.map((l, i) => (
              <motion.div key={l._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ListingCard listing={l} />
              </motion.div>
            ))}
          </div>
        )
      )}

      {activeTab === 'Reviews' && (
        <div className="space-y-4 max-w-2xl">
          {profile.ratings?.length === 0 ? (
            <EmptyState icon="⭐" title="No reviews yet" message="Be the first to leave a review for this seller." />
          ) : (
            profile.ratings?.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-4">
                <div className="flex items-start gap-3">
                  {r.reviewer?.avatar ? (
                    <img src={r.reviewer.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {r.reviewer?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-[var(--text-primary)]">{r.reviewer?.name || 'Anonymous'}</p>
                      <span className="text-xs text-[var(--text-muted)]">{formatDate(r.createdAt)}</span>
                    </div>
                    <StarRating rating={r.rating} size="sm" />
                    {r.comment && <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">{r.comment}</p>}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {activeTab === 'Wishlist' && isOwn && (
        wishlist.filter(Boolean).length === 0 ? (
          <EmptyState icon="❤️" title="Your wishlist is empty" message="Save items you love by tapping the heart icon." action="/browse" actionLabel="Start browsing" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.filter(Boolean).map((l, i) => (
              <motion.div key={l._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ListingCard listing={l} />
              </motion.div>
            ))}
          </div>
        )
      )}

      {activeTab === 'Recently Viewed' && isOwn && (
        recentlyViewed.filter(Boolean).length === 0 ? (
          <EmptyState icon="🕐" title="Nothing viewed yet" message="Items you browse will appear here." action="/browse" actionLabel="Start browsing" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.filter(Boolean).map((l, i) => (
              <motion.div key={l._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ListingCard listing={l} />
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Rate modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setRatingModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-1 text-[var(--text-primary)]">Rate {profile.name}</h3>
            <p className="text-sm text-[var(--text-muted)] mb-5">How was your experience with this seller?</p>
            <div className="flex justify-center mb-4">
              <StarRating rating={myRating} size="lg" interactive onRate={setMyRating} />
            </div>
            <textarea value={myComment} onChange={e => setMyComment(e.target.value)} placeholder="Share your experience (optional)" rows={3} className="input-base resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRatingModal(false)} className="flex-1 btn-ghost border border-[var(--border-color)]">Cancel</button>
              <button onClick={handleRate} className="flex-1 btn-primary">Submit</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
