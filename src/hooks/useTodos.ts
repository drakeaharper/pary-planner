import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { TodoItem, SubTask, Attachment, TodoTemplate, DEFAULT_TODO_TEMPLATES } from '../types/todo';

export const useTodos = (partyId?: string | number) => {
  const { executeQuery, executeUpdate, transaction, isReady } = useDatabase();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [templates, setTemplates] = useState<TodoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    if (!isReady || !partyId) return;

    try {
      // Load todos with their subtasks, dependencies, and attachments
      const todoResults = await executeQuery(
        'SELECT * FROM todo_items WHERE party_id = ? ORDER BY completed ASC, priority DESC, due_date ASC',
        [partyId.toString()]
      );

      const todos: TodoItem[] = await Promise.all(
        todoResults.map(async (row) => {
          const todoId = row.id.toString();

          // Load subtasks
          const subtaskResults = await executeQuery(
            'SELECT * FROM todo_subtasks WHERE todo_id = ? ORDER BY order_index',
            [todoId]
          );

          const subtasks: SubTask[] = subtaskResults.map(sub => ({
            id: sub.id.toString(),
            todoId: sub.todo_id.toString(),
            title: sub.title,
            completed: !!sub.completed,
            orderIndex: sub.order_index || 0
          }));

          // Load dependencies
          const depResults = await executeQuery(
            'SELECT depends_on_id FROM todo_dependencies WHERE todo_id = ?',
            [todoId]
          );

          const dependencies = depResults.map(dep => dep.depends_on_id.toString());

          // Load attachments
          const attachResults = await executeQuery(
            'SELECT * FROM todo_attachments WHERE todo_id = ?',
            [todoId]
          );

          const attachments: Attachment[] = attachResults.map(att => ({
            id: att.id.toString(),
            todoId: att.todo_id.toString(),
            name: att.name,
            type: att.type,
            url: att.url
          }));

          return {
            id: todoId,
            partyId: row.party_id.toString(),
            title: row.title,
            description: row.description,
            category: row.category,
            priority: row.priority,
            dueDate: row.due_date,
            estimatedTime: row.estimated_time,
            completed: !!row.completed,
            assignedTo: row.assigned_to,
            location: row.location,
            estimatedCost: row.estimated_cost,
            actualCost: row.actual_cost,
            notes: row.notes,
            createdAt: row.created_at,
            completedAt: row.completed_at,
            subtasks,
            dependencies,
            attachments
          };
        })
      );

      setTodos(todos);
    } catch (err) {
      console.error('Failed to load todos:', err);
      setError('Failed to load todos');
    }
  }, [executeQuery, isReady, partyId]);

  const loadTemplates = useCallback(async () => {
    if (!isReady) return;

    try {
      const results = await executeQuery('SELECT * FROM todo_templates ORDER BY name');
      
      const dbTemplates: TodoTemplate[] = results.map(row => ({
        id: row.id.toString(),
        name: row.name,
        partyType: row.party_type,
        guestCountRange: row.guest_count_range,
        templateData: row.template_data ? JSON.parse(row.template_data) : [],
        isDefault: !!row.is_default,
        createdAt: row.created_at
      }));

      setTemplates([...DEFAULT_TODO_TEMPLATES, ...dbTemplates]);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setTemplates(DEFAULT_TODO_TEMPLATES);
    }
  }, [executeQuery, isReady]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([loadTodos(), loadTemplates()]);
      
      setLoading(false);
    };

    loadData();
  }, [loadTodos, loadTemplates]);

  const addTodo = async (todo: Omit<TodoItem, 'id' | 'createdAt' | 'subtasks' | 'dependencies' | 'attachments'>) => {
    if (!isReady || !partyId) return;

    try {
      const result = await executeUpdate(
        `INSERT INTO todo_items 
         (party_id, title, description, category, priority, due_date, estimated_time, completed, assigned_to, location, estimated_cost, actual_cost, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          partyId.toString(),
          todo.title,
          todo.description,
          todo.category,
          todo.priority,
          todo.dueDate,
          todo.estimatedTime,
          todo.completed ? 1 : 0,
          todo.assignedTo,
          todo.location,
          todo.estimatedCost,
          todo.actualCost,
          todo.notes
        ]
      );

      await loadTodos();
      return result.lastInsertRowid.toString();
    } catch (err) {
      console.error('Failed to add todo:', err);
      setError('Failed to add todo');
      throw err;
    }
  };

  const updateTodo = async (id: string, updates: Partial<TodoItem>) => {
    if (!isReady) return;

    try {
      const setParts: string[] = [];
      const values: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'partyId' && 
            key !== 'subtasks' && key !== 'dependencies' && key !== 'attachments') {
          const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          setParts.push(`${columnName} = ?`);
          
          if (typeof value === 'boolean') {
            values.push(value ? 1 : 0);
          } else {
            values.push(value);
          }
        }
      });

      if (setParts.length === 0) return;

      // Add completed_at timestamp if marking as completed
      if (updates.completed === true) {
        setParts.push('completed_at = CURRENT_TIMESTAMP');
      } else if (updates.completed === false) {
        setParts.push('completed_at = NULL');
      }

      values.push(id);
      await executeUpdate(
        `UPDATE todo_items SET ${setParts.join(', ')} WHERE id = ?`,
        values
      );

      await loadTodos();
    } catch (err) {
      console.error('Failed to update todo:', err);
      setError('Failed to update todo');
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    if (!isReady) return;

    try {
      // Dependencies will be automatically deleted due to CASCADE
      await executeUpdate('DELETE FROM todo_items WHERE id = ?', [id]);
      await loadTodos();
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('Failed to delete todo');
      throw err;
    }
  };

  const addSubtask = async (todoId: string, title: string) => {
    if (!isReady) return;

    try {
      const maxOrderResult = await executeQuery(
        'SELECT MAX(order_index) as max_order FROM todo_subtasks WHERE todo_id = ?',
        [todoId]
      );
      const nextOrder = (maxOrderResult[0]?.max_order || 0) + 1;

      await executeUpdate(
        'INSERT INTO todo_subtasks (todo_id, title, completed, order_index) VALUES (?, ?, ?, ?)',
        [todoId, title, 0, nextOrder]
      );

      await loadTodos();
    } catch (err) {
      console.error('Failed to add subtask:', err);
      setError('Failed to add subtask');
      throw err;
    }
  };

  const updateSubtask = async (subtaskId: string, updates: Partial<SubTask>) => {
    if (!isReady) return;

    try {
      const setParts: string[] = [];
      const values: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'todoId') {
          const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          setParts.push(`${columnName} = ?`);
          
          if (typeof value === 'boolean') {
            values.push(value ? 1 : 0);
          } else {
            values.push(value);
          }
        }
      });

      if (setParts.length === 0) return;

      values.push(subtaskId);
      await executeUpdate(
        `UPDATE todo_subtasks SET ${setParts.join(', ')} WHERE id = ?`,
        values
      );

      await loadTodos();
    } catch (err) {
      console.error('Failed to update subtask:', err);
      setError('Failed to update subtask');
      throw err;
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    if (!isReady) return;

    try {
      await executeUpdate('DELETE FROM todo_subtasks WHERE id = ?', [subtaskId]);
      await loadTodos();
    } catch (err) {
      console.error('Failed to delete subtask:', err);
      setError('Failed to delete subtask');
      throw err;
    }
  };

  const addDependency = async (todoId: string, dependsOnId: string) => {
    if (!isReady) return;

    try {
      await executeUpdate(
        'INSERT INTO todo_dependencies (todo_id, depends_on_id) VALUES (?, ?)',
        [todoId, dependsOnId]
      );

      await loadTodos();
    } catch (err) {
      console.error('Failed to add dependency:', err);
      setError('Failed to add dependency');
      throw err;
    }
  };

  const removeDependency = async (todoId: string, dependsOnId: string) => {
    if (!isReady) return;

    try {
      await executeUpdate(
        'DELETE FROM todo_dependencies WHERE todo_id = ? AND depends_on_id = ?',
        [todoId, dependsOnId]
      );

      await loadTodos();
    } catch (err) {
      console.error('Failed to remove dependency:', err);
      setError('Failed to remove dependency');
      throw err;
    }
  };

  const applyTemplate = async (template: TodoTemplate, partyDate?: string) => {
    if (!isReady || !partyId) return;

    try {
      const baseDate = partyDate ? new Date(partyDate) : new Date();
      
      const todoQueries = template.templateData.map(templateItem => {
        let dueDate;
        if (templateItem.daysBeforeParty !== undefined) {
          dueDate = new Date(baseDate);
          dueDate.setDate(dueDate.getDate() - templateItem.daysBeforeParty);
        }

        return {
          sql: `INSERT INTO todo_items 
                (party_id, title, description, category, priority, due_date, estimated_time, completed, estimated_cost) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [
            partyId.toString(),
            templateItem.title,
            templateItem.description || null,
            templateItem.category,
            templateItem.priority,
            dueDate ? dueDate.toISOString().split('T')[0] : null,
            templateItem.estimatedTime || null,
            0,
            templateItem.estimatedCost || null
          ]
        };
      });

      await transaction(todoQueries);
      await loadTodos();
    } catch (err) {
      console.error('Failed to apply template:', err);
      setError('Failed to apply template');
      throw err;
    }
  };

  const getTaskStats = useCallback(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const overdue = todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length;
    const totalCost = todos.reduce((sum, t) => sum + (t.actualCost || t.estimatedCost || 0), 0);
    const totalTime = todos.filter(t => !t.completed).reduce((sum, t) => sum + (t.estimatedTime || 0), 0);

    const byCategory = todos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = todos.reduce((acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      completed,
      pending: total - completed,
      overdue,
      totalCost,
      totalTime,
      byCategory,
      byPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [todos]);

  return {
    todos,
    templates,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addDependency,
    removeDependency,
    applyTemplate,
    getTaskStats,
    refresh: loadTodos
  };
};