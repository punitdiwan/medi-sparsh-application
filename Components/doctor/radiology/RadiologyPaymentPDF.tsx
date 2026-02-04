import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  headRow: {
    flexDirection: "row",
  },
  headLabel: {
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  page: {
    padding: 30,
    backgroundColor: "#fff",
    fontFamily: "Helvetica",
    fontSize: 11,
  },
  sectionBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    backgroundColor: "#008C9E",
    color: "white",
  },
  hospitalBlock: {
    flexDirection: "column",
  },
  hospitalName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 1,
    textTransform: "uppercase",
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 4,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 120,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    padding: 8,
    color: "#777",
  },
  twoColumnBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  column: {
    flex: 1,
  },
  headerFixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  footerFixed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  contentWrapper: {
    marginTop: 100,
    marginBottom: 60,
    textTransform: "capitalize",
  },
});

const tableStyles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: "#aaa",
    marginTop: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cellLabel: {
    width: "40%",
    padding: 6,
    fontSize: 11,
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
  },
  cellValue: {
    width: "60%",
    padding: 6,
    fontSize: 11,
  },
});

interface RadiologyPaymentProps {
  payment: {
    id: string;
    billId: string;
    billNo: string;
    paymentDate: string;
    paymentAmount: string;
    paymentMode: string;
    referenceNo: string | null;
    patientName: string | null;
    patientPhone: string | null;
  };
  hospitalInfo?: {
    name?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  doctorInfo?: {
    name?: string | null;
    qualification?: string | null;
  };
}

export const RadiologyPaymentPDF: React.FC<RadiologyPaymentProps> = ({
  payment,
  hospitalInfo,
  doctorInfo,
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <Document>
      <Page style={styles.page}>
        {/* Header */}
        <View style={[styles.header, styles.headerFixed]}>
          <View>
            <Text style={styles.hospitalName}>
              {hospitalInfo?.name || "Radiology Department"}
            </Text>

            <View style={styles.headRow}>
              <Text style={styles.headLabel}>Address:</Text>
              <Text> {hospitalInfo?.address || "123 Health St, Wellness City"}</Text>
            </View>

            <View style={styles.headRow}>
              <Text style={styles.headLabel}>Contact:</Text>
              <Text> {hospitalInfo?.phone || "+91-0000000000"}</Text>
            </View>

            <View style={styles.headRow}>
              <Text style={styles.headLabel}>Email:</Text>
              <Text> {hospitalInfo?.email || "contact@example.com"}</Text>
            </View>
          </View>

          {doctorInfo?.name && (
            <View>
              <View style={styles.row}>
                <Text style={{ textTransform: "capitalize" }}>Dr.</Text>
                <Text style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                  {doctorInfo.name}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: "10px", textTransform: "uppercase" }}>
                  ({doctorInfo.qualification || "Radiologist"})
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Payment Receipt</Text>

          {/* Payment Details Table */}
          <View style={tableStyles.table}>
            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Payment ID</Text>
              <Text style={tableStyles.cellValue}>{payment.id.substring(0, 12).toUpperCase()}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Bill Number</Text>
              <Text style={tableStyles.cellValue}>{payment.billNo}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Bill ID</Text>
              <Text style={tableStyles.cellValue}>{payment.billId}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Patient Name</Text>
              <Text style={tableStyles.cellValue}>{payment.patientName || "-"}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Patient Phone</Text>
              <Text style={tableStyles.cellValue}>{payment.patientPhone || "-"}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Payment Date</Text>
              <Text style={tableStyles.cellValue}>
                {formatDate(payment.paymentDate)}
              </Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Payment Time</Text>
              <Text style={tableStyles.cellValue}>
                {formatTime(payment.paymentDate)}
              </Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Payment Mode</Text>
              <Text style={tableStyles.cellValue}>{payment.paymentMode}</Text>
            </View>

            {payment.referenceNo && (
              <View style={tableStyles.row}>
                <Text style={tableStyles.cellLabel}>Reference No</Text>
                <Text style={tableStyles.cellValue}>{payment.referenceNo}</Text>
              </View>
            )}

            <View style={[tableStyles.row, { backgroundColor: "#e8f5e9" }]}>
              <Text style={[tableStyles.cellLabel, { backgroundColor: "#c8e6c9" }]}>
                Amount Paid
              </Text>
              <Text
                style={[
                  tableStyles.cellValue,
                  { fontWeight: "bold", fontSize: 13, color: "#2e7d32" },
                ]}
              >
                {parseFloat(payment.paymentAmount).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          {/* Signature Section */}
          <View style={styles.section}>
            <View style={styles.twoColumnBox}>
              <View style={styles.column}>
                <Text style={{ fontSize: 10, marginTop: 30, borderTopWidth: 1, borderTopColor: "#000", paddingTop: 4 }}>
                  Authorized Signature
                </Text>
              </View>
              <View style={styles.column}>
                <Text style={{ fontSize: 10, marginTop: 30, borderTopWidth: 1, borderTopColor: "#000", paddingTop: 4, textAlign: "right" }}>
                  Patient Signature
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, styles.footerFixed]}>
          <Text>Generated on: {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};
