import type { Session } from '../types/session'

export async function fetchSessions(): Promise<Session[]> {
  const response = await fetch('/api/sessions')
  if (!response.ok) {
    throw new Error(`Failed to load sessions (${response.status})`)
  }
  return (await response.json()) as Session[]
}

export interface CreateSessionInput {
  title: string
  startsAt: string
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Failed to create session (${response.status})`)
  }
  return (await response.json()) as Session
}
