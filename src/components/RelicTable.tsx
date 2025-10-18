'use client';

import { useState } from 'react';
import { NormalRelic, DepthRelic } from '../types/relicProperties';

interface RelicTableProps {
  normalRelics: NormalRelic[];
  depthRelics: DepthRelic[];
  onEditNormal: (relic: NormalRelic, index: number) => void;
  onEditDepth: (relic: DepthRelic, index: number) => void;
  onDeleteNormal: (index: number) => void;
  onDeleteDepth: (index: number) => void;
}

export default function RelicTable({ 
  normalRelics, 
  depthRelics, 
  onEditNormal, 
  onEditDepth, 
  onDeleteNormal, 
  onDeleteDepth 
}: RelicTableProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getColorBadge = (color: string) => {
    const colorClasses = {
      '黄': 'bg-yellow-200 text-yellow-800',
      '红': 'bg-red-200 text-red-800',
      '绿': 'bg-green-200 text-green-800',
      '蓝': 'bg-blue-200 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClasses[color as keyof typeof colorClasses] || 'bg-gray-200 text-gray-800'}`}>
        {color}
      </span>
    );
  };

  const renderNormalRelicRow = (relic: NormalRelic, index: number) => (
    <tr
      key={`normal-${index}`}
      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
        {getColorBadge(relic.color)}
      </td>
      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
        <div className="space-y-1">
          <div className="text-sm font-medium">{relic.effect1}</div>
          {relic.effect2 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{relic.effect2}</div>
          )}
          {relic.effect3 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{relic.effect3}</div>
          )}
        </div>
      </td>
      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEditNormal(relic, index)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDeleteNormal(index)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  const renderDepthRelicRow = (relic: DepthRelic, index: number) => (
    <tr
      key={`depth-${index}`}
      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
        {getColorBadge(relic.color)}
      </td>
      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-green-600 dark:text-green-400">+</span> {relic.positiveEffect1}
            {relic.negativeEffect1 && (
              <>
                <span className="ml-2 text-red-600 dark:text-red-400">-</span> {relic.negativeEffect1}
              </>
            )}
          </div>
          {relic.positiveEffect2 && (
            <div className="text-sm">
              <span className="font-medium text-green-600 dark:text-green-400">+</span> {relic.positiveEffect2}
              {relic.negativeEffect2 && (
                <>
                  <span className="ml-2 text-red-600 dark:text-red-400">-</span> {relic.negativeEffect2}
                </>
              )}
            </div>
          )}
          {relic.positiveEffect3 && (
            <div className="text-sm">
              <span className="font-medium text-green-600 dark:text-green-400">+</span> {relic.positiveEffect3}
              {relic.negativeEffect3 && (
                <>
                  <span className="ml-2 text-red-600 dark:text-red-400">-</span> {relic.negativeEffect3}
                </>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEditDepth(relic, index)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDeleteDepth(index)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  const renderRelicSection = (
    relics: (NormalRelic | DepthRelic)[], 
    title: string, 
    titleColor: string, 
    sectionKey: string,
    isNormal: boolean
  ) => {
    if (relics.length === 0) return null;

    const isExpanded = expandedSections[sectionKey] || false;

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700" key={sectionKey}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between text-left mb-4"
        >
          <h3 className={`text-xl font-bold ${titleColor}`}>
            {title} ({relics.length})
          </h3>
          <span className="text-2xl text-gray-500">
            {isExpanded ? '−' : '+'}
          </span>
        </button>
        
        {isExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Color
                  </th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Effects
                  </th>
                  <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {relics.map((relic, index) => 
                  isNormal 
                    ? renderNormalRelicRow(relic as NormalRelic, index)
                    : renderDepthRelicRow(relic as DepthRelic, index)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (normalRelics.length === 0 && depthRelics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 text-center rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-700 dark:text-gray-300 text-lg">No relics added yet. Add your first relic above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderRelicSection(normalRelics, 'Normal Relics', 'text-blue-700 dark:text-blue-400', 'normal', true)}
      {renderRelicSection(depthRelics, 'Depth Relics', 'text-purple-700 dark:text-purple-400', 'depth', false)}
    </div>
  );
}
