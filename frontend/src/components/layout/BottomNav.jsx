import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineHome, HiHome,
  HiOutlineSearch, HiSearch,
  HiOutlinePlusCircle,
  HiOutlineChatAlt2, HiChatAlt2,
  HiOutlineUser, HiUser
} from 'react-icons/hi'
import useAuthStore from '../../store/authStore'

const navItems = [
  { path: '/', label: 'Home', icon: HiOutlineHome, activeIcon: HiHome },
  { path: '/browse', label: 'Browse', icon: HiOutlineSearch, activeIcon: HiSearch },
  { path: '/sell', label: 'Add', icon: HiOutlinePlusCircle, activeIcon: HiOutlinePlusCircle, isCenter: true },
  { path: '/chat', label: 'Chat', icon: HiOutlineChatAlt2, activeIcon: HiChatAlt2 },
  { path: '/profile', label: 'Profile', icon: HiOutlineUser, activeIcon: HiUser },
]

export default function BottomNav() {
  const location = useLocation()
  const { user } = useAuthStore()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    if (path === '/profile') return location.pathname.startsWith('/profile')
    return location.pathname.startsWith(path)
  }

  const getProfilePath = () => {
    return user ? `/profile/${user._id}` : '/login'
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--bg-card)]/90 backdrop-blur-xl border-t border-[var(--border-color)] shadow-bottom-nav">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const Icon = active ? item.activeIcon : item.icon
          const to = item.path === '/profile' ? getProfilePath() : item.path

          if (item.isCenter) {
            return (
              <Link
                key={item.path}
                to={user ? to : '/login'}
                className="relative flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center shadow-button -mt-4 hover:bg-brand-600 active:scale-95 transition-all duration-200">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.path}
              to={to}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 group"
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors duration-200 ${
                  active ? 'text-brand-500' : 'text-[var(--text-muted)] group-hover:text-brand-400'
                }`} />
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                active ? 'text-brand-500' : 'text-[var(--text-muted)] group-hover:text-brand-400'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
