export type AppRole = 'guest' | 'patient' | 'professional' | 'clinic';

export type AccessMeResponse = {
  role: AppRole;
  visibleModules: string[];
  routeAccess: string[];
  actions: {
    canCreateModules: boolean;
  };
};

export type MentalCheckInLevel = 'healthy' | 'mild' | 'moderate' | 'severe';

export type CheckInQuestion = {
  id: number;
  text: string;
};
