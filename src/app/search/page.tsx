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
  DEPTH_POSITIVE_EFFECTS, 
  DEPTH_NEGATIVE_EFFECTS
} from '../../data/relicPropertiesData';

interface SearchResult {
  vessel: Vessel;
  equippedRelics: Relic[];
  additionalPositiveEffects: string[];
  additionalNegativeEffects: string[];
  requiredEffectsFound: string[];
  avoidedEffectsFound: string[];
}

// Helper functions for URL parameter handling
const encodeEffect = (effect: string): string => {
  return encodeURIComponent(effect);
};

const decodeEffect = (encoded: string): string => {
  return decodeURIComponent(encoded);
};

const encodeEffects = (effects: string[]): string => {
  return effects.map(encodeEffect).join(',');
};

const decodeEffects = (encoded: string): string[] => {
  if (!encoded) return [];
  return encoded.split(',').map(decodeEffect).filter(effect => effect.length > 0);
};

// Function to read CSV files and parse relics data
const loadRelicsFromCSV = async () => {
  try {
    // Read normal relics CSV
    const normalResponse = await fetch('/relics.csv');
    const normalCSV = await normalResponse.text();
    
    
    // Read depth relics CSV  
    const depthResponse = await fetch('/depth_relics.csv');
    const depthCSV = await depthResponse.text();
    
    return parseRelicsFromCSV(normalCSV, depthCSV);
  } catch (error) {
    console.error('Error loading CSV files:', error);
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
  const [requiredEffects, setRequiredEffects] = useState<string[]>([]);
  const [avoidedEffects, setAvoidedEffects] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0 });
  const [relicsData, setRelicsData] = useState<{ normalRelics: NormalRelic[], depthRelics: DepthRelic[] }>({ normalRelics: [], depthRelics: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  
  // Auto-suggest states
  const [requiredInput, setRequiredInput] = useState('');
  const [avoidedInput, setAvoidedInput] = useState('');
  const [showRequiredSuggestions, setShowRequiredSuggestions] = useState(false);
  const [showAvoidedSuggestions, setShowAvoidedSuggestions] = useState(false);

  // Initialize state from URL parameters
  useEffect(() => {
    const nightfarerParam = searchParams.get('nightfarer');
    const requiredParam = searchParams.get('required');
    const avoidedParam = searchParams.get('avoided');
    
    if (nightfarerParam && NIGHTFARERS.includes(nightfarerParam as Nightfarer)) {
      setSelectedNightfarer(nightfarerParam as Nightfarer);
    }
    
    if (requiredParam) {
      const decoded = decodeEffects(requiredParam);
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
      params.set('required', encodeEffects(requiredEffects));
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
        const data = await loadRelicsFromCSV();
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
  }, []);

  // Removed unused toggle functions - using suggestion select instead

  // Auto-suggest helper functions
  const getFilteredSuggestions = (input: string, type: 'required' | 'avoided') => {
    // Use the constants as the source of truth for all possible effects
    const allEffects = type === 'required' ? DEPTH_POSITIVE_EFFECTS : DEPTH_NEGATIVE_EFFECTS;
    const selectedEffects = type === 'required' ? requiredEffects : avoidedEffects;
    
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
    if (!requiredEffects.includes(effect)) {
      setRequiredEffects(prev => [...prev, effect]);
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
    setRequiredEffects(prev => prev.filter(e => e !== effect));
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

  const searchForBuilds = async () => {
    setIsSearching(true);
    setSearchProgress({ current: 0, total: 0 });
    
    const vessels = NIGHTFARER_VESSELS[selectedNightfarer];
    const allRelics = generateAllPossibleRelics();
    const results: SearchResult[] = [];
    const MAX_RESULTS = 100;


    // Build reverse lookup tables
    const effectToRelics = buildReverseLookup(allRelics);
    
    // Pre-filter relics by type (for future use if needed)
    // const normalRelics = allRelics.filter(relic => isNormalRelic(relic));
    // const depthRelics = allRelics.filter(relic => isDepthRelic(relic));

    // Find candidate relics for required effects
    const candidateRelics = new Set<Relic>();
    
    // Add relics that have required effects
    requiredEffects.forEach(effect => {
      const relicsWithEffect = effectToRelics[effect] || [];
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


    // Use vessel-based progress tracking instead of combination counting
    const totalVessels = vessels.length;
    console.log(`Searching across ${totalVessels} vessels`);
    setSearchProgress({ current: 0, total: totalVessels });

    // Optimized search with pre-filtered candidates
    for (let vesselIndex = 0; vesselIndex < vessels.length && results.length < MAX_RESULTS; vesselIndex++) {
      const vessel = vessels[vesselIndex];
      
      // Update progress based on vessel completion
      setSearchProgress({ current: vesselIndex, total: totalVessels });
      
      const tryRelicCombination = async (currentIndex: number, currentRelics: Relic[]) => {
        if (results.length >= MAX_RESULTS) return;
        
        if (currentIndex >= vessel.slots.length) {
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

          // Check if all required effects are found in any of the effects
          const requiredEffectsFound = requiredEffects.filter(req => 
            allEffects.includes(req)
          );
          const avoidedEffectsFound = avoidedEffects.filter(avoid => 
            allEffects.includes(avoid)
          );

          // Check if all required effects are found and no avoided effects are present
          const meetsRequirements = requiredEffects.length === 0 || 
            requiredEffects.every(req => allEffects.includes(req));
          const avoidsUnwanted = avoidedEffects.length === 0 || 
            !avoidedEffects.some(avoid => allEffects.includes(avoid));

          if (meetsRequirements && avoidsUnwanted) {
            // Categorize effects for display using actual CSV data
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
            
            const positiveEffects = allEffects.filter(effect => 
              allPositiveEffects.has(effect)
            );
            const negativeEffects = allEffects.filter(effect => 
              allNegativeEffects.has(effect)
            );
            
            const additionalPositiveEffects = positiveEffects.filter(effect => 
              !requiredEffects.includes(effect)
            );
            const additionalNegativeEffects = negativeEffects.filter(effect => 
              !avoidedEffects.includes(effect)
            );

            results.push({
              vessel,
              equippedRelics: [...currentRelics],
              additionalPositiveEffects,
              additionalNegativeEffects,
              requiredEffectsFound,
              avoidedEffectsFound
            });
          }
          return;
        }

        const slot = vessel.slots[currentIndex];
        const compatibleRelics = finalCandidates
          .filter((relic): relic is Relic => {
            // Check slot type compatibility
            if (slot.slotType === 'normal' && !isNormalRelic(relic)) return false;
            if (slot.slotType === 'depth' && !isDepthRelic(relic)) return false;
            // Check color compatibility
            return canEquipRelic(slot, relic);
          });
        
        // Try each compatible relic
        for (const relic of compatibleRelics) {
          if (results.length >= MAX_RESULTS) return;
          const newRelics = [...currentRelics, relic];
          await tryRelicCombination(currentIndex + 1, newRelics);
        }

        // Also try with no relic in this slot
        await tryRelicCombination(currentIndex + 1, currentRelics);
      };

      await tryRelicCombination(0, []);
    }

    setSearchResults(results.slice(0, MAX_RESULTS));
    setSearchProgress({ current: totalVessels, total: totalVessels });
    setIsSearching(false);
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
        <h1 className="text-5xl font-bold mb-8 text-white text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          遗物构建搜索
        </h1>
        
        {/* Search Controls */}
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl mb-8 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Nightfarer Selector */}
            <div>
              <label className="block text-xl font-bold mb-4 text-white">选择夜行者</label>
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
                  {requiredEffects.map((effect, index) => (
                    <div
                      key={`${effect}-${index}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-200 rounded-full border border-blue-400/30"
                    >
                      <span className="text-sm">{effect}</span>
                      <button
                        onClick={() => handleRequiredEffectRemove(effect)}
                        className="text-blue-300 hover:text-blue-100 transition-colors"
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
                <div className="text-xs text-white/60 mt-1 text-center">
                  已搜索 {searchProgress.current} / {searchProgress.total} 个容器
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white text-center">搜索结果 ({searchResults.length})</h2>
          
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
                                {result.vessel.name} (构建 #{index + 1})
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xl">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-white">找到的必需效果:</span>
                          <span className="text-green-400 font-bold bg-green-500/20 px-4 py-2 rounded-lg">
                            {result.requiredEffectsFound.length}/{requiredEffects.length}
                          </span>
                        </div>
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
              <div className="text-3xl text-white mb-4">没有找到符合条件的构建</div>
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