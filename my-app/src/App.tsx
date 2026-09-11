import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { fetchSessions } from './api/sessionsClient'
import { CreateSessionForm } from './components/CreateSessionForm'
import { SessionsList } from './components/SessionsList'
import { StatusFilter, type StatusFilterValue } from './components/StatusFilter'
import type { Session } from './types/session'

type LoadStatus = 'loading' | 'error' | 'loaded'

function App() {
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilterValue>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchAndStore = useCallback(() => {
    fetchSessions()
      .then((data) => {
        setSessions(data)
        setLoadStatus('loaded')
      })
      .catch(() => {
        setError('Could not load sessions. Please try again.')
        setLoadStatus('error')
      })
  }, [])

  useEffect(() => {
    fetchAndStore()
  }, [fetchAndStore])

  function retry() {
    setLoadStatus('loading')
    setError(null)
    fetchAndStore()
  }

  const visibleSessions =
    filter === 'all' ? sessions : sessions.filter((session) => session.status === filter)

  function handleCreated(session: Session) {
    setSessions((current) => [...current, session])
    setIsFormOpen(false)
  }

  return (
    <main>
      <h1>Training Sessions</h1>

      <StatusFilter value={filter} onChange={setFilter} />

      <SessionsList
        status={loadStatus}
        sessions={visibleSessions}
        error={error}
        onRetry={retry}
      />

      {isFormOpen ? (
        <CreateSessionForm onCreated={handleCreated} onCancel={() => setIsFormOpen(false)} />
      ) : (
        <button type="button" onClick={() => setIsFormOpen(true)}>
          Add session
        </button>
      )}
    </main>
  )
}

export default App
