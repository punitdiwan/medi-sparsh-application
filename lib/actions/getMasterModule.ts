"use server";

import { db } from "@/db";
import { masterModules, masterPermissions, modulePermissions, modules } from "@/drizzle/schema";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";

export async function getMasterModules() {
    try {
        const modules = await db
            .select()
            .from(masterModules)
            .orderBy(desc(masterModules.createdAt));

        return {
            success: true,
            data: modules,
        };
    } catch (error) {
        console.error("Error fetching master modules:", error);

        return {
            success: false,
            message: "Failed to fetch master modules",
        };
    }
}


export async function getModulesByHospita() {
    const org = await getActiveOrganization();
    if (!org) {
        return { error: "Unauthorized" };
    }

    try {
        const result = await db
            .select({
                moduleDbId: modules.id,
                moduleName: modules.name,
                hospitalId: modules.hospitalId,
                masterModuleId: masterModules.id,
                masterModuleName: masterModules.name,
                masterModuleCode: masterModules.code,

                permissionId: masterPermissions.id,
                permissionSubject: masterPermissions.subject,
                permissionActions: masterPermissions.actions,
            })
            .from(modules)

            // 1️⃣ Join master module
            .innerJoin(
                masterModules,
                eq(modules.moduleId, masterModules.id)
            )

            // 2️⃣ Join module_permissions
            .leftJoin(
                modulePermissions,
                eq(masterModules.id, modulePermissions.moduleId)
            )

            // 3️⃣ Join master_permissions
            .leftJoin(
                masterPermissions,
                eq(modulePermissions.permissionId, masterPermissions.id)
            )

            .where(
                and(
                    eq(modules.isDeleted, false),
                    eq(modules.hospitalId, org.id),
                    isNotNull(modules.moduleId)
                )
            );

        return {
            success: true,
            data: result,
        };

    } catch (error) {
        console.error("Error fetching modules:", error);
        return {
            success: false,
            message: "Failed to fetch modules",
        };
    }
}

// export async function getClinicModuleWithPermissions() {
//     try {

//         const result = await db
//             .select({
//                 masterModuleName: masterModules.name,
//                 masterModuleCode: masterModules.code,

//                 permissionId: masterPermissions.id,
//                 subject: masterPermissions.subject,
//                 actions: masterPermissions.actions,
//             })
//             .from(masterModules)

//             // CLN master module
//             .where(eq(masterModules.code, "CLN"))

//             // module_permissions join
//             .leftJoin(
//                 modulePermissions,
//                 eq(modulePermissions.moduleId, masterModules.id)
//             )
//             // master_permissions join
//             .leftJoin(
//                 masterPermissions,
//                 eq(modulePermissions.permissionId, masterPermissions.id)
//             );

//         return {
//             success: true,
//             data: result,
//         };

//     } catch (error) {
//         console.error("Error fetching clinic module:", error);
//         return {
//             success: false,
//             message: "Failed to fetch clinic module",
//         };
//     }
// }

export const getModulesWithPermissions = async (
    hospitalId: string,
    orgMode: "hospital" | "clinic"
) => {
    try {
        let rawData: any[] = [];

        if (orgMode === "hospital") {
            // 🔹 Hospital modules (instances + master + permissions)
            const hospitalModules = await db
                .select({
                    moduleDbId: modules.id,
                    moduleName: modules.name,
                    hospitalId: modules.hospitalId,
                    masterModuleId: masterModules.id,
                    masterModuleName: masterModules.name,
                    masterModuleCode: masterModules.code,
                    permissionId: masterPermissions.id,
                    permissionSubject: masterPermissions.subject,
                    permissionActions: masterPermissions.actions,
                })
                .from(modules)
                .leftJoin(masterModules, eq(modules.moduleId, masterModules.id))
                .leftJoin(modulePermissions, eq(modulePermissions.moduleId, masterModules.id))
                .leftJoin(masterPermissions, eq(modulePermissions.permissionId, masterPermissions.id))
                .where(
                    and(
                        eq(modules.hospitalId, hospitalId),
                        eq(modules.isDeleted, false)
                    )
                );

            // 🔹 2️⃣ Master modules with HOSP code + permissions
            const masterHospModules = await db
                .select({
                    masterModuleId: masterModules.id,
                    masterModuleName: masterModules.name,
                    masterModuleCode: masterModules.code,
                    permissionId: masterPermissions.id,
                    permissionSubject: masterPermissions.subject,
                    permissionActions: masterPermissions.actions,
                })
                .from(masterModules)
                .leftJoin(modulePermissions, eq(modulePermissions.moduleId, masterModules.id))
                .leftJoin(masterPermissions, eq(modulePermissions.permissionId, masterPermissions.id))
                .where(eq(masterModules.code, "HOSP"));

            // 🔹 3️⃣ Merge hospital + HOSP master modules
            const combined = [...hospitalModules, ...masterHospModules];

            rawData = combined;
        } else {
            // 🔹 Clinic modules (master modules with CLN code + permissions)
            const clinicModules = await db
                .select({
                    masterModuleId: masterModules.id,
                    masterModuleName: masterModules.name,
                    masterModuleCode: masterModules.code,
                    permissionId: masterPermissions.id,
                    permissionSubject: masterPermissions.subject,
                    permissionActions: masterPermissions.actions,
                })
                .from(masterModules)
                .leftJoin(modulePermissions, eq(modulePermissions.moduleId, masterModules.id))
                .leftJoin(masterPermissions, eq(modulePermissions.permissionId, masterPermissions.id))
                .where(eq(masterModules.code, "CLN"));

            rawData = clinicModules;
        }

        return {
            success: true,
            data: rawData, // 🔹 Flat list, no grouping
        };
    } catch (error) {
        console.error("Error fetching modules with permissions:", error);
        return {
            success: false,
            message: "Failed to fetch modules",
        };
    }
};
