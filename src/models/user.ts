import {FieldValue} from 'firebase/firestore';

export type UserRole = 'clinic' | 'professional' | 'patient';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  userRole: UserRole;
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
  latestCheckInSelfHarmRisk?: boolean;
  latestCheckInNeedsProfessionalSupport?: boolean;
  latestCheckInUrgentSupport?: boolean;
  latestThoughtAt?: FieldValue | string | Date | null;
  latestThoughtEmotion?: string;
  latestThoughtIntensity?: number;
  latestThoughtLabel?: string;
  latestThoughtPreview?: string;
  latestThoughtIsIntrusive?: boolean;
}
