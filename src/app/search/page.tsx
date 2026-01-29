'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Nightfarer, 
  Vessel, 
  Relic, 
  NormalRelic, 
  DepthRelic,
  RelicColor,
  isNormalRelic,
  isDepthRelic,
  canEquipRelic
} from '../../types/relicProperties';
import { 
  NIGHTFARERS, 
  NIGHTFARER_VESSELS, 
  NORMAL_EFFECTS,
  DEPTH_POSITIVE_EFFECTS, 
  DEPTH_NEGATIVE_EFFECTS
} from '../../data/relicPropertiesData';
import { loadRelicCollection, hasRelicsInStorage } from '../../utils/storageUtils';

interface SearchResult {
  vessel: Vessel;
  equippedRelics: Relic[];
  additionalPositiveEffects: string[];
  additionalNegativeEffects: string[];
  requiredEffectsFound: string[];
  avoidedEffectsFound: string[];
}

interface EffectRequirement {
  effect: string;
  count: number;
}

// Helper functions for URL parameter handling
const encodeEffect = (effect: string): string => {
  return encodeURIComponent(effect);
};

const decodeEffect = (encoded: string): string => {
  return decodeURIComponent(encoded);
};

const encodeEffectRequirement = (req: EffectRequirement): string => {
  return `${encodeEffect(req.effect)}:${req.count}`;
};

const decodeEffectRequirement = (encoded: string): EffectRequirement | null => {
  const parts = encoded.split(':');
  if (parts.length !== 2) return null;
  const effect = decodeEffect(parts[0]);
  const count = parseInt(parts[1], 10);
  if (isNaN(count) || count < 1) return null;
  return { effect, count };
};

const encodeEffectRequirements = (requirements: EffectRequirement[]): string => {
  return requirements.map(encodeEffectRequirement).join(',');
};

const decodeEffectRequirements = (encoded: string): EffectRequirement[] => {
  if (!encoded) return [];
  return encoded.split(',')
    .map(decodeEffectRequirement)
    .filter((req): req is EffectRequirement => req !== null);
};

const encodeEffects = (effects: string[]): string => {
  return effects.map(encodeEffect).join(',');
};

const decodeEffects = (encoded: string): string[] => {
  if (!encoded) return [];
  return encoded.split(',').map(decodeEffect).filter(effect => effect.length > 0);
};

// Function to load relics from user's inventory (localStorage) or fallback to CSV files
const loadRelicsData = async () => {
  try {
    // First try to load from user's inventory (localStorage)
    if (hasRelicsInStorage()) {
      const userRelics = loadRelicCollection();
      console.log('Loaded relics from user inventory:', {
        normalRelics: userRelics.normalRelics.length,
        depthRelics: userRelics.depthRelics.length
      });
      return userRelics;
    }
    
    // Fallback to loading from CSV files if no user inventory exists
    console.log('No user inventory found, loading from CSV files...');
    const normalResponse = await fetch('/relics.csv');
    const normalCSV = await normalResponse.text();
    
    const depthResponse = await fetch('/depth_relics.csv');
    const depthCSV = await depthResponse.text();
    
    return parseRelicsFromCSV(normalCSV, depthCSV);
  } catch (error) {
    console.error('Error loading relics data:', error);
    return { normalRelics: [], depthRelics: [] };
  }
};

// Parse CSV data into relic objects
const parseNormalRelicFromCSV = (row: string[]): NormalRelic | undefined => {
  if (row.length < 4 || !row[0] || !row[1]) return undefined;
  const color = row[0] as RelicColor;
  if (!['黄', '红', '绿', '蓝'].includes(color)) return undefined;
  return {
    color,
    effect1: row[1],
    effect2: row[2] || undefined,
    effect3: row[3] || undefined,
  };
};

const parseDepthRelicFromCSV = (row: string[]): DepthRelic | undefined => {
  if (row.length < 7 || !row[0] || !row[1]) return undefined;
  const color = row[0] as RelicColor;
  if (!['黄', '红', '绿', '蓝'].includes(color)) return undefined;
  return {
    color,
    positiveEffect1: row[1],
    negativeEffect1: row[2] || undefined,
    positiveEffect2: row[3] || undefined,
    negativeEffect2: row[4] || undefined,
    positiveEffect3: row[5] || undefined,
    negativeEffect3: row[6] || undefined,
  };
};

