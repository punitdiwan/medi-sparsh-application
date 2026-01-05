import { db } from "./db/index";
import { appointments } from "./db/schema";

async function listAppointments() {
    const result = await db.select().from(appointments).limit(5);
    console.log("Appointments:", JSON.stringify(result, null, 2));
}

listAppointments().catch(console.error);
