import { useState } from 'react';
import { useCurrentParty } from '../contexts/PartyContext';
import { useTimelineTasks } from '../hooks/useTimelineTasks';
import PartySelector from '../components/PartySelector';

const TimelinePlanner = () => {
  const { currentParty, currentPartyId, setCurrentPartyId } = useCurrentParty();
  const { addTask, toggleTask, deleteTask, loading, tasksByTimeFrame, completionStats } = useTimelineTasks(currentPartyId);
  const [newTask, setNewTask] = useState({ task: '', time_frame: '', category: 'planning' as const });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTask = async () => {
    if (!newTask.task.trim() || !newTask.time_frame.trim() || !currentPartyId) return;
    
    try {
      await addTask({
        party_id: currentPartyId,
        task: newTask.task,
        time_frame: newTask.time_frame,
        category: newTask.category,
        completed: false,
        is_custom: true,
      });
      
      setNewTask({ task: '', time_frame: '', category: 'planning' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleToggleTask = async (id: number) => {
    try {
      await toggleTask(id);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleRemoveTask = async (id: number) => {
    try {
      await deleteTask(id);
    } catch (error) {
      console.error('Failed to remove task:', error);
    }
  };

  const timeFrameOrder = [
    '4-6 weeks before',
    '2-3 weeks before',
    '1 week before',
    '2-3 days before',
    'Day before',
    'Day of party',
  ];

  const categoryColors = {
    planning: 'bg-blue-50 text-blue-700 border-blue-200',
    shopping: 'bg-green-50 text-green-700 border-green-200',
    preparation: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    setup: 'bg-purple-50 text-purple-700 border-purple-200',
    'day-of': 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          📅 Timeline Planner
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stay organized with a complete timeline for your party planning. 
          Never forget an important task again!
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
            Please select or create a party to manage your timeline.
          </p>
        </div>
      ) : (
        <>
          {/* Party Info and Progress */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentParty?.name}
                </h2>
                {currentParty?.date && (
                  <p className="text-sm text-gray-600">
                    {new Date(currentParty.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {completionStats.percentage}%
                </div>
                <div className="text-sm text-gray-600">
                  {completionStats.completed} of {completionStats.total} tasks completed
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionStats.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Add Custom Task */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Add Custom Task
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Custom Task</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Description
                  </label>
                  <input
                    type="text"
                    value={newTask.task}
                    onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What needs to be done?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="shopping">Shopping</option>
                    <option value="preparation">Preparation</option>
                    <option value="setup">Setup</option>
                    <option value="day-of">Day Of</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Frame
                  </label>
                  <input
                    type="text"
                    value={newTask.time_frame}
                    onChange={(e) => setNewTask({ ...newTask, time_frame: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., '1 week before', 'Day of party'"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleAddTask}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Add Task
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

          {/* Timeline */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading timeline...</p>
              </div>
            ) : (
              timeFrameOrder.map(timeFrame => {
                const timeFrameTasks = tasksByTimeFrame[timeFrame] || [];
                if (timeFrameTasks.length === 0) return null;

                return (
                  <div key={timeFrame} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-800">{timeFrame}</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        {timeFrameTasks.map(task => (
                          <div key={task.id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleTask(task.id)}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <span className={`text-sm px-2 py-1 rounded border ${categoryColors[task.category]}`}>
                              {task.category}
                            </span>
                            <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {task.task}
                            </span>
                            {task.is_custom && (
                              <button
                                onClick={() => handleRemoveTask(task.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Remove task"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TimelinePlanner;