import { nanoid, customAlphabet } from "nanoid";

/**
 * Generate a unique patient ID
 * Format: P + 10 alphanumeric characters (uppercase)
 * Example: PABCD123456
 */
export function generatePatientId(): string {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const generateId = customAlphabet(alphabet, 10);
  return `P${generateId()}`;
}

/**
 * Generate a unique appointment ID
 * Format: APT + 10 alphanumeric characters (uppercase)
 * Example: APTXYZ7890ABC
 */
export function generateAppointmentId(): string {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const generateId = customAlphabet(alphabet, 10);
  return `APT${generateId()}`;
}

/**
 * Generate a unique prescription ID
 * Format: RX + 10 alphanumeric characters (uppercase)
 * Example: RX1234ABCDEF
 */
export function generatePrescriptionId(): string {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const generateId = customAlphabet(alphabet, 10);
  return `RX${generateId()}`;
}

/**
 * Generate a unique hospital ID
 * Format: HOSP + 6 alphanumeric characters (lowercase)
 * Example: hosp-abc123
 */
export function generateHospitalId(): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  const generateId = customAlphabet(alphabet, 6);
  return `hosp-${generateId()}`;
}

/**
 * Generate a short, URL-friendly ID
 * Used for general purposes
 */
export function generateShortId(length: number = 8): string {
  return nanoid(length);
}
