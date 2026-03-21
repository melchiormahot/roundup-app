'use client';

interface ProgressBarProps {
  /** Progress value from 0 to 100. */
  value: number;
  /** CSS color for the filled portion. Defaults to var(--accent-green). */
  color?: string;
  /** Accessible label describing what the progress bar represents. */
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  color = 'var(--accent-green)',
  label,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={['h-2 w-full overflow-hidden rounded-full bg-progress-track', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${clamped}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
