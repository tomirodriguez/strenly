/**
 * Structured logger for Railway.
 * Outputs JSON for machine-readable log aggregation.
 */
export const logger = {
  error(message: string, context?: Record<string, unknown>) {
    console.error(JSON.stringify({ level: 'error', message, ...context, timestamp: new Date().toISOString() }))
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(JSON.stringify({ level: 'warn', message, ...context, timestamp: new Date().toISOString() }))
  },
  info(message: string, context?: Record<string, unknown>) {
    console.info(JSON.stringify({ level: 'info', message, ...context, timestamp: new Date().toISOString() }))
  },
}
