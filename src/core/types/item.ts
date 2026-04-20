export type ItemCategoryId = 'consumable' | 'equipment' | 'key';
export type EquipSlot = 'weapon' | 'armor' | 'accessory';
export type Rarity = 1 | 2 | 3 | 4 | 5;

export interface Item {
  id: string;
  name: string;
  category: ItemCategoryId;
  icon?: string;
  iconTag?: string;
  tags: string[];
  rarity: Rarity;
  price: number;
  effect: string;
  description: string;
  equipSlot?: EquipSlot;
}

export interface ItemCategoryDef {
  id: string;
  label: string;
  icon?: string;
}

export interface ItemDB {
  categories: ItemCategoryDef[];
  items: Item[];
}

export type SkillDomain = 'combat' | 'utility';

export interface SkillEntry {
  id: string;
  name: string;
  domain: SkillDomain;
  category: string;
  element: string;
  target: string;
  cost_mp: number;
  cost_cooldown: number;
  power_base: number;
  power_scale: string;
  effects: string[];
  tags: string[];
  usableBy: string[];
  learnCondition: string;
  description: string;
  iconTag: string;
}

export interface SkillCategoryDef {
  id: string;
  domain: SkillDomain;
  color: string;
  description: string;
}

export interface SkillElementDef {
  id: string;
  color: string;
}

export interface SkillDB {
  skills: SkillEntry[];
  categories: SkillCategoryDef[];
  elements: SkillElementDef[];
  targets: { id: string; label: string }[];
}

export type CatalogTheme = 'fantasy' | 'scifi' | 'minimal';
export type CatalogLayout = 'compact' | 'default' | 'detailed';
