"use server";

import { db } from "@/db/index";
import { medicineSuppliers } from "@/db/schema";
import { eq, and, desc, or, ilike } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getMedicineSuppliers(includeDeleted: boolean = false) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const conditions = [eq(medicineSuppliers.hospitalId, org.id)];

        if (!includeDeleted) {
            conditions.push(eq(medicineSuppliers.isDeleted, false));
        }

        const data = await db
            .select({
                id: medicineSuppliers.id,
                supplierName: medicineSuppliers.supplierName,
                contactNumber: medicineSuppliers.contactNumber,
                address: medicineSuppliers.address,
                contactPerson: medicineSuppliers.contactPerson,
                contactPersonNumber: medicineSuppliers.contactPersonNumber,
                drugLicenseNumber: medicineSuppliers.drugLicenseNumber,
                isDeleted: medicineSuppliers.isDeleted,
                createdAt: medicineSuppliers.createdAt,
            })
            .from(medicineSuppliers)
            .where(and(...conditions))
            .orderBy(desc(medicineSuppliers.createdAt));

        return { data };
    } catch (error) {
        console.error("Error fetching medicine suppliers:", error);
        return { error: "Failed to fetch medicine suppliers" };
    }
}

export async function createMedicineSupplier(formData: {
    supplierName: string;
    contactNumber: string;
    address: string;
    contactPerson: string;
    contactPersonNumber: string;
    drugLicenseNumber: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { supplierName, contactNumber, address, contactPerson, contactPersonNumber, drugLicenseNumber } = formData;

        // Validation
        if (!supplierName?.trim()) {
            return { error: "Supplier name is required" };
        }
        if (!contactNumber?.trim()) {
            return { error: "Contact number is required" };
        }
        if (!address?.trim()) {
            return { error: "Address is required" };
        }
        if (!contactPerson?.trim()) {
            return { error: "Contact person is required" };
        }
        if (!contactPersonNumber?.trim()) {
            return { error: "Contact person number is required" };
        }
        if (!drugLicenseNumber?.trim()) {
            return { error: "Drug license number is required" };
        }

        const [newSupplier] = await db
            .insert(medicineSuppliers)
            .values({
                hospitalId: org.id,
                supplierName: supplierName.trim(),
                contactNumber: contactNumber.trim(),
                address: address.trim(),
                contactPerson: contactPerson.trim(),
                contactPersonNumber: contactPersonNumber.trim(),
                drugLicenseNumber: drugLicenseNumber.trim(),
                isDeleted: false,
            })
            .returning();

        revalidatePath("/doctor/settings/medicineRecord/supplierManager");
        return { data: newSupplier };
    } catch (error) {
        console.error("Error creating medicine supplier:", error);
        return { error: "Failed to create medicine supplier" };
    }
}

export async function updateMedicineSupplier(id: string, formData: {
    supplierName: string;
    contactNumber: string;
    address: string;
    contactPerson: string;
    contactPersonNumber: string;
    drugLicenseNumber: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { supplierName, contactNumber, address, contactPerson, contactPersonNumber, drugLicenseNumber } = formData;

        // Validation
        if (!supplierName?.trim()) {
            return { error: "Supplier name is required" };
        }
        if (!contactNumber?.trim()) {
            return { error: "Contact number is required" };
        }
        if (!address?.trim()) {
            return { error: "Address is required" };
        }
        if (!contactPerson?.trim()) {
            return { error: "Contact person is required" };
        }
        if (!contactPersonNumber?.trim()) {
            return { error: "Contact person number is required" };
        }
        if (!drugLicenseNumber?.trim()) {
            return { error: "Drug license number is required" };
        }

        const [updatedSupplier] = await db
            .update(medicineSuppliers)
            .set({
                supplierName: supplierName.trim(),
                contactNumber: contactNumber.trim(),
                address: address.trim(),
                contactPerson: contactPerson.trim(),
                contactPersonNumber: contactPersonNumber.trim(),
                drugLicenseNumber: drugLicenseNumber.trim(),
                updatedAt: new Date(),
            })
            .where(and(eq(medicineSuppliers.id, id), eq(medicineSuppliers.hospitalId, org.id)))
            .returning();

        if (!updatedSupplier) {
            return { error: "Medicine supplier not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/supplierManager");
        return { data: updatedSupplier };
    } catch (error) {
        console.error("Error updating medicine supplier:", error);
        return { error: "Failed to update medicine supplier" };
    }
}

export async function deleteMedicineSupplier(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        // Soft delete - set isDeleted to true
        const [deletedSupplier] = await db
            .update(medicineSuppliers)
            .set({
                isDeleted: true,
                updatedAt: new Date(),
            })
            .where(and(eq(medicineSuppliers.id, id), eq(medicineSuppliers.hospitalId, org.id)))
            .returning();

        if (!deletedSupplier) {
            return { error: "Medicine supplier not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/supplierManager");
        return { data: deletedSupplier };
    } catch (error) {
        console.error("Error deleting medicine supplier:", error);
        return { error: "Failed to delete medicine supplier" };
    }
}

export async function restoreMedicineSupplier(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        // Restore - set isDeleted to false
        const [restoredSupplier] = await db
            .update(medicineSuppliers)
            .set({
                isDeleted: false,
                updatedAt: new Date(),
            })
            .where(and(eq(medicineSuppliers.id, id), eq(medicineSuppliers.hospitalId, org.id)))
            .returning();

        if (!restoredSupplier) {
            return { error: "Medicine supplier not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/supplierManager");
        return { data: restoredSupplier };
    } catch (error) {
        console.error("Error restoring medicine supplier:", error);
        return { error: "Failed to restore medicine supplier" };
    }
}
