import type * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.ComponentProps<'span'> {
  size?: 'default' | 'sm' | 'lg'
}

function Avatar({ className, size = 'default', ...props }: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      data-size={size}
      className={cn(
        'group/avatar relative flex size-8 shrink-0 select-none overflow-hidden rounded-full data-[size=lg]:size-10 data-[size=sm]:size-6',
        className,
      )}
      {...props}
    />
  )
}

interface AvatarImageProps extends React.ComponentProps<'img'> {}

function AvatarImage({ className, alt = '', ...props }: AvatarImageProps) {
  return (
    <img
      data-slot="avatar-image"
      className={cn('aspect-square size-full rounded-full object-cover', className)}
      alt={alt}
      {...props}
    />
  )
}

interface AvatarFallbackProps extends React.ComponentProps<'span'> {}

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm group-data-[size=sm]/avatar:text-xs',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
