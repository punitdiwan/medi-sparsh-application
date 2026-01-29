import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../doctor/PdfHeader";

const styles = StyleSheet.create({
    page: { fontSize: 10, backgroundColor: "#fff", fontFamily: "Helvetica", paddingBottom: 60 },
    section: { marginBottom: 15, paddingHorizontal: 30 },
    title: { fontSize: 16, fontWeight: "bold", marginBottom: 10, textAlign: "center", textDecoration: "underline" },
    row: { flexDirection: "row", marginBottom: 5 },
    label: { width: 100, fontWeight: "bold" },
    value: { flex: 1 },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        paddingBottom: 4,
        marginBottom: 4,
        fontWeight: "bold",
        backgroundColor: "#f0f0f0",
    },
    tableRow: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#ddd" },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        fontSize: 9,
        textAlign: "center",
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        paddingTop: 10,
        color: "#777",
    },
    patientInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#eee",
        padding: 10,
        marginBottom: 20,
        borderRadius: 4,
    },
    infoBlock: { width: "48%" },
    reportContainer: {
        marginBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 15,
    },
    reportInfo: {
        backgroundColor: "#f9f9f9",
        padding: 8,
        marginBottom: 10,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: "#008C9E",
    }
});

interface Parameter {
    name: string;
    value: string;
    range: string;
}

interface TestReport {
    testName: string;
    sampleCollectedBy?: string;
    collectedDate?: string;
    pathologyCenter?: string;
    approvedBy?: string;
    approveDate?: string;
    parameters: Parameter[];
}

interface Props {
    patient: {
        name: string;
        phone?: string;
        age?: string;
        gender?: string;
        address?: string;
    };
    billDetails: {
        billNo: string;
        date: string;
    };
    reports: TestReport[];
    organization: { name: string; metadata?: any };
    orgModeCheck: boolean;
    doctorName?: string;
}

export const PathologyTestReportPdf: React.FC<Props> = ({
    patient,
    billDetails,
    reports,
    organization,
    orgModeCheck,
    doctorName
}) => {
    const metadata = typeof organization.metadata === 'string'
        ? JSON.parse(organization.metadata)
        : organization.metadata;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER (Only Once) */}
                <PdfHeader
                    orgModeCheck={orgModeCheck}
                    organizationName={organization.name}
                    address={metadata?.address}
                    phone={metadata?.phone}
                    email={metadata?.email}
                    logo={metadata?.logo}
                    doctorName={doctorName || ""}
                    doctorSpecialization=""
                />

                {/* Patient & Bill Info (Only Once) */}
                <View style={styles.section}>
                    <Text style={styles.title}>PATHOLOGY TEST REPORT</Text>
                    <View style={styles.patientInfo}>
                        <View style={styles.infoBlock}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Patient Name:</Text>
                                <Text style={styles.value}>{patient.name}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Age / Gender:</Text>
                                <Text style={styles.value}>{patient.age} / {patient.gender}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Contact:</Text>
                                <Text style={styles.value}>{patient.phone || "N/A"}</Text>
                            </View>
                        </View>
                        <View style={styles.infoBlock}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Bill No:</Text>
                                <Text style={styles.value}>{billDetails.billNo}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Bill Date:</Text>
                                <Text style={styles.value}>{billDetails.date}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Referred By:</Text>
                                <Text style={styles.value}>Dr. {doctorName || "N/A"}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Address:</Text>
                                <Text style={styles.value}>{patient.address || "N/A"}</Text>
                            </View>
                        </View>
                    </View>

                    {/* All Reports List */}
                    {reports.map((report, idx) => (
                        <View key={idx} style={styles.reportContainer} wrap={false}>
                            {/* Individual Test Identification */}
                            <View style={styles.reportInfo}>
                                <View style={styles.row}>
                                    <Text style={[styles.label, { width: 120 }]}>Test Name:</Text>
                                    <Text style={[styles.value, { fontWeight: "bold", color: "#008C9E" }]}>{report.testName}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={[styles.label, { width: 120 }]}>Collected By / Date:</Text>
                                    <Text style={styles.value}>{report.sampleCollectedBy || "N/A"} ({report.collectedDate || "N/A"})</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={[styles.label, { width: 120 }]}>Approved By / Date:</Text>
                                    <Text style={styles.value}>{report.approvedBy || "N/A"} ({report.approveDate || "N/A"})</Text>
                                </View>
                            </View>

                            {/* Parameters Table for this Test */}
                            <View style={styles.tableHeader}>
                                <Text style={{ width: "40%", paddingLeft: 4 }}>Parameter Name</Text>
                                <Text style={{ width: "30%", textAlign: "center" }}>Result Value</Text>
                                <Text style={{ width: "30%", textAlign: "right", paddingRight: 4 }}>Reference Range</Text>
                            </View>

                            {report.parameters.length > 0 ? (
                                report.parameters.map((param, pIdx) => (
                                    <View key={pIdx} style={styles.tableRow}>
                                        <Text style={{ width: "40%", paddingLeft: 4 }}>{param.name}</Text>
                                        <Text style={{ width: "30%", textAlign: "center", fontWeight: "bold" }}>{param.value}</Text>
                                        <Text style={{ width: "30%", textAlign: "right", paddingRight: 4 }}>{param.range}</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={{ padding: 10, textAlign: "center" }}>
                                    <Text style={{ color: "#777", fontStyle: "italic" }}>No parameter data available</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Footer (Fixed to Page) */}
                <View style={styles.footer} fixed>
                    <Text>This is a computer generated test report. No signature required.</Text>
                    <Text>Thank you for choosing {organization.name}!</Text>
                </View>
            </Page>
        </Document>
    );
};
