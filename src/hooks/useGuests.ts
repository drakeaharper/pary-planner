import { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { Guest } from '../types/database';

export const useGuests = (partyId: number | null) => {
  const { executeQuery, executeUpdate, isReady } = useDatabase();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGuests = async () => {
    if (!partyId) {
      setGuests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const results = await executeQuery(
        'SELECT * FROM guests WHERE party_id = ? ORDER BY name',
        [partyId]
      );
      setGuests(results as Guest[]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadGuests();
    }
  }, [isReady, partyId]);

  const addGuest = async (guestData: Omit<Guest, 'id' | 'created_at'>): Promise<number> => {
    try {
      const result = await executeUpdate(
        `INSERT INTO guests (party_id, name, email, rsvp, dietary_restrictions, additional_guests, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          guestData.party_id,
          guestData.name,
          guestData.email,
          guestData.rsvp,
          guestData.dietary_restrictions,
          guestData.additional_guests,
          guestData.notes,
        ]
      );

      await loadGuests();
      return result.lastInsertRowid;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateGuest = async (id: number, updates: Partial<Omit<Guest, 'id' | 'party_id' | 'created_at'>>) => {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      await executeUpdate(
        `UPDATE guests SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
      
      await loadGuests();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteGuest = async (id: number) => {
    try {
      await executeUpdate('DELETE FROM guests WHERE id = ?', [id]);
      await loadGuests();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateRSVP = async (id: number, rsvp: Guest['rsvp']) => {
    await updateGuest(id, { rsvp });
  };

  const getStats = () => {
    const confirmed = guests.filter(g => g.rsvp === 'yes').length;
    const declined = guests.filter(g => g.rsvp === 'no').length;
    const pending = guests.filter(g => g.rsvp === 'pending').length;
    const additionalGuests = guests.filter(g => g.rsvp === 'yes').reduce((sum, g) => sum + g.additional_guests, 0);
    
    return { 
      confirmed, 
      declined, 
      pending, 
      additionalGuests, 
      total: confirmed + additionalGuests,
      totalInvited: guests.length
    };
  };

  return {
    guests,
    loading,
    error,
    addGuest,
    updateGuest,
    deleteGuest,
    updateRSVP,
    refresh: loadGuests,
    stats: getStats(),
  };
};