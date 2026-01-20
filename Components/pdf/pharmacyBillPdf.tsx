// PharmacyBillPdf.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { PdfHeader } from "../doctor/PdfHeader";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 10 },
  section: { marginBottom: 10 },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: "bold",
  },
  tableRow: { flexDirection: "row", paddingVertical: 2 },
});

interface Props {
  billNumber: string;
  billDate: string;
  customerName: string;
  customerPhone: string;
  paymentMode: string;
  items: Array<{ name: string; qty: number; price: number; total: number }>;
  totalAmount: number;
  discount: number;
  tax: number;
  organization: {
    name: string;
    metadata: any;
  };
  orgModeCheck: boolean;
}

export default function PharmacyBillPdf(props: Props) {
  const { organization, orgModeCheck } = props;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== HEADER ===== */}
        <PdfHeader
          orgModeCheck={orgModeCheck}
          organizationName={organization?.name}
          address={organization?.metadata?.address}
          phone={organization?.metadata?.phone}
          email={organization?.metadata?.email}
          logo={organization?.metadata?.logo}
          doctorName=""
          doctorSpecialization=""
         
        />

        {/* ===== CUSTOMER INFO ===== */}
        <View style={styles.section}>
          <Text>Bill No: {props.billNumber}</Text>
          <Text>Date: {props.billDate}</Text>
          <Text>Customer: {props.customerName}</Text>
          <Text>Phone: {props.customerPhone}</Text>
          <Text>Payment Mode: {props.paymentMode}</Text>
        </View>

        {/* ===== ITEMS TABLE ===== */}
        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={{ width: "40%" }}>Item</Text>
            <Text style={{ width: "20%" }}>Qty</Text>
            <Text style={{ width: "20%" }}>Price</Text>
            <Text style={{ width: "20%" }}>Total</Text>
          </View>

          {props.items.map((i, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={{ width: "40%" }}>{i.name}</Text>
              <Text style={{ width: "20%" }}>{i.qty}</Text>
              <Text style={{ width: "20%" }}>{i.price}</Text>
              <Text style={{ width: "20%" }}>{i.total}</Text>
            </View>
          ))}
        </View>

        {/* ===== TOTAL ===== */}
        <View style={styles.section}>
          <Text>Total: ₹{props.totalAmount}</Text>
          <Text>Discount: ₹{props.discount}</Text>
          <Text>Tax: ₹{props.tax}</Text>
        </View>
      </Page>
    </Document>
  );
}
