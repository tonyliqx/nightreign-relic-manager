/**
 * Relic Type Definitions
 * TypeScript types for relic data structures
 * Generated from: 黑夜君临 - 遗物词条.csv, relics.csv, depth_relics.csv
 */

// Color types
export type RelicColor = '黄' | '红' | '绿' | '蓝';
export type UniversalColor = '全';
export type SlotColor = RelicColor | UniversalColor;

// Effect types
export type NormalEffect = string;
export type DepthPositiveEffect = string;
export type DepthNegativeEffect = string;

// Nightfarer types
export type Nightfarer = '追踪者' | '守护者' | '铁眼' | '女爵' | '无赖' | '复仇者' | '隐士' | '执行者';

// Normal Relic Structure
export interface NormalRelic {
  color: RelicColor;
  effect1: NormalEffect;
  effect2?: NormalEffect;
  effect3?: NormalEffect;
}

// Depth Relic Structure
export interface DepthRelic {
  color: RelicColor;
  positiveEffect1: DepthPositiveEffect;
  negativeEffect1?: DepthNegativeEffect;
  positiveEffect2?: DepthPositiveEffect;
  negativeEffect2?: DepthNegativeEffect;
  positiveEffect3?: DepthPositiveEffect;
  negativeEffect3?: DepthNegativeEffect;
}

// Union type for all relics
export type Relic = NormalRelic | DepthRelic;

// Slot types
export interface Slot {
  id: string;
  color: SlotColor;
  slotType: 'normal' | 'depth';
  equippedRelic?: Relic;
}

// Vessel types
export interface Vessel {
  id: string;
  name: string;
  slots: Slot[];
}


// Type guards
export const isNormalRelic = (relic: Relic): relic is NormalRelic => {
  return 'effect1' in relic;
};

export const isDepthRelic = (relic: Relic): relic is DepthRelic => {
  return 'positiveEffect1' in relic;
};

export const isUniversalSlot = (slot: Slot): boolean => {
  return slot.color === '全';
};

export const canEquipRelic = (slot: Slot, relic: Relic): boolean => {
  // Check slot type compatibility
  if (slot.slotType === 'normal' && !isNormalRelic(relic)) return false;
  if (slot.slotType === 'depth' && !isDepthRelic(relic)) return false;
  
  // Check color compatibility
  if (isUniversalSlot(slot)) return true;
  if (isNormalRelic(relic)) {
    return slot.color === relic.color;
  }
  if (isDepthRelic(relic)) {
    return slot.color === relic.color;
  }
  
  return false;
};

// Relic collections
export interface RelicCollection {
  normalRelics: NormalRelic[];
  depthRelics: DepthRelic[];
}

// Property value collections (for validation and UI)
export interface RelicProperties {
  colors: RelicColor[];
  normalEffects: NormalEffect[];
  depthPositiveEffects: DepthPositiveEffect[];
  depthNegativeEffects: DepthNegativeEffect[];
}
