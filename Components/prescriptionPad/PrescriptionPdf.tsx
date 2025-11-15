import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 10,
  },
  hospitalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  hospitalAddress: {
    fontSize: 10,
    color: '#666666',
  },
  patientInfo: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 80,
  },
  infoValue: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 5,
  },
  medicineTable: {
    flexDirection: 'column',
    width: 'auto',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    alignItems: 'center',
    minHeight: 24,
  },
  tableColHeader: {
    width: '25%',
    padding: 5,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#cccccc',
  },
  tableCol: {
    width: '25%',
    padding: 5,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eeeeee',
  },
  tableCellHeader: {
    margin: 'auto',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 'auto',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
  },
  doctorSignature: {
    marginTop: 30,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionPdfProps {
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorName: string;
  doctorSpecialization: string;
  diagnosis: string;
  medicines: Medicine[];
  notes: string;
  date: string;
}

const PrescriptionPdf: React.FC<PrescriptionPdfProps> = ({
  patientName,
  patientAge,
  patientGender,
  doctorName,
  doctorSpecialization,
  diagnosis,
  medicines,
  notes,
  date,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hospitalName}>MediSparsh Hospital</Text>
          <Text style={styles.hospitalAddress}>123 Health St, Wellness City, 12345</Text>
          <Text style={styles.hospitalAddress}>Phone: (123) 456-7890 | Email: info@medisparsh.com</Text>
        </View>
        <Text style={styles.hospitalAddress}>Date: {date}</Text>
      </View>

      <View style={styles.patientInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Patient Name:</Text>
          <Text style={styles.infoValue}>{patientName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Age/Gender:</Text>
          <Text style={styles.infoValue}>{patientAge} / {patientGender}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Doctor:</Text>
          <Text style={styles.infoValue}>{doctorName} ({doctorSpecialization})</Text>
        </View>
      </View>

      <View style={styles.sectionTitle}>
        <Text>Diagnosis</Text>
      </View>
      <Text style={{ marginBottom: 15, fontSize: 12 }}>{diagnosis}</Text>

      <View style={styles.sectionTitle}>
        <Text>Medication</Text>
      </View>
      <View style={styles.medicineTable}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Medicine</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Dosage</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Frequency</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Duration</Text></View>
        </View>
        {medicines.map((med, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{med.name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{med.dosage}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{med.frequency}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{med.duration}</Text></View>
          </View>
        ))}
      </View>

      <View style={styles.sectionTitle}>
        <Text>Notes / Instructions</Text>
      </View>
      <Text style={{ marginBottom: 30, fontSize: 12 }}>{notes}</Text>

      <Text style={styles.doctorSignature}>Dr. {doctorName}</Text>
      <Text style={{ textAlign: 'right', fontSize: 10, color: '#666666' }}>{doctorSpecialization}</Text>

      <Text style={styles.footer}>
        This is a computer generated prescription and does not require a signature.
      </Text>
    </Page>
  </Document>
);

export default PrescriptionPdf;
