
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";


const styles = StyleSheet.create({
  page: {
    padding: 20,
    // fontFamily: "Roboto",
    fontSize: 12,
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: "40%",
    fontWeight: "bold",
  },
  value: {
    width: "60%",
  },
});

interface TransactionProps {
  transaction: {
    amount: number;
    appointmentDate: string;
    appointmentId: string;
    appointmentStatus: string;
    appointmentTime: string;
    createdAt: string;
    hospitalId: string;
    patientGender: string;
    patientId: string;
    patientName: string;
    patientPhone: string;
    paymentMethod: string;
    status: string;
    transactionId: string;
  };
}

export const TransactionPDF: React.FC<TransactionProps> = ({ transaction }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Transaction Receipt</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID:</Text>
            <Text style={styles.value}>{transaction.transactionId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Appointment ID:</Text>
            <Text style={styles.value}>{transaction.appointmentId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Patient Name:</Text>
            <Text style={styles.value}>{transaction.patientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Patient Phone:</Text>
            <Text style={styles.value}>{transaction.patientPhone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Patient Gender:</Text>
            <Text style={styles.value}>{transaction.patientGender}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Appointment Date:</Text>
            <Text style={styles.value}>{transaction.appointmentDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Appointment Time:</Text>
            <Text style={styles.value}>{transaction.appointmentTime}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{transaction.paymentMethod}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>₹{transaction.amount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{transaction.status}</Text>
          </View>
        </View>

        <Text>Generated on: {new Date().toLocaleString()}</Text>
      </Page>
    </Document>
  );
};
