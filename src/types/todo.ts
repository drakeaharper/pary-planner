export interface TodoItem {
  id: string;
  partyId: string;
  title: string;
  description?: string;
  category: TodoCategory;
  priority: TodoPriority;
  dueDate?: string; // ISO date
  estimatedTime?: number; // minutes
  completed: boolean;
  assignedTo?: string;
  location?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  subtasks?: SubTask[];
  dependencies?: string[]; // IDs of tasks this depends on
  attachments?: Attachment[];
}

export interface SubTask {
  id: string;
  todoId: string;
  title: string;
  completed: boolean;
  orderIndex: number;
}

export interface Attachment {
  id: string;
  todoId: string;
  name: string;
  type: AttachmentType;
  url: string;
}

export interface TodoDependency {
  id: string;
  todoId: string;
  dependsOnId: string;
}

export interface TodoTemplate {
  id: string;
  name: string;
  partyType?: string;
  guestCountRange?: string;
  templateData: TodoTemplateItem[];
  isDefault: boolean;
  createdAt: string;
}

export interface TodoTemplateItem {
  title: string;
  description?: string;
  category: TodoCategory;
  priority: TodoPriority;
  estimatedTime?: number;
  estimatedCost?: number;
  daysBeforeParty?: number; // For auto-scheduling
}

export type TodoCategory = 'planning' | 'shopping' | 'preparation' | 'coordination' | 'booking';
export type TodoPriority = 'low' | 'medium' | 'high' | 'critical';
export type AttachmentType = 'link' | 'image' | 'document';

export const TODO_CATEGORIES: Record<TodoCategory, { label: string; color: string; icon: string }> = {
  planning: { 
    label: 'Planning', 
    color: 'bg-blue-100 text-blue-800', 
    icon: '📋' 
  },
  shopping: { 
    label: 'Shopping', 
    color: 'bg-green-100 text-green-800', 
    icon: '🛒' 
  },
  preparation: { 
    label: 'Preparation', 
    color: 'bg-orange-100 text-orange-800', 
    icon: '🍳' 
  },
  coordination: { 
    label: 'Coordination', 
    color: 'bg-purple-100 text-purple-800', 
    icon: '📞' 
  },
  booking: { 
    label: 'Booking', 
    color: 'bg-red-100 text-red-800', 
    icon: '📅' 
  }
};

export const TODO_PRIORITIES: Record<TodoPriority, { label: string; color: string; icon: string }> = {
  low: { 
    label: 'Low', 
    color: 'bg-gray-100 text-gray-800', 
    icon: '⬇️' 
  },
  medium: { 
    label: 'Medium', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: '➡️' 
  },
  high: { 
    label: 'High', 
    color: 'bg-orange-100 text-orange-800', 
    icon: '⬆️' 
  },
  critical: { 
    label: 'Critical', 
    color: 'bg-red-100 text-red-800', 
    icon: '🔥' 
  }
};

export const DEFAULT_TODO_TEMPLATES: TodoTemplate[] = [
  {
    id: 'birthday-party-basic',
    name: 'Birthday Party Essentials',
    partyType: 'birthday',
    guestCountRange: '10-30',
    isDefault: true,
    createdAt: new Date().toISOString(),
    templateData: [
      {
        title: 'Set party date and send save-the-dates',
        category: 'planning',
        priority: 'high',
        estimatedTime: 60,
        daysBeforeParty: 28
      },
      {
        title: 'Create guest list and send invitations',
        category: 'planning',
        priority: 'high',
        estimatedTime: 90,
        daysBeforeParty: 21
      },
      {
        title: 'Book venue or prepare space',
        category: 'booking',
        priority: 'high',
        estimatedTime: 120,
        daysBeforeParty: 21
      },
      {
        title: 'Plan menu and order cake',
        category: 'planning',
        priority: 'high',
        estimatedTime: 90,
        estimatedCost: 150,
        daysBeforeParty: 14
      },
      {
        title: 'Shop for decorations and party supplies',
        category: 'shopping',
        priority: 'medium',
        estimatedTime: 120,
        estimatedCost: 80,
        daysBeforeParty: 7
      },
      {
        title: 'Confirm RSVPs and finalize headcount',
        category: 'coordination',
        priority: 'high',
        estimatedTime: 30,
        daysBeforeParty: 7
      },
      {
        title: 'Shop for food and beverages',
        category: 'shopping',
        priority: 'high',
        estimatedTime: 90,
        estimatedCost: 200,
        daysBeforeParty: 2
      },
      {
        title: 'Prepare food that can be made ahead',
        category: 'preparation',
        priority: 'medium',
        estimatedTime: 180,
        daysBeforeParty: 1
      },
      {
        title: 'Set up decorations and party space',
        category: 'preparation',
        priority: 'high',
        estimatedTime: 120,
        daysBeforeParty: 0
      },
      {
        title: 'Prepare fresh food and set up serving areas',
        category: 'preparation',
        priority: 'critical',
        estimatedTime: 90,
        daysBeforeParty: 0
      }
    ]
  },
  {
    id: 'dinner-party-elegant',
    name: 'Elegant Dinner Party',
    partyType: 'dinner',
    guestCountRange: '6-12',
    isDefault: true,
    createdAt: new Date().toISOString(),
    templateData: [
      {
        title: 'Plan menu and wine pairings',
        category: 'planning',
        priority: 'high',
        estimatedTime: 120,
        daysBeforeParty: 14
      },
      {
        title: 'Send elegant invitations',
        category: 'coordination',
        priority: 'high',
        estimatedTime: 60,
        daysBeforeParty: 14
      },
      {
        title: 'Shop for special ingredients and wines',
        category: 'shopping',
        priority: 'high',
        estimatedTime: 90,
        estimatedCost: 300,
        daysBeforeParty: 3
      },
      {
        title: 'Prepare table settings and ambiance',
        category: 'preparation',
        priority: 'medium',
        estimatedTime: 60,
        daysBeforeParty: 1
      },
      {
        title: 'Prep appetizers and desserts',
        category: 'preparation',
        priority: 'high',
        estimatedTime: 150,
        daysBeforeParty: 1
      },
      {
        title: 'Final cooking and presentation',
        category: 'preparation',
        priority: 'critical',
        estimatedTime: 180,
        daysBeforeParty: 0
      }
    ]
  }
];

// Utility functions
export const getTodoPriorityValue = (priority: TodoPriority): number => {
  const values = { low: 1, medium: 2, high: 3, critical: 4 };
  return values[priority];
};

export const isTaskOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const getTaskUrgency = (dueDate?: string): 'overdue' | 'urgent' | 'soon' | 'normal' => {
  if (!dueDate) return 'normal';
  
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 1) return 'urgent';
  if (diffDays <= 3) return 'soon';
  return 'normal';
};

export const formatEstimatedTime = (minutes?: number): string => {
  if (!minutes) return '';
  
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};