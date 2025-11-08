#!/usr/bin/env tsx

import { Command } from "commander";
import * as readline from "readline";
import { db } from "@/lib/db";
import { organization, user, member, staff, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth"; // your BetterAuth instance

interface HospitalData {
  name: string;
  slug: string;
  logo?: string;
}

interface AdminData {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  gender: "male" | "female" | "other";
}

const program = new Command();

// Create readline interface for interactive prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

// Generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Interactive mode - ask questions
async function promptForData(): Promise<{ hospital: HospitalData; admin: AdminData }> {
  console.log("\n🏥 Hospital Setup\n");

  const hospitalName = await question("Hospital Name: ");
  const hospitalSlug = await question(`Hospital Slug (default: ${generateSlug(hospitalName)}): `) || generateSlug(hospitalName);

  console.log("\n👤 Admin User Setup\n");

  const adminName = await question("Admin Name: ");

  let adminEmail = "";
  while (!adminEmail || !isValidEmail(adminEmail)) {
    adminEmail = await question("Admin Email: ");
    if (!isValidEmail(adminEmail)) {
      console.log("❌ Invalid email format. Please try again.");
    }
  }

  let adminPassword = "";
  while (!adminPassword || !isValidPassword(adminPassword)) {
    adminPassword = await question("Admin Password (min 8 characters): ");
    if (!isValidPassword(adminPassword)) {
      console.log("❌ Password must be at least 8 characters long.");
    }
  }

  const adminMobile = await question("Admin Mobile Number: ");

  let adminGender: "male" | "female" | "other" = "male";
  const genderInput = (await question("Admin Gender (male/female/other, default: male): ")).toLowerCase();
  if (genderInput === "female" || genderInput === "other") {
    adminGender = genderInput as "male" | "female" | "other";
  }

  return {
    hospital: {
      name: hospitalName,
      slug: hospitalSlug,
    },
    admin: {
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      mobileNumber: adminMobile,
      gender: adminGender,
    },
  };
}

// Create hospital and admin user
async function createHospitalAndAdmin(
  hospitalData: HospitalData,
  adminData: AdminData
): Promise<void> {
  try {
    console.log("\n🔄 Creating hospital and admin user...\n");

    // Check if hospital already exists
    // const existingHospital = await db
    //   .select()
    //   .from(organization)
    //   .where(eq(organization.slug, hospitalData.slug))
    //   .limit(1);

    // if (existingHospital.length > 0) {
    //   throw new Error(`Hospital with slug "${hospitalData.slug}" already exists`);
    // }

    // Check if user email already exists
    // const existingUser = await db
    //   .select()
    //   .from(user)
    //   .where(eq(user.email, adminData.email))
    //   .limit(1);

    // if (existingUser.length > 0) {
    //   throw new Error(`User with email "${adminData.email}" already exists`);
    // }


    // Generate UUIDs
    const hospitalId = randomUUID();
    const userId = randomUUID();
    const memberId = randomUUID();




    const userResp = await auth.api.signUpEmail({
      body: {
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
      },
    });
    console.log("✅ User 'User' created!", userResp);

    const org = await auth.api.createOrganization({
      body: {
        name: hospitalData.name,
        slug: hospitalData.slug,
        userId: userResp.user.id,
        metadata: {
          address: "123 Medical Street, City",
          phone: "+91-1234567890",
          email: "contact@medisparsh.com",
        },
        keepCurrentActiveOrganization: true,
      }
    });
    console.log(`✅ Hospital created ${org?.id}`);


    const login  = await auth.api.signInEmail({
      body: {
        email: adminData.email,
        password: adminData.password,
      },
    });
    console.log(`✅ Hospital created ${login}`);


    // Create member record (links user to organization with admin role)
    // const memberResp = await auth.api.addMember({
    //   body: {
    //     organizationId: org?.id,
    //     userId: userResp.user.id,
    //     role: "admin",
    //   },
    // });

       //console.log(`✅ Admin role assigned to user in hospital ${memberResp?.id}`);

    console.log("\n✨ Setup completed successfully!\n");
    console.log("📋 Summary:");
    console.log(`   Hospital: ${org?.name}`);
    console.log(`   Slug: ${org?.slug}`);
    console.log(`   Admin: ${userResp.user.name}`);
    console.log(`   Email: ${userResp.user.email}`);
    console.log(`   Role: admin`);
    console.log("\n🔗 You can now login with the admin credentials.\n");
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  }
}

// Main program
program
  .name("create-admin")
  .description("Create a hospital and admin user")
  .version("1.0.0")
  .option("--hospital-name <name>", "Hospital name")
  .option("--hospital-slug <slug>", "Hospital slug")
  .option("--admin-name <name>", "Admin user name")
  .option("--admin-email <email>", "Admin user email")
  .option("--admin-password <password>", "Admin user password")
  .option("--admin-mobile <mobile>", "Admin user mobile number")
  .option("--admin-gender <gender>", "Admin user gender (male/female/other)")
  .action(async (options: any) => {
    try {
      let hospitalData: HospitalData;
      let adminData: AdminData;

      // Check if all required arguments are provided
      const hasAllArgs =
        options.hospitalName &&
        options.adminName &&
        options.adminEmail &&
        options.adminPassword &&
        options.adminMobile;

      if (hasAllArgs) {
        // Use command-line arguments
        console.log("\n📝 Using command-line arguments...\n");

        if (!isValidEmail(options.adminEmail)) {
          throw new Error("Invalid email format");
        }

        if (!isValidPassword(options.adminPassword)) {
          throw new Error("Password must be at least 8 characters long");
        }

        hospitalData = {
          name: options.hospitalName,
          slug: options.hospitalSlug || generateSlug(options.hospitalName),
        };

        adminData = {
          name: options.adminName,
          email: options.adminEmail,
          password: options.adminPassword,
          mobileNumber: options.adminMobile,
          gender: (options.adminGender as "male" | "female" | "other") || "male",
        };
      } else {
        // Interactive mode
        const data = await promptForData();
        hospitalData = data.hospital;
        adminData = data.admin;
      }

      // Create hospital and admin
      await createHospitalAndAdmin(hospitalData, adminData);

      rl.close();
      process.exit(0);
    } catch (error) {
      console.error("\n❌ Failed to create hospital and admin:", error);
      rl.close();
      process.exit(1);
    }
  });

program.parse(process.argv);
