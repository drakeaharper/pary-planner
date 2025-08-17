import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { ItineraryItem, ItineraryTemplate, DEFAULT_TEMPLATES } from '../types/itinerary';

export const useItinerary = (partyId?: string | number) => {
  const { executeQuery, executeUpdate, transaction, isReady } = useDatabase();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [templates, setTemplates] = useState<ItineraryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!isReady || !partyId) return;

    try {
      const results = await executeQuery(
        'SELECT * FROM itinerary_items WHERE party_id = ? ORDER BY order_index, start_time',
        [partyId]
      );

      const itineraryItems: ItineraryItem[] = results.map(row => ({
        id: row.id.toString(),
        partyId: row.party_id.toString(),
        startTime: row.start_time,
        endTime: row.end_time,
        title: row.title,
        description: row.description,
        category: row.category,
        location: row.location,
        responsible: row.responsible,
        preparations: row.preparations ? JSON.parse(row.preparations) : [],
        notes: row.notes,
        completed: !!row.completed,
        orderIndex: row.order_index || 0,
        createdAt: row.created_at
      }));

      setItems(itineraryItems);
    } catch (err) {
      console.error('Failed to load itinerary items:', err);
      setError('Failed to load itinerary items');
    }
  }, [executeQuery, isReady, partyId]);

  const loadTemplates = useCallback(async () => {
    if (!isReady) return;

    try {
      const results = await executeQuery('SELECT * FROM itinerary_templates ORDER BY name');
      
      const dbTemplates: ItineraryTemplate[] = results.map(row => ({
        id: row.id.toString(),
        name: row.name,
        partyType: row.party_type,
        duration: row.duration,
        description: row.description,
        templateData: row.template_data ? JSON.parse(row.template_data) : [],
        isDefault: !!row.is_default,
        createdAt: row.created_at
      }));

      // Combine with default templates
      setTemplates([...DEFAULT_TEMPLATES, ...dbTemplates]);
    } catch (err) {
      console.error('Failed to load templates:', err);
      // Fall back to default templates only
      setTemplates(DEFAULT_TEMPLATES);
    }
  }, [executeQuery, isReady]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([loadItems(), loadTemplates()]);
      
      setLoading(false);
    };

    loadData();
  }, [loadItems, loadTemplates]);

  const addItem = async (item: Omit<ItineraryItem, 'id' | 'createdAt'>) => {
    if (!isReady || !partyId) return;

    try {
      const maxOrderIndex = items.length > 0 ? Math.max(...items.map(i => i.orderIndex)) : 0;
      const preparations = item.preparations ? JSON.stringify(item.preparations) : null;

      const result = await executeUpdate(
        `INSERT INTO itinerary_items 
         (party_id, start_time, end_time, title, description, category, location, responsible, preparations, notes, completed, order_index) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          partyId.toString(),
          item.startTime,
          item.endTime,
          item.title,
          item.description,
          item.category,
          item.location,
          item.responsible,
          preparations,
          item.notes,
          item.completed ? 1 : 0,
          maxOrderIndex + 1
        ]
      );

      await loadItems();
      return result.lastInsertRowid.toString();
    } catch (err) {
      console.error('Failed to add itinerary item:', err);
      setError('Failed to add itinerary item');
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<ItineraryItem>) => {
    if (!isReady) return;

    try {
      const preparations = updates.preparations ? JSON.stringify(updates.preparations) : undefined;
      
      const setParts: string[] = [];
      const values: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'partyId') {
          const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          setParts.push(`${columnName} = ?`);
          
          if (key === 'preparations') {
            values.push(preparations);
          } else if (typeof value === 'boolean') {
            values.push(value ? 1 : 0);
          } else {
            values.push(value);
          }
        }
      });

      if (setParts.length === 0) return;

      values.push(id);
      await executeUpdate(
        `UPDATE itinerary_items SET ${setParts.join(', ')} WHERE id = ?`,
        values
      );

      await loadItems();
    } catch (err) {
      console.error('Failed to update itinerary item:', err);
      setError('Failed to update itinerary item');
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    if (!isReady) return;

    try {
      await executeUpdate('DELETE FROM itinerary_items WHERE id = ?', [id]);
      await loadItems();
    } catch (err) {
      console.error('Failed to delete itinerary item:', err);
      setError('Failed to delete itinerary item');
      throw err;
    }
  };

  const reorderItems = async (itemIds: string[]) => {
    if (!isReady) return;

    try {
      const updateQueries = itemIds.map((id, index) => ({
        sql: 'UPDATE itinerary_items SET order_index = ? WHERE id = ?',
        params: [index, id]
      }));

      await transaction(updateQueries);
      await loadItems();
    } catch (err) {
      console.error('Failed to reorder items:', err);
      setError('Failed to reorder items');
      throw err;
    }
  };

  const applyTemplate = async (template: ItineraryTemplate, startTime?: string) => {
    if (!isReady || !partyId) return;

    try {
      // Clear existing items
      await executeUpdate('DELETE FROM itinerary_items WHERE party_id = ?', [partyId.toString()]);

      // Apply template items
      const templateItems = template.templateData.map((templateItem, index) => {
        let adjustedStartTime = templateItem.startTime;
        let adjustedEndTime = templateItem.endTime;

        // If startTime is provided, adjust all times relative to it
        if (startTime) {
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [templateHour, templateMinute] = templateItem.startTime.split(':').map(Number);
          const [templateEndHour, templateEndMinute] = templateItem.endTime.split(':').map(Number);

          const adjustedStartMinutes = startHour * 60 + startMinute + templateHour * 60 + templateMinute;
          const adjustedEndMinutes = startHour * 60 + startMinute + templateEndHour * 60 + templateEndMinute;

          adjustedStartTime = `${Math.floor(adjustedStartMinutes / 60).toString().padStart(2, '0')}:${(adjustedStartMinutes % 60).toString().padStart(2, '0')}`;
          adjustedEndTime = `${Math.floor(adjustedEndMinutes / 60).toString().padStart(2, '0')}:${(adjustedEndMinutes % 60).toString().padStart(2, '0')}`;
        }

        return {
          sql: `INSERT INTO itinerary_items 
                (party_id, start_time, end_time, title, description, category, location, responsible, preparations, notes, completed, order_index) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [
            partyId.toString(),
            adjustedStartTime,
            adjustedEndTime,
            templateItem.title,
            templateItem.description || null,
            templateItem.category,
            templateItem.location || null,
            null, // responsible
            templateItem.preparations ? JSON.stringify(templateItem.preparations) : null,
            null, // notes
            0, // completed
            index
          ]
        };
      });

      await transaction(templateItems);
      await loadItems();
    } catch (err) {
      console.error('Failed to apply template:', err);
      setError('Failed to apply template');
      throw err;
    }
  };

  const duplicateItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const duplicatedItem = {
      ...item,
      title: `${item.title} (Copy)`,
      completed: false
    };

    delete (duplicatedItem as any).id;
    delete (duplicatedItem as any).createdAt;

    return addItem(duplicatedItem);
  };

  return {
    items,
    templates,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    applyTemplate,
    duplicateItem,
    refresh: loadItems
  };
};