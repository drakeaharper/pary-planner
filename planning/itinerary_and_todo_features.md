# Itinerary Planner & Pre-Party Todo Manager

## Feature Overview

### Party Itinerary Planner
A detailed schedule manager for the day of the party, helping hosts plan minute-by-minute activities and ensure smooth event flow.

### Pre-Party Todo Manager  
An enhanced task management system that goes beyond the timeline planner, focusing on actionable items with deadlines, assignments, and priority levels.

## Itinerary Planner

### Core Features

#### Time-Based Schedule
```typescript
interface ItineraryItem {
  id: string;
  partyId: string;
  startTime: string; // HH:MM format
  endTime: string;
  title: string;
  description: string;
  category: 'arrival' | 'activity' | 'food' | 'entertainment' | 'cleanup';
  location?: string; // For different areas of venue
  responsible?: string; // Who handles this
  preparations?: string[]; // What needs to be ready
  notes?: string;
}
```

#### Schedule Templates
- **Birthday Party** (3 hours)
  - 0:00-0:30: Guest arrival & welcome drinks
  - 0:30-1:00: Mingling & appetizers
  - 1:00-1:30: Main activities/games
  - 1:30-2:00: Food service
  - 2:00-2:30: Cake & celebration
  - 2:30-3:00: Farewell & cleanup

- **Wedding Reception** (5 hours)
  - 0:00-0:30: Cocktail hour
  - 0:30-1:00: Dinner service
  - 1:00-1:15: Speeches
  - 1:15-2:30: Dancing
  - 2:30-2:45: Cake cutting
  - 2:45-4:30: More dancing
  - 4:30-5:00: Send-off

#### Visual Timeline
- Drag-and-drop schedule editing
- Color-coded by category
- Conflict detection (overlapping times)
- Buffer time suggestions
- Real-time duration calculations

#### Mobile Day-Of Assistant
- Live schedule view
- Check-off completed items
- Quick notes and updates
- Emergency contact integration
- Weather alerts (if outdoor event)

### Database Schema Extension

```sql
-- Party itinerary items
CREATE TABLE itinerary_items (
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
CREATE TABLE itinerary_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    party_type TEXT, -- birthday, wedding, corporate, etc.
    duration INTEGER, -- hours
    description TEXT,
    template_data TEXT, -- JSON of default items
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Pre-Party Todo Manager

### Enhanced Task Management

#### Advanced Task Structure
```typescript
interface TodoItem {
  id: string;
  partyId: string;
  title: string;
  description?: string;
  category: 'planning' | 'shopping' | 'preparation' | 'coordination' | 'booking';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string; // ISO date
  estimatedTime: number; // minutes
  completed: boolean;
  assignedTo?: string;
  dependencies?: string[]; // other task IDs
  location?: string; // where to do this task
  cost?: number; // estimated cost
  notes?: string;
  subtasks?: SubTask[];
  attachments?: Attachment[];
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: 'link' | 'image' | 'document';
  url: string;
}
```

#### Smart Scheduling Features
- **Dependency Management**: Tasks that must be completed before others
- **Time Estimation**: How long each task takes
- **Auto-scheduling**: Suggest optimal task order
- **Buffer Time**: Add padding for complex tasks
- **Deadline Alerts**: Notifications for overdue items

#### Categories & Templates

##### Planning Tasks
- Choose venue and date
- Create guest list
- Design invitations
- Plan menu and drinks
- Book entertainment/DJ
- Arrange transportation
- Get permits (if needed)

##### Shopping Tasks  
- Food and beverages
- Decorations
- Party supplies
- Gifts and favors
- Special equipment rental
- Emergency items

##### Preparation Tasks
- Food prep and cooking
- Decoration setup
- Venue preparation
- Equipment testing
- Final confirmations

##### Coordination Tasks
- Send reminders to guests
- Confirm vendors
- Coordinate helpers/staff
- Share itinerary
- Emergency contact setup

### Database Schema Extension

```sql
-- Enhanced todo items
CREATE TABLE todo_items (
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
CREATE TABLE todo_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER NOT NULL,
    depends_on_id INTEGER NOT NULL,
    FOREIGN KEY (todo_id) REFERENCES todo_items (id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_id) REFERENCES todo_items (id) ON DELETE CASCADE
);

-- Subtasks
CREATE TABLE todo_subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER,
    FOREIGN KEY (todo_id) REFERENCES todo_items (id) ON DELETE CASCADE
);

-- Attachments
CREATE TABLE todo_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- link, image, document
    url TEXT NOT NULL,
    FOREIGN KEY (todo_id) REFERENCES todo_items (id) ON DELETE CASCADE
);

-- Todo templates
CREATE TABLE todo_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    party_type TEXT,
    guest_count_range TEXT, -- "10-20", "50+", etc.
    template_data TEXT, -- JSON of default todos
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## User Interface Design

### Itinerary Planner UI

#### Main Schedule View
- **Timeline View**: Hour-by-hour breakdown
- **Kanban Board**: Drag items between time slots
- **List View**: Simple chronological list
- **Print View**: Clean layout for day-of reference

#### Quick Actions
- Duplicate time slots
- Bulk edit similar items
- Template application
- Schedule sharing

### Todo Manager UI

#### Dashboard View
- **Progress Overview**: Completion percentage by category
- **Urgent Tasks**: Items due soon
- **Blocked Tasks**: Waiting on dependencies
- **Cost Tracking**: Budget vs actual spending

#### Task Views
- **Kanban Board**: By status (To Do, In Progress, Done)
- **Calendar View**: By due date
- **Priority Matrix**: Urgent/Important grid
- **Assignee View**: Filter by who's responsible

#### Smart Features
- **Quick Add**: Natural language parsing ("Buy groceries Friday")
- **Batch Operations**: Mark multiple items complete
- **Template Library**: Pre-built task lists
- **Smart Suggestions**: AI-powered task recommendations

## Integration Points

### With Existing Features
- **Guest List**: Auto-generate greeting tasks
- **Pizza Calculator**: Create ordering tasks
- **Beverage Calculator**: Generate shopping lists
- **Timeline Planner**: Convert timeline items to actionable todos

### External Integrations
- **Calendar Apps**: Sync important deadlines
- **Shopping Apps**: Export grocery lists
- **Note Apps**: Link to external documents
- **Maps**: Directions to venues/stores

## Mobile Experience

### Progressive Web App Features
- **Offline Access**: Cache critical data
- **Push Notifications**: Task reminders
- **Quick Actions**: Add tasks via home screen
- **Voice Input**: "Add task: buy flowers"

### Day-Of Mode
- **Simplified Interface**: Focus on current tasks
- **Large Checkboxes**: Easy interaction
- **Emergency Contacts**: Quick access
- **Photo Capture**: Document setup progress

## Implementation Priority

### Phase 1: Basic Todo Manager (2 weeks)
- Enhanced task structure
- Categories and priorities
- Basic dependency system
- Mobile-responsive UI

### Phase 2: Itinerary Planner (2 weeks)
- Time-based scheduling
- Template system
- Drag-and-drop interface
- Conflict detection

### Phase 3: Advanced Features (3 weeks)
- Smart scheduling algorithms
- Template marketplace
- External integrations
- Day-of assistant mode

### Phase 4: AI Enhancement (Future)
- Natural language task creation
- Intelligent scheduling suggestions
- Predictive task recommendations
- Automated progress tracking