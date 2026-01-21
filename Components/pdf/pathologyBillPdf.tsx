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
});

const contentWrapper = {
    paddingHorizontal: 24,
    paddingVertical: 8,
};

interface Props {
    billNumber: string;
    billDate: string;
    customerName: string;
    customerPhone: string;
    paymentMode: string;
    items: Array<{ medicineName: string; quantity: number; price: number; total: number }>;
    totalAmount: number;
    discount: number;
    tax: number;
    netAmount?: number;
    organization: { name: string; metadata: any };
    orgModeCheck: boolean;
}

export const PathologyBillPdf: React.FC<Props> = (props) => {
    const { organization, orgModeCheck } = props;
    const parsedMetadata = organization.metadata;

    // Group items by name, sum quantities, and get max price
    const groupedItems = props.items.reduce(
        (
            acc: {
                medicineName: string;
                quantity: number;
                price: number;
            }[],
            item
        ) => {
            const existing = acc.find(
                (m) => m.medicineName === item.medicineName
            );

            if (existing) {
                existing.quantity += Number(item.quantity);
                existing.price = Math.max(
                    existing.price,
                    Number(item.price)
                );
            } else {
                acc.push({
                    medicineName: item.medicineName,
                    quantity: Number(item.quantity),
                    price: Number(item.price),
                });
            }

            return acc;
        },
        []
    );


    const netAmount = props.netAmount || (props.totalAmount - props.discount + props.tax);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* HEADER */}
                <PdfHeader
                    orgModeCheck={orgModeCheck}
                    organizationName={organization.name}
                    address={parsedMetadata?.address}
                    phone={parsedMetadata?.phone}
                    email={parsedMetadata?.email}
                    logo={parsedMetadata?.logo}
                    doctorName=""
                    doctorSpecialization=""
                />

                {/* CONTENT BELOW HEADER */}
                <View style={contentWrapper}>
                    <View style={styles.section}>
                        <Text>Bill No: {props.billNumber}</Text>
                        <Text>Date: {props.billDate}</Text>
                        <Text>Customer: {props.customerName}</Text>
                        <Text>Phone: {props.customerPhone}</Text>
                        <Text>Payment Mode: {props.paymentMode}</Text>
                    </View>

                    {/* Medicine Table - Only Name, Quantity, Price */}
                    <View style={styles.section}>
                        <View style={styles.tableHeader}>
                            <Text style={{ width: "40%", paddingLeft: 4 }}>Medicine Name</Text>
                            <Text style={{ width: "20%", textAlign: "center" }}>Quantity</Text>
                            <Text style={{ width: "20%", textAlign: "right", paddingRight: 4 }}>Price</Text>
                            <Text style={{ width: "20%", textAlign: "right", paddingRight: 4 }}>Total</Text>
                        </View>

                        {groupedItems.map((item, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={{ width: "40%", paddingLeft: 4 }}>{item.medicineName}</Text>
                                <Text style={{ width: "20%", textAlign: "center" }}>{item.quantity}</Text>
                                <Text style={{ width: "20%", textAlign: "right", paddingRight: 4 }}>{item.price.toFixed(2)}</Text>
                                <Text style={{ width: "20%", textAlign: "right", paddingRight: 4 }}>{(item.quantity * item.price).toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Total Section */}
                    <View style={styles.totalSection}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                            <Text>Total Amount:</Text>
                            <Text>{props.totalAmount.toFixed(2)}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                            <Text>Discount:</Text>
                            <Text>{props.discount.toFixed(2)}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                            <Text>Tax:</Text>
                            <Text>{props.tax.toFixed(2)}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#000", fontWeight: "bold" }}>
                            <Text style={{ fontWeight: "bold" }}>Net Amount:</Text>
                            <Text style={{ fontWeight: "bold" }}>{netAmount.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.footer, styles.footerFixed]}>
                    <Text>Thank you for your business!</Text>
                </View>
            </Page>
        </Document>
    );
};
