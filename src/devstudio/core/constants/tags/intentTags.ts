export const INTENT_TAGS = [
  'generate', 'transform', 'analyze',
  'modify', 'manage', 'review', 'approved', 'rejected',
] as const;

export type IntentTag = typeof INTENT_TAGS[number];
