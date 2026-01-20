import { db } from "@/db";
import { randomUUID } from "crypto";
import { eq, inArray, or } from "drizzle-orm";
import {
    chargeCategories, charges, chargeTypes, modules, taxCategories, units, organization, floors, bedGroups, bedsTypes, beds, shifts, appointmentPriorities, patients, vitals, symptomTypes, symptoms, operationCategories, operations, medicineSuppliers, services, medicineGroups, medicineUnits, medicineCompanies, medicineCategories, medicines, pharmacyMedicines, 

} from "@/drizzle/schema";


// ---------------main data function function -------------------------
export async function seedDemoData(orgId: string) {
    if (!orgId) throw new Error("Organization ID is required for demo seeding");

    try {
        console.log(`🏥 Seeding demo data for org: ${orgId}`);

        await seedFloorsBedTypesBedGroupsBeds(orgId);
        await seedTaxCategoryChargeTypeChargeCategoryCharges(orgId);
        await seedAppointmentAndShifts(orgId);
        await seedPatients(orgId);
        await seedVitals(orgId);
        await seedSymptomTypesSymptoms(orgId);
        await seedOperations(orgId);
        await seedMedicineSuppliers(orgId);
        await seedServices(orgId);
        await seedMedicines(orgId);

        console.log("✨ Demo data seeded successfully");
    } catch (err) {
        console.error("❌ Seeding demo data failed:", err);
        throw err; // Important: propagate error so API can catch it
    }
}

// ---------------individual seed data function ------------------
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

