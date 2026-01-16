#!/usr/bin/env tsx

import { db } from "../db/index";
import { randomUUID } from "crypto";
import { Command } from "commander";
import * as readline from "readline";
import { eq, or } from "drizzle-orm";
import { chargeCategories, charges, chargeTypes, modules, taxCategories, units, organization, floors, bedGroups, bedsTypes, beds, shifts, appointmentPriorities, patients, vitals, symptomTypes, symptoms, operationCategories, operations, medicineSuppliers, services } from "@/drizzle/schema";

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
        const input =
            orgIdOrName ??
            (await question("Enter Organization ID or Name: "));

        if (!input?.trim()) {
            throw new Error("Organization ID or Name is required");
        }


        const hospital = await getHospitalByIdOrName(input);

        console.log(`🏥 Using Hospital: ${hospital.name}`);

        // await seedFloorsBedTypesBedGroupsBeds(hospital.id);

        // await seedTaxCategoryChargeTypeChargeCategoryCharges(hospital.id)

        // await seedAppointmentAndShifts(hospital.id)

        // await seedPatients(hospital.id)

        // await seedVitals(hospital.id)

        // await seedSymptomTypesSymptoms(hospital.id)

        // await seedOperations(hospital.id)

        // await seedMedicineSuppliers(hospital.id)
        
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

// export async function seedServices(hospitalId: string) {
//     const serviceData = [
//         {
//             id: randomUUID(),
//             hospitalId,
//             name: "General Consultation",
//             amount: 500,
//             description: "Standard doctor consultation",
//         },
//         {
//             id: randomUUID(),
//             hospitalId,
//             name: "Specialist Consultation",
//             amount: 1000,
//             description: "Consultation with a specialist doctor",
//         },
//         {
//             id: randomUUID(),
//             hospitalId,
//             name: "Physiotherapy Session",
//             amount: 700,
//             description: "One session of physiotherapy",
//         },
//         {
//             id: randomUUID(),
//             hospitalId,
//             name: "Laboratory Tests",
//             amount: 1500,
//             description: "Includes basic lab tests",
//         },
//         {
//             id: randomUUID(),
//             hospitalId,
//             name: "Radiology",
//             amount: 2000,
//             description: "X-ray / Ultrasound / MRI services",
//         },
//     ];

//     await db.insert(services).values(serviceData);
//     console.log("✅ Services seeded successfully");
// }

export async function seedMedicineSuppliers(hospitalId: string) {
    const supplierData = [
        {
            id: randomUUID(),
            hospitalId,
            supplierName: "HealthMed Pvt Ltd",
            contactNumber: "9876543210",
            address: "123, Main Street, City",
            contactPerson: "Ramesh Kumar",
            contactPersonNumber: "9876501234",
            drugLicenseNumber: "DL-12345",
        },
        {
            id: randomUUID(),
            hospitalId,
            supplierName: "PharmaCare Solutions",
            contactNumber: "9123456780",
            address: "45, Industrial Area, City",
            contactPerson: "Sita Sharma",
            contactPersonNumber: "9123409876",
            drugLicenseNumber: "DL-67890",
        },
        {
            id: randomUUID(),
            hospitalId,
            supplierName: "MediSupply Co",
            contactNumber: "9988776655",
            address: "89, Health Avenue, City",
            contactPerson: "Amit Verma",
            contactPersonNumber: "9988701234",
            drugLicenseNumber: "DL-11223",
        },
        {
            id: randomUUID(),
            hospitalId,
            supplierName: "CarePlus Pharmaceuticals",
            contactNumber: "9871234560",
            address: "22, Pharma Road, City",
            contactPerson: "Sunita Singh",
            contactPersonNumber: "9871209876",
            drugLicenseNumber: "DL-44556",
        },
        {
            id: randomUUID(),
            hospitalId,
            supplierName: "Wellness Drugs Ltd",
            contactNumber: "9765432109",
            address: "77, Medical Lane, City",
            contactPerson: "Rajesh Gupta",
            contactPersonNumber: "9765409876",
            drugLicenseNumber: "DL-77889",
        },
    ];

    await db.insert(medicineSuppliers).values(supplierData);
    console.log("✅ Medicine Suppliers seeded successfully");
}

