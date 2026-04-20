export const STATUS_TAGS = [
  'pending', 'running', 'done', 'archived',
] as const;

export type StatusTag = typeof STATUS_TAGS[number];
