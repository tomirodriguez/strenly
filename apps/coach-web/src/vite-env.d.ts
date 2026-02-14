/// <reference types="vite/client" />

// Allow CSS custom properties (--*) in React style objects
// Must be in a module (export {}) for proper augmentation
import 'react'

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined
  }
}
