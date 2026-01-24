'use client'

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { cn } from '@/lib/utils'

function TooltipProvider({ ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} />
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipPortal({ ...props }: TooltipPrimitive.Portal.Props) {
  return <TooltipPrimitive.Portal data-slot="tooltip-portal" {...props} />
}

function TooltipPositioner({ className, ...props }: TooltipPrimitive.Positioner.Props) {
  return <TooltipPrimitive.Positioner data-slot="tooltip-positioner" className={cn('z-50', className)} {...props} />
}

function TooltipContent({
  className,
  sideOffset = 4,
  side,
  align,
  children,
  ...props
}: TooltipPrimitive.Popup.Props & Pick<TooltipPrimitive.Positioner.Props, 'sideOffset' | 'side' | 'align'>) {
  return (
    <TooltipPortal>
      <TooltipPositioner sideOffset={sideOffset} side={side} align={align}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-xs shadow-md',
            'data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95',
            'animate-in data-closed:animate-out',
            className,
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPositioner>
    </TooltipPortal>
  )
}

function TooltipArrow({ className, ...props }: TooltipPrimitive.Arrow.Props) {
  return <TooltipPrimitive.Arrow data-slot="tooltip-arrow" className={cn('fill-primary', className)} {...props} />
}

export { Tooltip, TooltipArrow, TooltipContent, TooltipPortal, TooltipPositioner, TooltipProvider, TooltipTrigger }
