import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { createSession } from '../api/sessionsClient'
import type { Session } from '../types/session'

interface CreateSessionFormProps {
  onCreated: (session: Session) => void
  onCancel: () => void
}

export function CreateSessionForm({ onCreated, onCancel }: CreateSessionFormProps) {
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)

  function validate(trimmedTitle: string, date: Date | null): string | null {
    if (trimmedTitle.length < 3 || trimmedTitle.length > 80) {
      return 'Title must be between 3 and 80 characters.'
    }
    if (!date || Number.isNaN(date.getTime())) {
      return 'Enter a valid date and time.'
    }
    if (date.getTime() <= Date.now()) {
      return 'Date and time must be in the future.'
    }
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmittingRef.current) {
      return
    }

    const trimmedTitle = title.trim()
    const date = startsAt ? new Date(startsAt) : null
    const error = validate(trimmedTitle, date)
    if (error) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    setSubmitError(null)
    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      const created = await createSession({
        title: trimmedTitle,
        startsAt: (date as Date).toISOString(),
      })
      onCreated(created)
    } catch {
      setSubmitError('Could not create the session. Please try again.')
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label>
        Date and time
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
        />
      </label>
      {validationError && <p role="alert">{validationError}</p>}
      {submitError && <p role="alert">{submitError}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create session'}
      </button>
      <button type="button" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </button>
    </form>
  )
}
