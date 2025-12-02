export type TransportMode = 'flight' | 'train' | 'bus' | 'car' | 'bike';

export type TripStatus = 'planning' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type Mood = 'adventure' | 'relaxation' | 'scenic' | 'spiritual' | 'cultural' | 'foodie' | 'balanced';

export type FoodPreference = 'vegetarian' | 'vegan' | 'non-vegetarian' | 'local' | 'any';

export interface Trip {
  id: string;
  userId: string;
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  mode: TransportMode;
  distance?: number;
  duration?: number;
  estimatedCost?: number;
  currency: string;
  status: TripStatus;
  mood?: Mood;
  foodPreference?: FoodPreference;
  itinerary?: string;
  budgetEstimated?: number;
  budgetActual?: number;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherData {
  location: string;
  date: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  alertLevel: 'safe' | 'caution' | 'high-risk';
}

export interface JournalEntry {
  id: string;
  tripId: string;
  date: string;
  content: string;
  photos?: string[];
  rating?: number;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
}

export interface BudgetItem {
  id: string;
  tripId: string;
  category: 'transport' | 'stay' | 'food' | 'activities' | 'shopping' | 'other';
  amount: number;
  currency: string;
  description?: string;
  date: string;
}

export interface Deal {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  provider: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
  rating?: number;
  dealType: 'flash-sale' | 'early-bird' | 'last-minute' | 'exclusive';
  externalUrl: string;
  imageUrl?: string;
}

export interface VisaInfo {
  destinationCountry: string;
  nationality: string;
  visaType: 'visa-free' | 'visa-required' | 'visa-on-arrival' | 'evisa';
  requirements: string[];
  processingTime: string;
  fee?: string;
  officialLink?: string;
  healthRequirements?: string[];
}