export async function seedOperations(hospitalId: string) {
    // 1️⃣ Operation Categories
    const operationCategoryData = [
        { id: randomUUID(), hospitalId, name: "General Surgery" },
        { id: randomUUID(), hospitalId, name: "Orthopedic" },
        { id: randomUUID(), hospitalId, name: "Neurological" },
        { id: randomUUID(), hospitalId, name: "Plastic & Reconstructive" },
        { id: randomUUID(), hospitalId, name: "ENT" },
    ];

    await db.insert(operationCategories).values(operationCategoryData);
    console.log("✅ Operation Categories seeded successfully");

    // 2️⃣ Operations
    const operationsData = [
        // General Surgery
        { id: randomUUID(), hospitalId, operationCategoryId: operationCategoryData[0].id, name: "Appendectomy" },
        { id: randomUUID(), hospitalId, operationCategoryId: operationCategoryData[0].id, name: "Hernia Repair" },

        // Orthopedic
        { id: randomUUID(), hospitalId, operationCategoryId: operationCategoryData[1].id, name: "Knee Replacement" },
        { id: randomUUID(), hospitalId, operationCategoryId: operationCategoryData[1].id, name: "Hip Replacement" },

        // Neurological
        { id: randomUUID(), hospitalId, operationCategoryId: operationCategoryData[2].id, name: "Brain Tumor Removal" },
        { id: randomUUID(), hospitalId, operationCategoryId: operationCategoryData[2].id, name: "Spinal Surgery" },

        // Plastic & Reconstructive
        { id: randomUUID(), hospitalId, operationCategoryId: operationCategoryData[3].id, name: "Rhinoplasty" },
        { id: randomUUID(), hospitalId, operationCategoryId: operationCategoryData[3].id, name: "Breast Reconstruction" },

        // ENT
        { id: randomUUID(), hospitalId, operationCategoryId: operationCategoryData[4].id, name: "Tonsillectomy" },
        { id: randomUUID(), hospitalId, operationCategoryId: operationCategoryData[4].id, name: "Myringotomy" },
    ];

    await db.insert(operations).values(operationsData);
    console.log("✅ Operations seeded successfully");
}


async function seedSymptomTypesSymptoms(hospitalId: string) {
    const symptomTypeData = [
        { id: randomUUID(), hospitalId, name: "General" },
        { id: randomUUID(), hospitalId, name: "Respiratory" },
        { id: randomUUID(), hospitalId, name: "Cardiac" },
        { id: randomUUID(), hospitalId, name: "Gastrointestinal" },
        { id: randomUUID(), hospitalId, name: "Neurological" },
    ];

    await db.insert(symptomTypes).values(symptomTypeData);
    console.log("✅ Symptom Types seeded successfully");

    const symptomsData = [
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[0].id, name: "Fever", description: "Elevated body temperature" },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[0].id, name: "Fatigue", description: "Feeling of tiredness or weakness" },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[1].id, name: "Cough", description: "Persistent coughing" },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[1].id, name: "Shortness of Breath", description: "Difficulty breathing" },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[2].id, name: "Chest Pain", description: "Pain in the chest region" },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[3].id, name: "Nausea", description: "Feeling of sickness in stomach" },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[4].id, name: "Headache", description: "Pain in head" },
    ];

    await db.insert(symptoms).values(symptomsData);
    console.log("✅ Symptoms seeded successfully");
}
 
