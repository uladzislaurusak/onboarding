export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'

export interface Session {
  id: string
  title: string
  status: SessionStatus
  startsAt: string
}

export const SESSION_STATUSES: SessionStatus[] = ['scheduled', 'completed', 'cancelled']
