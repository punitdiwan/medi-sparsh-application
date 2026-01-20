import React from 'react';
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from '../doctor/PdfHeader';

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

interface PrescriptionPdfProps {
  id: string;
  prescriptionId: string;
  createdAt: string;
  patientId: string;
  patientName: string;
  patientGender: string;
  patientAge: number;
  patientAddress: any;
  doctorName: string;
  doctorSpecialization: string;
  diagnosis: string;
  symptoms: string | null;
  appointmentId?: string | null;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
  appointmentStatus?: string | null;
  appointmentReason?: string | null;
  appointmentNotes?: string | null;
  isFollowUp?: boolean | null;
  previousAppointmentId?: string | null;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;

  labTests: Array<{
    name: string;
    description?: string;
  }> | null;

  vitals: Record<string, any> | null;

  followUpRequired: boolean;
  followUpDate: string | null;
  followUpNotes: string | null;

  additionalNotes: string | null;
  notes: string;
  date: string;
  organization: {
    id: string;
    name: string;
    metadata: string | null;
  };
  orgModeCheck: boolean;
}

const PrescriptionPdf: React.FC<PrescriptionPdfProps> = (props) => {
  const {
    patientName,
    patientAge,
    patientGender,
    patientAddress,
    doctorName,
    doctorSpecialization,
    diagnosis,
    symptoms,
    medicines,
    labTests,
    vitals,
    appointmentDate,
    appointmentTime,
    appointmentReason,
    appointmentStatus,
    appointmentNotes,
    followUpRequired,
    followUpDate,
    followUpNotes,
    notes,
    date,
    organization,
    orgModeCheck
  } = props;
  const parsedMetadata = organization?.metadata
    ? JSON.parse(organization.metadata)
    : null;
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* {orgModeCheck ? (
          <View style={[styles.header, style1.headerFixed]}>
            <View>
              <Text style={[styles.hospitalName, { fontSize: 22 }]}>
                {organization?.name || "MediSparsh Hospital"}
              </Text>

              <View style={styles.headRow}>
                <Text style={styles.headLabel}>Address:</Text>
                <Text> {parsedMetadata?.address || "123 Health St"}</Text>
              </View>

              <View style={styles.headRow}>
                <Text style={styles.headLabel}>Contact:</Text>
                <Text> {parsedMetadata?.phone || "+91-0000000000"}</Text>
              </View>

              <View style={styles.headRow}>
                <Text style={styles.headLabel}>Email:</Text>
                <Text> {parsedMetadata?.email || "contact@example.com"}</Text>
              </View>
            </View>

            <View style={styles.doctorBlock}>
              <Text style={[styles.doctorName, { fontSize: 14 }]}>
                Dr. {doctorName}
              </Text>
              <Text style={styles.doctorSpecialization}>
                {doctorSpecialization}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.header, style1.headerFixed]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", textTransform: "uppercase" }}>
                Dr. {doctorName}
              </Text>
              <Text style={{ fontSize: 12 ,color:"white"}}>{doctorSpecialization}</Text>
            </View>
            <View style={{ flex: 1, textAlign: "right" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {organization?.name || "Clinic Name"}
              </Text>

              <Text style={{ fontSize: 10 }}>
                {parsedMetadata?.address || "123 Health St"}
              </Text>
              <Text style={{ fontSize: 10 }}>
                {parsedMetadata?.phone || "+91-0000000000"}
              </Text>
              <Text style={{ fontSize: 10 }}>
                {parsedMetadata?.email || "example@mail.com"}
              </Text>
            </View>
          </View>
        )} */}
        <PdfHeader
          orgModeCheck={orgModeCheck}
          organizationName={organization?.name}
          address={parsedMetadata?.address}
          phone={parsedMetadata?.phone}
          email={parsedMetadata?.email}
          doctorName={doctorName}
          doctorSpecialization={doctorSpecialization}
          logo={parsedMetadata?.logo} 
          styles={styles}
          style1={style1}
        />


        <View style={style1.contentWrapper}>
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Patient & Appointment Details</Text>

            <View style={styles.twoColumnBox}>

              {/* LEFT COLUMN — PATIENT INFO */}
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={styles.label}>Name:</Text>
                  <Text style={styles.value}>{patientName}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Age / Gender:</Text>
                  <Text style={styles.value}>{patientAge} / {patientGender}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Address:</Text>
                  <Text style={styles.value}>{patientAddress || "—"}</Text>
                </View>
              </View>

              {/* RIGHT COLUMN — APPOINTMENT INFO */}
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>{appointmentDate || "—"}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Time:</Text>
                  <Text style={styles.value}>{appointmentTime || "—"}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.value}>{appointmentStatus || "—"}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Reason:</Text>
                  <Text style={styles.value}>{appointmentReason || "—"}</Text>
                </View>

                {appointmentNotes && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Notes:</Text>
                    <Text style={styles.value}>{appointmentNotes}</Text>
                  </View>
                )}
              </View>

            </View>
          </View>


          {/* TWO COLUMN WRAPPER */}
          <View style={{ flexDirection: "row", gap: 10 }}>

            {/* LEFT COLUMN — DIAGNOSIS + SYMPTOMS */}
            <View style={{ flex: 1 }}>
              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Diagnosis</Text>
                <Text>{diagnosis || "—"}</Text>
              </View>

              {symptoms && (
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Symptoms</Text>
                  <Text>{symptoms}</Text>
                </View>
              )}
            </View>

            {/* RIGHT COLUMN — VITALS ONLY */}
            <View style={{ flex: 1 }}>
              {vitals && Object.keys(vitals).length > 0 && (
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionTitle}>Vitals</Text>

                  {Object.entries(vitals).map(([key, value]) => (
                    <View style={styles.row} key={key}>
                      <Text style={styles.label}>{key}:</Text>
                      <Text style={styles.value}>{String(value)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </View>


          {/* MEDICINES */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Medicines</Text>

            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Medicine</Text>
                <Text style={styles.tableHeader}>Dosage</Text>
                <Text style={styles.tableHeader}>Frequency</Text>
                <Text style={styles.tableHeader}>Duration</Text>
              </View>

              {medicines.map((m, i) => (
                <View style={styles.tableRow} key={i}>
                  <Text style={styles.tableCell}>{m.name}</Text>
                  <Text style={styles.tableCell}>{m.dosage}</Text>
                  <Text style={styles.tableCell}>{m.frequency}</Text>
                  <Text style={styles.tableCell}>{m.duration}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* LAB TESTS */}
          {labTests && labTests.length > 0 && (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Lab Tests</Text>
              {labTests.map((t, i) => (
                <Text key={i}>• {t.name} {t.description ? ` - ${t.description}` : ""}</Text>
              ))}
            </View>
          )}

          {/* FOLLOW UP */}
          {followUpDate && <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Follow Up</Text>

            <Text>Required: {followUpRequired ? "Yes" : "No"}</Text>
            {followUpDate && <Text>Follow Up Date: {followUpDate}</Text>}
            {followUpNotes && <Text>Notes: {followUpNotes}</Text>}
          </View>}

          {/* ADDITIONAL NOTES */}
          {notes && <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text>{notes}</Text>
          </View>}
        </View>

        {/* FOOTER */}
        <View style={[styles.footer, style1.footerFixed]}>
          <Text>This is a generated prescription and does not require a signature.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PrescriptionPdf;
