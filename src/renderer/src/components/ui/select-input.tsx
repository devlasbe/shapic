import { cn } from '../../utils/cn'
import type { SelectHTMLAttributes } from 'react'

type SelectInputPropsType = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

const SelectInput = ({ label, className, children, ...props }: SelectInputPropsType) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-text-secondary">{label}</label>
      )}
      <select
        className={cn(
          'w-full px-2.5 py-1.5 text-sm bg-card border border-border rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'text-text-primary cursor-pointer transition-colors duration-150',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export default SelectInput
