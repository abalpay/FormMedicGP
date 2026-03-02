'use client';

import { create } from 'zustand';
import type { PatientDetails, ReviewSchema } from '@/types';

export type FormFlowStep =
  | 'select-form'
  | 'patient-details'
  | 'dictate'
  | 'processing'
  | 'review';

interface FormFlowState {
  currentStep: FormFlowStep;
  selectedFormType: string | null;
  selectedFormLabel: string | null;
  patientDetails: Partial<PatientDetails>;
  transcription: string;
  guidedAnswers: Record<string, string>;
  extractedData: Record<string, unknown> | null;
  missingFields: string[];
  reviewSchema: ReviewSchema | null;
  pdfBlobUrl: string | null;

  setStep: (step: FormFlowStep) => void;
  setFormType: (formType: string, label?: string) => void;
  setPatientDetails: (details: Partial<PatientDetails>) => void;
  setTranscription: (text: string) => void;
  setGuidedAnswers: (answers: Record<string, string>) => void;
  setGuidedAnswer: (key: string, value: string) => void;
  setExtractedData: (data: Record<string, unknown>) => void;
  setMissingFields: (fields: string[]) => void;
  setReviewSchema: (schema: ReviewSchema | null) => void;
  setPdfBlobUrl: (url: string) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 'select-form' as FormFlowStep,
  selectedFormType: null,
  selectedFormLabel: null,
  patientDetails: {},
  transcription: '',
  guidedAnswers: {},
  extractedData: null,
  missingFields: [],
  reviewSchema: null,
  pdfBlobUrl: null,
};

// SECURITY: No persist middleware — patient data must NEVER touch localStorage.
export const useFormFlowStore = create<FormFlowState>()((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  setFormType: (formType, label) =>
    set({ selectedFormType: formType, selectedFormLabel: label ?? formType, guidedAnswers: {} }),
  setPatientDetails: (details) => set({ patientDetails: details }),
  setTranscription: (text) => set({ transcription: text }),
  setGuidedAnswers: (answers) => set({ guidedAnswers: answers }),
  setGuidedAnswer: (key, value) =>
    set((state) => ({
      guidedAnswers: {
        ...state.guidedAnswers,
        [key]: value,
      },
    })),
  setExtractedData: (data) => set({ extractedData: data }),
  setMissingFields: (fields) => set({ missingFields: fields }),
  setReviewSchema: (schema) => set({ reviewSchema: schema }),
  setPdfBlobUrl: (url) => set({ pdfBlobUrl: url }),

  reset: () => {
    const currentBlobUrl = get().pdfBlobUrl;
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
    }
    set(initialState);
  },
}));

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as any).__formFlowStore = useFormFlowStore;
}
