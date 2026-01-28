
import { db } from "@/db";
import {
    chargeCategories, charges, chargeTypes, modules, taxCategories,  floors, bedGroups, bedsTypes, beds, shifts, appointmentPriorities, patients, vitals, symptomTypes, symptoms, operationCategories, operations, medicineSuppliers, services, medicineGroups, medicineUnits, medicineCompanies, medicineCategories, medicines, pharmacyMedicines, ipdAdmission,
    ipdPrescriptions,
    ipdConsultation,
    ipdOperations,
    ipdVitals,
    ipdCharges,
    ipdPayments,
    ipdMedications,
    transactions,
    prescriptions,
    appointments, pharmacyStock,
    pharmacyPurchase,
    pharmacyPurchaseItem,
    pharmacySales,
    pharmacySalesItems,

} from "@/drizzle/schema";
import { eq, inArray, or } from "drizzle-orm";

export async function deleteDemoData(hospitalId: string) {
    console.log(`🧹 Deleting demo data for hospital: ${hospitalId}`);

    await db.transaction(async (tx) => {


        await deleteIpdDemoData(hospitalId)
        await deleteAppointmentDemoData(hospitalId)

        // -------------before deleting dummy data
        await deletePharmacyDemoData(hospitalId)
        /* -------- PHARMACY -------- */
        await tx.delete(medicines).where(eq(medicines.hospitalId, hospitalId));
        await tx.delete(medicineCategories).where(eq(medicineCategories.hospitalId, hospitalId));
        await tx.delete(medicineCompanies).where(eq(medicineCompanies.hospitalId, hospitalId));
        await tx.delete(medicineUnits).where(eq(medicineUnits.hospitalId, hospitalId));
        await tx.delete(medicineGroups).where(eq(medicineGroups.hospitalId, hospitalId));
        await tx.delete(medicineSuppliers).where(eq(medicineSuppliers.hospitalId, hospitalId));

        /* -------- SERVICES -------- */
        await tx.delete(services).where(eq(services.hospitalId, hospitalId));

        /* -------- OPERATIONS -------- */
        await tx.delete(operations).where(eq(operations.hospitalId, hospitalId));
        await tx.delete(operationCategories).where(eq(operationCategories.hospitalId, hospitalId));

        /* -------- SYMPTOMS -------- */
        await tx.delete(symptoms).where(eq(symptoms.hospitalId, hospitalId));
        await tx.delete(symptomTypes).where(eq(symptomTypes.hospitalId, hospitalId));

        /* -------- VITALS -------- */
        await tx.delete(vitals).where(eq(vitals.hospitalId, hospitalId));

        /* -------- PATIENTS -------- */
        await tx.delete(patients).where(eq(patients.hospitalId, hospitalId));

        /* -------- APPOINTMENTS / SHIFTS -------- */
        await tx.delete(appointmentPriorities).where(eq(appointmentPriorities.hospitalId, hospitalId));
        await tx.delete(shifts).where(eq(shifts.hospitalId, hospitalId));

        /* -------- BILLING -------- */
        await tx.delete(charges).where(eq(charges.hospitalId, hospitalId));
        await tx.delete(chargeCategories).where(eq(chargeCategories.hospitalId, hospitalId));
        await tx.delete(chargeTypes).where(eq(chargeTypes.hospitalId, hospitalId));
        await tx.delete(taxCategories).where(eq(taxCategories.hospitalId, hospitalId));
        await tx.delete(modules).where(eq(modules.hospitalId, hospitalId));

        /* -------- BEDS -------- */
        await tx.delete(beds).where(eq(beds.hospitalId, hospitalId));
        await tx.delete(bedGroups).where(eq(bedGroups.hospitalId, hospitalId));
        await tx.delete(bedsTypes).where(eq(bedsTypes.hospitalId, hospitalId));
        await tx.delete(floors).where(eq(floors.hospitalId, hospitalId));

    });

    console.log("✅ Demo data deleted successfully");
    return true;
}

// ----------------------below all delete functions -----------------------------


async function deletePharmacyDemoData(hospitalId: string) {
    await db.transaction(async (tx) => {

        // 🧠 STEP 1: fetch medicine IDs
        const medicineRows = await tx
            .select({ id: pharmacyMedicines.id })
            .from(pharmacyMedicines)
            .where(eq(pharmacyMedicines.hospitalId, hospitalId));

        const medicineIds = medicineRows.map(m => m.id);
        if (!medicineIds.length) return;

        // 🧠 STEP 2: fetch sales IDs
        const salesRows = await tx
            .select({ id: pharmacySales.id })
            .from(pharmacySales)
            .where(eq(pharmacySales.hospitalId, hospitalId));

        const salesIds = salesRows.map(s => s.id);

        // 🧠 STEP 3: fetch purchase IDs
        const purchaseRows = await tx
            .select({ id: pharmacyPurchase.id })
            .from(pharmacyPurchase)
            .where(eq(pharmacyPurchase.hospitalId, hospitalId));

        const purchaseIds = purchaseRows.map(p => p.id);

        // 🔥 STEP 4: DELETE SALES ITEMS → SALES
        if (salesIds.length) {
            await tx.delete(pharmacySalesItems)
                .where(inArray(pharmacySalesItems.billId, salesIds));

            await tx.delete(pharmacySales)
                .where(inArray(pharmacySales.id, salesIds));
        }

        // 🔥 STEP 5: DELETE PURCHASE ITEMS → PURCHASE
        if (purchaseIds.length) {
            await tx.delete(pharmacyPurchaseItem)
                .where(inArray(pharmacyPurchaseItem.purchaseId, purchaseIds));

            await tx.delete(pharmacyPurchase)
                .where(inArray(pharmacyPurchase.id, purchaseIds));
        }

        // 🔥 STEP 6: DELETE STOCK
        await tx.delete(pharmacyStock)
            .where(inArray(pharmacyStock.medicineId, medicineIds));

        await tx.delete(pharmacyMedicines)
            .where(inArray(pharmacyMedicines.id, medicineIds));
    });
}

async function deleteAppointmentDemoData(hospitalId: string) {
    await db.transaction(async (tx) => {


        await tx.delete(transactions)
            .where(eq(transactions.hospitalId, hospitalId));

        await tx.delete(prescriptions)
            .where(eq(prescriptions.hospitalId, hospitalId));


        await tx.delete(appointments)
            .where(eq(appointments.hospitalId, hospitalId));

        console.log("delete appointments completed")
    });
}

async function deleteIpdDemoData(hospitalId: string) {
    await db.transaction(async (tx) => {
        // 1️⃣ IPD CHILD TABLES (order matters)

        await tx.delete(ipdPrescriptions)
            .where(eq(ipdPrescriptions.hospitalId, hospitalId));

        await tx.delete(ipdConsultation)
            .where(eq(ipdConsultation.hospitalId, hospitalId));

        await tx.delete(ipdOperations)
            .where(eq(ipdOperations.hospitalId, hospitalId));

        await tx.delete(ipdVitals)
            .where(eq(ipdVitals.hospitalId, hospitalId));

        await tx.delete(ipdCharges)
            .where(eq(ipdCharges.hospitalId, hospitalId));

        await tx.delete(ipdPayments)
            .where(eq(ipdPayments.hospitalId, hospitalId));

        await tx.delete(ipdMedications)
            .where(eq(ipdMedications.hospitalId, hospitalId));

        // 2️⃣ IPD ADMISSION (parent)

        await tx.delete(ipdAdmission)
            .where(eq(ipdAdmission.hospitalId, hospitalId));

    });
    console.log("Delete IPD completed")
}