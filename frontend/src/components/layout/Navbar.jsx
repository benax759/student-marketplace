import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSearch, HiOutlineHeart,
  HiOutlineChatAlt2, HiOutlineUser, HiOutlinePlusCircle,
  HiOutlineLogout, HiOutlineCog, HiOutlineShieldCheck,
  HiMenu, HiX, HiMoon, HiSun
} from 'react-icons/hi'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const navLinks = [
    { to: '/browse', label: 'Browse' },
    { to: '/browse?category=Books', label: 'Books' },
    { to: '/browse?category=Electronics', label: 'Electronics' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-2xl border-b border-[var(--border-color)]">
      <div className="page-container">
        <div className="flex items-center h-16 gap-4">

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden btn-ghost p-2 rounded-full"
          >
            {menuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-button">
              <span className="text-white text-sm font-bold">CC</span>
            </div>
            <span className="font-display font-bold text-xl text-[var(--text-primary)]">
              Campus<span className="text-brand-500">Cart</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  location.pathname + location.search === link.to
                    ? 'bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                    : 'text-[var(--text-secondary)] hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search textbooks, electronics..."
                className="input-base pl-11 py-2.5 text-sm h-10"
              />
            </div>
          </form>

          {/* Mobile: search icon */}
          <button
            onClick={() => setSearchOpen(o => !o)}
            className="md:hidden btn-ghost p-2 rounded-full ml-auto"
          >
            <HiOutlineSearch className="w-5 h-5" />
          </button>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-1.5 ml-auto">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2.5 rounded-full"
              aria-label="Toggle theme"
            >
              {isDark ? <HiSun className="w-5 h-5 text-yellow-400" /> : <HiMoon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* Wishlist */}
                <Link to="/wishlist" className="btn-ghost p-2.5 rounded-full">
                  <HiOutlineHeart className="w-5 h-5" />
                </Link>

                {/* Chat */}
                <Link to="/chat" className="btn-ghost p-2.5 rounded-full">
                  <HiOutlineChatAlt2 className="w-5 h-5" />
                </Link>

                {/* Post listing */}
                <Link to="/sell" className="btn-primary py-2 px-5 text-sm flex items-center gap-1.5">
                  <HiOutlinePlusCircle className="w-4 h-4" />
                  <span>Sell</span>
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(o => !o)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/30" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 card shadow-card-hover py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-[var(--border-color)]">
                          <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{user.name}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                        </div>

                        {[
                          { to: `/profile/${user._id}`, icon: HiOutlineUser, label: 'My Profile' },
                          { to: '/profile/settings', icon: HiOutlineCog, label: 'Settings' },
                          { to: '/wishlist', icon: HiOutlineHeart, label: 'Wishlist' },
                          { to: '/chat', icon: HiOutlineChatAlt2, label: 'Messages' },
                          ...(user.role === 'admin' ? [{ to: '/admin', icon: HiOutlineShieldCheck, label: 'Admin Panel' }] : []),
                        ].map(item => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        ))}

                        <div className="border-t border-[var(--border-color)] mt-1 pt-1">
                          <button
                            onClick={() => { logout(); setDropdownOpen(false); navigate('/') }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <HiOutlineLogout className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm px-5 py-2">Log in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile: theme toggle */}
          <button
            onClick={toggleTheme}
            className="md:hidden btn-ghost p-2 rounded-full"
            aria-label="Toggle theme"
          >
            {isDark ? <HiSun className="w-5 h-5 text-yellow-400" /> : <HiMoon className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile search overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-3 overflow-hidden"
            >
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search textbooks, electronics..."
                    className="input-base pl-11 py-2.5 text-sm"
                    autoFocus
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[var(--border-color)] py-4 space-y-1 overflow-hidden"
            >
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="block px-4 py-2.5 rounded-2xl text-sm font-medium text-[var(--text-secondary)] hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-500">
                  {link.label}
                </Link>
              ))}

              {!user && (
                <div className="pt-3 space-y-2">
                  <Link to="/login" className="block text-center btn-ghost text-sm w-full py-2.5">Log in</Link>
                  <Link to="/register" className="block text-center btn-primary text-sm w-full py-2.5">Sign up</Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
