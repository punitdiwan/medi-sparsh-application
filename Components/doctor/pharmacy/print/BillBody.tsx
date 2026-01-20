import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles } from "@/Components/pdf/styles";

interface BillBodyProps {
    bill: any;
}

export const BillBody = ({ bill }: BillBodyProps) => {
    if (!bill) return null;

    return (
        <View style={pdfStyles.content}>
            {/* Bill Info */}
            <View style={pdfStyles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View>
                        <Text style={pdfStyles.label}>Bill No: {bill.billNumber}</Text>
                        <Text style={pdfStyles.label}>Date: {bill.createdAt && new Date(bill.createdAt).toLocaleDateString()}</Text>
                        <Text style={pdfStyles.label}>Payment Mode: {bill.paymentMode}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={pdfStyles.label}>Customer: {bill.customerName}</Text>
                        <Text style={pdfStyles.label}>Phone: {bill.customerPhone}</Text>
                    </View>
                </View>
            </View>

            {/* Table Header */}
            <View style={[pdfStyles.tableRow, { backgroundColor: '#f0f0f0', borderTopWidth: 1, borderBottomWidth: 1 }]}>
                <View style={[pdfStyles.tableCol, { flex: 3 }]}><Text style={pdfStyles.tableCellHeader}>Medicine Name</Text></View>
                <View style={pdfStyles.tableCol}><Text style={pdfStyles.tableCellHeader}>Price</Text></View>
                <View style={pdfStyles.tableCol}><Text style={pdfStyles.tableCellHeader}>Qty</Text></View>
                <View style={pdfStyles.tableCol}><Text style={pdfStyles.tableCellHeader}>Amount</Text></View>
            </View>

            {/* Table Rows */}
            {bill.items?.map((item: any, index: number) => (
                <View key={index} style={pdfStyles.tableRow}>
                    <View style={[pdfStyles.tableCol, { flex: 3 }]}><Text style={pdfStyles.tableCell}>{item.medicineName}</Text></View>
                    <View style={pdfStyles.tableCol}><Text style={pdfStyles.tableCell}>{item.price}</Text></View>
                    <View style={pdfStyles.tableCol}><Text style={pdfStyles.tableCell}>{item.quantity}</Text></View>
                    <View style={pdfStyles.tableCol}><Text style={pdfStyles.tableCell}>{item.total}</Text></View>
                </View>
            ))}

            {/* Total Section */}
            <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <View style={{ width: 150 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                        <Text style={pdfStyles.label}>Total Amount:</Text>
                        <Text style={pdfStyles.value}>{bill.totalAmount}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                        <Text style={pdfStyles.label}>Discount:</Text>
                        <Text style={pdfStyles.value}>{bill.discount}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                        <Text style={pdfStyles.label}>Tax Amount:</Text>
                        <Text style={pdfStyles.value}>{bill.taxAmount}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 5, marginTop: 5 }}>
                        <Text style={[pdfStyles.label, { fontWeight: 'bold' }]}>Net Amount:</Text>
                        <Text style={[pdfStyles.value, { fontWeight: 'bold' }]}>{bill.netAmount}</Text>
                    </View>
                </View>
            </View>

            <View style={{ marginTop: 40, textAlign: 'center' }}>
                <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#666' }}>Thank you for your business!</Text>
            </View>
        </View>
    );
};
