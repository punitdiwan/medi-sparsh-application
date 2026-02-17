import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";

interface PdfHeaderProps {
  orgModeCheck: boolean;
  organizationName?: string;
  address?: string;
  phone?: string;
  email?: string;
  doctorName: string;
  doctorSpecialization?: string;
  logo?: string;
}

export const PdfHeader: React.FC<PdfHeaderProps> = ({
  orgModeCheck,
  organizationName = "Clinic Name",
  address = "123 Health St",
  phone = "+91-0000000000",
  email = "example@mail.com",
  doctorName,
  doctorSpecialization,
  logo,
}) => {
  return (
    <View style={headerStyles.headerContainer}>
      {orgModeCheck ? (
        <>
          {/* LEFT — LOGO + HOSPITAL */}
          <View style={headerStyles.leftContainer}>
            {logo && <Image src={logo} style={headerStyles.logo} />}
            <View style={headerStyles.hospitalInfo}>
              <Text style={headerStyles.hospitalName}>{organizationName}</Text>
              <View style={headerStyles.infoRow}>
                <Text style={headerStyles.infoLabel}>Address: </Text>
                <Text>{address}</Text>
              </View>
              <View style={headerStyles.infoRow}>
                <Text style={headerStyles.infoLabel}>Contact: </Text>
                <Text>{phone}</Text>
              </View>
              <View style={headerStyles.infoRow}>
                <Text style={headerStyles.infoLabel}>Email: </Text>
                <Text>{email}</Text>
              </View>
            </View>
          </View>

          {/* RIGHT — DOCTOR */}
          {doctorName && (
            <View style={headerStyles.doctorContainer}>
              <Text style={headerStyles.doctorName}>Dr. {doctorName}</Text>
              <Text style={headerStyles.doctorSpecialization}>
                {doctorSpecialization}
              </Text>
            </View>
          )}
        </>
      ) : (
        <>
          {/* LEFT — DOCTOR */}
          <View style={headerStyles.leftDoctor}>
            <Text style={headerStyles.doctorNameLarge}>Dr. {doctorName}</Text>
            <Text style={headerStyles.doctorSpecializationSmall}>
              {doctorSpecialization}
            </Text>
          </View>

          {/* RIGHT — LOGO + CLINIC */}
          <View style={headerStyles.rightClinic}>
            {logo && <Image src={logo} style={headerStyles.logoSmall} />}
            <Text style={headerStyles.hospitalName}>{organizationName}</Text>
            <Text style={headerStyles.infoSmall}>{address}</Text>
            <Text style={headerStyles.infoSmall}>{phone}</Text>
            <Text style={headerStyles.infoSmall}>{email}</Text>
          </View>
        </>
      )}
    </View>
  );
};

const headerStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#008C9E", // preview background color
    color: "white", // text color
    marginBottom: 12, // ensures content is below
  },
  leftContainer: { flexDirection: "row", gap: 10 },
  logo: { width: 50, height: 50, objectFit: "contain" },
  hospitalInfo: { flexDirection: "column" },
  hospitalName: { fontSize: 22, fontWeight: "bold", color: "white" },
  infoRow: { flexDirection: "row", marginBottom: 2 },
  infoLabel: { fontWeight: "bold", color: "white" },
  doctorContainer: { justifyContent: "flex-end", alignItems: "flex-end" },

  leftDoctor: { flex: 1 },
  doctorNameLarge: { fontSize: 20, fontWeight: "bold", color: "white" },
  doctorSpecializationSmall: { fontSize: 12, color: "white" },
  rightClinic: { flex: 1, textAlign: "right" },
  logoSmall: { width: 40, height: 40, marginBottom: 4, alignSelf: "flex-end" },
  infoSmall: { fontSize: 10, color: "white" },
  doctorName: { fontSize: 14, fontWeight: "bold", color: "white" },
  doctorSpecialization: { fontSize: 12, color: "white" },
});
