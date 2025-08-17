import { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { BeverageCalculation } from '../types/database';

export const useBeverageCalculations = (partyId: number | null) => {
  const { executeQuery, executeUpdate, isReady } = useDatabase();
  const [calculations, setCalculations] = useState<BeverageCalculation[]>([]);
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
        'SELECT * FROM beverage_calculations WHERE party_id = ? ORDER BY calculated_at DESC',
        [partyId]
      );
      setCalculations(results as BeverageCalculation[]);
    } catch (error) {
      console.error('Failed to load beverage calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadCalculations();
    }
  }, [isReady, partyId]);

  const saveCalculation = async (
    guestCount: number,
    duration: number,
    partyType: string,
    includeAlcohol: boolean,
    waterBottles: number,
    softDrinks: number,
    beerBottles: number,
    wineBottles: number,
    cocktailServings: number
  ): Promise<void> => {
    if (!partyId) throw new Error('No party selected');

    try {
      await executeUpdate(
        `INSERT INTO beverage_calculations (
          party_id, guest_count, duration, party_type, include_alcohol,
          water_bottles, soft_drinks, beer_bottles, wine_bottles, cocktail_servings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          partyId, guestCount, duration, partyType, includeAlcohol,
          waterBottles, softDrinks, beerBottles, wineBottles, cocktailServings
        ]
      );
      
      await loadCalculations();
    } catch (error) {
      console.error('Failed to save beverage calculation:', error);
      throw error;
    }
  };

  const deleteCalculation = async (id: number): Promise<void> => {
    try {
      await executeUpdate('DELETE FROM beverage_calculations WHERE id = ?', [id]);
      await loadCalculations();
    } catch (error) {
      console.error('Failed to delete calculation:', error);
      throw error;
    }
  };

  const getLatestCalculation = (): BeverageCalculation | null => {
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