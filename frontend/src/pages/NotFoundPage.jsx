import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div className="page-container py-24 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">Page not found</h1>
        <p className="text-[var(--text-muted)] text-lg mb-8 max-w-md mx-auto">
          Looks like this page took a semester off. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary px-8 py-3">Go Home</Link>
          <Link to="/browse" className="btn-secondary px-8 py-3">Browse Listings</Link>
        </div>
      </motion.div>
    </div>
  )
}
