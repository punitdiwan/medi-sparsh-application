import { db } from "../index";
import { pharmacySales } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function getPharmacySalesByHospital(hospitalId: string) {
    return await db
        .select()
        .from(pharmacySales)
        .where(eq(pharmacySales.hospitalId, hospitalId))
        .orderBy(desc(pharmacySales.createdAt));
}
