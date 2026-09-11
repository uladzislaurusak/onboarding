import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('creates a session and shows it in the list', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Add session' }))

    await user.type(screen.getByLabelText('Title'), 'Accessibility Basics')
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const localValue = new Date(futureDate.getTime() - futureDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    await user.type(screen.getByLabelText('Date and time'), localValue)

    await user.click(screen.getByRole('button', { name: 'Create session' }))

    await waitFor(() => {
      expect(screen.getByText('Accessibility Basics')).toBeInTheDocument()
    })
  })
})
