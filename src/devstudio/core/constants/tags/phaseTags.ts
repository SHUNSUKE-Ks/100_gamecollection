export const PHASE_TAGS = [
  'idea', 'design', 'implement',
  'test', 'release', 'phase-change',
] as const;

export type PhaseTag = typeof PHASE_TAGS[number];
