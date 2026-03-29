import { FieldValue, Timestamp } from "firebase/firestore";

export interface CheckupAnswer {
    questionId: number;
    question: string;
    value: number;
}

export interface Recommendations {
    daily: string[];
    family: string[];
    partner: string[];
    work: string[];
    study: string[];
    exercise: string[];
    readings: string[];
}

export interface RiskFlags {
    selfHarmRisk: boolean;
    needsProfessionalSupport: boolean;
    urgentSupportRecommended?: boolean;
}

export interface MentalCheckup {
    id?: string;
    createdAt: FieldValue | Timestamp | Date | string;
    userId: string;
    patientName: string;
    age?: number;
    score: number;
    maxScore: number;
    level: 'healthy' | 'mild' | 'moderate' | 'severe';
    resultTitle: string;
    mission: string;
    summary: string;
    answers: CheckupAnswer[];
    recommendations: Recommendations;
    activatedModules: string[];
    riskFlags: RiskFlags;
    professionalNote: string;
}
