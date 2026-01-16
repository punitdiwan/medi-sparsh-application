"use client";

import { useEffect, useState, use, useMemo } from "react";
import { getPharmacyBillDetails } from "@/lib/actions/pharmacySales";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function PrintBillPage({ params }: { params: Promise<{ billId: string }> }) {
    const { billId } = use(params);
    const [billData, setBillData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const groupedItems = useMemo(() => {
        const items = billData?.items;
        if (!items) return [];
        const groups: { [key: string]: any } = {};
        items.forEach((item: any) => {
            if (!groups[item.medicineName]) {
                groups[item.medicineName] = {
                    ...item,
                    quantity: Number(item.quantity),
                    totalAmount: Number(item.totalAmount),
                };
            } else {
                groups[item.medicineName].quantity += Number(item.quantity);
                groups[item.medicineName].totalAmount += Number(item.totalAmount);
            }
        });
        return Object.values(groups);
    }, [billData?.items]);

    useEffect(() => {
        const fetchBill = async () => {
            const res = await getPharmacyBillDetails(billId);
            if (res.error) {
                setError(res.error);
            } else {
                setBillData(res.data);
            }
            setLoading(false);
        };
        fetchBill();
    }, [billId]);

    useEffect(() => {
        if (!loading && billData) {
            window.print();
        }
    }, [loading, billData]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    if (!billData) return null;

    const { bill } = billData;


    return (
        <div className="p-8 max-w-4xl mx-auto font-sans">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Pharmacy Bill</h1>
                {/* Add Hospital Name/Logo here if available */}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p><strong>Bill No:</strong> {bill.billNumber}</p>
                    <p><strong>Date:</strong> {format(new Date(bill.createdAt), "dd/MM/yyyy")}</p>
                    <p><strong>Payment Mode:</strong> {bill.paymentMode}</p>
                </div>
                <div className="text-right">
                    <p><strong>Customer Name:</strong> {bill.customerName}</p>
                    <p><strong>Phone:</strong> {bill.customerPhone}</p>
                </div>
            </div>

            <table className="w-full border-collapse border border-gray-300 mb-6">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Medicine Name</th>
                        <th className="border border-gray-300 p-2 text-right">Price</th>
                        <th className="border border-gray-300 p-2 text-right">Qty</th>
                        <th className="border border-gray-300 p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {groupedItems.map((item: any, index: number) => (
                        <tr key={index}>
                            <td className="border border-gray-300 p-2">{item.medicineName}</td>
                            <td className="border border-gray-300 p-2 text-right">{item.unitPrice}</td>
                            <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
                            <td className="border border-gray-300 p-2 text-right">{item.totalAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between mb-2">
                        <span>Total Amount:</span>
                        <span>{bill.totalAmount}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>Discount:</span>
                        <span>{bill.discount}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>Tax:</span>
                        <span>{bill.taxAmount}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                        <span>Net Amount:</span>
                        <span>{bill.netAmount}</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-sm text-gray-500">
                <p>Thank you for your business!</p>
            </div>
        </div>
    );
}
