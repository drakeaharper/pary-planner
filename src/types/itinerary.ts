export interface ItineraryItem {
  id: string;
  partyId: string;
  startTime: string; // HH:MM format
  endTime: string;
  title: string;
  description?: string;
  category: 'arrival' | 'activity' | 'food' | 'entertainment' | 'cleanup';
  location?: string;
  responsible?: string;
  preparations?: string[];
  notes?: string;
  completed: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface ItineraryTemplate {
  id: string;
  name: string;
  partyType?: string;
  duration?: number; // hours
  description?: string;
  templateData: ItineraryTemplateItem[];
  isDefault: boolean;
  createdAt: string;
}

export interface ItineraryTemplateItem {
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  category: 'arrival' | 'activity' | 'food' | 'entertainment' | 'cleanup';
  location?: string;
  preparations?: string[];
}

export type ItineraryCategory = 'arrival' | 'activity' | 'food' | 'entertainment' | 'cleanup';

export const ITINERARY_CATEGORIES: Record<ItineraryCategory, { label: string; color: string }> = {
  arrival: { label: 'Arrival & Welcome', color: 'bg-blue-100 text-blue-800' },
  activity: { label: 'Activities & Games', color: 'bg-green-100 text-green-800' },
  food: { label: 'Food & Dining', color: 'bg-orange-100 text-orange-800' },
  entertainment: { label: 'Entertainment', color: 'bg-purple-100 text-purple-800' },
  cleanup: { label: 'Cleanup & Farewell', color: 'bg-gray-100 text-gray-800' },
};

export const DEFAULT_TEMPLATES: ItineraryTemplate[] = [
  {
    id: 'birthday-party-3h',
    name: 'Birthday Party (3 hours)',
    partyType: 'birthday',
    duration: 3,
    description: 'A classic birthday party template for all ages',
    isDefault: true,
    createdAt: new Date().toISOString(),
    templateData: [
      {
        startTime: '00:00',
        endTime: '00:30',
        title: 'Guest arrival & welcome drinks',
        category: 'arrival',
        description: 'Welcome guests and serve welcome drinks'
      },
      {
        startTime: '00:30',
        endTime: '01:00',
        title: 'Mingling & appetizers',
        category: 'food',
        description: 'Light snacks and socializing time'
      },
      {
        startTime: '01:00',
        endTime: '01:30',
        title: 'Main activities/games',
        category: 'activity',
        description: 'Planned party games and activities'
      },
      {
        startTime: '01:30',
        endTime: '02:00',
        title: 'Food service',
        category: 'food',
        description: 'Main meal or party food'
      },
      {
        startTime: '02:00',
        endTime: '02:30',
        title: 'Cake & celebration',
        category: 'entertainment',
        description: 'Birthday cake, singing, and special moments'
      },
      {
        startTime: '02:30',
        endTime: '03:00',
        title: 'Farewell & cleanup',
        category: 'cleanup',
        description: 'Goodbyes and initial cleanup'
      }
    ]
  },
  {
    id: 'dinner-party-4h',
    name: 'Dinner Party (4 hours)',
    partyType: 'dinner',
    duration: 4,
    description: 'An elegant dinner party template',
    isDefault: true,
    createdAt: new Date().toISOString(),
    templateData: [
      {
        startTime: '00:00',
        endTime: '00:30',
        title: 'Cocktail hour',
        category: 'arrival',
        description: 'Welcome drinks and appetizers'
      },
      {
        startTime: '00:30',
        endTime: '01:30',
        title: 'Dinner service',
        category: 'food',
        description: 'Main course and dining'
      },
      {
        startTime: '01:30',
        endTime: '02:30',
        title: 'Conversation & socializing',
        category: 'activity',
        description: 'Post-dinner conversation and activities'
      },
      {
        startTime: '02:30',
        endTime: '03:30',
        title: 'Dessert & coffee',
        category: 'food',
        description: 'Dessert service and coffee'
      },
      {
        startTime: '03:30',
        endTime: '04:00',
        title: 'Farewell',
        category: 'cleanup',
        description: 'Goodbyes and end of evening'
      }
    ]
  }
];