export interface LessonItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  content: string;
  tags?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
