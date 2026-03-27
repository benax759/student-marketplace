export function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3] rounded-t-2xl rounded-b-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="flex justify-between">
          <div className="skeleton h-3 w-1/3 rounded" />
          <div className="skeleton h-3 w-1/4 rounded" />
        </div>
      </div>
    </div>
  )
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="skeleton w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-6 w-40 rounded" />
            <div className="skeleton h-4 w-64 rounded" />
            <div className="skeleton h-4 w-48 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-4">
        <div className="skeleton aspect-video rounded-2xl" />
        <div className="flex gap-2">
          {[1,2,3].map(i => <div key={i} className="skeleton w-20 h-20 rounded-xl" />)}
        </div>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <div className="skeleton h-8 w-3/4 rounded" />
        <div className="skeleton h-10 w-1/2 rounded" />
        <div className="skeleton h-24 w-full rounded" />
        <div className="skeleton h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}
