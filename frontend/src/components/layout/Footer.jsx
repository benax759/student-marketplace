import { Link } from 'react-router-dom'
import { HiHeart } from 'react-icons/hi'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] mt-16">
      <div className="page-container py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">CC</span>
              </div>
              <span className="font-display font-bold text-[var(--text-primary)]">
                Campus<span className="text-brand-500">Cart</span>
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              The student marketplace for buying & selling on campus. Safe, simple, and student-first.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Browse</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {['Books', 'Notes', 'Electronics', 'Accessories', 'Others'].map(cat => (
                <li key={cat}>
                  <Link to={`/browse?category=${cat}`} className="hover:text-brand-500 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link to="/login" className="hover:text-brand-500 transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-brand-500 transition-colors">Register</Link></li>
              <li><Link to="/sell" className="hover:text-brand-500 transition-colors">Post a Listing</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand-500 transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-3">Info</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link to="/about" className="hover:text-brand-500 transition-colors">About Us</Link></li>
              <li><Link to="/safety" className="hover:text-brand-500 transition-colors">Safety Tips</Link></li>
              <li><Link to="/terms" className="hover:text-brand-500 transition-colors">Terms of Use</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            © 2024 CampusCart. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            Made with <HiHeart className="text-red-400 w-3 h-3" /> for students everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
