import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { CheckIcon } from 'lucide-react'
import type * as React from 'react'
import { cn } from '@/lib/utils'

function Checkbox({ className, ...props }: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'group/checkbox peer flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-transparent shadow-xs outline-none transition-shadow',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground',
        'aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:bg-input/30 dark:data-[checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="grid place-content-center text-current">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
