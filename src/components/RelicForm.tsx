'use client';

import { useState, useEffect } from 'react';
import { NormalRelic, DepthRelic, RelicColor } from '../types/relicProperties';
import { 
  NORMAL_EFFECTS,
  DEPTH_POSITIVE_EFFECTS, 
  DEPTH_NEGATIVE_EFFECTS 
} from '../data/relicPropertiesData';

interface RelicFormProps {
  onSubmit: (relic: NormalRelic | DepthRelic) => void;
  editingRelic?: NormalRelic | DepthRelic | null;
  onCancel?: () => void;
  relicType: 'normal' | 'depth';
}

const RELIC_COLORS: RelicColor[] = ['黄', '红', '绿', '蓝'];

// Get available effects for autocomplete
const getAvailableEffects = (type: 'normal' | 'depth'): string[] => {
  if (type === 'normal') {
    // For normal relics, use the actual NORMAL_EFFECTS from data
    return NORMAL_EFFECTS;
  } else {
    // For depth relics, use the actual data and remove duplicates
    const allEffects = [...DEPTH_POSITIVE_EFFECTS, ...DEPTH_NEGATIVE_EFFECTS];
    return Array.from(new Set(allEffects));
  }
};

interface EffectAutocompleteProps {
  label: string;
  value: string;
  availableEffects: string[];
  onChange: (value: string) => void;
}

