import { FieldValue } from "firebase/firestore";

export interface ThoughtRecord {
    id: string;
    userId: string;
    recordedAt: string | Date | FieldValue;
    thoughtText: string;
    cognitiveLabel: string;
    isFactNotThought: boolean;
    associatedEmotion: string;
    intensity: number;
    isIntrusive: boolean;
    analysis?: string;
    reframingSuggestion?: string;
    isTOCRelated?: boolean;
}
    
