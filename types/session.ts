export type MealTime = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export const MEAL_TIME_OPTIONS: MealTime[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export interface Session {
  id: string;
  user_id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  meal_time: MealTime | null; // Optional meal time category
  images: string[]; // URLs
  created_at: string;
}