// ----------------------------pahrmacyMedicine, medicine Redord Seed Function --------------------------------
async function seedMedicines(hospitalId: string) {
    /* -------------------- GROUPS -------------------- */
    const groups = [
        { id: randomUUID(), name: "Antibiotics" },
        { id: randomUUID(), name: "Analgesics" },
        { id: randomUUID(), name: "Antipyretics" },
        { id: randomUUID(), name: "Antifungals" },
        { id: randomUUID(), name: "Antivirals" },
        { id: randomUUID(), name: "Anticonvulsants" },
        { id: randomUUID(), name: "Antidiabetics" },
        { id: randomUUID(), name: "Hormone" },
        { id: randomUUID(), name: "Antipsychotics" },
        { id: randomUUID(), name: "Antacids" },
        { id: randomUUID(), name: "Antihistamine" },
    ];

    await db.insert(medicineGroups).values(
        groups.map(g => ({
            id: g.id,
            hospitalId,
            name: g.name,
        }))
    );

    /* -------------------- UNITS -------------------- */
    const units = [
        { id: randomUUID(), name: "mm" },
        { id: randomUUID(), name: "mg" },
        { id: randomUUID(), name: "ml" },
        { id: randomUUID(), name: "IU" },
        { id: randomUUID(), name: "gtt" }
    ];

    await db.insert(medicineUnits).values(
        units.map(u => ({
            id: u.id,
            hospitalId,
            name: u.name,
        }))
    );

    /* -------------------- COMPANIES -------------------- */
    const companies = [
        { id: randomUUID(), name: "Sun Pharma" },
        { id: randomUUID(), name: "Cipla" },
        { id: randomUUID(), name: "Dr Reddy's" },
        { id: randomUUID(), name: "Glenmark" },
        { id: randomUUID(), name: "Abbott" },
        { id: randomUUID(), name: "Torrent" },
        { id: randomUUID(), name: "Intas" }
    ];

    await db.insert(medicineCompanies).values(
        companies.map(c => ({
            id: c.id,
            hospitalId,
            name: c.name,
        }))
    );

    /* -------------------- CATEGORIES -------------------- */
    const categories = [
        { id: randomUUID(), name: "Tablet" },
        { id: randomUUID(), name: "Capsule" },
        { id: randomUUID(), name: "Syrup" },
        { id: randomUUID(), name: "Drops" },
        { id: randomUUID(), name: "Injection" },
        { id: randomUUID(), name: "Ointment" },
        { id: randomUUID(), name: "Cream" }
    ];

    await db.insert(medicineCategories).values(
        categories.map(cat => ({
            id: cat.id,
            hospitalId,
            name: cat.name,
        }))
    );

    const medicineData = [
        {
            id: randomUUID(),
            hospitalId,
            name: "Paracetamol 500 mg",
            categoryId: categories[0].id,
            companyName: companies[0].id,
            groupId: groups[2].id,
            unitId: units[1].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Ibuprofen 400 mg",
            categoryId: categories[0].id,
            companyName: companies[1].id,
            groupId: groups[1].id,
            unitId: units[1].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Metformin 500 mg",
            categoryId: categories[0].id,
            companyName: companies[2].id,
            groupId: groups[6].id,
            unitId: units[1].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Pantoprazole 40 mg",
            categoryId: categories[0].id,
            companyName: companies[3].id,
            groupId: groups[9].id,
            unitId: units[1].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Levocetirizine 5 mg",
            categoryId: categories[0].id,
            companyName: companies[4].id,
            groupId: groups[10].id,
            unitId: units[1].id,
        },

        /* ---------------- CAPSULE (5) ---------------- */
        {
            id: randomUUID(),
            hospitalId,
            name: "Amoxicillin 250 mg",
            categoryId: categories[1].id,
            companyName: companies[0].id,
            groupId: groups[0].id,
            unitId: units[1].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Doxycycline 100 mg",
            categoryId: categories[1].id,
            companyName: companies[1].id,
            groupId: groups[0].id,
            unitId: units[1].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Fluconazole 150 mg",
            categoryId: categories[1].id,
            companyName: companies[2].id,
            groupId: groups[3].id,
            unitId: units[1].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Omeprazole 20 mg",
            categoryId: categories[1].id,
            companyName: companies[3].id,
            groupId: groups[9].id,
            unitId: units[1].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Vitamin E Capsule",
            categoryId: categories[1].id,
            companyName: companies[4].id,
            groupId: groups[7].id,
            unitId: units[3].id,
        },

        /* ---------------- SYRUP (3) ---------------- */
        {
            id: randomUUID(),
            hospitalId,
            name: "Cough Syrup",
            categoryId: categories[2].id,
            companyName: companies[5].id,
            groupId: groups[10].id,
            unitId: units[2].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Lactulose Syrup",
            categoryId: categories[2].id,
            companyName: companies[6].id,
            groupId: groups[9].id,
            unitId: units[2].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Iron Tonic",
            categoryId: categories[2].id,
            companyName: companies[1].id,
            groupId: groups[7].id,
            unitId: units[2].id,
        },

        /* ---------------- DROPS (2) ---------------- */
        {
            id: randomUUID(),
            hospitalId,
            name: "Vitamin D Drops",
            categoryId: categories[3].id,
            companyName: companies[2].id,
            groupId: groups[7].id,
            unitId: units[4].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Eye Lubricant Drops",
            categoryId: categories[3].id,
            companyName: companies[3].id,
            groupId: groups[10].id,
            unitId: units[4].id,
        },

        /* ---------------- INJECTION (2) ---------------- */
        {
            id: randomUUID(),
            hospitalId,
            name: "Insulin Injection",
            categoryId: categories[4].id,
            companyName: companies[4].id,
            groupId: groups[6].id,
            unitId: units[3].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Ceftriaxone Injection",
            categoryId: categories[4].id,
            companyName: companies[5].id,
            groupId: groups[0].id,
            unitId: units[1].id,
        },

        /* ---------------- OINTMENT (2) ---------------- */
        {
            id: randomUUID(),
            hospitalId,
            name: "Antifungal Ointment",
            categoryId: categories[5].id,
            companyName: companies[6].id,
            groupId: groups[3].id,
            unitId: units[1].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Pain Relief Ointment",
            categoryId: categories[5].id,
            companyName: companies[1].id,
            groupId: groups[1].id,
            unitId: units[1].id,
        },

        /* ---------------- CREAM (2) ---------------- */
        {
            id: randomUUID(),
            hospitalId,
            name: "Antiseptic Cream",
            categoryId: categories[6].id,
            companyName: companies[2].id,
            groupId: groups[10].id,
            unitId: units[1].id,
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Skin Allergy Cream",
            categoryId: categories[6].id,
            companyName: companies[3].id,
            groupId: groups[8].id,
            unitId: units[1].id,
        },
    ]
    /* -------------------- MEDICINES -------------------- */
    await db.insert(medicines).values(medicineData);

    const mapToPharmacyMedicines = (
        data: any,
        hospitalId: string
    ) =>
        data.map((m: any) => ({
            id: randomUUID(),
            hospitalId,
            name: m.name,
            categoryId: m.categoryId,
            companyId: m.companyName,
            groupId: m.groupId,
            unitId: m.unitId,
        }));

    await db.insert(pharmacyMedicines).values(mapToPharmacyMedicines(medicineData, hospitalId));

    console.log("✅ Medicine seed completed");
}

