import { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { PizzaCalculation } from '../types/database';

export const usePizzaCalculations = (partyId: number | null) => {
  const { executeQuery, executeUpdate, isReady } = useDatabase();
  const [calculations, setCalculations] = useState<PizzaCalculation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCalculations = async () => {
    if (!partyId) {
      setCalculations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const results = await executeQuery(
        'SELECT * FROM pizza_calculations WHERE party_id = ? ORDER BY calculated_at DESC',
        [partyId]
      );
      setCalculations(results as PizzaCalculation[]);
    } catch (error) {
      console.error('Failed to load pizza calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadCalculations();
    }
  }, [isReady, partyId]);

  const saveCalculation = async (guestCount: number, pizzasNeeded: number): Promise<void> => {
    if (!partyId) throw new Error('No party selected');

    try {
      await executeUpdate(
        `INSERT INTO pizza_calculations (party_id, guest_count, pizzas_needed)
         VALUES (?, ?, ?)`,
        [partyId, guestCount, pizzasNeeded]
      );
      
      await loadCalculations();
    } catch (error) {
      console.error('Failed to save pizza calculation:', error);
      throw error;
    }
  };

  const deleteCalculation = async (id: number): Promise<void> => {
    try {
      await executeUpdate('DELETE FROM pizza_calculations WHERE id = ?', [id]);
      await loadCalculations();
    } catch (error) {
      console.error('Failed to delete calculation:', error);
      throw error;
    }
  };

  const getLatestCalculation = (): PizzaCalculation | null => {
    return calculations.length > 0 ? calculations[0] : null;
  };

  return {
    calculations,
    loading,
    saveCalculation,
    deleteCalculation,
    getLatestCalculation,
    refresh: loadCalculations,
  };
};