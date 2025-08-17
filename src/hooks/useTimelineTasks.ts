import { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { TimelineTask } from '../types/database';

export const useTimelineTasks = (partyId: number | null) => {
  const { executeQuery, executeUpdate, isReady } = useDatabase();
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    if (!partyId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const results = await executeQuery(
        'SELECT * FROM timeline_tasks WHERE party_id = ? ORDER BY time_frame, created_at',
        [partyId]
      );
      setTasks(results as TimelineTask[]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadTasks();
    }
  }, [isReady, partyId]);

  const addTask = async (taskData: Omit<TimelineTask, 'id' | 'created_at'>): Promise<number> => {
    try {
      const result = await executeUpdate(
        `INSERT INTO timeline_tasks (party_id, task, time_frame, category, completed, is_custom)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          taskData.party_id,
          taskData.task,
          taskData.time_frame,
          taskData.category,
          taskData.completed,
          taskData.is_custom,
        ]
      );

      await loadTasks();
      return result.lastInsertRowid;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (id: number, updates: Partial<Omit<TimelineTask, 'id' | 'party_id' | 'created_at'>>) => {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      await executeUpdate(
        `UPDATE timeline_tasks SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
      
      await loadTasks();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await executeUpdate('DELETE FROM timeline_tasks WHERE id = ?', [id]);
      await loadTasks();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  const getTasksByTimeFrame = () => {
    const grouped = tasks.reduce((groups, task) => {
      const timeFrame = task.time_frame;
      if (!groups[timeFrame]) groups[timeFrame] = [];
      groups[timeFrame].push(task);
      return groups;
    }, {} as Record<string, TimelineTask[]>);

    return grouped;
  };

  const getCompletionStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    refresh: loadTasks,
    tasksByTimeFrame: getTasksByTimeFrame(),
    completionStats: getCompletionStats(),
  };
};