export async function seedVitals(hospitalId: string) {
    const vitalsData = [
        {
            hospitalId,
            name: "Blood Pressure",
            vitalsUnit: "mmHg",
            from: "90/60",
            to: "120/80",
        },
        {
            hospitalId,
            name: "Heart Rate",
            vitalsUnit: "bpm",
            from: "60",
            to: "100",
        },
        {
            hospitalId,
            name: "Respiratory Rate",
            vitalsUnit: "bpm",
            from: "12",
            to: "20",
        },
        {
            hospitalId,
            name: "Temperature",
            vitalsUnit: "°F",
            from: "95.5",
            to: "106.7",
        },
        {
            hospitalId,
            name: "Oxygen Saturation",
            vitalsUnit: "%",
            from: "75",
            to: "100",
        },
        {
            hospitalId,
            name:"Weight",
            vitalsUnit:"KG",
            from:"2",
            to:"150"
        }
    ];

    await db.insert(vitals).values(vitalsData);
    console.log("✅ Vitals seeded successfully");
}

export async function seedPatients(hospitalId: string) {
    const patientData = [
        {
            hospitalId,
            name: "Rahul Sharma",
            gender: "male",
            dob: "1990-03-15",
            mobileNumber: "9876543210",
            email: "rahul.sharma@example.com",
            address: "12 MG Road",
            city: "Indore",
            state: "MP",
            areaOrPin: "452001",
            bloodGroup: "O+",
            isAdmitted: false,
        },
        {
            hospitalId,
            name: "Anita Verma",
            gender: "female",
            dob: "1992-07-22",
            mobileNumber: "9123456789",
            email: "anita.verma@example.com",
            address: "45 AB Colony",
            city: "Bhopal",
            state: "MP",
            areaOrPin: "462001",
            bloodGroup: "A+",
            isAdmitted: false,
        },
        {
            hospitalId,
            name: "Suresh Patel",
            gender: "male",
            dob: "1985-11-10",
            mobileNumber: "9988776655",
            email: "suresh.patel@example.com",
            address: "78 JK Nagar",
            city: "Gwalior",
            state: "MP",
            areaOrPin: "474001",
            bloodGroup: "B+",
            isAdmitted: false,
        },
        {
            hospitalId,
            name: "Priya Singh",
            gender: "male",
            dob: "1998-01-30",
            mobileNumber: "9012345678",
            email: "priya.singh@example.com",
            address: "33 LM Street",
            city: "Indore",
            state: "MP",
            areaOrPin: "452002",
            bloodGroup: "AB+",
            isAdmitted: false,
        },
        {
            hospitalId,
            name: "Amit Khanna",
            gender: "male",
            dob: "1995-09-18",
            mobileNumber: "9234567890",
            email: "amit.khanna@example.com",
            address: "56 OP Avenue",
            city: "Bhopal",
            state: "MP",
            areaOrPin: "462002",
            bloodGroup: "O-",
            isAdmitted: false,
        },
    ];

    await db.insert(patients).values(patientData);
    console.log("✅ 5 Patients seeded successfully");
}


async function seedFloorsBedTypesBedGroupsBeds(hospitalId: string) {
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

}

