
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";


const styles = StyleSheet.create({
  headRow: {
    flexDirection: "row",
  },
  headLabel: {
    fontWeight: "bold",
    textTransform: "capitalize",
  }
  ,
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

  doctorInfoRow: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: "15px",
  },

  doctorLabel: {
    width: 130,
    fontWeight: "bold",
  },

  doctorValue: {
    flex: 1,
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
  doctorBlock: {
    textAlign: "right",
    maxWidth: 200,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  doctorSpecialization: {
    fontSize: 11,
    color: "#444",
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
    textTransform: "capitalize",
  },
  value: {
    flex: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: "#aaa",
    marginTop: 8,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableHeader: {
    flex: 1,
    padding: 6,
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    padding: 6,
    fontSize: 10,
    textAlign: "center",
  },
  twoColumnBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },

  column: {
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

});

const style1 = StyleSheet.create({
  sectionBox: {
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6
  },
  label: {
    fontSize: 12,
    fontWeight: "bold"
  },
  value: {
    fontSize: 12
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


})

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
    hospitalName?: string | null;
    hospitalLogo?: string | null;
    hospitalContact?: {
      address?: string;
      phone?: string;
      email?: string;
    } | null;
    doctorName?: string | null;
    doctorQualification?: string | null;
    doctorExperience?: string | null;
    doctorSpecialization?: { name: string }[] | null;
  };
}

export const TransactionPDF: React.FC<TransactionProps> = ({ transaction }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={[styles.header, style1.headerFixed]}>
          <View>
            <Text style={styles.hospitalName}>
              {transaction.hospitalName || "MediSparsh Hospital"}
            </Text>

            <View style={styles.headRow}>
              <Text style={styles.headLabel}>Address:</Text>
              <Text> {transaction.hospitalContact?.address || "123 Health St, Wellness City"}</Text>
            </View>

            <View style={styles.headRow}>
              <Text style={styles.headLabel}>Contact:</Text>
              <Text> {transaction.hospitalContact?.phone || "+91-0000000000"}</Text>
            </View>

            <View style={styles.headRow}>
              <Text style={styles.headLabel}>Email:</Text>
              <Text> {transaction.hospitalContact?.email || "contact@example.com"}</Text>
            </View>
          </View>

          <View>
              <View style={styles.doctorInfoRow}>
                  <Text style={{textTransform: "capitalize"}}>Dr.</Text>
                   <Text style={{fontWeight: "bold", textTransform: "uppercase"}}>{transaction.doctorName}</Text>
              </View>
               <View style={{}}>
                    <Text style={{fontSize:"10px", textTransform: "uppercase"}}>({transaction.doctorQualification})</Text>
                </View>
          </View>
        </View>
        <View style={style1.contentWrapper}>
          <Text style={styles.title}>Transaction Receipt</Text>

          <View style={tableStyles.table}>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Transaction ID</Text>
              <Text style={tableStyles.cellValue}>{transaction.transactionId}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Appointment ID</Text>
              <Text style={tableStyles.cellValue}>{transaction.appointmentId}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Patient Name</Text>
              <Text style={tableStyles.cellValue}>{transaction.patientName}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Patient Phone</Text>
              <Text style={tableStyles.cellValue}>{transaction.patientPhone}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Patient Gender</Text>
              <Text style={tableStyles.cellValue}>{transaction.patientGender}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Appointment Date</Text>
              <Text style={tableStyles.cellValue}>{transaction.appointmentDate}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Appointment Time</Text>
              <Text style={tableStyles.cellValue}>{transaction.appointmentTime}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Payment Method</Text>
              <Text style={tableStyles.cellValue}>{transaction.paymentMethod}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Amount</Text>
              <Text style={tableStyles.cellValue}>{transaction.amount}</Text>
            </View>

            <View style={tableStyles.row}>
              <Text style={tableStyles.cellLabel}>Status</Text>
              <Text style={tableStyles.cellValue}>{transaction.status}</Text>
            </View>

          </View>

        </View>

        <View style={[styles.footer, style1.footerFixed]}>
          <Text>Generated on: {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};
