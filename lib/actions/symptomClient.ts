"use server";

import { getSymptoms } from "./symptomActions";


export async function searchSymptoms() {
  return await getSymptoms();
}
