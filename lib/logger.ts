/* eslint-disable no-console */

export const logger = {
  info: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
};

export type Logger = typeof logger;
