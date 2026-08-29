// Direction metadata for the Ba Zhai (Eight Mansions) directions card.
//
// The API returns compass directions as abbreviations ("NW"), and returns the
// four auspicious directions as keys on `kua_profile`. Everything the UI needs
// to render them — full labels, icons, English meanings, render order — lives
// here rather than inline in App.tsx.

import { MaterialCommunityIcons } from '@expo/vector-icons';

export type CompassIcon = keyof typeof MaterialCommunityIcons.glyphMap;

export interface CompassPoint {
  label: string;
  icon: CompassIcon;
}

// Arrows are NORTH-UP — the same convention as a compass or a printed feng shui
// chart, so NW points up-left. They are deliberately NOT relative to the user's
// facing direction. Please don't "correct" this to a facing-relative scheme.
export const COMPASS: Record<string, CompassPoint> = {
  N: { label: 'North', icon: 'arrow-up-thick' },
  NE: { label: 'Northeast', icon: 'arrow-top-right-thick' },
  E: { label: 'East', icon: 'arrow-right-thick' },
  SE: { label: 'Southeast', icon: 'arrow-bottom-right-thick' },
  S: { label: 'South', icon: 'arrow-down-thick' },
  SW: { label: 'Southwest', icon: 'arrow-bottom-left-thick' },
  W: { label: 'West', icon: 'arrow-left-thick' },
  NW: { label: 'Northwest', icon: 'arrow-top-left-thick' },
};

export interface AuspiciousDirection {
  key: 'sheng_qi' | 'tian_yi' | 'yan_nian' | 'fu_wei';
  tag: string;
  meaning: string;
}

// Render order is fixed by this array, not by object key order on kua_profile.
export const AUSPICIOUS_DIRECTIONS: AuspiciousDirection[] = [
  { key: 'sheng_qi', tag: 'SHENG QI · 生气', meaning: 'Wealth & Success' },
  { key: 'tian_yi', tag: 'TIAN YI · 天医', meaning: 'Health & Support' },
  { key: 'yan_nian', tag: 'YAN NIAN · 延年', meaning: 'Relationships' },
  { key: 'fu_wei', tag: 'FU WEI · 伏位', meaning: 'Personal Growth' },
];

// Falls back to the raw value with no icon if the API ever sends a direction
// outside the eight compass points, rather than rendering "undefined".
export function resolveCompass(value: string): { label: string; icon: CompassIcon | null } {
  return COMPASS[value] || { label: value, icon: null };
}
