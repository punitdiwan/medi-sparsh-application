"use server";

import { db } from "@/db/index";
import { bedGroups, beds } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";

export async function getBedGroups() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                id: bedGroups.id,
                name: bedGroups.name,
            })
            .from(bedGroups)
            .where(
                and(
                    eq(bedGroups.hospitalId, org.id),
                    eq(bedGroups.isDeleted, false)
                )
            );

        return { data };
    } catch (error) {
        console.error("Error fetching bed groups:", error);
        return { error: "Failed to fetch bed groups" };
    }
}

export async function getBeds() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                id: beds.id,
                name: beds.name,
                bedGroupId: beds.bedGroupId,
                isOccupied: beds.isOccupied,
            })
            .from(beds)
            .where(
                and(
                    eq(beds.hospitalId, org.id),
                    eq(beds.isDeleted, false),
                    eq(beds.isOccupied, false) // Only fetch available beds
                )
            );

        return { data };
    } catch (error) {
        console.error("Error fetching beds:", error);
        return { error: "Failed to fetch beds" };
    }
}
