import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../doctor/PdfHeader";


const styles = StyleSheet.create({
    page: { fontSize: 10, backgroundColor: "#fff", fontFamily: "Helvetica" },
    section: { marginBottom: 10 },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        paddingBottom: 4,
        marginBottom: 4,
        fontWeight: "bold",
        backgroundColor: "#f0f0f0",
    },
    tableRow: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#ddd" },
    footer: {
        marginTop: 30,
        fontSize: 10,
        textAlign: "center",
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        padding: 8,
        color: "#777",
    },
    footerFixed: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    totalSection: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#000",
    },
    paymentSection: {
        marginTop: 16,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#000",
    },
    paymentStatus: {
        marginTop: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: "#2ecc71",
        backgroundColor: "#f0fdf4",
    },
    paymentStatusPending: {
        marginTop: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: "#f39c12",
        backgroundColor: "#fffbf0",
    },
});

const contentWrapper = {
    paddingHorizontal: 24,
    paddingVertical: 8,
};

interface Props {
    billNumber: string;
    billDate: string;
    customerName: string | null;
    customerPhone: string | null;
    paymentMode: string;
    items: Array<{ testName: string; price: number; tax: number; total: number }>;
    discount: number;
    netAmount?: number;
    organization: { name: string; metadata?: any };
    orgModeCheck: boolean;
    payments?: Array<{ date: string; amount: number; mode: string }> | null;
    totalPaid?: number;
    balanceAmount?: number;
    doctorName?: string;
}

export const RadiologyBillPdf: React.FC<Props> = (props) => {
    const { organization, orgModeCheck } = props;
    const metadata = typeof organization.metadata === 'string'
        ? JSON.parse(organization.metadata)
        : organization.metadata;

    const totalAmount = props.items.reduce((sum, item) => sum + Number(item.price), 0);
    const grandTotal = props.items.reduce((sum, item) => sum + Number(item.total), 0);
    const taxAmount = grandTotal - totalAmount;
    const netAmount = totalAmount - props.discount + taxAmount;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <PdfHeader
                    orgModeCheck={orgModeCheck}
                    organizationName={organization.name}
                    address={metadata?.address}
                    phone={metadata?.phone}
                    email={metadata?.email}
                    logo={metadata?.logo}
                    doctorName={props.doctorName || ""}
                    doctorSpecialization=""
                />

                <View style={contentWrapper}>
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Bill To:</Text>
                                <Text style={{ fontSize: 14, marginTop: 4 }}>{props.customerName}</Text>
                                <Text style={{ marginTop: 2 }}>Phone: {props.customerPhone}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Bill Details:</Text>
                                <Text style={{ marginTop: 4 }}>Bill No: {props.billNumber}</Text>
                                <Text style={{ marginTop: 2 }}>Date: {props.billDate}</Text>
                                <Text style={{ marginTop: 2 }}>Doctor: Dr. {props.doctorName || "N/A"}</Text>
                                <Text style={{ marginTop: 2 }}>Payment: {props.paymentMode}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.tableHeader}>
                            <Text style={{ width: "40%", paddingLeft: 4 }}>Test Name</Text>
                            <Text style={{ width: "20%", textAlign: "right", paddingRight: 4 }}>Price</Text>
                            <Text style={{ width: "20%", textAlign: "right", paddingRight: 4 }}>Tax(%)</Text>
                            <Text style={{ width: "20%", textAlign: "right", paddingRight: 4 }}>Total</Text>
                        </View>

                        {props.items.map((item, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={{ width: "40%", paddingLeft: 4 }}>{item.testName}</Text>
                                <Text style={{ width: "20%", textAlign: "right", paddingRight: 4 }}>{item.price.toFixed(2)}</Text>
                                <Text style={{ width: "20%", textAlign: "right", paddingRight: 4 }}>{item.tax}%</Text>
                                <Text style={{ width: "20%", textAlign: "right", paddingRight: 4 }}>{item.total.toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.totalSection}>
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 }}>
                            <View style={{ width: "40%" }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                                    <Text>Total Amount:</Text>
                                    <Text>{totalAmount.toFixed(2)}</Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                                    <Text>Discount:</Text>
                                    <Text>{props.discount.toFixed(2)}</Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                                    <Text>Tax:</Text>
                                    <Text>{taxAmount.toFixed(2)}</Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: "#000" }}>
                                    <Text style={{ fontWeight: "bold" }}>Net Amount:</Text>
                                    <Text style={{ fontWeight: "bold" }}>{netAmount.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {props.payments && props.payments.length > 0 && (
                        <View style={styles.paymentSection || { marginTop: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#000" }}>
                            <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 8 }}>Payment Details:</Text>
                            <View style={styles.tableHeader}>
                                <Text style={{ width: "30%", paddingLeft: 4 }}>Date</Text>
                                <Text style={{ width: "35%", paddingLeft: 4 }}>Mode</Text>
                                <Text style={{ width: "35%", textAlign: "right", paddingRight: 4 }}>Amount</Text>
                            </View>
                            {props.payments.map((payment, idx) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={{ width: "30%", paddingLeft: 4 }}>{payment.date}</Text>
                                    <Text style={{ width: "35%", paddingLeft: 4 }}>{payment.mode}</Text>
                                    <Text style={{ width: "35%", textAlign: "right", paddingRight: 4 }}>{payment.amount.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {props.totalPaid !== undefined && (
                        <View style={(props.balanceAmount && props.balanceAmount > 0 ? styles.paymentStatusPending : styles.paymentStatus) || { marginTop: 12, padding: 8, borderWidth: 1, borderColor: "#2ecc71", backgroundColor: "#f0fdf4" }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                <Text style={{ fontWeight: "bold" }}>Total Paid:</Text>
                                <Text style={{ fontWeight: "bold" }}>{(props.totalPaid || 0).toFixed(2)}</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ fontWeight: "bold" }}>Balance:</Text>
                                <Text style={{ fontWeight: "bold" }}>{(props.balanceAmount || 0).toFixed(2)}</Text>
                            </View>
                            <Text style={{ marginTop: 6, fontSize: 9, fontWeight: "bold" }}>
                                Status: {props.balanceAmount && props.balanceAmount > 0 ? "PENDING" : "FULLY PAID"}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={[styles.footer, styles.footerFixed]}>
                    <Text>This is a computer generated bill.</Text>
                    <Text>Thank you for choosing {organization.name}!</Text>
                </View>
            </Page>
        </Document>
    );
};
