import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      {/* Spacer so content isn't hidden behind bottom nav on mobile */}
      <div className="bottom-nav-spacer" />
    </div>
  )
}
