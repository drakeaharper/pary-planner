import React, { useState } from 'react';
import { useCurrentParty } from '../contexts/PartyContext';
import { useItinerary } from '../hooks/useItinerary';
import { ItineraryItem, ItineraryTemplate, ITINERARY_CATEGORIES } from '../types/itinerary';
import PartySelector from '../components/PartySelector';

const ItineraryPlanner: React.FC = () => {
  const { currentParty, currentPartyId, setCurrentPartyId } = useCurrentParty();
  const { items, templates, loading, error, addItem, updateItem, deleteItem, applyTemplate } = useItinerary(currentPartyId?.toString());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ItineraryTemplate | null>(null);
  const [templateStartTime, setTemplateStartTime] = useState('');

  const [newItem, setNewItem] = useState({
    startTime: '',
    endTime: '',
    title: '',
    description: '',
    category: 'activity' as keyof typeof ITINERARY_CATEGORIES,
    location: '',
    responsible: '',
    preparations: [] as string[],
    notes: ''
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentParty || !currentPartyId || !newItem.title || !newItem.startTime || !newItem.endTime) return;

    try {
      await addItem({
        partyId: currentPartyId.toString(),
        ...newItem,
        completed: false,
        orderIndex: items.length
      });

      setNewItem({
        startTime: '',
        endTime: '',
        title: '',
        description: '',
        category: 'activity',
        location: '',
        responsible: '',
        preparations: [],
        notes: ''
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await updateItem(editingItem.id, editingItem);
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !currentParty || !currentPartyId) return;

    try {
      await applyTemplate(selectedTemplate, templateStartTime || undefined);
      setSelectedTemplate(null);
      setTemplateStartTime('');
      setShowTemplates(false);
    } catch (err) {
      console.error('Failed to apply template:', err);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    const diffMinutes = endMinutes - startMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  if (loading) return <div className="p-8 text-center">Loading itinerary...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Party Itinerary</h1>
        <p className="text-gray-600 mb-6">
          Plan your party minute-by-minute with a detailed schedule of activities and events.
        </p>
        <PartySelector 
          selectedPartyId={currentPartyId}
          onPartySelect={setCurrentPartyId}
        />
      </div>

      {!currentParty && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">Select a party to start planning your itinerary.</p>
        </div>
      )}

      {currentParty && (
        <>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Item
            </button>
            
            <button
              onClick={() => setShowTemplates(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Use Template
            </button>

            {items.length > 0 && (
              <div className="text-sm text-gray-600 flex items-center">
                Total Items: {items.length} | 
                Completed: {items.filter(item => item.completed).length}
              </div>
            )}
          </div>

          {/* Template Selection Modal */}
          {showTemplates && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Choose Template</h3>
                
                <div className="space-y-2 mb-4">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`w-full text-left p-3 rounded border ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{template.name}</div>
                      {template.description && (
                        <div className="text-sm text-gray-600">{template.description}</div>
                      )}
                      {template.duration && (
                        <div className="text-sm text-gray-500">{template.duration} hours</div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time (optional)
                    </label>
                    <input
                      type="time"
                      value={templateStartTime}
                      onChange={(e) => setTemplateStartTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If specified, all times will be adjusted relative to this start time
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleApplyTemplate}
                    disabled={!selectedTemplate}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply Template
                  </button>
                  <button
                    onClick={() => {
                      setShowTemplates(false);
                      setSelectedTemplate(null);
                      setTemplateStartTime('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Item Form */}
          {(showAddForm || editingItem) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h3>
                
                <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={editingItem ? editingItem.startTime : newItem.startTime}
                        onChange={(e) => {
                          if (editingItem) {
                            setEditingItem({ ...editingItem, startTime: e.target.value });
                          } else {
                            setNewItem({ ...newItem, startTime: e.target.value });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={editingItem ? editingItem.endTime : newItem.endTime}
                        onChange={(e) => {
                          if (editingItem) {
                            setEditingItem({ ...editingItem, endTime: e.target.value });
                          } else {
                            setNewItem({ ...newItem, endTime: e.target.value });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem ? editingItem.title : newItem.title}
                      onChange={(e) => {
                        if (editingItem) {
                          setEditingItem({ ...editingItem, title: e.target.value });
                        } else {
                          setNewItem({ ...newItem, title: e.target.value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Activity title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editingItem ? editingItem.category : newItem.category}
                      onChange={(e) => {
                        const category = e.target.value as keyof typeof ITINERARY_CATEGORIES;
                        if (editingItem) {
                          setEditingItem({ ...editingItem, category });
                        } else {
                          setNewItem({ ...newItem, category });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {Object.entries(ITINERARY_CATEGORIES).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingItem ? editingItem.description || '' : newItem.description}
                      onChange={(e) => {
                        if (editingItem) {
                          setEditingItem({ ...editingItem, description: e.target.value });
                        } else {
                          setNewItem({ ...newItem, description: e.target.value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="Activity description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editingItem ? editingItem.location || '' : newItem.location}
                        onChange={(e) => {
                          if (editingItem) {
                            setEditingItem({ ...editingItem, location: e.target.value });
                          } else {
                            setNewItem({ ...newItem, location: e.target.value });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Where this happens"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Responsible Person
                      </label>
                      <input
                        type="text"
                        value={editingItem ? editingItem.responsible || '' : newItem.responsible}
                        onChange={(e) => {
                          if (editingItem) {
                            setEditingItem({ ...editingItem, responsible: e.target.value });
                          } else {
                            setNewItem({ ...newItem, responsible: e.target.value });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Who handles this"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editingItem ? editingItem.notes || '' : newItem.notes}
                      onChange={(e) => {
                        if (editingItem) {
                          setEditingItem({ ...editingItem, notes: e.target.value });
                        } else {
                          setNewItem({ ...newItem, notes: e.target.value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={2}
                      placeholder="Additional notes"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        setNewItem({
                          startTime: '',
                          endTime: '',
                          title: '',
                          description: '',
                          category: 'activity',
                          location: '',
                          responsible: '',
                          preparations: [],
                          notes: ''
                        });
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Timeline View */}
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No itinerary items yet</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Item
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${
                    item.completed ? 'opacity-75 bg-gray-50' : ''
                  }`}
                  style={{ borderLeftColor: ITINERARY_CATEGORIES[item.category].color.includes('blue') ? '#3b82f6' : 
                         ITINERARY_CATEGORIES[item.category].color.includes('green') ? '#10b981' :
                         ITINERARY_CATEGORIES[item.category].color.includes('orange') ? '#f59e0b' :
                         ITINERARY_CATEGORIES[item.category].color.includes('purple') ? '#8b5cf6' : '#6b7280' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="text-sm font-medium text-gray-500">
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          <span className="ml-2 text-xs">
                            ({calculateDuration(item.startTime, item.endTime)})
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ITINERARY_CATEGORIES[item.category].color}`}>
                          {ITINERARY_CATEGORIES[item.category].label}
                        </span>
                      </div>
                      
                      <h3 className={`text-lg font-semibold ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      
                      {item.description && (
                        <p className="text-gray-600 mt-1">{item.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        {item.location && (
                          <span>📍 {item.location}</span>
                        )}
                        {item.responsible && (
                          <span>👤 {item.responsible}</span>
                        )}
                      </div>
                      
                      {item.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-gray-700">
                          💡 {item.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => updateItem(item.id, { completed: !item.completed })}
                        className={`p-2 rounded-full ${
                          item.completed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                        } transition-colors`}
                        title={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {item.completed ? '✓' : '○'}
                      </button>
                      
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        title="Edit item"
                      >
                        ✏️
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (window.confirm('Are you sure you want to delete this item?')) {
                            deleteItem(item.id);
                          }
                        }}
                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="Delete item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ItineraryPlanner;