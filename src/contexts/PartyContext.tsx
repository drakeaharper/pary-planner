import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Party } from '../types/database';
import { useParties } from '../hooks/useParties';

interface PartyContextType {
  currentParty: Party | null;
  currentPartyId: number | null;
  setCurrentPartyId: (id: number | null) => void;
  loading: boolean;
}

const PartyContext = createContext<PartyContextType | undefined>(undefined);

interface PartyProviderProps {
  children: ReactNode;
}

export const PartyProvider: React.FC<PartyProviderProps> = ({ children }) => {
  const [currentPartyId, setCurrentPartyId] = useState<number | null>(null);
  const [currentParty, setCurrentParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(false);
  const { getParty } = useParties();

  // Load party details when party ID changes
  useEffect(() => {
    const loadCurrentParty = async () => {
      if (!currentPartyId) {
        setCurrentParty(null);
        return;
      }

      setLoading(true);
      try {
        const party = await getParty(currentPartyId);
        setCurrentParty(party);
      } catch (error) {
        console.error('Failed to load party:', error);
        setCurrentParty(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentParty();
  }, [currentPartyId, getParty]);

  // Persist selected party ID to localStorage
  useEffect(() => {
    if (currentPartyId) {
      localStorage.setItem('selected-party-id', currentPartyId.toString());
    } else {
      localStorage.removeItem('selected-party-id');
    }
  }, [currentPartyId]);

  // Load persisted party ID on mount
  useEffect(() => {
    const savedPartyId = localStorage.getItem('selected-party-id');
    if (savedPartyId) {
      setCurrentPartyId(parseInt(savedPartyId));
    }
  }, []);

  const value: PartyContextType = {
    currentParty,
    currentPartyId,
    setCurrentPartyId,
    loading,
  };

  return (
    <PartyContext.Provider value={value}>
      {children}
    </PartyContext.Provider>
  );
};

export const useCurrentParty = (): PartyContextType => {
  const context = useContext(PartyContext);
  if (context === undefined) {
    throw new Error('useCurrentParty must be used within a PartyProvider');
  }
  return context;
};