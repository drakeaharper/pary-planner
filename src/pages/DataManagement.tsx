import { useState, useRef } from 'react';
import { useCurrentParty } from '../contexts/PartyContext';
import { useParties } from '../hooks/useParties';
import { useDataExport } from '../hooks/useDataExport';
import { useDataImport } from '../hooks/useDataImport';
import PartySelector from '../components/PartySelector';

const DataManagement = () => {
  const { currentParty, currentPartyId, setCurrentPartyId } = useCurrentParty();
  const { parties } = useParties();
  const { exportPartyAsFile, exportAllAsFile } = useDataExport();
  const { importFromFile } = useDataImport();
  
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportParty = async () => {
    if (!currentParty) return;
    
    setIsExporting(true);
    try {
      await exportPartyAsFile(currentParty.id, currentParty.name);
      setImportStatus({
        type: 'success',
        message: `Successfully exported "${currentParty.name}"`,
      });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to export party data',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await exportAllAsFile();
      setImportStatus({
        type: 'success',
        message: `Successfully exported all ${parties.length} parties`,
      });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to export all data',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({ type: null, message: '' });

    try {
      const result = await importFromFile(file);
      setImportStatus({
        type: result.success ? 'success' : 'error',
        message: result.message,
      });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to import data',
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearStatus = () => {
    setImportStatus({ type: null, message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          📁 Data Management
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Export your party data for backup or sharing, and import data from other sources.
        </p>
      </div>

      {/* Status Messages */}
      {importStatus.type && (
        <div className={`mb-6 p-4 rounded-lg ${
          importStatus.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span>{importStatus.message}</span>
            <button
              onClick={clearStatus}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            📤 Export Data
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Download your party data as JSON files for backup or sharing with others.
          </p>

          <div className="space-y-4">
            {/* Export Single Party */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Export Single Party</h3>
              <PartySelector
                selectedPartyId={currentPartyId}
                onPartySelect={setCurrentPartyId}
                className="mb-4"
              />
              
              <button
                onClick={handleExportParty}
                disabled={!currentParty || isExporting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {isExporting ? 'Exporting...' : `Export "${currentParty?.name || 'Select Party'}"`}
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-700 mb-3">Export All Data</h3>
              <p className="text-sm text-gray-600 mb-3">
                Export all {parties.length} parties with their guests and tasks.
              </p>
              <button
                onClick={handleExportAll}
                disabled={parties.length === 0 || isExporting}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {isExporting ? 'Exporting...' : `Export All Parties (${parties.length})`}
              </button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            📥 Import Data
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Import party data from JSON files. Imported parties will be added alongside your existing data.
          </p>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                Select a JSON file to import
              </p>
              
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                {isImporting ? 'Importing...' : 'Choose File'}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Import Notes</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Imported parties will be renamed to avoid conflicts</li>
                <li>• All guests and tasks will be preserved</li>
                <li>• This will not replace your existing data</li>
                <li>• Only JSON files exported from Party Planner are supported</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Data Overview */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📊 Data Overview
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{parties.length}</div>
            <div className="text-sm text-gray-600">Total Parties</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {parties.reduce((sum, party) => sum + party.guest_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Guests</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {parties.filter(p => p.date && new Date(p.date) > new Date()).length}
            </div>
            <div className="text-sm text-gray-600">Upcoming Parties</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {parties.filter(p => p.date && new Date(p.date) < new Date()).length}
            </div>
            <div className="text-sm text-gray-600">Past Parties</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;