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
    customerName: string | null;
    customerPhone: string | null;
    paymentMode: string;
    items: Array<{ testName: string; price: number; tax: number; total: number }>;
    totalAmount: number;
    discount: number;
    tax: number;
    netAmount?: number;
    organization: { name: string; metadata?: any };
    orgModeCheck: boolean;
}

export const PathologyBillPdf: React.FC<Props> = (props) => {
    const { organization, orgModeCheck } = props;
    const metadata = typeof organization.metadata === 'string'
        ? JSON.parse(organization.metadata)
        : organization.metadata;

    // Group items by name (though usually tests are unique)
    const groupedItems = props.items.reduce(
        (
            acc: {
                testName: string;
                price: number;
                tax: number;
                total: number;
            }[],
            item
        ) => {
            const existing = acc.find(
                (m) => m.testName === item.testName
            );

            if (existing) {
                // In pathology, we might not have 'quantity' in the same way as pharmacy,
                // but if we do, we could add it. For now, let's assume unique tests.
                existing.total += Number(item.total);
            } else {
                acc.push({
                    testName: item.testName,
                    price: Number(item.price),
                    tax: Number(item.tax),
                    total: Number(item.total),
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
                    address={metadata?.address}
                    phone={metadata?.phone}
                    email={metadata?.email}
                    logo={metadata?.logo}
                    doctorName=""
                    doctorSpecialization=""
                />

                {/* CONTENT BELOW HEADER */}
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
                                <Text style={{ marginTop: 2 }}>Payment: {props.paymentMode}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Test Table */}
                    <View style={styles.section}>
                        <View style={styles.tableHeader}>
                            <Text style={{ width: "50%", paddingLeft: 4 }}>Test Name</Text>
                            <Text style={{ width: "25%", textAlign: "right", paddingRight: 4 }}>Price</Text>
                            <Text style={{ width: "25%", textAlign: "right", paddingRight: 4 }}>Total</Text>
                        </View>

                        {groupedItems.map((item, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={{ width: "50%", paddingLeft: 4 }}>{item.testName}</Text>
                                <Text style={{ width: "25%", textAlign: "right", paddingRight: 4 }}>{item.price.toFixed(2)}</Text>
                                <Text style={{ width: "25%", textAlign: "right", paddingRight: 4 }}>{item.total.toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Total Section */}
                    <View style={styles.totalSection}>
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 }}>
                            <View style={{ width: "40%" }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                                    <Text>Total Amount:</Text>
                                    <Text>₹{props.totalAmount.toFixed(2)}</Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                                    <Text>Discount:</Text>
                                    <Text>₹{props.discount.toFixed(2)}</Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                                    <Text>Tax:</Text>
                                    <Text>₹{props.tax.toFixed(2)}</Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: "#000" }}>
                                    <Text style={{ fontWeight: "bold" }}>Net Amount:</Text>
                                    <Text style={{ fontWeight: "bold" }}>₹{netAmount.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.footer, styles.footerFixed]}>
                    <Text>This is a computer generated bill.</Text>
                    <Text>Thank you for choosing {organization.name}!</Text>
                </View>
            </Page>
        </Document>
    );
};
