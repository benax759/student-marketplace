import { Link } from 'react-router-dom'

export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  message = "Looks like this place is empty.",
  action,
  actionLabel,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--text-muted)] text-sm max-w-xs mb-6">{message}</p>
      {action && (
        <Link to={action} className="btn-primary">
          {actionLabel || 'Take action'}
        </Link>
      )}
    </div>
  )
}
