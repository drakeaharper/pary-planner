import { useState } from 'react';
import { useCurrentParty } from '../contexts/PartyContext';
import { useGuests } from '../hooks/useGuests';
import PartySelector from '../components/PartySelector';

const GuestListManager = () => {
  const { currentPartyId, setCurrentPartyId } = useCurrentParty();
  const { guests, addGuest, updateRSVP, deleteGuest, loading, stats } = useGuests(currentPartyId);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    dietary_restrictions: '',
    additional_guests: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddGuest = async () => {
    if (!newGuest.name.trim() || !currentPartyId) return;
    
    try {
      await addGuest({
        party_id: currentPartyId,
        name: newGuest.name,
        email: newGuest.email,
        rsvp: 'pending',
        dietary_restrictions: newGuest.dietary_restrictions,
        additional_guests: newGuest.additional_guests,
        notes: '',
      });
      
      setNewGuest({ name: '', email: '', dietary_restrictions: '', additional_guests: 0 });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add guest:', error);
    }
  };

  const handleUpdateRSVP = async (id: number, rsvp: 'pending' | 'yes' | 'no') => {
    try {
      await updateRSVP(id, rsvp);
    } catch (error) {
      console.error('Failed to update RSVP:', error);
    }
  };

  const handleRemoveGuest = async (id: number) => {
    try {
      await deleteGuest(id);
    } catch (error) {
      console.error('Failed to remove guest:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          👥 Guest List Manager
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Keep track of your guests, RSVPs, and special requirements all in one place.
        </p>
      </div>

      <PartySelector
        selectedPartyId={currentPartyId}
        onPartySelect={setCurrentPartyId}
        className="mb-8"
      />

      {!currentPartyId ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Please select or create a party to manage guests.
          </p>
        </div>
      ) : (

        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
              <div className="text-sm text-gray-600">Declined</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.additionalGuests}</div>
              <div className="text-sm text-gray-600">Additional</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Attending</div>
            </div>
          </div>

          {/* Add Guest Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Add Guest
            </button>
          </div>

          {/* Add Guest Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Guest/Family</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Guest name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    value={newGuest.dietary_restrictions}
                    onChange={(e) => setNewGuest({ ...newGuest, dietary_restrictions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Vegetarian, gluten-free, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Family Members
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newGuest.additional_guests}
                    onChange={(e) => setNewGuest({ ...newGuest, additional_guests: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Number of additional guests"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How many additional family members or guests will attend
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleAddGuest}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Add Guest
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Guest List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Guest List ({guests.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading guests...</p>
              </div>
            ) : guests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="mb-2">No guests added yet</p>
                <p className="text-sm">Click "Add Guest" to get started!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {guests.map((guest) => (
                  <div key={guest.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{guest.name}</h4>
                          {guest.additional_guests > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              +{guest.additional_guests}
                            </span>
                          )}
                        </div>
                        {guest.email && (
                          <p className="text-sm text-gray-600">{guest.email}</p>
                        )}
                        {guest.dietary_restrictions && (
                          <p className="text-sm text-orange-600">
                            Dietary: {guest.dietary_restrictions}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <select
                          value={guest.rsvp}
                          onChange={(e) => handleUpdateRSVP(guest.id, e.target.value as 'pending' | 'yes' | 'no')}
                          className={`text-sm border rounded px-2 py-1 ${
                            guest.rsvp === 'yes' ? 'border-green-300 bg-green-50 text-green-700' :
                            guest.rsvp === 'no' ? 'border-red-300 bg-red-50 text-red-700' :
                            'border-yellow-300 bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                        
                        <button
                          onClick={() => handleRemoveGuest(guest.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove guest"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GuestListManager;