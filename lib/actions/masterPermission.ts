"use server";

import { db } from "@/db";
import { masterPermissions } from "@/drizzle/schema";
import { desc } from "drizzle-orm";

export async function getMasterPermissions() {
  try {
    const data = await db
      .select({
        id: masterPermissions.id,
        subject: masterPermissions.subject,
        actions: masterPermissions.actions,
      })
      .from(masterPermissions)
      .orderBy(desc(masterPermissions.subject));

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching master permissions:", error);

    return {
      success: false,
      message: "Failed to fetch master permissions",
    };
  }
}
