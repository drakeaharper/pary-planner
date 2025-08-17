export interface Migration {
  version: number;
  name: string;
  up: string[];
  down?: string[];
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'update_guests_plus_one_to_additional_guests',
    up: [
      // Add the new column
      'ALTER TABLE guests ADD COLUMN additional_guests INTEGER DEFAULT 0',
      // Copy data from plus_one to additional_guests (1 if plus_one is true, 0 if false)
      'UPDATE guests SET additional_guests = CASE WHEN plus_one = 1 THEN 1 ELSE 0 END',
      // Drop the old column (SQLite doesn't support DROP COLUMN directly, so we'll recreate the table)
      `CREATE TABLE guests_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        party_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        rsvp TEXT DEFAULT 'pending',
        dietary_restrictions TEXT,
        additional_guests INTEGER DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES parties (id) ON DELETE CASCADE
      )`,
      // Copy data to new table
      'INSERT INTO guests_new (id, party_id, name, email, rsvp, dietary_restrictions, additional_guests, notes, created_at) SELECT id, party_id, name, email, rsvp, dietary_restrictions, additional_guests, notes, created_at FROM guests',
      // Drop old table and rename new one
      'DROP TABLE guests',
      'ALTER TABLE guests_new RENAME TO guests',
      // Recreate the index
      'CREATE INDEX IF NOT EXISTS idx_guests_party_id ON guests(party_id)'
    ]
  }
];

export const getCurrentVersion = async (executeQuery: (sql: string, params?: any[]) => Promise<any[]>): Promise<number> => {
  try {
    // Check if migrations table exists
    const tables = await executeQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'"
    );
    
    if (tables.length === 0) {
      // Create migrations table
      await executeQuery(`
        CREATE TABLE migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      return 0;
    }
    
    // Get the latest migration version
    const result = await executeQuery('SELECT MAX(version) as version FROM migrations');
    return result[0]?.version || 0;
  } catch (error) {
    console.error('Error getting current migration version:', error);
    return 0;
  }
};

export const runMigrations = async (
  executeQuery: (sql: string, params?: any[]) => Promise<any[]>,
  _executeUpdate: (sql: string, params?: any[]) => Promise<{ changes: number; lastInsertRowid: number }>,
  transaction: (queries: { sql: string; params?: any[] }[]) => Promise<void>
) => {
  try {
    const currentVersion = await getCurrentVersion(executeQuery);
    const pendingMigrations = MIGRATIONS.filter(m => m.version > currentVersion);
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    console.log(`Running ${pendingMigrations.length} migrations...`);
    
    for (const migration of pendingMigrations) {
      console.log(`Running migration ${migration.version}: ${migration.name}`);
      
      try {
        // Run migration in a transaction
        const migrationQueries = [
          ...migration.up.map(sql => ({ sql, params: [] })),
          {
            sql: 'INSERT INTO migrations (version, name) VALUES (?, ?)',
            params: [migration.version, migration.name]
          }
        ];
        
        await transaction(migrationQueries);
        console.log(`Migration ${migration.version} completed successfully`);
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};