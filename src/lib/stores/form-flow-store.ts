'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type FormFlowStep =
  | 'select-form'
  | 'patient-details'
  | 'dictate'
  | 'processing'
  | 'review';

interface FormFlowState {
  currentStep: FormFlowStep;
  selectedFormType: string | null;
  patientDetails: Record<string, string>;
  transcription: string;
  extractedData: Record<string, unknown> | null;
  pdfBlobUrl: string | null;

  setStep: (step: FormFlowStep) => void;
  setFormType: (formType: string) => void;
  setPatientDetails: (details: Record<string, string>) => void;
  setTranscription: (text: string) => void;
  setExtractedData: (data: Record<string, unknown>) => void;
  setPdfBlobUrl: (url: string) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 'select-form' as FormFlowStep,
  selectedFormType: null,
  patientDetails: {},
  transcription: '',
  extractedData: null,
  pdfBlobUrl: null,
};

// SECURITY: No persist middleware — patient data must NEVER touch localStorage.
// DevTools middleware only in development.
export const useFormFlowStore = create<FormFlowState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      setFormType: (formType) => set({ selectedFormType: formType }),
      setPatientDetails: (details) => set({ patientDetails: details }),
      setTranscription: (text) => set({ transcription: text }),
      setExtractedData: (data) => set({ extractedData: data }),
      setPdfBlobUrl: (url) => set({ pdfBlobUrl: url }),

      reset: () => {
        // Revoke any existing PDF blob URL to free memory
        const currentBlobUrl = get().pdfBlobUrl;
        if (currentBlobUrl) {
          URL.revokeObjectURL(currentBlobUrl);
        }
        set(initialState);
      },
    }),
    { name: 'form-flow-store', enabled: process.env.NODE_ENV === 'development' }
  )
);
