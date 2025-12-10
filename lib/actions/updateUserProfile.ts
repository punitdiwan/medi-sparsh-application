"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/index";
import { user } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

interface UpdateUserProfileInput {
  name?: string;
  email?: string;
}

interface UpdateUserProfileResponse {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    name: string;
    email: string;
  };
}

export async function updateUserProfile(
  input: UpdateUserProfileInput
): Promise<UpdateUserProfileResponse> {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized - Please log in" };
    }
    const userId = session.user.id;

    // Validate input
    if (!input.name && !input.email) {
      return { success: false, error: "No fields provided to update" };
    }

    // Trim input
    const updateData: Partial<{ name: string; email: string }> = {};
    if (input.name !== undefined) {
      const nameStr = input.name.trim();
      if (nameStr.length < 2) {
        return { success: false, error: "User name must be at least 2 characters" };
      }
      if (nameStr.length > 100) {
        return { success: false, error: "User name must not exceed 100 characters" };
      }
      updateData.name = nameStr;
    }

    if (input.email !== undefined) {
      const emailStr = input.email.trim();
      if (emailStr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
        return { success: false, error: "Invalid email format" };
      }

      // Check if email exists in other users
      const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, emailStr))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return { success: false, error: "Email is already in use" };
      }
      updateData.email = emailStr;
    }

    // Update user
    const updated = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning({ id: user.id, name: user.name, email: user.email });

    if (!updated.length) {
      return { success: false, error: "Failed to update user profile" };
    }

    return {
      success: true,
      data: {
        id: updated[0].id,
        name: updated[0].name,
        email: updated[0].email,
      },
    };
  } catch (err) {
    console.error("[Update User Profile Error]:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update user profile" };
  }
}
