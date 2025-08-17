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
    additional_guests INTEGER DEFAULT 0,
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

-- Party itinerary items
CREATE TABLE IF NOT EXISTS itinerary_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL,
    start_time TEXT NOT NULL, -- HH:MM
    end_time TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    location TEXT,
    responsible TEXT,
    preparations TEXT, -- JSON array
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties (id) ON DELETE CASCADE
);

-- Itinerary templates
CREATE TABLE IF NOT EXISTS itinerary_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    party_type TEXT, -- birthday, wedding, corporate, etc.
    duration INTEGER, -- hours
    description TEXT,
    template_data TEXT, -- JSON of default items
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced todo items
CREATE TABLE IF NOT EXISTS todo_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    due_date TEXT, -- ISO date
    estimated_time INTEGER, -- minutes
    completed BOOLEAN DEFAULT FALSE,
    assigned_to TEXT,
    location TEXT,
    estimated_cost REAL,
    actual_cost REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (party_id) REFERENCES parties (id) ON DELETE CASCADE
);

-- Task dependencies
CREATE TABLE IF NOT EXISTS todo_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER NOT NULL,
    depends_on_id INTEGER NOT NULL,
    FOREIGN KEY (todo_id) REFERENCES todo_items (id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_id) REFERENCES todo_items (id) ON DELETE CASCADE
);

-- Subtasks
CREATE TABLE IF NOT EXISTS todo_subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER,
    FOREIGN KEY (todo_id) REFERENCES todo_items (id) ON DELETE CASCADE
);

-- Attachments
CREATE TABLE IF NOT EXISTS todo_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- link, image, document
    url TEXT NOT NULL,
    FOREIGN KEY (todo_id) REFERENCES todo_items (id) ON DELETE CASCADE
);

-- Todo templates
CREATE TABLE IF NOT EXISTS todo_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    party_type TEXT,
    guest_count_range TEXT, -- "10-20", "50+", etc.
    template_data TEXT, -- JSON of default todos
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guests_party_id ON guests(party_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_party_id ON timeline_tasks(party_id);
CREATE INDEX IF NOT EXISTS idx_pizza_calculations_party_id ON pizza_calculations(party_id);
CREATE INDEX IF NOT EXISTS idx_beverage_calculations_party_id ON beverage_calculations(party_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_party_id ON itinerary_items(party_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_party_id ON todo_items(party_id);
CREATE INDEX IF NOT EXISTS idx_todo_dependencies_todo_id ON todo_dependencies(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_subtasks_todo_id ON todo_subtasks(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_attachments_todo_id ON todo_attachments(todo_id);
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