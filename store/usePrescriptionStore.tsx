import { create } from "zustand";

interface Medicine {
  name: string;
  frequency: string;   // e.g. "1 tablet"
  timing: string;      // e.g. "After Meal"
  duration: string;    // e.g. "5 days"
  instruction: string; // e.g. "If fever persists, continue 3 more days"
}

interface PrescriptionState {
  vitals: Record<string, string>;
  symptoms: string[];
  diagnosis: string[];
  medicines: Medicine[];
  notes: string;
  advice: string;

  // Actions
  addSymptom: (symptom: string) => void;
  removeSymptom: (index: number) => void;
  clearSymptoms: () => void;

  addDiagnosis: (diag: string) => void;
  removeDiagnosis: (index: number) => void;
  clearDiagnosis: () => void;

  addMedicine: (med: Medicine) => void;
  removeMedicine: (index: number) => void;
  clearMedicines: () => void;

  setVitals: (vitals: Record<string, string>) => void;
  setNotes: (notes: string) => void;
  setAdvice: (advice: string) => void;
}

export const usePrescriptionStore = create<PrescriptionState>((set) => ({
  vitals: {},
  symptoms: [],
  diagnosis: [],
  medicines: [],
  notes: "",
  advice: "",

  // ---- Symptoms ----
  addSymptom: (symptom) =>
    set((state) => ({
      symptoms: state.symptoms.includes(symptom.trim())
        ? state.symptoms
        : [...state.symptoms, symptom.trim()],
    })),
  removeSymptom: (index) =>
    set((state) => ({
      symptoms: state.symptoms.filter((_, i) => i !== index),
    })),
  clearSymptoms: () => set({ symptoms: [] }),

  // ---- Diagnosis ----
  addDiagnosis: (diag) =>
    set((state) => ({
      diagnosis: state.diagnosis.includes(diag.trim())
        ? state.diagnosis
        : [...state.diagnosis, diag.trim()],
    })),
  removeDiagnosis: (index) =>
    set((state) => ({
      diagnosis: state.diagnosis.filter((_, i) => i !== index),
    })),
  clearDiagnosis: () => set({ diagnosis: [] }),

  // ---- Medicines ----
  addMedicine: (med) =>
    set((state) => ({
      medicines: [...state.medicines, med],
    })),
  removeMedicine: (index) =>
    set((state) => ({
      medicines: state.medicines.filter((_, i) => i !== index),
    })),
  clearMedicines: () => set({ medicines: [] }),

  // ---- Misc ----
  setVitals: (vitals) => set({ vitals }),
  setNotes: (notes) => set({ notes }),
  setAdvice: (advice) => set({ advice }),
}));
