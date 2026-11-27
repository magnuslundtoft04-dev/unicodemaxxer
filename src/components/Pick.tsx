// A row of plain-text options: "level: basic / mid / exam"

interface Props<T extends string | number> {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  disabled?: boolean
}

export function Pick<T extends string | number>({ label, options, value, onChange, disabled }: Props<T>) {
  return (
    <span className="pick">
      <span className="pick-label">{label}:</span>{' '}
      {options.map((o, i) => (
        <span key={String(o.value)}>
          {i > 0 && <span className="slash"> / </span>}
          {o.value === value ? (
            <b>{o.label}</b>
          ) : (
            <a
              href="#"
              className={disabled ? 'off' : ''}
              onClick={(e) => {
                e.preventDefault()
                if (!disabled) onChange(o.value)
              }}
            >
              {o.label}
            </a>
          )}
        </span>
      ))}
    </span>
  )
}
