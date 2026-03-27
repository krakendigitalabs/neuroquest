import {
  Activity,
  BrainCircuit,
  FileHeart,
  Flame,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  TriangleAlert,
  Users,
} from 'lucide-react';

export const whyIcons = [BrainCircuit, Flame, Users];
export const audienceIcons = {
  patients: HeartHandshake,
  therapists: Stethoscope,
};

export function getModuleIcon(icon: string) {
  switch (icon) {
    case 'checkin':
      return Activity;
    case 'progress':
      return TrendingUp;
    case 'observer':
      return BrainCircuit;
    case 'therapist':
      return Users;
    case 'support':
      return FileHeart;
    case 'crisis':
      return TriangleAlert;
    default:
      return Sparkles;
  }
}

export { ShieldCheck };
