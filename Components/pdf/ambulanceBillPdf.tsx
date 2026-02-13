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
    backgroundColor: "#f3f4f6",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
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

  paymentStatusPaid: {
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

  patientName: string | null;
  patientPhone: string | null;

  vehicleNumber: string;
  driverName: string;
  pickupLocation: string;
  dropoffLocation: string;
  tripType: string;

  paymentMode: string;

  standardCharge: number;
  discountAmount: number;
  taxPercent: number;

  netAmount: number;
  paidAmount: number;
  balanceAmount: number;

  status: "paid" | "pending" | "partially_paid";

  organization: { name: string; metadata?: any };
  orgModeCheck: boolean;

  chargeCategory: string;
  chargeName: string;
}

const AmbulanceBillPdf: React.FC<Props> = (props) => {
  const { organization, orgModeCheck } = props;

  const metadata =
    typeof organization.metadata === "string"
      ? JSON.parse(organization.metadata)
      : organization.metadata;

  const taxableAmount = props.standardCharge - props.discountAmount;

  const taxAmount = props.standardCharge * (props.taxPercent / 100);
  const netAmount = props.standardCharge + taxAmount;
  
  const afterDiscount = props.standardCharge - props.discountAmount;
  const netAmountWithTax = afterDiscount + (afterDiscount * props.taxPercent) / 100;

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

        <View style={contentWrapper}>
          {/* BILL HEADER INFO */}
          <View style={styles.section}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: "bold" }}>Patient Details:</Text>
                <Text style={{ fontSize: 14, marginTop: 4 }}>{props.patientName}</Text>
                <Text style={{ marginTop: 2 }}>Phone: {props.patientPhone}</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 12, fontWeight: "bold" }}>Bill Details:</Text>
                <Text style={{ marginTop: 4 }}>Bill No: {props.billNumber}</Text>
                <Text>Date: {props.billDate}</Text>
                <Text>Payment: {props.paymentMode}</Text>
                <Text>Status: {props.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          {/* AMBULANCE DETAILS */}
          <View style={styles.section}>
            <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 6 }}>
              Ambulance Trip Details
            </Text>

            <View style={styles.tableHeader}>
              <Text style={{ width: "20%", paddingLeft: 4 }}>Vehicle</Text>
              <Text style={{ width: "20%" }}>Driver</Text>
              <Text style={{ width: "20%" }}>Trip Type</Text>
              <Text style={{ width: "20%" }}>Pickup</Text>
              <Text style={{ width: "20%" }}>Dropoff</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={{ width: "20%", paddingLeft: 4 }}>{props.vehicleNumber}</Text>
              <Text style={{ width: "20%" }}>{props.driverName}</Text>
              <Text style={{ width: "20%" }}>{props.tripType}</Text>
              <Text style={{ width: "20%" }}>{props.pickupLocation}</Text>
              <Text style={{ width: "20%" }}>{props.dropoffLocation}</Text>
            </View>
          </View>

          {/* CHARGES TABLE */}
          <View style={styles.section}>
            <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 6 }}>
              Charge Breakdown
            </Text>

            <View style={styles.tableHeader}>
              <Text style={{ width: "40%", paddingLeft: 4 }}>Description</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>Amount</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>Tax %</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>Total</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={{ width: "40%", paddingLeft: 4 }}>{props.chargeCategory} - {props.chargeName}</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>{props.standardCharge.toFixed(2)}</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>{props.taxPercent}%</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>{netAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* TOTALS */}
          <View style={styles.totalSection}>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <View style={{ width: "40%" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text>Total Charge:</Text>
                  <Text>{props.standardCharge.toFixed(2)}</Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text>Discount:</Text>
                  <Text>- {props.discountAmount.toFixed(2)}</Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text>Tax:</Text>
                  <Text>{taxAmount.toFixed(2)}</Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 4, borderTopWidth: 1 }}>
                  <Text style={{ fontWeight: "bold" }}>Net Amount:</Text>
                  <Text style={{ fontWeight: "bold" }}>{netAmountWithTax.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* PAYMENT STATUS */}
          <View
            style={
              props.balanceAmount > 0
                ? styles.paymentStatusPending
                : styles.paymentStatusPaid
            }
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontWeight: "bold" }}>Paid Amount:</Text>
              <Text style={{ fontWeight: "bold" }}>{props.paidAmount.toFixed(2)}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "bold" }}>Balance:</Text>
              <Text style={{ fontWeight: "bold" }}>{props.balanceAmount.toFixed(2)}</Text>
            </View>

            <Text style={{ marginTop: 6, fontSize: 9, fontWeight: "bold" }}>
              STATUS: {props.balanceAmount > 0 ? "PENDING" : "FULLY PAID"}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={[styles.footer, styles.footerFixed]}>
          <Text>This is a computer generated ambulance bill.</Text>
          <Text>Thank you for choosing {organization.name}!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default AmbulanceBillPdf;
