import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import ListingCard from '../components/listings/ListingCard'
import { GridSkeleton } from '../components/common/Skeletons'
import EmptyState from '../components/common/EmptyState'

export default function WishlistPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/users/wishlist/items')
      .then(({ data }) => setWishlist(data.wishlist.filter(Boolean)))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="page-container py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="section-title mb-1">My Wishlist ❤️</h1>
          <p className="text-[var(--text-muted)] text-sm">Items you've saved for later</p>
        </div>

        {loading ? <GridSkeleton count={8} /> : (
          wishlist.length === 0 ? (
            <EmptyState
              icon="❤️"
              title="Your wishlist is empty"
              message="Tap the heart on any listing to save it here."
              action="/browse"
              actionLabel="Browse Listings"
            />
          ) : (
            <>
              <p className="text-sm text-[var(--text-muted)] mb-5">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {wishlist.map((l, i) => (
                  <motion.div key={l._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <ListingCard listing={l} />
                  </motion.div>
                ))}
              </div>
            </>
          )
        )}
      </motion.div>
    </div>
  )
}
