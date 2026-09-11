import type { Session } from '../types/session'

interface SessionsListProps {
  status: 'loading' | 'error' | 'loaded'
  sessions: Session[]
  error: string | null
  onRetry: () => void
}

export function SessionsList({ status, sessions, error, onRetry }: SessionsListProps) {
  if (status === 'loading') {
    return <p role="status">Loading sessions…</p>
  }

  if (status === 'error') {
    return (
      <div role="alert">
        <p>{error ?? 'Something went wrong while loading sessions.'}</p>
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  if (sessions.length === 0) {
    return <p>No sessions match this filter.</p>
  }

  return (
    <ul>
      {sessions.map((session) => (
        <li key={session.id}>
          <strong>{session.title}</strong> — {session.status} —{' '}
          {new Date(session.startsAt).toLocaleString()}
        </li>
      ))}
    </ul>
  )
}
