'use client'

import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { cn } from '@/lib/utils'

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverPortal({ ...props }: PopoverPrimitive.Portal.Props) {
  return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />
}

function PopoverBackdrop({ className, ...props }: PopoverPrimitive.Backdrop.Props) {
  return (
    <PopoverPrimitive.Backdrop
      data-slot="popover-backdrop"
      className={cn(
        'data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 duration-100 data-closed:animate-out data-open:animate-in',
        className,
      )}
      {...props}
    />
  )
}

function PopoverPositioner({ className, ...props }: PopoverPrimitive.Positioner.Props) {
  return <PopoverPrimitive.Positioner data-slot="popover-positioner" className={cn('z-50', className)} {...props} />
}

function PopoverContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: PopoverPrimitive.Popup.Props & { sideOffset?: number }) {
  return (
    <PopoverPortal>
      <PopoverPositioner sideOffset={sideOffset}>
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
            'data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95',
            'animate-in data-closed:animate-out',
            className,
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPositioner>
    </PopoverPortal>
  )
}

function PopoverArrow({ className, ...props }: PopoverPrimitive.Arrow.Props) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      className={cn('fill-popover [&>path]:stroke-2 [&>path]:stroke-border', className)}
      {...props}
    />
  )
}

function PopoverClose({ ...props }: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title data-slot="popover-title" className={cn('font-semibold text-sm', className)} {...props} />
  )
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverArrow,
  PopoverBackdrop,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverPortal,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
}
