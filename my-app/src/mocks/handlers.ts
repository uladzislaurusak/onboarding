import { http, HttpResponse } from 'msw'
import type { CreateSessionInput } from '../api/sessionsClient'
import type { Session } from '../types/session'

const sessions: Session[] = [
  {
    id: '1',
    title: 'React Fundamentals',
    status: 'scheduled',
    startsAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'TypeScript Deep Dive',
    status: 'completed',
    startsAt: '2026-08-15T13:00:00.000Z',
  },
  {
    id: '3',
    title: 'Testing Workshop',
    status: 'cancelled',
    startsAt: '2026-09-20T09:00:00.000Z',
  },
]

export const handlers = [
  http.get('/api/sessions', () => {
    return HttpResponse.json(sessions)
  }),

  http.post('/api/sessions', async ({ request }) => {
    const input = (await request.json()) as CreateSessionInput
    const created: Session = {
      id: crypto.randomUUID(),
      title: input.title,
      status: 'scheduled',
      startsAt: input.startsAt,
    }
    sessions.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),
]
