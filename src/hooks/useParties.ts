import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { Party } from '../types/database';
import { DEFAULT_TIMELINE_TASKS } from '../database/schema';

export const useParties = () => {
  const { executeQuery, executeUpdate, transaction, isReady } = useDatabase();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadParties = useCallback(async () => {
    try {
      setLoading(true);
      const results = await executeQuery(
        'SELECT * FROM parties ORDER BY created_at DESC'
      );
      setParties(results as Party[]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [executeQuery]);

  useEffect(() => {
    if (isReady) {
      loadParties();
    }
  }, [isReady, loadParties]);

  const createParty = useCallback(async (partyData: Omit<Party, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
    try {
      const result = await executeUpdate(
        `INSERT INTO parties (name, date, guest_count, party_type, duration, theme, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          partyData.name,
          partyData.date,
          partyData.guest_count,
          partyData.party_type,
          partyData.duration,
          partyData.theme,
          partyData.notes,
        ]
      );

      const partyId = result.lastInsertRowid;

      // Add default timeline tasks for new party
      const taskQueries = DEFAULT_TIMELINE_TASKS.map(task => ({
        sql: `INSERT INTO timeline_tasks (party_id, task, time_frame, category, is_custom)
              VALUES (?, ?, ?, ?, ?)`,
        params: [partyId, task.task, task.time_frame, task.category, false]
      }));

      await transaction(taskQueries);
      await loadParties();
      
      return partyId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [executeUpdate, transaction, loadParties]);

  const updateParty = useCallback(async (id: number, updates: Partial<Omit<Party, 'id' | 'created_at'>>) => {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      await executeUpdate(
        `UPDATE parties SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      
      await loadParties();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [executeUpdate, loadParties]);

  const deleteParty = useCallback(async (id: number) => {
    try {
      await executeUpdate('DELETE FROM parties WHERE id = ?', [id]);
      await loadParties();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [executeUpdate, loadParties]);

  const getParty = useCallback(async (id: number): Promise<Party | null> => {
    try {
      const results = await executeQuery('SELECT * FROM parties WHERE id = ?', [id]);
      return results.length > 0 ? results[0] as Party : null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [executeQuery]);

  return {
    parties,
    loading,
    error,
    createParty,
    updateParty,
    deleteParty,
    getParty,
    refresh: loadParties,
  };
};