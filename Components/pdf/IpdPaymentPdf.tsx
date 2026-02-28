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
    summarySection: {
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
    title: string;
    patientName: string;
    ipdNo: string;
    phone: string;
    payments: Array<{
        id: string;
        date: string;
        paymentMode: string;
        note?: string;
        amount: number;
    }>;
    organization: { name: string; metadata?: any };
    orgModeCheck: boolean;
}

export const IpdPaymentPdf: React.FC<Props> = ({
    title,
    patientName,
    ipdNo,
    phone,
    payments,
    organization,
    orgModeCheck
}) => {
    const metadata = typeof organization.metadata === 'string'
        ? JSON.parse(organization.metadata)
        : organization.metadata;

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

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
                    doctorName="" // Optional
                    doctorSpecialization=""
                />

                <View style={contentWrapper}>
                    <View style={styles.section}>
                        <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
                            {title}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Patient Details:</Text>
                                <Text style={{ fontSize: 14, marginTop: 4 }}>{patientName}</Text>
                                <Text style={{ marginTop: 2 }}>Phone: {phone}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>IPD Details:</Text>
                                <Text style={{ marginTop: 4 }}>IPD No: {ipdNo}</Text>
                                <Text style={{ marginTop: 2 }}>Print Date: {new Date().toLocaleDateString()}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.tableHeader}>
                            <Text style={{ width: "20%", paddingLeft: 4 }}>Date</Text>
                            <Text style={{ width: "15%", paddingLeft: 4 }}>ID</Text>
                            <Text style={{ width: "25%", paddingLeft: 4 }}>Mode</Text>
                            <Text style={{ width: "25%", paddingLeft: 4 }}>Note</Text>
                            <Text style={{ width: "15%", textAlign: "right", paddingRight: 4 }}>Amount</Text>
                        </View>

                        {payments.map((p, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={{ width: "20%", paddingLeft: 4 }}>{p.date}</Text>
                                <Text style={{ width: "15%", paddingLeft: 4 }}>{p.id.substring(0, 8)}</Text>
                                <Text style={{ width: "25%", paddingLeft: 4 }}>{p.paymentMode}</Text>
                                <Text style={{ width: "25%", paddingLeft: 4 }}>{p.note || "-"}</Text>
                                <Text style={{ width: "15%", textAlign: "right", paddingRight: 4 }}>{p.amount.toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.summarySection}>
                        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                            <View style={{ width: "40%" }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 12 }}>Total Paid:</Text>
                                    <Text style={{ fontWeight: "bold", fontSize: 12 }}> {totalPaid.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                </View>

                <View style={[styles.footer, styles.footerFixed]} fixed>
                    <Text>This is a computer generated payment receipt.</Text>
                    <Text>Thank you for choosing {organization.name}!</Text>
                </View>
            </Page>
        </Document>
    );
};
