/*
 * Client‑side storage utilities for managing patients in localStorage.
 *
 * This module defines the Patient type and helper functions to create,
 * retrieve and update patient records. Data is persisted in the browser
 * using localStorage under the key `patients`.  All operations are
 * synchronous and safe to call in a browser environment.
 */

export type PatientProfile = {
  sex?: 'F' | 'M' | 'Outro';
  age?: number;
  heightCm?: number;
  weightKg?: number;
  objective?: string;
};

export type PatientAssessment = {
  clinicalNotes?: string;
  training?: string;
  sleep?: string;
  supplements?: string;
};

export type PatientGoals = {
  kcal?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
};

export type DietItem = { food: string; qty?: string };
export type DietMeal = { name: string; items: DietItem[] };
export type PatientDiet = { meals: DietMeal[] };

export type Patient = {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
  notes?: string;
  profile?: PatientProfile;
  assessment?: PatientAssessment;
  goals?: PatientGoals;
  diet?: PatientDiet;
};

const STORAGE_KEY = 'patients';

function readPatients(): Patient[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse patients from localStorage', err);
    return [];
  }
}

function writePatients(patients: Patient[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch (err) {
    console.error('Failed to write patients to localStorage', err);
  }
}

/**
 * Returns all patients stored in localStorage. The array may be empty
 * if no patients have been saved yet.
 */
export function getPatients(): Patient[] {
  return readPatients();
}

/**
 * Retrieves a single patient by id. Returns undefined if not found.
 */
export function getPatientById(id: string): Patient | undefined {
  // Permite pesquisar tanto por string quanto por número, garantindo compatibilidade
  // com dados legados (ids numéricos) e novos (ids strings).
  return readPatients().find((p) => {
    const pid: any = (p as any).id;
    return pid === id || String(pid) === id;
  });
}

/**
 * Updates an existing patient. Only the provided fields are
 * overwritten; unspecified fields remain unchanged. Does nothing
 * if the patient does not exist.
 */
export function updatePatient(id: string, update: Partial<Patient>): void {
  const patients = readPatients();
  const idx = patients.findIndex((p) => {
    const pid: any = (p as any).id;
    return pid === id || String(pid) === id;
  });
  if (idx === -1) return;
  const current = patients[idx];
  patients[idx] = { ...current, ...update } as Patient;
  writePatients(patients);
}

/**
 * Adds a new patient to localStorage. If a patient with the same id
 * already exists, it will be overwritten.
 */
export function addPatient(patient: Patient): void {
  const patients = readPatients();
  const idx = patients.findIndex(p => p.id === patient.id);
  if (idx >= 0) {
    patients[idx] = patient;
  } else {
    patients.push(patient);
  }
  writePatients(patients);
}