import * as React from 'react'
import { cn } from '@/src/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath fill=\'%23677\' d=\'M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.12l3.71-2.89a.75.75 0 1 1 .92 1.18l-4.25 3.31a.75.75 0 0 1-.92 0L5.21 8.41a.75.75 0 0 1 .02-1.2Z\'/%3E%3C/svg%3E")] bg-[right_0.5rem_center] bg-no-repeat',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
})

Select.displayName = 'Select'

export { Select }
