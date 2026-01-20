#!/usr/bin/env tsx

import { db } from "../db/index";
import { Command } from "commander";
import * as readline from "readline";
import { eq,  or } from "drizzle-orm";
import { organization } from "@/drizzle/schema";
import { seedDemoData } from "./seedDemoData";
import { deleteOrganizationAndUsers } from "./deleteOrganization";
import { deleteDemoData } from "./deleteData";

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
        const input = orgIdOrName ?? (await question("Enter Organization ID or Name: "));

        if (!input?.trim()) {
            throw new Error("Organization ID or Name is required");
        }

        const hospital = await getHospitalByIdOrName(input);

        console.log(`🏥 Using Hospital: ${hospital.name}`);

        // --------------check delete ---------------------

        // await deleteDemoData(hospital.id)

        // await deleteOrganizationAndUsers(hospital.id)

        // --------------above check delete function--------------------

        // --------------Create functions below here ---------------------------

        await seedDemoData(hospital.id)

        console.log("✨ Seeding completed");
        rl.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        rl.close();
        process.exit(1);
    }
}

async function getHospitalByIdOrName(input: string) {
    const hospitals = await db
        .select({
            id: organization.id,
            name: organization.name,
        })
        .from(organization)
        .where(
            or(
                eq(organization.id, input),
                eq(organization.name, input)
            )
        )
        .limit(1);

    if (!hospitals.length) {
        throw new Error(`No organization found with ID or Name: ${input}`);
    }

    return hospitals[0];
}

program
    .name("seeds")
    .description("Seed Beds, BedTypes, BedGroups, and Floors for a specific organization")
    .option("--org <idOrName>", "Organization ID or Name")
    .action(async (options) => {
        await seed(options.org);
    });

program.parse(process.argv);
