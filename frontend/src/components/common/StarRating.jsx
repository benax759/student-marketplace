import { HiStar } from 'react-icons/hi'

export default function StarRating({ rating = 0, max = 5, interactive = false, onRate, size = 'md' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' }
  const cls = sizes[size] || sizes.md

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          onClick={() => interactive && onRate?.(i + 1)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <HiStar
            className={`${cls} transition-colors ${
              i < rating ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
