import React, { useState } from 'react';
import { useCurrentParty } from '../contexts/PartyContext';
import { useTodos } from '../hooks/useTodos';
import { TodoItem, TodoTemplate, TODO_CATEGORIES, TODO_PRIORITIES, formatEstimatedTime, getTaskUrgency } from '../types/todo';
import PartySelector from '../components/PartySelector';

type ViewMode = 'list' | 'kanban' | 'calendar';
type FilterBy = 'all' | 'pending' | 'completed' | 'overdue';

const TodoManager: React.FC = () => {
  const { currentParty, currentPartyId, setCurrentPartyId } = useCurrentParty();
  const { todos, templates, loading, error, addTodo, updateTodo, deleteTodo, applyTemplate, getTaskStats } = useTodos(currentPartyId?.toString());
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TodoTemplate | null>(null);
  
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    category: 'planning' as const,
    priority: 'medium' as const,
    dueDate: '',
    estimatedTime: '',
    assignedTo: '',
    location: '',
    estimatedCost: '',
    notes: ''
  });

  const stats = getTaskStats();

  const filteredTodos = todos.filter(todo => {
    switch (filterBy) {
      case 'pending': return !todo.completed;
      case 'completed': return todo.completed;
      case 'overdue': return !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date();
      default: return true;
    }
  });

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentParty || !currentPartyId || !newTodo.title) return;

    try {
      await addTodo({
        partyId: currentPartyId.toString(),
        title: newTodo.title,
        description: newTodo.description || undefined,
        category: newTodo.category,
        priority: newTodo.priority,
        dueDate: newTodo.dueDate || undefined,
        estimatedTime: newTodo.estimatedTime ? parseInt(newTodo.estimatedTime) : undefined,
        assignedTo: newTodo.assignedTo || undefined,
        location: newTodo.location || undefined,
        estimatedCost: newTodo.estimatedCost ? parseFloat(newTodo.estimatedCost) : undefined,
        notes: newTodo.notes || undefined,
        completed: false
      });

      setNewTodo({
        title: '',
        description: '',
        category: 'planning',
        priority: 'medium',
        dueDate: '',
        estimatedTime: '',
        assignedTo: '',
        location: '',
        estimatedCost: '',
        notes: ''
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add todo:', err);
    }
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;

    try {
      await updateTodo(editingTodo.id, editingTodo);
      setEditingTodo(null);
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !currentParty) return;

    try {
      await applyTemplate(selectedTemplate, currentParty.date);
      setSelectedTemplate(null);
      setShowTemplates(false);
    } catch (err) {
      console.error('Failed to apply template:', err);
    }
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getUrgencyColor = (dueDate?: string) => {
    const urgency = getTaskUrgency(dueDate);
    switch (urgency) {
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'urgent': return 'text-orange-600 bg-orange-50';
      case 'soon': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading todos...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Todo Manager</h1>
        <p className="text-gray-600 mb-6">
          Manage all your party planning tasks with priorities, deadlines, and smart organization.
        </p>
        <PartySelector 
          selectedPartyId={currentPartyId}
          onPartySelect={setCurrentPartyId}
        />
      </div>

      {!currentParty && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">Select a party to start managing your todos.</p>
        </div>
      )}

      {currentParty && (
        <>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Task
              </button>
              
              <button
                onClick={() => setShowTemplates(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Use Template
              </button>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg overflow-hidden">
                {(['list', 'kanban'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 text-sm capitalize ${
                      viewMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterBy)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
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
                      {template.partyType && (
                        <div className="text-sm text-gray-600 capitalize">{template.partyType} party</div>
                      )}
                      {template.guestCountRange && (
                        <div className="text-sm text-gray-500">{template.guestCountRange} guests</div>
                      )}
                    </button>
                  ))}
                </div>

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
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Todo Form */}
          {(showAddForm || editingTodo) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                  {editingTodo ? 'Edit Task' : 'Add New Task'}
                </h3>
                
                <form onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingTodo ? editingTodo.title : newTodo.title}
                      onChange={(e) => {
                        if (editingTodo) {
                          setEditingTodo({ ...editingTodo, title: e.target.value });
                        } else {
                          setNewTodo({ ...newTodo, title: e.target.value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Task title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={editingTodo ? editingTodo.category : newTodo.category}
                        onChange={(e) => {
                          const category = e.target.value as any;
                          if (editingTodo) {
                            setEditingTodo({ ...editingTodo, category });
                          } else {
                            setNewTodo({ ...newTodo, category });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        {Object.entries(TODO_CATEGORIES).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={editingTodo ? editingTodo.priority : newTodo.priority}
                        onChange={(e) => {
                          const priority = e.target.value as any;
                          if (editingTodo) {
                            setEditingTodo({ ...editingTodo, priority });
                          } else {
                            setNewTodo({ ...newTodo, priority });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        {Object.entries(TODO_PRIORITIES).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingTodo ? editingTodo.description || '' : newTodo.description}
                      onChange={(e) => {
                        if (editingTodo) {
                          setEditingTodo({ ...editingTodo, description: e.target.value });
                        } else {
                          setNewTodo({ ...newTodo, description: e.target.value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="Task description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={editingTodo ? editingTodo.dueDate || '' : newTodo.dueDate}
                        onChange={(e) => {
                          if (editingTodo) {
                            setEditingTodo({ ...editingTodo, dueDate: e.target.value });
                          } else {
                            setNewTodo({ ...newTodo, dueDate: e.target.value });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Time (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingTodo ? editingTodo.estimatedTime || '' : newTodo.estimatedTime}
                        onChange={(e) => {
                          if (editingTodo) {
                            setEditingTodo({ ...editingTodo, estimatedTime: e.target.value ? parseInt(e.target.value) : undefined });
                          } else {
                            setNewTodo({ ...newTodo, estimatedTime: e.target.value });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Duration in minutes"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned To
                      </label>
                      <input
                        type="text"
                        value={editingTodo ? editingTodo.assignedTo || '' : newTodo.assignedTo}
                        onChange={(e) => {
                          if (editingTodo) {
                            setEditingTodo({ ...editingTodo, assignedTo: e.target.value });
                          } else {
                            setNewTodo({ ...newTodo, assignedTo: e.target.value });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Who's responsible"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Cost ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingTodo ? editingTodo.estimatedCost || '' : newTodo.estimatedCost}
                        onChange={(e) => {
                          if (editingTodo) {
                            setEditingTodo({ ...editingTodo, estimatedCost: e.target.value ? parseFloat(e.target.value) : undefined });
                          } else {
                            setNewTodo({ ...newTodo, estimatedCost: e.target.value });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Expected cost"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editingTodo ? editingTodo.location || '' : newTodo.location}
                      onChange={(e) => {
                        if (editingTodo) {
                          setEditingTodo({ ...editingTodo, location: e.target.value });
                        } else {
                          setNewTodo({ ...newTodo, location: e.target.value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Where to do this task"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editingTodo ? editingTodo.notes || '' : newTodo.notes}
                      onChange={(e) => {
                        if (editingTodo) {
                          setEditingTodo({ ...editingTodo, notes: e.target.value });
                        } else {
                          setNewTodo({ ...newTodo, notes: e.target.value });
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
                      {editingTodo ? 'Update Task' : 'Add Task'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingTodo(null);
                        setNewTodo({
                          title: '',
                          description: '',
                          category: 'planning',
                          priority: 'medium',
                          dueDate: '',
                          estimatedTime: '',
                          assignedTo: '',
                          location: '',
                          estimatedCost: '',
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

          {/* Task List */}
          <div className="space-y-4">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">
                  {filterBy === 'all' ? 'No tasks yet' : `No ${filterBy} tasks`}
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Task
                </button>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`bg-white rounded-lg shadow-sm border p-4 ${
                    todo.completed ? 'opacity-75 bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-lg font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {todo.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${TODO_CATEGORIES[todo.category].color}`}>
                          {TODO_CATEGORIES[todo.category].icon} {TODO_CATEGORIES[todo.category].label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${TODO_PRIORITIES[todo.priority].color}`}>
                          {TODO_PRIORITIES[todo.priority].icon} {TODO_PRIORITIES[todo.priority].label}
                        </span>
                      </div>

                      {todo.description && (
                        <p className="text-gray-600 mb-2">{todo.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {todo.dueDate && (
                          <span className={`px-2 py-1 rounded ${getUrgencyColor(todo.dueDate)}`}>
                            📅 Due: {formatDueDate(todo.dueDate)}
                          </span>
                        )}
                        {todo.estimatedTime && (
                          <span>⏱️ {formatEstimatedTime(todo.estimatedTime)}</span>
                        )}
                        {todo.assignedTo && (
                          <span>👤 {todo.assignedTo}</span>
                        )}
                        {todo.location && (
                          <span>📍 {todo.location}</span>
                        )}
                        {todo.estimatedCost && (
                          <span>💰 ${todo.estimatedCost}</span>
                        )}
                      </div>

                      {todo.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-gray-700">
                          💡 {todo.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => updateTodo(todo.id, { completed: !todo.completed })}
                        className={`p-2 rounded-full ${
                          todo.completed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                        } transition-colors`}
                        title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {todo.completed ? '✓' : '○'}
                      </button>

                      <button
                        onClick={() => setEditingTodo(todo)}
                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        title="Edit task"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (window.confirm('Are you sure you want to delete this task?')) {
                            deleteTodo(todo.id);
                          }
                        }}
                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="Delete task"
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

export default TodoManager;