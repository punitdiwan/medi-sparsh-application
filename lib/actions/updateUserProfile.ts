"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { userInAuth } from "@/lib/db/migrations/schema";
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

/**
 * Server action to update user profile information
 * Updates the user's name and/or email in the auth.user table
 * 
 * @param input - Object containing name and/or email to update
 * @returns Success response with updated user data or error
 */
export async function updateUserProfile(
  input: UpdateUserProfileInput
): Promise<UpdateUserProfileResponse> {
  try {
    // Get session to verify user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Please log in",
      };
    }

    const userId = session.user.id;

    // Validate input
    if (!input.name && !input.email) {
      return {
        success: false,
        error: "No fields provided to update",
      };
    }

    // Validate name if provided
    if (input.name !== undefined) {
      const nameStr = (input.name || "").trim();
      if (!nameStr) {
        return {
          success: false,
          error: "User name cannot be empty",
        };
      }
      if (nameStr.length < 2) {
        return {
          success: false,
          error: "User name must be at least 2 characters",
        };
      }
      if (nameStr.length > 100) {
        return {
          success: false,
          error: "User name must not exceed 100 characters",
        };
      }
    }

    // Validate email if provided
    if (input.email !== undefined) {
      const emailStr = (input.email || "").trim();
      if (emailStr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
        return {
          success: false,
          error: "Invalid email format",
        };
      }

      // Check if email is already in use by another user
      if (emailStr) {
        const existingUser = await db
          .select()
          .from(userInAuth)
          .where(eq(userInAuth.email, emailStr))
          .limit(1);

        if (existingUser.length > 0 && existingUser[0].id !== userId) {
          return {
            success: false,
            error: "Email is already in use",
          };
        }
      }
    }

    // Prepare update data
    const updateData: Record<string, any> = {};
    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }
    if (input.email !== undefined) {
      updateData.email = input.email.trim();
    }

    // Update user in database
    const updated = await db
      .update(userInAuth)
      .set(updateData)
      .where(eq(userInAuth.id, userId))
      .returning({
        id: userInAuth.id,
        name: userInAuth.name,
        email: userInAuth.email,
      });

    if (!updated || updated.length === 0) {
      return {
        success: false,
        error: "Failed to update user profile",
      };
    }

    return {
      success: true,
      data: {
        id: updated[0].id,
        name: updated[0].name,
        email: updated[0].email,
      },
    };
  } catch (error) {
    console.error("[Update User Profile Error]:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user profile",
    };
  }
}
