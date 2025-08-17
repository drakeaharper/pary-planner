import { useDatabase } from '../contexts/DatabaseContext';
import { Party, Guest, TimelineTask } from '../types/database';

interface PartyExport {
  party: Party;
  guests: Guest[];
  timelineTasks: TimelineTask[];
  exportDate: string;
  version: string;
}

export const useDataExport = () => {
  const { executeQuery } = useDatabase();

  const exportParty = async (partyId: number): Promise<string> => {
    try {
      // Get party data
      const partyResults = await executeQuery('SELECT * FROM parties WHERE id = ?', [partyId]);
      if (partyResults.length === 0) {
        throw new Error('Party not found');
      }
      const party = partyResults[0] as Party;

      // Get guests
      const guests = await executeQuery('SELECT * FROM guests WHERE party_id = ?', [partyId]) as Guest[];

      // Get timeline tasks
      const timelineTasks = await executeQuery('SELECT * FROM timeline_tasks WHERE party_id = ?', [partyId]) as TimelineTask[];

      const exportData: PartyExport = {
        party,
        guests,
        timelineTasks,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const exportAllData = async (): Promise<string> => {
    try {
      // Get all parties
      const parties = await executeQuery('SELECT * FROM parties ORDER BY created_at DESC') as Party[];
      
      const allData = {
        parties: [],
        exportDate: new Date().toISOString(),
        version: '1.0',
      } as any;

      // Export each party with its data
      for (const party of parties) {
        const guests = await executeQuery('SELECT * FROM guests WHERE party_id = ?', [party.id]) as Guest[];
        const timelineTasks = await executeQuery('SELECT * FROM timeline_tasks WHERE party_id = ?', [party.id]) as TimelineTask[];
        
        allData.parties.push({
          party,
          guests,
          timelineTasks,
        });
      }

      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Full export failed:', error);
      throw error;
    }
  };

  const downloadData = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPartyAsFile = async (partyId: number, partyName: string) => {
    try {
      const data = await exportParty(partyId);
      const filename = `party-${partyName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.json`;
      downloadData(data, filename);
    } catch (error) {
      throw new Error('Failed to export party data');
    }
  };

  const exportAllAsFile = async () => {
    try {
      const data = await exportAllData();
      const filename = `party-planner-backup-${Date.now()}.json`;
      downloadData(data, filename);
    } catch (error) {
      throw new Error('Failed to export all data');
    }
  };

  return {
    exportParty,
    exportAllData,
    exportPartyAsFile,
    exportAllAsFile,
  };
};