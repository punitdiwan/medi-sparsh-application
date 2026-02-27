"use server";

import { db } from "@/db";
import { ipdPayments, ipdCharges, ipdAdmission } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type PaymentData = {
    date: string;
    amount: number;
    paymentMode: string;
    note?: string;
    toCredit?: boolean;
    referenceId?: string;
};

export async function getIPDPaymentSummary(ipdAdmissionId: string) {
    try {

        const charges = await db
            .select({
                totalAmount: ipdCharges.totalAmount,
                taxPercent: ipdCharges.taxPercent,
                discountPercent: ipdCharges.discountPercent,
            })
            .from(ipdCharges)
            .where(eq(ipdCharges.ipdAdmissionId, ipdAdmissionId));

        let totalCharges = 0;
        charges.forEach((charge) => {
            const amount = Number(charge.totalAmount);
            const tax = Number(charge.taxPercent);
            const discount = Number(charge.discountPercent);

            const taxAmount = (amount * tax) / 100;
            const discountAmount = (amount * discount) / 100;

            totalCharges += amount + taxAmount - discountAmount;
        });

        // ---------------- PAYMENTS ----------------
        const payments = await db
            .select({
                amount: ipdPayments.paymentAmount,
                toCredit: ipdPayments.toCredit,
                paymentMode: ipdPayments.paymentMode,
            })
            .from(ipdPayments)
            .where(
                and(
                    eq(ipdPayments.ipdAdmissionId, ipdAdmissionId),
                    eq(ipdPayments.isDeleted, false)
                )
            );

        let totalPaid = 0;
        let totalCreditAdded = 0;
        let usedCredit = 0;

        payments.forEach((payment) => {
            const amount = Number(payment.amount);
            if (payment.toCredit) {
                totalCreditAdded += amount;
                return;
            }

            if (payment.paymentMode === "Credit") {
                usedCredit += amount;
                totalPaid += amount;
                return;
            }

            totalPaid += amount;
        });

        const IpdCreditLimit = totalCreditAdded - usedCredit;

        const payable =
            totalCharges > totalPaid ? totalCharges - totalPaid : 0;

        return {
            success: true,
            data: {
                totalCharges,
                totalPaid,
                IpdCreditLimit,
                usedCredit,
                payable,
            },
        };
    } catch (error) {
        console.error("Error fetching IPD payment summary:", error);
        return { success: false, error: "Failed to fetch payment summary" };
    }
}

export async function createIPDPayment(data: PaymentData, ipdAdmissionId: string) {
    try {
        // Fetch admission to get hospitalId.
        const admissionResult = await db
            .select({
                hospitalId: ipdAdmission.hospitalId,
            })
            .from(ipdAdmission)
            .where(eq(ipdAdmission.id, ipdAdmissionId))
            .limit(1);

        const admission = admissionResult[0];

        if (!admission) {
            return { success: false, error: "Admission not found" };
        }

        let finalPaymentMode = data.paymentMode;
        if (data.paymentMode === "Credit Limit") {
            finalPaymentMode = "Credit";
        }

        await db.insert(ipdPayments).values({
            hospitalId: admission.hospitalId,
            ipdAdmissionId: ipdAdmissionId,
            paymentDate: new Date(data.date),
            paymentMode: finalPaymentMode,
            paymentAmount: data.amount.toString(),
            paymentNote: data.note,
            toCredit: data.toCredit || false,
            referenceId: data.referenceId,
        });

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/payments`);
        return { success: true };
    } catch (error) {
        console.error("Error creating IPD payment:", error);
        return { success: false, error: "Failed to create payment" };
    }
}

export async function getIPDPayments(ipdAdmissionId: string) {
    try {
        const payments = await db
            .select()
            .from(ipdPayments)
            .where(eq(ipdPayments.ipdAdmissionId, ipdAdmissionId))
            .orderBy(desc(ipdPayments.createdAt));

        return { success: true, data: payments };
    } catch (error) {
        console.error("Error fetching IPD payments:", error);
        return { success: false, error: "Failed to fetch payments" };
    }
}

export async function deleteIPDPayment(id: string, ipdAdmissionId: string) {
    try {
        await db.update(ipdPayments)
            .set({ isDeleted: true })
            .where(eq(ipdPayments.id, id));
        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/payments`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting IPD payment:", error);
        return { success: false, error: "Failed to delete payment" };
    }
}
