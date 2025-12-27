"use server";

import { db } from "@/db/index";
import { doctors, staff, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";

export async function getDoctors() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                id: doctors.id,
                name: user.name,
                specialization: doctors.specialization,
            })
            .from(doctors)
            .innerJoin(staff, eq(doctors.staffId, staff.id))
            .innerJoin(user, eq(staff.userId, user.id))
            .where(
                and(
                    eq(doctors.hospitalId, org.id),
                    eq(doctors.isDeleted, false)
                )
            );

        return { data };
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return { error: "Failed to fetch doctors" };
    }
}
