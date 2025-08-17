import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import initSqlJs, { Database } from 'sql.js';
import { DATABASE_SCHEMA } from '../database/schema';
import { DatabaseError } from '../types/database';
import { runMigrations } from '../database/migrations';

interface DatabaseContextType {
  db: Database | null;
  isReady: boolean;
  isLoading: boolean;
  error: DatabaseError | null;
  executeQuery: (sql: string, params?: any[]) => Promise<any[]>;
  executeUpdate: (sql: string, params?: any[]) => Promise<{ changes: number; lastInsertRowid: number }>;
  transaction: (queries: { sql: string; params?: any[] }[]) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [db, setDb] = useState<Database | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<DatabaseError | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const SQL = await initSqlJs({
          locateFile: (file) => {
            // Use the current page's base URL to determine the correct path
            const baseUrl = new URL(window.location.href);
            const isGitHubPages = baseUrl.hostname.includes('github.io');
            
            if (isGitHubPages) {
              // For GitHub Pages, use the full pathname as base
              const pathParts = baseUrl.pathname.split('/').filter(part => part);
              const repoName = pathParts[0] || 'pary-planner';
              return `/${repoName}/${file}`;
            } else {
              // For local development, files are in the public directory
              return file;
            }
          }
        });

        if (!mounted) return;

        // Try to load existing database from localStorage
        let database: Database;
        const savedDb = localStorage.getItem('party-planner-db');
        
        if (savedDb) {
          try {
            const buffer = new Uint8Array(JSON.parse(savedDb));
            database = new SQL.Database(buffer);
          } catch (e) {
            console.warn('Failed to load saved database, creating new one:', e);
            database = new SQL.Database();
          }
        } else {
          database = new SQL.Database();
        }

        // Initialize schema
        database.exec(DATABASE_SCHEMA);

        // Create helper functions for migrations
        const executeQuery = async (sql: string, params: any[] = []): Promise<any[]> => {
          const stmt = database.prepare(sql);
          const results: any[] = [];
          stmt.bind(params);
          while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row);
          }
          stmt.free();
          return results;
        };

        const executeUpdate = async (sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number }> => {
          const stmt = database.prepare(sql);
          stmt.bind(params);
          stmt.step();
          const changes = database.getRowsModified();
          const lastInsertRowid = database.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] as number || 0;
          stmt.free();
          return { changes, lastInsertRowid };
        };

        const transaction = async (queries: { sql: string; params?: any[] }[]): Promise<void> => {
          database.exec('BEGIN TRANSACTION');
          try {
            for (const query of queries) {
              const stmt = database.prepare(query.sql);
              stmt.bind(query.params || []);
              stmt.step();
              stmt.free();
            }
            database.exec('COMMIT');
          } catch (error) {
            database.exec('ROLLBACK');
            throw error;
          }
        };

        // Run migrations
        await runMigrations(executeQuery, executeUpdate, transaction);

        setDb(database);
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        if (mounted) {
          setError({
            message: 'Failed to initialize database',
            code: 'INIT_ERROR'
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeDatabase();

    return () => {
      mounted = false;
    };
  }, []);

  // Save database to localStorage periodically
  useEffect(() => {
    if (!db || !isReady) return;

    const saveDatabase = () => {
      try {
        const data = db.export();
        const buffer = Array.from(data);
        localStorage.setItem('party-planner-db', JSON.stringify(buffer));
      } catch (error) {
        console.warn('Failed to save database:', error);
      }
    };

    // Save immediately
    saveDatabase();

    // Set up periodic saving
    const interval = setInterval(saveDatabase, 30000); // Save every 30 seconds

    // Save on page unload
    const handleBeforeUnload = () => saveDatabase();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveDatabase(); // Final save
    };
  }, [db, isReady]);

  const executeQuery = async (sql: string, params: any[] = []): Promise<any[]> => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = db.prepare(sql);
      const results: any[] = [];
      
      stmt.bind(params);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row);
      }
      stmt.free();
      
      return results;
    } catch (error: any) {
      throw {
        message: error.message || 'Query execution failed',
        code: 'QUERY_ERROR',
        sql
      } as DatabaseError;
    }
  };

  const executeUpdate = async (sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number }> => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      
      const changes = db.getRowsModified();
      const lastInsertRowid = db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] as number || 0;
      
      stmt.free();
      
      return { changes, lastInsertRowid };
    } catch (error: any) {
      throw {
        message: error.message || 'Update execution failed',
        code: 'UPDATE_ERROR',
        sql
      } as DatabaseError;
    }
  };

  const transaction = async (queries: { sql: string; params?: any[] }[]): Promise<void> => {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      db.exec('BEGIN TRANSACTION');
      
      for (const query of queries) {
        const stmt = db.prepare(query.sql);
        stmt.bind(query.params || []);
        stmt.step();
        stmt.free();
      }
      
      db.exec('COMMIT');
    } catch (error: any) {
      db.exec('ROLLBACK');
      throw {
        message: error.message || 'Transaction failed',
        code: 'TRANSACTION_ERROR'
      } as DatabaseError;
    }
  };

  const value: DatabaseContextType = {
    db,
    isReady,
    isLoading,
    error,
    executeQuery,
    executeUpdate,
    transaction,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};