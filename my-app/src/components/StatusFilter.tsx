import { SESSION_STATUSES, type SessionStatus } from '../types/session'

export type StatusFilterValue = 'all' | SessionStatus

interface StatusFilterProps {
  value: StatusFilterValue
  onChange: (value: StatusFilterValue) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <label>
      Status
      <select
        aria-label="Filter by status"
        value={value}
        onChange={(event) => onChange(event.target.value as StatusFilterValue)}
      >
        <option value="all">All</option>
        {SESSION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </label>
  )
}
