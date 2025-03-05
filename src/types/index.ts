// types/index.ts
export interface Question {
    id: string;
    text: string;
    createdAt: string;
    updatedAt?: string;
}

export interface Recording {
    id: string;
    questionId: string;
    audio: string;
    createdAt: string;
}

export interface StorageService {
    getQuestions: () => Question[];
    addQuestion: (text: string) => Question;
    updateQuestion: (id: string, text: string) => void;
    deleteQuestion: (id: string) => void;
    getRecordings: () => Recording[];
    addRecording: (questionId: string, audioBlob: Blob) => Promise<Recording>;
    deleteRecording: (id: string) => void;
    getRandomQuestion: () => Question | null;
}

export interface RecordingGroupByDate {
    date: string;
    recordings: Recording[];
}
