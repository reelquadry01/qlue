'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

/**
 * Switch control. The whole row is the button so the tap target stays large on
 * phones, and `role="switch"` reports the state to assistive tech.
 */
export default function Toggle({
  checked,
  onChange,
  label,
  description,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 py-3 text-left rounded-xl transition-colors hover:bg-white/5"
    >
      <span className="min-w-0">
        <span className="block text-body font-semibold">{label}</span>
        {description && (
          <span className="block text-caption text-foreground-muted mt-0.5">
            {description}
          </span>
        )}
      </span>

      <span
        aria-hidden="true"
        className={`relative shrink-0 w-14 h-8 rounded-full transition-colors duration-150 ${
          checked ? 'bg-primary' : 'bg-surface-light border border-white/10'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-150 ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}