import { FieldValue } from "firebase/firestore";

export interface ThoughtRecord {
    id: string;
    userId: string;
    recordedAt: string | Date | FieldValue | null;
    thoughtText: string;
    situation?: string;
    trigger?: string;
    cognitiveLabel: string;
    isFactNotThought: boolean;
    isThoughtNotFact?: boolean;
    associatedEmotion: string;
    intensity: number;
    compulsionUrge?: number;
    isIntrusive: boolean;
    analysis?: string;
    reframingSuggestion?: string;
    isTOCRelated?: boolean;
    source?: 'observer' | 'therapist';
}
    
