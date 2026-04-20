export const DOMAIN_TAGS = [
  'scenario', 'ui', 'pm', 'ai',
  'schema', 'docs', 'archive', 'game', 'assets',
] as const;

export type DomainTag = typeof DOMAIN_TAGS[number];