// ------------------------------ Services Seed Function ---------------------------------------
async function seedServices(hospitalId: string) {
    const serviceData = [
        {
            id: randomUUID(),
            hospitalId,
            name: "General Consultation",
            amount: "500",
            description: "Standard doctor consultation",
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Specialist Consultation",
            amount: "1000",
            description: "Consultation with a specialist doctor",
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Physiotherapy Session",
            amount: "700",
            description: "One session of physiotherapy",
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Laboratory Tests",
            amount: "1500",
            description: "Includes basic lab tests",
        },
        {
            id: randomUUID(),
            hospitalId,
            name: "Radiology",
            amount: "2000",
            description: "X-ray / Ultrasound / MRI services",
        },
    ];

    await db.insert(services).values(serviceData);
    console.log("✅ Services seeded successfully");
}

// ----------------------------suppliers Seed Function --------------------------------
async function seedMedicineSuppliers(hospitalId: string) {
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

// ----------------------------Operation Seed Function --------------------------------
async function seedOperations(hospitalId: string) {
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

// ----------------------------Symptoms Seed Function --------------------------------
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
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[0].id, name: "Fever", description: "Persistent rise in body temperature often caused by infection, inflammation, or immune response, sometimes associated with chills, sweating, weakness, and dehydration requiring medical evaluation." },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[0].id, name: "Fatigue", description: "A persistent feeling of tiredness or lack of energy that interferes with daily activities, commonly caused by illness, poor sleep, anemia, stress, or nutritional deficiencies." },
        {
            id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[3].id, name: "Vomiting",
            description: "Forceful expulsion of stomach contents through the mouth, often caused by infections, food poisoning, gastritis, or medication reactions, and may lead to dehydration."
        },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[1].id, name: "Cough", description: "A protective reflex that clears mucus, irritants, or foreign particles from the throat and airways, commonly associated with respiratory infections, allergies, asthma, or smoking." },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[1].id, name: "Shortness of Breath", description: "A sensation of difficulty or discomfort while breathing, which may occur during rest or activity, often associated with lung disease, heart conditions, anxiety, or low oxygen levels." },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[2].id, name: "Chest Pain", description: "Discomfort, tightness, pressure, or pain felt in the chest area, which may arise from heart, lung, muscle, or digestive problems and requires medical evaluation." },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[3].id, name: "Nausea", description: "An unpleasant sensation of wanting to vomit, commonly associated with stomach infections, food poisoning, motion sickness, pregnancy, or side effects of medications." },
        { id: randomUUID(), hospitalId, symptomTypeId: symptomTypeData[4].id, name: "Headache", description: "Pain or discomfort in the head or upper neck region, varying in intensity, commonly triggered by stress, dehydration, fever, eye strain, sinus problems, or migraine." },
    ];

    await db.insert(symptoms).values(symptomsData);
    console.log("✅ Symptoms seeded successfully");
}

// ----------------------------Vitals Seed Function --------------------------------
async function seedVitals(hospitalId: string) {
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
            name: "Weight",
            vitalsUnit: "KG",
            from: "2",
            to: "150"
        }
    ];

    await db.insert(vitals).values(vitalsData);
    console.log("✅ Vitals seeded successfully");
}

// ----------------------------Patients Seed Function --------------------------------
async function seedPatients(hospitalId: string) {
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

// ----------------------------Floor BedType BedGroup Beds Seed Function --------------------------------
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

// ----------------------------TaxCategory ChargeType Charge Category Charges Seed Function --------------------------------
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

// ----------------------------Appointment priority hospital Shifts Seed Function --------------------------------
async function seedAppointmentAndShifts(hospitalId: string) {
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
