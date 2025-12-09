import { headers } from "next/headers";
import { db } from "./db";
import { organization, member } from "./db/migrations/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";
/**
 * Get the current organization/hospital based on the request subdomain or slug
 * This supports multi-tenant architecture where each hospital is an organization
 */
export async function getCurrentHospital() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // Extract the subdomain (remove port if present)
  let domain;
  let subdomain;
  if (process.env.VERCEL) {
    domain = host.split(".")[0];
    subdomain = "abc"
    // subdomain = domain.split(".")[0]; // Get first part as subdomain
  }
  else {
    domain = host.split(":")[0];
    subdomain = domain.split(".")[0]; // Get first part as subdomain

  }

  console.log(domain, subdomain);
  
  // Query the database to find the organization by slug (using subdomain as slug)
  const result = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, subdomain))
    .limit(1);

  const hospital = result[0];
  logger.info(hospital);

  if (!hospital) {
    throw new Error(`Organization not found for domain: ${domain}`);
  }

  return {
    hospitalId: hospital.id,
    name: hospital.name,
    slug: hospital.slug,
    logo: hospital.logo,
    metadata: hospital.metadata ? JSON.parse(hospital.metadata) : null,
  };
}

/**
 * Get organization/hospital by ID
 */
export async function getHospitalById(hospitalId: string) {
  const result = await db
    .select()
    .from(organization)
    .where(eq(organization.id, hospitalId))
    .limit(1);

  const hospital = result[0];

  if (!hospital) {
    throw new Error(`Organization not found with ID: ${hospitalId}`);
  }

  return {
    hospitalId: hospital.id,
    name: hospital.name,
    slug: hospital.slug,
    logo: hospital.logo,
    metadata: hospital.metadata ? JSON.parse(hospital.metadata) : null,
  };
}

/**
 * Validate if a user has access to an organization/hospital with a specific role
 */
export async function validateUserHospitalAccess(
  userId: string,
  hospitalId: string,
  requiredRole?: string
) {
  const result = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.userId, userId),
        eq(member.organizationId, hospitalId)
      )
    )
    .limit(1);

  const userMember = result[0];

  if (!userMember) {
    return false;
  }

  if (requiredRole && userMember.role !== requiredRole) {
    return false;
  }

  return true;
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug: string) {
  const result = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1);

  const org = result[0];

  if (!org) {
    return null;
  }

  return {
    hospitalId: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo,
    metadata: org.metadata ? JSON.parse(org.metadata) : null,
  };
}
