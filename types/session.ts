export type MealTime = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export const MEAL_TIME_OPTIONS: MealTime[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export type WeatherType = 'Sunny' | 'Cloudy' | 'Windy' | 'Rain' | 'Snow';

export const WEATHER_TYPE_OPTIONS: WeatherType[] = ['Sunny', 'Cloudy', 'Windy', 'Rain', 'Snow'];

export interface WeatherTypeOption {
  value: WeatherType;
  label: string;
  icon: string;
}

export const WEATHER_OPTIONS: WeatherTypeOption[] = [
  { value: 'Sunny', label: 'Sunny', icon: 'sun' },
  { value: 'Cloudy', label: 'Cloudy', icon: 'cloud' },
  { value: 'Windy', label: 'Windy', icon: 'wind' },
  { value: 'Rain', label: 'Rain', icon: 'cloud-rain' },
  { value: 'Snow', label: 'Snow', icon: 'cloud-snow' },
];

// Grill Type Constants
export type GrillType = 'Coal' | 'Gas' | 'Wood' | 'Electric' | 'Smoke' | 'Other';

export interface GrillTypeOption {
  value: string; // allow string for custom types, but strictly it's one of Predefined or string
  label: string;
  icon: string;
}

export const PREDEFINED_GRILL_TYPES: GrillTypeOption[] = [
  { value: 'Coal', label: 'Coal', icon: 'rock' },
  { value: 'Gas', label: 'Gas', icon: 'fuel' },
  { value: 'Wood', label: 'Wood', icon: 'logs' }, // using 'logs' placeholder, will map to TreePine or something
  { value: 'Electric', label: 'Electric', icon: 'zap' },
  { value: 'Smoke', label: 'Smoke', icon: 'alarm-smoke' },
];

// Meat Type Constants
export type MeatType = 'Veggie' | 'Beef' | 'Pork' | 'Chicken' | 'Fish' | 'Other';

export interface MeatTypeOption {
  value: string;
  label: string;
  icon: string;
}

export const PREDEFINED_MEAT_TYPES: MeatTypeOption[] = [
  { value: 'Veggie', label: 'Veggie', icon: 'carrot' },
  { value: 'Beef', label: 'Beef', icon: 'beef' },
  { value: 'Pork', label: 'Pork', icon: 'ham' },
  { value: 'Chicken', label: 'Chicken', icon: 'drumstick' },
  { value: 'Fish', label: 'Fish', icon: 'fish' },
];

// People counter constants
export const DEFAULT_NUMBER_OF_PEOPLE = 1;
export const MIN_NUMBER_OF_PEOPLE = 1;

// Image upload limits
export const MAX_IMAGE_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
export const MAX_IMAGES_PER_SESSION = 3;

export interface Session {
  id: string;
  user_id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  meal_time: MealTime | null; // Optional meal time category
  weather_types: WeatherType[] | null; // Optional weather conditions (multi-select)
  grill_types: string[] | null; // Optional grill types (multi-select, including custom)
  meat_types: string[] | null; // Optional meat types (multi-select, including custom)
  number_of_people: number; // Number of people fed (minimum 1)
  notes: string | null; // Optional user notes
  images: string[]; // URLs
  created_at: string;
}

// Extended session with profile information for social feed
export interface SessionWithProfile extends Session {
  username: string;
  avatar_url: string | null;
  is_own_session: boolean;
}
