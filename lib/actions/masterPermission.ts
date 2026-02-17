"use server";

import { db } from "@/db";
import { masterModules, masterPermissions } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";

export async function getMasterPermissions(moduleId?: string) {
  try {
    const query = db
      .select({
        id: masterPermissions.id,
        subject: masterPermissions.subject,
        actions: masterPermissions.actions,
        moduleId: masterPermissions.moduleId,
        moduleName: masterModules.name,
        moduleCode: masterModules.code,
      })
      .from(masterPermissions)
      .leftJoin(
        masterModules,
        eq(masterPermissions.moduleId, masterModules.id)
      )
      .orderBy(desc(masterPermissions.subject));

    const permissions = moduleId
      ? await query.where(eq(masterPermissions.moduleId, moduleId))
      : await query;

    return {
      success: true,
      data: permissions,
    };
  } catch (error) {
    console.error("Error fetching master permissions:", error);

    return {
      success: false,
      message: "Failed to fetch master permissions",
    };
  }
}
