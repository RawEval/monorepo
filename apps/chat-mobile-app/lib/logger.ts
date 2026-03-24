/**
 * Production-safe logger — only logs in __DEV__ mode.
 * Prevents leaking sensitive data in production builds.
 */

/* eslint-disable no-console */
const noop = () => {};

export const logger = {
  log: __DEV__ ? console.log : noop,
  warn: __DEV__ ? console.warn : noop,
  error: __DEV__ ? console.error : noop,
} as const;