async function seedTaxCategoryChargeTypeChargeCategoryCharges(hospitalId: string) {

    await db.transaction(async (tx) => {

        /* ---------------- MODULES ---------------- */
        const moduleData = [
            { id: randomUUID(), name: "OPD", hospitalId },
            { id: randomUUID(), name: "IPD", hospitalId },
            { id: randomUUID(), name: "Other", hospitalId },
            { id: randomUUID(), name: "Pharmacy", hospitalId },
        ];

        await tx.insert(modules).values(moduleData);

        /* ---------------- UNITS ---------------- */
        const unitData = await tx
            .select({
                id: units.id,
                name: units.name,
            })
            .from(units);

        if (!unitData.length) {
            throw new Error("Units master table is empty");
        }

        const unitMap = Object.fromEntries(
            unitData.map((u) => [u.name.toLowerCase(), u.id])
        );


        /* ---------------- TAX CATEGORIES ---------------- */
        const taxData = [
            { id: randomUUID(), name: "OPD Tax", percent: "15", hospitalId },
            { id: randomUUID(), name: "IPD Tax", percent: "20", hospitalId },
            { id: randomUUID(), name: "Other Tax", percent: "20", hospitalId },
        ];

        await tx.insert(taxCategories).values(taxData);

        /* ---------------- CHARGE TYPES ---------------- */
        const chargeTypeData = [
            {
                id: randomUUID(),
                name: "Consultation",
                hospitalId,
                modules: [moduleData[0].id], // OPD
            },
            {
                id: randomUUID(),
                name: "IPD",
                hospitalId,
                modules: [moduleData[1].id], // IPD
            },
            {
                id: randomUUID(),
                name: "Investigation",
                hospitalId,
                modules: [moduleData[2].id], // Diagnostics
            },
        ];

        await tx.insert(chargeTypes).values(chargeTypeData);

        /* ---------------- CHARGE CATEGORIES ---------------- */
        const categoryData = [
            {
                id: randomUUID(),
                hospitalId,
                name: "Doctor Consultation",
                chargeTypeId: chargeTypeData[0].id,
                description: "OPD consultation charges",
            },
            {
                id: randomUUID(),
                hospitalId,
                name: "Room Charges",
                chargeTypeId: chargeTypeData[1].id,
                description: "IPD room charges",
            },
            {
                id: randomUUID(),
                hospitalId,
                name: "Lab Tests",
                chargeTypeId: chargeTypeData[2].id,
                description: "Diagnostic charges",
            },
        ];

        await tx.insert(chargeCategories).values(categoryData);

        /* ---------------- CHARGES ---------------- */
        const chargesData = [
            {
                id: randomUUID(),
                hospitalId,
                name: "General OPD Consultation",
                description: "Basic OPD consultation",
                chargeCategoryId: categoryData[0].id,
                chargeTypeId: chargeTypeData[0].id,
                unitId: unitMap["per hour"],   // EXISTING UNIT
                taxCategoryId: taxData[0].id,
                amount: "300",
            },
            {
                id: randomUUID(),
                hospitalId,
                name: "Deluxe Room Charges",
                description: "Per day room charge",
                chargeCategoryId: categoryData[1].id,
                chargeTypeId: chargeTypeData[1].id,
                unitId: unitMap["per day"],     // EXISTING UNIT
                taxCategoryId: taxData[1].id,
                amount: "2500",
            },
            //   {
            //     id: randomUUID(),
            //     hospitalId,
            //     name: "Blood Test",
            //     description: "Routine blood investigation",
            //     chargeCategoryId: categoryData[2].id,
            //     chargeTypeId: chargeTypeData[2].id,
            //     unitId: unitMap["per test"],    // EXISTING UNIT
            //     taxCategoryId: taxData[2].id,
            //     amount: "500",
            //   },
        ];

        await tx.insert(charges).values(chargesData);
    });

    console.log("✅ Billing & Charges seeded successfully");

}

export async function seedAppointmentAndShifts(hospitalId: string) {
  // 1️⃣ Appointment Priorities
  console.log("📌 Seeding Appointment Priorities...");

  const priorityData = [
    { id: randomUUID(), hospitalId, priority: "Low" },
    { id: randomUUID(), hospitalId, priority: "Normal" },
    { id: randomUUID(), hospitalId, priority: "High" },
    { id: randomUUID(), hospitalId, priority: "Emergency" },
  ];

  await db.insert(appointmentPriorities).values(priorityData);
  console.log("✅ Appointment priorities seeded.");

  // 2️⃣ Shifts
  console.log("⏰ Seeding Shifts...");

  const shiftData = [
    {
      id: randomUUID(),
      hospitalId,
      name: "Morning",
      startTime: "08:00",
      endTime: "14:00",
    },
    {
      id: randomUUID(),
      hospitalId,
      name: "Evening",
      startTime: "14:00",
      endTime: "20:00",
    },
    {
      id: randomUUID(),
      hospitalId,
      name: "Night",
      startTime: "20:00",
      endTime: "08:00",
    },
  ];

  await db.insert(shifts).values(shiftData);
  console.log("✅ Shifts seeded.");
}
program
    .name("seeds")
    .description("Seed Beds, BedTypes, BedGroups, and Floors for a specific organization")
    .option("--org <idOrName>", "Organization ID or Name")
    .action(async (options) => {
        await seed(options.org);
    });

program.parse(process.argv);
