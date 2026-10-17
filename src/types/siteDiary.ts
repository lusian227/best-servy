export interface SiteDiaryEntry {
  id: string;
  projectId: string;
  date: string;
  weather: string | { temp: string; condition: string; impact: string };
  activities: string[];
  observations: string[];
  issues: string[];
  photos: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

