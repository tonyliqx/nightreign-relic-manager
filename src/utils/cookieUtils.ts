/**
 * LocalStorage utilities for managing relics inventory
 * Handles persistence of user's relic collections in browser localStorage
 */

import { NormalRelic, DepthRelic, RelicCollection } from '../types/relicProperties';

const STORAGE_KEYS = {
  NORMAL_RELICS: 'nightreign_normal_relics',
  DEPTH_RELICS: 'nightreign_depth_relics',
} as const;

// LocalStorage utility functions
const setStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Relic collection management
export const saveNormalRelics = (relics: NormalRelic[]): void => {
  try {
    const jsonString = JSON.stringify(relics);
    setStorageItem(STORAGE_KEYS.NORMAL_RELICS, jsonString);
  } catch (error) {
    console.error('Error saving normal relics to localStorage:', error);
  }
};

export const saveDepthRelics = (relics: DepthRelic[]): void => {
  try {
    const jsonString = JSON.stringify(relics);
    setStorageItem(STORAGE_KEYS.DEPTH_RELICS, jsonString);
  } catch (error) {
    console.error('Error saving depth relics to localStorage:', error);
  }
};

export const loadNormalRelics = (): NormalRelic[] => {
  try {
    const storageValue = getStorageItem(STORAGE_KEYS.NORMAL_RELICS);
    if (!storageValue) return [];
    return JSON.parse(storageValue) as NormalRelic[];
  } catch (error) {
    console.error('Error loading normal relics from localStorage:', error);
    return [];
  }
};

export const loadDepthRelics = (): DepthRelic[] => {
  try {
    const storageValue = getStorageItem(STORAGE_KEYS.DEPTH_RELICS);
    if (!storageValue) return [];
    return JSON.parse(storageValue) as DepthRelic[];
  } catch (error) {
    console.error('Error loading depth relics from localStorage:', error);
    return [];
  }
};

export const loadRelicCollection = (): RelicCollection => {
  return {
    normalRelics: loadNormalRelics(),
    depthRelics: loadDepthRelics(),
  };
};

export const saveRelicCollection = (collection: RelicCollection): void => {
  saveNormalRelics(collection.normalRelics);
  saveDepthRelics(collection.depthRelics);
};

export const clearAllRelics = (): void => {
  removeStorageItem(STORAGE_KEYS.NORMAL_RELICS);
  removeStorageItem(STORAGE_KEYS.DEPTH_RELICS);
};

// Check if relics exist in localStorage
export const hasRelicsInStorage = (): boolean => {
  return getStorageItem(STORAGE_KEYS.NORMAL_RELICS) !== null || 
         getStorageItem(STORAGE_KEYS.DEPTH_RELICS) !== null;
};
