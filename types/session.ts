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

export interface Session {
  id: string;
  user_id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  meal_time: MealTime | null; // Optional meal time category
  weather_types: WeatherType[] | null; // Optional weather conditions (multi-select)
  images: string[]; // URLs
  created_at: string;
}
