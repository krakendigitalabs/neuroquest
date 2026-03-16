import { FieldValue } from "firebase/firestore";

export interface ExposureMission {
    id: string;
    userId: string;
    title: string;
    description: string;
    difficultyLevel: number;
    status: 'pending' | 'active' | 'completed' | 'failed';
    xpReward: number;
    completionDate?: FieldValue | string | null;
    assignedBy: 'AI' | 'Therapist' | 'System';
    therapistId?: string;
    targetBehavior: string;
    resistanceTarget: string;
    isAiGenerated: boolean;
    missionType?: string;
    createdAt?: FieldValue;
}
