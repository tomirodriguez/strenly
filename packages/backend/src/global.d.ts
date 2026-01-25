/**
 * Global type declarations for the backend package.
 * Extends the global namespace to include process.env.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_URL?: string
    }
  }
  const process: {
    env: NodeJS.ProcessEnv
  }
}

export {}
