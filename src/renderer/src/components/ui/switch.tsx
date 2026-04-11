import { cn } from '../../utils/cn'

type SwitchPropsType = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

const Switch = ({ checked, onChange, disabled, label }: SwitchPropsType) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-150 cursor-pointer',
        checked ? 'bg-primary border-primary' : 'bg-border border-border',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150',
          checked ? 'translate-x-[17px]' : 'translate-x-[3px]'
        )}
      />
      {label && (
        <span className="ml-11 text-xs font-medium text-text-secondary whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  )
}

export default Switch
