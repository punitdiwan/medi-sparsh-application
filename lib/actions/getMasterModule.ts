"use server";

import { db } from "@/db";
import { masterModules, modules } from "@/drizzle/schema";
import { and, desc, eq, sql } from "drizzle-orm";
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


export async function getModules() {
    const org = await getActiveOrganization();
    if (!org) {
        return { error: "Unauthorized" };
    }
    try {
        const result = await db
            .select({
                id: modules.id,
                name: modules.name,
                moduleId: modules.moduleId,
                hospitalId: modules.hospitalId,
                isDeleted: modules.isDeleted,
                createdAt: modules.createdAt,
                updatedAt: modules.updatedAt,
                masterModuleName: masterModules.name,
                masterModuleCode: masterModules.code,
            })
            .from(modules)
            .leftJoin(masterModules, eq(modules.moduleId, masterModules.id))
            .where(
                and(
                    eq(modules.isDeleted, false),
                    org?.id ? eq(modules.hospitalId, org.id) : undefined
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

