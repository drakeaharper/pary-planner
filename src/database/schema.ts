export const DATABASE_SCHEMA = `
-- Party configurations
CREATE TABLE IF NOT EXISTS parties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT,
    guest_count INTEGER DEFAULT 0,
    party_type TEXT DEFAULT 'mixed',
    duration INTEGER DEFAULT 3,
    theme TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Guest management
CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    rsvp TEXT DEFAULT 'pending',
    dietary_restrictions TEXT,
    plus_one BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties (id) ON DELETE CASCADE
);

-- Timeline tasks
CREATE TABLE IF NOT EXISTS timeline_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL,
    task TEXT NOT NULL,
    time_frame TEXT NOT NULL,
    category TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties (id) ON DELETE CASCADE
);

-- Pizza calculations cache
CREATE TABLE IF NOT EXISTS pizza_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL,
    guest_count INTEGER NOT NULL,
    pizzas_needed INTEGER NOT NULL,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties (id) ON DELETE CASCADE
);

-- Beverage calculations cache
CREATE TABLE IF NOT EXISTS beverage_calculations (
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
CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guests_party_id ON guests(party_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_party_id ON timeline_tasks(party_id);
CREATE INDEX IF NOT EXISTS idx_pizza_calculations_party_id ON pizza_calculations(party_id);
CREATE INDEX IF NOT EXISTS idx_beverage_calculations_party_id ON beverage_calculations(party_id);
`;

export const DEFAULT_TIMELINE_TASKS = [
  { task: 'Set party date and theme', time_frame: '4-6 weeks before', category: 'planning' },
  { task: 'Create guest list', time_frame: '4-6 weeks before', category: 'planning' },
  { task: 'Book venue (if needed)', time_frame: '4-6 weeks before', category: 'planning' },
  { task: 'Send invitations', time_frame: '2-3 weeks before', category: 'planning' },
  { task: 'Plan menu and drinks', time_frame: '2-3 weeks before', category: 'planning' },
  { task: 'Order special items/decorations', time_frame: '2-3 weeks before', category: 'shopping' },
  { task: 'Confirm RSVPs', time_frame: '1 week before', category: 'planning' },
  { task: 'Finalize headcount', time_frame: '1 week before', category: 'planning' },
  { task: 'Create shopping list', time_frame: '1 week before', category: 'planning' },
  { task: 'Clean and prep space', time_frame: '1 week before', category: 'preparation' },
  { task: 'Shop for non-perishables', time_frame: '2-3 days before', category: 'shopping' },
  { task: 'Prep decorations', time_frame: '2-3 days before', category: 'preparation' },
  { task: 'Prepare make-ahead dishes', time_frame: '2-3 days before', category: 'preparation' },
  { task: 'Shop for perishables', time_frame: 'Day before', category: 'shopping' },
  { task: 'Prep food that can be done ahead', time_frame: 'Day before', category: 'preparation' },
  { task: 'Set up decorations', time_frame: 'Day before', category: 'setup' },
  { task: 'Chill beverages', time_frame: 'Day before', category: 'preparation' },
  { task: 'Final food preparation', time_frame: 'Day of party', category: 'day-of' },
  { task: 'Set up serving areas', time_frame: 'Day of party', category: 'day-of' },
  { task: 'Set up music/entertainment', time_frame: 'Day of party', category: 'day-of' },
  { task: 'Final cleanup and setup', time_frame: 'Day of party', category: 'day-of' },
];