'use client';

import { useState, useEffect } from 'react';
import { NormalRelic, DepthRelic } from '../../types/relicProperties';
import { 
  loadRelicCollection, 
  saveRelicCollection, 
  clearAllRelics
} from '../../utils/storageUtils';
import { 
  parseNormalRelicsFromCSV, 
  parseDepthRelicsFromCSV,
  normalRelicsToCSV,
  depthRelicsToCSV,
  downloadCSV,
  loadCSVFromFile
} from '../../utils/csvUtils';
import RelicForm from '../../components/RelicForm';
import RelicTable from '../../components/RelicTable';

export default function MyRelicsPage() {
  const [normalRelics, setNormalRelics] = useState<NormalRelic[]>([]);
  const [depthRelics, setDepthRelics] = useState<DepthRelic[]>([]);
  const [normalRelicsCSV, setNormalRelicsCSV] = useState('');
  const [depthRelicsCSV, setDepthRelicsCSV] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingRelic, setEditingRelic] = useState<NormalRelic | DepthRelic | null>(null);
  const [editingRelicType, setEditingRelicType] = useState<'normal' | 'depth'>('normal');
  const [showForm, setShowForm] = useState(false);
  const [formRelicType, setFormRelicType] = useState<'normal' | 'depth'>('normal');

  // Load relics from localStorage on component mount
  useEffect(() => {
    const loadRelics = () => {
      const collection = loadRelicCollection();
      setNormalRelics(collection.normalRelics);
      setDepthRelics(collection.depthRelics);
      setNormalRelicsCSV(normalRelicsToCSV(collection.normalRelics));
      setDepthRelicsCSV(depthRelicsToCSV(collection.depthRelics));
      setIsLoading(false);
    };

    loadRelics();
  }, []);

  // Save relics to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveRelicCollection({ normalRelics, depthRelics });
    }
  }, [normalRelics, depthRelics, isLoading]);

  // Update CSV text when relics change
  useEffect(() => {
    if (!isLoading) {
      setNormalRelicsCSV(normalRelicsToCSV(normalRelics));
      setDepthRelicsCSV(depthRelicsToCSV(depthRelics));
    }
  }, [normalRelics, depthRelics, isLoading]);

  const handleNormalRelicsImport = () => {
    try {
      const relics = parseNormalRelicsFromCSV(normalRelicsCSV);
      setNormalRelics(relics);
    } catch (error) {
      alert('Error importing normal relics CSV. Please check the format.');
      console.error('Error importing normal relics:', error);
    }
  };

  const handleDepthRelicsImport = () => {
    try {
      const relics = parseDepthRelicsFromCSV(depthRelicsCSV);
      setDepthRelics(relics);
    } catch (error) {
      alert('Error importing depth relics CSV. Please check the format.');
      console.error('Error importing depth relics:', error);
    }
  };

  const handleNormalRelicsExport = () => {
    const csv = normalRelicsToCSV(normalRelics);
    downloadCSV(csv, 'normal_relics.csv');
  };

  const handleDepthRelicsExport = () => {
    const csv = depthRelicsToCSV(depthRelics);
    downloadCSV(csv, 'depth_relics.csv');
  };

  const handleNormalRelicsExportToText = () => {
    const csv = normalRelicsToCSV(normalRelics);
    setNormalRelicsCSV(csv);
  };

  const handleDepthRelicsExportToText = () => {
    const csv = depthRelicsToCSV(depthRelics);
    setDepthRelicsCSV(csv);
  };

  const handleNormalRelicsFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvContent = await loadCSVFromFile(file);
      setNormalRelicsCSV(csvContent);
      const relics = parseNormalRelicsFromCSV(csvContent);
      setNormalRelics(relics);
    } catch (error) {
      alert('Error loading normal relics file. Please check the file format.');
      console.error('Error loading normal relics file:', error);
    }
  };

  const handleDepthRelicsFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvContent = await loadCSVFromFile(file);
      setDepthRelicsCSV(csvContent);
      const relics = parseDepthRelicsFromCSV(csvContent);
      setDepthRelics(relics);
    } catch (error) {
      alert('Error loading depth relics file. Please check the file format.');
      console.error('Error loading depth relics file:', error);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all relics? This action cannot be undone.')) {
      setNormalRelics([]);
      setDepthRelics([]);
      setNormalRelicsCSV('');
      setDepthRelicsCSV('');
      clearAllRelics();
    }
  };

  // Relic management functions
  const handleAddRelic = (relic: NormalRelic | DepthRelic) => {
    if (editingRelic) {
      // Update existing relic
      if (editingRelicType === 'normal') {
        setNormalRelics(prev => 
          prev.map((r, index) => 
            index === editingRelicIndex ? relic as NormalRelic : r
          )
        );
      } else {
        setDepthRelics(prev => 
          prev.map((r, index) => 
            index === editingRelicIndex ? relic as DepthRelic : r
          )
        );
      }
      setEditingRelic(null);
      setEditingRelicType('normal');
      setShowForm(false);
    } else {
      // Add new relic
      if (formRelicType === 'normal') {
        setNormalRelics(prev => [relic as NormalRelic, ...prev]);
      } else {
        setDepthRelics(prev => [relic as DepthRelic, ...prev]);
      }
    }
  };

  const [editingRelicIndex, setEditingRelicIndex] = useState<number>(-1);

  const handleEditNormal = (relic: NormalRelic, index: number) => {
    setEditingRelic(relic);
    setEditingRelicType('normal');
    setEditingRelicIndex(index);
    setFormRelicType('normal');
    setShowForm(true);
    // Scroll to form
    document.getElementById('relic-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditDepth = (relic: DepthRelic, index: number) => {
    setEditingRelic(relic);
    setEditingRelicType('depth');
    setEditingRelicIndex(index);
    setFormRelicType('depth');
    setShowForm(true);
    // Scroll to form
    document.getElementById('relic-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteNormal = (index: number) => {
    setNormalRelics(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteDepth = (index: number) => {
    setDepthRelics(prev => prev.filter((_, i) => i !== index));
  };

  const handleCancelEdit = () => {
    setEditingRelic(null);
    setEditingRelicType('normal');
    setEditingRelicIndex(-1);
    setShowForm(false);
  };

  const handleShowForm = (type: 'normal' | 'depth') => {
    setFormRelicType(type);
    setEditingRelic(null);
    setEditingRelicType('normal');
    setEditingRelicIndex(-1);
    setShowForm(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('relic-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">My Relics</h1>
        <p className="text-sm text-black/70 dark:text-white/70">Loading...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Relics</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleShowForm('normal')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Normal Relic
          </button>
          <button
            onClick={() => handleShowForm('depth')}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            Add Depth Relic
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <p className="text-sm text-black/70 dark:text-white/70">
        Manage your relic collection. Add individual relics or import/export CSV files.
        Your relics are automatically saved to browser localStorage.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 text-center rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{normalRelics.length}</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">Normal Relics</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 text-center rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{depthRelics.length}</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">Depth Relics</div>
        </div>
      </div>

      {/* Relic Form */}
      {showForm && (
        <div id="relic-form">
          <RelicForm
            onSubmit={handleAddRelic}
            editingRelic={editingRelic}
            onCancel={handleCancelEdit}
            relicType={formRelicType}
          />
        </div>
      )}

      {/* Relic Table */}
      <RelicTable
        normalRelics={normalRelics}
        depthRelics={depthRelics}
        onEditNormal={handleEditNormal}
        onEditDepth={handleEditDepth}
        onDeleteNormal={handleDeleteNormal}
        onDeleteDepth={handleDeleteDepth}
      />

      {/* CSV Import/Export Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">CSV Import/Export</h2>
        
        {/* Normal Relics Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Normal Relics ({normalRelics.length})</h2>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleNormalRelicsFileImport}
              className="hidden"
              id="normal-file-input"
            />
            <label
              htmlFor="normal-file-input"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Import from CSV File
            </label>
            <button
              onClick={handleNormalRelicsImport}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Import from CSV Text
            </button>
            <button
              onClick={handleNormalRelicsExport}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              Export to CSV File
            </button>
            <button
              onClick={handleNormalRelicsExportToText}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Export to CSV Text
            </button>
          </div>
        </div>
        
        <textarea
          value={normalRelicsCSV}
          onChange={(e) => setNormalRelicsCSV(e.target.value)}
          placeholder="Paste normal relics CSV text here, then click 'Import from CSV Text'... Or click 'Export to CSV Text' to populate this field with your current inventory. (Format: color,effect1,effect2,effect3)"
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white resize-vertical"
        />
      </div>

      {/* Depth Relics Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Depth Relics ({depthRelics.length})</h2>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleDepthRelicsFileImport}
              className="hidden"
              id="depth-file-input"
            />
            <label
              htmlFor="depth-file-input"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Import from CSV File
            </label>
            <button
              onClick={handleDepthRelicsImport}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Import from CSV Text
            </button>
            <button
              onClick={handleDepthRelicsExport}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              Export to CSV File
            </button>
            <button
              onClick={handleDepthRelicsExportToText}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Export to CSV Text
            </button>
          </div>
        </div>
        
        <textarea
          value={depthRelicsCSV}
          onChange={(e) => setDepthRelicsCSV(e.target.value)}
          placeholder="Paste depth relics CSV text here, then click 'Import from CSV Text'... Or click 'Export to CSV Text' to populate this field with your current inventory. (Format: color,positive1,negative1,positive2,negative2,positive3,negative3)"
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white resize-vertical"
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
        <h3 className="font-medium mb-2">Collection Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Normal Relics:</span>
            <span className="ml-2 font-medium">{normalRelics.length}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Depth Relics:</span>
            <span className="ml-2 font-medium">{depthRelics.length}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Your relics are automatically saved to localStorage and will persist between sessions.
        </p>
        </div>
      </div>
    </section>
  );
}


