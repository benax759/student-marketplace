export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export const formatDate = (date) => {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 30) return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

export const getConditionColor = (condition) => {
  const map = {
    'New': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Like New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Good': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Fair': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Poor': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[condition] || 'bg-slate-100 text-slate-700'
}

export const getCategoryIcon = (category) => {
  const map = {
    'Books': '📚',
    'Notes': '📝',
    'Electronics': '💻',
    'Accessories': '🎒',
    'Others': '📦',
  }
  return map[category] || '📦'
}

export const getCategoryColor = (category) => {
  const map = {
    'Books': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Notes': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Electronics': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    'Accessories': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    'Others': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  }
  return map[category] || 'bg-slate-100 text-slate-700'
}

export const truncate = (str, n) => str?.length > n ? str.slice(0, n - 1) + '…' : str

export const getWhatsAppLink = (phone, listingTitle) => {
  const message = encodeURIComponent(`Hi! I'm interested in your listing: "${listingTitle}" on CampusCart.`)
  return `https://wa.me/${phone}?text=${message}`
}

export const CATEGORIES = ['Books', 'Notes', 'Electronics', 'Accessories', 'Others']
export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']
