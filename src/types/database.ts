export interface Party {
  id: number;
  name: string;
  date?: string;
  guest_count: number;
  party_type: 'casual' | 'formal' | 'mixed';
  duration: number;
  theme?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: number;
  party_id: number;
  name: string;
  email?: string;
  rsvp: 'pending' | 'yes' | 'no';
  dietary_restrictions?: string;
  additional_guests: number;
  notes?: string;
  created_at: string;
}

export interface TimelineTask {
  id: number;
  party_id: number;
  task: string;
  time_frame: string;
  category: 'planning' | 'shopping' | 'preparation' | 'setup' | 'day-of';
  completed: boolean;
  is_custom: boolean;
  created_at: string;
}

export interface PizzaCalculation {
  id: number;
  party_id: number;
  guest_count: number;
  pizzas_needed: number;
  calculated_at: string;
}

export interface BeverageCalculation {
  id: number;
  party_id: number;
  guest_count: number;
  duration: number;
  party_type: string;
  include_alcohol: boolean;
  water_bottles: number;
  soft_drinks: number;
  beer_bottles: number;
  wine_bottles: number;
  cocktail_servings: number;
  calculated_at: string;
}

export interface UserPreference {
  id: number;
  key: string;
  value: string;
  updated_at: string;
}

export interface DatabaseError {
  message: string;
  code?: string;
  sql?: string;
}