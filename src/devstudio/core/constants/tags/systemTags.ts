export const SYSTEM_TAGS = [
  'persist', 'undo', 'redo', 'sync', 'init', 'migration',
] as const;

export type SystemTag = typeof SYSTEM_TAGS[number];