function EffectAutocomplete({ label, value, availableEffects, onChange }: EffectAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredEffects, setFilteredEffects] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredEffects(availableEffects);
    } else {
      const filtered = availableEffects.filter(effect =>
        effect.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredEffects(filtered);
    }
    setHighlightedIndex(-1);
  }, [inputValue, availableEffects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    onChange(newValue);
  };

  const handleEffectSelect = (effect: string) => {
    if (!effect) return;
    setInputValue(effect);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(effect);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredEffects.length > 0) {
          setIsOpen(true);
          setHighlightedIndex(0);
        }
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (filteredEffects.length > 0) {
          setHighlightedIndex(prev => 
            prev < filteredEffects.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (filteredEffects.length > 0) {
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredEffects.length && filteredEffects[highlightedIndex]) {
          handleEffectSelect(filteredEffects[highlightedIndex]);
        } else if (filteredEffects.length === 1 && filteredEffects[0]) {
          handleEffectSelect(filteredEffects[0]);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredEffects.length && filteredEffects[highlightedIndex]) {
          handleEffectSelect(filteredEffects[highlightedIndex]);
        } else if (filteredEffects.length === 1 && filteredEffects[0]) {
          handleEffectSelect(filteredEffects[0]);
        }
        break;
    }
  };

  return (
    <div className="effect-autocomplete-container">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type to search effects..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isOpen && filteredEffects.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredEffects.map((effect, index) => (
              <button
                key={effect}
                type="button"
                onClick={() => handleEffectSelect(effect)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  index === highlightedIndex 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {effect}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RelicForm({ onSubmit, editingRelic, onCancel, relicType }: RelicFormProps) {
  const [formData, setFormData] = useState<Partial<NormalRelic | DepthRelic>>({
    color: '黄'
  });

  const availableEffects = getAvailableEffects(relicType);

  useEffect(() => {
    if (editingRelic) {
      setFormData(editingRelic);
    } else {
      if (relicType === 'normal') {
        setFormData({
          color: '黄',
          effect1: '',
          effect2: '',
          effect3: ''
        });
      } else {
        setFormData({
          color: '黄',
          positiveEffect1: '',
          negativeEffect1: '',
          positiveEffect2: '',
          negativeEffect2: '',
          positiveEffect3: '',
          negativeEffect3: ''
        });
      }
    }
  }, [editingRelic, relicType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (relicType === 'normal') {
      const normalRelic: NormalRelic = {
        color: formData.color as RelicColor,
        effect1: (formData as NormalRelic).effect1 || '',
        effect2: (formData as NormalRelic).effect2,
        effect3: (formData as NormalRelic).effect3
      };
      onSubmit(normalRelic);
    } else {
      const depthRelic: DepthRelic = {
        color: formData.color as RelicColor,
        positiveEffect1: (formData as DepthRelic).positiveEffect1 || '',
        negativeEffect1: (formData as DepthRelic).negativeEffect1,
        positiveEffect2: (formData as DepthRelic).positiveEffect2,
        negativeEffect2: (formData as DepthRelic).negativeEffect2,
        positiveEffect3: (formData as DepthRelic).positiveEffect3,
        negativeEffect3: (formData as DepthRelic).negativeEffect3
      };
      onSubmit(depthRelic);
    }
    
    if (!editingRelic) {
      // Reset form after adding new relic
      if (relicType === 'normal') {
        setFormData({
          color: '黄',
          effect1: '',
          effect2: '',
          effect3: ''
        });
      } else {
        setFormData({
          color: '黄',
          positiveEffect1: '',
          negativeEffect1: '',
          positiveEffect2: '',
          negativeEffect2: '',
          positiveEffect3: '',
          negativeEffect3: ''
        });
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {editingRelic ? `Edit ${relicType === 'normal' ? 'Normal' : 'Depth'} Relic` : `Add New ${relicType === 'normal' ? 'Normal' : 'Depth'} Relic`}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex gap-2">
            {RELIC_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color }))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.color === color
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Effects based on relic type */}
        {relicType === 'normal' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EffectAutocomplete
              label="Effect 1 *"
              value={(formData as NormalRelic).effect1 || ''}
              availableEffects={availableEffects}
              onChange={(value) => setFormData(prev => ({ ...prev, effect1: value }))}
            />
            <EffectAutocomplete
              label="Effect 2"
              value={(formData as NormalRelic).effect2 || ''}
              availableEffects={availableEffects}
              onChange={(value) => setFormData(prev => ({ ...prev, effect2: value }))}
            />
            <EffectAutocomplete
              label="Effect 3"
              value={(formData as NormalRelic).effect3 || ''}
              availableEffects={availableEffects}
              onChange={(value) => setFormData(prev => ({ ...prev, effect3: value }))}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EffectAutocomplete
                label="Positive Effect 1 *"
                value={(formData as DepthRelic).positiveEffect1 || ''}
                availableEffects={DEPTH_POSITIVE_EFFECTS}
                onChange={(value) => setFormData(prev => ({ ...prev, positiveEffect1: value }))}
              />
              <EffectAutocomplete
                label="Negative Effect 1"
                value={(formData as DepthRelic).negativeEffect1 || ''}
                availableEffects={DEPTH_NEGATIVE_EFFECTS}
                onChange={(value) => setFormData(prev => ({ ...prev, negativeEffect1: value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EffectAutocomplete
                label="Positive Effect 2"
                value={(formData as DepthRelic).positiveEffect2 || ''}
                availableEffects={DEPTH_POSITIVE_EFFECTS}
                onChange={(value) => setFormData(prev => ({ ...prev, positiveEffect2: value }))}
              />
              <EffectAutocomplete
                label="Negative Effect 2"
                value={(formData as DepthRelic).negativeEffect2 || ''}
                availableEffects={DEPTH_NEGATIVE_EFFECTS}
                onChange={(value) => setFormData(prev => ({ ...prev, negativeEffect2: value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EffectAutocomplete
                label="Positive Effect 3"
                value={(formData as DepthRelic).positiveEffect3 || ''}
                availableEffects={DEPTH_POSITIVE_EFFECTS}
                onChange={(value) => setFormData(prev => ({ ...prev, positiveEffect3: value }))}
              />
              <EffectAutocomplete
                label="Negative Effect 3"
                value={(formData as DepthRelic).negativeEffect3 || ''}
                availableEffects={DEPTH_NEGATIVE_EFFECTS}
                onChange={(value) => setFormData(prev => ({ ...prev, negativeEffect3: value }))}
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            {editingRelic ? 'Update Relic' : 'Add Relic'}
          </button>
          {editingRelic && onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
