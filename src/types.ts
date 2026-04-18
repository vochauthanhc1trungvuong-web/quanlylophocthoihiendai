export interface Class {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  classId: string;
  name: string;
  avatarUrl?: string;
}

export interface PointRecord {
  id: string;
  studentId: string;
  classId: string;
  timestamp: number;
  points: number;
  reason: string;
}

export interface SharedLink {
  id: string;
  classId: string;
  title: string;
  url: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'teacher' | 'viewer';
  createdAt: number;
}
