export { DOMAIN_TAGS } from './domainTags';
export { INTENT_TAGS } from './intentTags';
export { PHASE_TAGS  } from './phaseTags';
export { STATUS_TAGS } from './statusTags';
export { SYSTEM_TAGS } from './systemTags';
export { ERROR_TAGS  } from './errorTags';

export type { DomainTag } from './domainTags';
export type { IntentTag } from './intentTags';
export type { PhaseTag  } from './phaseTags';
export type { StatusTag } from './statusTags';
export type { SystemTag } from './systemTags';
export type { ErrorTag  } from './errorTags';

import type { DomainTag } from './domainTags';
import type { IntentTag } from './intentTags';
import type { PhaseTag  } from './phaseTags';
import type { StatusTag } from './statusTags';
import type { SystemTag } from './systemTags';
import type { ErrorTag  } from './errorTags';

export type DevTag =
  | DomainTag
  | IntentTag
  | PhaseTag
  | StatusTag
  | SystemTag
  | ErrorTag;

// 全タグ配列（UIのタグピッカーなどで使用）
import { DOMAIN_TAGS } from './domainTags';
import { INTENT_TAGS } from './intentTags';
import { PHASE_TAGS  } from './phaseTags';
import { STATUS_TAGS } from './statusTags';
import { SYSTEM_TAGS } from './systemTags';
import { ERROR_TAGS  } from './errorTags';

export const ALL_TAGS = [
  ...DOMAIN_TAGS,
  ...INTENT_TAGS,
  ...PHASE_TAGS,
  ...STATUS_TAGS,
  ...SYSTEM_TAGS,
  ...ERROR_TAGS,
] as const satisfies readonly DevTag[];

export const TAG_GROUPS = {
  domain:  DOMAIN_TAGS,
  intent:  INTENT_TAGS,
  phase:   PHASE_TAGS,
  status:  STATUS_TAGS,
  system:  SYSTEM_TAGS,
  error:   ERROR_TAGS,
} as const;

export type TagGroup = keyof typeof TAG_GROUPS;
