export interface Session {
  id: string;
  user_id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  images: string[]; // URLs
  created_at: string;
}
