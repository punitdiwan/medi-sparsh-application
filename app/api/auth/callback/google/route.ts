import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentHospital } from "@/lib/tenant";
import { db } from "@/lib/db";
import { memberInAuth as member } from "@/lib/db/migrations/schema";
import { eq } from "drizzle-orm";

/**
 * Google OAuth Callback Handler
 * 
 * This endpoint handles the callback from Google OAuth.
 * It validates that the authenticated user belongs to the current hospital/organization
 * based on the subdomain/tenant context.
 * 
 * Flow:
 * 1. BetterAuth processes the Google OAuth callback
 * 2. We extract the session and user information
 * 3. We validate the user belongs to the current hospital (organization)
 * 4. If valid, redirect to the dashboard
 * 5. If invalid, sign out and show error
 */
export async function GET(request: NextRequest) {
    try {
        // First, let BetterAuth handle the OAuth callback
        // This will create/update the user and session
        const authResponse = await auth.handler(request);
        console.log("authResponse", authResponse);

        // Get the current hospital context from subdomain
        const hospital = await getCurrentHospital();
        console.log("hospital", hospital);

        if (!hospital) {
            return NextResponse.redirect(
                new URL("/sign-in?error=hospital_not_found", request.url)
            );
        }

        // Get the session after OAuth authentication
        const sessionData = await auth.api.getSession({
            headers: request.headers,
        });

        if (!sessionData?.session || !sessionData?.user) {
            return NextResponse.redirect(
                new URL("/sign-in?error=authentication_failed", request.url)
            );
        }

        const userId = sessionData.user.id;
        const activeOrganizationId = sessionData.session.activeOrganizationId;
        console.log("userId", userId);
        console.log("activeOrganizationId", activeOrganizationId);

        // Validate that the user belongs to the current hospital
        // Check if user is a member of this organization
        const membershipResult = await db
            .select()
            .from(member)
            .where(eq(member.userId, userId))
            .limit(1);

        const userMembership = membershipResult[0];

        // Case 1: User has no organization membership at all
        if (!userMembership) {
            // Sign out the user since they don't belong to any organization
            await auth.api.signOut({
                headers: request.headers,
            });

            return NextResponse.redirect(
                new URL(
                    "/sign-in?error=not_member&message=You are not registered with any hospital. Please contact your administrator.",
                    request.url
                )
            );
        }

        // Case 2: User belongs to a different organization
        if (userMembership.organizationId !== hospital.hospitalId) {
            // Sign out the user
            await auth.api.signOut({
                headers: request.headers,
            });

            return NextResponse.redirect(
                new URL(
                    `/sign-in?error=wrong_organization&message=You are not an employee of ${hospital.name}. Please use the correct hospital portal.`,
                    request.url
                )
            );
        }

        // Case 3: User belongs to the correct organization
        // Session should already have the correct activeOrganizationId from databaseHooks
        // Redirect to dashboard/doctor page
        return NextResponse.redirect(new URL("/doctor", request.url));

    } catch (error) {
        console.error("Google OAuth callback error:", error);

        return NextResponse.redirect(
            new URL(
                "/sign-in?error=callback_failed&message=Authentication failed. Please try again.",
                request.url
            )
        );
    }
}
