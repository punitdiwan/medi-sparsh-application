import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import {
    organization,
    member,
    user,
    organizationRole,
    staff,
    doctors,
} from "@/drizzle/schema";

export async function deleteOrganizationAndUsers(hospitalId: string) {
    try {
        console.log(`Starting deletion for organization: ${hospitalId}`);

        // 1️⃣ Delete doctors first
        const doctorsToDelete = await db.select().from(doctors).where(eq(doctors.hospitalId, hospitalId));
        console.log("Doctors to delete:", doctorsToDelete);

        if (doctorsToDelete.length > 0) {
            await db.delete(doctors).where(eq(doctors.hospitalId, hospitalId));
            console.log(`Deleted ${doctorsToDelete.length} doctors.`);
        }

        // 2️⃣ Delete staff
        const staffToDelete = await db.select().from(staff).where(eq(staff.hospitalId, hospitalId));
        console.log("Staff to delete:", staffToDelete);

        if (staffToDelete.length > 0) {
            await db.delete(staff).where(eq(staff.hospitalId, hospitalId));
            console.log(`Deleted ${staffToDelete.length} staff.`);
        }

        // 3️⃣ Get all members
        const members = await db
            .select({
                id: member.id,
                userId: member.userId,
                role: member.role,
                createdAt: member.createdAt,
            })
            .from(member)
            .where(eq(member.organizationId, hospitalId));

        console.log("Members to delete:", members);
        const memberUserIds = members.map((m) => m.userId);

        // 4️⃣ Delete members
        if (members.length > 0) {
            await db.delete(member).where(eq(member.organizationId, hospitalId));
            console.log(`Deleted ${members.length} members.`);
        }

        // 5️⃣ Delete organization roles
        const orgRoles = await db.select().from(organizationRole).where(eq(organizationRole.organizationId, hospitalId));
        console.log("Organization roles to delete:", orgRoles);

        if (orgRoles.length > 0) {
            await db.delete(organizationRole).where(eq(organizationRole.organizationId, hospitalId));
            console.log(`Deleted ${orgRoles.length} roles.`);
        }

        // 6️⃣ Delete organization
        const org = await db.select().from(organization).where(eq(organization.id, hospitalId));
        console.log("Organization to delete:", org);

        if (org.length > 0) {
            await db.delete(organization).where(eq(organization.id, hospitalId));
            console.log(`Deleted organization ${hospitalId}.`);
        }

        // 7️⃣ Delete users
        if (memberUserIds.length > 0) {
            const usersToDelete = await db.select().from(user).where(inArray(user.id, memberUserIds));
            console.log("Users to delete:", usersToDelete);

            if (usersToDelete.length > 0) {
                await db.delete(user).where(inArray(user.id, memberUserIds));
                console.log(`Deleted ${usersToDelete.length} users.`);
            }
        }

        console.log("Organization + related entities deletion completed ✅");
    } catch (err) {
        console.error("Error during deletion:", err);
        throw err;
    }
}