// Helper function to parse CSV line properly handling commas within quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    // Handle different types of quotation marks
    if ((char === '"' || char === '"' || char === '"') && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
      current += char; // Include the opening quote
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
      current += char; // Include the closing quote
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  // Convert English quotes to Chinese quotes to match our constants
  return result.map(field => {
    return field.replace(/"/g, '"').replace(/"/g, '"');
  });
};

// Parse the CSV data
const parseRelicsFromCSV = (normalRelicsCSV: string, depthRelicsCSV: string) => {
  const normalRelics: NormalRelic[] = [];
  const depthRelics: DepthRelic[] = [];

          // Parse normal relics CSV - skip the mixed header/data row
          const normalLines = normalRelicsCSV.split('\n').slice(1); // Skip first line (mixed header/data)
          normalLines.forEach((line) => {
            if (line.trim()) { // Skip empty lines
              const row = parseCSVLine(line);
              // Only take the first 4 columns for normal relics (color, effect1, effect2, effect3)
              const trimmedRow = row.slice(0, 4);
              const relic = parseNormalRelicFromCSV(trimmedRow);
              if (relic) {
                normalRelics.push(relic);
              }
            }
          });

  // Parse depth relics CSV - skip the mixed header/data row
  const depthLines = depthRelicsCSV.split('\n').slice(1); // Skip first line (mixed header/data)
  depthLines.forEach(line => {
    if (line.trim()) { // Skip empty lines
      const row = parseCSVLine(line);
      // Only take the first 7 columns for depth relics (color, pos1, neg1, pos2, neg2, pos3, neg3)
      const trimmedRow = row.slice(0, 7);
      const relic = parseDepthRelicFromCSV(trimmedRow);
      if (relic) depthRelics.push(relic);
    }
  });

  return { normalRelics, depthRelics };
};

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedNightfarer, setSelectedNightfarer] = useState<Nightfarer>('追踪者');
  const [requiredEffects, setRequiredEffects] = useState<EffectRequirement[]>([]);
  const [avoidedEffects, setAvoidedEffects] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0, combinationsChecked: 0 });
  const [relicsData, setRelicsData] = useState<{ normalRelics: NormalRelic[], depthRelics: DepthRelic[] }>({ normalRelics: [], depthRelics: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  
  // Auto-suggest states
  const [requiredInput, setRequiredInput] = useState('');
  const [avoidedInput, setAvoidedInput] = useState('');
  const [showRequiredSuggestions, setShowRequiredSuggestions] = useState(false);
  const [showAvoidedSuggestions, setShowAvoidedSuggestions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Additional effects view state
  const [showAdditionalEffects, setShowAdditionalEffects] = useState(false);

  // Refresh relics data
  const refreshRelicsData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Initialize state from URL parameters
  useEffect(() => {
    const nightfarerParam = searchParams.get('nightfarer');
    const requiredParam = searchParams.get('required');
    const avoidedParam = searchParams.get('avoided');
    
    if (nightfarerParam && NIGHTFARERS.includes(nightfarerParam as Nightfarer)) {
      setSelectedNightfarer(nightfarerParam as Nightfarer);
    }
    
    if (requiredParam) {
      const decoded = decodeEffectRequirements(requiredParam);
      setRequiredEffects(decoded);
    }
    
    if (avoidedParam) {
      const decoded = decodeEffects(avoidedParam);
      setAvoidedEffects(decoded);
    }
  }, [searchParams]);

  // Update URL parameters when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedNightfarer !== '追踪者') {
      params.set('nightfarer', selectedNightfarer);
    }
    
    if (requiredEffects.length > 0) {
      params.set('required', encodeEffectRequirements(requiredEffects));
    }
    
    if (avoidedEffects.length > 0) {
      params.set('avoided', encodeEffects(avoidedEffects));
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/search?${queryString}` : '/search';
    router.replace(newUrl, { scroll: false });
  }, [selectedNightfarer, requiredEffects, avoidedEffects, router]);

  // Load relics data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await loadRelicsData();
        setRelicsData(data);
        console.log('Loaded relics data:', {
          normalRelics: data.normalRelics.length,
          depthRelics: data.depthRelics.length
        });
        
        
      } catch (error) {
        console.error('Failed to load relics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [refreshKey]);

  // Removed unused toggle functions - using suggestion select instead

  // Auto-suggest helper functions
  const getFilteredSuggestions = (input: string, type: 'required' | 'avoided') => {
    // Use the constants as the source of truth for all possible effects
    const allEffects = type === 'required' 
      ? DEPTH_POSITIVE_EFFECTS 
      : [...DEPTH_POSITIVE_EFFECTS, ...DEPTH_NEGATIVE_EFFECTS]; // Allow any effect in avoid list
    const selectedEffects = type === 'required' 
      ? requiredEffects.map(req => req.effect) 
      : avoidedEffects;
    
    return allEffects
      .filter(effect => 
        effect.toLowerCase().includes(input.toLowerCase()) && 
        !selectedEffects.includes(effect)
      );
  };

  const handleRequiredInputChange = (value: string) => {
    setRequiredInput(value);
    setShowRequiredSuggestions(value.length > 0);
  };

  const handleAvoidedInputChange = (value: string) => {
    setAvoidedInput(value);
    setShowAvoidedSuggestions(value.length > 0);
  };

  const handleRequiredSuggestionSelect = (effect: string) => {
    const existingIndex = requiredEffects.findIndex(req => req.effect === effect);
    if (existingIndex >= 0) {
      // If effect already exists, increment count
      setRequiredEffects(prev => prev.map((req, index) => 
        index === existingIndex 
          ? { ...req, count: req.count + 1 }
          : req
      ));
    } else {
      // If effect doesn't exist, add it with count 1
      setRequiredEffects(prev => [...prev, { effect, count: 1 }]);
    }
    setRequiredInput('');
    setShowRequiredSuggestions(false);
  };

  const handleAvoidedSuggestionSelect = (effect: string) => {
    if (!avoidedEffects.includes(effect)) {
      setAvoidedEffects(prev => [...prev, effect]);
    }
    setAvoidedInput('');
    setShowAvoidedSuggestions(false);
  };

  const handleRequiredEffectRemove = (effect: string) => {
    setRequiredEffects(prev => prev.filter(req => req.effect !== effect));
  };

  const handleRequiredEffectCountChange = (effect: string, newCount: number) => {
    if (newCount <= 0) {
      handleRequiredEffectRemove(effect);
    } else {
      setRequiredEffects(prev => prev.map(req => 
        req.effect === effect 
          ? { ...req, count: newCount }
          : req
      ));
    }
  };

  const handleAvoidedEffectRemove = (effect: string) => {
    setAvoidedEffects(prev => prev.filter(e => e !== effect));
  };

  const handleRequiredKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && requiredInput.trim()) {
      const suggestions = getFilteredSuggestions(requiredInput, 'required');
      if (suggestions.length > 0) {
        handleRequiredSuggestionSelect(suggestions[0]);
      }
    }
  };

  const handleAvoidedKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && avoidedInput.trim()) {
      const suggestions = getFilteredSuggestions(avoidedInput, 'avoided');
      if (suggestions.length > 0) {
        handleAvoidedSuggestionSelect(suggestions[0]);
      }
    }
  };

  const toggleResultExpansion = (index: number) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Additional effects functionality
  const getAllAdditionalEffects = () => {
    const allAdditionalEffects = new Set<string>();
    
    searchResults.forEach(result => {
      result.additionalPositiveEffects.forEach(effect => allAdditionalEffects.add(effect));
      result.additionalNegativeEffects.forEach(effect => allAdditionalEffects.add(effect));
    });
    
    return Array.from(allAdditionalEffects).sort();
  };

  const isNegativeEffect = (effect: string) => {
    return DEPTH_NEGATIVE_EFFECTS.includes(effect);
  };

  const handleAdditionalEffectClick = (effect: string) => {
    if (isNegativeEffect(effect)) {
      // Add to avoid list
      if (!avoidedEffects.includes(effect)) {
        setAvoidedEffects(prev => [...prev, effect]);
      }
    } else {
      // Add to required list
      const existingReq = requiredEffects.find(req => req.effect === effect);
      if (existingReq) {
        setRequiredEffects(prev => 
          prev.map(req => 
            req.effect === effect 
              ? { ...req, count: req.count + 1 }
              : req
          )
        );
      } else {
        setRequiredEffects(prev => [...prev, { effect, count: 1 }]);
      }
    }
  };

  const generateAllPossibleRelics = (): Relic[] => {
    return [...relicsData.normalRelics, ...relicsData.depthRelics];
  };

  // Build reverse lookup tables for efficient effect searching
  const buildReverseLookup = (relics: Relic[]) => {
    const effectToRelics: Record<string, Relic[]> = {};
    
    relics.forEach(relic => {
      const effects: string[] = [];
      
      if (isNormalRelic(relic)) {
        if (relic.effect1) effects.push(relic.effect1);
        if (relic.effect2) effects.push(relic.effect2);
        if (relic.effect3) effects.push(relic.effect3);
      } else {
        if (relic.positiveEffect1) effects.push(relic.positiveEffect1);
        if (relic.negativeEffect1) effects.push(relic.negativeEffect1);
        if (relic.positiveEffect2) effects.push(relic.positiveEffect2);
        if (relic.negativeEffect2) effects.push(relic.negativeEffect2);
        if (relic.positiveEffect3) effects.push(relic.positiveEffect3);
        if (relic.negativeEffect3) effects.push(relic.negativeEffect3);
      }
      
      effects.forEach(effect => {
        if (!effectToRelics[effect]) {
          effectToRelics[effect] = [];
        }
        effectToRelics[effect].push(relic);
      });
    });
    
    return effectToRelics;
  };

  // Helper function to create a canonical key for a set of relics (for deduplication)
  const createRelicKey = (relic: Relic): string => {
    if (isNormalRelic(relic)) {
      return `normal:${relic.color}:${relic.effect1}:${relic.effect2 || ''}:${relic.effect3 || ''}`;
    } else {
      return `depth:${relic.color}:${relic.positiveEffect1}:${relic.negativeEffect1 || ''}:${relic.positiveEffect2 || ''}:${relic.negativeEffect2 || ''}:${relic.positiveEffect3 || ''}:${relic.negativeEffect3 || ''}`;
    }
  };

  // Helper function to create a canonical key for a build (sorted relic keys)
  const createBuildKey = (relics: Relic[]): string => {
    return relics.map(createRelicKey).sort().join('|');
  };

  // Helper function to yield control to browser
  const yieldToBrowser = (): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 0));
  };

  const searchForBuilds = async () => {
    setIsSearching(true);
    setSearchProgress({ current: 0, total: 0, combinationsChecked: 0 });
    
    const vessels = NIGHTFARER_VESSELS[selectedNightfarer];
    const firstVessel = vessels[0];
    if (!firstVessel) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Quick feasibility checks (no pruning, just impossible cases)
    const normalSlots = firstVessel.slots.filter(slot => slot.slotType === 'normal').length;
    const depthSlots = firstVessel.slots.filter(slot => slot.slotType === 'depth').length;
    const totalSlots = normalSlots + depthSlots;
    const totalRequiredCount = requiredEffects.reduce((sum, req) => sum + req.count, 0);

    // Upper bound: each relic can contribute up to 3 positive effects
    const maxPositiveEffects = totalSlots * 3;
    if (totalRequiredCount > maxPositiveEffects) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Depth-only effects are those not present in normal effects
    const depthOnlyRequiredCount = requiredEffects
      .filter(req => !NORMAL_EFFECTS.includes(req.effect))
      .reduce((sum, req) => sum + req.count, 0);
    const maxDepthOnlyEffects = depthSlots * 3;
    if (depthOnlyRequiredCount > maxDepthOnlyEffects) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const allRelics = generateAllPossibleRelics();
    const results: SearchResult[] = [];
    const seenBuilds = new Set<string>(); // For deduplication
    const MAX_RESULTS = 100;

    // Build reverse lookup tables
    const effectToRelics = buildReverseLookup(allRelics);
    
    // Find candidate relics for required effects
    const candidateRelics = new Set<Relic>();
    
    // Add relics that have required effects
    requiredEffects.forEach(req => {
      const relicsWithEffect = effectToRelics[req.effect] || [];
      relicsWithEffect.forEach(relic => candidateRelics.add(relic));
    });
    
    // If no required effects, use all relics
    if (requiredEffects.length === 0) {
      allRelics.forEach(relic => candidateRelics.add(relic));
    }

    // Filter out relics that have avoided effects
    const finalCandidates = Array.from(candidateRelics).filter(relic => {
      const relicEffects = isNormalRelic(relic) 
        ? [relic.effect1, relic.effect2, relic.effect3].filter((e): e is string => Boolean(e))
        : [
            relic.positiveEffect1, relic.negativeEffect1,
            relic.positiveEffect2, relic.negativeEffect2,
            relic.positiveEffect3, relic.negativeEffect3
          ].filter((e): e is string => Boolean(e));
      
      return !avoidedEffects.some(avoided => relicEffects.includes(avoided));
    });

    // Pre-compute positive/negative effect sets for categorization
    const allPositiveEffects = new Set<string>();
    const allNegativeEffects = new Set<string>();
    
    relicsData.depthRelics.forEach(relic => {
      if (relic.positiveEffect1) allPositiveEffects.add(relic.positiveEffect1);
      if (relic.positiveEffect2) allPositiveEffects.add(relic.positiveEffect2);
      if (relic.positiveEffect3) allPositiveEffects.add(relic.positiveEffect3);
      if (relic.negativeEffect1) allNegativeEffects.add(relic.negativeEffect1);
      if (relic.negativeEffect2) allNegativeEffects.add(relic.negativeEffect2);
      if (relic.negativeEffect3) allNegativeEffects.add(relic.negativeEffect3);
    });
    
    relicsData.normalRelics.forEach(relic => {
      if (relic.effect1) allPositiveEffects.add(relic.effect1);
      if (relic.effect2) allPositiveEffects.add(relic.effect2);
      if (relic.effect3) allPositiveEffects.add(relic.effect3);
    });

    const totalVessels = vessels.length;
    let totalCombinationsChecked = 0;
    const YIELD_INTERVAL = 50000; // Yield every N combinations to keep UI responsive (much less frequent)

    console.log(`Searching across ${totalVessels} vessels`);
    console.log(`Filtered to ${finalCandidates.length} candidate relics (from ${allRelics.length} total)`);
    console.log(`Required effects: ${requiredEffects.map(r => `${r.effect} (x${r.count})`).join(', ')}`);
    console.log(`Avoided effects: ${avoidedEffects.join(', ')}`);

    const requiredEffectIndex = new Map<string, number>();
    requiredEffects.forEach((req, index) => {
      requiredEffectIndex.set(req.effect, index);
    });
    const requiredCounts = requiredEffects.map(req => req.count);
    const requiredTotal = requiredCounts.reduce((sum, count) => sum + count, 0);

    const normalRelicEffects = new Set<string>();
    relicsData.normalRelics.forEach(relic => {
      if (relic.effect1) normalRelicEffects.add(relic.effect1);
      if (relic.effect2) normalRelicEffects.add(relic.effect2);
      if (relic.effect3) normalRelicEffects.add(relic.effect3);
    });
    const depthOnlyRequiredMask = requiredEffects.map(req => !normalRelicEffects.has(req.effect));

    const relicRequiredCountsCache = new Map<Relic, number[]>();
    const getRelicRequiredCounts = (relic: Relic): number[] => {
      const cached = relicRequiredCountsCache.get(relic);
      if (cached) return cached;
      const counts = new Array(requiredEffects.length).fill(0);
      const relicEffects = isNormalRelic(relic)
        ? [relic.effect1, relic.effect2, relic.effect3].filter((e): e is string => Boolean(e))
        : [
            relic.positiveEffect1, relic.negativeEffect1,
            relic.positiveEffect2, relic.negativeEffect2,
            relic.positiveEffect3, relic.negativeEffect3
          ].filter((e): e is string => Boolean(e));
      relicEffects.forEach(effect => {
        const index = requiredEffectIndex.get(effect);
        if (index !== undefined) counts[index] += 1;
      });
      relicRequiredCountsCache.set(relic, counts);
      return counts;
    };

    const getRemainingCounts = (currentCounts: number[]) => {
      let remainingTotal = 0;
      let remainingDepthOnly = 0;
      for (let i = 0; i < requiredCounts.length; i++) {
        const remaining = Math.max(0, requiredCounts[i] - currentCounts[i]);
        remainingTotal += remaining;
        if (depthOnlyRequiredMask[i]) {
          remainingDepthOnly += remaining;
        }
      }
      return { remainingTotal, remainingDepthOnly };
    };

    // Optimized search with pre-filtered candidates and deduplication
    for (let vesselIndex = 0; vesselIndex < vessels.length && results.length < MAX_RESULTS; vesselIndex++) {
      const vessel = vessels[vesselIndex];
      
      // Update progress based on vessel completion
      setSearchProgress({ 
        current: vesselIndex, 
        total: totalVessels,
        combinationsChecked: totalCombinationsChecked
      });
      
      const slotCandidates = vessel.slots
        .map(slot => ({
          slot,
          candidates: finalCandidates.filter((relic): relic is Relic => {
            // Check slot type compatibility
            if (slot.slotType === 'normal' && !isNormalRelic(relic)) return false;
            if (slot.slotType === 'depth' && !isDepthRelic(relic)) return false;
            // Check color compatibility
            if (!canEquipRelic(slot, relic)) return false;
            return true;
          })
        }))
        // Smallest candidate list first to reduce branching
        .sort((a, b) => a.candidates.length - b.candidates.length);

      const remainingDepthSlotsFromIndex = new Array(slotCandidates.length + 1).fill(0);
      for (let i = slotCandidates.length - 1; i >= 0; i--) {
        remainingDepthSlotsFromIndex[i] = remainingDepthSlotsFromIndex[i + 1] +
          (slotCandidates[i].slot.slotType === 'depth' ? 1 : 0);
      }

      const tryRelicCombination = async (
        currentIndex: number,
        currentRelics: Relic[],
        currentCounts: number[]
      ) => {
        if (results.length >= MAX_RESULTS) return;
        
        // Yield to browser periodically to prevent blocking (much less frequent)
        totalCombinationsChecked++;
        if (totalCombinationsChecked % YIELD_INTERVAL === 0) {
          setSearchProgress({ 
            current: vesselIndex, 
            total: totalVessels,
            combinationsChecked: totalCombinationsChecked
          });
          await yieldToBrowser();
        }
        
        const remainingSlots = slotCandidates.length - currentIndex;
        if (requiredTotal > 0) {
          const { remainingTotal, remainingDepthOnly } = getRemainingCounts(currentCounts);
          if (remainingTotal > remainingSlots * 3) return;
          const remainingDepthSlots = remainingDepthSlotsFromIndex[currentIndex];
          if (remainingDepthOnly > remainingDepthSlots * 3) return;
        }

        if (currentIndex >= slotCandidates.length) {
          // Create canonical key for this build to check for duplicates
          const buildKey = createBuildKey(currentRelics);
          if (seenBuilds.has(buildKey)) {
            return; // Skip duplicate
          }
          seenBuilds.add(buildKey);
          
          // Check if this combination meets the requirements
          const allEffects = currentRelics.flatMap(relic => {
            if (isNormalRelic(relic)) {
              return [relic.effect1, relic.effect2, relic.effect3].filter((e): e is string => Boolean(e));
            } else {
              return [
                relic.positiveEffect1, relic.negativeEffect1,
                relic.positiveEffect2, relic.negativeEffect2,
                relic.positiveEffect3, relic.negativeEffect3
              ].filter((e): e is string => Boolean(e));
            }
          });

          // Count occurrences of each effect
          const effectCounts: Record<string, number> = {};
          allEffects.forEach(effect => {
            effectCounts[effect] = (effectCounts[effect] || 0) + 1;
          });

          // Check if all required effects are found with correct counts
          const requiredEffectsFound = requiredEffects.filter(req => {
            const count = effectCounts[req.effect] || 0;
            return count >= req.count;
          });
          const avoidedEffectsFound = avoidedEffects.filter(avoid => 
            allEffects.includes(avoid)
          );

          // Check if all required effects are found with correct counts and no avoided effects are present
          const meetsRequirements = requiredEffects.length === 0 || 
            requiredEffects.every(req => {
              const count = effectCounts[req.effect] || 0;
              return count >= req.count;
            });
          const avoidsUnwanted = avoidedEffects.length === 0 || 
            !avoidedEffects.some(avoid => allEffects.includes(avoid));

          if (meetsRequirements && avoidsUnwanted) {
            const positiveEffects = allEffects.filter(effect => 
              allPositiveEffects.has(effect)
            );
            const negativeEffects = allEffects.filter(effect => 
              allNegativeEffects.has(effect)
            );
            
            const requiredEffectNames = requiredEffects.map(req => req.effect);
            const additionalPositiveEffects = positiveEffects.filter(effect => 
              !requiredEffectNames.includes(effect)
            );
            const additionalNegativeEffects = negativeEffects.filter(effect => 
              !avoidedEffects.includes(effect)
            );

            results.push({
              vessel,
              equippedRelics: [...currentRelics],
              additionalPositiveEffects,
              additionalNegativeEffects,
              requiredEffectsFound: requiredEffectsFound.map(req => req.effect),
              avoidedEffectsFound
            });
          }
          return;
        }

        const { slot, candidates } = slotCandidates[currentIndex];
        const compatibleRelics = candidates.filter(relic => {
          // Check if relic is already used in this build
          return !currentRelics.some(existingRelic => 
            existingRelic === relic || 
            (isNormalRelic(existingRelic) && isNormalRelic(relic) && 
             existingRelic.color === relic.color && 
             existingRelic.effect1 === relic.effect1 && 
             existingRelic.effect2 === relic.effect2 && 
             existingRelic.effect3 === relic.effect3) ||
            (isDepthRelic(existingRelic) && isDepthRelic(relic) && 
             existingRelic.color === relic.color && 
             existingRelic.positiveEffect1 === relic.positiveEffect1 && 
             existingRelic.negativeEffect1 === relic.negativeEffect1 && 
             existingRelic.positiveEffect2 === relic.positiveEffect2 && 
             existingRelic.negativeEffect2 === relic.negativeEffect2 && 
             existingRelic.positiveEffect3 === relic.positiveEffect3 && 
             existingRelic.negativeEffect3 === relic.negativeEffect3)
          );
        });
        
        // Try each compatible relic
        for (const relic of compatibleRelics) {
          if (results.length >= MAX_RESULTS) return;
          const newRelics = [...currentRelics, relic];
          let newCounts = currentCounts;
          if (requiredTotal > 0) {
            const relicCounts = getRelicRequiredCounts(relic);
            newCounts = currentCounts.map((count, index) => count + relicCounts[index]);
          }
          await tryRelicCombination(currentIndex + 1, newRelics, newCounts);
        }

        // Also try with no relic in this slot
        await tryRelicCombination(currentIndex + 1, currentRelics, currentCounts);
      };

      await tryRelicCombination(0, [], new Array(requiredEffects.length).fill(0));
    }

    setSearchResults(results.slice(0, MAX_RESULTS));
    setSearchProgress({ current: totalVessels, total: totalVessels, combinationsChecked: totalCombinationsChecked });
    setIsSearching(false);
    
    console.log(`Search completed: ${results.length} results found after checking ${totalCombinationsChecked.toLocaleString()} combinations`);
    console.log(`Unique builds checked: ${seenBuilds.size}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚡</div>
          <div className="text-2xl text-white mb-2">加载遗物数据中...</div>
          <div className="text-lg text-white/70">请稍候</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-center items-center gap-4 mb-8">
          <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            遗物配装搜索
          </h1>
          <button
            onClick={refreshRelicsData}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
            title="Refresh relics data from your inventory"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {/* Search Controls */}
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl mb-8 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Nightfarer Selector */}
            <div>
              <label className="block text-xl font-bold mb-4 text-white">选择渡夜者</label>
              <select 
                value={selectedNightfarer} 
                onChange={(e) => setSelectedNightfarer(e.target.value as Nightfarer)}
                className="w-full p-4 border-2 border-white/30 rounded-xl text-lg bg-white/10 text-white placeholder-white/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all backdrop-blur-sm"
              >
                {NIGHTFARERS.map(nightfarer => (
                  <option key={nightfarer} value={nightfarer} className="bg-slate-800 text-white">{nightfarer}</option>
                ))}
              </select>
            </div>

            {/* Required Effects */}
            <div>
              <label className="block text-xl font-bold mb-4 text-white">需要效果</label>
              <div className="space-y-3">
                {/* Input with auto-suggest */}
                <div className="relative">
                  <input
                    type="text"
                    value={requiredInput}
                    onChange={(e) => handleRequiredInputChange(e.target.value)}
                    onKeyPress={handleRequiredKeyPress}
                    onFocus={() => setShowRequiredSuggestions(requiredInput.length > 0)}
                    onBlur={() => setTimeout(() => setShowRequiredSuggestions(false), 200)}
                    placeholder="输入需要的效果..."
                    className="w-full p-4 border-2 border-white/30 rounded-xl text-lg bg-white/10 text-white placeholder-white/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all backdrop-blur-sm"
                  />
                  {showRequiredSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 max-h-64 overflow-y-auto">
                      {getFilteredSuggestions(requiredInput, 'required').map((effect, index) => (
                        <button
                          key={`${effect}-${index}`}
                          onClick={() => handleRequiredSuggestionSelect(effect)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-100 text-slate-800 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          {effect}
                        </button>
                      ))}
                      {getFilteredSuggestions(requiredInput, 'required').length === 0 && (
                        <div className="px-4 py-3 text-slate-500 text-sm">没有找到匹配的效果</div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Selected effects as chips */}
                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border-2 border-white/30 rounded-xl bg-white/5">
                  {requiredEffects.map((req, index) => (
                    <div
                      key={`${req.effect}-${index}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-200 rounded-full border border-blue-400/30"
                    >
                      <span className="text-sm">{req.effect}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRequiredEffectCountChange(req.effect, req.count - 1)}
                          className="text-blue-300 hover:text-blue-100 transition-colors text-xs px-1"
                          disabled={req.count <= 1}
                        >
                          −
                        </button>
                        <span className="text-xs font-bold px-1 min-w-[20px] text-center">{req.count}</span>
                        <button
                          onClick={() => handleRequiredEffectCountChange(req.effect, req.count + 1)}
                          className="text-blue-300 hover:text-blue-100 transition-colors text-xs px-1"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRequiredEffectRemove(req.effect)}
                        className="text-blue-300 hover:text-blue-100 transition-colors ml-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {requiredEffects.length === 0 && (
                    <span className="text-white/50 text-sm">还没有选择需要的效果</span>
                  )}
                </div>
              </div>
            </div>

            {/* Effects to Avoid */}
            <div>
              <label className="block text-xl font-bold mb-4 text-white">避免效果</label>
              <div className="space-y-3">
                {/* Input with auto-suggest */}
                <div className="relative">
                  <input
                    type="text"
                    value={avoidedInput}
                    onChange={(e) => handleAvoidedInputChange(e.target.value)}
                    onKeyPress={handleAvoidedKeyPress}
                    onFocus={() => setShowAvoidedSuggestions(avoidedInput.length > 0)}
                    onBlur={() => setTimeout(() => setShowAvoidedSuggestions(false), 200)}
                    placeholder="输入要避免的效果..."
                    className="w-full p-4 border-2 border-white/30 rounded-xl text-lg bg-white/10 text-white placeholder-white/70 focus:border-red-400 focus:ring-2 focus:ring-red-400/50 transition-all backdrop-blur-sm"
                  />
                  {showAvoidedSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 max-h-64 overflow-y-auto">
                      {getFilteredSuggestions(avoidedInput, 'avoided').map((effect, index) => (
                        <button
                          key={`${effect}-${index}`}
                          onClick={() => handleAvoidedSuggestionSelect(effect)}
                          className="w-full text-left px-4 py-3 hover:bg-red-100 text-slate-800 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          {effect}
                        </button>
                      ))}
                      {getFilteredSuggestions(avoidedInput, 'avoided').length === 0 && (
                        <div className="px-4 py-3 text-slate-500 text-sm">没有找到匹配的效果</div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Selected effects as chips */}
                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border-2 border-white/30 rounded-xl bg-white/5">
                  {avoidedEffects.map((effect, index) => (
                    <div
                      key={`${effect}-${index}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-200 rounded-full border border-red-400/30"
                    >
                      <span className="text-sm">{effect}</span>
                      <button
                        onClick={() => handleAvoidedEffectRemove(effect)}
                        className="text-red-300 hover:text-red-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {avoidedEffects.length === 0 && (
                    <span className="text-white/50 text-sm">还没有选择要避免的效果</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center space-y-4">
            <button
              onClick={searchForBuilds}
              disabled={isSearching}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-12 py-4 rounded-xl font-bold text-xl transition-all shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 disabled:transform-none disabled:scale-100"
            >
              {isSearching ? '搜索中...' : '开始搜索'}
            </button>
            
            
            {isSearching && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-sm text-white/80 mb-2">
                  <span>搜索进度</span>
                  <span>{searchProgress.total > 0 ? Math.round((searchProgress.current / searchProgress.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${searchProgress.total > 0 ? (searchProgress.current / searchProgress.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white/60 mt-1 text-center space-y-1">
                  <div>已搜索 {searchProgress.current} / {searchProgress.total} 个容器</div>
                  {searchProgress.combinationsChecked > 0 && (
                    <div>已检查 {searchProgress.combinationsChecked.toLocaleString()} 种组合</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Source Indicator */}
        <div className="bg-white/5 backdrop-blur-lg p-4 rounded-xl mb-6 border border-white/10">
          <div className="flex items-center justify-between text-sm text-white/70">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {hasRelicsInStorage() 
                  ? `Using your personal relic inventory (${relicsData.normalRelics.length} normal, ${relicsData.depthRelics.length} depth relics)`
                  : `Using default CSV data (${relicsData.normalRelics.length} normal, ${relicsData.depthRelics.length} depth relics)`
                }
              </span>
            </div>
            <a 
              href="/my-relics" 
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              Manage Inventory
            </a>
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">搜索结果 ({searchResults.length})</h2>
            
            {/* View Additional Effects Button */}
            {searchResults.length > 0 && (
              <button
                onClick={() => setShowAdditionalEffects(!showAdditionalEffects)}
                className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-xl font-semibold transition-all backdrop-blur-sm hover:scale-105"
              >
                {showAdditionalEffects ? '隐藏额外效果' : '查看额外效果'}
              </button>
            )}
          </div>
          
          {/* Additional Effects Section */}
          {showAdditionalEffects && searchResults.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl shadow-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4">所有额外效果</h3>
              <div className="flex flex-wrap gap-3">
                {getAllAdditionalEffects().map((effect, index) => {
                  const isNegative = isNegativeEffect(effect);
                  return (
                    <button
                      key={`additional-${index}`}
                      onClick={() => handleAdditionalEffectClick(effect)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                        isNegative
                          ? 'bg-red-500/20 text-red-200 border border-red-400/30 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-200 border border-green-400/30 hover:bg-green-500/30'
                      }`}
                    >
                      {isNegative ? '−' : '+'} {effect}
                    </button>
                  );
                })}
              </div>
              <p className="text-white/60 text-sm mt-4">
                点击效果可添加到{' '}
                <span className="text-green-400">必需效果</span>
                {' '}或{' '}
                <span className="text-red-400">避免效果</span>
                {' '}列表中
              </p>
            </div>
          )}
          
          {searchResults.map((result, index) => {
            const isExpanded = expandedResults.has(index);
            
            return (
              <div key={index} className="bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl shadow-2xl hover:shadow-white/10 transition-all">
                        {/* Collapsed View - Always Visible */}
                        <div 
                          className="p-6 cursor-pointer hover:bg-white/5 transition-all"
                          onClick={() => toggleResultExpansion(index)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-white mb-4">
                                {result.vessel.name} (配装 #{index + 1})
                              </h3>
                              
                              {/* Extra Positive Effects */}
                              {result.additionalPositiveEffects.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-green-400 font-bold text-sm mb-2">额外正面效果:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {result.additionalPositiveEffects.map((effect, effectIndex) => (
                                      <span 
                                        key={`positive-${index}-${effectIndex}`}
                                        className="text-xs text-green-300 bg-green-500/20 px-3 py-1 rounded-full border border-green-400/30"
                                      >
                                        {effect}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Extra Negative Effects */}
                              {result.additionalNegativeEffects.length > 0 && (
                                <div>
                                  <div className="text-red-400 font-bold text-sm mb-2">额外负面效果:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {result.additionalNegativeEffects.map((effect, effectIndex) => (
                                      <span 
                                        key={`negative-${index}-${effectIndex}`}
                                        className="text-xs text-red-300 bg-red-500/20 px-3 py-1 rounded-full border border-red-400/30"
                                      >
                                        {effect}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Expand/Collapse Icon */}
                            <div className="text-white/60 text-2xl transition-transform duration-200 ml-4">
                              {isExpanded ? '▼' : '▶'}
                            </div>
                          </div>
                        </div>

                {/* Expanded View - Conditionally Visible */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-white/20">
                    {/* Equipped Relics */}
                    <div className="mt-6">
                      <h4 className="text-2xl font-bold mb-6 text-white">装备的遗物:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {result.equippedRelics.map((relic, relicIndex) => (
                          <div key={relicIndex} className="border-2 border-white/20 rounded-xl p-6 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                            <div className="flex items-center space-x-3 mb-4">
                              <span className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${
                                relic.color === '红' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                relic.color === '蓝' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                relic.color === '绿' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                'bg-gradient-to-r from-yellow-500 to-yellow-600'
                              }`}>
                                {relic.color}
                              </span>
                              <span className="text-sm font-bold text-white/90">
                                {isNormalRelic(relic) ? '普通遗物' : '深度遗物'}
                              </span>
                            </div>
                            
                            {isNormalRelic(relic) ? (
                              <div className="space-y-2 text-sm">
                                <div className="text-white/90">• {relic.effect1}</div>
                                {relic.effect2 && <div className="text-white/90">• {relic.effect2}</div>}
                                {relic.effect3 && <div className="text-white/90">• {relic.effect3}</div>}
                              </div>
                            ) : (
                              <div className="space-y-2 text-sm">
                                <div className="text-green-400 font-medium">+ {relic.positiveEffect1}</div>
                                {relic.negativeEffect1 && <div className="text-red-400 font-medium">- {relic.negativeEffect1}</div>}
                                {relic.positiveEffect2 && <div className="text-green-400 font-medium">+ {relic.positiveEffect2}</div>}
                                {relic.negativeEffect2 && <div className="text-red-400 font-medium">- {relic.negativeEffect2}</div>}
                                {relic.positiveEffect3 && <div className="text-green-400 font-medium">+ {relic.positiveEffect3}</div>}
                                {relic.negativeEffect3 && <div className="text-red-400 font-medium">- {relic.negativeEffect3}</div>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Effects Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                      <div className="bg-green-500/20 backdrop-blur-sm p-6 rounded-xl border border-green-400/30">
                        <h4 className="text-xl font-bold text-green-400 mb-4">额外正面效果:</h4>
                        <div className="space-y-2">
                          {result.additionalPositiveEffects.length > 0 ? (
                            result.additionalPositiveEffects.map((effect, effectIndex) => (
                              <div key={`additional-positive-${index}-${effectIndex}`} className="text-sm text-green-300 bg-green-500/20 px-4 py-2 rounded-lg">• {effect}</div>
                            ))
                          ) : (
                            <div className="text-sm text-white/50 italic">无</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-red-500/20 backdrop-blur-sm p-6 rounded-xl border border-red-400/30">
                        <h4 className="text-xl font-bold text-red-400 mb-4">额外负面效果:</h4>
                        <div className="space-y-2">
                          {result.additionalNegativeEffects.length > 0 ? (
                            result.additionalNegativeEffects.map((effect, effectIndex) => (
                              <div key={`additional-negative-${index}-${effectIndex}`} className="text-sm text-red-300 bg-red-500/20 px-4 py-2 rounded-lg">• {effect}</div>
                            ))
                          ) : (
                            <div className="text-sm text-white/50 italic">无</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Requirements Status */}
                    <div className="mt-8 pt-6 border-t-2 border-white/20">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-white">找到的必需效果:</span>
                          <span className="text-green-400 font-bold bg-green-500/20 px-4 py-2 rounded-lg">
                            {result.requiredEffectsFound.length}/{requiredEffects.length}
                          </span>
                        </div>
                        {requiredEffects.length > 0 && (
                          <div className="text-sm text-white/80">
                            <div className="font-bold mb-2">详细要求:</div>
                            {requiredEffects.map(req => {
                              const foundCount = result.requiredEffectsFound.includes(req.effect) ? req.count : 0;
                              return (
                                <div key={req.effect} className="flex justify-between items-center py-1">
                                  <span className="truncate max-w-md">{req.effect}</span>
                                  <span className={foundCount >= req.count ? "text-green-400" : "text-red-400"}>
                                    {foundCount}/{req.count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-white">避免的效果:</span>
                          <span className="text-red-400 font-bold bg-red-500/20 px-4 py-2 rounded-lg">
                            {result.avoidedEffectsFound.length}/{avoidedEffects.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {searchResults.length === 0 && !isSearching && (
            <div className="text-center py-20 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/20">
              <div className="text-8xl mb-6">🔍</div>
              <div className="text-3xl text-white mb-4">没有找到符合条件的配装</div>
              <div className="text-xl text-white/70">请调整搜索条件后重试</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚡</div>
          <div className="text-2xl text-white mb-2">加载中...</div>
          <div className="text-lg text-white/70">请稍候</div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}