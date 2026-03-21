'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleProps) {
  const id = label
    ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`
    : undefined;

  return (
    <label
      htmlFor={id}
      className={[
        'inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center gap-3',
        disabled && 'pointer-events-none opacity-50',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-accent-green' : 'bg-border-secondary',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
      {label && (
        <span className="text-sm text-text-primary select-none">{label}</span>
      )}
    </label>
  );
}
