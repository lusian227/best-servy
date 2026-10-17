// src/types/lesson.ts

export interface LessonItem {
  id: string;
  projectId: string;              // ✅ ADD
  projectName: string;            // ✅ ADD
  category: string;
  title: string;
  whatWentWell: string;          // ✅ ADD
  causesOfDelay: string;          // ✅ ADD
  bestSuppliers: string;          // ✅ ADD
  designChangesRepeated: string;  // ✅ ADD
  recommendations: string;        // ✅ ADD
  date: string;                   // ✅ ADD
  tags: string[];
  // Optional fields
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Lesson = LessonItem;