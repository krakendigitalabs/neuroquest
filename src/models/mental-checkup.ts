import { FieldValue } from "firebase/firestore";

interface CheckupAnswer {
    questionId: number;
    question: string;
    value: number;
}

interface Recommendations {
    daily: string[];
    family: string[];
    partner: string[];
    work: string[];
    study: string[];
    exercise: string[];
    readings: string[];
}

interface RiskFlags {
    selfHarmRisk: boolean;
    needsProfessionalSupport: boolean;
}

export interface MentalCheckup {
    id?: string;
    createdAt: FieldValue;
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
