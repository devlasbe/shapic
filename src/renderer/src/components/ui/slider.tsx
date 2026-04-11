import { cn } from '../../utils/cn'

type SliderPropsType = {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  unit?: string
}

const Slider = ({ label, value, min = 1, max = 100, onChange, unit = '' }: SliderPropsType) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className="text-xs font-semibold text-text-primary tabular-nums">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'w-full h-1.5 rounded-full appearance-none cursor-pointer',
          'bg-border-light',
          '[&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
          '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-primary/30',
          '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150',
          '[&::-webkit-slider-thumb]:hover:scale-110'
        )}
      />
    </div>
  )
}

export default Slider
