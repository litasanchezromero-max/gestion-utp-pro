
export interface Teacher {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface ContentLog {
  id: string;
  teacherId: string;
  courseId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  content: string;
  observations?: string;
}

export type AppView = 'dashboard' | 'register' | 'report';

export interface AppData {
  teachers: Teacher[];
  courses: Course[];
  subjects: Subject[];
  contentLogs: ContentLog[];
}
