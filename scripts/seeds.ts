#!/usr/bin/env tsx

import { db } from "../db/index";
import { organization, floors, bedGroups, bedsTypes, beds } from "../db/schema";
import { randomUUID } from "crypto";
import { Command } from "commander";
import * as readline from "readline";
import { eq, or } from "drizzle-orm";

const program = new Command();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

async function seed(orgIdOrName?: string) {
    try {
        console.log("🌱 Starting seeding...");

        let hospital;

        if (orgIdOrName) {
            const hospitals = await db
                .select()
                .from(organization)
                .where(or(eq(organization.id, orgIdOrName), eq(organization.name, orgIdOrName)))
                .limit(1);

            if (hospitals.length === 0) {
                console.error(`❌ No organization found with ID or Name: ${orgIdOrName}`);
                process.exit(1);
            }
            hospital = hospitals[0];
        } else {
            // Interactive mode
            const input = await question("Enter Organization ID or Name: ");
            if (!input) {
                console.error("❌ Organization ID or Name is required.");
                process.exit(1);
            }
            const hospitals = await db
                .select()
                .from(organization)
                .where(or(eq(organization.id, input), eq(organization.name, input)))
                .limit(1);

            if (hospitals.length === 0) {
                console.error(`❌ No organization found with ID or Name: ${input}`);
                process.exit(1);
            }
            hospital = hospitals[0];
        }

        const hospitalId = hospital.id;
        console.log(`🏥 Using Hospital: ${hospital.name} (${hospitalId})`);

        // 2. Seed Floors
        console.log("🏢 Seeding Floors...");
        const floorData = [
            { id: randomUUID(), hospitalId, name: "Ground Floor", description: "Reception and Emergency" },
            { id: randomUUID(), hospitalId, name: "First Floor", description: "General Wards" },
            { id: randomUUID(), hospitalId, name: "Second Floor", description: "ICU and Special Wards" },
        ];
        await db.insert(floors).values(floorData);
        console.log("✅ Floors seeded.");

        // 3. Seed Bed Types
        console.log("🛏️ Seeding Bed Types...");
        const bedTypeData = [
            { id: randomUUID(), hospitalId, name: "Standard", description: "Basic hospital bed" },
            { id: randomUUID(), hospitalId, name: "Deluxe", description: "Semi-private room bed" },
            { id: randomUUID(), hospitalId, name: "ICU Bed", description: "Intensive Care Unit bed" },
        ];
        await db.insert(bedsTypes).values(bedTypeData);
        console.log("✅ Bed Types seeded.");

        // 4. Seed Bed Groups
        console.log("👥 Seeding Bed Groups...");
        const bedGroupData = [
            { id: randomUUID(), hospitalId, name: "General Ward A", floorId: floorData[1].id, description: "Male General Ward" },
            { id: randomUUID(), hospitalId, name: "General Ward B", floorId: floorData[1].id, description: "Female General Ward" },
            { id: randomUUID(), hospitalId, name: "Semi-Private Ward", floorId: floorData[1].id, description: "Shared rooms" },
            { id: randomUUID(), hospitalId, name: "ICU Ward", floorId: floorData[2].id, description: "Critical Care" },
        ];
        await db.insert(bedGroups).values(bedGroupData);
        console.log("✅ Bed Groups seeded.");

        // 5. Seed Beds
        console.log("🛌 Seeding Beds...");
        const bedData = [];

        // General Ward A - 5 Standard Beds
        for (let i = 1; i <= 5; i++) {
            bedData.push({
                id: randomUUID(),
                hospitalId,
                name: `GWA-${i}`,
                bedTypeId: bedTypeData[0].id,
                bedGroupId: bedGroupData[0].id,
                status: "active",
                isOccupied: false,
            });
        }

        // Semi-Private - 3 Deluxe Beds
        for (let i = 1; i <= 3; i++) {
            bedData.push({
                id: randomUUID(),
                hospitalId,
                name: `SPW-${i}`,
                bedTypeId: bedTypeData[1].id,
                bedGroupId: bedGroupData[2].id,
                status: "active",
                isOccupied: false,
            });
        }

        // ICU - 2 ICU Beds
        for (let i = 1; i <= 2; i++) {
            bedData.push({
                id: randomUUID(),
                hospitalId,
                name: `ICU-${i}`,
                bedTypeId: bedTypeData[2].id,
                bedGroupId: bedGroupData[3].id,
                status: "active",
                isOccupied: false,
            });
        }

        await db.insert(beds).values(bedData);
        console.log("✅ Beds seeded.");

        console.log("✨ Seeding completed successfully!");
        rl.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        rl.close();
        process.exit(1);
    }
}

program
    .name("seeds")
    .description("Seed Beds, BedTypes, BedGroups, and Floors for a specific organization")
    .option("--org <idOrName>", "Organization ID or Name")
    .action(async (options) => {
        await seed(options.org);
    });

program.parse(process.argv);
