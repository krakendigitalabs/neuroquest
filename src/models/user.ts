import {FieldValue} from 'firebase/firestore';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  isAdmin: boolean;
  isAnonymous: boolean;
  createdAt: FieldValue;
  therapistIds: string[];
  latestCheckInScore?: number;
  latestCheckInLevel?: 'healthy' | 'mild' | 'moderate' | 'severe';
  latestCheckInAt?: FieldValue | string | Date;
  latestCheckInNote?: string;
}
