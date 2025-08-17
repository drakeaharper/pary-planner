# SQLite WASM Implementation Plan

## Overview
Implement client-side data persistence using SQLite compiled to WebAssembly, allowing users to save their party planning data locally without requiring a backend server.

## Technical Stack

### Core Libraries
- **@sqlite.org/sqlite-wasm** - Official SQLite WASM build
- **sql.js** - Alternative SQLite WASM implementation
- **opfs-tools** - For Origin Private File System storage

### Integration Points
- React Context for database access
- Custom hooks for data operations
- Type-safe database schemas with TypeScript

## Database Schema

### Tables Structure

```sql
-- Party configurations
CREATE TABLE parties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT, -- ISO date string
    guest_count INTEGER DEFAULT 0,
    party_type TEXT DEFAULT 'mixed', -- casual, formal, mixed
    duration INTEGER DEFAULT 3, -- hours
    theme TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Guest management
CREATE TABLE guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    rsvp TEXT DEFAULT 'pending', -- pending, yes, no
    dietary_restrictions TEXT,
    plus_one BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties (id) ON DELETE CASCADE
);

-- Timeline tasks
CREATE TABLE timeline_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL,
    task TEXT NOT NULL,
    time_frame TEXT NOT NULL,
    category TEXT NOT NULL, -- planning, shopping, preparation, setup, day-of
    completed BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT TRUE, -- distinguish custom vs default tasks
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties (id) ON DELETE CASCADE
);

-- Pizza calculations cache
CREATE TABLE pizza_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL,
    guest_count INTEGER NOT NULL,
    pizzas_needed INTEGER NOT NULL,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties (id) ON DELETE CASCADE
);

-- Beverage calculations cache
CREATE TABLE beverage_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL,
    guest_count INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    party_type TEXT NOT NULL,
    include_alcohol BOOLEAN NOT NULL,
    water_bottles INTEGER,
    soft_drinks INTEGER,
    beer_bottles INTEGER,
    wine_bottles INTEGER,
    cocktail_servings INTEGER,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties (id) ON DELETE CASCADE
);

-- User preferences
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Phases

### Phase 1: Basic Setup (Week 1)
1. **SQLite WASM Integration**
   ```bash
   npm install @sqlite.org/sqlite-wasm
   ```

2. **Database Context Provider**
   ```typescript
   // src/contexts/DatabaseContext.tsx
   interface DatabaseContextType {
     db: Database | null;
     isReady: boolean;
     executeQuery: (sql: string, params?: any[]) => Promise<any>;
     transaction: (queries: QueryBatch[]) => Promise<void>;
   }
   ```

3. **Database Hooks**
   ```typescript
   // src/hooks/useDatabase.ts
   export const useParties = () => {
     const { executeQuery } = useDatabase();
     // CRUD operations for parties
   };
   
   export const useGuests = (partyId: number) => {
     // Guest management operations
   };
   ```

### Phase 2: Data Migration (Week 2)
1. **Schema Migrations**
   ```typescript
   // src/database/migrations.ts
   const migrations = [
     {
       version: 1,
       sql: `CREATE TABLE parties (...);`
     },
     // Additional migrations
   ];
   ```

2. **Data Import/Export**
   ```typescript
   // Export party data as JSON
   export const exportPartyData = async (partyId: number) => {
     // Generate complete party export
   };
   
   // Import from JSON
   export const importPartyData = async (data: PartyExport) => {
     // Validate and import data
   };
   ```

### Phase 3: Integration with Existing Components (Week 3)
1. **Update Guest List Manager**
   - Replace useState with database operations
   - Add party selection/creation
   - Implement data persistence

2. **Update Timeline Planner**
   - Save custom tasks to database
   - Load tasks by party
   - Maintain default task templates

3. **Calculator History**
   - Save calculation results
   - Show calculation history
   - Quick load previous configurations

## Storage Strategy

### Primary: Origin Private File System (OPFS)
- Persistent storage not cleared by browser cleanup
- Better performance than IndexedDB
- Suitable for larger databases

### Fallback: IndexedDB
- For browsers without OPFS support
- Store SQLite database as blob
- Synchronize on page load/unload

### Emergency Fallback: localStorage
- Basic party data only
- Simplified schema
- Data size limitations

## Performance Considerations

### Optimization Strategies
1. **Connection Pooling**
   - Single database connection per session
   - Connection sharing across components

2. **Query Optimization**
   - Prepared statements for repeated queries
   - Efficient indexing strategy
   - Batch operations for bulk updates

3. **Data Loading**
   - Lazy loading of large datasets
   - Pagination for guest lists
   - Background sync operations

### Memory Management
```typescript
// Database cleanup on unmount
useEffect(() => {
  return () => {
    if (db) {
      db.close();
    }
  };
}, [db]);
```

## Error Handling & Recovery

### Database Corruption
- Automatic backup creation
- Recovery from backup files
- Data integrity checks

### Browser Compatibility
- Feature detection for WASM support
- Graceful degradation to localStorage
- User notification of limited functionality

## Testing Strategy

### Unit Tests
- Database operation testing
- Migration testing
- Data validation

### Integration Tests
- Component-database interaction
- Cross-browser compatibility
- Performance benchmarking

## Security Considerations

### Data Protection
- Client-side encryption for sensitive data
- Secure data export/import
- No sensitive data in localStorage fallback

### Privacy
- All data stored locally
- No data transmission to servers
- User control over data deletion

## Migration Path

### From Current Implementation
1. **Detection Phase**
   - Check for existing localStorage data
   - Offer migration to SQLite

2. **Migration Phase**
   - Convert localStorage to database format
   - Validate migrated data
   - Backup original data

3. **Verification Phase**
   - Compare migrated vs original data
   - User confirmation of successful migration
   - Clean up old localStorage data

## Development Timeline

### Week 1: Foundation
- SQLite WASM setup
- Basic database operations
- Schema creation

### Week 2: Core Features
- CRUD operations for all entities
- Data migration system
- Export/import functionality

### Week 3: Integration
- Update existing components
- Add persistence to calculators
- Implement party management

### Week 4: Polish & Testing
- Error handling
- Performance optimization
- Cross-browser testing
- Documentation updates