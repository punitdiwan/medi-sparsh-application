import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";

interface PdfHeaderProps {
  orgModeCheck: boolean;
  organizationName?: string;
  address?: string;
  phone?: string;
  email?: string;
  doctorName: string;
  doctorSpecialization?: string;
  logo?: string;
  styles: any;
  style1: any;
}

export const PdfHeader: React.FC<PdfHeaderProps> = ({
  orgModeCheck,
  organizationName = "Clinic Name",
  address = "123 Health St",
  phone = "+91-0000000009",
  email = "example@mail1.com",
  doctorName,
  doctorSpecialization,
  logo,
}) => {
  return (
    <View style={[styles.header, style1.headerFixed]}>
      {orgModeCheck ? (
        <>
          {/* LEFT — LOGO + HOSPITAL */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {logo && (
              <Image
                src={logo}
                style={{
                  width: 50,
                  height: 50,
                  objectFit: "contain",
                }}
              />
            )}

            <View>
              <Text style={[styles.hospitalName, { fontSize: 22 }]}>
                {organizationName}
              </Text>

              <InfoRow label="Address:" value={address} styles={styles} />
              <InfoRow label="Contact:" value={phone} styles={styles} />
              <InfoRow label="Email:" value={email} styles={styles} />
            </View>
          </View>

          {/* RIGHT — DOCTOR */}
          {doctorName && <View style={styles.doctorBlock}>
            <Text style={[styles.doctorName, { fontSize: 14 }]}>
              Dr. {doctorName}
            </Text>
            <Text style={styles.doctorSpecialization}>
              {doctorSpecialization}
            </Text>
          </View>}
        </>
      ) : (
        <>
          {/* LEFT — DOCTOR */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              Dr. {doctorName}
            </Text>
            <Text style={{ fontSize: 12, color: "white" }}>
              {doctorSpecialization}
            </Text>
          </View>

          {/* RIGHT — LOGO + CLINIC */}
          <View style={{ flex: 1, textAlign: "right" }}>
            {logo && (
              <Image
                src={logo}
                style={{
                  width: 40,
                  height: 40,
                  marginBottom: 4,
                  alignSelf: "flex-end",
                }}
              />
            )}

            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {organizationName}
            </Text>
            <Text style={{ fontSize: 10 }}>{address}</Text>
            <Text style={{ fontSize: 10 }}>{phone}</Text>
            <Text style={{ fontSize: 10 }}>{email}</Text>
          </View>
        </>
      )}
    </View>
  );
};

const InfoRow = ({
  label,
  value,
  styles,
}: {
  label: string;
  value?: string;
  styles: any;
}) => (
  <View style={styles.headRow}>
    <Text style={styles.headLabel}>{label}</Text>
    <Text> {value || "—"}</Text>
  </View>
);
