import { useState } from 'react';
import { useParties } from '../hooks/useParties';

interface PartySelectorProps {
  selectedPartyId: number | null;
  onPartySelect: (partyId: number) => void;
  className?: string;
}

const PartySelector = ({ selectedPartyId, onPartySelect, className = '' }: PartySelectorProps) => {
  const { parties, createParty, loading } = useParties();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newParty, setNewParty] = useState({
    name: '',
    date: '',
    party_type: 'mixed' as const,
    guest_count: 0,
    duration: 3,
    theme: '',
    notes: '',
  });

  const handleCreateParty = async () => {
    if (!newParty.name.trim()) return;

    try {
      const partyId = await createParty(newParty);
      onPartySelect(partyId);
      setShowCreateForm(false);
      setNewParty({
        name: '',
        date: '',
        party_type: 'mixed',
        guest_count: 0,
        duration: 3,
        theme: '',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to create party:', error);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading parties...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Party
          </label>
          <select
            value={selectedPartyId || ''}
            onChange={(e) => e.target.value && onPartySelect(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a party...</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name} {party.date && `(${new Date(party.date).toLocaleDateString()})`}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mt-6 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap"
        >
          + New Party
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Create New Party</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Name *
              </label>
              <input
                type="text"
                value={newParty.name}
                onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Birthday Party, Wedding, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newParty.date}
                onChange={(e) => setNewParty({ ...newParty, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Type
              </label>
              <select
                value={newParty.party_type}
                onChange={(e) => setNewParty({ ...newParty, party_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Guests
              </label>
              <input
                type="number"
                min="0"
                value={newParty.guest_count || ''}
                onChange={(e) => setNewParty({ ...newParty, guest_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of guests"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours)
              </label>
              <select
                value={newParty.duration}
                onChange={(e) => setNewParty({ ...newParty, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
                <option value={4}>4 hours</option>
                <option value={5}>5 hours</option>
                <option value={6}>6+ hours</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme
              </label>
              <input
                type="text"
                value={newParty.theme}
                onChange={(e) => setNewParty({ ...newParty, theme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional theme"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={newParty.notes}
              onChange={(e) => setNewParty({ ...newParty, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about the party..."
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleCreateParty}
              disabled={!newParty.name.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Create Party
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartySelector;