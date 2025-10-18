/**
 * CSV utilities for importing and exporting relic data
 * Handles conversion between CSV format and relic objects
 */

import { NormalRelic, DepthRelic, RelicColor } from '../types/relicProperties';

// Parse CSV data into relic objects
export const parseNormalRelicFromCSV = (row: string[]): NormalRelic | undefined => {
  if (row.length < 4 || !row[0] || !row[1]) return undefined;
  
  const color = row[0].trim() as RelicColor;
  const effect1 = row[1].trim();
  const effect2 = row[2]?.trim() || undefined;
  const effect3 = row[3]?.trim() || undefined;
  
  // Validate color
  if (!['黄', '红', '绿', '蓝'].includes(color)) return undefined;
  
  return {
    color,
    effect1,
    effect2: effect2 || undefined,
    effect3: effect3 || undefined,
  };
};

export const parseDepthRelicFromCSV = (row: string[]): DepthRelic | undefined => {
  if (row.length < 2 || !row[0] || !row[1]) return undefined;
  
  const color = row[0].trim() as RelicColor;
  const positiveEffect1 = row[1].trim();
  const negativeEffect1 = row[2]?.trim() || undefined;
  const positiveEffect2 = row[3]?.trim() || undefined;
  const negativeEffect2 = row[4]?.trim() || undefined;
  const positiveEffect3 = row[5]?.trim() || undefined;
  const negativeEffect3 = row[6]?.trim() || undefined;
  
  // Validate color
  if (!['黄', '红', '绿', '蓝'].includes(color)) return undefined;
  
  return {
    color,
    positiveEffect1,
    negativeEffect1: negativeEffect1 || undefined,
    positiveEffect2: positiveEffect2 || undefined,
    negativeEffect2: negativeEffect2 || undefined,
    positiveEffect3: positiveEffect3 || undefined,
    negativeEffect3: negativeEffect3 || undefined,
  };
};

// Parse CSV text into relic arrays
export const parseNormalRelicsFromCSV = (csvText: string): NormalRelic[] => {
  if (!csvText.trim()) return [];
  
  const lines = csvText.trim().split('\n');
  const relics: NormalRelic[] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const row = line.split(',').map(cell => cell.trim());
    const relic = parseNormalRelicFromCSV(row);
    if (relic) {
      relics.push(relic);
    }
  }
  
  return relics;
};

export const parseDepthRelicsFromCSV = (csvText: string): DepthRelic[] => {
  if (!csvText.trim()) return [];
  
  const lines = csvText.trim().split('\n');
  const relics: DepthRelic[] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const row = line.split(',').map(cell => cell.trim());
    const relic = parseDepthRelicFromCSV(row);
    if (relic) {
      relics.push(relic);
    }
  }
  
  return relics;
};

// Convert relic objects to CSV text
export const normalRelicsToCSV = (relics: NormalRelic[]): string => {
  if (relics.length === 0) return '';
  
  return relics.map(relic => {
    const effects = [relic.effect1];
    if (relic.effect2) effects.push(relic.effect2);
    if (relic.effect3) effects.push(relic.effect3);
    
    return [relic.color, ...effects].join(',');
  }).join('\n');
};

export const depthRelicsToCSV = (relics: DepthRelic[]): string => {
  if (relics.length === 0) return '';
  
  return relics.map(relic => {
    const effects = [relic.positiveEffect1];
    if (relic.negativeEffect1) effects.push(relic.negativeEffect1);
    if (relic.positiveEffect2) effects.push(relic.positiveEffect2);
    if (relic.negativeEffect2) effects.push(relic.negativeEffect2);
    if (relic.positiveEffect3) effects.push(relic.positiveEffect3);
    if (relic.negativeEffect3) effects.push(relic.negativeEffect3);
    
    return [relic.color, ...effects].join(',');
  }).join('\n');
};

// Download CSV as file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Load CSV from file input
export const loadCSVFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
