import { useDatabase } from '../contexts/DatabaseContext';
import { useParties } from './useParties';

interface ImportResult {
  success: boolean;
  message: string;
  importedParties?: number;
  importedGuests?: number;
  importedTasks?: number;
}

export const useDataImport = () => {
  const { executeUpdate, transaction } = useDatabase();
  const { refresh } = useParties();

  const validateImportData = (data: any): boolean => {
    // Basic validation for party export format
    if (data.party && data.guests && data.timelineTasks) {
      return true;
    }
    
    // Validation for full backup format
    if (data.parties && Array.isArray(data.parties)) {
      return true;
    }
    
    return false;
  };

  const importSingleParty = async (partyData: any): Promise<ImportResult> => {
    try {
      if (!validateImportData(partyData)) {
        return {
          success: false,
          message: 'Invalid party data format',
        };
      }

      const { party, guests, timelineTasks } = partyData;

      // Create new party (without ID to avoid conflicts)
      const partyResult = await executeUpdate(
        `INSERT INTO parties (name, date, guest_count, party_type, duration, theme, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          party.name + ' (Imported)',
          party.date,
          party.guest_count,
          party.party_type,
          party.duration,
          party.theme,
          party.notes,
        ]
      );

      const newPartyId = partyResult.lastInsertRowid;

      // Import guests
      const guestQueries = guests.map((guest: any) => ({
        sql: `INSERT INTO guests (party_id, name, email, rsvp, dietary_restrictions, plus_one, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [
          newPartyId,
          guest.name,
          guest.email,
          guest.rsvp,
          guest.dietary_restrictions,
          guest.plus_one,
          guest.notes,
        ],
      }));

      // Import timeline tasks
      const taskQueries = timelineTasks.map((task: any) => ({
        sql: `INSERT INTO timeline_tasks (party_id, task, time_frame, category, completed, is_custom)
              VALUES (?, ?, ?, ?, ?, ?)`,
        params: [
          newPartyId,
          task.task,
          task.time_frame,
          task.category,
          task.completed,
          task.is_custom,
        ],
      }));

      // Execute all imports in a transaction
      await transaction([...guestQueries, ...taskQueries]);
      await refresh();

      return {
        success: true,
        message: `Successfully imported party "${party.name}"`,
        importedParties: 1,
        importedGuests: guests.length,
        importedTasks: timelineTasks.length,
      };
    } catch (error) {
      console.error('Import failed:', error);
      return {
        success: false,
        message: 'Failed to import party data',
      };
    }
  };

  const importAllData = async (data: any): Promise<ImportResult> => {
    try {
      if (!validateImportData(data)) {
        return {
          success: false,
          message: 'Invalid backup data format',
        };
      }

      let totalParties = 0;
      let totalGuests = 0;
      let totalTasks = 0;

      for (const partyData of data.parties) {
        const result = await importSingleParty(partyData);
        if (result.success) {
          totalParties += result.importedParties || 0;
          totalGuests += result.importedGuests || 0;
          totalTasks += result.importedTasks || 0;
        }
      }

      return {
        success: true,
        message: `Successfully imported ${totalParties} parties`,
        importedParties: totalParties,
        importedGuests: totalGuests,
        importedTasks: totalTasks,
      };
    } catch (error) {
      console.error('Full import failed:', error);
      return {
        success: false,
        message: 'Failed to import backup data',
      };
    }
  };

  const importFromFile = async (file: File): Promise<ImportResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // Determine if it's a single party or full backup
          if (data.party) {
            const result = await importSingleParty(data);
            resolve(result);
          } else if (data.parties) {
            const result = await importAllData(data);
            resolve(result);
          } else {
            resolve({
              success: false,
              message: 'Unrecognized file format',
            });
          }
        } catch (error) {
          resolve({
            success: false,
            message: 'Invalid JSON file or corrupted data',
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Failed to read file',
        });
      };

      reader.readAsText(file);
    });
  };

  const importFromJSON = async (jsonString: string): Promise<ImportResult> => {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.party) {
        return await importSingleParty(data);
      } else if (data.parties) {
        return await importAllData(data);
      } else {
        return {
          success: false,
          message: 'Unrecognized data format',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Invalid JSON data',
      };
    }
  };

  return {
    importFromFile,
    importFromJSON,
    importSingleParty,
    importAllData,
  };
};