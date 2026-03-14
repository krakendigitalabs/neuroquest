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
  createdAt: FieldValue;
  therapistIds: string[];
}

    