export const ERROR_TAGS = [
  'error', 'warn', 'retry', 'timeout',
] as const;

export type ErrorTag = typeof ERROR_TAGS[number];
