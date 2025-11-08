

const PREFIX = "PT";
const RANDOM_LENGTH = 4;
const MAX_ATTEMPTS = 5;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

async function generateUniquePatientId(): Promise<string> {
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;

    // Step 1: Generate ID
    const timestamp = Date.now().toString().slice(-6); // last 6 digits
    let randomPart = "";
    for (let i = 0; i < RANDOM_LENGTH; i++) {
      randomPart += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    const patientId = PREFIX + timestamp + randomPart; // total 12 chars

    // Step 2: Check uniqueness in DB
   
    // else, loop continues
  }

  throw new Error("Unable to generate unique patient ID after 5 attempts. Please try again.");
}

export default generateUniquePatientId;
