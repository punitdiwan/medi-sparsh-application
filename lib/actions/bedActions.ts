"use server";

import { db } from "@/db/index";
import { bedGroups, beds, floors, ipdAdmission, patients, doctors, staff, user } from "@/db/schema";
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

export async function getBedManagementData() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        // Fetch floors
        const floorsData = await db
            .select()
            .from(floors)
            .where(and(eq(floors.hospitalId, org.id), eq(floors.isDeleted, false)));

        // Fetch bed groups (wards)
        const groupsData = await db
            .select()
            .from(bedGroups)
            .where(and(eq(bedGroups.hospitalId, org.id), eq(bedGroups.isDeleted, false)));

        // Fetch beds with patient and doctor info
        const bedsData = await db
            .select({
                id: beds.id,
                name: beds.name,
                bedGroupId: beds.bedGroupId,
                isOccupied: beds.isOccupied,
                patientId: patients.id,
                patientName: patients.name,
                gender: patients.gender,
                phone: patients.mobileNumber,
                referredByDr: patients.referredByDr,
                admissionDate: ipdAdmission.admissionDate,
                consultant: user.name,
            })
            .from(beds)
            .leftJoin(ipdAdmission, and(eq(beds.id, ipdAdmission.bedId), eq(ipdAdmission.isDeleted, false)))
            .leftJoin(patients, eq(ipdAdmission.patientId, patients.id))
            .leftJoin(doctors, eq(ipdAdmission.doctorId, doctors.id))
            .leftJoin(staff, eq(doctors.staffId, staff.id))
            .leftJoin(user, eq(staff.userId, user.id))
            .where(and(eq(beds.hospitalId, org.id), eq(beds.isDeleted, false)));

        // Transform to the required structure
        const result = floorsData.map(floor => ({
            id: floor.id,
            floorName: floor.name,
            wards: groupsData
                .filter(group => group.floorId === floor.id)
                .map(group => ({
                    id: group.id,
                    name: group.name,
                    beds: bedsData
                        .filter(bed => bed.bedGroupId === group.id)
                        .map(bed => ({
                            id: bed.id,
                            bedNo: bed.name,
                            status: bed.isOccupied ? "OCCUPIED" : "EMPTY",
                            patient: bed.isOccupied ? {
                                patientId: bed.patientId,
                                name: bed.patientName,
                                gender: bed.gender,
                                phone: bed.phone,
                                guardianName: bed.referredByDr || "",
                                admissionDate: bed.admissionDate ? new Date(bed.admissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "",
                                consultant: bed.consultant || "",
                            } : undefined
                        }))
                }))
        }));

        return { data: result };
    } catch (error) {
        console.error("Error fetching bed management data:", error);
        return { error: "Failed to fetch bed management data" };
    }
}
