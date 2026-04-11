import { cn } from '../../utils/cn'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonPropsType = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

const Button = ({ variant = 'primary', size = 'md', className, children, ...props }: ButtonPropsType) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.98]',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2.5 text-sm',
        variant === 'primary' &&
          'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm shadow-primary/20',
        variant === 'secondary' &&
          'bg-card text-text-primary border border-border hover:border-primary/30 hover:bg-primary-light',
        variant === 'ghost' &&
          'text-text-secondary hover:text-text-primary hover:bg-black/[0.04]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
