// services/storageService.ts
import { v4 as uuidv4 } from "uuid";
import { Question, Recording } from "../types";

const QUESTIONS_KEY = import.meta.env.VITE_QUESTIONS_KEY || "";
const RECORDINGS_KEY = import.meta.env.VITE_RECORDINGS_KEY || "";

export const getQuestions = (): Question[] => {
    const questions = localStorage.getItem(QUESTIONS_KEY);
    return questions ? JSON.parse(questions) : [];
};

export const addQuestion = (text: string): Question => {
    const questions = getQuestions();
    const newQuestion: Question = {
        id: uuidv4(),
        text,
        createdAt: new Date().toISOString(),
    };

    localStorage.setItem(QUESTIONS_KEY, JSON.stringify([...questions, newQuestion]));
    return newQuestion;
};

export const updateQuestion = (id: string, text: string): void => {
    const questions = getQuestions();
    const updatedQuestions = questions.map((q) => (q.id === id ? { ...q, text, updatedAt: new Date().toISOString() } : q));

    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updatedQuestions));
};

export const deleteQuestion = (id: string): void => {
    const questions = getQuestions();
    const filteredQuestions = questions.filter((q) => q.id !== id);

    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(filteredQuestions));

    const recordings = getRecordings();
    const filteredRecordings = recordings.filter((r) => r.questionId !== id);
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(filteredRecordings));
};

export const getRecordings = (): Recording[] => {
    const recordings = localStorage.getItem(RECORDINGS_KEY);
    return recordings ? JSON.parse(recordings) : [];
};

export const addRecording = (questionId: string, audioBlob: Blob): Promise<Recording> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64Audio = reader.result as string;

            const recordings = getRecordings();
            const newRecording: Recording = {
                id: uuidv4(),
                questionId,
                audio: base64Audio,
                createdAt: new Date().toISOString(),
            };

            localStorage.setItem(RECORDINGS_KEY, JSON.stringify([...recordings, newRecording]));
            resolve(newRecording);
        };
        reader.onerror = reject;
    });
};

export const deleteRecording = (id: string): void => {
    const recordings = getRecordings();
    const filteredRecordings = recordings.filter((r) => r.id !== id);

    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(filteredRecordings));
};

export const getRandomQuestion = (): Question | null => {
    const questions = getQuestions();
    if (questions.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
};
