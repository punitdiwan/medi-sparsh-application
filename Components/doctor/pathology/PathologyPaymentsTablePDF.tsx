import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#fff",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#008C9E",
    paddingBottom: 10,
  },
  hospitalName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#008C9E",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  headerInfo: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 15,
    textTransform: "uppercase",
    color: "#008C9E",
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#008C9E",
    color: "white",
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#666",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    minHeight: 25,
    alignItems: "center",
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    minHeight: 25,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  colIdBill: {
    width: "12%",
    padding: 6,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  colPatient: {
    width: "18%",
    padding: 6,
    fontSize: 9,
  },
  colPhone: {
    width: "13%",
    padding: 6,
    fontSize: 9,
  },
  colDate: {
    width: "13%",
    padding: 6,
    fontSize: 9,
    textAlign: "center",
  },
  colMode: {
    width: "12%",
    padding: 6,
    fontSize: 9,
    textAlign: "center",
  },
  colAmount: {
    width: "15%",
    padding: 6,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "right",
  },
  colRef: {
    width: "17%",
    padding: 6,
    fontSize: 8,
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 11,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  footer: {
    marginTop: 30,
    fontSize: 9,
    textAlign: "center",
    color: "#999",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
});

interface PathologyPayment {
  id: string;
  billId: string;
  billNo: string;
  paymentDate: string;
  paymentAmount: string;
  paymentMode: string;
  referenceNo: string | null;
  patientName: string | null;
  patientPhone: string | null;
}

interface PathologyPaymentsTablePDFProps {
  payments: PathologyPayment[];
  title?: string;
}

export const PathologyPaymentsTablePDF: React.FC<PathologyPaymentsTablePDFProps> = ({
  payments,
  title = "Pathology Payments Report",
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

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.paymentAmount), 0);
  const cashPayments = payments.filter((p) => p.paymentMode === "Cash");
  const onlinePayments = payments.filter((p) => p.paymentMode === "Online" || p.paymentMode === "UPI");

  // Split payments into chunks of 25 per page for better formatting
  const paymentsPerPage = 25;
  const pages = Math.ceil(payments.length / paymentsPerPage);
  const pageChunks = Array.from({ length: pages }, (_, i) =>
    payments.slice(i * paymentsPerPage, (i + 1) * paymentsPerPage)
  );

  return (
    <Document>
      {pageChunks.map((pagePayments, pageIndex) => (
        <Page key={pageIndex} style={styles.page} size="A4">

          {/* Title */}
          <Text style={styles.title}>
            {title}
            {pages > 1 && ` (Page ${pageIndex + 1} of ${pages})`}
          </Text>

          {/* Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.colIdBill}>Bill No</Text>
              <Text style={styles.colPatient}>Patient Name</Text>
              <Text style={styles.colPhone}>Phone</Text>
              <Text style={styles.colDate}>Date</Text>
              <Text style={styles.colMode}>Mode</Text>
              <Text style={styles.colAmount}>Amount (₹)</Text>
              <Text style={styles.colRef}>Reference</Text>
            </View>

            {/* Table Rows */}
            {pagePayments.map((payment, index) => (
              <View
                key={payment.id}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={styles.colIdBill}>{payment.billNo}</Text>
                <Text style={styles.colPatient}>{payment.patientName || "-"}</Text>
                <Text style={styles.colPhone}>{payment.patientPhone || "-"}</Text>
                <Text style={styles.colDate}>{formatDate(payment.paymentDate)}</Text>
                <Text style={styles.colMode}>{payment.paymentMode}</Text>
                <Text style={styles.colAmount}>
                  {parseFloat(payment.paymentAmount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Text style={styles.colRef}>{payment.referenceNo || "-"}</Text>
              </View>
            ))}
          </View>

          {/* Summary on last page */}
          {pageIndex === pages - 1 && (
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={{ fontWeight: "bold" }}>Total Payments:</Text>
                <Text style={{ fontWeight: "bold" }}>
                  {totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Total Records:</Text>
                <Text>{payments.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Cash Payments:</Text>
                <Text>
                  {cashPayments.length} (
                  {cashPayments
                    .reduce((sum, p) => sum + Number(p.paymentAmount), 0)
                    .toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  )
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Online Payments:</Text>
                <Text>
                  {onlinePayments.length} (
                  {onlinePayments
                    .reduce((sum, p) => sum + Number(p.paymentAmount), 0)
                    .toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  )
                </Text>
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Generated on: {new Date().toLocaleString()}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};
